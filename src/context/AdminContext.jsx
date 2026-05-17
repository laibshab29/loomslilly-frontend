import { createContext, useContext, useState, useEffect } from "react";

const AdminContext = createContext();

// ─── HARDCODED ADMIN CREDENTIALS (replace with backend auth later) ────────────
const ADMIN_CREDENTIALS = {
  email: "admin@loomslilly.com",
  password: "Admin@123",
};

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem("isAdmin") === "true";
  });

  const [adminLog, setAdminLog] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("adminLog") || "[]");
    } catch {
      return [];
    }
  });

  // Featured product IDs chosen by admin
  const [featuredProductIds, setFeaturedProductIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("featuredProductIds") || "[]");
    } catch {
      return [];
    }
  });

  // Manually banned user IDs (separate from community auto-ban)
  const [adminBannedIds, setAdminBannedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("adminBannedIds") || "[]");
    } catch {
      return [];
    }
  });

  // Verified seller IDs
  const [verifiedSellerIds, setVerifiedSellerIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("verifiedSellerIds") || "[]");
    } catch {
      return [];
    }
  });

  // Removed content IDs: { products: [], deals: [], discussions: [], events: [], tutorials: [] }
  const [removedContent, setRemovedContent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("adminRemovedContent") || JSON.stringify({
        products: [], deals: [], discussions: [], events: [], tutorials: [],
      }));
    } catch {
      return { products: [], deals: [], discussions: [], events: [], tutorials: [] };
    }
  });

  // ─── PERSIST ──────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem("isAdmin", isAdmin ? "true" : "false");
  }, [isAdmin]);

  useEffect(() => {
    try { localStorage.setItem("adminLog", JSON.stringify(adminLog)); } catch {}
  }, [adminLog]);

  useEffect(() => {
    try { localStorage.setItem("featuredProductIds", JSON.stringify(featuredProductIds)); } catch {}
  }, [featuredProductIds]);

  useEffect(() => {
    try { localStorage.setItem("adminBannedIds", JSON.stringify(adminBannedIds)); } catch {}
  }, [adminBannedIds]);

  useEffect(() => {
    try { localStorage.setItem("verifiedSellerIds", JSON.stringify(verifiedSellerIds)); } catch {}
  }, [verifiedSellerIds]);

  useEffect(() => {
    try { localStorage.setItem("adminRemovedContent", JSON.stringify(removedContent)); } catch {}
  }, [removedContent]);

  // ─── LOGGING ──────────────────────────────────────────────────
  const logAction = (action, detail = "") => {
    setAdminLog((prev) => [
      { id: Date.now(), action, detail, timestamp: Date.now() },
      ...prev,
    ].slice(0, 200)); // keep last 200 actions
  };

  // ─── AUTH ─────────────────────────────────────────────────────
  const adminLogin = (email, password) => {
    if (
      email === ADMIN_CREDENTIALS.email &&
      password === ADMIN_CREDENTIALS.password
    ) {
      setIsAdmin(true);
      logAction("Admin logged in");
      return { success: true };
    }
    return { success: false, message: "Invalid admin credentials." };
  };

  const adminLogout = () => {
    logAction("Admin logged out");
    setIsAdmin(false);
    localStorage.removeItem("isAdmin");
  };

  // ─── USER MANAGEMENT ──────────────────────────────────────────
  const banUser = (userId, userName) => {
    setAdminBannedIds((prev) =>
      prev.includes(userId) ? prev : [...prev, userId]
    );
    logAction("Banned user", `${userName} (ID: ${userId})`);
  };

  const unbanUser = (userId, userName) => {
    setAdminBannedIds((prev) => prev.filter((id) => id !== userId));
    logAction("Unbanned user", `${userName} (ID: ${userId})`);
  };

  const isAdminBanned = (userId) => adminBannedIds.includes(userId);

  // ─── SELLER VERIFICATION ──────────────────────────────────────
  const verifySeller = (sellerId, sellerName) => {
    setVerifiedSellerIds((prev) =>
      prev.includes(sellerId) ? prev : [...prev, sellerId]
    );
    logAction("Verified seller", `${sellerName} (ID: ${sellerId})`);
  };

  const unverify = (sellerId, sellerName) => {
    setVerifiedSellerIds((prev) => prev.filter((id) => id !== sellerId));
    logAction("Removed seller verification", `${sellerName} (ID: ${sellerId})`);
  };

  const isVerifiedSeller = (sellerId) => verifiedSellerIds.includes(sellerId);

  // ─── FEATURED PRODUCTS ────────────────────────────────────────
  const featureProduct = (productId, productName) => {
    setFeaturedProductIds((prev) =>
      prev.includes(productId) ? prev : [...prev, productId]
    );
    logAction("Featured product", `${productName} (ID: ${productId})`);
  };

  const unfeatureProduct = (productId, productName) => {
    setFeaturedProductIds((prev) => prev.filter((id) => id !== productId));
    logAction("Unfeatured product", `${productName} (ID: ${productId})`);
  };

  const isProductFeatured = (productId) => featuredProductIds.includes(productId);

  // ─── CONTENT REMOVAL ──────────────────────────────────────────
  const removeContent = (type, id, label) => {
    setRemovedContent((prev) => ({
      ...prev,
      [type]: prev[type].includes(id) ? prev[type] : [...prev[type], id],
    }));
    logAction(`Removed ${type.slice(0, -1)}`, label || `ID: ${id}`);
  };

  const restoreContent = (type, id, label) => {
    setRemovedContent((prev) => ({
      ...prev,
      [type]: prev[type].filter((rid) => rid !== id),
    }));
    logAction(`Restored ${type.slice(0, -1)}`, label || `ID: ${id}`);
  };

  const isContentRemoved = (type, id) => removedContent[type]?.includes(id);

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        adminLogin,
        adminLogout,
        adminLog,
        // user management
        adminBannedIds,
        banUser,
        unbanUser,
        isAdminBanned,
        // seller verification
        verifiedSellerIds,
        verifySeller,
        unverify,
        isVerifiedSeller,
        // featured products
        featuredProductIds,
        featureProduct,
        unfeatureProduct,
        isProductFeatured,
        // content removal
        removedContent,
        removeContent,
        restoreContent,
        isContentRemoved,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);