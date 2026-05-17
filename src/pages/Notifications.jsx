import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import {
  Flag, Heart, Users, CheckCheck, AlertTriangle, X, Package, Lock,
  ShoppingBag, Truck, CheckCircle, XCircle, Clock, CreditCard,
} from "lucide-react";
import { ReportNotificationModal } from "./DiscussionDetail";

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

const TYPE_CONFIG = {
  report_discussion: { icon: Flag, color: "text-[#FF8FA3]", bg: "bg-[#FF8FA3]/15", label: "Discussion Reported" },
  report_removed: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-100", label: "Discussion Removed" },
  product_liked: { icon: Heart, color: "text-[#FF8FA3]", bg: "bg-[#FF8FA3]/15", label: "Product Liked" },
  new_member: { icon: Users, color: "text-[#C8B6E2]", bg: "bg-[#C8B6E2]/20", label: "New Member" },
  low_stock: { icon: Package, color: "text-amber-500", bg: "bg-amber-100", label: "Low Stock" },
  critical_stock: { icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-100", label: "Critical Stock" },
  out_of_stock: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-100", label: "Out of Stock" },
  // 🔥 New order notifications
  new_order: { icon: ShoppingBag, color: "text-[#FF8FA3]", bg: "bg-[#FF8FA3]/15", label: "New Order" },
  new_order_persistent: { icon: Clock, color: "text-amber-600", bg: "bg-amber-100", label: "Awaiting Confirmation" },
  payment_confirmed: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-100", label: "Payment Confirmed" },
  payment_failure: { icon: CreditCard, color: "text-amber-600", bg: "bg-amber-100", label: "Payment Failed — Retry" },
  delivered: { icon: Truck, color: "text-green-600", bg: "bg-green-100", label: "Delivered" },
  order_cancelled: { icon: XCircle, color: "text-red-500", bg: "bg-red-100", label: "Order Cancelled" },
};

export function Notifications() {
  const { user, isGuest } = useAuth();
  const { getForUser, markRead, markAllRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();
  const [reportModal, setReportModal] = useState(null);

  if (isGuest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-6">🔒</div>
          <p className="text-[#FFF6F8] text-2xl mb-6">Sign up to see your notifications</p>
          <button
            onClick={() => navigate("/signup")}
            className="px-8 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
          >
            Sign Up
          </button>
        </div>
      </div>
    );
  }

  const myNotifications = getForUser(user.id);
  const unread = myNotifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notif) => {
    markRead(notif.id);

    if (notif.type === "report_discussion" || notif.type === "report_removed") {
      setReportModal(notif);
      return;
    }

    if (notif.type === "product_liked") {
      navigate("/my-products");
      return;
    }

    if (notif.type === "new_member") {
      navigate("/community");
      return;
    }

    if (
      notif.type === "low_stock" ||
      notif.type === "critical_stock" ||
      notif.type === "out_of_stock"
    ) {
      navigate("/my-products");
      return;
    }

    // 🔥 Seller-side order notifications → My Sales
    if (notif.type === "new_order" || notif.type === "new_order_persistent") {
      navigate("/my-sales");
      return;
    }

    // 🔥 Buyer-side order notifications → My Orders
    if (
      notif.type === "payment_confirmed" ||
      notif.type === "delivered" ||
      notif.type === "order_cancelled"
    ) {
      navigate("/my-orders");
      return;
    }

    // 🔥 Payment failure → directly to Cart retry flow
    if (notif.type === "payment_failure") {
      navigate("/cart?retry=" + notif.orderNumber);
      return;
    }
  };

  const getNotificationText = (notif) => {
    switch (notif.type) {
      case "report_discussion":
        return `Your discussion "${notif.discussionTitle}" was reported.`;
      case "report_removed":
        return `Your discussion "${notif.discussionTitle}" has been removed after 3 reports.`;
      case "product_liked":
        return `${notif.likedByName} liked your product "${notif.productName}".`;
      case "new_member":
        return `${notif.memberName} joined the community!`;
      case "low_stock":
        return `"${notif.productName}" is running low — ${notif.stock} units left.`;
      case "critical_stock":
        return `"${notif.productName}" is critically low — only ${notif.stock} units left! Restock soon.`;
      case "out_of_stock":
        return `"${notif.productName}" is out of stock. Buyers can't purchase it until you restock.`;
      // 🔥 Order notifications
      case "new_order":
        return `New order from ${notif.buyerName} via ${notif.paymentMethod}. Confirm payment in My Sales.`;
      case "new_order_persistent":
        return `Order from ${notif.buyerName} still unconfirmed. Check My Sales — send reminder or confirm payment.`;
      case "payment_confirmed":
        return `Your payment for order ${notif.orderNumber} has been confirmed. Your order is on the way!`;
      case "payment_failure":
        return `Your payment for order ${notif.orderNumber} wasn't received. Tap to retry payment.`;
      case "delivered":
        return `Your order ${notif.orderNumber} has been delivered! Enjoy your purchase 🎉`;
      case "order_cancelled":
        return `Order ${notif.orderNumber} was cancelled. ${notif.reason || ""}`;
      default:
        return "New notification";
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[700px] mx-auto">

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <h1 className="text-5xl mb-3">
            <span style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 30px rgba(255,143,163,0.6)" }}>
              Notifications
            </span>
          </h1>
          {unread > 0 && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-[#C8B6E2] text-sm">{unread} unread</p>
              <button
                onClick={() => markAllRead(user.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#C8B6E2]/30 text-[#7A6C9D] text-sm hover:bg-[#C8B6E2]/50 transition-all"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </button>
            </div>
          )}
        </motion.div>

        {myNotifications.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <div className="text-7xl mb-6">🔔</div>
            <p className="text-[#FFF6F8] text-2xl mb-2">You're all caught up!</p>
            <p className="text-[#C8B6E2]">Notifications will appear here.</p>
          </motion.div>
        )}

        <ul className="space-y-3">
          <AnimatePresence>
            {myNotifications.map((notif, index) => {
              const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.new_member;
              const Icon = config.icon;
              const isPersistent = notif.persistent === true;

              return (
                <motion.li
                  key={notif.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => handleNotificationClick(notif)}
                  className={`relative flex items-start gap-4 p-5 rounded-[20px] cursor-pointer transition-all hover:scale-[1.01] ${
                    notif.read
                      ? "bg-[#FFF6F8]/60"
                      : "bg-[#FFF6F8]/95 shadow-lg border-2 border-[#FF8FA3]/20"
                  } ${isPersistent ? "border-2 border-amber-300" : ""}`}
                >
                  {!notif.read && (
                    <div className="absolute top-4 right-12 w-2 h-2 rounded-full bg-[#FF8FA3]" />
                  )}

                  <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="text-xs font-semibold text-[#C8B6E2] uppercase tracking-wide">
                        {config.label}
                      </p>
                      {isPersistent && (
                        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 font-medium">
                          <Lock className="w-2.5 h-2.5" />
                          Action needed
                        </span>
                      )}
                    </div>
                    <p className={`text-sm leading-snug ${notif.read ? "text-[#7A6C9D]" : "text-[#2E2A4A] font-medium"}`}>
                      {getNotificationText(notif)}
                    </p>
                    <p className="text-xs text-[#C8B6E2] mt-1">{timeAgo(notif.createdAt)}</p>
                  </div>

                  {!isPersistent && (
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                      className="p-1.5 rounded-full hover:bg-[#F6C1CC]/40 transition-all flex-shrink-0"
                      title="Dismiss"
                    >
                      <X className="w-4 h-4 text-[#C8B6E2]" />
                    </button>
                  )}
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </div>

      <AnimatePresence>
        {reportModal && (
          <ReportNotificationModal
            notification={reportModal}
            onClose={() => {
              const isRemoved = reportModal.type === "report_removed";
              const discussionId = reportModal.discussionId;
              setReportModal(null);
              if (!isRemoved) {
                navigate(`/community/discussion/${discussionId}`);
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}