// src/pages/ForYou.jsx
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useProducts } from "../context/ProductContext";
import { useAuth } from "../context/AuthContext";
import { ProductCard } from "../components/ProductCard";
import { SortBar, sortProducts } from "../components/SortBar";

function getForYouProducts(products, deals, userId, likedMap) {
  const userLiked = likedMap?.[String(userId)] || [];
  const likedProducts = products.filter((p) => userLiked.includes(p.id));

  const categoryScore = {};
  const typeScore = {};
  likedProducts.forEach((p) => {
    if (p.category) categoryScore[p.category] = (categoryScore[p.category] || 0) + 1;
    if (p.type) typeScore[p.type] = (typeScore[p.type] || 0) + 1;
  });

  const hasPreferences = Object.keys(categoryScore).length > 0;

  let scored = products.map((p) => {
    let score = (p.likes || 0) * 0.5;
    if (hasPreferences) {
      score += (categoryScore[p.category] || 0) * 3;
      score += (typeScore[p.type] || 0) * 2;
    }
    return { ...p, _score: score };
  });

  const dealProductIds = new Set(deals.flatMap((d) => d.products?.map((p) => p.id) || []));
  scored = scored.map((p) =>
    dealProductIds.has(p.id) ? { ...p, _score: p._score + 2 } : p
  );

  return scored.sort((a, b) => b._score - a._score);
}

export function ForYou() {
  const { products, deals } = useProducts();
  const { user } = useAuth();
  const [sort, setSort] = useState("recent");

  let likedMap = {};
  try {
    const saved = localStorage.getItem("likedMap");
    likedMap = saved ? JSON.parse(saved) : {};
  } catch { likedMap = {}; }

  const baseProducts = useMemo(() => {
    const trending = [...products].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    return user
      ? getForYouProducts(products, deals, user.id, likedMap)
      : trending;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, deals, user]);

  const sorted = useMemo(() => sortProducts(baseProducts, sort), [baseProducts, sort]);

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[1440px] mx-auto">

        {/* HEADING */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl lg:text-7xl mb-4">
            <span style={{ fontFamily: "Fredoka, sans-serif", color: "#FFF6F8" }}>For </span>
            <span
              style={{
                fontFamily: "Pacifico, cursive",
                color: "#FF8FA3",
                textShadow: "0 0 30px rgba(255,143,163,0.6)",
              }}
            >
              You
            </span>
          </h1>
          <p className="text-xl text-[#FFF6F8]">
            {user ? "Based on what you love" : "Top picks for you"}
          </p>
        </motion.div>

        {/* SORT BAR — price + recent only (per spec) */}
        <SortBar
          value={sort}
          onChange={setSort}
          options={["recent", "priceLow", "priceHigh"]}
        />

        {sorted.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sorted.map((p) => (
              <ProductCard key={p.id} {...p} notificationStyle="toast" />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-[#FFF6F8]">
            No products to show yet.
          </div>
        )}
      </div>
    </div>
  );
}