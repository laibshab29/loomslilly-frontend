import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductContext";
import { useCommunity } from "../context/CommunityContext";
import { useEvents } from "../context/EventContext";
import { useTutorials } from "../context/TutorialContext";
import { useOrders } from "../context/OrderContext";
import {
  Users, Package, Tag, MessageCircle, Calendar,
  BookOpen, Star, Shield, LogOut, Activity, Trash2,
  RotateCcw, CheckCircle, XCircle,
} from "lucide-react";

// ─── SHARED STYLES ─────────────────────────────────────────────
const cardStyle = "rounded-[20px] bg-[#FFF6F8]/90 p-6 shadow-lg";
const badgeBase = "px-3 py-1 rounded-full text-xs font-medium";

// ─── STAT CARD ─────────────────────────────────────────────────
function StatCard({ icon, label, value, sub }) {
  return (
    <div className={cardStyle}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F6C1CC] to-[#C8B6E2] flex items-center justify-center">
          {icon}
        </div>
        <p className="text-[#7A6C9D] text-sm">{label}</p>
      </div>
      <p className="text-3xl font-bold text-[#2E2A4A]">{value}</p>
      {sub && <p className="text-xs text-[#C8B6E2] mt-1">{sub}</p>}
    </div>
  );
}

// ─── SECTION HEADER ────────────────────────────────────────────
function SectionHeader({ title }) {
  return (
    <h3
      className="text-2xl text-[#2E2A4A] mb-4"
      style={{ fontFamily: "Fredoka, sans-serif" }}
    >
      {title}
    </h3>
  );
}

