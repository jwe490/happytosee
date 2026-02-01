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
      }, 300);
    },
    [onSelectMood]
  );

  const MoodButton = ({ mood, index }: { mood: typeof moods[0]; index: number }) => {
    const isSelected = selectedMood === mood.id;
    const isHovered = hoveredMood === mood.id;
    const isPressed = pressedMood === mood.id;
    
    // Animation trigger: hover OR press OR selected
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
        onTouchEnd={() => setTimeout(() => setHoveredMood(null), 250)}
        className="relative flex flex-col items-center cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
            scale: isPressed ? 0.96 : isHovered ? 1.02 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 28,
          }}
        >
          {/* Step 1 & 2: Solid filled background */}
          <motion.div
            className="absolute inset-0"
            style={{
              borderRadius,
              backgroundColor: "hsl(var(--muted))",
            }}
            animate={{
              opacity: isActive ? 0 : 1,
            }}
            transition={{
              duration: 0.15,
              ease: "easeOut",
            }}
          />

          {/* Step 3: Border appears when active */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius,
              border: "2.5px solid",
              borderColor: isSelected 
                ? "hsl(var(--primary))" 
                : "hsl(var(--foreground) / 0.5)",
            }}
            animate={{
              opacity: isActive ? 1 : 0,
              scale: isActive ? 1 : 0.97,
            }}
            transition={{
              duration: 0.12,
              ease: "easeOut",
            }}
          />

          {/* Icon container - shifts up when label enters */}
          <motion.div
            className="relative z-10 flex items-center justify-center"
            animate={{
              y: isActive ? -10 : 0,
              scale: isPressed ? 0.92 : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 600,
              damping: 32,
            }}
          >
            <motion.img
              src={mood.icon}
              alt={mood.label}
              className="select-none object-contain"
              style={{
                width: iconSize,
                height: iconSize,
              }}
              draggable={false}
              animate={{
                filter: isSelected
                  ? "drop-shadow(0 0 8px hsl(var(--primary) / 0.5))"
                  : "none",
              }}
            />
          </motion.div>

          {/* Step 4: Label squeezes up into the box */}
          <AnimatePresence>
            {isActive && (
              <motion.span
                initial={{ 
                  opacity: 0, 
                  y: 24, 
                  scaleX: 0.85,
                  scaleY: 0.7,
                }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scaleX: 1,
                  scaleY: 1,
                }}
                exit={{ 
                  opacity: 0, 
                  y: 16, 
                  scaleX: 0.9,
                  scaleY: 0.8,
                }}
                transition={{
                  type: "spring",
                  stiffness: 650,
                  damping: 30,
                  mass: 0.5,
                }}
                className={`
                  absolute bottom-2 font-bold text-xs tracking-tight
                  ${isSelected ? "text-primary" : "text-foreground"}
                `}
                style={{
                  transformOrigin: "center bottom",
                }}
              >
                {mood.label}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Selection ring glow */}
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 pointer-events-none"
              style={{
                borderRadius,
                boxShadow: "0 0 0 3px hsl(var(--primary) / 0.3)",
              }}
            />
          )}
        </motion.div>

        {/* External label - Step 1: visible when NOT active */}
        <motion.span
          className="mt-2 font-medium text-xs sm:text-sm tracking-tight text-center text-muted-foreground"
          animate={{
            opacity: isActive ? 0 : 1,
            y: isActive ? -10 : 0,
            scale: isActive ? 0.85 : 1,
          }}
          transition={{
            duration: 0.15,
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
