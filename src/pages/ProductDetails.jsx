import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ChevronLeft, ChevronRight, X, ShoppingCart, Truck, Tag, Package, ArrowLeft } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

// ─── PORTAL WRAPPER ───────────────────────────────────────────
function PortalModal({ children }) {
  return createPortal(children, document.body);
}

// ─── LIGHTBOX ─────────────────────────────────────────────────
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
        className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="relative flex flex-col items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute -top-5 -right-5 z-10 w-10 h-10 rounded-full bg-[#FF8FA3] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="rounded-[20px] overflow-hidden border-4 border-[#FF8FA3]/60 shadow-2xl shadow-[#FF8FA3]/30">
            <img
              src={images[current]}
              alt={`view-${current}`}
              className="max-w-[85vw] max-h-[80vh] object-contain"
            />
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
                    className={`h-2 rounded-full transition-all ${i === current ? "bg-[#FF8FA3] w-6" : "bg-white/50 w-2"}`}
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

// ─── OUT OF STOCK MODAL ───────────────────────────────────────
function OutOfStockModal({ onClose }) {
  return (
    <PortalModal>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="bg-[#FFF6F8] rounded-[28px] p-10 max-w-[380px] w-full mx-4 text-center shadow-2xl border-2 border-[#FF8FA3]/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-6xl mb-4">🚫</div>
            <h2 style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }} className="text-3xl mb-3">Out of Stock</h2>
            <p className="text-[#7A6C9D] mb-6 leading-relaxed">Sorry, this product is currently out of stock. Check back soon!</p>
            <button onClick={onClose} className="px-8 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all">Got it</button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </PortalModal>
  );
}

// ─── NOT ENOUGH STOCK MODAL ───────────────────────────────────
function StockExceededModal({ message, onClose }) {
  return (
    <PortalModal>
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PortalModal>
  );
}

