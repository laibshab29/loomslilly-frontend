// src/pages/Account.jsx
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Smartphone, Check, User } from "lucide-react";
import { supabase } from "../lib/supabase";
import { AVATARS, AVATAR_URLS, resolveAvatar } from "../lib/avatars";

function Modal({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/50 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
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

// ─── AVATAR CHANGE MODAL ─────────────────────────────────────
function AvatarModal({ isOpen, onClose, currentAvatar, onSave }) {
  const [selected, setSelected] = useState(currentAvatar || null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(selected);
    setSaving(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/50 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="w-full max-w-[520px] rounded-[24px] bg-[#FFF6F8] p-8 shadow-2xl border-2 border-[#FF8FA3]/40"
          >
            <h2
              style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }}
              className="text-2xl mb-2 text-center"
            >
              Change Avatar
            </h2>
            <p className="text-[#7A6C9D] text-sm text-center mb-6">
              Pick a new avatar to display on your profile.
            </p>

            <div className="grid grid-cols-4 gap-3 mb-6">
              {AVATARS.map((avatar) => {
                const isChosen = selected === avatar.id;
                return (
                  <motion.button
                    key={avatar.id}
                    type="button"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelected(avatar.id)}
                    className={`relative rounded-[16px] overflow-hidden border-4 transition-all duration-200 aspect-square
                      ${isChosen
                        ? "border-[#FF8FA3] shadow-lg shadow-[#FF8FA3]/30"
                        : "border-transparent hover:border-[#C8B6E2]"
                      }`}
                  >
                    <img
                      src={AVATAR_URLS[avatar.id]}
                      alt={avatar.label}
                      className="w-full h-full object-cover"
                    />
                    {isChosen && (
                      <div className="absolute inset-0 bg-[#FF8FA3]/20 flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-[#FF8FA3] flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !selected}
                className="flex-1 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Avatar"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── PHONE VALIDATION ─────────────────────────────────────────
const validatePhone = (value) => {
  if (!value) return "";
  if (/[^+\d]/.test(value)) return "Only digits and a leading + are allowed.";
  if (value.indexOf("+") > 0) return "The + symbol can only appear at the start.";
  const digits = value.replace("+", "");
  if (digits.length < 9) return "Phone number is too short (minimum 9 digits).";
  if (digits.length > 12) return "Phone number is too long (maximum 12 digits).";
  if (value.startsWith("+") && !value.startsWith("+92"))
    return "International format must start with +92.";
  if (!value.startsWith("+") && !digits.startsWith("0"))
    return "Local numbers must start with 0 (e.g. 03001234567).";
  return "";
};

export function Account() {
  const { user, role, updateUser, validateEmail, logout } = useAuth();
  const { products, fetchProducts } = useProducts();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    contactEmail: user?.contactEmail || "",
    jazzcashPhone: user?.jazzcashPhone || "",
    easypaisaPhone: user?.easypaisaPhone || "",
    role: role,
  });
  const [errors, setErrors] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [roleChanging, setRoleChanging] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [emailVerifySent, setEmailVerifySent] = useState(false);
  const [emailChangeError, setEmailChangeError] = useState("");
  const [newEmailInput, setNewEmailInput] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const inputStyle =
    "w-full px-4 py-3 rounded-[16px] bg-[#F6C1CC]/20 border-2 border-[#7A6C9D]/20 outline-none focus:ring-0 text-[#2E2A4A] placeholder:text-[#7A6C9D]";

  const isBuyer = role === "buyer" || role === "both";
  const isSeller = role === "seller" || role === "both";

  const switchingToSeller =
    (form.role === "seller" || form.role === "both") && user?.role === "buyer";

  const avatarSrc = resolveAvatar(user?.avatarUrl || user?.avatar_url);

  // ─── SAVE AVATAR ─────────────────────────────────────────────
  const handleAvatarSave = async (avatarId) => {
    if (!avatarId || !user?.id) return;
    // Update in Supabase
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarId })
      .eq("id", user.id);

    if (error) {
      console.error("avatar update error:", error.message);
      return;
    }
    // Update local user state via AuthContext
    await updateUser({ avatarUrl: avatarId });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const validateField = (field, value) => {
    if (field === "name") {
      if (!value) return "Name is required";
      if (/\d/.test(value)) return "Name cannot contain numbers";
      return "";
    }
    if (field === "email") {
      if (!value) return "";
      if (!value.includes("@")) return "Email must include '@'";
      if (!validateEmail(value)) return "Invalid email format";
      return "";
    }
    if (field === "phone") return validatePhone(value);
    if (field === "contactEmail") {
      if (!value) return "";
      if (!value.includes("@")) return "Must contain @";
      return "";
    }
    if (field === "jazzcashPhone" || field === "easypaisaPhone")
      return validatePhone(value);
    return "";
  };

  const handleChange = (field, value) => {
    if (field === "name" && /\d/.test(value)) return;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  };

  const handleSave = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = "Name is required";
    else if (/\d/.test(form.name)) newErrors.name = "Name cannot contain numbers";
    const phoneErr = validatePhone(form.phone);
    if (phoneErr) newErrors.phone = phoneErr;
    if (switchingToSeller) {
      const jcErr = validatePhone(form.jazzcashPhone);
      const epErr = validatePhone(form.easypaisaPhone);
      if (form.jazzcashPhone && jcErr) newErrors.jazzcashPhone = jcErr;
      if (form.easypaisaPhone && epErr) newErrors.easypaisaPhone = epErr;
      if (!form.jazzcashPhone && !form.easypaisaPhone) {
        newErrors.walletRequired =
          "Please provide at least one wallet number so buyers can pay you.";
      }
    }
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    const updated = {
      name: form.name,
      phone: form.phone,
      contactEmail: form.contactEmail,
      jazzcashPhone: form.jazzcashPhone,
      easypaisaPhone: form.easypaisaPhone,
      role: form.role,
    };

    if (updated.role !== user.role) {
      setPendingUpdate(updated);
      setShowConfirmModal(true);
      return;
    }

    updateUser(updated);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const confirmRoleChange = async () => {
    const switchingToBuyer =
      pendingUpdate?.role === "buyer" &&
      (user.role === "seller" || user.role === "both");

    setRoleChanging(true);
    setShowConfirmModal(false);

    if (switchingToBuyer) {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("seller_id", user.id);

      if (error) {
        console.error("confirmRoleChange — delete products error:", error.message);
        setRoleChanging(false);
        return;
      }
      await fetchProducts();
    }

    await updateUser(pendingUpdate);
    setPendingUpdate(null);
    setIsEditing(false);
    setRoleChanging(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleEmailChangeRequest = async () => {
    setEmailChangeError("");
    if (!newEmailInput || !newEmailInput.includes("@")) {
      setEmailChangeError("Please enter a valid email address.");
      return;
    }
    if (newEmailInput === user.email) {
      setEmailChangeError("This is already your current email.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ email: newEmailInput });
    if (error) { setEmailChangeError(error.message); return; }
    setEmailVerifySent(true);
  };

  const validateNewPassword = (value) => {
    if (!value) return "New password required";
    if (!/[A-Z]/.test(value)) return "Must include at least one capital letter";
    if (!/[^A-Za-z0-9]/.test(value)) return "Must include at least one symbol";
    if ((value.match(/\d/g) || []).length < 2)
      return "Must include at least two numbers";
    return "";
  };

  const handlePasswordChange = async () => {
    setPasswordError("");
    const err = validateNewPassword(passwordForm.newPassword);
    if (err) { setPasswordError(err); return; }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }
    const { error } = await supabase.auth.updateUser({
      password: passwordForm.newPassword,
    });
    if (error) { setPasswordError(error.message); return; }
    setShowPasswordModal(false);
    setPasswordForm({ newPassword: "", confirmPassword: "" });
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await supabase.from("products").delete().eq("seller_id", user.id);
      await supabase.from("deals").delete().eq("seller_id", user.id);
      await supabase.from("profiles").delete().eq("id", user.id);
      try { await supabase.rpc("delete_user"); } catch {}
      await logout();
    } catch (err) {
      console.error("handleDeleteAccount error:", err);
    } finally {
      setDeleting(false);
      navigate("/");
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    navigate("/");
    await logout();
  };

  const pendingRole = pendingUpdate?.role;
  const switchingToBuyerConfirm =
    pendingRole === "buyer" &&
    (user?.role === "seller" || user?.role === "both");
  const onlySellerSwitchingToBuyer =
    pendingRole === "buyer" && user?.role === "seller";

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[800px] mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl lg:text-6xl mb-4">
            <span style={{ color: "#FFF6F8" }}>Your </span>
            <span
              style={{
                fontFamily: "Pacifico, cursive",
                color: "#FF8FA3",
                textShadow: "0 0 35px rgba(255,143,163,0.7)",
              }}
            >
              Account
            </span>
          </h1>
        </div>

        {roleChanging && (
          <div className="mb-4 rounded-[16px] bg-[#EDE8F9] border border-[#C8B6E2] p-4 text-center text-[#4A3A7A] text-sm">
            ⏳ Updating your account...
          </div>
        )}

        {saveSuccess && (
          <div className="mb-4 rounded-[16px] bg-green-50 border border-green-200 p-4 text-center text-green-700 text-sm">
            ✅ Changes saved successfully!
          </div>
        )}

        {!isEditing ? (
          <div className="rounded-[24px] bg-[#FFF6F8]/90 p-8 shadow-2xl space-y-6">

            {/* ─── AVATAR DISPLAY ─── */}
            <div className="flex flex-col items-center gap-3 pb-4 border-b border-[#F6C1CC]/40">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#FF8FA3]/40 shadow-lg bg-gradient-to-br from-[#F6C1CC] to-[#C8B6E2] flex items-center justify-center">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt="Your avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-white" />
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowAvatarModal(true)}
                className="px-5 py-2 rounded-full bg-[#F6C1CC]/40 text-[#7A6C9D] text-sm hover:bg-[#FF8FA3] hover:text-white transition-all hover:scale-105"
              >
                {avatarSrc ? "Change Avatar" : "Pick an Avatar"}
              </button>
            </div>

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
            {user?.phone && (
              <div>
                <p className="text-[#7A6C9D]">Phone</p>
                <h2 className="text-xl text-[#2E2A4A]">{user.phone}</h2>
              </div>
            )}
            {isSeller && (user?.jazzcashPhone || user?.easypaisaPhone) && (
              <div>
                <p className="text-[#7A6C9D] mb-1">Wallet Numbers</p>
                {user.jazzcashPhone && (
                  <p className="text-[#2E2A4A] text-sm">
                    JazzCash: {user.jazzcashPhone}
                  </p>
                )}
                {user.easypaisaPhone && (
                  <p className="text-[#2E2A4A] text-sm">
                    EasyPaisa: {user.easypaisaPhone}
                  </p>
                )}
              </div>
            )}

            <button
              onClick={() => {
                setForm({
                  name: user?.name || "",
                  email: user?.email || "",
                  phone: user?.phone || "",
                  contactEmail: user?.contactEmail || "",
                  jazzcashPhone: user?.jazzcashPhone || "",
                  easypaisaPhone: user?.easypaisaPhone || "",
                  role: role,
                });
                setIsEditing(true);
              }}
              className="w-full py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition"
            >
              Edit Account
            </button>

            <div className="flex flex-col gap-3">
              {isBuyer && (
                <button
                  onClick={() => navigate("/my-orders")}
                  className="w-full py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
                >
                  📦 My Orders
                </button>
              )}
              {isSeller && (
                <button
                  onClick={() => navigate("/my-sales")}
                  className="w-full py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
                >
                  💰 My Sales
                </button>
              )}
              <button
                onClick={() => navigate("/wishlist")}
                className="w-full py-3 rounded-full bg-[#FF8FA3]/70 text-white hover:scale-105 transition-all"
              >
                ❤️ My Wishlist
              </button>
              <button
                onClick={() => navigate("/my-activity")}
                className="w-full py-3 rounded-full bg-[#FF8FA3]/70 text-white hover:scale-105 transition-all"
              >
                📊 My Activity
              </button>
              {isSeller && (
                <>
                  <button
                    onClick={() => navigate("/my-products")}
                    className="w-full py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all"
                  >
                    My Products
                  </button>
                  <button
                    onClick={() => navigate("/my-deals")}
                    className="w-full py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all"
                  >
                    My Deals
                  </button>
                </>
              )}
              <button
                onClick={() => navigate("/my-tutorials")}
                className="w-full py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all"
              >
                My Tutorials
              </button>
              <button
                onClick={() => navigate("/my-events")}
                className="w-full py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all"
              >
                My Events
              </button>
              <button
                onClick={() => navigate("/my-discussions")}
                className="w-full py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all"
              >
                My Discussions
              </button>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full py-3 mt-2 rounded-full bg-[#7A6C9D] text-white hover:scale-105 transition-all disabled:opacity-60"
              >
                {loggingOut ? "Logging out..." : "Log Out"}
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full py-3 mt-2 rounded-full border-2 border-red-300 text-red-400 hover:bg-red-50 hover:scale-105 transition-all"
              >
                Delete Account
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-[24px] bg-[#FFF6F8]/90 p-8 shadow-2xl space-y-5">
            <div>
              <label className="block text-[#7A6C9D] text-xs mb-1">
                Full Name *
              </label>
              <input
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={inputStyle + (errors.name ? " border-red-400" : "")}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-[#7A6C9D] text-xs mb-1">Email</label>
              <div className="flex gap-2 items-center">
                <input
                  value={user?.email}
                  readOnly
                  className={
                    inputStyle +
                    " bg-gray-100 text-gray-400 cursor-not-allowed flex-1"
                  }
                />
                <button
                  type="button"
                  onClick={() => {
                    setNewEmailInput("");
                    setEmailVerifySent(false);
                    setEmailChangeError("");
                    setShowEmailModal(true);
                  }}
                  className="px-4 py-3 rounded-[16px] bg-[#FF8FA3] text-white text-sm whitespace-nowrap hover:scale-105 transition-all"
                >
                  Change
                </button>
              </div>
              <p className="text-[#C8B6E2] text-xs mt-1">
                Email changes require verification of your new address.
              </p>
            </div>

            <div>
              <label className="block text-[#7A6C9D] text-xs mb-1">Phone</label>
              <input
                placeholder="e.g. 03001234567"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className={inputStyle + (errors.phone ? " border-red-400" : "")}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-[#7A6C9D] text-xs mb-1">
                Contact Email (optional)
              </label>
              <input
                placeholder="Visible to buyers for contact"
                value={form.contactEmail}
                onChange={(e) => handleChange("contactEmail", e.target.value)}
                className={
                  inputStyle + (errors.contactEmail ? " border-red-400" : "")
                }
              />
              {errors.contactEmail && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.contactEmail}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[#7A6C9D] text-xs mb-1">
                Account Type
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className={inputStyle}
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="both">Both</option>
              </select>
            </div>

            {(form.role === "seller" || form.role === "both") && (
              <div className="rounded-[16px] bg-[#EDE8F9]/40 border-2 border-[#C8B6E2]/40 p-5 space-y-4">
                <div className="flex items-start gap-2">
                  <Smartphone className="w-5 h-5 text-[#7A6C9D] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[#7A6C9D] text-sm font-medium">
                      Seller Wallet Info
                    </p>
                    <p className="text-xs text-[#C8B6E2] mt-1">
                      Buyers see these numbers when paying with JazzCash or
                      EasyPaisa.
                    </p>
                  </div>
                </div>
                {errors.walletRequired && (
                  <div className="rounded-[12px] bg-red-50 border border-red-200 p-3">
                    <p className="text-red-500 text-sm">{errors.walletRequired}</p>
                  </div>
                )}
                <div>
                  <label className="block text-[#7A6C9D] text-xs mb-1">
                    JazzCash Phone
                  </label>
                  <input
                    placeholder="e.g. 03001234567"
                    value={form.jazzcashPhone}
                    onChange={(e) =>
                      handleChange("jazzcashPhone", e.target.value)
                    }
                    className={
                      inputStyle +
                      (errors.jazzcashPhone ? " border-red-400" : "")
                    }
                  />
                  {errors.jazzcashPhone && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.jazzcashPhone}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[#7A6C9D] text-xs mb-1">
                    EasyPaisa Phone
                  </label>
                  <input
                    placeholder="e.g. 03001234567"
                    value={form.easypaisaPhone}
                    onChange={(e) =>
                      handleChange("easypaisaPhone", e.target.value)
                    }
                    className={
                      inputStyle +
                      (errors.easypaisaPhone ? " border-red-400" : "")
                    }
                  />
                  {errors.easypaisaPhone && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.easypaisaPhone}
                    </p>
                  )}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="px-6 py-2.5 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all"
            >
              Change Password
            </button>

            <button
              onClick={handleSave}
              className="w-full py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
            >
              Save Changes
            </button>

            <button
              onClick={() => setIsEditing(false)}
              className="w-full py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* AVATAR MODAL */}
      <AvatarModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        currentAvatar={user?.avatarUrl || user?.avatar_url}
        onSave={handleAvatarSave}
      />

      {/* EMAIL MODAL */}
      <Modal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
      >
        {!emailVerifySent ? (
          <>
            <h2
              style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }}
              className="text-2xl mb-2"
            >
              Change Email
            </h2>
            <p className="text-[#7A6C9D] text-sm mb-5">
              Enter your new email. We'll send a verification link to it before
              making the change.
            </p>
            <input
              type="email"
              placeholder="New email address"
              value={newEmailInput}
              onChange={(e) => {
                setNewEmailInput(e.target.value);
                setEmailChangeError("");
              }}
              className={inputStyle + " text-left mb-3"}
            />
            {emailChangeError && (
              <p className="text-red-500 text-sm mb-3">{emailChangeError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowEmailModal(false)}
                className="flex-1 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A]"
              >
                Cancel
              </button>
              <button
                onClick={handleEmailChangeRequest}
                className="flex-1 py-3 rounded-full bg-[#FF8FA3] text-white"
              >
                Send Link
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-5xl mb-4">📧</div>
            <h2
              style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }}
              className="text-2xl mb-3"
            >
              Check Your Email
            </h2>
            <p className="text-[#7A6C9D] text-sm mb-5">
              A verification link has been sent to{" "}
              <strong>{newEmailInput}</strong>.
            </p>
            <button
              onClick={() => {
                setShowEmailModal(false);
                setEmailVerifySent(false);
              }}
              className="w-full py-3 rounded-full bg-[#FF8FA3] text-white"
            >
              Done
            </button>
          </>
        )}
      </Modal>

      {/* PASSWORD MODAL */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordError("");
        }}
      >
        <h2
          style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }}
          className="text-2xl mb-6"
        >
          Change Password
        </h2>
        <div className="space-y-4 text-left">
          <input
            placeholder="New Password"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, newPassword: e.target.value })
            }
            className={inputStyle}
          />
          <input
            placeholder="Confirm New Password"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) =>
              setPasswordForm({
                ...passwordForm,
                confirmPassword: e.target.value,
              })
            }
            className={inputStyle}
          />
          {passwordError && (
            <p className="text-red-500 text-sm">{passwordError}</p>
          )}
          <p className="text-[#C8B6E2] text-xs">
            Must have 1 capital letter, 1 symbol, and 2 numbers.
          </p>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => {
              setShowPasswordModal(false);
              setPasswordError("");
            }}
            className="flex-1 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A]"
          >
            Cancel
          </button>
          <button
            onClick={handlePasswordChange}
            className="flex-1 py-3 rounded-full bg-[#FF8FA3] text-white"
          >
            Confirm
          </button>
        </div>
      </Modal>

      {/* ROLE CHANGE CONFIRM MODAL */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setPendingUpdate(null);
        }}
      >
        <h2
          style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }}
          className="text-2xl mb-4"
        >
          Change Account Type?
        </h2>
        <p className="text-[#2E2A4A] mb-4 leading-relaxed">
          Switch to{" "}
          <span className="text-[#FF8FA3] font-medium capitalize">
            {pendingRole}
          </span>
          ?
        </p>
        {switchingToBuyerConfirm && (
          <div className="rounded-[14px] bg-red-50 border border-red-200 p-4 mb-4 text-left">
            <p className="text-red-500 text-sm font-medium mb-1">⚠️ Warning</p>
            <p className="text-red-400 text-sm leading-relaxed">
              Switching to Buyer will permanently delete all your uploaded
              products. This cannot be undone.
            </p>
          </div>
        )}
        {onlySellerSwitchingToBuyer && (
          <div className="rounded-[14px] bg-[#EDE8F9] border border-[#C8B6E2] p-4 mb-4 text-left">
            <p className="text-[#4A3A7A] text-sm font-medium mb-1">💡 Tip</p>
            <p className="text-[#7A6C9D] text-sm leading-relaxed">
              Consider switching to{" "}
              <span className="text-[#FF8FA3] font-medium">Both</span> instead.
            </p>
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowConfirmModal(false);
              setPendingUpdate(null);
            }}
            className="flex-1 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A]"
          >
            Cancel
          </button>
          <button
            onClick={confirmRoleChange}
            className="flex-1 py-3 rounded-full bg-[#FF8FA3] text-white"
          >
            Yes, Switch
          </button>
        </div>
      </Modal>

      {/* DELETE ACCOUNT MODAL */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !deleting && setShowDeleteModal(false)}
      >
        <div className="text-5xl mb-4">🗑️</div>
        <h2
          style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }}
          className="text-2xl mb-4"
        >
          Delete Account?
        </h2>
        <p className="text-[#2E2A4A] mb-4 leading-relaxed">
          This will permanently delete your account, all your products, and all
          your deals. This action{" "}
          <span className="font-semibold text-red-500">cannot be undone</span>.
        </p>
        {deleting && (
          <p className="text-[#7A6C9D] text-sm mb-4">
            Deleting your account...
          </p>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            disabled={deleting}
            className="flex-1 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="flex-1 py-3 rounded-full bg-red-400 text-white disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );
}