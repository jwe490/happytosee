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
      }, 80);
      setTimeout(() => {
        setPressedMood(null);
      }, 250);
    },
    [onSelectMood]
  );

  const MoodButton = ({ mood, index }: { mood: typeof moods[0]; index: number }) => {
    const isSelected = selectedMood === mood.id;
    const isHovered = hoveredMood === mood.id;
    const isPressed = pressedMood === mood.id;
    
    // Animation states for the 4-step sequence
    // Step 1: Base state (icon with label below)
    // Step 2: Hover starts (same as 1)
    // Step 3: Background fades, border appears (rapid)
    // Step 4: Label squeezes up into box (snappy)
    const showLabelInside = isHovered || isPressed || isSelected;

    return (
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: index * 0.02,
          duration: 0.3,
          ease: [0.23, 1, 0.32, 1],
        }}
        onClick={() => handleMoodClick(mood.id)}
        onMouseEnter={() => setHoveredMood(mood.id)}
        onMouseLeave={() => setHoveredMood(null)}
        onMouseDown={() => setPressedMood(mood.id)}
        onMouseUp={() => setPressedMood(null)}
        onTouchStart={() => setHoveredMood(mood.id)}
        onTouchEnd={() => {
          setTimeout(() => setHoveredMood(null), 200);
        }}
        className="relative flex flex-col items-center cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-[20px]"
      >
        {/* Main button container - unified rounded-rect shape */}
        <motion.div
          className="relative flex items-center justify-center overflow-hidden"
          style={{
            width: isMobile ? 100 : 120,
            height: isMobile ? 72 : 84,
            borderRadius: 20,
          }}
          animate={{
            scale: isPressed ? 0.95 : isHovered ? 1.02 : 1,
            y: isPressed ? 1 : isHovered ? -2 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 25,
            mass: 0.6,
          }}
        >
          {/* Background layer - solid when not hovered, fades on hover */}
          <motion.div
            className="absolute inset-0 rounded-[20px]"
            initial={false}
            animate={{
              backgroundColor: showLabelInside 
                ? "transparent" 
                : isSelected 
                  ? "hsl(var(--primary) / 0.15)" 
                  : "hsl(var(--muted))",
              borderWidth: 2,
              borderColor: showLabelInside 
                ? isSelected 
                  ? "hsl(var(--primary))" 
                  : "hsl(var(--foreground) / 0.4)"
                : isSelected
                  ? "hsl(var(--primary) / 0.5)"
                  : "transparent",
            }}
            transition={{
              duration: 0.15,
              ease: "easeOut",
            }}
            style={{
              borderStyle: "solid",
            }}
          />

          {/* Icon - always visible, scales slightly on hover */}
          <motion.div
            className="relative z-10 flex flex-col items-center justify-center"
            animate={{
              y: showLabelInside ? -8 : 0,
              scale: isPressed ? 0.9 : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 600,
              damping: 30,
              mass: 0.5,
            }}
          >
            <motion.img
              src={mood.icon}
              alt={mood.label}
              className="select-none object-contain"
              style={{
                width: isMobile ? 36 : 44,
                height: isMobile ? 36 : 44,
              }}
              draggable={false}
              animate={{
                filter: isSelected
                  ? "drop-shadow(0 0 8px hsl(var(--primary) / 0.6))"
                  : "none",
              }}
            />
          </motion.div>

          {/* Label inside box - slides up on hover (Step 4) */}
          <AnimatePresence>
            {showLabelInside && (
              <motion.span
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                transition={{
                  type: "spring",
                  stiffness: 700,
                  damping: 35,
                  mass: 0.4,
                  delay: 0.02,
                }}
                className={`
                  absolute bottom-2 font-semibold text-xs tracking-tight
                  ${isSelected ? "text-primary" : "text-foreground"}
                `}
              >
                {mood.label}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Selection glow effect */}
          <AnimatePresence>
            {isSelected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute inset-0 rounded-[20px] ring-2 ring-primary ring-offset-2 ring-offset-background"
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* External label - visible only when NOT hovered */}
        <motion.span
          className="mt-2 font-medium text-xs sm:text-sm tracking-tight text-center text-muted-foreground"
          animate={{
            opacity: showLabelInside ? 0 : 1,
            y: showLabelInside ? -8 : 0,
            scale: showLabelInside ? 0.9 : 1,
          }}
          transition={{
            duration: 0.12,
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
      {/* Grid: 2 cols mobile, 3 cols tablet, 4 cols desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 justify-items-center">
        {moods.map((mood, index) => (
          <MoodButton key={mood.id} mood={mood} index={index} />
        ))}
      </div>
    </div>
  );
};

export default MoodSelector;
