import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MoodTileProps {
  id: string;
  emoji: string;
  label: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
  index?: number;
}

/**
 * MoodTile - High-end Glassmorphism component
 * Features:
 * - Ultra-subtle glass background with heavy backdrop blur
 * - 3D floating emoji with drop shadow
 * - Hyper-active hover/click animations with gradient burst
 */
const MoodTile = ({
  id,
  emoji,
  label,
  description,
  isSelected,
  onClick,
  index = 0,
}: MoodTileProps) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.06,
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ 
        scale: 1.02, 
        y: -4,
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        // Base glass structure
        "relative group p-6 rounded-2xl overflow-hidden",
        "bg-white/5 backdrop-blur-xl",
        "border border-white/10",
        // Transitions
        "transition-all duration-300 ease-out",
        // Hover state - brightness increase
        "hover:bg-white/10",
        // Selected state
        isSelected && [
          "bg-white/15",
          "ring-2 ring-accent/50",
          // Gradient border glow for selected
          "before:absolute before:inset-0 before:rounded-2xl",
          "before:bg-gradient-to-br before:from-cyan-500/20 before:to-purple-500/20",
          "before:opacity-100 before:-z-10",
        ]
      )}
    >
      {/* Inner glow effect */}
      <div 
        className={cn(
          "absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300",
          "bg-gradient-to-br from-white/5 via-transparent to-white/5",
          "group-hover:opacity-100",
          isSelected && "opacity-100"
        )} 
      />

      {/* Gradient burst on active/click - Cyan to Purple */}
      <div 
        className={cn(
          "absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-150",
          "bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-cyan-500/30",
          "group-active:opacity-100"
        )} 
      />

      {/* Border gradient flash on click */}
      <div 
        className={cn(
          "absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-150",
          "ring-2 ring-inset ring-transparent",
          "group-active:ring-gradient-to-r group-active:from-cyan-400 group-active:to-purple-500",
          "group-active:opacity-100"
        )}
        style={{
          background: "transparent",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "2px",
        }}
      >
        <div 
          className={cn(
            "absolute inset-0 rounded-2xl opacity-0 group-active:opacity-100",
            "bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400",
            "transition-opacity duration-150"
          )} 
        />
      </div>

      <div className="relative flex flex-col items-center gap-4">
        {/* Emoji with 3D floating effect */}
        <motion.span
          className={cn(
            "text-4xl md:text-5xl",
            "drop-shadow-lg",
            // Extra glow for selected
            isSelected && "drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]"
          )}
          animate={
            isSelected
              ? {
                  scale: [1, 1.15, 1],
                  rotate: [0, -8, 8, 0],
                }
              : {}
          }
          transition={{ duration: 0.5 }}
        >
          {emoji}
        </motion.span>

        <div className="text-center">
          <h3 className="font-display font-semibold text-sm md:text-base text-foreground">
            {label}
          </h3>
          <p className="text-[10px] md:text-xs text-muted-foreground mt-1 hidden sm:block">
            {description}
          </p>
        </div>

        {/* Selected checkmark */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={cn(
              "absolute -top-1 -right-1 w-6 h-6 rounded-full",
              "bg-accent text-accent-foreground",
              "flex items-center justify-center",
              "shadow-lg shadow-accent/30"
            )}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
        )}
      </div>
    </motion.button>
  );
};

export default MoodTile;
