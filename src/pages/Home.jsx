// src/pages/Home.jsx
import { useState, useEffect, useRef } from "react";
import { useSellers } from "../context/SellerContext";
import { useProducts } from "../context/ProductContext";
import { CategoryCard } from "../components/CategoryCard";
import { ProductCard } from "../components/ProductCard";
import {
  Scissors, Palette, BookOpen, Tag, Users, Calendar, Sparkles, TrendingUp, User,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useOrders } from "../context/OrderContext";
import { useNotifications } from "../context/NotificationContext";
import { ConfirmModal } from "../components/shared/ConfirmModal";

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

  return scored.sort((a, b) => b._score - a._score).slice(0, 12);
}

export function Home() {
  const { isGuest, isBuyer, isSeller, user } = useAuth();
  const { products, deals, getCriticalStockProducts, getOutOfStockProducts } = useProducts();
  const navigate = useNavigate();
  const { sellers } = useSellers();
  const isSellerView = isSeller || (isBuyer && isSeller);
  const { getSellerSales } = useOrders();
  const { notifyLowStock, notifyCriticalStock, notifyOutOfStock } = useNotifications();
  const topRef = useRef(null);

  const [outOfStockModal, setOutOfStockModal] = useState(null);
  const [criticalStockModal, setCriticalStockModal] = useState(null);

  useEffect(() => {
    if (!isSeller || !user) return;

    const outOfStock = getOutOfStockProducts(user.id);
    const critical = products.filter(
      (p) => p.sellerId === user.id && p.stock > 0 && p.stock < 10
    );
    const low = products.filter(
      (p) => p.sellerId === user.id && p.stock >= 10 && p.stock < 20
    );

    const signature =
      "out:" + outOfStock.map((p) => p.id).sort().join(",") +
      "|critical:" + critical.map((p) => p.id + ":" + p.stock).sort().join(",") +
      "|low:" + low.map((p) => p.id + ":" + p.stock).sort().join(",");

    const seenKey = "stockAlertSig_" + user.id;
    if (sessionStorage.getItem(seenKey) === signature) return;

    outOfStock.forEach((p) =>
      notifyOutOfStock({ recipientId: user.id, productId: p.id, productName: p.name })
    );
    critical.forEach((p) =>
      notifyCriticalStock({ recipientId: user.id, productId: p.id, productName: p.name, stock: p.stock })
    );
    low.forEach((p) =>
      notifyLowStock({ recipientId: user.id, productId: p.id, productName: p.name, stock: p.stock })
    );

    if (outOfStock.length > 0) setOutOfStockModal(outOfStock);
    else if (critical.length > 0) setCriticalStockModal(critical);

    sessionStorage.setItem(seenKey, signature);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isSeller, products]);

  const handleCloseOutOfStock = () => {
    setOutOfStockModal(null);
    if (!user) return;
    const critical = getCriticalStockProducts(user.id, 10);
    if (critical.length > 0) setCriticalStockModal(critical);
  };

  const outOfStockMessage = outOfStockModal
    ? outOfStockModal.length === 1
      ? '"' + outOfStockModal[0].name + '" is OUT OF STOCK. Restock immediately or buyers will see it as unavailable.'
      : outOfStockModal.length + " of your products are OUT OF STOCK:\n\n" +
        outOfStockModal.slice(0, 5).map((p) => "• " + p.name).join("\n") +
        (outOfStockModal.length > 5 ? "\n\n…and " + (outOfStockModal.length - 5) + " more." : "") +
        "\n\nRestock soon to keep selling."
    : "";

  const criticalStockMessage = criticalStockModal
    ? criticalStockModal.length === 1
      ? '"' + criticalStockModal[0].name + '" only has ' + criticalStockModal[0].stock + " left in stock. Restock soon to avoid losing sales."
      : criticalStockModal.length + " of your products have 10 or fewer units left:\n\n" +
        criticalStockModal.slice(0, 5).map((p) => "• " + p.name + " (" + p.stock + " left)").join("\n") +
        (criticalStockModal.length > 5 ? "\n\n…and " + (criticalStockModal.length - 5) + " more." : "")
    : "";

  const categories = [
    { title: "Crafts", path: "/crafts", icon: Scissors, gradient: "linear-gradient(135deg, #FFD6E0 0%, #F6C1CC 100%)" },
    { title: "Arts", path: "/arts", icon: Palette, gradient: "linear-gradient(135deg, #C8B6E2 0%, #7A6C9D 100%)" },
    { title: "Tutorials", path: "/tutorials", icon: BookOpen, gradient: "linear-gradient(135deg, #FFF6F8 0%, #F6C1CC 100%)" },
    { title: "Deals", path: "/deals", icon: Tag, gradient: "linear-gradient(135deg, #FF8FA3 0%, #F6C1CC 100%)" },
    { title: "Community", path: "/community", icon: Users, gradient: "linear-gradient(135deg, #F6C1CC 0%, #C8B6E2 100%)" },
    { title: "Events", path: "/events", icon: Calendar, gradient: "linear-gradient(135deg, #7A6C9D 0%, #C8B6E2 100%)" },
    { title: "New Arrivals", path: "/new-arrivals", icon: Sparkles, gradient: "linear-gradient(135deg, #FFD6E0 0%, #C8B6E2 100%)" },
    { title: "Trending", path: "/trending", icon: TrendingUp, gradient: "linear-gradient(135deg, #FF8FA3 0%, #FFD6E0 100%)" },
  ];

  let likedMap = {};
  try {
    const saved = localStorage.getItem("likedMap");
    likedMap = saved ? JSON.parse(saved) : {};
  } catch { likedMap = {}; }

  const newArrivals = [...products].sort((a, b) => b.createdAt - a.createdAt).slice(0, 12);
  const trending = [...products].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 12);
  const forYou = user
    ? getForYouProducts(products, deals, user.id, likedMap)
    : trending.slice(0, 12);

  const rankedSellers = [...sellers]
    .map((seller) => ({ ...seller, sales: getSellerSales(seller.id) }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 10);

  return (
    <div className="min-h-screen pb-20" ref={topRef}>

      {/* HERO */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-8 px-4 lg:px-20 mb-16">
        <div className="max-w-[1440px] mx-auto text-center">
          <h1 className="text-5xl lg:text-7xl mb-4">
            <span style={{ fontFamily: "Fredoka, sans-serif", color: "#FFF6F8" }}>Where Creativity </span>
            <span style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 30px rgba(255, 143, 163, 0.6)" }}>Blooms</span>
          </h1>
          <p className="text-xl text-[#FFF6F8] max-w-2xl mx-auto">
            {isGuest && "Join LoomsLilly to start your creative journey"}
            {isBuyer && !isSeller && "Discover amazing handmade crafts curated for you"}
            {isSeller && !isBuyer && "Showcase your creations and grow your craft business"}
            {isBuyer && isSeller && "Buy, sell, and grow in one creative marketplace"}
          </p>
          <div className="mt-6">
            {isGuest && (
              <a href="/signup" className="px-8 py-3 rounded-full bg-[#FF8FA3] text-white">Get Started</a>
            )}
            {isBuyer && !isSeller && (
              <a href="/deals" className="px-8 py-3 rounded-full bg-[#FF8FA3] text-white">Explore Deals</a>
            )}
            {isSellerView && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => navigate("/upload")}
                  className="px-5 py-2 rounded-full bg-[#FF8FA3] text-white text-lg hover:bg-[#FF8FA3]/90 hover:scale-105 transition-all duration-300 shadow-[0_8px_25px_rgba(255,143,163,0.4)]"
                  style={{ fontFamily: "Fredoka, sans-serif" }}
                >
                  Upload Product
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* CATEGORIES */}
      <section className="px-4 lg:px-20 mb-20">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <CategoryCard key={category.path} {...category} delay={index * 0.1} />
          ))}
        </div>
      </section>

      {/* FOR YOU — heading links to /for-you */}
      <section className="px-4 lg:px-20 mb-20">
        <div className="max-w-[1440px] mx-auto">
          <div className="mb-6">
            <Link to="/for-you" className="inline-block hover:opacity-80 transition-opacity">
              <h2 className="text-4xl">
                <span style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 30px rgba(255,143,163,0.6)" }}>
                  For You
                </span>
                <span className="text-[#C8B6E2] text-xl ml-2">→</span>
              </h2>
            </Link>
            <p className="text-[#C8B6E2] text-sm mt-1">
              {user ? "Based on what you love" : "Top picks for you"}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {forYou.map((p) => (
              <ProductCard key={p.id} {...p} notificationStyle="toast" />
            ))}
          </div>
        </div>
      </section>

      {/* TOP PERFORMING */}
      <section className="px-4 lg:px-20 mb-20">
        <div className="max-w-[1440px] mx-auto">
          <motion.div className="rounded-[24px] bg-gradient-to-br from-[#FFF6F8]/90 to-[#FFD6E0]/90 p-8 lg:p-12 shadow-2xl">
            <h2 className="text-4xl text-center mb-8">
              <span style={{ fontFamily: "Fredoka", color: "#2E2A4A" }}>Top Performing</span>{" "}
              <span style={{ fontFamily: "Pacifico", color: "#FF8FA3", textShadow: "0 0 30px rgba(255, 143, 163, 0.6)" }}>
                {isSellerView ? "Sellers" : "Artists"}
              </span>
            </h2>
            <div className="flex justify-center gap-8 flex-wrap">
              {rankedSellers.map((seller) => (
                <motion.div
                  key={seller.id}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => navigate(`/seller/${seller.id}`)}
                  className="cursor-pointer text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#F6C1CC] to-[#C8B6E2] flex items-center justify-center overflow-hidden">
                    {seller.image ? (
                      <img src={seller.image} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <User className="text-white" />
                    )}
                  </div>
                  <p className="text-[#2E2A4A] mt-2 text-sm">{seller.name}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="px-4 lg:px-20 mb-20 text-center">
        <Link to="/new-arrivals">
          <h2 className="text-4xl mb-2">
            <span style={{ fontFamily: "Pacifico", color: "#FF8FA3", textShadow: "0 0 30px rgba(255, 143, 163, 0.6)" }}>New</span>
            <span style={{ fontFamily: "Fredoka", color: "#FFF6F8" }}> Arrivals</span>
          </h2>
        </Link>
        <p className="text-[#C8B6E2] text-sm mb-8">Just added to our collection</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1440px] mx-auto">
          {newArrivals.map((p) => (
            <ProductCard key={p.id} {...p} notificationStyle="toast" />
          ))}
        </div>
      </section>

      {/* TRENDING */}
      <section className="px-4 lg:px-20 mb-20">
        <div className="max-w-[1440px] mx-auto">
          <Link to="/trending">
            <h2 className="text-4xl mb-2 text-center">
              <span style={{ fontFamily: "Pacifico", color: "#FF8FA3", textShadow: "0 0 30px rgba(255, 143, 163, 0.6)" }}>
                {isSellerView ? "What's Selling" : "Trending"}
              </span>
              <span style={{ fontFamily: "Fredoka", color: "#FFF6F8" }}>
                {" "}{isSellerView ? "Insights" : "Products"}
              </span>
            </h2>
          </Link>
          <p className="text-[#C8B6E2] text-sm mb-8 text-center">Most loved right now</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trending.map((p) => (
              <ProductCard key={p.id} {...p} notificationStyle="toast" />
            ))}
          </div>
        </div>
      </section>

      {/* BACK TO TOP */}
      <div className="flex justify-center mt-8">
        <button
          onClick={() => topRef.current?.scrollIntoView({ behavior: "smooth" })}
          className="px-5 py-2 rounded-full bg-[#FF8FA3] text-white text-lg hover:bg-[#FF8FA3]/90 hover:scale-105 transition-all duration-300 shadow-[0_8px_25px_rgba(255,143,163,0.4)]"
          style={{ fontFamily: "Fredoka, sans-serif" }}
        >
          Back to Top ↑
        </button>
      </div>

      <ConfirmModal
        isOpen={!!outOfStockModal}
        onClose={handleCloseOutOfStock}
        title="Out of Stock!"
        message={outOfStockMessage}
        variant="alert"
      />
      <ConfirmModal
        isOpen={!!criticalStockModal && !outOfStockModal}
        onClose={() => setCriticalStockModal(null)}
        title="Low Stock Warning"
        message={criticalStockMessage}
        variant="info"
      />
    </div>
  );
}