export function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, deals, toggleLike, isLikedByUser, getDealsForProduct } = useProducts();
  const { addToCart, cart, stockError, clearStockError } = useCart();
  const { user, role } = useAuth();

  const product = products.find((p) => p.id === Number(id));

  const [slideIndex, setSlideIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxStart, setLightboxStart] = useState(0);
  const [outOfStockModal, setOutOfStockModal] = useState(false);
  const [addedPulse, setAddedPulse] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <div className="text-7xl mb-6">🔍</div>
          <p className="text-[#FFF6F8] text-2xl mb-6">Product not found.</p>
          <button onClick={() => navigate(-1)} className="px-8 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const allImages = product.images?.length > 0 ? product.images : product.image ? [product.image] : [];
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock < 20;
  const isOwnProduct = product.sellerId && user?.id === product.sellerId;
  const isSellerOnly = role === "seller";
  const isSaved = isLikedByUser(product.id, user?.id);
  const cartItem = cart?.find((item) => item.id === product.id);
  const cartQty = cartItem?.quantity || 0;
  const productDeals = getDealsForProduct ? getDealsForProduct(product.id) : [];

  const openLightbox = (index) => { setLightboxStart(index); setLightboxOpen(true); };

  const handleAddToCart = () => {
    if (isSellerOnly || isOwnProduct) return;
    if (isOutOfStock) { setOutOfStockModal(true); return; }

    // ✅ Block when cart quantity already equals or exceeds available stock
    if (cartQty >= product.stock) {
      // Trigger via addToCart so CartContext sets stockError,
      // which StockExceededModal below listens to.
    }

    const p = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: allImages[0] || null,
      images: allImages,
      stock: product.stock,
      sellerId: product.sellerId,
    };
    addToCart(p, 1);
    setAddedPulse(true);
    setTimeout(() => setAddedPulse(false), 600);
  };

  return (
    <>
      {lightboxOpen && <Lightbox images={allImages} startIndex={lightboxStart} onClose={() => setLightboxOpen(false)} />}
      {outOfStockModal && <OutOfStockModal onClose={() => setOutOfStockModal(false)} />}

      {/* ✅ Portaled — renders at document.body level, backdrop-blur always visible */}
      <StockExceededModal message={stockError} onClose={clearStockError} />

      <div className="min-h-screen py-12 px-4 lg:px-20">
        <div className="max-w-[1100px] mx-auto">

          {/* BACK */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#C8B6E2] hover:text-[#FFF6F8] mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span style={{ fontFamily: "Fredoka, sans-serif" }}>Back</span>
          </button>

          <div className="grid lg:grid-cols-2 gap-12">

            {/* ── LEFT: IMAGES ── */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              {/* MAIN IMAGE */}
              <div
                className="rounded-[24px] overflow-hidden bg-gradient-to-br from-[#F6C1CC]/30 to-[#C8B6E2]/30 flex items-center justify-center cursor-zoom-in border-2 border-[#7A6C9D]/20 shadow-xl mb-4"
                style={{ height: "400px" }}
                onClick={() => allImages.length > 0 && openLightbox(slideIndex)}
              >
                {allImages.length > 0 ? (
                  <img
                    src={allImages[slideIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="text-8xl text-[#7A6C9D]/20">🧶</div>
                )}
              </div>

              {/* THUMBNAILS */}
              {allImages.length > 1 && (
                <div className="flex gap-3 flex-wrap">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSlideIndex(i)}
                      className={`w-16 h-16 rounded-[12px] overflow-hidden border-2 transition-all ${i === slideIndex ? "border-[#FF8FA3] scale-105" : "border-[#7A6C9D]/20 hover:border-[#FF8FA3]/50"}`}
                    >
                      <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* ── RIGHT: DETAILS ── */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex flex-col gap-5">

              {/* DEAL TAGS */}
              {productDeals.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {productDeals.map((deal) => (
                    <Link
                      key={deal.id}
                      to={`/deals/${deal.id}`}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#C8B6E2]/30 text-[#FFF6F8] text-xs hover:bg-[#FF8FA3]/30 transition-colors border border-[#C8B6E2]/40"
                    >
                      <Tag className="w-3 h-3" />
                      {deal.title}
                    </Link>
                  ))}
                </div>
              )}

              {/* NAME + LIKE */}
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-4xl text-[#FFF6F8] leading-tight" style={{ fontFamily: "Fredoka, sans-serif" }}>
                  {product.name}
                </h1>
                <button
                  onClick={() => toggleLike(product.id, user?.id)}
                  className="flex-shrink-0 p-3 rounded-full bg-[#FFF6F8]/10 border border-[#FFF6F8]/20 hover:scale-110 transition-all"
                >
                  <Heart className={`w-6 h-6 ${isSaved ? "fill-[#FF8FA3] text-[#FF8FA3]" : "text-[#C8B6E2]"}`} />
                </button>
              </div>

              {/* BADGE */}
              {product.badge && (
                <span className="self-start px-4 py-1 rounded-full bg-[#FF8FA3] text-white text-sm font-medium">
                  {product.badge}
                </span>
              )}

              {/* PRICE */}
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold text-[#FF8FA3]" style={{ fontFamily: "Fredoka, sans-serif" }}>
                  Rs. {product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg line-through text-[#C8B6E2]">Rs. {product.originalPrice.toFixed(2)}</span>
                )}
              </div>

              {/* META PILLS */}
              <div className="flex flex-wrap gap-2">
                {product.category && (
                  <span className="px-3 py-1 rounded-full bg-[#FFF6F8]/10 text-[#C8B6E2] text-sm border border-[#FFF6F8]/20 capitalize">
                    📂 {product.category}
                  </span>
                )}
                {product.type && (
                  <span className="px-3 py-1 rounded-full bg-[#FFF6F8]/10 text-[#C8B6E2] text-sm border border-[#FFF6F8]/20 capitalize">
                    🎨 {product.type}
                  </span>
                )}
                {product.delivery && (
                  <span className="px-3 py-1 rounded-full bg-[#FFF6F8]/10 text-[#C8B6E2] text-sm border border-[#FFF6F8]/20">
                    🚚 {product.delivery}
                  </span>
                )}
              </div>

              {/* STOCK STATUS */}
              <div>
                {isOutOfStock ? (
                  <p className="text-red-400 font-medium flex items-center gap-2">
                    <Package className="w-4 h-4" /> Out of Stock
                  </p>
                ) : isLowStock ? (
                  <p className="text-amber-400 font-medium flex items-center gap-2">
                    <Package className="w-4 h-4" /> Only {product.stock} left — order soon!
                  </p>
                ) : (
                  <p className="text-green-400 font-medium flex items-center gap-2">
                    <Package className="w-4 h-4" /> In Stock ({product.stock} available)
                  </p>
                )}
              </div>

              {/* DETAILS */}
              {product.details && (
                <div className="rounded-[16px] bg-[#FFF6F8]/10 border border-[#FFF6F8]/20 p-5">
                  <p className="text-[#C8B6E2] text-sm mb-2 uppercase tracking-widest text-xs">About this product</p>
                  <p className="text-[#FFF6F8] leading-relaxed">{product.details}</p>
                </div>
              )}

              {/* CART QTY INDICATOR */}
              {cartQty > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-[#C8B6E2] text-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{cartQty} already in your cart</span>
                </motion.div>
              )}

              {/* ADD TO CART */}
              {!isSellerOnly && !isOwnProduct && (
                <motion.button
                  animate={addedPulse ? { scale: [1, 1.05, 1] } : {}}
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex items-center justify-center gap-3 w-full py-4 rounded-full text-white text-lg shadow-lg transition-all
                    ${isOutOfStock ? "bg-gray-400 cursor-not-allowed" : "bg-[#FF8FA3] hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,143,163,0.4)]"}`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </motion.button>
              )}

              {isOwnProduct && (
                <div className="w-full py-4 rounded-full bg-gray-200 text-gray-500 text-center">
                  This is your product
                </div>
              )}
              {isSellerOnly && !isOwnProduct && (
                <div className="w-full py-4 rounded-full bg-gray-200 text-gray-500 text-center">
                  Sellers cannot purchase
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}