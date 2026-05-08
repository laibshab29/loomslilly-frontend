import { ProductCard } from "../components/ProductCard";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
// 🔥 NEW IMPORT
import { useProducts } from "../context/ProductContext";
import { useNavigate } from "react-router-dom";

export function Crochet() {
  const { products } = useProducts();
 const { isSeller } = useAuth();
 const navigate = useNavigate();
  // 🔥 FILTER ONLY CROCHET PRODUCTS
  const crochetProducts = products.filter(
  (p) =>
    p.type?.toLowerCase() === "crochet"
);

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[1440px] mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl lg:text-7xl mb-4">

            <span
              style={{
                fontFamily: "Pacifico, cursive",
                color: "#FF8FA3",
                textShadow: "0 0 30px rgba(255, 143, 163, 0.6)",
              }}
            >
              Crochet
            </span>

            <span
              style={{
                fontFamily: "Fredoka, sans-serif",
                color: "#FFF6F8",
              }}
            >
              {" "}Collection
            </span>

          </h1>

          <p
            className="text-xl text-[#FFF6F8]"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Everything you need for your crochet projects
          </p>
           {isSeller && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => navigate("/upload")}
                className="px-5 py-2 rounded-full bg-[#FF8FA3] text-white text-lg 
                hover:bg-[#FF8FA3]/90 hover:scale-105 transition-all duration-300 
                shadow-[0_8px_25px_rgba(255,143,163,0.4)]"
                style={{ fontFamily: "Fredoka, sans-serif" }}
              >
                Upload Product
              </button>
            </div>
          )}
        </motion.div>

        {/* 🔥 PRODUCTS */}
        {crochetProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {crochetProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          // 🔥 EMPTY STATE (important)
          <div className="text-center py-20 text-[#FFF6F8]">
            No crochet products available yet.
          </div>
        )}
      </div>
    </div>
  );
}