import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2, Plus, Minus, CreditCard, Smartphone, Banknote,
  X, Eye, EyeOff, CheckSquare, Square, ShoppingBag, MapPin, Phone, Copy, Check,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrderContext";
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

// ─── DELIVERY DETAILS MODAL ───────────────────────────────────
function DeliveryDetailsModal({ isOpen, onClose, onContinue, defaultAddress, defaultPhone }) {
  const [address, setAddress] = useState(defaultAddress || "");
  const [phone, setPhone] = useState(defaultPhone || "");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setAddress(defaultAddress || "");
      setPhone(defaultPhone || "");
      setErrors({});
    }
  }, [isOpen, defaultAddress, defaultPhone]);

  const handleContinue = () => {
    const newErrors = {};
    if (!address.trim()) newErrors.address = "Delivery address is required.";
    else if (address.trim().length < 10) newErrors.address = "Please enter a complete address.";
    const phoneErr = validateMobilePhone(phone);
    if (phoneErr) newErrors.phone = phoneErr;
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    onContinue({ address: address.trim(), phone: phone.trim() });
  };

  const inputStyle =
    "w-full px-4 py-3 rounded-[16px] bg-[#F6C1CC]/20 border-2 border-[#7A6C9D]/20 outline-none focus:border-[#FF8FA3] text-[#2E2A4A] placeholder:text-[#7A6C9D] text-sm";

  return (
    <PortalModal>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/40 backdrop-blur-md"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
          >
            <motion.div
              initial={{ y: -20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              className="w-full max-w-[480px] rounded-[24px] bg-[#FFF6F8] p-8 shadow-2xl border-2 border-[#FF8FA3]/30"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }} className="text-2xl">Delivery Details</h2>
                <button onClick={onClose}><X className="w-5 h-5 text-[#7A6C9D]" /></button>
              </div>
              <p className="text-[#7A6C9D] text-sm mb-6">Where should we deliver your order?</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-[#7A6C9D] text-xs mb-1 flex items-center gap-1">
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
                  <label className="block text-[#7A6C9D] text-xs mb-1 flex items-center gap-1">
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
                <button onClick={handleContinue} className="w-full py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-[1.02] transition-all mt-2">
                  Continue to Payment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PortalModal>
  );
}

