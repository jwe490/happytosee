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
  const [pressedMood, setPressedMood] = useState<string | null>(null);

  const handleMoodClick = useCallback(
    (moodId: string) => {
      setPressedMood(moodId);
      setTimeout(() => {
        onSelectMood(moodId);
        trackMoodSelection(moodId);
        setPressedMood(null);
      }, 150);
    },
    [onSelectMood]
  );

  return (
    <div id="mood-selector" className="w-full max-w-5xl mx-auto px-4 sm:px-6">
      {/* Grid: 2 cols mobile, 3 cols tablet, 4 cols desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 justify-items-center">
        {moods.map((mood, index) => (
          <MoodButton
            key={mood.id}
            mood={mood}
            index={index}
            isSelected={selectedMood === mood.id}
            isHovered={hoveredMood === mood.id}
            isPressed={pressedMood === mood.id}
            onSelect={handleMoodClick}
            onHover={setHoveredMood}
            onPress={setPressedMood}
          />
        ))}
      </div>
    </div>
  );
};

interface MoodButtonProps {
  mood: typeof moods[0];
  index: number;
  isSelected: boolean;
  isHovered: boolean;
  isPressed: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onPress: (id: string | null) => void;
}

const MoodButton = ({
  mood,
  index,
  isSelected,
  isHovered,
  isPressed,
  onSelect,
  onHover,
  onPress,
}: MoodButtonProps) => {
  // Animation states based on the 4-state sequence
  // State 1: Default - icon visible, label below
  // State 2: Hover transition - preparing
  // State 3: Hover/Focus - border appears
  // State 4: Active - label morphs up into button
  
  const isActive = isSelected || isHovered;
  const showBorder = isActive;
  const showLabelInside = isActive;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        delay: index * 0.03,
        duration: 0.4,
        ease: [0.23, 1, 0.32, 1],
      }}
      onClick={() => onSelect(mood.id)}
      onMouseEnter={() => onHover(mood.id)}
      onMouseLeave={() => onHover(null)}
      onMouseDown={() => onPress(mood.id)}
      onMouseUp={() => onPress(null)}
      onTouchStart={() => onPress(mood.id)}
      onTouchEnd={() => onPress(null)}
      className="relative flex flex-col items-center cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {/* Main button container with morphing animation */}
      <motion.div
        className="relative overflow-hidden"
        animate={{
          scale: isPressed ? 0.95 : isHovered ? 1.05 : 1,
          y: isPressed ? 2 : isHovered ? -3 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
          mass: 0.8,
        }}
        style={{
          width: 88,
          height: 88,
        }}
      >
        {/* Background - coral orange */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            backgroundColor: "#FF6B52",
          }}
          animate={{
            boxShadow: isActive
              ? "0 8px 24px -4px rgba(255, 107, 82, 0.4), 0 4px 12px -2px rgba(0, 0, 0, 0.15)"
              : "0 4px 12px -2px rgba(255, 107, 82, 0.25), 0 2px 6px -1px rgba(0, 0, 0, 0.08)",
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />

        {/* Border - appears on hover/active (State 3) */}
        <AnimatePresence>
          {showBorder && (
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
              }}
              style={{
                border: "3px solid #2D3436",
              }}
            />
          )}
        </AnimatePresence>

        {/* Icon - fades out when label moves in (State 2 transition) */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            opacity: showLabelInside ? 0 : 1,
            scale: showLabelInside ? 0.8 : 1,
            y: showLabelInside ? -10 : 0,
          }}
          transition={{
            duration: 0.25,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          <img
            src={mood.icon}
            alt={mood.label}
            className="w-11 h-11 select-none object-contain"
            draggable={false}
          />
        </motion.div>

        {/* Label inside button - morphs up from bottom (State 4) */}
        <AnimatePresence>
          {showLabelInside && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ 
                y: "100%", 
                opacity: 0,
                scale: 0.8,
                filter: "blur(4px)",
              }}
              animate={{ 
                y: 0, 
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
              }}
              exit={{ 
                y: "100%", 
                opacity: 0,
                scale: 0.8,
                filter: "blur(4px)",
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                mass: 0.9,
              }}
            >
              <motion.span
                className="font-display font-bold text-white text-sm tracking-tight text-center px-2"
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.15)" }}
              >
                {mood.label.split("").map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: i * 0.02,
                      duration: 0.3,
                      ease: [0.23, 1, 0.32, 1],
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* External label - visible when not active (State 1) */}
      <motion.span
        className="mt-2.5 font-medium text-xs sm:text-sm tracking-tight text-center text-muted-foreground"
        animate={{
          opacity: showLabelInside ? 0 : 1,
          y: showLabelInside ? -8 : 0,
          scale: showLabelInside ? 0.9 : 1,
        }}
        transition={{
          duration: 0.25,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        {mood.label}
      </motion.span>
    </motion.button>
  );
};

export default MoodSelector;
