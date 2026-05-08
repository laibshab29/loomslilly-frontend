import { useSellers } from "../context/SellerContext";
import { useProducts } from "../context/ProductContext";
import { CategoryCard } from "../components/CategoryCard";
import { ProductCard } from "../components/ProductCard";
import {
  Scissors,
  Palette,
  BookOpen,
  Tag,
  Users,
  Calendar,
  Sparkles,
  TrendingUp,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useOrders } from "../context/OrderContext";


export function Home() {
  const { isGuest, isBuyer, isSeller } = useAuth();
  const { products } = useProducts();
  const navigate = useNavigate();
  const { sellers } = useSellers();
  const isSellerView = isSeller || (isBuyer && isSeller);
  const { getSellerSales } = useOrders();
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

  const latest = [...products].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4);
  const trending = products.slice(0, 4);
  const rankedSellers = [...sellers]
  .map((seller) => ({
    ...seller,
    sales: getSellerSales(seller.id),
  }))
  .sort((a, b) => b.sales - a.sales)
  .slice(0, 10);

  return (
    <div className="min-h-screen pb-20">

      {/* HERO (UNCHANGED UI) */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-8 px-4 lg:px-20 mb-16">
        <div className="max-w-[1440px] mx-auto text-center">

          <h1 className="text-5xl lg:text-7xl mb-4">
            <span style={{ fontFamily: "Fredoka, sans-serif", color: "#FFF6F8" }}>
              Where Creativity{" "}
            </span>
            <span style={{
              fontFamily: "Pacifico, cursive",
              color: "#FF8FA3",
              textShadow: "0 0 30px rgba(255, 143, 163, 0.6)"
            }}>
              Blooms
            </span>
          </h1>

          <p className="text-xl text-[#FFF6F8] max-w-2xl mx-auto">
            {isGuest && "Join LoomsLilly to start your creative journey"}
            {isBuyer && !isSeller && "Discover amazing handmade crafts curated for you"}
            {isSeller && !isBuyer && "Showcase your creations and grow your craft business"}
            {isBuyer && isSeller && "Buy, sell, and grow in one creative marketplace"}
          </p>

          {/* BUTTON FIXED */}
          <div className="mt-6">
            {isGuest && (
              <a href="/signup" className="px-8 py-3 rounded-full bg-[#FF8FA3] text-white">
                Get Started
              </a>
            )}

            {isBuyer && !isSeller && (
              <a href="/deals" className="px-8 py-3 rounded-full bg-[#FF8FA3] text-white">
                Explore Deals
              </a>
            )}

            {isSellerView && (
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
          </div>

        </div>
      </motion.section>

      {/* CATEGORIES (UNCHANGED) */}
      <section className="px-4 lg:px-20 mb-20">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <CategoryCard key={category.path} {...category} delay={index * 0.1} />
          ))}
        </div>
      </section>

      {/* 🔥 TOP PERFORMING (REPLACED FEATURED — UI SAME) */}
      <section className="px-4 lg:px-20 mb-20">
        <div className="max-w-[1440px] mx-auto">

          <motion.div className="rounded-[24px] bg-gradient-to-br from-[#FFF6F8]/90 to-[#FFD6E0]/90 p-8 lg:p-12 shadow-2xl">

            <h2 className="text-4xl text-center mb-8">
              <span style={{ fontFamily: "Fredoka", color: "#2E2A4A" }}>
                Top Performing
              </span>{" "}
              <span style={{
                fontFamily: "Pacifico",
                color: "#FF8FA3",
                textShadow: "0 0 30px rgba(255, 143, 163, 0.6)"
              }}>
                {isSellerView ? "Sellers" : "Artists"}
              </span>
            </h2>

            {/* CIRCLES (FEATURED SELLERS STYLE) */}
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
        <img
          src={seller.image}
          className="w-full h-full object-cover"
        />
      ) : (
        <User className="text-white" />
      )}
    </div>

    <p className="text-[#2E2A4A] mt-2 text-sm">
      {seller.name}
    </p>
  </motion.div>
))}
</div>

          </motion.div>
        </div>
      </section>

      {/* 🔥 NEW ARRIVALS (REPLACES POPULAR) */}
      <section className="px-4 lg:px-20 mb-20 text-center">
        <Link to="/new-arrivals">
         <h2 className="text-4xl mb-8">
  <span
    style={{
      fontFamily: "Pacifico",
      color: "#FF8FA3",
      textShadow: "0 0 30px rgba(255, 143, 163, 0.6)",
    }}
  >
    New
  </span>
  <span
    style={{
      fontFamily: "Fredoka",
      color: "#FFF6F8",
    }}
  >
    {" "}Arrivals
  </span>
</h2>
        </Link>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1440px] mx-auto">
          {latest.map((p, i) => (
            <ProductCard key={i} {...p} />
          ))}
        </div>
      </section>

      {/* 🔥 TRENDING / INSIGHTS (REPLACES WEEKLY PICKS) */}
      <section className="px-4 lg:px-20 mb-20">
        <div className="max-w-[1440px] mx-auto">

          <Link to="/trending">
            <h2 className="text-4xl mb-8 text-center">
  <span
    style={{
      fontFamily: "Pacifico",
      color: "#FF8FA3",
      textShadow: "0 0 30px rgba(255, 143, 163, 0.6)",
    }}
  >
    {isSellerView ? "What’s Selling" : "Trending"}
  </span>
  <span
    style={{
      fontFamily: "Fredoka",
      color: "#FFF6F8",
    }}
  >
    {" "}
    {isSellerView ? "Insights" : "Products"}
  </span>
</h2>
          </Link>

          <div className="flex gap-6 overflow-x-auto">
            {trending.map((item, i) => (
              <div key={i} className="w-[280px] flex-shrink-0">
                <ProductCard {...item} />
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* REMOVE FEATURED SELLERS COMPLETELY */}

      {/* BOTTOM CTA FIX */}
       {isSellerView && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => navigate("/upload")}
                  className="px-5 py-2 rounded-full bg-[#FF8FA3] text-white text-lg 
                  hover:bg-[#FF8FA3]/90 hover:scale-105 transition-all duration-300 
                  shadow-[0_8px_25px_rgba(255,143,163,0.4)]"
                  style={{ fontFamily: "Fredoka, sans-serif" }}
                >
                  Upload New Product
                </button>
              </div>
            )}

    </div>
  );
}