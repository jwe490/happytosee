import { useState } from "react";
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
  const [animatingMood, setAnimatingMood] = useState<string | null>(null);

  const handleMoodClick = (moodId: string) => {
    setAnimatingMood(moodId);
    
    setTimeout(() => {
      onSelectMood(moodId);
      trackMoodSelection(moodId);
    }, 200);
    
    setTimeout(() => {
      setAnimatingMood(null);
    }, 500);
  };

  return (
    <div id="mood-selector" className="w-full max-w-4xl mx-auto px-3 sm:px-4">
      {/* Responsive Grid: 3 cols mobile, 4 cols tablet, 6 cols desktop */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
        {moods.map((mood, index) => {
          const isSelected = selectedMood === mood.id;
          const isAnimating = animatingMood === mood.id;

          return (
            <motion.button
              key={mood.id}
              type="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03, duration: 0.2 }}
              whileHover={{ scale: 1.06, y: -2 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleMoodClick(mood.id)}
              className={`
                relative flex flex-col items-center justify-center
                aspect-square
                rounded-2xl sm:rounded-3xl
                border-2 transition-all duration-200
                cursor-pointer
                touch-manipulation
                overflow-hidden
                ${isSelected 
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/20" 
                  : "border-border/60 bg-card/80 hover:border-primary/40 hover:bg-card"
                }
              `}
            >
              {/* Ripple effect on click */}
              <AnimatePresence>
                {isAnimating && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0.5 }}
                    animate={{ scale: 3, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-primary/40"
                  />
                )}
              </AnimatePresence>

              {/* Icon */}
              <motion.img
                src={mood.icon}
                alt={mood.label}
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 select-none object-contain"
                animate={isAnimating ? {
                  scale: [1, 1.35, 1],
                  rotate: [0, -12, 12, 0],
                } : {}}
                transition={{ duration: 0.45 }}
              />

              {/* Label */}
              <motion.span
                className={`mt-1.5 sm:mt-2 font-medium text-[10px] sm:text-xs md:text-sm tracking-tight ${
                  isSelected ? "text-primary" : "text-foreground/80"
                }`}
                animate={isAnimating ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {mood.label}
              </motion.span>

              {/* Selected indicator */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary flex items-center justify-center shadow-md"
                  >
                    <svg
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
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
