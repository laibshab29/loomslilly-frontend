import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { X, AlertTriangle, Info, CheckCircle } from "lucide-react";

const ICONS = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
};

const STYLES = {
  info: {
    bg: "bg-[#FFF6F8]",
    border: "border-[#C8B6E2]",
    iconColor: "text-[#C8B6E2]",
  },
  warning: {
    bg: "bg-[#FFF6F8]",
    border: "border-[#FF8FA3]",
    iconColor: "text-[#FF8FA3]",
  },
  success: {
    bg: "bg-[#FFF6F8]",
    border: "border-green-400",
    iconColor: "text-green-500",
  },
};

export function Toast({
  isOpen,
  onClose,
  title,
  message,
  variant = "warning",
  duration = 3500,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => onClose(), duration);
    return () => clearTimeout(timer);
  }, [isOpen, onClose, duration]);

  const Icon = ICONS[variant] || ICONS.info;
  const style = STYLES[variant] || STYLES.info;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -40, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -40, x: "-50%" }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className={
            "fixed top-6 left-1/2 z-[400] w-full max-w-[420px] mx-4 rounded-[20px] shadow-2xl border-2 px-5 py-4 flex items-start gap-3 " +
            style.bg +
            " " +
            style.border
          }
        >
          <Icon className={"w-5 h-5 flex-shrink-0 mt-0.5 " + style.iconColor} />

          <div className="flex-1 min-w-0">
            {title && (
              <p
                className="text-[#2E2A4A] font-medium text-sm mb-0.5"
                style={{ fontFamily: "Fredoka, sans-serif" }}
              >
                {title}
              </p>
            )}
            {message && (
              <p className="text-[#7A6C9D] text-sm leading-snug">{message}</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded-full hover:bg-[#F6C1CC]/40 transition-colors"
          >
            <X className="w-4 h-4 text-[#7A6C9D]" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}