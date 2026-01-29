import { motion } from "framer-motion";
import { Flame, Zap, Trophy, Calendar } from "lucide-react";
import { StreakData } from "@/hooks/useGamification";

interface StreakDisplayProps {
  streakData: StreakData | null;
  compact?: boolean;
}

export function StreakDisplay({ streakData, compact = false }: StreakDisplayProps) {
  if (!streakData) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Flame className="w-4 h-4" />
        <span>Start your streak!</span>
      </div>
    );
  }

  const { current_streak, longest_streak, total_days_active } = streakData;

  if (compact) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30"
      >
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
          className="text-lg"
        >
          🔥
        </motion.span>
        <span className="font-bold text-foreground">{current_streak}</span>
        <span className="text-xs text-muted-foreground">day{current_streak !== 1 ? "s" : ""}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-secondary/50 border border-border"
    >
      {/* Current Streak */}
      <div className="flex flex-col items-center text-center">
        <motion.div
          animate={{ scale: current_streak > 0 ? [1, 1.1, 1] : 1 }}
          transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mb-2"
        >
          <Flame className="w-6 h-6 text-white" />
        </motion.div>
        <span className="text-2xl font-bold text-foreground">{current_streak}</span>
        <span className="text-xs text-muted-foreground">Current Streak</span>
      </div>

      {/* Longest Streak */}
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center mb-2">
          <Trophy className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold text-foreground">{longest_streak}</span>
        <span className="text-xs text-muted-foreground">Best Streak</span>
      </div>

      {/* Total Days */}
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mb-2">
          <Calendar className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold text-foreground">{total_days_active}</span>
        <span className="text-xs text-muted-foreground">Total Days</span>
      </div>
    </motion.div>
  );
}
