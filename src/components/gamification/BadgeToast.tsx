import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/hooks/useGamification";
import confetti from "canvas-confetti";
import { useEffect } from "react";

interface BadgeToastProps {
  badge: Badge | null;
  onClose: () => void;
}

export function BadgeToast({ badge, onClose }: BadgeToastProps) {
  useEffect(() => {
    if (badge) {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.3 },
        colors: ["#FFD700", "#FFA500", "#FF6347", "#9400D3", "#00CED1"],
      });
    }
  }, [badge]);

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          initial={{ y: -100, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -50, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50"
        >
          <div 
            className="bg-gradient-to-r from-amber-500/90 to-orange-500/90 backdrop-blur-lg rounded-2xl p-4 shadow-2xl border border-amber-400/50 cursor-pointer"
            onClick={onClose}
          >
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, -10, 10, 0]
                }}
                transition={{ duration: 0.5, repeat: 2 }}
                className="text-5xl"
              >
                {badge.badge_icon}
              </motion.div>
              <div>
                <p className="text-xs uppercase tracking-wider text-amber-100 font-medium">
                  🎉 New Badge Unlocked!
                </p>
                <p className="text-lg font-bold text-white">{badge.badge_name}</p>
                <p className="text-sm text-amber-100">{badge.badge_description}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
