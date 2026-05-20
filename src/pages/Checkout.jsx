// src/pages/Checkout.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Smartphone, Banknote, Eye, EyeOff,
  MapPin, Phone, Copy, Check, Upload, Image as ImageIcon,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrderContext";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductContext";
import { uploadPaymentProof } from "../lib/uploadPaymentProof";

// ─── VALIDATION ───────────────────────────────────────────────
const validateMobilePhone = (v) => {
  if (!v.trim()) return "Phone number is required.";
  if (/[^+\d]/.test(v)) return "Only digits and a leading + are allowed.";
  if (v.indexOf("+") > 0) return "The + symbol can only appear at the start.";
  const digits = v.replace("+", "");
  if (digits.length < 9) return "Phone number is too short.";
  if (digits.length > 12) return "Phone number is too long.";
  if (v.startsWith("+") && !v.startsWith("+92")) return "International format must start with +92.";
  if (!v.startsWith("+") && !digits.startsWith("0")) return "Local numbers must start with 0.";
  return "";
};
const validateCardNumber = (v) => {
  const digits = v.replace(/\s/g, "");
  if (!/^\d+$/.test(digits)) return "Card number must contain only digits.";
  if (digits.length < 13 || digits.length > 19) return "Card number must be 13–19 digits.";
  return "";
};
const validateExpiry = (v) => {
  if (!/^\d{2}\/\d{2}$/.test(v)) return "Expiry must be in MM/YY format.";
  const [mm, yy] = v.split("/").map(Number);
  if (mm < 1 || mm > 12) return "Month must be 01–12.";
  const expDate = new Date(2000 + yy, mm - 1, 1);
  const now = new Date();
  if (expDate < new Date(now.getFullYear(), now.getMonth(), 1)) return "Card has expired.";
  return "";
};
const validateCVV = (v) => /^\d{3,4}$/.test(v) ? "" : "CVV must be 3 or 4 digits.";
const validateCardName = (v) => {
  if (!v.trim()) return "Name on card is required.";
  if (v.trim().length < 2) return "Please enter a valid name.";
  return "";
};
const formatCardNumber = (v) =>
  v.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
const formatExpiry = (v) => {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
};

const inputStyle =
  "w-full px-4 py-3 rounded-[16px] bg-[#F6C1CC]/20 border-2 border-[#7A6C9D]/20 outline-none focus:border-[#FF8FA3] text-[#2E2A4A] placeholder:text-[#7A6C9D] text-sm";

// ─── GROUP CART ITEMS BY SELLER ───────────────────────────────
function groupBySeller(cartItems) {
  const groups = {};
  cartItems.forEach((item) => {
    const sid = String(item.sellerId);
    if (!groups[sid]) groups[sid] = [];
    groups[sid].push(item);
  });
  return Object.entries(groups).map(([sellerId, items]) => ({
    sellerId,
    items,
    subtotal: items.reduce((s, i) => s + i.price * i.quantity, 0),
  }));
}

