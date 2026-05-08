import { motion } from "framer-motion";
import { Heart } from "lucide-react";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductContext";

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  discount,
  image,
  badge,
  stock = 10,
  sellerId = null,
  onAddToCart,
}) {
  const { addToCart } = useCart();
  const { user, role } = useAuth();
  const { toggleLike, isLikedByUser } = useProducts();

  const isOutOfStock = stock <= 0;
  const isOwnProduct = sellerId && user?.id === sellerId;
  const isSellerOnly = role === "seller";

  // 🔥 Derived from persistent storage — no local useState
  const isSaved = isLikedByUser(id, user?.id);

  const handleAddToCart = () => {
    if (isSellerOnly) {
      alert("Sellers cannot add products to cart.");
      return;
    }
    if (isOwnProduct) {
      alert("You cannot add your own product.");
      return;
    }
    if (isOutOfStock) {
      alert("This product is out of stock.");
      return;
    }

    const product = { id, name, price, image, stock, sellerId };
    addToCart(product, 1);
    if (onAddToCart) onAddToCart(product);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      className="relative rounded-[20px] bg-[#FFF6F8]/90 backdrop-blur-sm border-2 border-[#7A6C9D]/20 overflow-hidden shadow-lg group h-full flex flex-col"
    >
      {/* Badge */}
      {badge && (
        <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-[#FF8FA3] text-white text-sm font-medium shadow-md">
          {badge}
        </div>
      )}

      {/* Save / Like Button */}
      <button
        onClick={() => toggleLike(id, user?.id)}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:scale-110 transition-transform duration-300"
      >
        <Heart
          className={`w-5 h-5 ${
            isSaved
              ? "fill-[#FF8FA3] text-[#FF8FA3]"
              : "text-[#7A6C9D]"
          }`}
        />
      </button>

      {/* Image */}
      <div className="aspect-square bg-gradient-to-br from-[#F6C1CC]/30 to-[#C8B6E2]/30 flex items-center justify-center">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-6xl text-[#7A6C9D]/30">🧶</div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h4 className="text-lg text-[#2E2A4A] mb-2">{name}</h4>

        {isOutOfStock && (
          <div className="text-sm text-red-500 mb-2 font-semibold">
            Out of Stock
          </div>
        )}

        <div className="flex items-end justify-between mt-auto gap-4">
          <div className="flex flex-col">
            {originalPrice && (
              <span className="text-sm line-through text-[#7A6C9D]">
                Rs. {originalPrice.toFixed(2)}
              </span>
            )}
            <span className="text-2xl font-semibold text-[#FF8FA3]">
              Rs. {price.toFixed(2)}
            </span>
            {discount && (
              <span className="text-sm text-green-600 font-semibold">
                {discount}% OFF
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isOwnProduct || isSellerOnly}
            className={`px-4 py-2 rounded-full text-white shadow-md transition-all duration-300
              ${
                isOutOfStock || isOwnProduct
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#FF8FA3] hover:bg-[#FF8FA3]/90 hover:scale-105"
              }
            `}
          >
            {isSellerOnly
              ? "Selling Mode"
              : isOwnProduct
              ? "Your Product"
              : "Add to Cart"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}