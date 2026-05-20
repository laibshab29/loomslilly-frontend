// src/context/NotificationContext.jsx
import {
  createContext, useContext, useState, useEffect, useCallback, useRef,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

function splitRecipient(recipientId) {
  if (!recipientId) return { recipient_id: null, recipient_guest_id: null };
  const isGuest =
    typeof recipientId === "string" && recipientId.startsWith("guest_");
  return isGuest
    ? { recipient_id: null, recipient_guest_id: recipientId }
    : { recipient_id: recipientId, recipient_guest_id: null };
}

function normalize(row) {
  return {
    id: row.id,
    type: row.type,
    read: row.read,
    persistent: row.persistent,
    createdAt: new Date(row.created_at).getTime(),
    recipientId: row.recipient_id || row.recipient_guest_id,
    orderNumber: row.order_number,
    productId: row.product_id,
    productName: row.product_name,
    discussionId: row.discussion_id,
    discussionTitle: row.discussion_title,
    buyerName: row.buyer_name,
    likedByName: row.liked_by_name,
    memberName: row.member_name,
    stock: row.stock,
    reason: row.reason,
    reasons: row.reasons,
    paymentMethod: row.payment_method,
    paymentProofUrl: row.payment_proof_url,
  };
}

export function NotificationProvider({ children }) {
  const { user, guestId } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const recipientRef = useRef(null);
  recipientRef.current = user?.id || guestId;

  // ─── FETCH ────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    const recipient = user?.id || guestId;
    if (!recipient) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const column = user?.id ? "recipient_id" : "recipient_guest_id";
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq(column, recipient)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("fetchNotifications error:", error.message);
      setLoading(false);
      return;
    }

    setNotifications((data || []).map(normalize));
    setLoading(false);
  }, [user?.id, guestId]);

  useEffect(() => {
    setLoading(true);
    fetchNotifications();
  }, [fetchNotifications]);

  // ─── REALTIME ─────────────────────────────────────────────────
  useEffect(() => {
    const recipient = user?.id || guestId;
    if (!recipient) return;

    const channel = supabase
      .channel(`notifications_${recipient}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        (payload) => {
          const row = payload.new || payload.old;
          if (!row) return;
          const rowRecipient = row.recipient_id || row.recipient_guest_id;
          if (rowRecipient !== recipientRef.current) return;

          if (payload.eventType === "INSERT") {
            setNotifications((prev) => {
              if (prev.some((n) => n.id === row.id)) return prev;
              return [normalize(row), ...prev];
            });
          } else if (payload.eventType === "UPDATE") {
            setNotifications((prev) =>
              prev.map((n) => (n.id === row.id ? normalize(row) : n))
            );
          } else if (payload.eventType === "DELETE") {
            setNotifications((prev) =>
              prev.filter((n) => n.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user?.id, guestId]);

  // ─── INSERT HELPER ────────────────────────────────────────────
  const insertNotification = async (fields) => {
    const { recipient_id, recipient_guest_id } = splitRecipient(fields.recipientId);
    if (!recipient_id && !recipient_guest_id) return;

    const row = {
      recipient_id,
      recipient_guest_id,
      type: fields.type,
      read: false,
      persistent: fields.persistent ?? false,
      order_number: fields.orderNumber ?? null,
      product_id: fields.productId ?? null,
      product_name: fields.productName ?? null,
      discussion_id: fields.discussionId ?? null,
      discussion_title: fields.discussionTitle ?? null,
      buyer_name: fields.buyerName ?? null,
      liked_by_name: fields.likedByName ?? null,
      member_name: fields.memberName ?? null,
      stock: fields.stock ?? null,
      reason: fields.reason ?? null,
      reasons: fields.reasons ?? null,
      payment_method: fields.paymentMethod ?? null,
      payment_proof_url: fields.paymentProofUrl ?? null,
    };

    const { error } = await supabase.from("notifications").insert(row);
    if (error) console.error("insertNotification error:", error.message);
  };

  // ─── DISCUSSION ───────────────────────────────────────────────
  const notifyDiscussionReported = async ({
    recipientId, discussionId, discussionTitle, reason,
  }) => {
    const { recipient_id, recipient_guest_id } = splitRecipient(recipientId);
    const { error } = await supabase.rpc("notify_discussion_reported", {
      p_recipient_id: recipient_id,
      p_recipient_guest_id: recipient_guest_id,
      p_discussion_id: discussionId,
      p_discussion_title: discussionTitle,
      p_reason: reason,
    });
    if (error) console.error("notifyDiscussionReported error:", error.message);
  };

  const notifyDiscussionRemoved = async ({
    recipientId, discussionId, discussionTitle, reasons,
  }) => {
    const { recipient_id, recipient_guest_id } = splitRecipient(recipientId);
    const { error } = await supabase.rpc("notify_discussion_removed", {
      p_recipient_id: recipient_id,
      p_recipient_guest_id: recipient_guest_id,
      p_discussion_id: discussionId,
      p_discussion_title: discussionTitle,
      p_reasons: reasons,
    });
    if (error) console.error("notifyDiscussionRemoved error:", error.message);
  };

  // ─── PRODUCT / COMMUNITY ──────────────────────────────────────
  const notifyProductLiked = ({ recipientId, productId, productName, likedByName }) =>
    insertNotification({
      type: "product_liked", recipientId, productId, productName, likedByName,
    });

  const notifyNewMember = ({ recipientId, memberName }) =>
    insertNotification({ type: "new_member", recipientId, memberName });

  // ─── STOCK ────────────────────────────────────────────────────
  const upsertStockNotification = async (
    recipientId, productId, productName, stock, type, persistent
  ) => {
    const { recipient_id, recipient_guest_id } = splitRecipient(recipientId);
    const { error } = await supabase.rpc("notify_stock", {
      p_recipient_id: recipient_id,
      p_recipient_guest_id: recipient_guest_id,
      p_product_id: productId,
      p_product_name: productName,
      p_stock: stock,
      p_type: type,
      p_persistent: persistent,
    });
    if (error) console.error("upsertStockNotification error:", error.message);
  };

  const notifyLowStock = ({ recipientId, productId, productName, stock }) =>
    upsertStockNotification(recipientId, productId, productName, stock, "low_stock", false);

  const notifyCriticalStock = ({ recipientId, productId, productName, stock }) =>
    upsertStockNotification(recipientId, productId, productName, stock, "critical_stock", true);

  const notifyOutOfStock = ({ recipientId, productId, productName }) =>
    upsertStockNotification(recipientId, productId, productName, 0, "out_of_stock", true);

  const resolveStockNotification = async ({ recipientId, productId, newStock }) => {
    const { recipient_id, recipient_guest_id } = splitRecipient(recipientId);
    const { error } = await supabase.rpc("resolve_stock_notification", {
      p_recipient_id: recipient_id,
      p_recipient_guest_id: recipient_guest_id,
      p_product_id: productId,
      p_new_stock: newStock,
    });
    if (error) console.error("resolveStockNotification error:", error.message);
  };

  // ─── ORDER NOTIFICATIONS (NEW FLOW) ────────────────────────────
  //
  // The five order-related notification types:
  //
  //   order_placed             buyer    instant or wallet, informs them order is in
  //   payment_pending_review   seller   PERSISTENT, has proof image, only goes away on approve/reject
  //   payment_confirmed        buyer    seller approved, order now on the way
  //   order_cancelled          buyer    seller rejected OR buyer cancelled
  //   delivered                buyer    tick auto-marked delivered
  //

  // Buyer: "Your order has been placed."
  // Wording differs based on whether it needs seller approval.
  const notifyOrderPlacedBuyer = async (buyerRecipientId, order) => {
    if (!buyerRecipientId || !order?.orderNumber) return;

    // Dedup
    const { recipient_id, recipient_guest_id } = splitRecipient(buyerRecipientId);
    const column = recipient_id ? "recipient_id" : "recipient_guest_id";
    const value = recipient_id || recipient_guest_id;

    const { data: existing } = await supabase
      .from("notifications")
      .select("id")
      .eq(column, value)
      .eq("type", "order_placed")
      .eq("order_number", order.orderNumber)
      .maybeSingle();

    if (existing) return;

    await insertNotification({
      type: "order_placed",
      recipientId: buyerRecipientId,
      orderNumber: order.orderNumber,
      paymentMethod: order.paymentMethod,
    });
  };

  // Seller: persistent review notification with the proof URL attached.
  // Unique index uniq_payment_pending_review enforces one-per-(seller,order).
  // Cleared by OrderContext.approvePayment / rejectPayment / cancelOrder.
  const notifyPaymentPendingSeller = async (sellerId, order) => {
    if (!sellerId || !order?.orderNumber) return;

    const { error } = await supabase.from("notifications").insert({
      recipient_id: sellerId,
      type: "payment_pending_review",
      persistent: true,
      order_number: order.orderNumber,
      buyer_name: order.buyerName,
      payment_method: order.paymentMethod,
      payment_proof_url: order.paymentProofUrl,
    });
    // 23505 = duplicate (uniq_payment_pending_review). Safe to ignore.
    if (error && error.code !== "23505") {
      console.error("notifyPaymentPendingSeller error:", error.message);
    }
  };

  const notifyPaymentConfirmed = async (buyerRecipientId, order) => {
    if (!buyerRecipientId || !order?.orderNumber) return;

    const { recipient_id, recipient_guest_id } = splitRecipient(buyerRecipientId);
    const column = recipient_id ? "recipient_id" : "recipient_guest_id";
    const value = recipient_id || recipient_guest_id;

    const { data: existing } = await supabase
      .from("notifications")
      .select("id")
      .eq(column, value)
      .eq("type", "payment_confirmed")
      .eq("order_number", order.orderNumber)
      .maybeSingle();

    if (existing) return;

    await insertNotification({
      type: "payment_confirmed",
      recipientId: buyerRecipientId,
      orderNumber: order.orderNumber,
    });
  };

  const notifyOrderCancelled = async (buyerRecipientId, order, reason) => {
    if (!buyerRecipientId || !order?.orderNumber) return;

    const { recipient_id, recipient_guest_id } = splitRecipient(buyerRecipientId);
    const column = recipient_id ? "recipient_id" : "recipient_guest_id";
    const value = recipient_id || recipient_guest_id;

    const { data: existing } = await supabase
      .from("notifications")
      .select("id")
      .eq(column, value)
      .eq("type", "order_cancelled")
      .eq("order_number", order.orderNumber)
      .maybeSingle();

    if (existing) return;

    await insertNotification({
      type: "order_cancelled",
      recipientId: buyerRecipientId,
      orderNumber: order.orderNumber,
      paymentMethod: order.paymentMethod,
      reason,
    });
  };

  const notifyDelivered = async (buyerRecipientId, order) => {
    if (!buyerRecipientId || !order?.orderNumber) return;

    const { recipient_id, recipient_guest_id } = splitRecipient(buyerRecipientId);
    const column = recipient_id ? "recipient_id" : "recipient_guest_id";
    const value = recipient_id || recipient_guest_id;

    const { data: existing } = await supabase
      .from("notifications")
      .select("id")
      .eq(column, value)
      .eq("type", "delivered")
      .eq("order_number", order.orderNumber)
      .maybeSingle();

    if (existing) return;

    await insertNotification({
      type: "delivered",
      recipientId: buyerRecipientId,
      orderNumber: order.orderNumber,
    });
  };

  // ─── READ / DELETE / QUERY ────────────────────────────────────
  const markRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);
    if (error) console.error("markRead error:", error.message);
  };

  const markAllRead = async (userIdParam) => {
    const recipient = userIdParam || user?.id || guestId;
    if (!recipient) return;

    setNotifications((prev) =>
      prev.map((n) =>
        n.recipientId === recipient ? { ...n, read: true } : n
      )
    );

    const { recipient_id, recipient_guest_id } = splitRecipient(recipient);
    let q = supabase
      .from("notifications")
      .update({ read: true })
      .eq("read", false);
    if (recipient_id) q = q.eq("recipient_id", recipient_id);
    else q = q.eq("recipient_guest_id", recipient_guest_id);

    const { error } = await q;
    if (error) console.error("markAllRead error:", error.message);
  };

  const deleteNotification = async (id) => {
    const notif = notifications.find((n) => n.id === id);
    if (!notif || notif.persistent) return;

    setNotifications((prev) => prev.filter((n) => n.id !== id));
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);
    if (error) console.error("deleteNotification error:", error.message);
  };

  const getForUser = (userId) =>
    notifications
      .filter((n) => n.recipientId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);

  const unreadCount = (userId) => {
    const userNotifs = notifications.filter(
      (n) => n.recipientId === userId && !n.read
    );

    const orderTypes = new Set([
      "order_placed", "payment_pending_review",
      "payment_confirmed", "order_cancelled", "delivered",
    ]);
    const seenOrderNumbers = new Set();
    let count = 0;

    userNotifs.forEach((n) => {
      if (orderTypes.has(n.type)) {
        if (n.orderNumber && !seenOrderNumbers.has(n.orderNumber)) {
          seenOrderNumbers.add(n.orderNumber);
          count += 1;
        }
      } else {
        count += 1;
      }
    });

    return count;
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        loading,
        notifyDiscussionReported,
        notifyDiscussionRemoved,
        notifyProductLiked,
        notifyNewMember,
        notifyLowStock,
        notifyCriticalStock,
        notifyOutOfStock,
        resolveStockNotification,
        // New order notification API
        notifyOrderPlacedBuyer,
        notifyPaymentPendingSeller,
        notifyPaymentConfirmed,
        notifyOrderCancelled,
        notifyDelivered,
        markRead,
        markAllRead,
        deleteNotification,
        getForUser,
        unreadCount,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);