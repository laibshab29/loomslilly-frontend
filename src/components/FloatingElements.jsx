import { motion } from "framer-motion";
import { Headphones, Disc, Circle, Square, Triangle } from "lucide-react";

export function FloatingElements() {
  const elements = [
    { Icon: Headphones, x: "10%", y: "15%", delay: 0, duration: 8 },
    { Icon: Disc, x: "85%", y: "25%", delay: 1, duration: 10 },
    { Icon: Circle, x: "20%", y: "60%", delay: 0.5, duration: 9 },
    { Icon: Square, x: "90%", y: "70%", delay: 1.5, duration: 11 },
    { Icon: Triangle, x: "15%", y: "85%", delay: 0.8, duration: 7 },
    { Icon: Headphones, x: "75%", y: "10%", delay: 1.2, duration: 9.5 },
    { Icon: Circle, x: "50%", y: "40%", delay: 0.3, duration: 10.5 },
    { Icon: Disc, x: "30%", y: "30%", delay: 1.8, duration: 8.5 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {elements.map((element, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{ left: element.x, top: element.y }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 15, -15, 0],
          }}
          transition={{
            duration: element.duration,
            repeat: Infinity,
            delay: element.delay,
            ease: "easeInOut",
          }}
        >
          <element.Icon
            className="w-16 h-16 text-[#F6C1CC]/20"
            style={{
              strokeWidth: 1.5,
              filter: "drop-shadow(0 4px 8px rgba(246, 193, 204, 0.3))",
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}