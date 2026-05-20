// src/pages/Cart.jsx
import { motion } from "framer-motion";
import {
  Trash2, Plus, Minus, CheckSquare, Square, ShoppingBag,
} from "lucide-react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductContext";

function PortalModal({ children }) {
  return createPortal(children, document.body);
}

function StockModal({ message, onClose }) {
  return (
    <PortalModal>
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-md"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="bg-[#FFF6F8] rounded-[28px] p-10 max-w-[380px] w-full mx-4 text-center shadow-2xl border-2 border-[#FF8FA3]/40"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-6xl mb-4">⚠️</div>
              <h2 style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }} className="text-3xl mb-3">
                Not Enough Stock
              </h2>
              <p className="text-[#7A6C9D] mb-6 leading-relaxed">{message}</p>
              <button onClick={onClose} className="px-8 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all">
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PortalModal>
  );
}

export function Cart() {
  const {
    cart, selectedCart, removeFromCart, updateQuantity,
    stockError, clearStockError,
    toggleSelect, selectAll, clearSelection, isSelected,
    cartLoading,
  } = useCart();
  const { products } = useProducts();
  const { role } = useAuth();
  const navigate = useNavigate();

  if (cartLoading) return null;

  if (role === "seller") {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <span style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", fontSize: "32px", textShadow: "0 0 25px rgba(255,143,163,0.6)" }}>
          Sellers cannot access the cart
        </span>
      </div>
    );
  }

  const getLiveStock = (itemId) => {
    const live = products.find((p) => p.id === itemId);
    return live?.stock ?? 0;
  };

  const getDeliveryTime = (item) => {
    const live = products.find((p) => p.id === item.id);
    return live?.delivery || item.delivery || item.deliveryTime || "2–5 days";
  };

  const subtotal = selectedCart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = selectedCart.length > 0 ? 150 : 0;
  const total = subtotal + shipping;

  const allSelected = cart.length > 0 && cart.every((item) => isSelected(item.id));

  const handleProceedToCheckout = () => {
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <StockModal message={stockError} onClose={clearStockError} />

      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl lg:text-6xl mb-4">
            <span style={{ fontFamily: "Fredoka, sans-serif", color: "#F4F1F8", fontWeight: 500 }}>Your </span>
            <span style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 35px rgba(255,143,163,0.7)" }}>Cart</span>
          </h1>
        </motion.div>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <span style={{ fontSize: "36px", fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 35px rgba(255,143,163,0.7)" }}>
              Your cart is empty
            </span>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between px-2 mb-1">
                <button
                  onClick={allSelected ? clearSelection : selectAll}
                  className="flex items-center gap-2 text-[#C8B6E2] hover:text-[#FF8FA3] text-sm"
                >
                  {allSelected
                    ? <CheckSquare className="w-5 h-5 text-[#FF8FA3]" />
                    : <Square className="w-5 h-5" />}
                  {allSelected ? "Deselect All" : "Select All"}
                </button>
                {selectedCart.length > 0 && (
                  <span className="text-xs text-[#C8B6E2]">
                    {selectedCart.length} of {cart.length} selected
                  </span>
                )}
              </div>

              {cart.map((item) => {
                const liveStock = getLiveStock(item.id);
                const isOutOfStock = liveStock <= 0;
                const selected = isSelected(item.id);
                const deliveryTime = getDeliveryTime(item);

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-[20px] bg-[#FFF6F8]/90 p-6 shadow-lg border-2 ${selected ? "border-[#FF8FA3]/50" : "border-transparent"} ${isOutOfStock ? "opacity-70" : ""}`}
                  >
                    <div className="flex items-center gap-4">
                      <button onClick={() => toggleSelect(item.id)} className="flex-shrink-0 p-1">
                        {selected
                          ? <CheckSquare className="w-5 h-5 text-[#FF8FA3]" />
                          : <Square className="w-5 h-5 text-[#C8B6E2]" />}
                      </button>
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          onClick={() => navigate(`/products/${item.id}`)}
                          className="w-16 h-16 object-cover rounded-[12px] flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3
                          onClick={() => navigate(`/products/${item.id}`)}
                          className="text-[#2E2A4A] font-medium truncate cursor-pointer hover:text-[#FF8FA3]"
                        >
                          {item.name}
                        </h3>
                        <p className="text-[#FF8FA3] font-semibold">Rs. {item.price}</p>
                        <p className="text-xs text-[#C8B6E2] mt-0.5">🚚 Delivery: {deliveryTime}</p>
                        {isOutOfStock
                          ? <p className="text-xs text-red-400 font-medium">⚠ Out of Stock</p>
                          : liveStock < item.quantity
                            ? <p className="text-xs text-amber-500 font-medium">⚠ Only {liveStock} left</p>
                            : <p className="text-xs text-[#C8B6E2]">{liveStock} available</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => {
                            if (item.quantity <= 1) removeFromCart(item.id);
                            else updateQuantity(item.id, item.quantity - 1);
                          }}
                          className="w-8 h-8 rounded-full bg-[#F6C1CC]/40 flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4 text-[#7A6C9D]" />
                        </button>
                        <span className="w-6 text-center text-[#2E2A4A] font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= liveStock}
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${item.quantity >= liveStock ? "bg-gray-100 cursor-not-allowed" : "bg-[#F6C1CC]/40"}`}
                        >
                          <Plus className={`w-4 h-4 ${item.quantity >= liveStock ? "text-gray-300" : "text-[#7A6C9D]"}`} />
                        </button>
                      </div>
                      <p className="text-[#FF8FA3] font-semibold flex-shrink-0">
                        Rs. {(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 rounded-full hover:bg-[#FF8FA3]/20"
                      >
                        <Trash2 className="w-4 h-4 text-[#FF8FA3]" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* ORDER SUMMARY */}
            <div className="rounded-[24px] bg-[#FFF6F8]/90 p-8 shadow-xl h-fit">
              <h2 style={{ fontFamily: "Fredoka, sans-serif" }} className="text-2xl text-[#2E2A4A] mb-6">
                Order Summary
              </h2>
              {selectedCart.length === 0 ? (
                <div className="text-center py-6">
                  <ShoppingBag className="w-10 h-10 text-[#C8B6E2] mx-auto mb-3" />
                  <p className="text-[#C8B6E2] text-sm">
                    Select items above to see your order summary.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {selectedCart.map((item) => (
                      <div key={item.id} className="text-sm text-[#7A6C9D]">
                        <div className="flex justify-between">
                          <span className="truncate max-w-[160px]">
                            {item.name} x{item.quantity}
                          </span>
                          <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-[#C8B6E2] ml-1">
                          🚚 {getDeliveryTime(item)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <hr className="border-[#F6C1CC] mb-4" />
                  <div className="flex justify-between text-sm text-[#7A6C9D] mb-2">
                    <span>Subtotal</span>
                    <span>Rs. {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#7A6C9D] mb-4">
                    <span>Shipping</span>
                    <span>Rs. {shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-[#2E2A4A] mb-6">
                    <span>Total</span>
                    <span>Rs. {total.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full py-4 rounded-full bg-[#FF8FA3] text-white hover:scale-[1.02] transition-all shadow-lg"
                  >
                    Proceed to Checkout
                  </button>
                  <p className="text-xs text-center mt-4 text-[#C8B6E2]">
                    COD · Card · JazzCash · EasyPaisa
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}