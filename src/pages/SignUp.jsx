import { motion } from "framer-motion";
import { useState } from "react";
import { ShoppingBag, Store, Users, Eye, EyeOff } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function SignUp() {
  const { login, validateEmail } = useAuth();

  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") === "login" ? "login" : "signup";

  const [accountType, setAccountType] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);

  const inputStyle =
    "w-full px-4 py-3 rounded-[16px] bg-[#F6C1CC]/20 border-2 border-[#7A6C9D]/20 outline-none focus:ring-0 text-[#2E2A4A] placeholder:text-[#7A6C9D]";

  // VALIDATION
  const validateField = (field, value) => {
    let err = "";

    if (field === "name" && mode === "signup") {
      if (!value) err = "Name is required";
    }

    if (field === "email") {
      if (!value) err = "Email is required";
      else if (!value.includes("@")) err = "Email must include '@'";
      else if (!validateEmail(value)) err = "Invalid email format";
    }

    if (field === "password") {
      if (!value) err = "Password is required";
      else if (!/[A-Z]/.test(value))
        err = "Must include at least one capital letter";
      else if (!/[^A-Za-z0-9]/.test(value))
        err = "Must include at least one symbol";
      else if ((value.match(/\d/g) || []).length < 2)
        err = "Must include at least two numbers";
    }

    return err;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    const err = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  let newErrors = {};

  // 🔥 FORCE VALIDATION FOR ALL FIELDS
  if (mode === "signup") {
    if (!formData.name) newErrors.name = "Name is required";
  }

  if (!formData.email) {
    newErrors.email = "Email is required";
  } else if (!formData.email.includes("@")) {
    newErrors.email = "Email must include '@'";
  } else if (!validateEmail(formData.email)) {
    newErrors.email = "Invalid email format";
  }

  if (!formData.password) {
    newErrors.password = "Password is required";
  } else if (!/[A-Z]/.test(formData.password)) {
    newErrors.password = "Must include at least one capital letter";
  } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
    newErrors.password = "Must include at least one symbol";
  } else if ((formData.password.match(/\d/g) || []).length < 2) {
    newErrors.password = "Must include at least two numbers";
  }

  // 🔥 SET ERRORS + STOP SUBMIT
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  // LOGIN LOGIC
  if (mode === "login") {
    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (!savedUser) return setError("User not found");
    if (savedUser.email !== formData.email)
      return setError("Email not registered");
    if (savedUser.password !== formData.password)
      return setError("Incorrect password");

    login(savedUser);
    setSubmitted(true);
    return;
  }

  // SIGNUP LOGIC
  if (!accountType) {
    setError("Please select account type");
    return;
  }

  const newUser = {
    id: Date.now(),
    name: formData.name,
    email: formData.email,
    password: formData.password,
    role: accountType,
  };

  login(newUser);
  setSubmitted(true);
};

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[800px] mx-auto">

        {/* HEADER */}
        <motion.div className="text-center mb-12">
          <h1 className="text-5xl lg:text-6xl mb-4">
            <span
    style={{
      fontFamily: "Fredoka, sans-serif",
      color: "#F4F1F8", // 🔥 softer white (not pure white)
      fontWeight: 500,
      letterSpacing: "0.5px",
    }}
  >
              {mode === "login" ? "Log In " : "Join "}
            </span>
            <span
    style={{
      fontFamily: "Pacifico, cursive",
      color: "#FF8FA3",
      textShadow: "0 0 35px rgba(255, 143, 163, 0.7)", // 🔥 stronger glow
    }}
  >LoomsLilly</span>
          </h1>

          <p className="text-xl text-[#FFF6F8]">
            {mode === "login"
              ? "Log in to continue your journey"
              : "Create your account and start your creative journey"}
          </p>
        </motion.div>

        {/* SUCCESS */}
        {submitted ? (
          <div className="rounded-[24px] bg-[#FFF6F8]/90 p-12 text-center">
            <h2 className="text-3xl text-[#2E2A4A]">
               <span
    style={{
      fontFamily: "Pacifico, cursive",
      color: "#FF8FA3",
      textShadow: "0 0 35px rgba(255, 143, 163, 0.7)", // 🔥 stronger glow
    }}
  >Welcome!</span></h2>
          </div>
        ) : (
          <>
            {/* 🔥 ACCOUNT TYPE (FIXED UI) */}
            {mode === "signup" && !accountType ? (
              <>
                <h2 className="text-3xl text-center text-[#FFF6F8] mb-8">
                  I want to...
                </h2>

                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      type: "buyer",
                      icon: ShoppingBag,
                      label: "Buy",
                      description: "Shop for creative supplies",
                    },
                    {
                      type: "seller",
                      icon: Store,
                      label: "Sell",
                      description: "Share your handmade creations",
                    },
                    {
                      type: "both",
                      icon: Users,
                      label: "Both",
                      description: "Buy and sell in the community",
                    },
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

                        <h3 className="text-2xl text-[#2E2A4A]">
                          {option.label}
                        </h3>

                        <p className="text-[#7A6C9D] text-center">
                          {option.description}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </>
            ) : (

            /* FORM */
            <div className="rounded-[24px] bg-[#FFF6F8]/90 p-8">

              {error && (
                <p className="text-red-500 text-center mb-4">{error}</p>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* NAME */}
                {mode === "signup" && (
                  <div>
                    <input
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) =>
                        handleChange("name", e.target.value)
                      }
                      className={inputStyle}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.name}
                      </p>
                    )}
                  </div>
                )}

                {/* EMAIL */}
                <div>
                  <input
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) =>
                      handleChange("email", e.target.value)
                    }
                    className={inputStyle}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* 🔥 PASSWORD WITH TOGGLE */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) =>
                      handleChange("password", e.target.value)
                    }
                    className={`${inputStyle} pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7A6C9D] hover:text-[#FF8FA3]"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>

                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                <button className="w-full py-4 rounded-full bg-[#FF8FA3] text-white">
                  {mode === "login" ? "Log In" : "Create Account"}
                </button>
              </form>
            </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}