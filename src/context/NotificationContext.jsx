import { createContext, useContext, useState, useEffect } from "react";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem("loomslilly_notifications");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("loomslilly_notifications", JSON.stringify(notifications));
    } catch (e) {
      console.warn("notifications save failed:", e);
    }
  }, [notifications]);

  // ── Discussion reported ────────────────────────────────────
  const notifyDiscussionReported = ({ recipientId, discussionId, discussionTitle, reason }) => {
    setNotifications((prev) => {
      const existing = prev.find(
        (n) => n.type === "report_discussion" && n.discussionId === discussionId && n.recipientId === recipientId
      );
      if (existing) {
        return prev.map((n) =>
          n === existing
            ? { ...n, reasons: [...n.reasons, reason], read: false, createdAt: Date.now() }
            : n
        );
      }
      return [{
        id: Date.now(), type: "report_discussion", read: false, createdAt: Date.now(),
        recipientId, discussionId, discussionTitle, reasons: [reason],
      }, ...prev];
    });
  };

  // ── Discussion removed ─────────────────────────────────────
  const notifyDiscussionRemoved = ({ recipientId, discussionId, discussionTitle, reasons }) => {
    setNotifications((prev) => {
      const existingIdx = prev.findIndex(
        (n) => (n.type === "report_discussion" || n.type === "report_removed") &&
          n.discussionId === discussionId && n.recipientId === recipientId
      );
      const newNotif = {
        id: existingIdx >= 0 ? prev[existingIdx].id : Date.now(),
        type: "report_removed", read: false, createdAt: Date.now(),
        recipientId, discussionId, discussionTitle, reasons,
      };
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = newNotif;
        return updated;
      }
      return [newNotif, ...prev];
    });
  };

  // ── Product liked ──────────────────────────────────────────
  const notifyProductLiked = ({ recipientId, productId, productName, likedByName }) => {
    setNotifications((prev) => [{
      id: Date.now(), type: "product_liked", read: false, createdAt: Date.now(),
      recipientId, productId, productName, likedByName,
    }, ...prev]);
  };

  // ── New community member ───────────────────────────────────
  const notifyNewMember = ({ recipientId, memberName }) => {
    setNotifications((prev) => [{
      id: Date.now(), type: "new_member", read: false, createdAt: Date.now(),
      recipientId, memberName,
    }, ...prev]);
  };

  // ── Stock notifications ────────────────────────────────────
  const notifyLowStock = ({ recipientId, productId, productName, stock }) => {
    setNotifications((prev) => {
      const existing = prev.find(
        (n) => n.type === "low_stock" && n.productId === productId && n.recipientId === recipientId
      );
      const newNotif = {
        id: existing ? existing.id : Date.now(), type: "low_stock",
        read: false, createdAt: Date.now(),
        recipientId, productId, productName, stock, persistent: false,
      };
      if (existing) return prev.map((n) => (n === existing ? newNotif : n));
      return [newNotif, ...prev];
    });
  };

  const notifyCriticalStock = ({ recipientId, productId, productName, stock }) => {
    setNotifications((prev) => {
      const existing = prev.find(
        (n) => (n.type === "critical_stock" || n.type === "low_stock") &&
          n.productId === productId && n.recipientId === recipientId
      );
      const newNotif = {
        id: existing ? existing.id : Date.now(), type: "critical_stock",
        read: false, createdAt: Date.now(),
        recipientId, productId, productName, stock, persistent: true,
      };
      if (existing) return prev.map((n) => (n === existing ? newNotif : n));
      return [newNotif, ...prev];
    });
  };

  const notifyOutOfStock = ({ recipientId, productId, productName }) => {
    setNotifications((prev) => {
      const existing = prev.find(
        (n) => (n.type === "out_of_stock" || n.type === "critical_stock" || n.type === "low_stock") &&
          n.productId === productId && n.recipientId === recipientId
      );
      const newNotif = {
        id: existing ? existing.id : Date.now(), type: "out_of_stock",
        read: false, createdAt: Date.now(),
        recipientId, productId, productName, stock: 0, persistent: true,
      };
      if (existing) return prev.map((n) => (n === existing ? newNotif : n));
      return [newNotif, ...prev];
    });
  };

  const resolveStockNotification = ({ recipientId, productId, newStock }) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (
          (n.type === "out_of_stock" || n.type === "critical_stock" || n.type === "low_stock") &&
          n.productId === productId && n.recipientId === recipientId
        ) {
          if (newStock === 0) return { ...n, type: "out_of_stock", stock: 0, persistent: true, read: false };
          if (newStock < 10) return { ...n, type: "critical_stock", stock: newStock, persistent: true, read: false };
          if (newStock < 20) return { ...n, type: "low_stock", stock: newStock, persistent: false, read: false };
          return { ...n, _resolved: true };
        }
        return n;
      }).filter((n) => !n._resolved)
    );
  };

  // ── ORDER NOTIFICATIONS ────────────────────────────────────

  const notifyNewOrder = (sellerId, order) => {
    if (!sellerId || !order) return;
    setNotifications((prev) => {
      const existing = prev.find(
        (n) => (n.type === "new_order" || n.type === "new_order_persistent") &&
          n.orderNumber === order.orderNumber && n.recipientId === sellerId
      );
      if (existing) return prev;
      return [{
        id: Date.now() + Math.random(),
        type: "new_order",
        read: false,
        createdAt: Date.now(),
        persistent: false,
        recipientId: sellerId,
        orderNumber: order.orderNumber,
        buyerName: order.buyerName,
        paymentMethod: order.paymentMethod,
      }, ...prev];
    });
  };

  const notifyPersistentNewOrder = (sellerId, order) => {
    if (!sellerId || !order) return;
    setNotifications((prev) => {
      const existing = prev.find(
        (n) => (n.type === "new_order" || n.type === "new_order_persistent") &&
          n.orderNumber === order.orderNumber && n.recipientId === sellerId
      );
      if (existing) {
        return prev.map((n) =>
          n === existing
            ? { ...n, type: "new_order_persistent", persistent: true, read: false, createdAt: Date.now() }
            : n
        );
      }
      return [{
        id: Date.now() + Math.random(),
        type: "new_order_persistent",
        read: false,
        createdAt: Date.now(),
        persistent: true,
        recipientId: sellerId,
        orderNumber: order.orderNumber,
        buyerName: order.buyerName,
        paymentMethod: order.paymentMethod,
      }, ...prev];
    });
  };

  const notifyPaymentFailure = (buyerRecipientId, order) => {
    if (!buyerRecipientId || !order) return;
    setNotifications((prev) => [{
      id: Date.now() + Math.random(),
      type: "payment_failure",
      read: false,
      createdAt: Date.now(),
      persistent: true,
      recipientId: buyerRecipientId,
      orderNumber: order.orderNumber,
      paymentMethod: order.paymentMethod,
    }, ...prev]);
  };

  const notifyOrderCancelled = (buyerRecipientId, order, reason) => {
    if (!buyerRecipientId || !order) return;
    setNotifications((prev) => [{
      id: Date.now() + Math.random(),
      type: "order_cancelled",
      read: false,
      createdAt: Date.now(),
      persistent: false,
      recipientId: buyerRecipientId,
      orderNumber: order.orderNumber,
      reason: reason,
    }, ...prev]);
  };

  const notifyDelivered = (buyerRecipientId, order) => {
    if (!buyerRecipientId || !order) return;
    setNotifications((prev) => [{
      id: Date.now() + Math.random(),
      type: "delivered",
      read: false,
      createdAt: Date.now(),
      persistent: false,
      recipientId: buyerRecipientId,
      orderNumber: order.orderNumber,
    }, ...prev]);
  };

  // 🔥 NEW: Payment confirmed — buyer side
  const notifyPaymentConfirmed = (buyerRecipientId, order) => {
    if (!buyerRecipientId || !order) return;
    setNotifications((prev) => [{
      id: Date.now() + Math.random(),
      type: "payment_confirmed",
      read: false,
      createdAt: Date.now(),
      persistent: false,
      recipientId: buyerRecipientId,
      orderNumber: order.orderNumber,
    }, ...prev]);
  };

  const clearOrderNotifications = (orderNumber, sellerId = null) => {
    setNotifications((prev) =>
      prev.filter((n) => {
        const isOrderType = n.type === "new_order" || n.type === "new_order_persistent";
        if (!isOrderType) return true;
        if (n.orderNumber !== orderNumber) return true;
        if (sellerId && n.recipientId !== sellerId) return true;
        return false;
      })
    );
  };

  // ── HELPERS ────────────────────────────────────────────────
  const markRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = (userId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.recipientId === userId ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((n) => !(n.id === id && !n.persistent))
    );
  };

  const getForUser = (userId) =>
    notifications
      .filter((n) => n.recipientId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);

  const unreadCount = (userId) =>
    notifications.filter((n) => n.recipientId === userId && !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        notifyDiscussionReported,
        notifyDiscussionRemoved,
        notifyProductLiked,
        notifyNewMember,
        notifyLowStock,
        notifyCriticalStock,
        notifyOutOfStock,
        resolveStockNotification,
        notifyNewOrder,
        notifyPersistentNewOrder,
        notifyPaymentFailure,
        notifyOrderCancelled,
        notifyDelivered,
        notifyPaymentConfirmed,
        clearOrderNotifications,
        markRead,
        markAllRead,
        deleteNotification,
        getForUser,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);