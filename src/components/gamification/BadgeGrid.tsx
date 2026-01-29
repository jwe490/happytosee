import { motion, AnimatePresence } from "framer-motion";
import { Badge, BADGE_DEFINITIONS } from "@/hooks/useGamification";
import { Lock } from "lucide-react";

interface BadgeGridProps {
  earnedBadges: Badge[];
  showLocked?: boolean;
}

export function BadgeGrid({ earnedBadges, showLocked = true }: BadgeGridProps) {
  const earnedIds = new Set(earnedBadges.map((b) => b.badge_id));

  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
      {BADGE_DEFINITIONS.map((def, index) => {
        const isEarned = earnedIds.has(def.id);
        const earnedBadge = earnedBadges.find((b) => b.badge_id === def.id);

        if (!showLocked && !isEarned) return null;

        return (
          <motion.div
            key={def.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="group relative"
          >
            <div
              className={`
                aspect-square rounded-2xl flex flex-col items-center justify-center p-2
                transition-all duration-300 cursor-pointer
                ${isEarned
                  ? "bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 shadow-lg"
                  : "bg-secondary/50 border border-border opacity-50 grayscale"
                }
              `}
            >
              {isEarned ? (
                <motion.span
                  className="text-3xl"
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 4, repeatType: "reverse" }}
                >
                  {def.icon}
                </motion.span>
              ) : (
                <div className="relative">
                  <span className="text-3xl opacity-30">{def.icon}</span>
                  <Lock className="absolute inset-0 m-auto w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Tooltip */}
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                whileHover={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none"
              >
                <div className="bg-card border border-border rounded-lg shadow-xl p-3 text-center min-w-[140px]">
                  <p className="font-semibold text-foreground text-sm">{def.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{def.description}</p>
                  {earnedBadge && (
                    <p className="text-xs text-primary mt-2">
                      Earned {new Date(earnedBadge.earned_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
