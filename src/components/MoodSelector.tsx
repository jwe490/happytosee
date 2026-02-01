import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trackMoodSelection } from "@/lib/analytics";

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

  const handleMoodClick = useCallback((moodId: string) => {
    setClickedMood(moodId);
    
    // Short delay for animation feedback before selection
    setTimeout(() => {
      onSelectMood(moodId);
      trackMoodSelection(moodId);
    }, 120);
    
    // Reset clicked state
    setTimeout(() => {
      setClickedMood(null);
    }, 400);
  }, [onSelectMood]);

  return (
    <div id="mood-selector" className="w-full max-w-4xl mx-auto px-3 sm:px-4">
      {/* Responsive Grid: 3 cols mobile, 4 cols tablet, 6 cols desktop */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
        {moods.map((mood, index) => {
          const isSelected = selectedMood === mood.id;
          const isHovered = hoveredMood === mood.id;
          const isClicked = clickedMood === mood.id;

          return (
            <motion.button
              key={mood.id}
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: index * 0.03, 
                duration: 0.3,
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleMoodClick(mood.id)}
              onMouseEnter={() => setHoveredMood(mood.id)}
              onMouseLeave={() => setHoveredMood(null)}
              className="relative flex flex-col items-center justify-center group cursor-pointer touch-manipulation focus:outline-none"
            >
              {/* Icon container - main button, no outer box */}
              <motion.div
                className="relative"
                animate={{
                  scale: isClicked ? 1.25 : isSelected ? 1.1 : 1,
                  rotate: isClicked ? [0, -8, 8, -4, 0] : 0,
                }}
                transition={{
                  scale: { type: "spring", stiffness: 400, damping: 15 },
                  rotate: { duration: 0.4, ease: "easeOut" },
                }}
              >
                {/* Selection ring */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="absolute -inset-2 rounded-full border-2 border-primary"
                    />
                  )}
                </AnimatePresence>
                
                {/* Click ripple effect */}
                <AnimatePresence>
                  {isClicked && (
                    <motion.div
                      initial={{ scale: 0.3, opacity: 0.6 }}
                      animate={{ scale: 2.5, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-primary/30"
                    />
                  )}
                </AnimatePresence>
                
                {/* The icon itself */}
                <motion.img
                  src={mood.icon}
                  alt={mood.label}
                  className={`
                    w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 
                    select-none object-contain relative z-10
                    transition-all duration-200
                    ${isSelected ? "drop-shadow-[0_0_12px_hsl(var(--primary)/0.5)]" : ""}
                  `}
                  draggable={false}
                />
                
                {/* Subtle glow on hover */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/10 blur-xl -z-10"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ 
                    opacity: isHovered || isSelected ? 0.8 : 0,
                    scale: isHovered || isSelected ? 1.2 : 0.5,
                  }}
                  transition={{ duration: 0.2 }}
                />
              </motion.div>

              {/* Label - visible on mobile/tablet, hover-only on desktop */}
              <motion.span
                className={`
                  mt-2 font-medium text-xs sm:text-sm tracking-tight
                  transition-all duration-200
                  ${isSelected ? "text-primary" : "text-foreground/70"}
                  
                  /* Mobile/tablet: always visible */
                  lg:opacity-0 lg:translate-y-1
                  
                  /* Desktop: show on hover */
                  lg:group-hover:opacity-100 lg:group-hover:translate-y-0
                `}
                animate={{
                  scale: isClicked ? 1.1 : 1,
                }}
                transition={{ duration: 0.15 }}
              >
                {mood.label}
              </motion.span>

              {/* Desktop hover tooltip (alternative to inline label) */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className="hidden lg:block absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
                  >
                    <span className="px-2 py-1 text-xs font-medium bg-popover text-popover-foreground rounded-md shadow-lg border border-border">
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
