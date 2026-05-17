import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductContext";

const today = new Date().toISOString().split("T")[0];

export function Wishlist() {
  const { user, isGuest } = useAuth();
  const { products, deals, isLikedByUser, isDealLikedByUser } = useProducts();
  const navigate = useNavigate();

  if (isGuest) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <div className="text-7xl mb-6">🔒</div>
          <p className="text-[#FFF6F8] text-2xl mb-6">Sign in to view your wishlist</p>
          <button
            onClick={() => navigate("/signup")}
            className="px-8 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
          >
            Sign Up
          </button>
        </div>
      </div>
    );
  }

  // Liked products — exclude products the user uploaded themselves
  const likedProducts = products.filter(
    (p) => isLikedByUser(p.id, user?.id) && p.sellerId !== user?.id
  );

  // Liked deals — only non-expired ones
  const likedDeals = deals.filter(
    (d) => isDealLikedByUser(d.id, user?.id) && d.validDate >= today
  );

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[1200px] mx-auto">

        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-5xl lg:text-6xl mb-4">
            <span style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 35px rgba(255,143,163,0.7)" }}>
              My
            </span>
            {" "}
            <span style={{ fontFamily: "Fredoka, sans-serif", color: "#FFF6F8" }}>
              Wishlist
            </span>
          </h1>
          <p className="text-[#C8B6E2]">Products and deals you've saved</p>
        </div>

        {/* LIKED PRODUCTS */}
        <section className="mb-14">
          <h2 className="text-2xl mb-6" style={{ fontFamily: "Fredoka, sans-serif", color: "#FFF6F8" }}>
            ❤️ Saved Products ({likedProducts.length})
          </h2>

          {likedProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {likedProducts.map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate(`/products/${product.id}`)}
                  className="rounded-[20px] bg-[#FFF6F8]/90 overflow-hidden shadow-lg cursor-pointer border-2 border-[#7A6C9D]/20"
                >
                  <div className="h-48 bg-gradient-to-br from-[#F6C1CC]/30 to-[#C8B6E2]/30 flex items-center justify-center overflow-hidden">
                    {product.image || product.images?.[0] ? (
                      <img
                        src={product.image || product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-5xl">🧶</span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg text-[#2E2A4A] mb-1">{product.name}</h3>
                    <p className="text-[#7A6C9D] text-sm capitalize mb-2">
                      {product.category} • {product.type}
                    </p>
                    <p className="text-[#FF8FA3] text-xl font-semibold">
                      Rs. {product.price.toFixed(2)}
                    </p>
                    {product.stock <= 0 && (
                      <p className="text-red-400 text-xs mt-1 font-medium">Out of Stock</p>
                    )}
                    {product.stock > 0 && product.stock <= 20 && (
                      <p className="text-amber-500 text-xs mt-1 font-medium">
                        Only {product.stock} left
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] bg-[#FFF6F8]/10 border border-[#FFF6F8]/20 p-10 text-center">
              <p className="text-[#C8B6E2] text-lg">
                You haven't liked any products yet. Heart a product to save it here.
              </p>
            </div>
          )}
        </section>

        {/* LIKED DEALS */}
        <section>
          <h2 className="text-2xl mb-6" style={{ fontFamily: "Fredoka, sans-serif", color: "#FFF6F8" }}>
            🏷️ Saved Deals ({likedDeals.length})
          </h2>

          {likedDeals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {likedDeals.map((deal) => (
                <motion.div
                  key={deal.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate(`/deals/${deal.id}`)}
                  className="rounded-[20px] bg-[#FFF6F8]/90 p-6 shadow-lg cursor-pointer border-2 border-[#7A6C9D]/20"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg text-[#2E2A4A] font-medium">{deal.title}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-[#FF8FA3]/20 text-[#FF8FA3] flex-shrink-0 ml-2">
                      Deal
                    </span>
                  </div>
                  <div className="flex items-end gap-3 mb-3">
                    <span className="text-2xl font-bold text-[#FF8FA3]">
                      Rs. {Number(deal.discountedPrice).toFixed(2)}
                    </span>
                    <span className="text-sm line-through text-[#7A6C9D]">
                      Rs. {Number(deal.originalPrice).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-[#7A6C9D]">
                    Valid until{" "}
                    {new Date(deal.validDate + "T00:00:00").toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {deal.products?.slice(0, 3).map((p) => (
                      <span key={p.id} className="text-xs px-2 py-0.5 rounded-full bg-[#C8B6E2]/30 text-[#7A6C9D]">
                        {p.name}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] bg-[#FFF6F8]/10 border border-[#FFF6F8]/20 p-10 text-center">
              <p className="text-[#C8B6E2] text-lg">
                No saved deals yet, or your saved deals have expired.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}