import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

const SellerContext = createContext();

export function SellerProvider({ children }) {
  const [sellerCache, setSellerCache] = useState({});

  // ─── FETCH ALL SELLERS ON MOUNT ──────────────────────────────
  const fetchSellers = useCallback(async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, avatar_url, phone, contact_email, jazzcash_phone, easypaisa_phone, role")
      .in("role", ["seller", "both"]);

    if (error) {
      console.error("fetchSellers error:", error.message);
      return;
    }

    const map = {};
    (data || []).forEach((p) => {
      map[p.id] = normalizeSeller(p);
    });
    setSellerCache(map);
  }, []);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  // ─── NORMALIZE PROFILE ROW → SELLER SHAPE ────────────────────
  function normalizeSeller(p) {
    return {
      id: p.id,
      name: p.name || "Unknown Seller",
      image: p.avatar_url || null,
      phone: p.phone || "",
      email: p.contact_email || "",
      jazzcashPhone: p.jazzcash_phone || "",
      easypaisaPhone: p.easypaisa_phone || "",
      role: p.role,
    };
  }

  // ─── GET SELLER BY ID (async, with cache) ─────────────────────
  const getSellerById = useCallback(async (id) => {
    if (!id) return null;
    if (sellerCache[id]) return sellerCache[id];

    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, avatar_url, phone, contact_email, jazzcash_phone, easypaisa_phone, role")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    const seller = normalizeSeller(data);
    setSellerCache((prev) => ({ ...prev, [id]: seller }));
    return seller;
  }, [sellerCache]);

  // ─── SYNCHRONOUS LOOKUP (for render) ─────────────────────────
  const getSellerByIdSync = useCallback((id) => {
    if (!id) return null;
    return sellerCache[id] || null;
  }, [sellerCache]);

  // ─── REMOVE SELLER FROM CACHE ─────────────────────────────────
  // Called by Account.jsx after deleting a user so the Top Sellers
  // list and SellerProfile resolve correctly without a page reload.
  const removeSeller = useCallback((id) => {
    if (!id) return;
    setSellerCache((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  // ✅ sellers array — derived from cache so Home.jsx / SellerProfile
  // can iterate sellers directly (same shape as before)
  const sellers = Object.values(sellerCache);

  return (
    <SellerContext.Provider
      value={{
        sellers,
        sellerCache,
        getSellerById,
        getSellerByIdSync,
        removeSeller,
        fetchSellers,
      }}
    >
      {children}
    </SellerContext.Provider>
  );
}

export const useSellers = () => useContext(SellerContext);