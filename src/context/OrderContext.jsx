import {
  createContext, useContext, useState, useEffect, useRef, useCallback,
} from "react";
import { supabase } from "../lib/supabase";

const OrderContext = createContext();

function generateOrderNumber() {
  const date = new Date();
  const y  = date.getFullYear();
  const m  = String(date.getMonth() + 1).padStart(2, "0");
  const d  = String(date.getDate()).padStart(2, "0");
  const rnd = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LL-${y}${m}${d}-${rnd}`;
}

function parseDeliveryDays(s) {
  if (!s) return 5;
  const nums = String(s).match(/\d+/g);
  if (!nums) return 5;
  return Math.max(...nums.map(Number));
}

function getMaxDeliveryMinutes(items) {
  if (!items?.length) return 5;
  return Math.max(...items.map((i) => parseDeliveryDays(i.delivery)));
}

function normalizeOrder(row, items = [], wallets = []) {
  return {
    id:               row.id,
    orderNumber:      row.order_number,
    buyerId:          row.buyer_id          ?? null,
    buyerGuestId:     row.buyer_guest_id    ?? null,
    buyerName:        row.buyer_name,
    buyerPhone:       row.buyer_phone       ?? "",
    address:          row.address           ?? "",
    paymentMethod:    row.payment_method    ?? "",
    buyerWalletPhone: row.buyer_wallet_phone ?? "",
    paymentProofUrl:  row.payment_proof_url  ?? null,
    total:            row.total             ?? 0,
    subtotal:         row.subtotal          ?? 0,
    shipping:         row.shipping          ?? 0,
    status:           row.status,
    createdAt:        new Date(row.created_at).getTime(),
    confirmedAt:      row.confirmed_at
      ? new Date(row.confirmed_at).getTime() : null,
    reviewedAt:       row.reviewed_at
      ? new Date(row.reviewed_at).getTime() : null,
    expectedDeliveryAt: row.expected_delivery_at
      ? new Date(row.expected_delivery_at).getTime() : null,
    cancelReason:       row.cancel_reason      ?? null,
    items: items.map((i) => ({
      id:       i.product_id,
      name:     i.name,
      price:    i.price,
      quantity: i.quantity,
      delivery: i.delivery,
      sellerId: i.seller_id,
    })),
    sellerWalletInfo: wallets.map((w) => ({
      sellerId:   w.seller_id,
      sellerName: w.seller_name,
      walletType: w.wallet_type,
      walletPhone: w.wallet_phone,
      subtotal:   w.subtotal,
    })),
  };
}

// Delete a seller's payment_pending_review notification for a given order.
// Called when the seller approves OR rejects — the notification has served
// its purpose and shouldn't linger.
async function clearPaymentReviewNotification(orderNumber, sellerId) {
  if (!sellerId || !orderNumber) return;
  await supabase
    .from("notifications")
    .delete()
    .eq("recipient_id", sellerId)
    .eq("order_number", orderNumber)
    .eq("type", "payment_pending_review");
}

export function OrderProvider({ children }) {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  const handlersRef = useRef({
    notifyOrderPlacedBuyer:     () => {},
    notifyPaymentPendingSeller: () => {},
    notifyPaymentConfirmed:     () => {},
    notifyOrderCancelled:       () => {},
    notifyDelivered:            () => {},
    restoreStock:               () => {},
  });

  const setExternalHandlers = useCallback((handlers) => {
    handlersRef.current = { ...handlersRef.current, ...handlers };
  }, []);

  // ─── FETCH ────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    const { data: orderRows, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("fetchOrders — orders error:", ordersError.message);
      setLoading(false);
      return;
    }

    if (!orderRows?.length) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const orderIds = orderRows.map((o) => o.id);

    const [{ data: itemRows, error: itemsError },
           { data: walletRows, error: walletsError }] = await Promise.all([
      supabase.from("order_items").select("*").in("order_id", orderIds),
      supabase.from("order_seller_wallets").select("*").in("order_id", orderIds),
    ]);

    if (itemsError)   console.error("fetchOrders — items error:",   itemsError.message);
    if (walletsError) console.error("fetchOrders — wallets error:", walletsError.message);

    const normalized = orderRows.map((row) => {
      const items   = (itemRows   || []).filter((i) => i.order_id === row.id);
      const wallets = (walletRows || []).filter((w) => w.order_id === row.id);
      return normalizeOrder(row, items, wallets);
    });

    setOrders(normalized);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (["SIGNED_IN", "INITIAL_SESSION", "TOKEN_REFRESHED", "SIGNED_OUT"]
        .includes(event)) {
        fetchOrders();
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchOrders]);

  useEffect(() => {
    const channel = supabase
      .channel("orders_realtime")
      .on("postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchOrders())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchOrders]);

  // ─── PLACE ORDER ─────────────────────────────────────────────
  // Flow:
  //   COD or Card        → status = on_way (instant)
  //   JazzCash/EasyPaisa → status = waiting_confirmation, seller reviews proof
  //
  // For wallet payments, `details.paymentProofUrl` must be set — the buyer
  // uploads to Storage first, then calls placeOrder with the URL.
  const placeOrder = async (cartItems, buyer, details = {}) => {
    const orderNumber = generateOrderNumber();
    const now         = new Date().toISOString();
    const nowMs       = Date.now();

    const method = details.paymentMethod;
    const isInstant = method === "Cash on Delivery" || method === "Card";

    const initialStatus = isInstant ? "on_way" : "waiting_confirmation";
    const expectedDeliveryAt = isInstant
      ? new Date(nowMs + getMaxDeliveryMinutes(cartItems) * 60 * 1000).toISOString()
      : null;

    const isGuestBuyer = !buyer?.id || String(buyer.id).startsWith("guest_");

    const { data: newOrderRow, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number:        orderNumber,
        buyer_id:            isGuestBuyer ? null : buyer.id,
        buyer_guest_id:      isGuestBuyer ? (details.guestId || null) : null,
        buyer_name:          buyer?.name || "Guest",
        buyer_phone:         details.phone || "",
        address:             details.address || "",
        payment_method:      method || "",
        buyer_wallet_phone:  details.buyerWalletPhone || "",
        payment_proof_url:   details.paymentProofUrl || null,
        total:               details.total    || 0,
        subtotal:            details.subtotal || 0,
        shipping:            details.shipping || 0,
        status:              initialStatus,
        confirmed_at:        isInstant ? now : null,
        expected_delivery_at: expectedDeliveryAt,
        cancel_reason:       null,
      })
      .select()
      .single();

    if (orderError) { 
  console.error("placeOrder insert error:", orderError.message, orderError.code, orderError.details, orderError.hint); 
  return null; 
}

    // ── INSERT order_items ──
    const itemRows = cartItems.map((item) => ({
      order_id:   newOrderRow.id,
      product_id: item.id,
      seller_id:  item.sellerId,
      name:       item.name,
      price:      item.price,
      quantity:   item.quantity,
      delivery:   item.delivery || "",
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(itemRows);
    if (itemsError) console.error("placeOrder items error:", itemsError.message);

    // ── INSERT order_seller_wallets (only for wallet payments) ──
    if (details.sellerWalletInfo?.length > 0) {
      const walletRows = details.sellerWalletInfo.map((w) => ({
        order_id:    newOrderRow.id,
        seller_id:   w.sellerId,
        seller_name: w.sellerName,
        wallet_type: w.walletType,
        wallet_phone: w.walletPhone,
        subtotal:    w.subtotal,
      }));
      const { error: walletError } = await supabase
        .from("order_seller_wallets").insert(walletRows);
      if (walletError) console.error("placeOrder wallets error:", walletError.message);
    }

    await fetchOrders();

    const newOrder = normalizeOrder(newOrderRow, itemRows, []);

    // ─── NOTIFICATIONS ────────────────────────────────────────
    const buyerRecipient = newOrder.buyerId || newOrder.buyerGuestId;
    if (buyerRecipient) {
      handlersRef.current.notifyOrderPlacedBuyer(buyerRecipient, newOrder);
    }

    // For wallet payments, notify each seller with the proof for review.
    // For instant payments (COD/Card), no seller approval needed.
    if (!isInstant) {
      const sellerIds = [...new Set(cartItems.map((i) => i.sellerId).filter(Boolean))];
      sellerIds.forEach((sid) =>
        handlersRef.current.notifyPaymentPendingSeller(sid, newOrder)
      );
    }

    return newOrder;
  };

  // ─── APPROVE PAYMENT (seller says yes) ───────────────────────
  // Fresh-read guard so a stale local snapshot can't resurrect a cancelled order.
  const approvePayment = async (orderNumber) => {
    const order = orders.find((o) => o.orderNumber === orderNumber);
    if (!order) return;
    if (order.status !== "waiting_confirmation") return;

    const { data: fresh, error: fetchErr } = await supabase
      .from("orders")
      .select("status")
      .eq("order_number", orderNumber)
      .single();

    if (fetchErr) { console.error("approvePayment fetch error:", fetchErr.message); return; }
    if (fresh.status !== "waiting_confirmation") {
      await fetchOrders();
      return;
    }

    const now = new Date().toISOString();
    const expectedDeliveryAt = new Date(
      Date.now() + getMaxDeliveryMinutes(order.items) * 60 * 1000
    ).toISOString();

    const { error } = await supabase
      .from("orders")
      .update({
        status:               "on_way",
        confirmed_at:         now,
        reviewed_at:          now,
        expected_delivery_at: expectedDeliveryAt,
      })
      .eq("order_number", orderNumber);

    if (error) { console.error("approvePayment error:", error.message); return; }

    const sellerIdsForOrder = [...new Set(order.items.map((i) => i.sellerId).filter(Boolean))];
    await Promise.all(sellerIdsForOrder.map((sid) =>
      clearPaymentReviewNotification(orderNumber, sid)
    ));

    await fetchOrders();

    const buyerRecipient = order.buyerId || order.buyerGuestId;
    if (buyerRecipient) handlersRef.current.notifyPaymentConfirmed(buyerRecipient, order);
  };

  // ─── REJECT PAYMENT (seller says no) ─────────────────────────
  const rejectPayment = async (orderNumber, reason = "Payment proof rejected by seller") => {
    const order = orders.find((o) => o.orderNumber === orderNumber);
    if (!order) return;
    if (order.status !== "waiting_confirmation") return;

    const { data: fresh, error: fetchErr } = await supabase
      .from("orders")
      .select("status")
      .eq("order_number", orderNumber)
      .single();

    if (fetchErr) { console.error("rejectPayment fetch error:", fetchErr.message); return; }
    if (fresh.status !== "waiting_confirmation") {
      await fetchOrders();
      return;
    }

    handlersRef.current.restoreStock(order.items);

    const { error } = await supabase
      .from("orders")
      .update({
        status:        "cancelled",
        cancel_reason: reason,
        reviewed_at:   new Date().toISOString(),
      })
      .eq("order_number", orderNumber);

    if (error) { console.error("rejectPayment error:", error.message); return; }

    const sellerIdsForOrder = [...new Set(order.items.map((i) => i.sellerId).filter(Boolean))];
    await Promise.all(sellerIdsForOrder.map((sid) =>
      clearPaymentReviewNotification(orderNumber, sid)
    ));

    await fetchOrders();

    const buyerRecipient = order.buyerId || order.buyerGuestId;
    if (buyerRecipient) handlersRef.current.notifyOrderCancelled(buyerRecipient, order, reason);
  };

  // ─── BUYER-INITIATED CANCEL (from My Orders, before delivery) ────────────
  const cancelOrder = async (orderNumber, reason = "Order cancelled by buyer") => {
    const order = orders.find((o) => o.orderNumber === orderNumber);
    if (!order) return false;
    if (order.status === "delivered" || order.status === "cancelled") return false;

    handlersRef.current.restoreStock(order.items);

    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled", cancel_reason: reason })
      .eq("order_number", orderNumber);

    if (error) { console.error("cancelOrder error:", error.message); return false; }

    const sellerIdsForOrder = [...new Set(order.items.map((i) => i.sellerId).filter(Boolean))];
    await Promise.all(sellerIdsForOrder.map((sid) =>
      clearPaymentReviewNotification(orderNumber, sid)
    ));

    await fetchOrders();

    const buyerRecipient = order.buyerId || order.buyerGuestId;
    if (buyerRecipient) handlersRef.current.notifyOrderCancelled(buyerRecipient, order, reason);
    return true;
  };

  // ─── AUTO-DELIVER TICK ───────────────────────────────────────
  // Only one job left: flip on_way orders to delivered when their
  // expected_delivery_at has passed. No reminder logic, no auto-cancel.
  useEffect(() => {
    if (loading) return;

    const processingRef = { current: false };

    const tick = async () => {
      if (processingRef.current) return;
      processingRef.current = true;
      try {
        const now = Date.now();
        for (const order of orders) {
          if (order.status === "on_way" && order.expectedDeliveryAt) {
            if (now >= order.expectedDeliveryAt) {
              const { error } = await supabase
                .from("orders")
                .update({
                  status:       "delivered",
                  delivered_at: new Date().toISOString(),
                })
                .eq("order_number", order.orderNumber);

              if (!error) {
                const recipientId = order.buyerId || order.buyerGuestId;
                if (recipientId) handlersRef.current.notifyDelivered(recipientId, order);
              }
            }
          }
        }
      } finally {
        processingRef.current = false;
      }
    };

    const interval = setInterval(tick, 10000);
    tick();
    return () => clearInterval(interval);
  }, [orders, loading]);

  // ─── QUERY HELPERS ────────────────────────────────────────────
  const getOrdersForBuyer = (buyerId, guestId) =>
    orders.filter((o) => {
      if (buyerId && o.buyerId === buyerId) return true;
      if (guestId && o.buyerGuestId === guestId) return true;
      return false;
    });

  const getSalesForSeller = (sellerId) => {
    const sid = String(sellerId);
    return orders
      .filter(
        (o) =>
          o.status !== "cancelled" &&
          o.items.some((i) => String(i.sellerId) === sid)
      )
      .map((o) => ({
        ...o,
        myItems: o.items.filter((i) => String(i.sellerId) === sid),
      }));
  };

  const getSellerSales = (sellerId) => {
    const sid = String(sellerId);
    let total = 0;
    orders.forEach((order) => {
      if (order.status === "cancelled") return;
      order.items.forEach((item) => {
        if (String(item.sellerId) === sid) total += item.quantity;
      });
    });
    return total;
  };

  const getOrderByNumber = (orderNumber) =>
    orders.find((o) => o.orderNumber === orderNumber);

  if (loading) return null;

  return (
    <OrderContext.Provider
      value={{
        orders,
        placeOrder,
        approvePayment,
        rejectPayment,
        cancelOrder,
        getOrdersForBuyer,
        getSalesForSeller,
        getSellerSales,
        getOrderByNumber,
        setExternalHandlers,
        fetchOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export const useOrders = () => useContext(OrderContext);