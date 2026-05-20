// src/pages/SellerProfile.jsx
import { useSellers } from "../context/SellerContext";
import { useParams } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { useOrders } from "../context/OrderContext";
import { useAuth } from "../context/AuthContext";
import { ProductCard } from "../components/ProductCard";
import { motion } from "framer-motion";
import { User, Tag, TrendingUp, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { SortBar, sortProducts } from "../components/SortBar";
import { supabase } from "../lib/supabase";

export function SellerProfile() {
  const { id } = useParams();
  const { products, getDealsForSeller } = useProducts();
  const { getSellerById } = useSellers();
  const { orders } = useOrders();

  const [sort, setSort] = useState("recent");

  // ─── FETCH SELLER PROFILE DIRECTLY FROM DB ───────────────────
  // SellerContext may not have the full profile loaded yet, so we
  // also fetch directly from profiles table to guarantee name +
  // wallet numbers are always available.
  const [sellerProfile, setSellerProfile] = useState(null);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("profiles")
      .select("id, name, role, jazzcash_phone, easypaisa_phone, avatar_url")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (data) setSellerProfile(data);
      });
  }, [id]);

  // sellerId is a UUID string (Supabase auth UUID), not a number
  const sellerId = id;

  // Merge SellerContext data with direct profile fetch
  const sellerFromContext = getSellerById(sellerId);
  const seller = sellerProfile
    ? {
        id: sellerProfile.id,
        name: sellerProfile.name || sellerFromContext?.name || "Seller",
        image: sellerProfile.avatar_url || sellerFromContext?.image || null,
        jazzcashPhone: sellerProfile.jazzcash_phone || "",
        easypaisaPhone: sellerProfile.easypaisa_phone || "",
      }
    : sellerFromContext
    ? {
        ...sellerFromContext,
        jazzcashPhone: sellerFromContext.jazzcashPhone || "",
        easypaisaPhone: sellerFromContext.easypaisaPhone || "",
      }
    : null;

  const sellerProducts = products.filter((p) => p.sellerId === sellerId);
  const sellerDeals = getDealsForSeller(sellerId);

  // ─── TOP 10 MOST-SOLD PRODUCTS ───────────────────────────────
  const salesByProductId = {};
  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (item.sellerId === sellerId) {
        salesByProductId[item.id] = (salesByProductId[item.id] || 0) + item.quantity;
      }
    });
  });

  const topSelling = [...sellerProducts]
    .map((p) => ({ ...p, soldCount: salesByProductId[p.id] || 0 }))
    .filter((p) => p.soldCount > 0)
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 10);

  // ─── GROUP PRODUCTS BY CATEGORY → SUBCATEGORY ────────────────
  const productsByCategory = useMemo(() => {
    const sorted = sortProducts(sellerProducts, sort);
    return sorted.reduce((acc, product) => {
      const cat = product.category || "Other";
      const sub = product.type || "Other";
      if (!acc[cat]) acc[cat] = {};
      if (!acc[cat][sub]) acc[cat][sub] = [];
      acc[cat][sub].push(product);
      return acc;
    }, {});
  }, [sellerProducts, sort]);

  // Show loading state while profile is being fetched
  if (!seller && !sellerProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-[#FFF6F8] text-2xl">Loading seller profile...</p>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <div className="text-6xl mb-4">😕</div>
          <p className="text-[#FFF6F8] text-2xl">Seller not found</p>
        </div>
      </div>
    );
  }

  const hasWalletInfo = seller.jazzcashPhone || seller.easypaisaPhone;

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[1440px] mx-auto">

        {/* PROFILE HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-4">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#F6C1CC] to-[#C8B6E2] flex items-center justify-center overflow-hidden shadow-lg">
              {seller.image ? (
                <img src={seller.image} className="w-full h-full object-cover" alt="" />
              ) : (
                <User className="text-white w-12 h-12" />
              )}
            </div>
          </div>

          <h1
            style={{
              fontFamily: "Pacifico, cursive",
              color: "#FF8FA3",
              textShadow: "0 0 35px rgba(255,143,163,0.7)",
            }}
            className="text-5xl mb-2"
          >
            {seller.name}
          </h1>

          <p className="text-[#FFF6F8]/70 text-sm">
            {sellerProducts.length} {sellerProducts.length === 1 ? "product" : "products"}
            {sellerDeals.length > 0 && " · " + sellerDeals.length + " active " + (sellerDeals.length === 1 ? "deal" : "deals")}
          </p>

          {/* ─── WALLET INFO ─────────────────────────────────── */}
          {hasWalletInfo && (
            <div className="mt-4 inline-flex flex-col items-center gap-2">
              {seller.jazzcashPhone && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF6F8]/15 border border-[#FFF6F8]/20 text-[#FFF6F8] text-sm">
                  <Smartphone className="w-4 h-4 text-[#FF8FA3]" />
                  <span className="text-[#C8B6E2] text-xs">JazzCash:</span>
                  <span>{seller.jazzcashPhone}</span>
                </div>
              )}
              {seller.easypaisaPhone && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF6F8]/15 border border-[#FFF6F8]/20 text-[#FFF6F8] text-sm">
                  <Smartphone className="w-4 h-4 text-[#FF8FA3]" />
                  <span className="text-[#C8B6E2] text-xs">EasyPaisa:</span>
                  <span>{seller.easypaisaPhone}</span>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* DEALS SECTION */}
        {sellerDeals.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Tag className="w-6 h-6 text-[#FF8FA3]" />
              <h2
                className="text-3xl text-[#FFF6F8]"
                style={{ fontFamily: "Fredoka, sans-serif" }}
              >
                Deals
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sellerDeals.map((deal) => (
                <Link key={deal.id} to={"/deals/" + deal.id}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-[24px] overflow-hidden p-6 bg-gradient-to-br from-[#F6C1CC] to-[#C8B6E2] shadow-xl transition-all duration-300"
                  >
                    {deal.images?.length > 0 && (
                      <img
                        src={deal.images[0]}
                        alt={deal.title}
                        className="w-full h-[180px] object-cover rounded-[16px] mb-4"
                      />
                    )}
                    <h3
                      className="text-2xl mb-2"
                      style={{ fontFamily: "Pacifico, cursive", color: "#FFF6F8" }}
                    >
                      {deal.title}
                    </h3>
                    <p className="text-white/80 text-sm mb-2">
                      {deal.products.length} {deal.products.length === 1 ? "product" : "products"}
                    </p>
                    <div className="text-white">
                      <p className="text-sm line-through opacity-70">Rs. {deal.originalPrice}</p>
                      <p className="text-xl font-medium">Rs. {deal.discountedPrice}</p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* TOP 10 MOST-SOLD PRODUCTS */}
        {topSelling.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-[#FF8FA3]" />
              <h2
                className="text-3xl text-[#FFF6F8]"
                style={{ fontFamily: "Fredoka, sans-serif" }}
              >
                Most Selling Products
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {topSelling.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </section>
        )}

        {/* PRODUCTS BY CATEGORY / SUBCATEGORY */}
        {sellerProducts.length === 0 ? (
          <p className="text-center text-white text-xl py-12">
            No products uploaded yet.
          </p>
        ) : (
          <>
            <div className="mb-2">
              <h2
                className="text-3xl text-[#FFF6F8] mb-4"
                style={{ fontFamily: "Fredoka, sans-serif" }}
              >
                All Products
              </h2>
              <SortBar
                value={sort}
                onChange={setSort}
                options={["recent", "priceLow", "priceHigh", "mostLiked"]}
              />
            </div>

            {Object.entries(productsByCategory).map(([category, subcategories]) => (
              <section key={category} className="mb-16">
                <h2
                  className="text-4xl text-[#FFF6F8] mb-6 capitalize"
                  style={{ fontFamily: "Fredoka, sans-serif" }}
                >
                  {category}
                </h2>

                {Object.entries(subcategories).map(([subcategory, items]) => (
                  <div key={subcategory} className="mb-10">
                    <h3
                      className="text-2xl text-[#C8B6E2] mb-4 capitalize pl-2 border-l-4 border-[#FF8FA3]"
                      style={{ fontFamily: "Fredoka, sans-serif" }}
                    >
                      {subcategory}
                    </h3>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {items.map((product) => (
                        <ProductCard key={product.id} {...product} />
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            ))}
          </>
        )}
      </div>
    </div>
  );
}