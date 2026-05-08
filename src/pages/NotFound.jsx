import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="text-9xl mb-6">🎨</div>

        <h1 className="text-6xl mb-4">
          <span
            style={{
              fontFamily: "Fredoka, sans-serif",
              color: "#FFF6F8",
            }}
          >
            404
          </span>
        </h1>

        <h2
          className="text-3xl text-[#FFF6F8] mb-6"
          style={{ fontFamily: "Fredoka, sans-serif" }}
        >
          Page Not Found
        </h2>

        <p
          className="text-xl text-[#FFF6F8] mb-8"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Looks like this page got lost in the craft supplies!
        </p>

        <Link
          to="/"
          className="inline-block px-8 py-4 rounded-full bg-[#FF8FA3] text-white hover:bg-[#FF8FA3]/90 transition-all duration-300 hover:scale-105 shadow-lg"
          style={{ fontFamily: "Fredoka, sans-serif" }}
        >
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}