// ─── PAYMENT MODAL ─────────────────────────────────────────────
function PaymentModal({ isOpen, onClose, onSuccess, total, sellerWalletMap, items, getUserById }) {
  const [step, setStep] = useState("choose");
  const [payType, setPayType] = useState(""); // "jazzcash" | "easypaisa"
  const [buyerWalletPhone, setBuyerWalletPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [copiedKey, setCopiedKey] = useState("");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [cardErrors, setCardErrors] = useState({});
  const [showCVV, setShowCVV] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep("choose"); setPayType(""); setBuyerWalletPhone(""); setPhoneError("");
      setCard({ number: "", expiry: "", cvv: "", name: "" }); setCardErrors({});
      setCopiedKey("");
    }
  }, [isOpen]);

  // For JazzCash/EasyPaisa: group items by seller, look up each seller's wallet
  const sellerGroups = useMemo(() => {
    if (!payType || (payType !== "jazzcash" && payType !== "easypaisa")) return [];
    const groups = {};
    items.forEach((item) => {
      const sellerId = item.sellerId;
      if (!groups[sellerId]) {
        const seller = getUserById?.(sellerId);
        const walletPhone = payType === "jazzcash"
          ? seller?.jazzcashPhone
          : seller?.easypaisaPhone;
        groups[sellerId] = {
          sellerId,
          sellerName: seller?.name || "Seller",
          walletPhone: walletPhone || null,
          items: [],
          subtotal: 0,
        };
      }
      groups[sellerId].items.push(item);
      groups[sellerId].subtotal += item.price * item.quantity;
    });
    return Object.values(groups);
  }, [payType, items, getUserById]);

  const hasUnavailableSeller = sellerGroups.some((g) => !g.walletPhone);

  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1500);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      try { document.execCommand("copy"); setCopiedKey(key); setTimeout(() => setCopiedKey(""), 1500); } catch {}
      document.body.removeChild(textarea);
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

  const handleCardSubmit = () => {
    const errs = {
      number: validateCardNumber(card.number),
      expiry: validateExpiry(card.expiry),
      cvv: validateCVV(card.cvv),
      name: validateCardName(card.name),
    };
    setCardErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    onSuccess({ method: "Card" });
  };

  const handleWalletConfirm = () => {
    const err = validateMobilePhone(buyerWalletPhone);
    setPhoneError(err);
    if (err) return;

    const sellerWalletInfo = sellerGroups.map((g) => ({
      sellerId: g.sellerId,
      sellerName: g.sellerName,
      walletType: payType === "jazzcash" ? "JazzCash" : "EasyPaisa",
      walletPhone: g.walletPhone,
      subtotal: g.subtotal,
    }));

    onSuccess({
      method: payType === "jazzcash" ? "JazzCash" : "EasyPaisa",
      buyerWalletPhone,
      sellerWalletInfo,
    });
  };

  const inputStyle =
    "w-full px-4 py-3 rounded-[16px] bg-[#F6C1CC]/20 border-2 border-[#7A6C9D]/20 outline-none focus:border-[#FF8FA3] text-[#2E2A4A] placeholder:text-[#7A6C9D] text-sm";

  return (
    <PortalModal>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/40 backdrop-blur-md"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
          >
            <motion.div
              initial={{ y: -20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              className="w-full max-w-[520px] rounded-[24px] bg-[#FFF6F8] p-8 shadow-2xl border-2 border-[#FF8FA3]/30 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }} className="text-2xl">
                  {step === "choose"
                    ? "Choose Payment"
                    : step === "card"
                    ? "Card Details"
                    : `${payType === "jazzcash" ? "JazzCash" : "EasyPaisa"} Payment`}
                </h2>
                <button onClick={onClose}><X className="w-5 h-5 text-[#7A6C9D]" /></button>
              </div>

              <p className="text-[#7A6C9D] text-sm mb-6">
                Total: <span className="text-[#FF8FA3] font-semibold text-base">Rs. {total.toFixed(2)}</span>
              </p>

              {step === "choose" && (
                <div className="space-y-3">
                  {[
                    { id: "cod", label: "Cash on Delivery", icon: Banknote, desc: "Pay when your order arrives" },
                    { id: "card", label: "Debit / Credit Card", icon: CreditCard, desc: "Visa, Mastercard, UnionPay" },
                    { id: "jazzcash", label: "JazzCash", icon: Smartphone, desc: "Pay via JazzCash mobile wallet" },
                    { id: "easypaisa", label: "EasyPaisa", icon: Smartphone, desc: "Pay via EasyPaisa mobile wallet" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        if (opt.id === "cod") { onSuccess({ method: "Cash on Delivery" }); return; }
                        if (opt.id === "card") { setStep("card"); return; }
                        setPayType(opt.id); setStep("wallet");
                      }}
                      className="w-full flex items-center gap-4 px-5 py-4 rounded-[16px] bg-[#F6C1CC]/20 border-2 border-[#7A6C9D]/10 hover:border-[#FF8FA3]/50 hover:bg-[#F6C1CC]/30 transition-all text-left"
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
                </div>
              )}

              {step === "card" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[#7A6C9D] text-xs mb-1">Name on Card *</label>
                    <input placeholder="e.g. Ali Hassan" value={card.name} onChange={(e) => handleCardChange("name", e.target.value)} className={inputStyle + (cardErrors.name ? " border-red-400" : "")} />
                    {cardErrors.name && <p className="text-red-500 text-xs mt-1">{cardErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-[#7A6C9D] text-xs mb-1">Card Number *</label>
                    <input placeholder="1234 5678 9012 3456" value={card.number} onChange={(e) => handleCardChange("number", e.target.value)} className={inputStyle + (cardErrors.number ? " border-red-400" : "")} maxLength={23} />
                    {cardErrors.number && <p className="text-red-500 text-xs mt-1">{cardErrors.number}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#7A6C9D] text-xs mb-1">Expiry *</label>
                      <input placeholder="08/27" value={card.expiry} onChange={(e) => handleCardChange("expiry", e.target.value)} className={inputStyle + (cardErrors.expiry ? " border-red-400" : "")} maxLength={5} />
                      {cardErrors.expiry && <p className="text-red-500 text-xs mt-1">{cardErrors.expiry}</p>}
                    </div>
                    <div>
                      <label className="block text-[#7A6C9D] text-xs mb-1">CVV *</label>
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
                    <button onClick={() => setStep("choose")} className="flex-1 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A]">Back</button>
                    <button onClick={handleCardSubmit} className="flex-1 py-3 rounded-full bg-[#FF8FA3] text-white">Pay Now</button>
                  </div>
                </div>
              )}

              {step === "wallet" && (
                <div className="space-y-4">

                  {hasUnavailableSeller && (
                    <div className="rounded-[14px] bg-red-50 border border-red-200 p-4">
                      <p className="text-red-500 text-sm font-medium mb-1">⚠ Some sellers haven't set up this wallet</p>
                      <p className="text-red-400 text-xs">
                        Pick a different payment method, or contact the seller(s) below.
                      </p>
                    </div>
                  )}

                  <p className="text-[#7A6C9D] text-sm">
                    Send the amount to each seller's wallet below, then enter your wallet number so they can verify your payment.
                  </p>

                  {/* Seller wallets */}
                  <div className="space-y-3">
                    {sellerGroups.map((g) => (
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
                              title="Copy number"
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

                  {/* Buyer's wallet for verification */}
                  <div>
                    <label className="block text-[#7A6C9D] text-xs mb-1">
                      Your {payType === "jazzcash" ? "JazzCash" : "EasyPaisa"} number (so seller can verify) *
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

                  <div className="rounded-[12px] bg-amber-50 border border-amber-200 p-3">
                    <p className="text-amber-700 text-xs">
                      📋 Once seller(s) confirm receiving payment, your order will be marked "On Way."
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setStep("choose")} className="flex-1 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A]">Back</button>
                    <button
                      onClick={handleWalletConfirm}
                      disabled={hasUnavailableSeller}
                      className="flex-1 py-3 rounded-full bg-[#FF8FA3] text-white disabled:opacity-50"
                    >
                      I've Paid — Confirm Order
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PortalModal>
  );
}

// ─── MAIN CART PAGE ───────────────────────────────────────────
export function Cart() {
  const {
    cart, selectedCart, removeFromCart, updateQuantity,
    checkout, stockError, clearStockError,
    toggleSelect, selectAll, clearSelection, isSelected,
  } = useCart();
  const { products } = useProducts();
  const { placeOrder, getOrderByNumber } = useOrders();
  const { user, role, guestId, getUserById } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState({ address: "", phone: "" });
  const [retryOrderNumber, setRetryOrderNumber] = useState(null);

  // ─── RETRY FLOW: detect ?retry=ORDER_NUMBER URL param ──────
  useEffect(() => {
    const retryParam = searchParams.get("retry");
    if (!retryParam) return;
    const oldOrder = getOrderByNumber(retryParam);
    if (!oldOrder) return;

    setRetryOrderNumber(retryParam);
    setDeliveryDetails({ address: oldOrder.address, phone: oldOrder.buyerPhone });
    // Jump straight to payment step — items + delivery already known
    setShowPaymentModal(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getLiveStock = (itemId) => {
    const liveProduct = products.find((p) => p.id === itemId);
    return liveProduct?.stock ?? 0;
  };

  const getDeliveryTime = (item) => {
    const live = products.find((p) => p.id === item.id);
    return live?.delivery || item.delivery || item.deliveryTime || "2–5 days";
  };

  // For retry: use the original order's items. For new orders: use selectedCart
  const retryOrder = retryOrderNumber ? getOrderByNumber(retryOrderNumber) : null;
  const itemsForCheckout = retryOrder ? retryOrder.items : selectedCart;

  const subtotal = itemsForCheckout.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = itemsForCheckout.length > 0 ? 150 : 0;
  const total = retryOrder ? retryOrder.total : subtotal + shipping;

  const allSelected = cart.length > 0 && cart.every((item) => isSelected(item.id));

  const handleProceedToCheckout = () => {
    setShowDeliveryModal(true);
  };

  const handleDeliveryContinue = (details) => {
    setDeliveryDetails(details);
    setShowDeliveryModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (paymentInfo) => {
    setShowPaymentModal(false);
    const { method, buyerWalletPhone, sellerWalletInfo } = paymentInfo;

    const itemsForOrder = itemsForCheckout.map((item) => ({
      ...item,
      delivery: getDeliveryTime(item),
    }));

    const buyerArg = user || { id: null, name: "Guest" };

    const order = placeOrder(itemsForOrder, buyerArg, {
      address: deliveryDetails.address,
      phone: deliveryDetails.phone,
      paymentMethod: method,
      buyerWalletPhone: buyerWalletPhone || "",
      sellerWalletInfo: sellerWalletInfo || [],
      subtotal: retryOrder ? retryOrder.subtotal : subtotal,
      shipping: retryOrder ? retryOrder.shipping : shipping,
      total,
      guestId: !user ? guestId : null,
      existingOrderNumber: retryOrderNumber || null,
    });

    // For new orders only: clear from cart. Retries don't touch cart.
    if (!retryOrderNumber) {
      checkout(selectedCart);
    }

    setConfirmedOrder(order);
    setOrderPlaced(true);

    // Clear retry param from URL
    if (retryOrderNumber) {
      searchParams.delete("retry");
      setSearchParams(searchParams);
    }
  };

  const handleContinueShopping = () => {
    setOrderPlaced(false);
    setConfirmedOrder(null);
    setRetryOrderNumber(null);
    setDeliveryDetails({ address: "", phone: "" });
    navigate("/");
  };

  if (role === "seller") {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <span style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", fontSize: "32px", textShadow: "0 0 25px rgba(255,143,163,0.6)" }}>
          Sellers cannot access the cart
        </span>
      </div>
    );
  }

  const isWalletPayment = confirmedOrder?.paymentMethod === "JazzCash" || confirmedOrder?.paymentMethod === "EasyPaisa";
  const isWaitingConfirmation = confirmedOrder?.status === "waiting_confirmation";

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">

      <StockModal message={stockError} onClose={clearStockError} />

      <DeliveryDetailsModal
        isOpen={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
        onContinue={handleDeliveryContinue}
        defaultAddress={deliveryDetails.address || user?.address || ""}
        defaultPhone={deliveryDetails.phone || user?.phone || ""}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => { setShowPaymentModal(false); if (retryOrderNumber) { setRetryOrderNumber(null); searchParams.delete("retry"); setSearchParams(searchParams); } }}
        onSuccess={handlePaymentSuccess}
        total={total}
        items={itemsForCheckout}
        getUserById={getUserById}
      />

      <div className="max-w-[1200px] mx-auto">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-5xl lg:text-6xl mb-4">
            <span style={{ fontFamily: "Fredoka, sans-serif", color: "#F4F1F8", fontWeight: 500 }}>Your </span>
            <span style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 35px rgba(255,143,163,0.7)" }}>Cart</span>
          </h1>
        </motion.div>

        {orderPlaced && confirmedOrder ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[24px] bg-[#FFF6F8]/90 p-10 shadow-2xl text-center max-w-[700px] mx-auto"
          >
            <div className="text-7xl mb-6">{isWaitingConfirmation ? "⏳" : "✅"}</div>
            <h2 style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }} className="text-4xl mb-2">
              {isWaitingConfirmation ? "Order Placed!" : "Order Confirmed!"}
            </h2>
            <p className="text-[#7A6C9D] mb-2">
              {isWaitingConfirmation
                ? "Awaiting payment confirmation from seller."
                : "Your order has been placed successfully."}
            </p>

            <div className="inline-block px-4 py-2 rounded-full bg-[#EDE8F9] mb-8 mt-2">
              <p className="text-[#4A3A7A] text-sm">
                Order Number: <span className="font-bold tracking-wider">{confirmedOrder.orderNumber}</span>
              </p>
            </div>

            <div className="text-left bg-white/70 rounded-[16px] p-6 mb-6 space-y-3">
              {confirmedOrder.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#2E2A4A]">{item.name} <span className="text-[#7A6C9D] text-sm">x{item.quantity}</span></p>
                    <p className="text-xs text-[#C8B6E2]">🚚 Delivery: {item.delivery}</p>
                  </div>
                  <span className="text-[#FF8FA3] font-semibold">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}

              <hr className="border-[#F6C1CC] my-2" />

              <div className="flex justify-between text-sm text-[#7A6C9D]"><span>Subtotal</span><span>Rs. {confirmedOrder.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm text-[#7A6C9D]"><span>Shipping</span><span>Rs. {confirmedOrder.shipping.toFixed(2)}</span></div>
              <div className="flex justify-between text-lg font-bold text-[#2E2A4A]"><span>Total</span><span>Rs. {confirmedOrder.total.toFixed(2)}</span></div>

              <hr className="border-[#F6C1CC] my-2" />

              <div>
                <p className="text-xs text-[#C8B6E2] uppercase tracking-wide mb-1">Delivery To</p>
                <p className="text-sm text-[#2E2A4A] whitespace-pre-line">{confirmedOrder.address}</p>
                <p className="text-sm text-[#2E2A4A] mt-1">📞 {confirmedOrder.buyerPhone}</p>
              </div>

              <div className="mt-3 px-4 py-2 rounded-[10px] bg-[#EDE8F9] text-[#4A3A7A] text-sm text-center">
                Payment: <span className="font-medium">{confirmedOrder.paymentMethod}</span>
              </div>

              {/* Wallet payment notice */}
              {isWalletPayment && (
                <div className="px-4 py-3 rounded-[10px] bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                  ⏳ <strong>Payment verification underway.</strong> Once the seller confirms receiving your payment, your delivery will be on the way.
                </div>
              )}
            </div>

            <button onClick={handleContinueShopping} className="px-8 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all">
              Continue Shopping
            </button>
          </motion.div>

        ) : cart.length === 0 && !retryOrderNumber ? (
          <div className="text-center py-20">
            <span style={{ fontSize: "36px", fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 35px rgba(255,143,163,0.7)" }}>
              Your cart is empty
            </span>
          </div>

        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">

              <div className="flex items-center justify-between px-2 mb-1">
                <button onClick={allSelected ? clearSelection : selectAll} className="flex items-center gap-2 text-[#C8B6E2] hover:text-[#FF8FA3] text-sm">
                  {allSelected ? <CheckSquare className="w-5 h-5 text-[#FF8FA3]" /> : <Square className="w-5 h-5" />}
                  {allSelected ? "Deselect All" : "Select All"}
                </button>
                {selectedCart.length > 0 && (
                  <span className="text-xs text-[#C8B6E2]">{selectedCart.length} of {cart.length} selected</span>
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
                        {selected ? <CheckSquare className="w-5 h-5 text-[#FF8FA3]" /> : <Square className="w-5 h-5 text-[#C8B6E2]" />}
                      </button>
                      {item.image && (
                        <img src={item.image} alt={item.name} onClick={() => navigate(`/products/${item.id}`)} className="w-16 h-16 object-cover rounded-[12px] flex-shrink-0 cursor-pointer hover:scale-105 transition-transform" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 onClick={() => navigate(`/products/${item.id}`)} className="text-[#2E2A4A] font-medium truncate cursor-pointer hover:text-[#FF8FA3]">{item.name}</h3>
                        <p className="text-[#FF8FA3] font-semibold">Rs. {item.price}</p>
                        <p className="text-xs text-[#C8B6E2] mt-0.5">🚚 Delivery: {deliveryTime}</p>
                        {isOutOfStock ? <p className="text-xs text-red-400 font-medium">⚠ Out of Stock</p>
                          : liveStock < item.quantity ? <p className="text-xs text-amber-500 font-medium">⚠ Only {liveStock} left</p>
                          : <p className="text-xs text-[#C8B6E2]">{liveStock} available</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => { if (item.quantity <= 1) removeFromCart(item.id); else updateQuantity(item.id, item.quantity - 1); }} className="w-8 h-8 rounded-full bg-[#F6C1CC]/40 flex items-center justify-center"><Minus className="w-4 h-4 text-[#7A6C9D]" /></button>
                        <span className="w-6 text-center text-[#2E2A4A] font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= liveStock} className={`w-8 h-8 rounded-full flex items-center justify-center ${item.quantity >= liveStock ? "bg-gray-100 cursor-not-allowed" : "bg-[#F6C1CC]/40"}`}><Plus className={`w-4 h-4 ${item.quantity >= liveStock ? "text-gray-300" : "text-[#7A6C9D]"}`} /></button>
                      </div>
                      <p className="text-[#FF8FA3] font-semibold flex-shrink-0">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                      <button onClick={() => removeFromCart(item.id)} className="p-2 rounded-full hover:bg-[#FF8FA3]/20"><Trash2 className="w-4 h-4 text-[#FF8FA3]" /></button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="rounded-[24px] bg-[#FFF6F8]/90 p-8 shadow-xl h-fit">
              <h2 style={{ fontFamily: "Fredoka, sans-serif" }} className="text-2xl text-[#2E2A4A] mb-6">Order Summary</h2>
              {selectedCart.length === 0 ? (
                <div className="text-center py-6">
                  <ShoppingBag className="w-10 h-10 text-[#C8B6E2] mx-auto mb-3" />
                  <p className="text-[#C8B6E2] text-sm">Select items above to see your order summary.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {selectedCart.map((item) => (
                      <div key={item.id} className="text-sm text-[#7A6C9D]">
                        <div className="flex justify-between">
                          <span className="truncate max-w-[160px]">{item.name} x{item.quantity}</span>
                          <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-[#C8B6E2] ml-1">🚚 {getDeliveryTime(item)}</p>
                      </div>
                    ))}
                  </div>
                  <hr className="border-[#F6C1CC] mb-4" />
                  <div className="flex justify-between text-sm text-[#7A6C9D] mb-2"><span>Subtotal</span><span>Rs. {subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm text-[#7A6C9D] mb-4"><span>Shipping</span><span>Rs. {shipping.toFixed(2)}</span></div>
                  <div className="flex justify-between text-lg font-bold text-[#2E2A4A] mb-6"><span>Total</span><span>Rs. {total.toFixed(2)}</span></div>
                  <button onClick={handleProceedToCheckout} className="w-full py-4 rounded-full bg-[#FF8FA3] text-white hover:scale-[1.02] transition-all shadow-lg">
                    Proceed to Checkout
                  </button>
                  <p className="text-xs text-center mt-4 text-[#C8B6E2]">COD · Card · JazzCash · EasyPaisa</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}