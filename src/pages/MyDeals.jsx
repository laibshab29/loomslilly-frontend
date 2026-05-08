import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductContext";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

// ─── HELPERS ────────────────────────────────────────────────
function getImageSrc(image) {
  if (!image) return null;
  if (typeof image === "string") return image;
  if (image instanceof File) return URL.createObjectURL(image);
  return null;
}

function getTomorrowDate() {
  return new Date(Date.now() + 86400000 * 2)
    .toISOString()
    .split("T")[0];
}

// ─── CONFIRM MODAL ───────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-[#FFF6F8] rounded-[28px] shadow-2xl p-10 max-w-[420px] w-full mx-4 text-center"
        >
          <h2
            className="text-3xl mb-4"
            style={{ fontFamily: "Pacifico", color: "#FF8FA3" }}
          >
            Delete Deal?
          </h2>
          <p className="text-[#7A6C9D] mb-8 text-base leading-relaxed">
            {message}
          </p>
          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] font-medium hover:scale-[1.02] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 rounded-full bg-[#FF8FA3] text-white font-medium hover:scale-[1.02] transition-all"
            >
              Delete
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── INLINE NOTIFICATION ─────────────────────────────────────
function Notification({ message, type = "error", onClose }) {
  if (!message) return null;

  const styles = {
    error: "bg-[#FFE4EA] border border-[#FF8FA3] text-[#C0395A]",
    success: "bg-[#E4F9F0] border border-[#6FCFA0] text-[#2A7A55]",
    info: "bg-[#EDE8F9] border border-[#C8B6E2] text-[#4A3A7A]",
  };

  const icons = { error: "✕", success: "✓", info: "ℹ" };

  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-[14px] mb-4 text-sm font-medium ${styles[type]}`}>
      <div className="flex items-center gap-2">
        <span className="text-base leading-none">{icons[type]}</span>
        <span>{message}</span>
      </div>
      <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">✕</button>
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────
export function MyDeals() {
  const { deals, deleteDeal, updateDeal } = useProducts();
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [confirmId, setConfirmId] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  if (role !== "seller" && role !== "both") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-4xl text-white">Seller access only</h1>
      </div>
    );
  }

  const myDeals = deals.filter((deal) => deal.sellerId === user?.id);

  const handleEdit = (deal) => {
    setEditingId(deal.id);
    setEditForm({
      title: deal.title,
      discountedPrice: deal.discountedPrice,
      validDate: deal.validDate,
      images: deal.images || [],
    });
  };

  const handleSave = (id) => {
    if (!editForm.title.trim()) {
      showNotification("Title cannot be empty.", "error");
      return;
    }
    if (!editForm.discountedPrice || Number(editForm.discountedPrice) < 1) {
      showNotification("Discounted price must be at least Rs. 1.", "error");
      return;
    }
    if (!editForm.validDate) {
      showNotification("Please select a valid date.", "error");
      return;
    }
    updateDeal(id, { ...editForm });
    setEditingId(null);
    showNotification("Deal updated successfully.", "success");
  };

  const handleDeleteConfirmed = () => {
    deleteDeal(confirmId);
    setConfirmId(null);
    showNotification("Deal deleted.", "info");
  };

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">

      {/* CONFIRM MODAL */}
      {confirmId && (
        <ConfirmModal
          message="This action cannot be undone. Your deal will be permanently removed."
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setConfirmId(null)}
        />
      )}

      <div className="max-w-[1440px] mx-auto">

        {/* NOTIFICATION */}
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-6xl mb-6">
            <span
              style={{
                fontFamily: "Pacifico",
                color: "#FF8FA3",
                textShadow: "0 0 35px rgba(255,143,163,0.7)",
              }}
            >
              My
            </span>
            <span className="text-white" style={{ fontFamily: "Fredoka" }}>
              {" "}Deals
            </span>
          </h1>
          <button
            onClick={() => navigate("/deals")}
            className="px-8 py-4 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
          >
            Create New Deal
          </button>
        </div>

        {/* EMPTY */}
        {myDeals.length === 0 ? (
          <div className="text-center py-20 text-white text-2xl">
            You have not created any deals yet
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myDeals.map((deal) => (
              <motion.div
                key={deal.id}
                whileHover={{ scale: 1.02 }}
                className="rounded-[28px] overflow-hidden p-6 bg-gradient-to-br from-[#F6C1CC] to-[#C8B6E2] shadow-xl"
              >
                {editingId !== deal.id ? (

                  <>
                    <Link to={`/deals/${deal.id}`}>

                      {/* IMAGE */}
                      {deal.images?.length > 0 && getImageSrc(deal.images[0]) && (
                        <img
                          src={getImageSrc(deal.images[0])}
                          alt={deal.title}
                          className="w-full h-[240px] object-cover rounded-[20px] mb-4"
                        />
                      )}

                      <h2
                        className="text-3xl mb-4"
                        style={{ fontFamily: "Pacifico", color: "#FFF6F8" }}
                      >
                        {deal.title}
                      </h2>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {deal.products.map((product) => (
                          <div
                            key={product.id}
                            className="px-3 py-2 rounded-full bg-white text-[#2E2A4A]"
                          >
                            {product.name}
                          </div>
                        ))}
                      </div>

                      <div className="text-white">
                        <p>Original: Rs. {deal.originalPrice}</p>
                        <p className="text-2xl">Deal: Rs. {deal.discountedPrice}</p>
                        <p className="mt-2 text-white/80">
                          Valid Until: {deal.validDate}
                        </p>
                      </div>

                    </Link>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => handleEdit(deal)}
                        className="flex-1 py-3 rounded-full bg-white text-[#2E2A4A]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmId(deal.id)}
                        className="flex-1 py-3 rounded-full bg-[#FF8FA3] text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </>

                ) : (

                  <div className="bg-white rounded-[24px] p-6">

                    {/* EDIT TITLE */}
                    <label className="block text-[#7A6C9D] mb-1 text-sm">Title</label>
                    <input
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-[16px] mb-4 bg-[#F6C1CC]/20"
                    />

                    {/* EDIT DISCOUNTED PRICE */}
                    <label className="block text-[#7A6C9D] mb-1 text-sm">Discounted Price</label>
                    <div className="flex items-center gap-3 mb-4">
                      <button
                        type="button"
                        onClick={() => {
                          const current = Number(editForm.discountedPrice) || 0;
                          if (current <= 1) return;
                          setEditForm({ ...editForm, discountedPrice: current - 1 });
                        }}
                        className="w-11 h-11 flex items-center justify-center rounded-full bg-[#F6C1CC]/40 text-[#7A6C9D] text-xl font-bold hover:bg-[#F6C1CC]/70 transition-all"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={editForm.discountedPrice}
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (raw === "") {
                            setEditForm({ ...editForm, discountedPrice: "" });
                            return;
                          }
                          const value = Number(raw);
                          if (value < 1) return;
                          setEditForm({ ...editForm, discountedPrice: value });
                        }}
                        className="flex-1 px-4 py-3 rounded-[16px] bg-[#F6C1CC]/20 text-center text-[#2E2A4A]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const current = Number(editForm.discountedPrice) || 0;
                          setEditForm({ ...editForm, discountedPrice: current + 1 });
                        }}
                        className="w-11 h-11 flex items-center justify-center rounded-full bg-[#F6C1CC]/40 text-[#7A6C9D] text-xl font-bold hover:bg-[#F6C1CC]/70 transition-all"
                      >
                        +
                      </button>
                    </div>

                    {/* EDIT DATE — blocks today and past */}
                    <label className="block text-[#7A6C9D] mb-1 text-sm">Valid Until</label>
                    <input
                      type="date"
                      min={getTomorrowDate()}
                      value={editForm.validDate}
                      onChange={(e) => {
                        const selected = e.target.value;
                        if (selected < getTomorrowDate()) {
                          showNotification(
                            "Please select a future date (not today or earlier).",
                            "error"
                          );
                          return;
                        }
                        setEditForm({ ...editForm, validDate: selected });
                      }}
                      className="w-full px-4 py-3 rounded-[16px] mb-6 bg-[#F6C1CC]/20"
                    />

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleSave(deal.id)}
                        className="flex-1 py-3 rounded-full bg-[#FF8FA3] text-white"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 py-3 rounded-full bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>

                  </div>

                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}