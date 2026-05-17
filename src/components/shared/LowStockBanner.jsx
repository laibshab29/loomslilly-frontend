import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

export function LowStockBanner({ products }) {
  const [dismissed, setDismissed] = useState(false);

  if (!products || products.length === 0 || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="rounded-[20px] bg-[#FFF6F8] border-2 border-amber-300 shadow-md p-5 mb-6 flex items-start gap-3"
      >
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-[#2E2A4A] font-medium mb-1" style={{ fontFamily: "Fredoka, sans-serif" }}>
            Low Stock Alert
          </p>
          <p className="text-[#7A6C9D] text-sm mb-2">
            {products.length === 1
              ? "1 of your products is running low on stock:"
              : products.length + " of your products are running low on stock:"}
          </p>
          <ul className="text-sm text-[#2E2A4A] space-y-1">
            {products.slice(0, 5).map((p) => (
              <li key={p.id}>
                • {p.name} — <span className="text-amber-600 font-medium">{p.stock} left</span>
              </li>
            ))}
            {products.length > 5 && (
              <li className="text-[#7A6C9D] italic">…and {products.length - 5} more</li>
            )}
          </ul>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-full hover:bg-[#F6C1CC]/40 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4 text-[#7A6C9D]" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}