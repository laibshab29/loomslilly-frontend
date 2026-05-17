import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ChevronLeft, ChevronRight, X, ShoppingCart, Plus, Minus, User } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductContext";
import { useSellers } from "../context/SellerContext";
import { ConfirmModal } from "./shared/ConfirmModal";
import { Toast } from "./shared/Toast";

// ─── LIGHTBOX ────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);

  const prev = (e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + images.length) % images.length); };
  const next = (e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % images.length); };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute -top-4 -right-4 z-10 w-10 h-10 rounded-full bg-[#FF8FA3] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="rounded-[20px] overflow-hidden border-4 border-[#FF8FA3]/60 shadow-2xl shadow-[#FF8FA3]/30">
            <img src={images[current]} alt="" className="max-w-[85vw] max-h-[80vh] object-contain" />
          </div>

          {images.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:scale-110 transition-all">
                <ChevronLeft className="w-5 h-5 text-[#2E2A4A]" />
              </button>
              <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:scale-110 transition-all">
                <ChevronRight className="w-5 h-5 text-[#2E2A4A]" />
              </button>
              <div className="flex gap-2 mt-4">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                    className={"w-2 h-2 rounded-full transition-all " + (i === current ? "bg-[#FF8FA3] w-5" : "bg-white/50")}
                  />
                ))}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── PRODUCT CARD ─────────────────────────────────────────────
