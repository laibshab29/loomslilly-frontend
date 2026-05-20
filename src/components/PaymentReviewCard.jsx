// src/components/PaymentReviewCard.jsx
//
// What the seller sees when reviewing a buyer's wallet payment.
// Shows the proof screenshot, order details, and Approve / Reject buttons.
//
// Used in: Notifications page (when seller taps payment_pending_review),
// and optionally on My Sales for waiting_confirmation orders.

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, ExternalLink, Loader2 } from "lucide-react";
import { useOrders } from "../context/OrderContext";

export function PaymentReviewCard({ order, onResolved }) {
  const { approvePayment, rejectPayment } = useOrders();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(null); // 'approve' | 'reject' | null

  if (!order) return null;

  const handleApprove = async () => {
    setBusy(true);
    setError("");
    try {
      await approvePayment(order.orderNumber);
      onResolved?.("approved");
    } catch (e) {
      setError("Could not approve payment. Please try again.");
      setBusy(false);
    }
  };

  const handleReject = async () => {
    setBusy(true);
    setError("");
    try {
      await rejectPayment(order.orderNumber);
      onResolved?.("rejected");
    } catch (e) {
      setError("Could not reject payment. Please try again.");
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[20px] bg-[#FFF6F8] p-6 shadow-lg border-2 border-amber-300/50 max-w-[600px] mx-auto"
    >
      <div className="text-center mb-4">
        <div className="text-4xl mb-2">🧾</div>
        <h3 style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }} className="text-2xl">
          Review Payment
        </h3>
        <p className="text-[#7A6C9D] text-sm">
          Order <strong>{order.orderNumber}</strong> from <strong>{order.buyerName}</strong>
        </p>
      </div>

      {/* Order summary */}
      <div className="rounded-[14px] bg-[#EDE8F9] p-4 mb-4 space-y-1 text-sm">
        <div className="flex justify-between text-[#7A6C9D]">
          <span>Amount</span>
          <span className="text-[#FF8FA3] font-semibold">Rs. {order.total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[#7A6C9D]">
          <span>Method</span>
          <span className="text-[#2E2A4A]">{order.paymentMethod}</span>
        </div>
        {order.buyerWalletPhone && (
          <div className="flex justify-between text-[#7A6C9D]">
            <span>Buyer's number</span>
            <span className="text-[#2E2A4A] font-mono">{order.buyerWalletPhone}</span>
          </div>
        )}
      </div>

      {/* Proof screenshot */}
      <div className="mb-4">
        <p className="text-xs text-[#C8B6E2] uppercase tracking-wide mb-2">Payment Proof</p>
        {order.paymentProofUrl ? (
          <div className="rounded-[14px] overflow-hidden border-2 border-[#C8B6E2] bg-white">
            <img
              src={order.paymentProofUrl}
              alt="Payment proof"
              className="w-full max-h-[400px] object-contain"
            />
            <a
              href={order.paymentProofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 py-2 text-xs text-[#7A6C9D] hover:text-[#FF8FA3] transition-colors border-t border-[#F6C1CC]"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open full size
            </a>
          </div>
        ) : (
          <div className="rounded-[14px] bg-red-50 border border-red-200 p-4 text-center text-red-500 text-sm">
            ⚠ No proof attached. The buyer did not upload a screenshot.
          </div>
        )}
      </div>

      {/* Items */}
      <div className="mb-4">
        <p className="text-xs text-[#C8B6E2] uppercase tracking-wide mb-2">Items</p>
        <div className="space-y-1">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm text-[#2E2A4A]">
              <span className="truncate flex-1 mr-2">
                {item.name} <span className="text-[#7A6C9D]">x{item.quantity}</span>
              </span>
              <span className="text-[#FF8FA3] font-medium flex-shrink-0">
                Rs. {(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-[10px] bg-red-50 border border-red-200 p-3 mb-3 text-red-600 text-xs">
          {error}
        </div>
      )}

      {/* Confirmation overlay when seller clicks one of the buttons */}
      {confirming ? (
        <div className="rounded-[14px] bg-amber-50 border border-amber-300 p-4 space-y-3">
          <p className="text-[#2E2A4A] text-sm text-center">
            {confirming === "approve"
              ? "Approve this payment? The order will move to 'On the way' and the buyer will be notified."
              : "Reject this payment? The order will be cancelled, stock restored, and the buyer notified to try a different payment method."}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirming(null)}
              disabled={busy}
              className="flex-1 py-2 rounded-full bg-[#C8B6E2] text-[#2E2A4A] text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={confirming === "approve" ? handleApprove : handleReject}
              disabled={busy}
              className={`flex-1 py-2 rounded-full text-white text-sm disabled:opacity-50 flex items-center justify-center gap-1 ${
                confirming === "approve" ? "bg-green-600" : "bg-red-500"
              }`}
            >
              {busy
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Working...</>
                : confirming === "approve" ? "Yes, Approve" : "Yes, Reject"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={() => setConfirming("reject")}
            disabled={busy}
            className="flex-1 py-3 rounded-full bg-red-500 text-white hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" /> Reject
          </button>
          <button
            onClick={() => setConfirming("approve")}
            disabled={busy}
            className="flex-1 py-3 rounded-full bg-green-600 text-white hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" /> Approve
          </button>
        </div>
      )}
    </motion.div>
  );
}