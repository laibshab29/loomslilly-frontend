import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

const ADMIN_EMAIL = "admin@loomslilly.com";
const ADMIN_PASSWORD = "Admin@123";

// Generate or reuse a stable guest ID per browser (for tracking guest orders)
function getOrCreateGuestId() {
  try {
    let id = localStorage.getItem("loomslilly_guestId");
    if (!id) {
      id = "guest_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      localStorage.setItem("loomslilly_guestId", id);
    }
    return id;
  } catch {
    return "guest_anon";
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const guestId = getOrCreateGuestId();

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem("currentUser", JSON.stringify(user));
    else localStorage.removeItem("currentUser");
  }, [user]);

  const getRegisteredUsers = () =>
    JSON.parse(localStorage.getItem("registeredUsers") || "[]");

  const saveRegisteredUsers = (users) =>
    localStorage.setItem("registeredUsers", JSON.stringify(users));

  const preRegister = (userData) => {
    const users = getRegisteredUsers();
    if (users.some((u) => u.email === userData.email)) {
      return { success: false, message: "Email already registered" };
    }
    return { success: true, pending: userData };
  };

  const register = (userData) => {
    const users = getRegisteredUsers();

    if (users.some((u) => u.email === userData.email)) {
      return { success: false, message: "Email already registered" };
    }

    const newUser = {
      ...userData,
      id: userData.id || Date.now(),
      password: userData.password || "",
      phone: userData.phone || "",
      contactEmail: userData.contactEmail || "",
      jazzcashPhone: userData.jazzcashPhone || "",
      easypaisaPhone: userData.easypaisaPhone || "",
      isCommunityMember: false,
      role: userData.role || "buyer",
      banned: false,
      emailVerified: userData.emailVerified ?? false,
    };

    users.push(newUser);
    saveRegisteredUsers(users);
    setUser(newUser);

    return { success: true, user: newUser };
  };

  const login = (credentials) => {
    if (
      credentials.email === ADMIN_EMAIL &&
      credentials.password === ADMIN_PASSWORD
    ) {
      const adminUser = {
        id: "admin",
        name: "Admin",
        email: ADMIN_EMAIL,
        role: "admin",
        isAdmin: true,
        emailVerified: true,
      };
      setUser(adminUser);
      return { success: true, user: adminUser };
    }

    const users = getRegisteredUsers();
    const found = users.find((u) => u.email === credentials.email);

    if (!found) return { success: false, message: "Email not registered" };
    if (found.password !== credentials.password)
      return { success: false, message: "Incorrect password" };
    if (found.banned)
      return { success: false, message: "This account has been banned." };

    const verified = found.emailVerified === undefined ? true : found.emailVerified;
    if (!verified) {
      return {
        success: false,
        message: "Please verify your email before logging in.",
        needsVerification: true,
      };
    }

    setUser(found);
    return { success: true, user: found };
  };

  const logout = () => setUser(null);

  const updateUser = (data) => {
    setUser((prev) => {
      if (!prev) return prev;

      const updated = {
        ...prev,
        ...data,
        password: data.password ?? prev.password,
        phone: data.phone !== undefined ? data.phone : prev.phone ?? "",
        contactEmail:
          data.contactEmail !== undefined
            ? data.contactEmail
            : prev.contactEmail ?? "",
        jazzcashPhone:
          data.jazzcashPhone !== undefined
            ? data.jazzcashPhone
            : prev.jazzcashPhone ?? "",
        easypaisaPhone:
          data.easypaisaPhone !== undefined
            ? data.easypaisaPhone
            : prev.easypaisaPhone ?? "",
        isCommunityMember:
          data.isCommunityMember !== undefined
            ? data.isCommunityMember
            : prev.isCommunityMember ?? false,
        emailVerified:
          data.emailVerified !== undefined
            ? data.emailVerified
            : prev.emailVerified ?? false,
      };

      const users = getRegisteredUsers();
      const idx = users.findIndex((u) => u.id === prev.id);
      if (idx !== -1) {
        users[idx] = updated;
      } else {
        users.push(updated);
      }
      saveRegisteredUsers(users);

      return updated;
    });
  };

  const banUser = (userId) => {
    const users = getRegisteredUsers();
    const updated = users.map((u) =>
      u.id === userId ? { ...u, banned: true } : u
    );
    saveRegisteredUsers(updated);
  };

  const unbanUser = (userId) => {
    const users = getRegisteredUsers();
    const updated = users.map((u) =>
      u.id === userId ? { ...u, banned: false } : u
    );
    saveRegisteredUsers(updated);
  };

  const getAllUsers = () => getRegisteredUsers();

  // Used to look up a seller's wallet info during checkout
  const getUserById = (userId) => {
    if (!userId) return null;
    const users = getRegisteredUsers();
    return users.find((u) => u.id === userId) || null;
  };

  const joinCommunityMembership = () => updateUser({ isCommunityMember: true });
  const leaveCommunityMembership = () => updateUser({ isCommunityMember: false });

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const validatePassword = (password) => {
    const hasCapital = /[A-Z]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    const numbers = password.match(/\d/g) || [];
    return hasCapital && hasSymbol && numbers.length >= 2;
  };

  const role = user?.role || "guest";
  const isGuest = !user;
  const isAdmin = role === "admin";
  const isBuyer = role === "buyer" || role === "both";
  const isSeller = role === "seller" || role === "both";
  const isCommunityMember = !!user?.isCommunityMember;

  const hasAccess = (type) => {
    switch (type) {
      case "buyer": return isBuyer;
      case "seller": return isSeller;
      case "admin": return isAdmin;
      case "auth": return !isGuest;
      default: return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        guestId,
        login,
        register,
        preRegister,
        logout,
        updateUser,
        joinCommunityMembership,
        leaveCommunityMembership,
        validateEmail,
        validatePassword,
        role,
        isGuest,
        isAdmin,
        isBuyer,
        isSeller,
        isCommunityMember,
        hasAccess,
        banUser,
        unbanUser,
        getAllUsers,
        getUserById,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);