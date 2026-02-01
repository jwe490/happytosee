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

// Orange color from prototype
const MOOD_COLOR = "#f15e3d";

const MoodSelector = ({ selectedMood, onSelectMood }: MoodSelectorProps) => {
  const [hoveredMood, setHoveredMood] = useState<string | null>(null);
  const [pressedMood, setPressedMood] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleMoodClick = useCallback(
    (moodId: string) => {
      setPressedMood(moodId);
      setTimeout(() => {
        onSelectMood(moodId);
        trackMoodSelection(moodId);
      }, 100);
      setTimeout(() => {
        setPressedMood(null);
      }, 400);
    },
    [onSelectMood]
  );

  const MoodButton = ({ mood, index }: { mood: typeof moods[0]; index: number }) => {
    const isSelected = selectedMood === mood.id;
    const isHovered = hoveredMood === mood.id;
    const isPressed = pressedMood === mood.id;
    
    // Animation phases based on interaction
    const isActive = isHovered || isPressed || isSelected;
    
    // Dimensions
    const buttonWidth = isMobile ? 100 : 120;
    const buttonHeight = isMobile ? 72 : 84;
    const borderRadius = 20;
    const iconSize = isMobile ? 36 : 44;

    return (
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: index * 0.03,
          duration: 0.35,
          ease: [0.23, 1, 0.32, 1],
        }}
        onClick={() => handleMoodClick(mood.id)}
        onMouseEnter={() => setHoveredMood(mood.id)}
        onMouseLeave={() => setHoveredMood(null)}
        onTouchStart={() => setHoveredMood(mood.id)}
        onTouchEnd={() => setTimeout(() => setHoveredMood(null), 300)}
        className="relative flex flex-col items-center cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        style={{ borderRadius }}
      >
        {/* Main button container */}
        <motion.div
          className="relative flex items-center justify-center overflow-hidden"
          style={{
            width: buttonWidth,
            height: buttonHeight,
            borderRadius,
          }}
          animate={{
            scale: isPressed ? 0.97 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        >
          {/* Solid orange background - always visible */}
          <motion.div
            className="absolute inset-0"
            style={{
              borderRadius,
              backgroundColor: MOOD_COLOR,
            }}
          />

          {/* Step 3 & 4: Dark border appears on hover/active */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius,
              border: "3px solid #333",
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: isActive ? 1 : 0,
            }}
            transition={{
              duration: 0.15,
              ease: "easeOut",
            }}
          />

          {/* Step 1: Icon - visible only when NOT active */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-10"
            animate={{
              opacity: isActive ? 0 : 1,
              scale: isActive ? 0.8 : 1,
            }}
            transition={{
              duration: 0.2,
              ease: "easeOut",
            }}
          >
            <img
              src={mood.icon}
              alt={mood.label}
              className="select-none object-contain"
              style={{
                width: iconSize,
                height: iconSize,
              }}
              draggable={false}
            />
          </motion.div>

          {/* Step 4: Label inside button - appears on hover/active */}
          <AnimatePresence>
            {isActive && (
              <motion.span
                initial={{ 
                  opacity: 0, 
                  y: 30, 
                  scale: 0.7,
                }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                }}
                exit={{ 
                  opacity: 0, 
                  y: 20, 
                  scale: 0.8,
                }}
                transition={{
                  type: "spring",
                  stiffness: 600,
                  damping: 28,
                  mass: 0.6,
                  delay: 0.05,
                }}
                className="absolute inset-0 flex items-center justify-center font-bold text-sm tracking-tight text-white z-20"
                style={{
                  transformOrigin: "center bottom",
                }}
              >
                {mood.label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        {/* External label - Step 1 & 2: visible when NOT active */}
        <motion.span
          className="mt-2 font-semibold text-xs sm:text-sm tracking-tight text-center text-foreground"
          animate={{
            opacity: isActive ? 0 : 1,
            y: isActive ? -12 : 0,
            scale: isActive ? 0.85 : 1,
          }}
          transition={{
            duration: 0.2,
            ease: "easeOut",
          }}
        >
          {mood.label}
        </motion.span>
      </motion.button>
    );
  };

  return (
    <div id="mood-selector" className="w-full max-w-5xl mx-auto px-4 sm:px-6">
      {/* Responsive grid: 2 cols mobile, 3 cols tablet, 4 cols desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 justify-items-center">
        {moods.map((mood, index) => (
          <MoodButton key={mood.id} mood={mood} index={index} />
        ))}
      </div>
    </div>
  );
};

export default MoodSelector;
