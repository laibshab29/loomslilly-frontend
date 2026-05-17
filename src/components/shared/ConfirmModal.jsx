import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are You Sure?",
  message = "",
  confirmText = "Yes",
  cancelText = "Cancel",
  variant = "confirm", // "confirm" | "error" | "info" | "alert"
}) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const isError = variant === "error";
  const isInfo = variant === "info";
  const isAlert = variant === "alert";

  // Style overrides per variant
  const borderColor = isAlert ? "border-red-400" : "border-[#FF8FA3]/40";
  const titleColor = isAlert ? "#DC2626" : "#FF8FA3";
  const buttonBg = isAlert ? "bg-red-500" : "bg-[#FF8FA3]";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center px-4"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ y: -20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className={"w-full max-w-[440px] rounded-[24px] bg-[#FFF6F8] p-10 shadow-2xl border-2 text-center " + borderColor}
          >
            <h2
              style={{
                fontFamily: "Pacifico, cursive",
                color: titleColor,
                textShadow: isAlert
                  ? "0 0 20px rgba(220,38,38,0.4)"
                  : "0 0 20px rgba(255,143,163,0.5)",
              }}
              className="text-3xl mb-4"
            >
              {title}
            </h2>

            {message && (
              <p className="text-[#2E2A4A] mb-8 leading-relaxed whitespace-pre-line">
                {message}
              </p>
            )}

            <div className="flex gap-3 justify-center">
              {!isError && !isInfo && !isAlert && (
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all"
                >
                  {cancelText}
                </button>
              )}
              <button
                onClick={onConfirm || onClose}
                className={"px-6 py-3 rounded-full text-white hover:scale-105 transition-all " + buttonBg}
              >
                {isError || isInfo || isAlert ? "OK" : confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}