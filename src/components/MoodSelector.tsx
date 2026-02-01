import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trackMoodSelection } from "@/lib/analytics";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import happySvg from "@/assets/mood-happy.svg";
import sadSvg from "@/assets/mood-sad.svg";
import romanticSvg from "@/assets/mood-romantic.svg";
import excitedSvg from "@/assets/mood-excited.svg";
import chillSvg from "@/assets/mood-chill.svg";
import adventurousSvg from "@/assets/mood-adventurous.svg";
import nostalgicSvg from "@/assets/mood-nostalgic.svg";
import thrilledSvg from "@/assets/mood-thrilled.svg";
import stressedSvg from "@/assets/mood-stressed.svg";
import motivatedSvg from "@/assets/mood-motivated.svg";
import boredSvg from "@/assets/mood-bored.svg";
import inspiredSvg from "@/assets/mood-inspired.svg";

interface MoodSelectorProps {
  selectedMood: string | null;
  onSelectMood: (mood: string) => void;
}

const moods = [
  { id: "happy", label: "Happy", icon: happySvg },
  { id: "sad", label: "Sad", icon: sadSvg },
  { id: "romantic", label: "Romantic", icon: romanticSvg },
  { id: "excited", label: "Excited", icon: excitedSvg },
  { id: "chill", label: "Chill", icon: chillSvg },
  { id: "adventurous", label: "Adventurous", icon: adventurousSvg },
  { id: "nostalgic", label: "Nostalgic", icon: nostalgicSvg },
  { id: "thrilled", label: "Thrilled", icon: thrilledSvg },
  { id: "stressed", label: "Stressed", icon: stressedSvg },
  { id: "motivated", label: "Motivated", icon: motivatedSvg },
  { id: "bored", label: "Bored", icon: boredSvg },
  { id: "inspired", label: "Inspired", icon: inspiredSvg },
];

const MoodSelector = ({ selectedMood, onSelectMood }: MoodSelectorProps) => {
  const [hoveredMood, setHoveredMood] = useState<string | null>(null);
  const [pressedMood, setPressedMood] = useState<string | null>(null);
  const isMobile = useIsMobile();
  // Treat anything under 1024px as needing labels (mobile + tablet)
  const showLabels = typeof window !== "undefined" && window.innerWidth < 1024;

  const handleMoodClick = useCallback(
    (moodId: string) => {
      setPressedMood(moodId);
      setTimeout(() => {
        onSelectMood(moodId);
        trackMoodSelection(moodId);
      }, 100);
      setTimeout(() => {
        setPressedMood(null);
      }, 300);
    },
    [onSelectMood]
  );

  const MoodButton = ({ mood, index }: { mood: typeof moods[0]; index: number }) => {
    const isSelected = selectedMood === mood.id;
    const isHovered = hoveredMood === mood.id;
    const isPressed = pressedMood === mood.id;

    const button = (
      <motion.button
        type="button"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          delay: index * 0.025,
          duration: 0.35,
          ease: [0.23, 1, 0.32, 1],
        }}
        onClick={() => handleMoodClick(mood.id)}
        onMouseEnter={() => setHoveredMood(mood.id)}
        onMouseLeave={() => setHoveredMood(null)}
        onMouseDown={() => setPressedMood(mood.id)}
        onMouseUp={() => setPressedMood(null)}
        className="relative flex flex-col items-center justify-center cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl"
      >
        {/* Icon container with border wrapper and zoom depth animation */}
        <motion.div
          className={`
            relative flex items-center justify-center
            w-20 h-20 sm:w-24 sm:h-24
            rounded-2xl
            border-2 transition-colors duration-200
            ${isSelected 
              ? "border-primary bg-primary/10 shadow-lg shadow-primary/20" 
              : isHovered 
                ? "border-foreground/30 bg-muted/50" 
                : "border-border bg-card"
            }
          `}
          animate={{
            scale: isPressed ? 1.08 : isHovered ? 1.04 : 1,
            y: isPressed ? 2 : isHovered ? -2 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 20,
            mass: 0.8,
          }}
          style={{
            boxShadow: isPressed
              ? "0 4px 20px -4px hsl(var(--primary) / 0.3)"
              : isHovered
              ? "0 8px 30px -8px hsl(var(--foreground) / 0.15)"
              : "0 2px 8px -2px hsl(var(--foreground) / 0.05)",
          }}
        >
          {/* Selection indicator ring */}
          <AnimatePresence>
            {isSelected && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute inset-0 rounded-2xl border-2 border-primary"
              />
            )}
          </AnimatePresence>

          {/* Icon */}
          <motion.img
            src={mood.icon}
            alt={mood.label}
            className="w-10 h-10 sm:w-12 sm:h-12 select-none object-contain"
            draggable={false}
            animate={{
              scale: isPressed ? 0.9 : 1,
              filter: isSelected
                ? "drop-shadow(0 0 12px hsl(var(--primary) / 0.5))"
                : "none",
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 25,
            }}
          />
        </motion.div>

        {/* Label - visible on mobile/tablet, hidden on desktop (tooltip instead) */}
        <motion.span
          className={`
            mt-2.5 font-medium text-xs sm:text-sm tracking-tight text-center
            transition-colors duration-200
            ${isSelected ? "text-primary" : "text-muted-foreground"}
            lg:hidden
          `}
        >
          {mood.label}
        </motion.span>
      </motion.button>
    );

    // On desktop (lg+), wrap with tooltip
    if (!showLabels) {
      return (
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="bottom" className="font-medium">
            {mood.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  };

  return (
    <div id="mood-selector" className="w-full max-w-5xl mx-auto px-4 sm:px-6">
      {/* 
        Grid: 
        - Small devices (< 640px): 2 columns x 6 rows
        - Medium devices (640px - 1024px): 3 columns x 4 rows  
        - Large devices (1024px+): 4 columns x 3 rows
      */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 justify-items-center">
        {moods.map((mood, index) => (
          <MoodButton key={mood.id} mood={mood} index={index} />
        ))}
      </div>
    </div>
  );
};

export default MoodSelector;
