import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Modal({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/50 backdrop-blur-md"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="w-full max-w-[440px] rounded-[24px] bg-[#FFF6F8] p-10 shadow-2xl border-2 border-[#FF8FA3]/40 text-center"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Account() {
  const { user, role, updateUser, validateEmail, logout } = useAuth();
  const { products, deleteProduct } = useProducts();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: role,
  });
  const [errors, setErrors] = useState({});

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "" });

  const inputStyle =
    "w-full px-4 py-3 rounded-[16px] bg-[#F6C1CC]/20 border-2 border-[#7A6C9D]/20 outline-none focus:ring-0 text-[#2E2A4A] placeholder:text-[#7A6C9D]";

  const validateField = (field, value) => {
    if (field === "email") {
      if (!value) return "";
      if (!value.includes("@")) return "Email must include '@'";
      if (!validateEmail(value)) return "Invalid email format";
    }
    return "";
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  };

  const handleSave = () => {
    const updated = {
      name: form.name || user.name,
      email: form.email || user.email,
      role: form.role,
    };
    if (updated.role !== user.role) {
      setPendingUpdate(updated);
      setShowConfirmModal(true);
      return;
    }
    updateUser(updated);
    setIsEditing(false);
  };

  const confirmRoleChange = () => {
    const switchingToBuyer = pendingUpdate?.role === "buyer";
    if (switchingToBuyer && (user.role === "seller" || user.role === "both")) {
      const myProducts = products.filter((p) => p.sellerId === user.id);
      myProducts.forEach((p) => deleteProduct(p.id));
    }
    updateUser(pendingUpdate);
    setShowConfirmModal(false);
    setIsEditing(false);
  };

  const handleDeleteAccount = () => {
    logout();
    navigate("/");
  };

  const validatePassword = (value) => {
    if (!value) return "New password required";
    if (!/[A-Z]/.test(value)) return "Must include at least one capital letter";
    if (!/[^A-Za-z0-9]/.test(value)) return "Must include at least one symbol";
    if ((value.match(/\d/g) || []).length < 2) return "Must include at least two numbers";
    return "";
  };

  const handlePasswordChange = () => {
    let err = {};
    if (passwordForm.oldPassword !== user.password) err.oldPassword = "Incorrect password";
    const newPassError = validatePassword(passwordForm.newPassword);
    if (newPassError) err.newPassword = newPassError;
    if (Object.keys(err).length) { setErrors(err); return; }
    updateUser({ password: passwordForm.newPassword });
    setShowPasswordModal(false);
    setPasswordForm({ oldPassword: "", newPassword: "" });
    setErrors({});
  };

  const pendingRole = pendingUpdate?.role;
  const switchingToBuyer = pendingRole === "buyer" && (user?.role === "seller" || user?.role === "both");
  const onlySellerSwitchingToBuyer = pendingRole === "buyer" && user?.role === "seller";

  const isBuyer = role === "buyer" || role === "both";
  const isSeller = role === "seller" || role === "both";

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[800px] mx-auto">

        <div className="text-center mb-12">
          <h1 className="text-5xl lg:text-6xl mb-4">
            <span style={{ color: "#FFF6F8" }}>Your </span>
            <span style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 35px rgba(255,143,163,0.7)" }}>
              Account
            </span>
          </h1>
        </div>

        {!isEditing ? (
          <div className="rounded-[24px] bg-[#FFF6F8]/90 p-8 shadow-2xl space-y-6">

            <div>
              <p className="text-[#7A6C9D]">Name</p>
              <h2 className="text-2xl text-[#2E2A4A]">{user?.name}</h2>
            </div>
            <div>
              <p className="text-[#7A6C9D]">Email</p>
              <h2 className="text-2xl text-[#2E2A4A]">{user?.email}</h2>
            </div>
            <div>
              <p className="text-[#7A6C9D]">Account Type</p>
              <h2 className="text-2xl text-[#FF8FA3] capitalize">{role}</h2>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="w-full py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition"
            >
              Edit Account
            </button>

            <div className="flex flex-col gap-3">

              {/* 🔥 My Orders — buyers and "both" */}
              {isBuyer && (
                <button onClick={() => navigate("/my-orders")} className="w-full py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all">
                  📦 My Orders
                </button>
              )}

              {/* 🔥 My Sales — sellers and "both" */}
              {isSeller && (
                <button onClick={() => navigate("/my-sales")} className="w-full py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all">
                  💰 My Sales
                </button>
              )}

              <button onClick={() => navigate("/wishlist")} className="w-full py-3 rounded-full bg-[#FF8FA3]/70 text-white hover:scale-105 transition-all">
                ❤️ My Wishlist
              </button>
              <button onClick={() => navigate("/my-activity")} className="w-full py-3 rounded-full bg-[#FF8FA3]/70 text-white hover:scale-105 transition-all">
                📊 My Activity
              </button>

              {isSeller && (
                <>
                  <button onClick={() => navigate("/my-products")} className="w-full py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all">My Products</button>
                  <button onClick={() => navigate("/my-deals")} className="w-full py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all">My Deals</button>
                </>
              )}

              <button onClick={() => navigate("/my-tutorials")} className="w-full py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all">My Tutorials</button>
              <button onClick={() => navigate("/my-events")} className="w-full py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all">My Events</button>
              <button onClick={() => navigate("/my-discussions")} className="w-full py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all">My Discussions</button>

              <button onClick={() => setShowDeleteModal(true)} className="w-full py-3 mt-4 rounded-full border-2 border-red-300 text-red-400 hover:bg-red-50 hover:scale-105 transition-all">
                Delete Account
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-[24px] bg-[#FFF6F8]/90 p-8 shadow-2xl space-y-6">
            <input placeholder={user?.name} value={form.name} onChange={(e) => handleChange("name", e.target.value)} className={inputStyle} />

            <div>
              <input placeholder={user?.email} value={form.email} onChange={(e) => handleChange("email", e.target.value)} className={inputStyle} />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputStyle}>
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
              <option value="both">Both</option>
            </select>

            <button onClick={() => setShowPasswordModal(true)} className="px-6 py-2.5 rounded-full bg-[#C8B6E2] text-[#2E2A4A]">
              Change Password
            </button>

            <button onClick={handleSave} className="w-full py-3 rounded-full bg-[#FF8FA3] text-white">
              Save Changes
            </button>

            <button onClick={() => setIsEditing(false)} className="w-full py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A]">
              Cancel
            </button>
          </div>
        )}
      </div>

      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)}>
        <h2 style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }} className="text-2xl mb-6">Change Password</h2>
        <div className="space-y-4 text-left">
          <div>
            <input placeholder="Old Password" type="password" value={passwordForm.oldPassword} onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })} className={inputStyle} />
            {errors.oldPassword && <p className="text-red-500 text-sm mt-1">{errors.oldPassword}</p>}
          </div>
          <div>
            <input placeholder="New Password" type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className={inputStyle} />
            {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => setShowPasswordModal(false)} className="flex-1 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A]">Cancel</button>
          <button onClick={handlePasswordChange} className="flex-1 py-3 rounded-full bg-[#FF8FA3] text-white">Confirm</button>
        </div>
      </Modal>

      <Modal isOpen={showConfirmModal} onClose={() => { setShowConfirmModal(false); setPendingUpdate(null); }}>
        <h2 style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 20px rgba(255,143,163,0.5)" }} className="text-2xl mb-4">Change Account Type?</h2>
        <p className="text-[#2E2A4A] mb-4 leading-relaxed">Switch to <span className="text-[#FF8FA3] font-medium capitalize">{pendingRole}</span>?</p>
        {switchingToBuyer && (
          <div className="rounded-[14px] bg-red-50 border border-red-200 p-4 mb-4 text-left">
            <p className="text-red-500 text-sm font-medium mb-1">⚠️ Warning</p>
            <p className="text-red-400 text-sm leading-relaxed">Switching to Buyer will permanently delete all your uploaded products. This cannot be undone.</p>
          </div>
        )}
        {onlySellerSwitchingToBuyer && (
          <div className="rounded-[14px] bg-[#EDE8F9] border border-[#C8B6E2] p-4 mb-4 text-left">
            <p className="text-[#4A3A7A] text-sm font-medium mb-1">💡 Tip</p>
            <p className="text-[#7A6C9D] text-sm leading-relaxed">Consider switching to <span className="text-[#FF8FA3] font-medium">Both</span> instead — you'll keep your products and gain buying access too.</p>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={() => { setShowConfirmModal(false); setPendingUpdate(null); }} className="flex-1 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A]">Cancel</button>
          <button onClick={confirmRoleChange} className="flex-1 py-3 rounded-full bg-[#FF8FA3] text-white">Yes, Switch</button>
        </div>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div className="text-5xl mb-4">🗑️</div>
        <h2 style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 20px rgba(255,143,163,0.5)" }} className="text-2xl mb-4">Delete Account?</h2>
        <p className="text-[#2E2A4A] mb-4 leading-relaxed">This will permanently delete your account and all your data. This action <span className="font-semibold text-red-500">cannot be undone</span>.</p>
        <div className="flex gap-3">
          <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A]">Cancel</button>
          <button onClick={handleDeleteAccount} className="flex-1 py-3 rounded-full bg-red-400 text-white">Delete</button>
        </div>
      </Modal>
    </div>
  );
}