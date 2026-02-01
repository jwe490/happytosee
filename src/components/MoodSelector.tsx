import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trackMoodSelection } from "@/lib/analytics";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [clickedMood, setClickedMood] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleMoodClick = useCallback((moodId: string) => {
    setClickedMood(moodId);
    
    // Trigger selection after satisfying squash animation
    setTimeout(() => {
      onSelectMood(moodId);
      trackMoodSelection(moodId);
    }, 80);
    
    // Reset clicked state
    setTimeout(() => {
      setClickedMood(null);
    }, 350);
  }, [onSelectMood]);

  return (
    <div id="mood-selector" className="w-full max-w-5xl mx-auto px-4 sm:px-6">
      {/* 
        Grid: 
        - Small devices (< 640px): 2 columns x 6 rows
        - Medium devices (640px - 1024px): 3 columns x 4 rows  
        - Large devices (1024px+): 4 columns x 3 rows
      */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        {moods.map((mood, index) => {
          const isSelected = selectedMood === mood.id;
          const isHovered = hoveredMood === mood.id;
          const isClicked = clickedMood === mood.id;

          return (
            <motion.button
              key={mood.id}
              type="button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: index * 0.03, 
                duration: 0.4,
                ease: [0.23, 1, 0.32, 1],
              }}
              onClick={() => handleMoodClick(mood.id)}
              onMouseEnter={() => setHoveredMood(mood.id)}
              onMouseLeave={() => setHoveredMood(null)}
              className="relative flex flex-col items-center justify-center py-4 sm:py-5 group cursor-pointer touch-manipulation focus:outline-none"
            >
              {/* Icon container with squash-stretch animation */}
              <motion.div
                className="relative flex items-center justify-center"
                animate={{
                  // Squash on click: compress Y, expand X
                  scaleX: isClicked ? 1.2 : isSelected ? 1.05 : 1,
                  scaleY: isClicked ? 0.8 : isSelected ? 1.05 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 600,
                  damping: 15,
                  mass: 0.5,
                }}
              >
                {/* Selection glow ring - elegant and minimal */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="absolute inset-0 -m-3 rounded-full"
                      style={{
                        background: "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)",
                      }}
                    />
                  )}
                </AnimatePresence>
                
                {/* Hover glow effect */}
                <motion.div
                  className="absolute inset-0 -m-4 rounded-full pointer-events-none"
                  initial={false}
                  animate={{ 
                    opacity: isHovered && !isSelected ? 0.6 : 0,
                    scale: isHovered ? 1.1 : 0.8,
                  }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: "radial-gradient(circle, hsl(var(--foreground) / 0.05) 0%, transparent 70%)",
                  }}
                />
                
                {/* The icon itself - LARGE and prominent */}
                <motion.img
                  src={mood.icon}
                  alt={mood.label}
                  className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 select-none object-contain relative z-10"
                  draggable={false}
                  animate={{
                    filter: isSelected 
                      ? "drop-shadow(0 0 16px hsl(var(--primary) / 0.4))" 
                      : "drop-shadow(0 0 0px transparent)",
                  }}
                  transition={{ duration: 0.2 }}
                />
              </motion.div>

              {/* Label - always visible on mobile/tablet, hover-only on desktop */}
              <motion.span
                className={`
                  mt-3 font-medium text-sm sm:text-base tracking-tight
                  transition-colors duration-200
                  ${isSelected ? "text-primary" : "text-foreground/60 group-hover:text-foreground/90"}
                  
                  /* Always visible on mobile/tablet */
                  lg:opacity-0 lg:translate-y-2
                  lg:group-hover:opacity-100 lg:group-hover:translate-y-0
                  lg:transition-all lg:duration-200
                `}
                animate={{
                  scale: isClicked ? 0.95 : 1,
                }}
                transition={{ duration: 0.15 }}
              >
                {mood.label}
              </motion.span>

              {/* Desktop-only tooltip on hover (appears below label position) */}
              <AnimatePresence>
                {isHovered && !isMobile && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="hidden lg:block absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap z-20"
                  >
                    <span className="px-3 py-1.5 text-xs font-medium bg-popover text-popover-foreground rounded-lg shadow-xl border border-border/50">
                      {mood.label}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default MoodSelector;