// ─── MAIN CHECKOUT PAGE ──────────────────────────────────────
export function Checkout() {
  const { selectedCart, checkout, cartLoading } = useCart();
  const { products } = useProducts();
  const { placeOrder } = useOrders();
  const { user, role, guestId, getUserById } = useAuth();
  const navigate = useNavigate();

  // step: 'delivery' | 'payment' | 'card' | 'wallet' | 'proof' | 'done'
  const [step, setStep] = useState("delivery");

  const [address, setAddress] = useState(user?.address || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [errors, setErrors] = useState({});

  const [payType, setPayType] = useState("");
  const [buyerWalletPhone, setBuyerWalletPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [copiedKey, setCopiedKey] = useState("");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [cardErrors, setCardErrors] = useState({});
  const [showCVV, setShowCVV] = useState(false);

  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [proofUploading, setProofUploading] = useState(false);
  const [proofError, setProofError] = useState("");

  const [sellerProfiles, setSellerProfiles] = useState({});
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  const [placing, setPlacing] = useState(false);
  const [confirmedOrders, setConfirmedOrders] = useState([]); // array of orders, one per seller

  // ─── GUARDS ────────────────────────────────────────────────
  useEffect(() => {
    if (cartLoading) return;
    if (selectedCart.length === 0 && step !== "done") navigate("/cart");
  }, [cartLoading, selectedCart.length, step, navigate]);

  if (role === "seller") {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <span style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", fontSize: "32px" }}>
          Sellers cannot place orders
        </span>
      </div>
    );
  }

  // ─── TOTALS ────────────────────────────────────────────────
  const sellerGroups = useMemo(() => groupBySeller(selectedCart), [selectedCart]);
  const numSellers = sellerGroups.length;
  const subtotal = selectedCart.reduce((s, i) => s + i.price * i.quantity, 0);
  // Rs 150 shipping per seller order
  const shipping = numSellers * 150;
  const total = subtotal + shipping;

  const getDeliveryTime = (item) => {
    const live = products.find((p) => p.id === item.id);
    return live?.delivery || item.delivery || item.deliveryTime || "2–5 days";
  };

  // ─── LOAD SELLER PROFILES (for wallet step) ────────────────
  useEffect(() => {
    if (step !== "wallet") return;
    const uniqueSellerIds = [...new Set(selectedCart.map((i) => i.sellerId).filter(Boolean))];
    if (uniqueSellerIds.length === 0) return;

    setLoadingProfiles(true);
    Promise.all(uniqueSellerIds.map((id) => getUserById(id)))
      .then((results) => {
        const map = {};
        results.forEach((profile, idx) => {
          if (profile) map[String(uniqueSellerIds[idx])] = profile;
        });
        setSellerProfiles(map);
      })
      .finally(() => setLoadingProfiles(false));
  }, [step]);

  const walletSellerGroups = useMemo(() => {
    if (payType !== "jazzcash" && payType !== "easypaisa") return [];
    return sellerGroups.map((g) => {
      const profile = sellerProfiles?.[g.sellerId];
      const walletPhone = payType === "jazzcash"
        ? profile?.jazzcashPhone
        : profile?.easypaisaPhone;
      return {
        ...g,
        sellerName: profile?.name || "Seller",
        walletPhone: walletPhone || null,
      };
    });
  }, [payType, sellerGroups, sellerProfiles]);

  const hasUnavailableSeller = walletSellerGroups.some((g) => !g.walletPhone);

  // ─── HELPERS ───────────────────────────────────────────────
  const handleDeliveryContinue = () => {
    const e = {};
    if (!address.trim()) e.address = "Delivery address is required.";
    else if (address.trim().length < 10) e.address = "Please enter a complete address.";
    const phErr = validateMobilePhone(phone);
    if (phErr) e.phone = phErr;
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setStep("payment");
  };

  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1500);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); setCopiedKey(key); setTimeout(() => setCopiedKey(""), 1500); } catch {}
      document.body.removeChild(ta);
    }
  };

  const handleCardChange = (field, value) => {
    let processed = value;
    if (field === "number") processed = formatCardNumber(value);
    if (field === "expiry") processed = formatExpiry(value);
    if (field === "cvv") processed = value.replace(/\D/g, "").slice(0, 4);
    setCard((prev) => ({ ...prev, [field]: processed }));
    const validators = { number: validateCardNumber, expiry: validateExpiry, cvv: validateCVV, name: validateCardName };
    setCardErrors((prev) => ({ ...prev, [field]: validators[field](processed) }));
  };

  // ─── PLACE ONE ORDER PER SELLER ───────────────────────────
  // For instant payments (COD/Card): one order per seller group,
  // each with their items only and their portion of shipping.
  const placeInstantOrders = async (method) => {
    setPlacing(true);
    const buyerArg = user || { id: null, name: "Guest" };
    const placed = [];

    for (const group of sellerGroups) {
      const itemsForOrder = group.items.map((item) => ({
        ...item,
        delivery: getDeliveryTime(item),
      }));
      const groupShipping = 150;
      const groupTotal = group.subtotal + groupShipping;

      const order = await placeOrder(itemsForOrder, buyerArg, {
        address: address.trim(),
        phone: phone.trim(),
        paymentMethod: method,
        subtotal: group.subtotal,
        shipping: groupShipping,
        total: groupTotal,
        guestId: !user ? guestId : null,
      });

      if (order) placed.push(order);
    }

    if (placed.length === 0) {
      setPlacing(false);
      alert("Something went wrong placing your order. Please try again.");
      return;
    }

    await checkout(selectedCart);
    setConfirmedOrders(placed);
    setStep("done");
    setPlacing(false);
  };

  const handleCardSubmit = () => {
    const errs = {
      number: validateCardNumber(card.number),
      expiry: validateExpiry(card.expiry),
      cvv: validateCVV(card.cvv),
      name: validateCardName(card.name),
    };
    setCardErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    placeInstantOrders("Card");
  };

  const handleWalletContinue = () => {
    const err = validateMobilePhone(buyerWalletPhone);
    setPhoneError(err);
    if (err) return;
    setStep("proof");
  };

  const handleProofChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setProofError("File must be an image."); return; }
    if (file.size > 5 * 1024 * 1024) { setProofError("Image must be under 5 MB."); return; }
    setProofError("");
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  };

  // For wallet payments: upload ONE proof, then place one order per seller
  // each referencing the same proof URL.
  const handleProofSubmit = async () => {
    if (!proofFile) { setProofError("Please attach a screenshot of your payment."); return; }

    setProofUploading(true);
    setProofError("");

    const orderRef = user?.id || guestId || "anon";
    const { url, error } = await uploadPaymentProof(proofFile, orderRef);

    if (error || !url) {
      setProofUploading(false);
      setProofError(error || "Upload failed. Please try again.");
      return;
    }

    setPlacing(true);
    const buyerArg = user || { id: null, name: "Guest" };
    const placed = [];

    for (const group of walletSellerGroups) {
      const itemsForOrder = group.items.map((item) => ({
        ...item,
        delivery: getDeliveryTime(item),
      }));
      const groupShipping = 150;
      const groupTotal = group.subtotal + groupShipping;

      const sellerWalletInfo = [{
        sellerId: group.sellerId,
        sellerName: group.sellerName,
        walletType: payType === "jazzcash" ? "JazzCash" : "EasyPaisa",
        walletPhone: group.walletPhone,
        subtotal: group.subtotal,
      }];

      const order = await placeOrder(itemsForOrder, buyerArg, {
        address: address.trim(),
        phone: phone.trim(),
        paymentMethod: payType === "jazzcash" ? "JazzCash" : "EasyPaisa",
        buyerWalletPhone,
        sellerWalletInfo,
        paymentProofUrl: url,
        subtotal: group.subtotal,
        shipping: groupShipping,
        total: groupTotal,
        guestId: !user ? guestId : null,
      });

      if (order) placed.push(order);
    }

    if (placed.length === 0) {
      setPlacing(false);
      setProofUploading(false);
      setProofError("Something went wrong placing your order. Please try again.");
      return;
    }

    await checkout(selectedCart);
    setConfirmedOrders(placed);
    setStep("done");
    setProofUploading(false);
    setPlacing(false);
  };

  // ─── DONE SCREEN ───────────────────────────────────────────
  if (step === "done" && confirmedOrders.length > 0) {
    const isWaiting = confirmedOrders.some((o) => o.status === "waiting_confirmation");

    return (
      <div className="min-h-screen py-12 px-4 lg:px-20">
        <div className="max-w-[700px] mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[24px] bg-[#FFF6F8]/90 p-10 shadow-2xl text-center"
          >
            <div className="text-7xl mb-6">{isWaiting ? "⏳" : "✅"}</div>
            <h2 style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }} className="text-4xl mb-2">
              {isWaiting ? "Order Placed!" : "Order Confirmed!"}
            </h2>
            <p className="text-[#7A6C9D] mb-6">
              {isWaiting
                ? "Waiting for sellers to confirm your payment."
                : confirmedOrders.length > 1
                  ? `${confirmedOrders.length} separate orders placed — one per seller.`
                  : "Your order is on the way!"}
            </p>

            {/* One order number badge per seller */}
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {confirmedOrders.map((o) => (
                <div key={o.orderNumber} className="inline-block px-4 py-2 rounded-full bg-[#EDE8F9]">
                  <p className="text-[#4A3A7A] text-sm">
                    <span className="font-bold tracking-wider">{o.orderNumber}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* Per-order summaries */}
            <div className="space-y-4 mb-6">
              {confirmedOrders.map((order) => (
                <div key={order.orderNumber} className="text-left bg-white/70 rounded-[16px] p-5 space-y-2">
                  <p className="text-xs text-[#C8B6E2] uppercase tracking-wide">
                    Order {order.orderNumber}
                  </p>
                  {order.items.map((item) => {
                    const fullProduct = products.find((p) => p.id === item.id);
                    const imageUrl = fullProduct?.image || fullProduct?.images?.[0] || null;
                    return (
                      <Link
                        key={item.id}
                        to={`/products/${item.id}`}
                        className="flex items-center gap-3 p-2 rounded-[12px] hover:bg-[#F6C1CC]/20 transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-[10px] overflow-hidden bg-gradient-to-br from-[#F6C1CC]/30 to-[#C8B6E2]/30 flex-shrink-0">
                          {imageUrl
                            ? <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-xl">🧶</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[#2E2A4A] font-medium text-sm truncate group-hover:text-[#FF8FA3]">
                            {item.name} <span className="text-[#7A6C9D] font-normal">x{item.quantity}</span>
                          </p>
                          <p className="text-xs text-[#C8B6E2]">🚚 {item.delivery}</p>
                        </div>
                        <span className="text-[#FF8FA3] font-semibold text-sm flex-shrink-0">
                          Rs. {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </Link>
                    );
                  })}
                  <hr className="border-[#F6C1CC]" />
                  <div className="flex justify-between text-sm text-[#7A6C9D]">
                    <span>Subtotal</span><span>Rs. {order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#7A6C9D]">
                    <span>Shipping</span><span>Rs. {order.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-[#2E2A4A]">
                    <span>Total</span><span>Rs. {order.total.toFixed(2)}</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-[10px] bg-[#EDE8F9] text-[#4A3A7A] text-xs text-center">
                    Payment: <span className="font-medium">{order.paymentMethod}</span>
                    {order.status === "waiting_confirmation" && (
                      <span className="ml-2 text-amber-600">⏳ Awaiting seller approval</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-left bg-white/70 rounded-[16px] p-4 mb-6 space-y-1">
              <p className="text-xs text-[#C8B6E2] uppercase tracking-wide mb-1">Delivery To</p>
              <p className="text-sm text-[#2E2A4A] whitespace-pre-line">{confirmedOrders[0]?.address}</p>
              <p className="text-sm text-[#2E2A4A]">📞 {confirmedOrders[0]?.buyerPhone}</p>
            </div>

            <div className="text-center mb-6">
              <Link to="/my-orders" className="text-[#FF8FA3] text-sm underline hover:opacity-80">
                Track your orders in My Orders →
              </Link>
            </div>

            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
            >
              Continue Shopping
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── STEP UI ───────────────────────────────────────────────
  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[600px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-5xl mb-2">
            <span style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 35px rgba(255,143,163,0.7)" }}>
              Checkout
            </span>
          </h1>
          <p className="text-[#C8B6E2] text-sm">
            Total: Rs. {total.toFixed(2)}
            {numSellers > 1 && (
              <span className="ml-2 text-xs">(from {numSellers} sellers — {numSellers} separate orders)</span>
            )}
          </p>
        </motion.div>

        <div className="rounded-[24px] bg-[#FFF6F8]/95 p-8 shadow-2xl border-2 border-[#FF8FA3]/30">

          {/* ── DELIVERY ──────────────────────────────────── */}
          {step === "delivery" && (
            <div className="space-y-4">
              <h2 style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }} className="text-2xl mb-2">
                Delivery Details
              </h2>
              <p className="text-[#7A6C9D] text-sm mb-4">Where should we deliver your order?</p>

              <div>
                <label className="text-[#7A6C9D] text-xs mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Delivery Address *
                </label>
                <textarea
                  placeholder="House #, Street, Area, City, Province, Postal Code"
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); if (errors.address) setErrors({ ...errors, address: "" }); }}
                  rows={3}
                  className={inputStyle + " resize-none" + (errors.address ? " border-red-400" : "")}
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>

              <div>
                <label className="text-[#7A6C9D] text-xs mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Contact Number *
                </label>
                <input
                  placeholder="e.g. 03001234567"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); if (errors.phone) setErrors({ ...errors, phone: "" }); }}
                  className={inputStyle + (errors.phone ? " border-red-400" : "")}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              {numSellers > 1 && (
                <div className="rounded-[12px] bg-[#EDE8F9] p-3 text-xs text-[#7A6C9D]">
                  ℹ️ Your cart has items from <strong>{numSellers} sellers</strong>. They'll be split into {numSellers} separate orders, each with Rs. 150 shipping.
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => navigate("/cart")} className="flex-1 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A]">
                  Back to Cart
                </button>
                <button onClick={handleDeliveryContinue} className="flex-1 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-[1.02] transition-all">
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* ── PAYMENT METHOD ────────────────────────────── */}
          {step === "payment" && (
            <div className="space-y-3">
              <h2 style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }} className="text-2xl mb-2">
                Choose Payment
              </h2>
              {[
                { id: "cod",       label: "Cash on Delivery",    icon: Banknote,   desc: "Pay when your order arrives" },
                { id: "card",      label: "Debit / Credit Card", icon: CreditCard, desc: "Visa, Mastercard, UnionPay" },
                { id: "jazzcash",  label: "JazzCash",            icon: Smartphone, desc: "Pay via JazzCash, upload screenshot" },
                { id: "easypaisa", label: "EasyPaisa",           icon: Smartphone, desc: "Pay via EasyPaisa, upload screenshot" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  disabled={placing}
                  onClick={() => {
                    if (opt.id === "cod")  { placeInstantOrders("Cash on Delivery"); return; }
                    if (opt.id === "card") { setStep("card"); return; }
                    setPayType(opt.id);
                    setStep("wallet");
                  }}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-[16px] bg-[#F6C1CC]/20 border-2 border-[#7A6C9D]/10 hover:border-[#FF8FA3]/50 hover:bg-[#F6C1CC]/30 transition-all text-left disabled:opacity-50"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F6C1CC] to-[#C8B6E2] flex items-center justify-center flex-shrink-0">
                    <opt.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[#2E2A4A] font-medium">{opt.label}</p>
                    <p className="text-[#7A6C9D] text-xs">{opt.desc}</p>
                  </div>
                </button>
              ))}
              <button onClick={() => setStep("delivery")} className="w-full py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] mt-3">
                Back
              </button>
            </div>
          )}

          {/* ── CARD ──────────────────────────────────────── */}
          {step === "card" && (
            <div className="space-y-4">
              <h2 style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }} className="text-2xl mb-2">
                Card Details
              </h2>
              <div>
                <label className="text-[#7A6C9D] text-xs mb-1 block">Name on Card *</label>
                <input placeholder="e.g. Ali Hassan" value={card.name} onChange={(e) => handleCardChange("name", e.target.value)} className={inputStyle + (cardErrors.name ? " border-red-400" : "")} />
                {cardErrors.name && <p className="text-red-500 text-xs mt-1">{cardErrors.name}</p>}
              </div>
              <div>
                <label className="text-[#7A6C9D] text-xs mb-1 block">Card Number *</label>
                <input placeholder="1234 5678 9012 3456" value={card.number} onChange={(e) => handleCardChange("number", e.target.value)} className={inputStyle + (cardErrors.number ? " border-red-400" : "")} maxLength={23} />
                {cardErrors.number && <p className="text-red-500 text-xs mt-1">{cardErrors.number}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#7A6C9D] text-xs mb-1 block">Expiry *</label>
                  <input placeholder="08/27" value={card.expiry} onChange={(e) => handleCardChange("expiry", e.target.value)} className={inputStyle + (cardErrors.expiry ? " border-red-400" : "")} maxLength={5} />
                  {cardErrors.expiry && <p className="text-red-500 text-xs mt-1">{cardErrors.expiry}</p>}
                </div>
                <div>
                  <label className="text-[#7A6C9D] text-xs mb-1 block">CVV *</label>
                  <div className="relative">
                    <input type={showCVV ? "text" : "password"} placeholder="•••" value={card.cvv} onChange={(e) => handleCardChange("cvv", e.target.value)} className={inputStyle + " pr-10" + (cardErrors.cvv ? " border-red-400" : "")} maxLength={4} />
                    <button type="button" onClick={() => setShowCVV(!showCVV)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A6C9D]">
                      {showCVV ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {cardErrors.cvv && <p className="text-red-500 text-xs mt-1">{cardErrors.cvv}</p>}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep("payment")} disabled={placing} className="flex-1 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] disabled:opacity-50">Back</button>
                <button onClick={handleCardSubmit} disabled={placing} className="flex-1 py-3 rounded-full bg-[#FF8FA3] text-white disabled:opacity-50">
                  {placing ? "Placing..." : "Pay Now"}
                </button>
              </div>
            </div>
          )}

          {/* ── WALLET ────────────────────────────────────── */}
          {step === "wallet" && (
            <div className="space-y-4">
              <h2 style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }} className="text-2xl mb-2">
                {payType === "jazzcash" ? "JazzCash" : "EasyPaisa"} Payment
              </h2>

              {loadingProfiles ? (
                <div className="text-center py-8 text-[#7A6C9D]">
                  <div className="text-3xl mb-3">⏳</div>
                  <p className="text-sm">Loading seller info...</p>
                </div>
              ) : (
                <>
                  {hasUnavailableSeller && (
                    <div className="rounded-[14px] bg-red-50 border border-red-200 p-4">
                      <p className="text-red-500 text-sm font-medium mb-1">⚠ Some sellers haven't set up this wallet</p>
                      <p className="text-red-400 text-xs">Pick a different payment method, or contact the seller(s) below.</p>
                    </div>
                  )}

                  <p className="text-[#7A6C9D] text-sm">
                    Send the amount to each seller's wallet below, then upload one screenshot as proof.
                  </p>

                  <div className="space-y-3">
                    {walletSellerGroups.map((g) => (
                      <div key={g.sellerId} className="rounded-[14px] bg-[#EDE8F9] border border-[#C8B6E2] p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-xs text-[#7A6C9D]">Pay to seller</p>
                            <p className="text-[#2E2A4A] font-medium">{g.sellerName}</p>
                          </div>
                          <p className="text-[#FF8FA3] font-semibold">Rs. {g.subtotal.toFixed(2)}</p>
                        </div>
                        {g.walletPhone ? (
                          <div className="flex items-center gap-2 bg-white rounded-[10px] px-3 py-2">
                            <span className="text-[#2E2A4A] font-mono text-lg flex-1">{g.walletPhone}</span>
                            <button
                              onClick={() => copyToClipboard(g.walletPhone, "seller_" + g.sellerId)}
                              className="p-1.5 rounded-full hover:bg-[#F6C1CC]/40 transition-all"
                            >
                              {copiedKey === "seller_" + g.sellerId
                                ? <Check className="w-4 h-4 text-green-500" />
                                : <Copy className="w-4 h-4 text-[#7A6C9D]" />}
                            </button>
                          </div>
                        ) : (
                          <p className="text-red-400 text-xs italic">
                            This seller doesn't accept {payType === "jazzcash" ? "JazzCash" : "EasyPaisa"}.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="text-[#7A6C9D] text-xs mb-1 block">
                      Your {payType === "jazzcash" ? "JazzCash" : "EasyPaisa"} number *
                    </label>
                    <input
                      placeholder="e.g. 03001234567"
                      value={buyerWalletPhone}
                      onChange={(e) => { setBuyerWalletPhone(e.target.value); setPhoneError(validateMobilePhone(e.target.value)); }}
                      className={inputStyle + (phoneError ? " border-red-400" : "")}
                      disabled={hasUnavailableSeller}
                    />
                    {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setStep("payment")} className="flex-1 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A]">Back</button>
                    <button
                      onClick={handleWalletContinue}
                      disabled={hasUnavailableSeller}
                      className="flex-1 py-3 rounded-full bg-[#FF8FA3] text-white disabled:opacity-50"
                    >
                      Continue to Proof Upload
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── PROOF UPLOAD ──────────────────────────────── */}
          {step === "proof" && (
            <div className="space-y-4">
              <h2 style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }} className="text-2xl mb-2">
                Upload Payment Proof
              </h2>
              <p className="text-[#7A6C9D] text-sm">
                Attach a screenshot of your {payType === "jazzcash" ? "JazzCash" : "EasyPaisa"} payment(s).
              </p>

              <div className="rounded-[14px] bg-[#EDE8F9] border border-[#C8B6E2] p-4">
                <p className="text-[#2E2A4A] text-sm">
                  <strong>Total sent:</strong> Rs. {subtotal.toFixed(2)}
                </p>
                <p className="text-[#7A6C9D] text-xs mt-1">
                  Make sure the screenshot clearly shows the amount, recipient, and transaction reference.
                </p>
              </div>

              <div>
                <label className="cursor-pointer block">
                  <input type="file" accept="image/*" onChange={handleProofChange} className="hidden" />
                  <div className={`rounded-[16px] border-2 border-dashed p-6 text-center hover:bg-[#F6C1CC]/10 transition-all ${proofError ? "border-red-400" : "border-[#C8B6E2]"}`}>
                    {proofPreview ? (
                      <div className="space-y-2">
                        <img src={proofPreview} alt="Proof preview" className="max-h-64 mx-auto rounded-[12px]" />
                        <p className="text-[#7A6C9D] text-xs flex items-center justify-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5" /> Click to change
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-10 h-10 text-[#C8B6E2] mx-auto" />
                        <p className="text-[#2E2A4A] text-sm font-medium">Click to upload screenshot</p>
                        <p className="text-[#7A6C9D] text-xs">PNG, JPG, or HEIC · max 5 MB</p>
                      </div>
                    )}
                  </div>
                </label>
                {proofError && <p className="text-red-500 text-xs mt-2">{proofError}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep("wallet")} disabled={proofUploading || placing} className="flex-1 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] disabled:opacity-50">
                  Back
                </button>
                <button
                  onClick={handleProofSubmit}
                  disabled={!proofFile || proofUploading || placing}
                  className="flex-1 py-3 rounded-full bg-[#FF8FA3] text-white disabled:opacity-50"
                >
                  {proofUploading ? "Uploading..." : placing ? "Placing..." : "Submit & Place Order"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}