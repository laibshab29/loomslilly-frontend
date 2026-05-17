import { createContext, useContext, useEffect, useState } from "react";
import { useProducts } from "./ProductContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  // ─── LAZY INIT FROM localStorage ─────────────────────────────
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("loomslilly_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedItems, setSelectedItems] = useState(() => {
    try {
      const saved = localStorage.getItem("loomslilly_selected");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [stockError, setStockError] = useState("");
  const { reduceStock } = useProducts();

  // ─── PERSIST CART ─────────────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem("loomslilly_cart", JSON.stringify(cart));
    } catch (e) {
      console.warn("cart save failed:", e);
    }
  }, [cart]);

  // ─── PERSIST SELECTED ─────────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem(
        "loomslilly_selected",
        JSON.stringify([...selectedItems])
      );
    } catch (e) {
      console.warn("selection save failed:", e);
    }
  }, [selectedItems]);

  const clearStockError = () => setStockError("");

  // ─── ADD TO CART ──────────────────────────────────────────────
  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        const newQuantity = existing.quantity + quantity;
        if (newQuantity > product.stock) {
          setStockError(
            "Only " + product.stock + ' units of "' + product.name + '" are available.'
          );
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item
        );
      }

      if (quantity > product.stock) {
        setStockError(
          "Only " + product.stock + ' units of "' + product.name + '" are available.'
        );
        return prev;
      }

      // Auto-select newly added items
      setSelectedItems((s) => new Set([...s, product.id]));
      return [...prev, { ...product, quantity }];
    });
  };

  // ─── REMOVE ───────────────────────────────────────────────────
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    setSelectedItems((s) => {
      const next = new Set(s);
      next.delete(id);
      return next;
    });
  };

  // ─── UPDATE QUANTITY ──────────────────────────────────────────
  const updateQuantity = (id, quantity) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (quantity <= 0) return item;
        if (quantity > item.stock) {
          setStockError(
            "Only " + item.stock + ' units of "' + item.name + '" are available.'
          );
          return item;
        }
        return { ...item, quantity };
      })
    );
  };

  // ─── CLEAR ────────────────────────────────────────────────────
  const clearCart = () => {
    setCart([]);
    setSelectedItems(new Set());
  };

  // ─── SELECTION HELPERS ────────────────────────────────────────
  const toggleSelect = (id) => {
    setSelectedItems((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () =>
    setSelectedItems(new Set(cart.map((item) => item.id)));

  const clearSelection = () => setSelectedItems(new Set());

  const isSelected = (id) => selectedItems.has(id);

  const selectedCart = cart.filter((item) => selectedItems.has(item.id));

  // ─── CHECKOUT (selected items only) ───────────────────────────
  const checkout = (itemsToCheckout) => {
    const items = itemsToCheckout ?? cart;
    if (items.length === 0) return;
    reduceStock(items);
    const checkedOutIds = new Set(items.map((i) => i.id));
    setCart((prev) => prev.filter((item) => !checkedOutIds.has(item.id)));
    setSelectedItems((s) => {
      const next = new Set(s);
      checkedOutIds.forEach((id) => next.delete(id));
      return next;
    });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
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