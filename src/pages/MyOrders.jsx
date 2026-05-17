import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Truck, CheckCircle, XCircle, AlertCircle, Package } from "lucide-react";
import { useOrders } from "../context/OrderContext";
import { useAuth } from "../context/AuthContext";

const TABS = [
  { id: "waiting_confirmation", label: "Waiting for Confirmation", icon: Clock, color: "#FF8FA3" },
  { id: "on_way", label: "On Way", icon: Truck, color: "#7A6C9D" },
  { id: "delivered", label: "Delivered", icon: CheckCircle, color: "#22C55E" },
  { id: "cancelled", label: "Cancelled", icon: XCircle, color: "#EF4444" },
];

function formatTimeRemaining(targetMs) {
  const diff = targetMs - Date.now();
  if (diff <= 0) return "any moment now";
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  if (mins > 0) return mins + "m " + secs + "s remaining";
  return secs + "s remaining";
}

function formatTimestamp(ts) {
  return new Date(ts).toLocaleString();
}

export function MyOrders() {
  const { getOrdersForBuyer } = useOrders();
  const { user, guestId } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("waiting_confirmation");
  const [, forceUpdate] = useState({});

  // Tick the page every 10s so countdowns refresh
  useEffect(() => {
    const interval = setInterval(() => forceUpdate({}), 10000);
    return () => clearInterval(interval);
  }, []);

  // "retry_pending" orders show in Waiting bucket so user can find them
  const allOrders = getOrdersForBuyer(user?.id, !user ? guestId : null);

  const grouped = {
    waiting_confirmation: allOrders.filter((o) => o.status === "waiting_confirmation" || o.status === "retry_pending"),
    on_way: allOrders.filter((o) => o.status === "on_way"),
    delivered: allOrders.filter((o) => o.status === "delivered"),
    cancelled: allOrders.filter((o) => o.status === "cancelled"),
  };

  const ordersForTab = grouped[activeTab] || [];

  const OrderCard = ({ order }) => {
    const isRetryPending = order.status === "retry_pending";
    const isOnWay = order.status === "on_way";
    const isDelivered = order.status === "delivered";
    const isCancelled = order.status === "cancelled";

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[20px] bg-[#FFF6F8]/95 p-6 shadow-lg"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-[#C8B6E2] uppercase tracking-wide">Order</p>
            <p className="text-[#2E2A4A] font-bold tracking-wider">{order.orderNumber}</p>
            <p className="text-xs text-[#7A6C9D] mt-0.5">{formatTimestamp(order.createdAt)}</p>
          </div>
          <div className="text-right">
            <p className="text-[#FF8FA3] font-semibold text-lg">Rs. {order.total.toFixed(2)}</p>
            <p className="text-xs text-[#7A6C9D]">{order.paymentMethod}</p>
          </div>
        </div>

        {/* Status pill */}
        {isRetryPending && (
          <div className="rounded-[12px] bg-amber-50 border border-amber-200 p-3 mb-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-amber-700 text-sm font-medium">Payment retry needed</p>
                <p className="text-amber-600 text-xs mt-0.5">
                  Seller didn't receive your payment. Please retry payment to keep this order alive.
                </p>
                <button
                  onClick={() => navigate("/cart?retry=" + order.orderNumber)}
                  className="mt-2 px-4 py-1.5 rounded-full bg-amber-500 text-white text-xs hover:scale-105 transition-all"
                >
                  Retry Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {isOnWay && order.expectedDeliveryAt && (
          <div className="rounded-[12px] bg-[#EDE8F9] border border-[#C8B6E2] p-3 mb-3">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#7A6C9D]" />
              <p className="text-[#4A3A7A] text-sm">
                <strong>On the way</strong> — {formatTimeRemaining(order.expectedDeliveryAt)}
              </p>
            </div>
          </div>
        )}

        {isCancelled && order.cancelReason && (
          <div className="rounded-[12px] bg-red-50 border border-red-200 p-3 mb-3">
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-600 text-sm font-medium">Order cancelled</p>
                <p className="text-red-500 text-xs mt-0.5">{order.cancelReason}</p>
              </div>
            </div>
          </div>
        )}

        {isDelivered && (
          <div className="rounded-[12px] bg-green-50 border border-green-200 p-3 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-green-700 text-sm font-medium">Delivered successfully</p>
          </div>
        )}

        {/* Items */}
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 text-sm">
              {item.image && <img src={item.image} alt="" className="w-10 h-10 rounded-[8px] object-cover flex-shrink-0" />}
              <div className="flex-1">
                <p className="text-[#2E2A4A]">{item.name} <span className="text-[#7A6C9D] text-xs">x{item.quantity}</span></p>
                <p className="text-xs text-[#C8B6E2]">🚚 {item.delivery}</p>
              </div>
              <p className="text-[#FF8FA3]">Rs. {(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>

        {/* Delivery address (collapsed style) */}
        <div className="mt-3 pt-3 border-t border-[#F6C1CC]/60">
          <p className="text-xs text-[#C8B6E2] uppercase tracking-wide mb-1">Delivering to</p>
          <p className="text-xs text-[#2E2A4A] whitespace-pre-line">{order.address}</p>
          <p className="text-xs text-[#2E2A4A] mt-1">📞 {order.buyerPhone}</p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[900px] mx-auto">

        <div className="text-center mb-12">
          <h1 className="text-5xl lg:text-6xl mb-2">
            <span style={{ fontFamily: "Fredoka, sans-serif", color: "#FFF6F8" }}>My </span>
            <span style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 35px rgba(255,143,163,0.7)" }}>
              Orders
            </span>
          </h1>
          {!user && (
            <p className="text-[#FFF6F8]/70 text-sm">
              Tracking orders made on this device.{" "}
              <button onClick={() => navigate("/signup")} className="text-[#FF8FA3] underline hover:opacity-80">
                Sign up
              </button>{" "}
              to keep your order history forever.
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {TABS.map((tab) => {
            const count = grouped[tab.id]?.length || 0;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={"flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all " +
                  (isActive
                    ? "bg-[#FF8FA3] text-white shadow-md scale-105"
                    : "bg-[#FFF6F8]/40 text-[#FFF6F8] hover:bg-[#FFF6F8]/60")}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className={"px-2 py-0.5 rounded-full text-xs " +
                    (isActive ? "bg-white/30" : "bg-[#FF8FA3] text-white")}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Orders */}
        {ordersForTab.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-[#C8B6E2] mx-auto mb-4" />
            <p className="text-[#FFF6F8] text-xl mb-2">No orders here yet</p>
            <p className="text-[#FFF6F8]/60 text-sm">
              {activeTab === "waiting_confirmation" && "Orders awaiting payment confirmation will appear here."}
              {activeTab === "on_way" && "Orders in transit will appear here."}
              {activeTab === "delivered" && "Completed orders will appear here."}
              {activeTab === "cancelled" && "Cancelled orders will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {ordersForTab.map((order) => <OrderCard key={order.id} order={order} />)}
          </div>
        )}
      </div>
    </div>
  );
}