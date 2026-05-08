import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Load user
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // Save user
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  const login = (userData) => {

  setUser({
    ...userData,

    id:
      userData.id ||
      Date.now(),

    password:
      userData.password || "",
  });
};
  const logout = () => setUser(null);

  const updateUser = (data) => {
    setUser((prev) => ({
    ...prev,
    ...data,
    password: data.password ?? prev.password,
  }));
  };

  // 🔥 VALIDATION HELPERS
  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const validatePassword = (password) => {
    const hasCapital = /[A-Z]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    const numbers = password.match(/\d/g) || [];

    return hasCapital && hasSymbol && numbers.length >= 2;
  };

  // ROLE LOGIC
  const role = user?.role || "guest";

  const isGuest = !user;
  const isBuyer = role === "buyer" || role === "both";
  const isSeller = role === "seller" || role === "both";

  const hasAccess = (type) => {
    switch (type) {
      case "buyer":
        return isBuyer;
      case "seller":
        return isSeller;
      case "auth":
        return !isGuest;
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        validateEmail,
        validatePassword,
        role,
        isGuest,
        isBuyer,
        isSeller,
        hasAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);