// ─── ACTION BUTTON ─────────────────────────────────────────────
function ActionBtn({ onClick, label, variant = "pink", icon }) {
  const colors = {
    pink: "bg-[#FF8FA3] text-white hover:bg-[#FF8FA3]/80",
    purple: "bg-[#C8B6E2] text-[#2E2A4A] hover:bg-[#C8B6E2]/80",
    red: "bg-red-400 text-white hover:bg-red-500",
    green: "bg-emerald-400 text-white hover:bg-emerald-500",
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-all hover:scale-105 ${colors[variant]}`}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── TABS ──────────────────────────────────────────────────────
const TABS = [
  { id: "overview", label: "Overview", icon: <Activity className="w-4 h-4" /> },
  { id: "users", label: "Users", icon: <Users className="w-4 h-4" /> },
  { id: "sellers", label: "Sellers", icon: <Shield className="w-4 h-4" /> },
  { id: "products", label: "Products", icon: <Package className="w-4 h-4" /> },
  { id: "deals", label: "Deals", icon: <Tag className="w-4 h-4" /> },
  { id: "discussions", label: "Discussions", icon: <MessageCircle className="w-4 h-4" /> },
  { id: "events", label: "Events", icon: <Calendar className="w-4 h-4" /> },
  { id: "tutorials", label: "Tutorials", icon: <BookOpen className="w-4 h-4" /> },
  { id: "log", label: "Activity Log", icon: <Star className="w-4 h-4" /> },
];

// ─── MAIN ADMIN PAGE ───────────────────────────────────────────
export function Admin() {
  const navigate = useNavigate();
  const {
    isAdmin, adminLogout, adminLog,
    banUser, unbanUser, isAdminBanned,
    verifySeller, unverify, isVerifiedSeller,
    featureProduct, unfeatureProduct, isProductFeatured,
    removeContent, restoreContent, isContentRemoved,
  } = useAdmin();

  const { products, deals } = useProducts();
  const { discussions } = useCommunity();
  const { events } = useEvents();
  const { tutorials } = useTutorials();
  const { orders } = useOrders();

  const [activeTab, setActiveTab] = useState("overview");

  // Guard
  if (!isAdmin) {
    navigate("/admin/login");
    return null;
  }

  // ─── REGISTERED USERS ────────────────────────────────────────
  const registeredUsers = (() => {
    try {
      return JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    } catch {
      return [];
    }
  })();

  const sellers = registeredUsers.filter(
    (u) => u.role === "seller" || u.role === "both"
  );

  // ─── PLATFORM STATS ──────────────────────────────────────────
  const totalRevenue = orders.reduce(
    (sum, order) =>
      sum + order.items.reduce((s, i) => s + i.price * i.quantity, 0),
    0
  );

  const today = new Date().toISOString().split("T")[0];
  const activeEvents = events.filter((e) => e.date >= today);

  const formatDate = (ts) =>
    new Date(ts).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });

  const handleLogout = () => {
    adminLogout();
    navigate("/admin/login");
  };

  // ─── TAB CONTENT ─────────────────────────────────────────────

  const renderOverview = () => (
    <div>
      <SectionHeader title="Platform Overview" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Users className="w-5 h-5 text-white" />} label="Registered Users" value={registeredUsers.length} />
        <StatCard icon={<Package className="w-5 h-5 text-white" />} label="Total Products" value={products.length} sub={`${products.filter(p => p.stock === 0).length} out of stock`} />
        <StatCard icon={<Tag className="w-5 h-5 text-white" />} label="Active Deals" value={deals.filter(d => d.validDate >= today).length} sub={`${deals.length} total`} />
        <StatCard icon={<Activity className="w-5 h-5 text-white" />} label="Total Orders" value={orders.length} sub={`Rs. ${totalRevenue.toFixed(2)} revenue`} />
        <StatCard icon={<MessageCircle className="w-5 h-5 text-white" />} label="Discussions" value={discussions.length} />
        <StatCard icon={<Calendar className="w-5 h-5 text-white" />} label="Upcoming Events" value={activeEvents.length} sub={`${events.length} total`} />
        <StatCard icon={<BookOpen className="w-5 h-5 text-white" />} label="Tutorials" value={tutorials.length} />
        <StatCard icon={<Shield className="w-5 h-5 text-white" />} label="Sellers" value={sellers.length} sub={`${registeredUsers.filter(u => u.role === "buyer").length} buyers`} />
      </div>

      {/* TOP PRODUCTS BY LIKES */}
      <SectionHeader title="Top Liked Products" />
      <div className="space-y-2 mb-8">
        {[...products]
          .sort((a, b) => (b.likes || 0) - (a.likes || 0))
          .slice(0, 5)
          .map((p) => (
            <div key={p.id} className={`${cardStyle} flex items-center justify-between`}>
              <p className="text-[#2E2A4A] font-medium">{p.name}</p>
              <span className={`${badgeBase} bg-[#FF8FA3]/20 text-[#FF8FA3]`}>
                ❤️ {p.likes || 0}
              </span>
            </div>
          ))}
      </div>

      {/* RECENT ORDERS */}
      <SectionHeader title="Recent Orders" />
      {orders.length === 0 ? (
        <p className="text-[#7A6C9D]">No orders yet.</p>
      ) : (
        <div className="space-y-2">
          {[...orders].reverse().slice(0, 5).map((order) => (
            <div key={order.id} className={`${cardStyle} flex items-center justify-between`}>
              <div>
                <p className="text-[#2E2A4A] text-sm font-medium">Order #{order.id}</p>
                <p className="text-[#7A6C9D] text-xs">{formatDate(order.createdAt)} · {order.items.length} items</p>
              </div>
              <span className={`${badgeBase} bg-[#EDE8F9] text-[#4A3A7A]`}>
                Rs. {order.items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderUsers = () => (
    <div>
      <SectionHeader title={`All Users (${registeredUsers.length})`} />
      {registeredUsers.length === 0 ? (
        <p className="text-[#7A6C9D]">No registered users yet.</p>
      ) : (
        <div className="space-y-3">
          {registeredUsers.map((u) => {
            const banned = isAdminBanned(u.id);
            return (
              <div key={u.id} className={`${cardStyle} flex items-center justify-between gap-4 flex-wrap`}>
                <div>
                  <p className="text-[#2E2A4A] font-medium">{u.name}</p>
                  <p className="text-[#7A6C9D] text-xs">{u.email}</p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <span className={`${badgeBase} bg-[#EDE8F9] text-[#4A3A7A] capitalize`}>{u.role}</span>
                    {banned && <span className={`${badgeBase} bg-red-100 text-red-500`}>Banned</span>}
                    {isVerifiedSeller(u.id) && <span className={`${badgeBase} bg-emerald-100 text-emerald-600`}>✓ Verified</span>}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {banned ? (
                    <ActionBtn onClick={() => unbanUser(u.id, u.name)} label="Unban" variant="green" icon={<RotateCcw className="w-3 h-3" />} />
                  ) : (
                    <ActionBtn onClick={() => banUser(u.id, u.name)} label="Ban" variant="red" icon={<XCircle className="w-3 h-3" />} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderSellers = () => (
    <div>
      <SectionHeader title={`Sellers (${sellers.length})`} />
      {sellers.length === 0 ? (
        <p className="text-[#7A6C9D]">No sellers yet.</p>
      ) : (
        <div className="space-y-3">
          {sellers.map((s) => {
            const verified = isVerifiedSeller(s.id);
            const sellerProducts = products.filter((p) => p.sellerId === s.id);
            return (
              <div key={s.id} className={`${cardStyle} flex items-center justify-between gap-4 flex-wrap`}>
                <div>
                  <p className="text-[#2E2A4A] font-medium">{s.name}</p>
                  <p className="text-[#7A6C9D] text-xs">{s.email} · {sellerProducts.length} products</p>
                  <div className="flex gap-2 mt-1">
                    <span className={`${badgeBase} bg-[#EDE8F9] text-[#4A3A7A] capitalize`}>{s.role}</span>
                    {verified && <span className={`${badgeBase} bg-emerald-100 text-emerald-600`}>✓ Verified</span>}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {verified ? (
                    <ActionBtn onClick={() => unverify(s.id, s.name)} label="Remove Verification" variant="purple" icon={<XCircle className="w-3 h-3" />} />
                  ) : (
                    <ActionBtn onClick={() => verifySeller(s.id, s.name)} label="Verify Seller" variant="green" icon={<CheckCircle className="w-3 h-3" />} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderProducts = () => (
    <div>
      <SectionHeader title={`All Products (${products.length})`} />
      <div className="space-y-3">
        {products.map((p) => {
          const removed = isContentRemoved("products", p.id);
          const featured = isProductFeatured(p.id);
          return (
            <div key={p.id} className={`${cardStyle} flex items-center justify-between gap-4 flex-wrap ${removed ? "opacity-50" : ""}`}>
              <div>
                <p className="text-[#2E2A4A] font-medium">{p.name}</p>
                <p className="text-[#7A6C9D] text-xs capitalize">{p.category} · {p.type} · Rs. {p.price} · Stock: {p.stock}</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {featured && <span className={`${badgeBase} bg-[#FF8FA3]/20 text-[#FF8FA3]`}>⭐ Featured</span>}
                  {removed && <span className={`${badgeBase} bg-red-100 text-red-500`}>Removed</span>}
                  {p.stock === 0 && <span className={`${badgeBase} bg-amber-100 text-amber-600`}>Out of Stock</span>}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {removed ? (
                  <ActionBtn onClick={() => restoreContent("products", p.id, p.name)} label="Restore" variant="green" icon={<RotateCcw className="w-3 h-3" />} />
                ) : (
                  <>
                    <ActionBtn
                      onClick={() => featured ? unfeatureProduct(p.id, p.name) : featureProduct(p.id, p.name)}
                      label={featured ? "Unfeature" : "Feature"}
                      variant={featured ? "purple" : "pink"}
                      icon={<Star className="w-3 h-3" />}
                    />
                    <ActionBtn onClick={() => removeContent("products", p.id, p.name)} label="Remove" variant="red" icon={<Trash2 className="w-3 h-3" />} />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderDeals = () => (
    <div>
      <SectionHeader title={`All Deals (${deals.length})`} />
      <div className="space-y-3">
        {deals.map((d) => {
          const removed = isContentRemoved("deals", d.id);
          const expired = d.validDate < today;
          return (
            <div key={d.id} className={`${cardStyle} flex items-center justify-between gap-4 flex-wrap ${removed ? "opacity-50" : ""}`}>
              <div>
                <p className="text-[#2E2A4A] font-medium">{d.title}</p>
                <p className="text-[#7A6C9D] text-xs">Rs. {d.discountedPrice} (was Rs. {d.originalPrice}) · Valid: {d.validDate}</p>
                <div className="flex gap-2 mt-1">
                  {expired && <span className={`${badgeBase} bg-gray-100 text-gray-500`}>Expired</span>}
                  {removed && <span className={`${badgeBase} bg-red-100 text-red-500`}>Removed</span>}
                </div>
              </div>
              <div className="flex gap-2">
                {removed ? (
                  <ActionBtn onClick={() => restoreContent("deals", d.id, d.title)} label="Restore" variant="green" icon={<RotateCcw className="w-3 h-3" />} />
                ) : (
                  <ActionBtn onClick={() => removeContent("deals", d.id, d.title)} label="Remove" variant="red" icon={<Trash2 className="w-3 h-3" />} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderDiscussions = () => (
    <div>
      <SectionHeader title={`All Discussions (${discussions.length})`} />
      <div className="space-y-3">
        {discussions.map((d) => {
          const removed = isContentRemoved("discussions", d.id);
          const reportCount = d.reports?.length || 0;
          return (
            <div key={d.id} className={`${cardStyle} flex items-center justify-between gap-4 flex-wrap ${removed ? "opacity-50" : ""}`}>
              <div className="flex-1 min-w-0">
                <p className="text-[#2E2A4A] font-medium truncate">{d.title}</p>
                <p className="text-[#7A6C9D] text-xs">by {d.authorName} · {d.replies?.length || 0} replies</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {reportCount > 0 && (
                    <span className={`${badgeBase} ${reportCount >= 3 ? "bg-red-100 text-red-500" : "bg-amber-100 text-amber-600"}`}>
                      ⚑ {reportCount} report{reportCount !== 1 ? "s" : ""}
                    </span>
                  )}
                  {removed && <span className={`${badgeBase} bg-red-100 text-red-500`}>Removed</span>}
                </div>
              </div>
              <div className="flex gap-2">
                {removed ? (
                  <ActionBtn onClick={() => restoreContent("discussions", d.id, d.title)} label="Restore" variant="green" icon={<RotateCcw className="w-3 h-3" />} />
                ) : (
                  <ActionBtn onClick={() => removeContent("discussions", d.id, d.title)} label="Remove" variant="red" icon={<Trash2 className="w-3 h-3" />} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderEvents = () => (
    <div>
      <SectionHeader title={`All Events (${events.length})`} />
      <div className="space-y-3">
        {events.map((e) => {
          const removed = isContentRemoved("events", e.id);
          const expired = e.date < today;
          return (
            <div key={e.id} className={`${cardStyle} flex items-center justify-between gap-4 flex-wrap ${removed ? "opacity-50" : ""}`}>
              <div>
                <p className="text-[#2E2A4A] font-medium">{e.name}</p>
                <p className="text-[#7A6C9D] text-xs">{e.date} · {e.venue} · {e.slots - e.slotsUsed} slots left</p>
                <div className="flex gap-2 mt-1">
                  {expired && <span className={`${badgeBase} bg-gray-100 text-gray-500`}>Expired</span>}
                  {removed && <span className={`${badgeBase} bg-red-100 text-red-500`}>Removed</span>}
                </div>
              </div>
              <div className="flex gap-2">
                {removed ? (
                  <ActionBtn onClick={() => restoreContent("events", e.id, e.name)} label="Restore" variant="green" icon={<RotateCcw className="w-3 h-3" />} />
                ) : (
                  <ActionBtn onClick={() => removeContent("events", e.id, e.name)} label="Remove" variant="red" icon={<Trash2 className="w-3 h-3" />} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderTutorials = () => (
    <div>
      <SectionHeader title={`All Tutorials (${tutorials.length})`} />
      <div className="space-y-3">
        {tutorials.map((t) => {
          const removed = isContentRemoved("tutorials", t.id);
          return (
            <div key={t.id} className={`${cardStyle} flex items-center justify-between gap-4 flex-wrap ${removed ? "opacity-50" : ""}`}>
              <div>
                <p className="text-[#2E2A4A] font-medium">{t.title}</p>
                <p className="text-[#7A6C9D] text-xs capitalize">{t.type} · by {t.authorName}</p>
                {removed && <span className={`${badgeBase} bg-red-100 text-red-500 mt-1 inline-block`}>Removed</span>}
              </div>
              <div className="flex gap-2">
                {removed ? (
                  <ActionBtn onClick={() => restoreContent("tutorials", t.id, t.title)} label="Restore" variant="green" icon={<RotateCcw className="w-3 h-3" />} />
                ) : (
                  <ActionBtn onClick={() => removeContent("tutorials", t.id, t.title)} label="Remove" variant="red" icon={<Trash2 className="w-3 h-3" />} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderLog = () => (
    <div>
      <SectionHeader title="Activity Log" />
      {adminLog.length === 0 ? (
        <p className="text-[#7A6C9D]">No actions logged yet.</p>
      ) : (
        <div className="space-y-2">
          {adminLog.map((entry) => (
            <div key={entry.id} className={`${cardStyle} flex items-start justify-between gap-4`}>
              <div>
                <p className="text-[#2E2A4A] text-sm font-medium">{entry.action}</p>
                {entry.detail && <p className="text-[#7A6C9D] text-xs">{entry.detail}</p>}
              </div>
              <span className="text-[#C8B6E2] text-xs flex-shrink-0">{formatDate(entry.timestamp)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const tabContent = {
    overview: renderOverview(),
    users: renderUsers(),
    sellers: renderSellers(),
    products: renderProducts(),
    deals: renderDeals(),
    discussions: renderDiscussions(),
    events: renderEvents(),
    tutorials: renderTutorials(),
    log: renderLog(),
  };

  return (
    <div className="min-h-screen py-10 px-4 lg:px-12">
      <div className="max-w-[1400px] mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl" style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 30px rgba(255,143,163,0.6)" }}>
            Admin Panel
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/")}
              className="px-5 py-2 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all text-sm"
            >
              View Site
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all text-sm"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex flex-wrap gap-2 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-[#FF8FA3] text-white shadow-md"
                  : "bg-[#FFF6F8]/60 text-[#7A6C9D] hover:bg-[#FFF6F8]/90"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {tabContent[activeTab]}
        </motion.div>

      </div>
    </div>
  );
}