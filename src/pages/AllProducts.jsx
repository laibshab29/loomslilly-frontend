// src/pages/AllProducts.jsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { useAuth } from "../context/AuthContext";
import { ProductCard } from "../components/ProductCard";

const CATEGORY_STRUCTURE = {
  crafts: ["crochet", "knitting", "embroidery"],
  arts: ["sketching", "painting", "abstract"],
};

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getForYouProducts(products, deals, userId, likedMap) {
  const userLiked = (likedMap?.[String(userId)] || []);
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
  scored = scored.map((p) => dealProductIds.has(p.id) ? { ...p, _score: p._score + 2 } : p);

  return scored
    .sort((a, b) => b._score - a._score)
    .slice(0, 12);
}

export function AllProducts() {
  const { products, deals } = useProducts();
  const { user } = useAuth();

  let likedMap = {};
  try {
    const saved = localStorage.getItem("likedMap");
    likedMap = saved ? JSON.parse(saved) : {};
  } catch { likedMap = {}; }

  const newArrivals = [...products]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 12);

  const trending = [...products]
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .slice(0, 12);

  const forYou = user
    ? getForYouProducts(products, deals, user.id, likedMap)
    : trending.slice(0, 12);

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[1440px] mx-auto">

        {/* PAGE TITLE */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl lg:text-7xl mb-4">
            <span style={{ fontFamily: "Fredoka, sans-serif", color: "#FFF6F8" }}>All </span>
            <span style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 30px rgba(255,143,163,0.6)" }}>
              Products
            </span>
          </h1>
          <p className="text-xl text-[#FFF6F8]">Everything in one place</p>
        </motion.div>

        {/* FOR YOU — links to /for-you */}
        <Section
          title="For You"
          subtitle={user ? "Based on what you love" : "Top picks for you"}
          linkTo="/for-you"
          products={forYou}
        />

        {/* NEW ARRIVALS */}
        <Section
          title="New Arrivals"
          subtitle="Just added"
          linkTo="/new-arrivals"
          products={newArrivals}
        />

        {/* TRENDING */}
        <Section
          title="Trending"
          subtitle="Most loved right now"
          linkTo="/trending"
          products={trending}
        />

        {/* CATEGORIES */}
        {Object.entries(CATEGORY_STRUCTURE).map(([category, types]) => (
          <div key={category} className="mb-16">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl mb-8"
            >
              <span style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 20px rgba(255,143,163,0.5)" }}>
                {capitalize(category)}
              </span>
            </motion.h2>

            {types.map((type) => {
              const typeProducts = products.filter(
                (p) => p.category === category && p.type === type
              );
              if (typeProducts.length === 0) return null;

              return (
                <div key={type} className="mb-10">
                  <Link to={`/${category}/${type}`}>
                    <h3
                      className="text-2xl mb-4 inline-block hover:opacity-80 transition-opacity"
                      style={{ fontFamily: "Fredoka, sans-serif", color: "#FFF6F8" }}
                    >
                      {capitalize(type)}
                      <span className="text-[#C8B6E2] text-base ml-2">→</span>
                    </h3>
                  </Link>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {typeProducts.map((p) => (
                      <ProductCard key={p.id} {...p} notificationStyle="toast" />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* OTHER CATEGORIES */}
        {(() => {
          const knownCategories = Object.keys(CATEGORY_STRUCTURE);
          const otherProducts = products.filter((p) => !knownCategories.includes(p.category));
          if (otherProducts.length === 0) return null;

          const grouped = {};
          otherProducts.forEach((p) => {
            const cat = p.category || "other";
            const typ = p.type || "general";
            if (!grouped[cat]) grouped[cat] = {};
            if (!grouped[cat][typ]) grouped[cat][typ] = [];
            grouped[cat][typ].push(p);
          });

          return Object.entries(grouped).map(([cat, types]) => (
            <div key={cat} className="mb-16">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl mb-8"
              >
                <span style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 20px rgba(255,143,163,0.5)" }}>
                  {capitalize(cat)}
                </span>
              </motion.h2>
              {Object.entries(types).map(([type, items]) => (
                <div key={type} className="mb-10">
                  <h3
                    className="text-2xl mb-4"
                    style={{ fontFamily: "Fredoka, sans-serif", color: "#FFF6F8" }}
                  >
                    {capitalize(type)}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {items.map((p) => (
                      <ProductCard key={p.id} {...p} notificationStyle="toast" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ));
        })()}

      </div>
    </div>
  );
}

function Section({ title, subtitle, linkTo, products }) {
  if (products.length === 0) return null;

  const heading = (
    <div className="mb-6">
      {linkTo ? (
        <Link to={linkTo} className="inline-block hover:opacity-80 transition-opacity">
          <h2 className="text-4xl">
            <span style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 20px rgba(255,143,163,0.5)" }}>
              {title}
            </span>
            <span className="text-[#C8B6E2] text-xl ml-2">→</span>
          </h2>
        </Link>
      ) : (
        <h2 className="text-4xl">
          <span style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 20px rgba(255,143,163,0.5)" }}>
            {title}
          </span>
        </h2>
      )}
      {subtitle && (
        <p className="text-[#C8B6E2] text-sm mt-1">{subtitle}</p>
      )}
    </div>
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-16"
    >
      {heading}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} {...p} notificationStyle="toast" />
        ))}
      </div>
    </motion.section>
  );
}