// src/context/CartContext.jsx
import {
  createContext, useContext, useEffect, useState, useCallback, useRef,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { useProducts } from "./ProductContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user, guestId } = useAuth();
  const { reduceStock, products } = useProducts();

  const [rawCart, setRawCart] = useState([]);       // raw rows from DB
  const [stockError, setStockError] = useState("");
  const [cartLoading, setCartLoading] = useState(true);

  // Track which owner the rawCart belongs to. Prevents stale data flashing
  // when auth state changes mid-fetch.
  const ownerRef = useRef(null);
  const currentOwner = user?.id || guestId;
  ownerRef.current = currentOwner;

  const clearStockError = () => setStockError("");

  // ─── BUILD QUERY SCOPED TO CURRENT OWNER ──────────────────────
  // Returns a Supabase query builder pre-filtered to user_id or buyer_guest_id.
  const scopedQuery = (table = "cart_items") => {
    let q = supabase.from(table);
    return {
      select: (cols = "*") => {
        let b = q.select(cols);
        if (user?.id) b = b.eq("user_id", user.id);
        else b = b.eq("buyer_guest_id", guestId);
        return b;
      },
      update: (updates) => {
        let b = q.update(updates);
        if (user?.id) b = b.eq("user_id", user.id);
        else b = b.eq("buyer_guest_id", guestId);
        return b;
      },
      delete: () => {
        let b = q.delete();
        if (user?.id) b = b.eq("user_id", user.id);
        else b = b.eq("buyer_guest_id", guestId);
        return b;
      },
    };
  };

  // ─── FETCH RAW CART ROWS ──────────────────────────────────────
  // Only depends on the owner (user.id or guestId), NOT on products.
  // Hydration against products happens reactively in a separate memo below.
  const fetchCart = useCallback(async () => {
    const owner = user?.id || guestId;
    if (!owner) {
      setRawCart([]);
      setCartLoading(false);
      return;
    }

    const column = user?.id ? "user_id" : "buyer_guest_id";
    const { data, error } = await supabase
      .from("cart_items")
      .select("*")
      .eq(column, owner);

    if (error) {
      console.error("fetchCart error:", error.message);
      setCartLoading(false);
      return;
    }

    // Guard against stale fetches (owner changed mid-request)
    if (ownerRef.current !== owner) return;

    setRawCart(data || []);
    setCartLoading(false);
  }, [user?.id, guestId]);

  // ─── INITIAL FETCH + REFETCH ON OWNER CHANGE ──────────────────
  useEffect(() => {
    setCartLoading(true);
    fetchCart();
  }, [fetchCart]);

  // ─── MERGE GUEST CART ON LOGIN ────────────────────────────────
  // When SIGNED_IN fires and there's a guestId with cart rows, call the
  // atomic merge RPC and then refetch as the authed user.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user?.id && guestId) {
          const { error } = await supabase.rpc("merge_guest_cart", {
            p_user_id: session.user.id,
            p_guest_id: guestId,
          });
          if (error) console.error("merge_guest_cart error:", error.message);
          // fetchCart will re-run automatically because user.id changes
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [guestId]);

  // ─── HYDRATE RAW ROWS WITH PRODUCT DETAILS ────────────────────
  // Derived from rawCart + products. Recomputes when either changes,
  // without re-fetching from the DB.
  const cart = (rawCart || [])
    .map((row) => {
      const product = products.find((p) => p.id === row.product_id);
      if (!product) return null;
      return {
        ...product,
        cartItemId: row.id,
        quantity: row.quantity,
        selected: row.selected ?? true,
      };
    })
    .filter(Boolean);

  // Track selection in a Set derived from rawCart's selected flag.
  // Mutations update rawCart directly, so this stays in sync.
  const selectedItems = new Set(
    cart.filter((i) => i.selected).map((i) => i.id)
  );

  // ─── ADD TO CART ──────────────────────────────────────────────
  const addToCart = async (product, quantity = 1) => {
    if (!currentOwner) return; // shouldn't happen — AuthContext always provides guestId

    const existing = rawCart.find((r) => r.product_id === product.id);

    if (existing) {
      const newQuantity = existing.quantity + quantity;
      if (newQuantity > product.stock) {
        setStockError(`Only ${product.stock} units of "${product.name}" are available.`);
        return;
      }
      await updateQuantity(product.id, newQuantity);
      return;
    }

    if (quantity > product.stock) {
      setStockError(`Only ${product.stock} units of "${product.name}" are available.`);
      return;
    }

    // Optimistic update — add a placeholder row to rawCart
    const tempId = `temp_${Date.now()}`;
    const optimisticRow = {
      id: tempId,
      product_id: product.id,
      quantity,
      selected: true,
      user_id: user?.id || null,
      buyer_guest_id: user?.id ? null : guestId,
    };
    setRawCart((prev) => [...prev, optimisticRow]);

    const insertRow = {
      product_id: product.id,
      quantity,
      selected: true,
      user_id: user?.id || null,
      buyer_guest_id: user?.id ? null : guestId,
    };

    const { data, error } = await supabase
      .from("cart_items")
      .insert(insertRow)
      .select()
      .single();

    if (error) {
      // 23505 = unique_violation. Means a row already exists for this
      // (owner, product) — race with another tab. Refetch to recover.
      if (error.code === "23505") {
        await fetchCart();
        return;
      }
      console.error("addToCart error:", error.message);
      // Revert optimistic update
      setRawCart((prev) => prev.filter((r) => r.id !== tempId));
      return;
    }

    // Replace temp row with real DB row
    setRawCart((prev) =>
      prev.map((r) => (r.id === tempId ? data : r))
    );
  };

  // ─── REMOVE FROM CART ─────────────────────────────────────────
  const removeFromCart = async (productId) => {
    const row = rawCart.find((r) => r.product_id === productId);
    if (!row) return;

    // Optimistic update
    setRawCart((prev) => prev.filter((r) => r.product_id !== productId));

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", row.id);

    if (error) {
      console.error("removeFromCart error:", error.message);
      // Revert on failure
      setRawCart((prev) => [...prev, row]);
    }
  };

  // ─── UPDATE QUANTITY ──────────────────────────────────────────
  const updateQuantity = async (productId, quantity) => {
    const row = rawCart.find((r) => r.product_id === productId);
    if (!row) return;
    if (quantity <= 0) return;

    const product = products.find((p) => p.id === productId);
    if (product && quantity > product.stock) {
      setStockError(`Only ${product.stock} units of "${product.name}" are available.`);
      return;
    }

    // Optimistic update
    setRawCart((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, quantity } : r))
    );

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", row.id);

    if (error) {
      console.error("updateQuantity error:", error.message);
      // Revert on failure
      setRawCart((prev) =>
        prev.map((r) => (r.id === row.id ? row : r))
      );
    }
  };

  // ─── CLEAR CART ───────────────────────────────────────────────
  const clearCart = async () => {
    if (!currentOwner) return;

    const previous = rawCart;
    setRawCart([]);

    const { error } = await scopedQuery().delete();
    if (error) {
      console.error("clearCart error:", error.message);
      setRawCart(previous);
    }
  };

  // ─── SELECTION HELPERS ────────────────────────────────────────
  const toggleSelect = async (productId) => {
    const row = rawCart.find((r) => r.product_id === productId);
    if (!row) return;

    const newSelected = !row.selected;

    // Optimistic update
    setRawCart((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, selected: newSelected } : r))
    );

    const { error } = await supabase
      .from("cart_items")
      .update({ selected: newSelected })
      .eq("id", row.id);

    if (error) {
      console.error("toggleSelect error:", error.message);
      setRawCart((prev) =>
        prev.map((r) => (r.id === row.id ? row : r))
      );
    }
  };

  const selectAll = async () => {
    if (!currentOwner) return;

    setRawCart((prev) => prev.map((r) => ({ ...r, selected: true })));

    const { error } = await scopedQuery().update({ selected: true });
    if (error) {
      console.error("selectAll error:", error.message);
      await fetchCart(); // recover by refetching
    }
  };

  const clearSelection = async () => {
    if (!currentOwner) return;

    setRawCart((prev) => prev.map((r) => ({ ...r, selected: false })));

    const { error } = await scopedQuery().update({ selected: false });
    if (error) {
      console.error("clearSelection error:", error.message);
      await fetchCart();
    }
  };

  const isSelected = (id) => selectedItems.has(id);

  const selectedCart = cart.filter((item) => selectedItems.has(item.id));

  // ─── CHECKOUT ─────────────────────────────────────────────────
  // Removes the checked-out items from the cart (DB + local state)
  // and reduces stock. Called by Cart.jsx after placeOrder succeeds.
  const checkout = async (itemsToCheckout) => {
    const items = itemsToCheckout ?? cart;
    if (items.length === 0) return;

    await reduceStock(items);

    const checkedOutProductIds = new Set(items.map((i) => i.id));
    const cartItemIds = items
      .map((i) => i.cartItemId)
      .filter(Boolean);

    // Optimistic update
    setRawCart((prev) =>
      prev.filter((r) => !checkedOutProductIds.has(r.product_id))
    );

    if (cartItemIds.length > 0) {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .in("id", cartItemIds);
      if (error) {
        console.error("checkout delete error:", error.message);
        // Don't revert — stock has already been reduced and order placed.
        // Refetch to get true state.
        await fetchCart();
      }
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartLoading,
        selectedItems,
        selectedCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        checkout,
        clearCart,
        toggleSelect,
        selectAll,
        clearSelection,
        isSelected,
        stockError,
        clearStockError,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);