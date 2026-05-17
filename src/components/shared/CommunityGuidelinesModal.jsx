import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function CommunityGuidelinesModal({ isOpen, onClose, onConfirm, isGuest }) {
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (!isOpen) setAgreed(false);
  }, [isOpen]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const rules = [
    "Be respectful and kind to all members.",
    "No hate speech, harassment, or harmful content.",
    "Support and encourage fellow creators.",
    "Keep discussions relevant and constructive.",
    "Do not share others' work without credit.",
    "If you are reported by other members for violating these guidelines, you will be removed from the community.",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/50 backdrop-blur-md"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ y: -20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="w-full max-w-[560px] rounded-[24px] bg-[#FFF6F8] p-10 shadow-2xl border-2 border-[#FF8FA3]/40 max-h-[90vh] overflow-y-auto"
          >
            <h2
              style={{
                fontFamily: "Pacifico, cursive",
                color: "#FF8FA3",
                textShadow: "0 0 20px rgba(255,143,163,0.5)",
              }}
              className="text-3xl text-center mb-6"
            >
              Community Guidelines
            </h2>

            <p className="text-[#7A6C9D] text-center mb-6">
              Before joining, please read and agree to our community rules.
            </p>

            <div className="text-left space-y-3 mb-6">
              {rules.map((rule, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-[#FF8FA3] mt-1 flex-shrink-0">•</span>
                  <p className="text-[#2E2A4A]">{rule}</p>
                </div>
              ))}
            </div>

            <label className="flex items-start gap-3 mb-8 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 rounded accent-[#FF8FA3] cursor-pointer flex-shrink-0"
              />
              <span className="text-[#2E2A4A] text-sm">
                I have read and agree to the Community Guidelines.
              </span>
            </label>

            <div className="flex gap-3 justify-center">
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={!agreed}
                className={`px-6 py-3 rounded-full text-white transition-all ${
                  agreed
                    ? "bg-[#FF8FA3] hover:scale-105"
                    : "bg-[#FF8FA3]/40 cursor-not-allowed"
                }`}
              >
                {isGuest ? "Sign Up to Join" : "Join Community"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}