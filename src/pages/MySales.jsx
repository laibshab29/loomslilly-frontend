import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Clock, Truck, CheckCircle, Copy, Check, User, X } from "lucide-react";
import { useOrders } from "../context/OrderContext";
import { useAuth } from "../context/AuthContext";
import { PaymentReviewCard } from "../components/PaymentReviewCard";
import { ConfirmModal } from "../components/shared/ConfirmModal";

function formatTimeRemaining(targetMs) {
  const diff = targetMs - Date.now();
  if (diff <= 0) return "any moment";
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

function formatTimestamp(ts) {
  return new Date(ts).toLocaleString();
}

export function MySales() {
  const { orders, approvePayment, rejectPayment, cancelOrder } = useOrders();
  const { user, role } = useAuth();

  const [, forceUpdate] = useState({});
  const [copiedKey, setCopiedKey] = useState("");
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [reviewingOrder, setReviewingOrder] = useState(null); // for wallet payment review

  useEffect(() => {
    const interval = setInterval(() => forceUpdate({}), 10000);
    return () => clearInterval(interval);
  }, []);

  if (role !== "seller" && role !== "both") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span
          style={{
            fontFamily: "Pacifico, cursive",
            color: "#FF8FA3",
            fontSize: "32px",
            textShadow: "0 0 30px rgba(255,143,163,0.7)",
          }}
        >
          Seller access only
        </span>
      </div>
    );
  }

  const sellerId = String(user?.id || "");

  const sales = orders
    .filter(
      (o) =>
        o.status !== "cancelled" &&
        o.items.some((i) => String(i.sellerId) === sellerId)
    )
    .map((o) => ({
      ...o,
      myItems: o.items.filter((i) => String(i.sellerId) === sellerId),
    }));

  const sortedSales = [...sales].sort((a, b) => {
    const statusOrder = { waiting_confirmation: 0, on_way: 1, delivered: 2 };
    return (
      (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3) ||
      b.createdAt - a.createdAt
    );
  });

  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1500);
    } catch {}
  };

  const handleCancelOrder = async () => {
    if (!cancellingOrder) return;
    await cancelOrder(cancellingOrder.orderNumber, "Cancelled by seller");
    setCancellingOrder(null);
  };

  const SaleCard = ({ sale }) => {
    const isWaiting = sale.status === "waiting_confirmation";
    const isOnWay = sale.status === "on_way";
    const isDelivered = sale.status === "delivered";
    const isGuestBuyer = !!sale.buyerGuestId;
    const isWalletPayment =
      sale.paymentMethod === "JazzCash" || sale.paymentMethod === "EasyPaisa";
    const myTotal = sale.myItems.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={
          "rounded-[20px] p-6 shadow-lg " +
          (isWaiting
            ? "bg-amber-50 border-2 border-amber-300"
            : "bg-[#FFF6F8]/95 border-2 border-transparent")
        }
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-[#C8B6E2] uppercase tracking-wide">
              Order
            </p>
            <p className="text-[#2E2A4A] font-bold tracking-wider">
              {sale.orderNumber}
            </p>
            <p className="text-xs text-[#7A6C9D] mt-0.5">
              {formatTimestamp(sale.createdAt)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {isWaiting && (
              <div className="px-3 py-1 rounded-full text-xs flex items-center gap-1 bg-amber-200 text-amber-800">
                <Clock className="w-3 h-3" />
                {isWalletPayment ? "Awaiting Payment Review" : "Awaiting Confirmation"}
              </div>
            )}
            {isOnWay && (
              <div className="px-3 py-1 rounded-full text-xs flex items-center gap-1 bg-[#EDE8F9] text-[#4A3A7A]">
                <Truck className="w-3 h-3" /> On Way
              </div>
            )}
            {isDelivered && (
              <div className="px-3 py-1 rounded-full text-xs flex items-center gap-1 bg-green-100 text-green-700">
                <CheckCircle className="w-3 h-3" /> Delivered
              </div>
            )}
            <p className="text-[#FF8FA3] font-semibold mt-1">
              Rs. {myTotal.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Buyer info */}
        <div className="rounded-[12px] bg-[#F6C1CC]/20 p-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F6C1CC] to-[#C8B6E2] flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#2E2A4A] font-medium">
                {isGuestBuyer ? "Guest Buyer" : sale.buyerName}
              </p>
              {sale.buyerPhone && (
                <div className="flex items-center gap-1 text-xs text-[#7A6C9D]">
                  <span>📞 {sale.buyerPhone}</span>
                  <button
                    onClick={() =>
                      copyToClipboard(sale.buyerPhone, "phone_" + sale.id)
                    }
                    className="p-0.5 hover:bg-white/50 rounded"
                  >
                    {copiedKey === "phone_" + sale.id ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              )}
              {sale.address && (
                <p className="text-xs text-[#7A6C9D] mt-0.5">
                  📍 {sale.address}
                </p>
              )}
              {sale.buyerWalletPhone && (
                <p className="text-xs text-[#7A6C9D]">
                  💳 {sale.paymentMethod}:{" "}
                  <span className="font-mono">{sale.buyerWalletPhone}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-2 mb-3">
          {sale.myItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3 text-sm">
              {item.image && (
                <img
                  src={item.image}
                  alt=""
                  className="w-10 h-10 rounded-[8px] object-cover"
                />
              )}
              <div className="flex-1">
                <p className="text-[#2E2A4A]">
                  {item.name}{" "}
                  <span className="text-[#7A6C9D] text-xs">x{item.quantity}</span>
                </p>
                <p className="text-xs text-[#C8B6E2]">🚚 {item.delivery}</p>
              </div>
              <p className="text-[#FF8FA3]">
                Rs. {(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* On Way countdown */}
        {isOnWay && sale.expectedDeliveryAt && (
          <div className="rounded-[10px] bg-[#EDE8F9] p-2 mb-3 text-center">
            <p className="text-[#4A3A7A] text-xs">
              Auto-delivering in {formatTimeRemaining(sale.expectedDeliveryAt)}
            </p>
          </div>
        )}

        {/* Waiting actions */}
        {isWaiting && (
          <div className="space-y-2">
            {isWalletPayment ? (
              // Wallet payment — show review card button
              <>
                <p className="text-xs text-amber-700">
                  The buyer paid via <strong>{sale.paymentMethod}</strong> and
                  uploaded a payment screenshot. Review it to approve or reject.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setReviewingOrder(sale)}
                    className="flex-1 py-2.5 rounded-full bg-[#FF8FA3] text-white text-sm hover:scale-[1.02] transition-all"
                  >
                    🧾 Review Payment Proof
                  </button>
                  <button
                    onClick={() => setCancellingOrder(sale)}
                    className="flex-1 py-2.5 rounded-full bg-red-400 text-white text-sm hover:scale-[1.02] transition-all flex items-center justify-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel Order
                  </button>
                </div>
              </>
            ) : (
              // COD / Card — shouldn't normally be waiting_confirmation,
              // but show a cancel option just in case
              <>
                <p className="text-xs text-[#7A6C9D]">
                  Payment via <strong>{sale.paymentMethod}</strong>.
                </p>
                <button
                  onClick={() => setCancellingOrder(sale)}
                  className="w-full py-2.5 rounded-full bg-red-400 text-white text-sm hover:scale-[1.02] transition-all flex items-center justify-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Cancel Order
                </button>
              </>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[900px] mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl lg:text-6xl mb-2">
            <span
              style={{ fontFamily: "Fredoka, sans-serif", color: "#FFF6F8" }}
            >
              My{" "}
            </span>
            <span
              style={{
                fontFamily: "Pacifico, cursive",
                color: "#FF8FA3",
                textShadow: "0 0 35px rgba(255,143,163,0.7)",
              }}
            >
              Sales
            </span>
          </h1>
          <p className="text-[#FFF6F8]/70 text-sm">
            {sales.length === 0
              ? "No sales yet"
              : `${sales.length} order${sales.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {sales.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛍️</div>
            <p className="text-[#FFF6F8] text-xl">
              You haven't sold anything yet
            </p>
            <p className="text-[#FFF6F8]/60 text-sm mt-2">
              When buyers order your products, they'll show up here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedSales.map((sale) => (
              <SaleCard key={sale.id} sale={sale} />
            ))}
          </div>
        )}
      </div>

      {/* PAYMENT REVIEW MODAL */}
      <AnimatePresence>
        {reviewingOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/50 backdrop-blur-md overflow-y-auto py-8"
            onClick={(e) => {
              if (e.target === e.currentTarget) setReviewingOrder(null);
            }}
          >
            <div className="w-full max-w-[620px]">
              <PaymentReviewCard
                order={reviewingOrder}
                onResolved={() => setReviewingOrder(null)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CANCEL ORDER MODAL */}
      <ConfirmModal
        isOpen={!!cancellingOrder}
        onClose={() => setCancellingOrder(null)}
        onConfirm={handleCancelOrder}
        title="Cancel this order?"
        message={
          cancellingOrder
            ? `Cancel order ${cancellingOrder.orderNumber}? Stock will be restored and the buyer will be notified.`
            : ""
        }
        confirmText="Yes, Cancel"
        cancelText="Go Back"
      />
    </div>
  );
}