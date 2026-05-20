import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrderContext";

const PERSISTENT_THRESHOLD_MS = 2 * 60 * 1000;

function getDismissedSet(userId) {
  try {
    const raw = sessionStorage.getItem("dismissedReminders_" + userId);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveDismissedSet(userId, set) {
  try {
    sessionStorage.setItem("dismissedReminders_" + userId, JSON.stringify([...set]));
  } catch {}
}

export function GlobalSellerReminderWatcher() {
  const { user, role } = useAuth();
  const { orders, sendPaymentReminder, declineReminder } = useOrders();
  const navigate = useNavigate();

  const [activeReminder, setActiveReminder] = useState(null);
  const [, forceTick] = useState({});

  const isSeller = role === "seller" || role === "both";

  // Poll for stale orders every 10s
  useEffect(() => {
    if (!isSeller || !user) return;

    const checkForStaleOrders = () => {
      const dismissed = getDismissedSet(user.id);
      const now = Date.now();

      const stale = orders.find((o) => {
        if (o.status !== "waiting_confirmation") return false;
        if (!o.items.some((i) => i.sellerId === user.id)) return false;
        if (now - o.createdAt < PERSISTENT_THRESHOLD_MS) return false;
        if (o.reminderSent || o.reminderDeclinedAt) return false;
        if (dismissed.has(o.orderNumber)) return false;
        return true;
      });

      if (stale && !activeReminder) {
        setActiveReminder(stale);
      }
    };

    checkForStaleOrders();
    const interval = setInterval(() => {
      checkForStaleOrders();
      forceTick({});
    }, 10000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, user, isSeller, activeReminder]);

  // BUG FIX 2: auto-close the modal if the order it's showing has progressed
  // past waiting_confirmation (cancelled, confirmed, etc). Without this, a
  // stale modal can sit on screen for an order that's already resolved, and
  // the seller might click an action that mutates a resolved order.
  useEffect(() => {
    if (!activeReminder) return;
    const current = orders.find((o) => o.orderNumber === activeReminder.orderNumber);
    if (!current || current.status !== "waiting_confirmation") {
      setActiveReminder(null);
    }
  }, [orders, activeReminder]);

  if (!activeReminder) return null;

  const myItems = activeReminder.items.filter((i) => i.sellerId === user.id);
  const myTotal = myItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // BUG FIX 3: mark dismissed BEFORE calling sendPaymentReminder so the next
  // tick (which may run before the DB update propagates to local state)
  // cannot re-open the modal for the same order. This was the root cause of
  // payment_failure notifications stacking 4+ times on the buyer's side.
  const handleSendReminder = () => {
    const dismissed = getDismissedSet(user.id);
    dismissed.add(activeReminder.orderNumber);
    saveDismissedSet(user.id, dismissed);

    sendPaymentReminder(activeReminder.orderNumber);
    setActiveReminder(null);
  };

  const handleDeclineReminder = () => {
    const dismissed = getDismissedSet(user.id);
    dismissed.add(activeReminder.orderNumber);
    saveDismissedSet(user.id, dismissed);

    declineReminder(activeReminder.orderNumber);
    setActiveReminder(null);
  };

  const handleSnooze = () => {
    const dismissed = getDismissedSet(user.id);
    dismissed.add(activeReminder.orderNumber);
    saveDismissedSet(user.id, dismissed);
    setActiveReminder(null);
  };

  const handleGoToSales = () => {
    const dismissed = getDismissedSet(user.id);
    dismissed.add(activeReminder.orderNumber);
    saveDismissedSet(user.id, dismissed);
    setActiveReminder(null);
    navigate("/my-sales");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[400] flex items-center justify-center px-4 bg-black/50 backdrop-blur-md"
      >
        <motion.div
          initial={{ y: -20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -20, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="w-full max-w-[480px] rounded-[24px] bg-[#FFF6F8] p-10 shadow-2xl border-2 border-amber-300"
        >
          <div className="text-5xl text-center mb-4">⏰</div>

          <h2
            style={{
              fontFamily: "Pacifico, cursive",
              color: "#FF8FA3",
              textShadow: "0 0 20px rgba(255,143,163,0.5)",
            }}
            className="text-3xl mb-4 text-center"
          >
            Unconfirmed Payment
          </h2>

          <p className="text-[#2E2A4A] mb-3 leading-relaxed text-center">
            Order <strong>{activeReminder.orderNumber}</strong> from{" "}
            <strong>{activeReminder.buyerName}</strong> hasn't been confirmed yet.
          </p>

          <div className="rounded-[12px] bg-[#EDE8F9] p-3 mb-4 text-center">
            <p className="text-xs text-[#7A6C9D] uppercase tracking-wide mb-1">Your portion</p>
            <p className="text-[#FF8FA3] font-bold text-xl">Rs. {myTotal.toFixed(2)}</p>
            <p className="text-xs text-[#7A6C9D] mt-1">via {activeReminder.paymentMethod}</p>
          </div>

          <p className="text-[#7A6C9D] text-sm mb-6 text-center leading-relaxed">
            Send the buyer a reminder so they can retry payment? If you decline, the order will auto-cancel in 1 minute.
          </p>

          <div className="space-y-2">
            <div className="flex gap-3">
              <button
                onClick={handleDeclineReminder}
                className="flex-1 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all"
              >
                No, don't send
              </button>
              <button
                onClick={handleSendReminder}
                className="flex-1 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
              >
                Yes, send reminder
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSnooze}
                className="flex-1 py-2 rounded-full bg-transparent border border-[#C8B6E2] text-[#7A6C9D] text-sm hover:bg-[#C8B6E2]/20 transition-all"
              >
                Remind me later
              </button>
              <button
                onClick={handleGoToSales}
                className="flex-1 py-2 rounded-full bg-transparent border border-[#C8B6E2] text-[#7A6C9D] text-sm hover:bg-[#C8B6E2]/20 transition-all"
              >
                Go to My Sales
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}