export function ProductCard({
  id, name, price, originalPrice, discount,
  image, images, badge, stock = 10, sellerId = null, onAddToCart,
  notificationStyle = "modal",
}) {
  const { addToCart, removeFromCart, updateQuantity, cart, stockError, clearStockError } = useCart();
  const { user, role } = useAuth();
  const { toggleLike, isLikedByUser, getDealsForProduct } = useProducts();
  const { getSellerById } = useSellers();
  const navigate = useNavigate();

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [outOfStockNotice, setOutOfStockNotice] = useState(false);
  const [sellerNotice, setSellerNotice] = useState(null);

  const useToast = notificationStyle === "toast";

  const allImages = images?.length > 0 ? images : image ? [image] : [];
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock < 20;
  const isOwnProduct = sellerId && user?.id === sellerId;
  const isSellerOnly = role === "seller";
  const isSaved = isLikedByUser(id, user?.id);

  const cartItem = cart?.find((item) => item.id === id);
  const cartQty = cartItem?.quantity || 0;

  const productDeals = getDealsForProduct ? getDealsForProduct(id) : [];
  const firstDeal = productDeals[0] || null;

  // ─── SELLER INFO ──────────────────────────────────────────────
  const seller = sellerId ? getSellerById(sellerId) : null;
  const sellerName = seller?.name || null;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isSellerOnly) { setSellerNotice("Sellers cannot add products to cart."); return; }
    if (isOwnProduct) { setSellerNotice("You cannot add your own product to your cart."); return; }
    if (isOutOfStock) { setOutOfStockNotice(true); return; }
    const product = { id, name, price, image: allImages[0] || null, images: allImages, stock, sellerId };
    addToCart(product, 1);
    if (onAddToCart) onAddToCart(product);
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    if (cartQty <= 1) removeFromCart(id);
    else updateQuantity(id, cartQty - 1);
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    if (allImages.length > 0) setLightboxOpen(true);
  };

  const handleCardClick = () => navigate("/products/" + id);

  // ─── NOTIFICATIONS ────────────────────────────────────────────
  const notifications = useToast ? (
    <>
      <Toast isOpen={outOfStockNotice} onClose={() => setOutOfStockNotice(false)} title="Out of Stock" message="Sorry, this product is currently out of stock." variant="warning" />
      <Toast isOpen={!!stockError} onClose={clearStockError} title="Not Enough Stock" message={stockError} variant="warning" />
      <Toast isOpen={!!sellerNotice} onClose={() => setSellerNotice(null)} title="Hold On" message={sellerNotice || ""} variant="info" />
    </>
  ) : (
    <>
      <ConfirmModal isOpen={outOfStockNotice} onClose={() => setOutOfStockNotice(false)} title="Out of Stock" message="Sorry, this product is currently out of stock. Check back soon!" variant="info" />
      <ConfirmModal isOpen={!!stockError} onClose={clearStockError} title="Not Enough Stock" message={stockError} variant="info" />
      <ConfirmModal isOpen={!!sellerNotice} onClose={() => setSellerNotice(null)} title="Hold On" message={sellerNotice || ""} variant="info" />
    </>
  );

  return (
    <>
      {lightboxOpen && allImages.length > 0 && (
        <Lightbox images={allImages} startIndex={0} onClose={() => setLightboxOpen(false)} />
      )}

      {notifications}

      <motion.div
        whileHover={{ scale: 1.03, y: -4 }}
        onClick={handleCardClick}
        className="relative rounded-[20px] bg-[#FFF6F8]/90 backdrop-blur-sm border-2 border-[#7A6C9D]/20 overflow-hidden shadow-lg group cursor-pointer flex flex-col"
        style={{ width: "100%", height: "440px" }}
      >
        {/* DEAL BADGE */}
        {firstDeal && (
          <Link
            to={"/deals/" + firstDeal.id}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-3 left-3 z-20 px-3 py-1 rounded-full bg-[#C8B6E2] text-[#2E2A4A] text-xs font-medium shadow-md hover:bg-[#FF8FA3] hover:text-white transition-colors truncate max-w-[120px]"
          >
            🏷️ {firstDeal.title}
          </Link>
        )}

        {/* STATIC BADGE */}
        {badge && !firstDeal && (
          <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-[#FF8FA3] text-white text-sm font-medium shadow-md">
            {badge}
          </div>
        )}

        {/* LIKE BUTTON */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleLike(id, user?.id); }}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:scale-110 transition-transform duration-300"
        >
          <Heart className={"w-5 h-5 " + (isSaved ? "fill-[#FF8FA3] text-[#FF8FA3]" : "text-[#7A6C9D]")} />
        </button>

        {/* IMAGE */}
        <div
          className="flex-shrink-0 bg-gradient-to-br from-[#F6C1CC]/30 to-[#C8B6E2]/30 flex items-center justify-center overflow-hidden relative"
          style={{ height: "220px" }}
          onClick={handleImageClick}
        >
          {allImages.length > 0 ? (
            <img
              src={allImages[0]}
              alt={name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-zoom-in"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
            >
              <div className="text-6xl text-[#7A6C9D]/30">🧶</div>
            </div>
          )}
          {allImages.length > 1 && (
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/40 text-white text-xs">
              +{allImages.length - 1} more
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="p-4 flex flex-col flex-1">
          <h4 className="text-base text-[#2E2A4A] mb-1 line-clamp-2 leading-snug">{name}</h4>

          {/* SELLER ATTRIBUTION */}
          {sellerName && sellerId && (
            <Link
              to={`/seller/${sellerId}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 mb-2 w-fit group/seller"
            >
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#F6C1CC] to-[#C8B6E2] flex items-center justify-center flex-shrink-0">
                <User className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-xs text-[#7A6C9D] group-hover/seller:text-[#FF8FA3] transition-colors truncate max-w-[120px]">
                {sellerName}
              </span>
            </Link>
          )}

          {/* PRICE */}
          <div className="flex items-end gap-2 mb-auto">
            {originalPrice && (
              <span className="text-xs line-through text-[#7A6C9D]">Rs. {originalPrice.toFixed(2)}</span>
            )}
            <span className="text-xl font-semibold text-[#FF8FA3]">Rs. {price.toFixed(2)}</span>
            {discount && (
              <span className="text-xs text-green-600 font-semibold">{discount}% OFF</span>
            )}
          </div>

          {/* CART ACTIONS */}
          <div className="mt-3">
            {isLowStock && !isOutOfStock && (
              <p className="text-xs text-amber-500 font-medium mb-2">⚠ Less stock left ({stock} remaining)</p>
            )}
            {isOutOfStock && cartQty === 0 && (
              <p className="text-xs text-red-400 font-medium mb-2">Out of Stock</p>
            )}

            <div className="flex items-center justify-between gap-2">
              {cartQty > 0 && !isOutOfStock ? (
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF8FA3]/10 border border-[#FF8FA3]/30"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={handleDecrement}
                    className="w-6 h-6 rounded-full bg-[#FF8FA3]/20 flex items-center justify-center hover:bg-[#FF8FA3]/40 transition-all"
                  >
                    <Minus className="w-3 h-3 text-[#FF8FA3]" />
                  </button>
                  <span className="text-sm text-[#2E2A4A] font-medium min-w-[16px] text-center">{cartQty}</span>
                  <button
                    onClick={handleAddToCart}
                    className="w-6 h-6 rounded-full bg-[#FF8FA3]/20 flex items-center justify-center hover:bg-[#FF8FA3]/40 transition-all"
                  >
                    <Plus className="w-3 h-3 text-[#FF8FA3]" />
                  </button>
                </div>
              ) : isOutOfStock ? (
                <span className="text-xs text-red-400 font-medium">Out of Stock</span>
              ) : (
                <div />
              )}

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isOwnProduct || isSellerOnly}
                className={
                  "flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-sm shadow-md transition-all duration-300 flex-shrink-0 " +
                  (isOutOfStock || isOwnProduct || isSellerOnly
                    ? "bg-gray-300 cursor-not-allowed text-gray-500"
                    : "bg-[#FF8FA3] hover:bg-[#FF8FA3]/90 hover:scale-105")
                }
              >
                <ShoppingCart className="w-4 h-4" />
                {isSellerOnly ? "Selling" : isOwnProduct ? "Yours" : "Add"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}