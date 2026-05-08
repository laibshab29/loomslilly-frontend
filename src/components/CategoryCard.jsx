import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export function CategoryCard({
  title,
  path,
  icon: Icon,
  gradient,
  delay = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.05, y: -8 }}
      whileTap={{ scale: 0.95 }}
    >
      <Link
        to={path}
        className="block relative rounded-[24px] p-8 h-[220px] overflow-hidden border-2 border-[#7A6C9D]/30 shadow-xl group"
        style={{ background: gradient }}
      >
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center gap-4">
          <div className="p-4 rounded-full bg-white/30 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-12 h-12 text-[#2E2A4A]" strokeWidth={1.5} />
          </div>

          <h3
            className="text-2xl text-[#2E2A4A] text-center"
            style={{ fontFamily: "Fredoka, sans-serif" }}
          >
            {title}
          </h3>
        </div>

        {/* Glow effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            boxShadow: "0 0 40px rgba(255, 143, 163, 0.5)",
          }}
        />
      </Link>
    </motion.div>
  );
}