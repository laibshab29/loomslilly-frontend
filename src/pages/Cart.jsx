import { motion } from "framer-motion";
import { Trash2, Plus, Minus } from "lucide-react";
import { useState } from "react";

import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrderContext";
import { useAuth } from "../context/AuthContext";

export function Cart() {
  const { cart, removeFromCart, updateQuantity, checkout } = useCart();
  const { placeOrder } = useOrders();
  const { user, role } = useAuth();

  const [orderPlaced, setOrderPlaced] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = cart.length > 0 ? 5.99 : 0;
  const total = subtotal + shipping;

  const getDeliveryTime = () => "2–5 days";

  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      alert("Cart is empty.");
      return;
    }
    if (!user || !user.id) {
      alert("Please log in to place an order.");
      return;
    }
    placeOrder(cart, user);
    checkout();
    setOrderPlaced(true);
  };

  // Block sellers
  if (role === "seller") {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <span
          style={{
            fontFamily: "Pacifico, cursive",
            color: "#FF8FA3",
            fontSize: "32px",
            textShadow: "0 0 25px rgba(255, 143, 163, 0.6)",
          }}
        >
          Sellers cannot access the cart
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[1200px] mx-auto">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl lg:text-6xl mb-4">
            <span style={{ fontFamily: "Fredoka, sans-serif", color: "#F4F1F8", fontWeight: 500 }}>
              Your{" "}
            </span>
            <span style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 35px rgba(255,143,163,0.7)" }}>
              Cart
            </span>
          </h1>
        </motion.div>

        {/* ORDER CONFIRMATION */}
        {orderPlaced ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[24px] bg-[#FFF6F8]/90 p-10 shadow-2xl text-center"
          >
            <div className="text-7xl mb-6">✅</div>
            <h2 className="text-4xl text-[#2E2A4A] mb-4">Order Confirmed!</h2>
            <p className="text-[#7A6C9D] mb-6">Your order has been placed successfully.</p>

            <div className="text-left bg-white/70 rounded-xl p-6 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between mb-3">
                  <div>
                    <p className="font-medium text-[#2E2A4A]">{item.name} x{item.quantity}</p>
                    <p className="text-sm text-[#7A6C9D]">Delivery: {getDeliveryTime()}</p>
                  </div>
                  <span className="text-[#FF8FA3] font-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <hr className="my-4" />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <p className="text-sm text-[#7A6C9D] mt-3">Payment: Cash on Delivery</p>
            </div>

            <button
              onClick={() => setOrderPlaced(false)}
              className="px-6 py-3 rounded-full bg-[#FF8FA3] text-white"
            >
              Continue Shopping
            </button>
          </motion.div>

        ) : cart.length === 0 ? (
          <div className="text-center py-20 text-white">
            <span style={{ fontSize: "36px", fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 35px rgba(255,143,163,0.7)" }}>
              Your cart is empty
            </span>
          </div>

        ) : (
          <div className="grid lg:grid-cols-3 gap-8">

            {/* ITEMS */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="rounded-[20px] bg-[#FFF6F8]/90 p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3>{item.name}</h3>
                      <p>${item.price}</p>
                      <p className="text-sm text-[#7A6C9D]">Delivery: {getDeliveryTime()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus /></button>
                      {item.quantity}
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)}><Trash2 /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* SUMMARY */}
            <div className="rounded-[24px] bg-[#FFF6F8]/90 p-8 shadow-xl">
              <h2 className="text-2xl mb-6">Order Summary</h2>
              <div className="mb-4">Subtotal: ${subtotal.toFixed(2)}</div>
              <div className="mb-4">Shipping: ${shipping.toFixed(2)}</div>
              <div className="mb-6 font-bold">Total: ${total.toFixed(2)}</div>
              <button
                onClick={handlePlaceOrder}
                className="w-full py-3 rounded-full bg-[#FF8FA3] text-white"
              >
                Place Order
              </button>
              <p className="text-sm mt-4 text-[#7A6C9D]">Cash on Delivery only</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}