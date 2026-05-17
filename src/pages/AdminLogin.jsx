import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import { Eye, EyeOff } from "lucide-react";

const inputStyle =
  "w-full px-4 py-3 rounded-[16px] bg-[#F6C1CC]/20 border-2 border-[#7A6C9D]/20 outline-none focus:border-[#FF8FA3] text-[#2E2A4A] placeholder:text-[#7A6C9D] transition-colors";

export function AdminLogin() {
  const { adminLogin, isAdmin } = useAdmin();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Already logged in
  if (isAdmin) {
    navigate("/admin");
    return null;
  }

  const handleSubmit = () => {
    setError("");
    if (!form.email.trim() || !form.password.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    const result = adminLogin(form.email, form.password);
    if (result.success) {
      navigate("/admin");
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px]"
      >
        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-5xl mb-3">
            <span
              style={{
                fontFamily: "Pacifico, cursive",
                color: "#FF8FA3",
                textShadow: "0 0 35px rgba(255,143,163,0.7)",
              }}
            >
              Admin
            </span>
          </h1>
          <p className="text-[#C8B6E2] text-sm">LoomsLilly Administration Panel</p>
        </div>

        {/* FORM */}
        <div className="rounded-[28px] bg-[#FFF6F8]/90 p-8 shadow-2xl space-y-5">
          {error && (
            <div className="px-4 py-3 rounded-[14px] bg-[#FFE4EA] border border-[#FF8FA3] text-[#C0395A] text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[#7A6C9D] text-sm mb-1">Admin Email</label>
            <input
              placeholder="admin@loomslilly.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputStyle}
            />
          </div>

          <div>
            <label className="block text-[#7A6C9D] text-sm mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className={`${inputStyle} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7A6C9D] hover:text-[#FF8FA3]"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-4 rounded-full bg-[#FF8FA3] text-white text-lg hover:scale-[1.02] transition-all shadow-lg"
          >
            Log In as Admin
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-[1.02] transition-all"
          >
            Back to Site
          </button>
        </div>
      </motion.div>
    </div>
  );
}