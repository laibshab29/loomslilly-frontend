import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrderContext";

// Tracks which order numbers the seller has already been alerted about
// this session, so the modal doesn't keep re-opening.
function getDismissedSet(userId) {
  try {
    const raw = sessionStorage.getItem("alertedOrders_" + userId);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveDismissedSet(userId, set) {
  try {
    sessionStorage.setItem("alertedOrders_" + userId, JSON.stringify([...set]));
  } catch {}
}

export function GlobalSellerReminderWatcher() {
  const { user, role } = useAuth();
  const { orders } = useOrders();
  const navigate = useNavigate();

  const [activeAlert, setActiveAlert] = useState(null);

  const isSeller = role === "seller" || role === "both";

  // Watch for new wallet payment orders that need review
  useEffect(() => {
    if (!isSeller || !user) return;

    const dismissed = getDismissedSet(user.id);

    const pending = orders.find((o) => {
      if (o.status !== "waiting_confirmation") return false;
      if (!o.items.some((i) => String(i.sellerId) === String(user.id))) return false;
      if (dismissed.has(o.orderNumber)) return false;
      const isWallet =
        o.paymentMethod === "JazzCash" || o.paymentMethod === "EasyPaisa";
      return isWallet;
    });

    if (pending && !activeAlert) {
      setActiveAlert(pending);
    }
  }, [orders, user, isSeller, activeAlert]);

  // Auto-close if the order is no longer waiting
  useEffect(() => {
    if (!activeAlert) return;
    const current = orders.find((o) => o.orderNumber === activeAlert.orderNumber);
    if (!current || current.status !== "waiting_confirmation") {
      setActiveAlert(null);
    }
  }, [orders, activeAlert]);

  const dismiss = () => {
    if (!activeAlert || !user) return;
    const dismissed = getDismissedSet(user.id);
    dismissed.add(activeAlert.orderNumber);
    saveDismissedSet(user.id, dismissed);
    setActiveAlert(null);
  };

  const handleGoToSales = () => {
    dismiss();
    navigate("/my-sales");
  };

  if (!activeAlert) return null;

  const myItems = activeAlert.items.filter(
    (i) => String(i.sellerId) === String(user.id)
  );
  const myTotal = myItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[400] flex items-center justify-center px-4 bg-black/50 backdrop-blur-md"
        onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
      >
        <motion.div
          initial={{ y: -20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -20, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="w-full max-w-[480px] rounded-[24px] bg-[#FFF6F8] p-10 shadow-2xl border-2 border-amber-300"
        >
          <div className="text-5xl text-center mb-4">🧾</div>

          <h2
            style={{
              fontFamily: "Pacifico, cursive",
              color: "#FF8FA3",
              textShadow: "0 0 20px rgba(255,143,163,0.5)",
            }}
            className="text-3xl mb-4 text-center"
          >
            New Payment to Review
          </h2>

          <p className="text-[#2E2A4A] mb-3 leading-relaxed text-center">
            Order <strong>{activeAlert.orderNumber}</strong> from{" "}
            <strong>{activeAlert.buyerName || "a buyer"}</strong> is waiting
            for your payment approval.
          </p>

          <div className="rounded-[12px] bg-[#EDE8F9] p-3 mb-4 text-center">
            <p className="text-xs text-[#7A6C9D] uppercase tracking-wide mb-1">
              Your portion
            </p>
            <p className="text-[#FF8FA3] font-bold text-xl">
              Rs. {myTotal.toFixed(2)}
            </p>
            <p className="text-xs text-[#7A6C9D] mt-1">
              via {activeAlert.paymentMethod}
            </p>
          </div>

          <p className="text-[#7A6C9D] text-sm mb-6 text-center leading-relaxed">
            The buyer has uploaded a payment screenshot. Go to My Sales to
            review it and approve or reject.
          </p>

          <div className="flex gap-3">
            <button
              onClick={dismiss}
              className="flex-1 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all"
            >
              Later
            </button>
            <button
              onClick={handleGoToSales}
              className="flex-1 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
            >
              Review Now →
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}