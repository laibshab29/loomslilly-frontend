import { motion } from "framer-motion";
import { useState } from "react";
import {
  ShoppingBag,
  Store,
  Users,
  Eye,
  EyeOff,
  Mail,
  Smartphone,
} from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ─── PHONE HELPERS ────────────────────────────────────────────
const sanitizePhone = (value) => {
  let result = "";
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (ch === "+" && i === 0) { result += ch; continue; }
    if (/\d/.test(ch)) { result += ch; continue; }
  }
  return result;
};

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

const validateContactEmail = (value) => {
  if (!value) return "";
  if (!value.includes("@")) return "Email must contain an @ symbol.";
  const [local, domain] = value.split("@");
  if (!local) return "Email is missing the part before @.";
  if (!domain || !domain.includes("."))
    return "Email must have a valid domain (e.g. gmail.com).";
  if (domain.startsWith(".") || domain.endsWith("."))
    return "Domain cannot start or end with a dot.";
  return "";
};

// ✅ Name is valid only if it contains letters (and spaces/hyphens for compound names)
const hasInvalidNameChar = (value) => /[^a-zA-Z\s\-']/.test(value);

export function SignUp() {
  const { login, register, validateEmail } = useAuth();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") === "login" ? "login" : "signup";

  const [accountType, setAccountType] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    contactEmail: "",
    jazzcashPhone: "",
    easypaisaPhone: "",
  });

  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  const inputStyle =
    "w-full px-4 py-3 rounded-[16px] bg-[#F6C1CC]/20 border-2 border-[#7A6C9D]/20 outline-none focus:ring-0 text-[#2E2A4A] placeholder:text-[#7A6C9D]";

  const isSellerType = accountType === "seller" || accountType === "both";

  const validateField = (field, value) => {
    if (field === "name" && mode === "signup") {
      if (!value) return "Name is required";
      if (hasInvalidNameChar(value)) return "Name can only contain letters, spaces, hyphens, and apostrophes";
      return "";
    }
    if (field === "email") {
      if (!value) return "Email is required";
      if (!value.includes("@")) return "Email must include '@'";
      if (!validateEmail(value)) return "Invalid email format";
      return "";
    }
    if (field === "password") {
      if (!value) return "Password is required";
      if (!/[A-Z]/.test(value)) return "Must include at least one capital letter";
      if (!/[^A-Za-z0-9]/.test(value)) return "Must include at least one symbol";
      if ((value.match(/\d/g) || []).length < 2)
        return "Must include at least two numbers";
      return "";
    }
    if (field === "phone") return validatePhone(value);
    if (field === "contactEmail") return validateContactEmail(value);
    if (field === "jazzcashPhone" || field === "easypaisaPhone")
      return validatePhone(value);
    return "";
  };

  const handleChange = (field, value) => {
    // ✅ Block digits AND symbols in name (only letters, spaces, hyphens, apostrophes allowed)
    if (field === "name" && hasInvalidNameChar(value)) return;

    const phoneFields = ["phone", "jazzcashPhone", "easypaisaPhone"];
    const processed = phoneFields.includes(field) ? sanitizePhone(value) : value;
    setFormData((prev) => ({ ...prev, [field]: processed }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, processed) }));
  };

  // ─── SUBMIT ──────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const newErrors = {};

    if (mode === "signup") {
      if (!formData.name) newErrors.name = "Name is required";
      else if (hasInvalidNameChar(formData.name))
        newErrors.name = "Name can only contain letters, spaces, hyphens, and apostrophes";
    }

    if (!formData.email) newErrors.email = "Email is required";
    else if (!formData.email.includes("@")) newErrors.email = "Email must include '@'";
    else if (!validateEmail(formData.email)) newErrors.email = "Invalid email format";

    if (!formData.password) newErrors.password = "Password is required";
    else if (!/[A-Z]/.test(formData.password))
      newErrors.password = "Must include at least one capital letter";
    else if (!/[^A-Za-z0-9]/.test(formData.password))
      newErrors.password = "Must include at least one symbol";
    else if ((formData.password.match(/\d/g) || []).length < 2)
      newErrors.password = "Must include at least two numbers";

    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) newErrors.phone = phoneErr;

    const contactEmailErr = validateContactEmail(formData.contactEmail);
    if (contactEmailErr) newErrors.contactEmail = contactEmailErr;

    if (mode === "signup" && isSellerType) {
      const jcErr = validatePhone(formData.jazzcashPhone);
      if (jcErr) newErrors.jazzcashPhone = jcErr;
      const epErr = validatePhone(formData.easypaisaPhone);
      if (epErr) newErrors.easypaisaPhone = epErr;
      if (!formData.jazzcashPhone && !formData.easypaisaPhone) {
        newErrors.walletRequired =
          "Sellers must provide at least one wallet (JazzCash or EasyPaisa) so buyers can pay you.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);

    // ── LOGIN flow ──
    if (mode === "login") {
      const result = await login({ email: formData.email, password: formData.password });
      setSubmitting(false);
      if (!result.success) { setError(result.message); return; }
      navigate("/");
      return;
    }

    // ── SIGNUP flow ──
    if (!accountType) {
      setError("Please select account type");
      setSubmitting(false);
      return;
    }

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: accountType,
      phone: formData.phone,
      contactEmail: formData.contactEmail,
      jazzcashPhone: formData.jazzcashPhone,
      easypaisaPhone: formData.easypaisaPhone,
    });

    setSubmitting(false);

    if (!result.success) { setError(result.message); return; }
    setEmailSent(true);
  };

  // ─── EMAIL SENT SCREEN ───────────────────────────────────────
  if (emailSent) {
    return (
      <div className="min-h-screen py-12 px-4 lg:px-20">
        <div className="max-w-[600px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[24px] bg-[#FFF6F8]/95 p-10 shadow-2xl text-center"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#F6C1CC] to-[#C8B6E2] flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-white" />
            </div>

            <h1
              style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 30px rgba(255,143,163,0.6)" }}
              className="text-4xl mb-3"
            >
              Check Your Email
            </h1>

            <p className="text-[#7A6C9D] mb-2">We've sent a verification link to</p>
            <p className="text-[#2E2A4A] font-medium mb-6">{formData.email}</p>

            <div className="rounded-[16px] bg-[#EDE8F9] border-2 border-[#C8B6E2]/40 p-5 mb-8 text-left space-y-2">
              <p className="text-[#7A6C9D] text-sm font-medium">What to do next:</p>
              <p className="text-[#2E2A4A] text-sm">1. Open the email from LoomsLilly.</p>
              <p className="text-[#2E2A4A] text-sm">2. Click the verification link inside.</p>
              <p className="text-[#2E2A4A] text-sm">3. Come back here and log in.</p>
            </div>

            <p className="text-[#C8B6E2] text-xs mb-6">
              Didn't receive it? Check your spam folder. The link expires in 24 hours.
            </p>

            <button
              onClick={() => navigate("/signup?mode=login")}
              className="w-full py-4 rounded-full bg-[#FF8FA3] text-white hover:scale-[1.02] transition-all shadow-md"
            >
              Go to Login
            </button>

            <button
              onClick={() => {
                setEmailSent(false);
                setFormData({ name: "", email: "", password: "", phone: "", contactEmail: "", jazzcashPhone: "", easypaisaPhone: "" });
              }}
              className="mt-4 text-[#C8B6E2] text-sm hover:text-[#FF8FA3] transition-colors"
            >
              ← Back to sign up
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── MAIN SIGNUP / LOGIN FORM ────────────────────────────────
  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[800px] mx-auto">
        <motion.div className="text-center mb-12">
          <h1 className="text-5xl lg:text-6xl mb-4">
            <span style={{ fontFamily: "Fredoka, sans-serif", color: "#F4F1F8", fontWeight: 500, letterSpacing: "0.5px" }}>
              {mode === "login" ? "Log In " : "Join "}
            </span>
            <span style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 35px rgba(255, 143, 163, 0.7)" }}>
              LoomsLilly
            </span>
          </h1>
          <p className="text-xl text-[#FFF6F8]">
            {mode === "login"
              ? "Log in to continue your journey"
              : "Create your account and start your creative journey"}
          </p>
        </motion.div>

        {mode === "signup" && !accountType ? (
          <>
            <h2 className="text-3xl text-center text-[#FFF6F8] mb-8">I want to...</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { type: "buyer",  icon: ShoppingBag, label: "Buy",  description: "Shop for creative supplies" },
                { type: "seller", icon: Store,        label: "Sell", description: "Share your handmade creations" },
                { type: "both",   icon: Users,        label: "Both", description: "Buy and sell in the community" },
              ].map((option, index) => (
                <motion.button
                  key={option.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -8 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAccountType(option.type)}
                  className="rounded-[24px] bg-[#FFF6F8]/90 backdrop-blur-sm border-2 border-[#7A6C9D]/20 p-8 shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#F6C1CC] to-[#C8B6E2] flex items-center justify-center">
                      <option.icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl text-[#2E2A4A]">{option.label}</h3>
                    <p className="text-[#7A6C9D] text-center">{option.description}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-[24px] bg-[#FFF6F8]/90 p-8">
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === "signup" && (
                <div>
                  <input
                    placeholder="Full Name *"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={inputStyle + (errors.name ? " border-red-400" : "")}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  <p className="text-[#C8B6E2] text-xs mt-1">Letters, spaces, hyphens and apostrophes only</p>
                </div>
              )}

              <div>
                <input
                  placeholder="Email *"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={inputStyle + (errors.email ? " border-red-400" : "")}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password *"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className={`${inputStyle} pr-12` + (errors.password ? " border-red-400" : "")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7A6C9D] hover:text-[#FF8FA3]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              {mode === "signup" && (
                <div className="rounded-[16px] bg-[#F6C1CC]/10 border-2 border-[#7A6C9D]/10 p-5 space-y-4">
                  <p className="text-[#7A6C9D] text-sm font-medium">
                    Contact Info{" "}
                    <span className="text-xs text-[#C8B6E2]">(optional — used for checkout & events)</span>
                  </p>

                  <div>
                    <input
                      placeholder="Phone e.g. +923001234567 or 03001234567"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className={inputStyle + (errors.phone ? " border-red-400" : "")}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    <p className="text-[#C8B6E2] text-xs mt-1">
                      Accepted: +923001234567 · 03001234567 · +92211234567 · 0211234567
                    </p>
                  </div>

                  <div>
                    <input
                      placeholder="Contact Email (if different from login email)"
                      value={formData.contactEmail}
                      onChange={(e) => handleChange("contactEmail", e.target.value)}
                      className={inputStyle + (errors.contactEmail ? " border-red-400" : "")}
                    />
                    {errors.contactEmail && <p className="text-red-500 text-xs mt-1">{errors.contactEmail}</p>}
                  </div>
                </div>
              )}

              {/* ─── SELLER WALLET INFO ─── */}
              {mode === "signup" && isSellerType && (
                <div className="rounded-[16px] bg-[#EDE8F9]/40 border-2 border-[#C8B6E2]/40 p-5 space-y-4">
                  <div className="flex items-start gap-2">
                    <Smartphone className="w-5 h-5 text-[#7A6C9D] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[#7A6C9D] text-sm font-medium">Seller Wallet Info</p>
                      <p className="text-xs text-[#C8B6E2] mt-1">
                        Buyers will see your wallet number(s) when they pay with JazzCash or EasyPaisa.
                        You need at least one — both is best.
                      </p>
                    </div>
                  </div>

                  {errors.walletRequired && (
                    <div className="rounded-[12px] bg-red-50 border border-red-200 p-3">
                      <p className="text-red-500 text-sm">{errors.walletRequired}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-[#7A6C9D] text-xs mb-1">JazzCash Phone</label>
                    <input
                      placeholder="e.g. 03001234567"
                      value={formData.jazzcashPhone}
                      onChange={(e) => handleChange("jazzcashPhone", e.target.value)}
                      className={inputStyle + (errors.jazzcashPhone ? " border-red-400" : "")}
                    />
                    {errors.jazzcashPhone && <p className="text-red-500 text-xs mt-1">{errors.jazzcashPhone}</p>}
                  </div>

                  <div>
                    <label className="block text-[#7A6C9D] text-xs mb-1">EasyPaisa Phone</label>
                    <input
                      placeholder="e.g. 03001234567"
                      value={formData.easypaisaPhone}
                      onChange={(e) => handleChange("easypaisaPhone", e.target.value)}
                      className={inputStyle + (errors.easypaisaPhone ? " border-red-400" : "")}
                    />
                    {errors.easypaisaPhone && <p className="text-red-500 text-xs mt-1">{errors.easypaisaPhone}</p>}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-full bg-[#FF8FA3] text-white hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting
                  ? mode === "login" ? "Logging in..." : "Creating account..."
                  : mode === "login" ? "Log In" : "Create Account"}
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-[#FFF6F8]/70 mt-6 text-sm">
          {mode === "login" ? (
            <>Don't have an account?{" "}
              <button onClick={() => navigate("/signup")} className="text-[#FF8FA3] hover:underline">Sign up</button>
            </>
          ) : (
            <>Already have an account?{" "}
              <button onClick={() => navigate("/signup?mode=login")} className="text-[#FF8FA3] hover:underline">Log in</button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}