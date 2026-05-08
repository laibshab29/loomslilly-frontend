import { createContext, useContext, useEffect, useState } from "react";
import { useProducts } from "./ProductContext";
const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const { reduceStock } = useProducts();
  // Load from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ✅ ADD TO CART (with stock validation)
  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      // If already exists → increase quantity safely
      if (existing) {
        const newQuantity = existing.quantity + quantity;

        // ❌ Prevent exceeding stock
        if (newQuantity > product.stock) {
          alert("Not enough stock available.");
          return prev;
        }

        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      // ❌ Prevent adding more than stock initially
      if (quantity > product.stock) {
        alert("Not enough stock available.");
        return prev;
      }

      return [...prev, { ...product, quantity }];
    });
  };

  // ✅ REMOVE
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };
const clearCart = () => {
  setCart([]);
};
  // ✅ UPDATE QUANTITY (with stock check)
  const updateQuantity = (id, quantity) => {
  setCart((prev) =>
    prev.map((item) => {

      if (item.id === id) {

        if (quantity <= 0) {
          return item;
        }

        if (quantity > item.stock) {
          alert("Not enough stock available.");
          return item;
        }

        return {
          ...item,
          quantity,
        };
      }

      return item;
    })
  );
};

const checkout = () => {

  if (cart.length === 0) {
    alert("Cart is empty.");
    return;
  }

  reduceStock(cart);

  setCart([]);

  alert("Checkout successful!");
};

  return (
    <CartContext.Provider
      value={{
  cart,
  addToCart,
  removeFromCart,
  updateQuantity,
  checkout,
}}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);