import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const REASONS = [
  "I'm too busy to participate",
  "The community isn't what I expected",
  "I'm getting too many notifications",
  "I had a negative experience",
  "Other",
];

export function LeaveCommunityModal({ isOpen, onClose, onConfirm }) {
  const [selectedReason, setSelectedReason] = useState("");
  const [otherText, setOtherText] = useState("");
  const [step, setStep] = useState("form"); // "form" | "thanks"

  useEffect(() => {
    if (!isOpen) {
      setSelectedReason("");
      setOtherText("");
      setStep("form");
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" && step === "form") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose, step]);

  const handleConfirm = () => {
    const reason =
      selectedReason === "Other" ? otherText.trim() : selectedReason;

    setStep("thanks");

    setTimeout(() => {
      onConfirm(reason || null);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/50 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget && step === "form") onClose();
          }}
        >
          <motion.div
            key={step}
            initial={{ y: -20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="w-full max-w-[480px] rounded-[24px] bg-[#FFF6F8] p-10 shadow-2xl border-2 border-[#FF8FA3]/40 max-h-[90vh] overflow-y-auto"
          >
            {step === "form" ? (
              <>
                <h2
                  style={{
                    fontFamily: "Pacifico, cursive",
                    color: "#FF8FA3",
                    textShadow: "0 0 20px rgba(255,143,163,0.5)",
                  }}
                  className="text-3xl text-center mb-4"
                >
                  Are You Sure?
                </h2>

                <p className="text-[#2E2A4A] text-center mb-6">
                  We'd love to know why you're leaving. (Optional)
                </p>

                <div className="space-y-3 mb-6">
                  {REASONS.map((reason) => (
                    <label
                      key={reason}
                      className="flex items-start gap-3 cursor-pointer select-none p-3 rounded-[12px] hover:bg-[#F6C1CC]/20 transition-all"
                    >
                      <input
                        type="radio"
                        name="leaveReason"
                        value={reason}
                        checked={selectedReason === reason}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="mt-1 w-4 h-4 accent-[#FF8FA3] cursor-pointer flex-shrink-0"
                      />
                      <span className="text-[#2E2A4A] text-sm">{reason}</span>
                    </label>
                  ))}
                </div>

                {selectedReason === "Other" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mb-6"
                  >
                    <textarea
                      value={otherText}
                      onChange={(e) => setOtherText(e.target.value)}
                      placeholder="Tell us more..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-[16px] bg-[#F6C1CC]/20 border-2 border-[#7A6C9D]/20 outline-none focus:ring-0 text-[#2E2A4A] placeholder:text-[#7A6C9D] resize-none"
                    />
                  </motion.div>
                )}

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="px-6 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
                  >
                    Yes, Leave
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="text-5xl mb-4">💜</div>
                <h2
                  style={{
                    fontFamily: "Pacifico, cursive",
                    color: "#FF8FA3",
                    textShadow: "0 0 20px rgba(255,143,163,0.5)",
                  }}
                  className="text-3xl mb-4"
                >
                  Thank You!
                </h2>
                <p className="text-[#2E2A4A] text-lg">
                  We appreciate your feedback.
                </p>
                <p className="text-[#7A6C9D] text-sm mt-2">
                  Hope to see you back soon.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}