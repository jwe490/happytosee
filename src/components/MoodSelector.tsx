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
    <div className="w-full max-w-3xl mx-auto px-4">
      {/* Grid: 2 cols mobile, 3 cols tablet, 4 cols desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {moods.map((mood, index) => {
          const isSelected = selectedMood === mood.id;
          const isAnimating = animatingMood === mood.id;

          return (
            <motion.button
              key={mood.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.04, duration: 0.25 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleMoodClick(mood.id)}
              className={`
                relative flex flex-col items-center justify-center
                bg-secondary/80 hover:bg-secondary
                rounded-2xl
                py-5 px-4 md:py-6 md:px-5 lg:py-7 lg:px-6
                border border-border/50
                transition-colors duration-200
                ${isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background bg-secondary" : ""}
                cursor-pointer
                min-h-[100px] md:min-h-[115px] lg:min-h-[130px]
              `}
            >
              {/* Ripple effect on click */}
              <AnimatePresence>
                {isAnimating && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0.4 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-primary/30"
                  />
                )}
              </AnimatePresence>

              {/* Centered Icon */}
              <motion.img
                src={mood.icon}
                alt={mood.label}
                className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 select-none object-contain"
                animate={isAnimating ? {
                  scale: [1, 1.3, 1],
                  rotate: [0, -10, 10, 0],
                } : {}}
                transition={{ duration: 0.4 }}
              />

              {/* Label */}
              <motion.span
                className="mt-2 font-display font-semibold text-foreground text-sm md:text-base"
                animate={isAnimating ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {mood.label}
              </motion.span>

              {/* Selected checkmark */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                  >
                    <svg
                      className="w-3 h-3 text-primary-foreground"
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