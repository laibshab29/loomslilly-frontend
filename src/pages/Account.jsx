import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function Account() {
  const {
    user,
    role,
    updateUser,
    validateEmail,
  } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: role,
  });

  const [errors, setErrors] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const inputStyle =
    "w-full px-4 py-3 rounded-[16px] bg-[#F6C1CC]/20 border-2 border-[#7A6C9D]/20 outline-none focus:ring-0 text-[#2E2A4A]";

  const validateField = (field, value) => {
    let error = "";
    if (field === "email") {
      if (!value) error = "";
      else if (!value.includes("@")) error = "Email must include '@'";
      else if (!validateEmail(value)) error = "Invalid email format";
    }
    return error;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    const err = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(null);

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

  const confirmChange = () => {
    updateUser(pendingUpdate);
    setShowConfirmModal(false);
    setIsEditing(false);
  };

  const cancelChange = () => {
    setShowConfirmModal(false);
    setPendingUpdate(null);
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
    if (passwordForm.oldPassword !== user.password) {
      err.oldPassword = "Incorrect password";
    }
    const newPassError = validatePassword(passwordForm.newPassword);
    if (newPassError) err.newPassword = newPassError;
    if (Object.keys(err).length) {
      setErrors(err);
      return;
    }
    updateUser({ password: passwordForm.newPassword });
    setShowPasswordModal(false);
    setPasswordForm({ oldPassword: "", newPassword: "" });
    setErrors({});
  };

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[800px] mx-auto">

        {/* HEADER */}
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

        {/* VIEW MODE */}
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

            {/* EDIT ACCOUNT — pink pill */}
            <button
              onClick={() => setIsEditing(true)}
              className="w-full py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition"
            >
              Edit Account
            </button>

            {/* 🔥 MY- PAGE BUTTONS — purple pills matching Edit Account style */}
            <div className="flex flex-col gap-3 mt-4">

              {(role === "seller" || role === "both") && (
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

            </div>
          </div>

        ) : (

          /* EDIT MODE */
          <div className="rounded-[24px] bg-[#FFF6F8]/90 p-8 shadow-2xl space-y-6">

            <input
              placeholder={user?.name}
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={inputStyle}
            />

            <div>
              <input
                placeholder={user?.email}
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={inputStyle}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className={inputStyle}
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
              <option value="both">Both</option>
            </select>

            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-6 py-2.5 rounded-full bg-[#C8B6E2] text-[#2E2A4A]"
            >
              Change Password
            </button>

            <button
              onClick={handleSave}
              className="w-full py-3 rounded-full bg-[#FF8FA3] text-white"
            >
              Save Changes
            </button>

          </div>
        )}

        {/* PASSWORD MODAL */}
        {showPasswordModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-[#FFF6F8] p-6 rounded-2xl w-[350px] space-y-4">
              <h3 className="text-xl text-center text-[#2E2A4A]">Change Password</h3>

              <input
                placeholder="Old Password"
                value={passwordForm.oldPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
                }
                className={inputStyle}
              />
              {errors.oldPassword && (
                <p className="text-red-500 text-sm">{errors.oldPassword}</p>
              )}

              <input
                placeholder="New Password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                className={inputStyle}
              />
              {errors.newPassword && (
                <p className="text-red-500 text-sm">{errors.newPassword}</p>
              )}

              <button
                onClick={handlePasswordChange}
                className="w-full bg-[#FF8FA3] text-white py-2 rounded-full"
              >
                Confirm
              </button>

              <button
                onClick={() => setShowPasswordModal(false)}
                className="w-full text-[#7A6C9D]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* CONFIRM ROLE CHANGE MODAL */}
        {showConfirmModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-[#FFF6F8] p-6 rounded-2xl w-[350px] text-center space-y-4">
              <h3 className="text-xl text-[#2E2A4A]">Change Account Type?</h3>
              <p className="text-[#7A6C9D]">
                Are you sure you want to update your account type?
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={confirmChange}
                  className="px-6 py-2 rounded-full bg-[#FF8FA3] text-white"
                >
                  Yes
                </button>
                <button
                  onClick={cancelChange}
                  className="px-6 py-2 rounded-full bg-[#C8B6E2] text-[#2E2A4A]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}