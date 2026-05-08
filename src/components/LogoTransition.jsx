import { motion } from "framer-motion";
import logo from "../assets/logo.jpeg";
import { FloatingElements } from "./FloatingElements";

export function LogoTransition({ mode = "intro", onFinish }) {
  const isIntro = mode === "intro";

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: 0 }}
      exit={{ y: "-100%" }}
      transition={{
        duration: 0.8,
        ease: "easeInOut",
        delay: isIntro ? 3.75 : 2, // your timings
      }}
      onAnimationComplete={() => {
        if (onFinish) onFinish(); // ✅ triggers removal AFTER animation
      }}
      className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#50426b" }}
    >
      {/* FLOATING ELEMENTS */}
      <FloatingElements />

      {/* CENTER LOGO */}
      <div className="relative flex items-center justify-center z-10">

        {/* 🔥 GLOW (ONLY ANIMATES ON INTRO, EXISTS ALWAYS) */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: "55vw",
            maxWidth: "560px",
            height: "55vw",
            maxHeight: "560px",
          }}
          animate={
            isIntro
              ? {
                  boxShadow: [
                    "0 0 0px rgba(255,143,163,0)",
                    "0 0 80px rgba(255,143,163,0.7)",
                    "0 0 0px rgba(255,143,163,0)",
                  ],
                }
              : {
                  boxShadow: "0 0 25px rgba(255,143,163,0.4)", // ✅ static glow for revisit
                }
          }
          transition={{ duration: 0.8,   // one glow cycle speed
            repeat: isIntro ? 2 : 0,  // ✅ 3 times total (1 + 2 repeats)
            ease: "easeInOut", }}
        />

        {/* 🔥 LOGO CIRCLE (IDENTICAL FOR BOTH) */}
        <motion.div
          className="overflow-hidden rounded-full bg-[#50426b]"
          style={{
            width: "55vw",
            maxWidth: "560px",
            height: "55vw",
            maxHeight: "560px",
          }}
          initial={
            isIntro
              ? { scale: 0.85, opacity: 0 }
              : { scale: 1, opacity: 1 }
          }
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: isIntro ? 0.6 : 0 }}
        >
          <img
            src={logo}
            alt="LoomsLilly Logo"
            className="w-full h-full object-cover scale-110"
          />
        </motion.div>
      </div>

      {/* BACKGROUND GLOW (INTRO ONLY) */}
      {isIntro && (
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: [0, 0.25, 0] }}
          transition={{ duration: 2.5 }}
          style={{
            background:
              "radial-gradient(circle at center, rgba(255,143,163,0.15), transparent 70%)",
          }}
        />
      )}
    </motion.div>
  );
}