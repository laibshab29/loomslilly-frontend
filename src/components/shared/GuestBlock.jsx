import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export function GuestBlock({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-[500px] mx-auto py-20"
    >
      <div className="rounded-[24px] bg-[#FFF6F8]/90 p-10 shadow-2xl text-center border-2 border-[#FF8FA3]/30">
        <div className="text-7xl mb-6">🔒</div>

        <h2
          style={{
            fontFamily: "Pacifico, cursive",
            color: "#FF8FA3",
            textShadow: "0 0 20px rgba(255,143,163,0.5)",
          }}
          className="text-4xl mb-4"
        >
          Sign Up Required
        </h2>

        <p className="text-[#2E2A4A] mb-8 leading-relaxed">
          {message}
        </p>

        <Link
          to="/signup"
          className="inline-block px-8 py-4 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all shadow-md"
        >
          Sign Up Now
        </Link>

        <p className="text-[#7A6C9D] text-sm mt-4">
          Already have an account?{" "}
          <Link
            to="/signup?mode=login"
            className="text-[#FF8FA3] hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}