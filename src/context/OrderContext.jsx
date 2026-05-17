import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

const OrderContext = createContext();

const PERSISTENT_THRESHOLD_MS = 2 * 60 * 1000;
const AUTO_CANCEL_THRESHOLD_MS = 3 * 60 * 1000;
const REMINDER_NO_GRACE_MS = 1 * 60 * 1000;

function generateOrderNumber() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return "LL-" + y + m + d + "-" + random;
}

function parseDeliveryDays(deliveryString) {
  if (!deliveryString) return 5;
  const matches = String(deliveryString).match(/\d+/g);
  if (!matches || matches.length === 0) return 5;
  const nums = matches.map(Number);
  return Math.max(...nums);
}

function getMaxDeliveryMinutes(items) {
  if (!items || items.length === 0) return 5;
  return Math.max(...items.map((item) => parseDeliveryDays(item.delivery)));
}

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem("loomslilly_orders");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handlersRef = useRef({
    notifyNewOrder: () => {},
    notifyPersistentNewOrder: () => {},
    notifyPaymentFailure: () => {},
    notifyOrderCancelled: () => {},
    notifyDelivered: () => {},
    notifyPaymentConfirmed: () => {},
    restoreStock: () => {},
  });

  const setExternalHandlers = useCallback((handlers) => {
    handlersRef.current = { ...handlersRef.current, ...handlers };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("loomslilly_orders", JSON.stringify(orders));
    } catch (e) {
      console.warn("orders save failed:", e);
    }
  }, [orders]);

  const placeOrder = (cartItems, buyer, details = {}) => {
    const orderNumber = details.existingOrderNumber || generateOrderNumber();
    const now = Date.now();

    const isCOD = details.paymentMethod === "Cash on Delivery";
    const initialStatus = isCOD ? "on_way" : "waiting_confirmation";

    const newOrder = {
      id: details.existingOrderNumber
        ? orders.find((o) => o.orderNumber === details.existingOrderNumber)?.id || Date.now()
        : Date.now(),
      orderNumber,
      buyerId: buyer?.id || null,
      buyerGuestId: buyer?.id ? null : (details.guestId || null),
      buyerName: buyer?.name || "Guest",
      buyerPhone: details.phone || "",
      items: cartItems,
      address: details.address || "",
      paymentMethod: details.paymentMethod || "",
      buyerWalletPhone: details.buyerWalletPhone || "",
      sellerWalletInfo: details.sellerWalletInfo || [],
      total: details.total || 0,
      subtotal: details.subtotal || 0,
      shipping: details.shipping || 0,
      createdAt: now,
      status: initialStatus,
      confirmedAt: isCOD ? now : null,
      expectedDeliveryAt: isCOD ? now + getMaxDeliveryMinutes(cartItems) * 60 * 1000 : null,
      cycleCount: 0,
      reminderSent: false,
      reminderDeclinedAt: null,
      cancelReason: null,
    };

    setOrders((prev) => {
      if (details.existingOrderNumber) {
        const existing = prev.find((o) => o.orderNumber === details.existingOrderNumber);
        if (existing) {
          return prev.map((o) =>
            o.orderNumber === details.existingOrderNumber
              ? {
                  ...newOrder,
                  id: existing.id,
                  createdAt: now,
                  cycleCount: (existing.cycleCount || 0) + 1,
                  reminderSent: false,
                  reminderDeclinedAt: null,
                  cancelReason: null,
                }
              : o
          );
        }
      }
      return [...prev, newOrder];
    });

    if (!isCOD) {
      const sellerIds = [...new Set(cartItems.map((i) => i.sellerId).filter(Boolean))];
      sellerIds.forEach((sellerId) => {
        handlersRef.current.notifyNewOrder(sellerId, newOrder);
      });
    }

    return newOrder;
  };

  // 🔥 UPDATED: now fires payment-confirmed notif to buyer
  const confirmPayment = (orderNumber) => {
    const order = orders.find((o) => o.orderNumber === orderNumber);
    if (!order) return;

    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderNumber !== orderNumber) return o;
        if (o.status !== "waiting_confirmation") return o;
        const now = Date.now();
        return {
          ...o,
          status: "on_way",
          confirmedAt: now,
          expectedDeliveryAt: now + getMaxDeliveryMinutes(o.items) * 60 * 1000,
        };
      })
    );

    // Notify buyer that payment was confirmed
    const buyerRecipient = order.buyerId || order.buyerGuestId;
    if (buyerRecipient) {
      handlersRef.current.notifyPaymentConfirmed(buyerRecipient, order);
    }
  };

  const sendPaymentReminder = (orderNumber) => {
    const order = orders.find((o) => o.orderNumber === orderNumber);
    if (!order) return;

    if (order.cycleCount >= 1) {
      cancelOrder(orderNumber, "Payment not received after retry");
      return;
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.orderNumber === orderNumber
          ? { ...o, status: "retry_pending", reminderSent: true }
          : o
      )
    );

    if (order.buyerId || order.buyerGuestId) {
      handlersRef.current.notifyPaymentFailure(order.buyerId || order.buyerGuestId, order);
    }
  };

  const declineReminder = (orderNumber) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.orderNumber === orderNumber
          ? { ...o, reminderDeclinedAt: Date.now() }
          : o
      )
    );
  };

  const cancelOrder = (orderNumber, reason = "Order cancelled") => {
    const order = orders.find((o) => o.orderNumber === orderNumber);
    if (!order) return;

    handlersRef.current.restoreStock(order.items);

    setOrders((prev) =>
      prev.map((o) =>
        o.orderNumber === orderNumber
          ? { ...o, status: "cancelled", cancelReason: reason }
          : o
      )
    );

    const recipientId = order.buyerId || order.buyerGuestId;
    if (recipientId) {
      handlersRef.current.notifyOrderCancelled(recipientId, order, reason);
    }
  };

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const ordersToProcess = orders;

      ordersToProcess.forEach((order) => {
        if (order.status === "waiting_confirmation") {
          const age = now - order.createdAt;

          if (age >= PERSISTENT_THRESHOLD_MS && age < PERSISTENT_THRESHOLD_MS + 11000) {
            const sellerIds = [...new Set(order.items.map((i) => i.sellerId).filter(Boolean))];
            sellerIds.forEach((sellerId) => {
              handlersRef.current.notifyPersistentNewOrder(sellerId, order);
            });
          }

          if (age >= AUTO_CANCEL_THRESHOLD_MS && !order.reminderSent && !order.reminderDeclinedAt) {
            cancelOrder(order.orderNumber, "Payment not confirmed within time limit");
            return;
          }

          if (order.reminderDeclinedAt && now - order.reminderDeclinedAt >= REMINDER_NO_GRACE_MS) {
            cancelOrder(order.orderNumber, "Payment reminder declined and not received");
            return;
          }
        }

        if (order.status === "on_way" && order.expectedDeliveryAt && now >= order.expectedDeliveryAt) {
          setOrders((prev) =>
            prev.map((o) =>
              o.orderNumber === order.orderNumber
                ? { ...o, status: "delivered", deliveredAt: now }
                : o
            )
          );

          const recipientId = order.buyerId || order.buyerGuestId;
          if (recipientId) {
            handlersRef.current.notifyDelivered(recipientId, order);
          }
        }
      });
    };

    const interval = setInterval(tick, 10000);
    tick();
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  const getOrdersForBuyer = (buyerId, guestId) => {
    return orders.filter((o) => {
      if (buyerId && o.buyerId === buyerId) return true;
      if (guestId && o.buyerGuestId === guestId) return true;
      return false;
    });
  };

  const getSalesForSeller = (sellerId) => {
    return orders
      .filter((o) =>
        o.items.some((i) => i.sellerId === sellerId) && o.status !== "cancelled"
      )
      .map((o) => ({
        ...o,
        myItems: o.items.filter((i) => i.sellerId === sellerId),
      }));
  };

  const getSellerSales = (sellerId) => {
    let total = 0;
    orders.forEach((order) => {
      if (order.status === "cancelled") return;
      order.items.forEach((item) => {
        if (item.sellerId === sellerId) {
          total += item.quantity;
        }
      });
    });
    return total;
  };

  const getOrderByNumber = (orderNumber) =>
    orders.find((o) => o.orderNumber === orderNumber);

  return (
    <OrderContext.Provider
      value={{
        orders,
        placeOrder,
        confirmPayment,
        sendPaymentReminder,
        declineReminder,
        cancelOrder,
        getOrdersForBuyer,
        getSalesForSeller,
        getSellerSales,
        getOrderByNumber,
        setExternalHandlers,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export const useOrders = () => useContext(OrderContext);