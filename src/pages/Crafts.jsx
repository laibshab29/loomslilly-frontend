import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function Crafts() {
  const subcategories = [
    {
      name: "Crochet",
      path: "/crafts/crochet",
      emoji: "🧶",
      description: "Beautiful crochet patterns and supplies",
    },
    {
      name: "Knitting",
      path: "/crafts/knitting",
      emoji: "🧵",
      description: "Premium knitting materials and tools",
    },
    {
      name: "Embroidery",
      path: "/crafts/embroidery",
      emoji: "🪡",
      description: "Elegant embroidery kits and threads",
    },
  ];

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
              Crafts
            </span>
          </h1>

          <p
            className="text-xl text-[#FFF6F8]"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Explore our curated collection of craft supplies and patterns
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {subcategories.map((category, index) => (
            <motion.div
              key={category.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -8 }}
            >
              <Link
                to={category.path}
                className="block rounded-[24px] bg-gradient-to-br from-[#FFF6F8]/90 to-[#F6C1CC]/90 backdrop-blur-sm border-2 border-[#7A6C9D]/30 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="text-7xl mb-4 text-center group-hover:scale-110 transition-transform duration-300">
                  {category.emoji}
                </div>

                <h3
                  className="text-2xl text-[#2E2A4A] mb-2 text-center"
                  style={{ fontFamily: "Fredoka, sans-serif" }}
                >
                  {category.name}
                </h3>

                <p
                  className="text-[#7A6C9D] text-center mb-4"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {category.description}
                </p>

                <div className="flex items-center justify-center gap-2 text-[#FF8FA3] group-hover:gap-4 transition-all duration-300">
                  <span style={{ fontFamily: "Fredoka, sans-serif" }}>
                    Explore
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}