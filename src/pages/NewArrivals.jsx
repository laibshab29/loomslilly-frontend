// src/pages/NewArrivals.jsx
import { useState, useMemo } from "react";
import { ProductCard } from "../components/ProductCard";
import { motion } from "framer-motion";
import { useProducts } from "../context/ProductContext";
import { SortBar, sortProducts } from "../components/SortBar";

export function NewArrivals() {
  const { products } = useProducts();
  const [sort, setSort] = useState("recent");

  const sorted = useMemo(() => {
    // Base: newest first, then apply chosen sort
    const base = [...products].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return sortProducts(base, sort);
  }, [products, sort]);

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl lg:text-7xl mb-4">
            <span style={{ fontFamily: "Fredoka, sans-serif", color: "#FFF6F8" }}>New </span>
            <span style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 30px rgba(255, 143, 163, 0.6)" }}>
              Arrivals
            </span>
          </h1>
          <p className="text-xl text-[#FFF6F8]">Fresh items just added to our collection</p>
        </motion.div>

        {/* SORT BAR — price options + most liked */}
        <SortBar
          value={sort}
          onChange={setSort}
          options={["recent", "priceLow", "priceHigh", "mostLiked"]}
        />

        {sorted.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sorted.map((product) => (
              <ProductCard key={product.id} {...product} notificationStyle="toast" />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-[#FFF6F8]">No new products yet.</div>
        )}
      </div>
    </div>
  );
}