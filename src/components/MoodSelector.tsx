import { useState, useCallback, useEffect, useRef, memo } from "react";
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

// Animation states: 1=Initial, 2=Clearing, 3=Border+TextRising, 4=Final
type AnimState = 1 | 2 | 3 | 4;

interface MoodData {
  id: string;
  label: string;
  icon: string;
  color: string;
}

const moods: MoodData[] = [
  { id: "happy", label: "Happy", icon: happySvg, color: "#FFD93D" },
  { id: "sad", label: "Sad", icon: sadSvg, color: "#6C9BCF" },
  { id: "romantic", label: "Romantic", icon: romanticSvg, color: "#FF6BCF" },
  { id: "excited", label: "Excited", icon: excitedSvg, color: "#FF6B52" },
  { id: "chill", label: "Chill", icon: chillSvg, color: "#95E1D3" },
  { id: "adventurous", label: "Adventurous", icon: adventurousSvg, color: "#F4A259" },
  { id: "nostalgic", label: "Nostalgic", icon: nostalgicSvg, color: "#AA96DA" },
  { id: "thrilled", label: "Thrilled", icon: thrilledSvg, color: "#EF476F" },
  { id: "stressed", label: "Stressed", icon: stressedSvg, color: "#C8B6A6" },
  { id: "motivated", label: "Motivated", icon: motivatedSvg, color: "#06D6A0" },
  { id: "bored", label: "Bored", icon: boredSvg, color: "#7FB3D5" },
  { id: "inspired", label: "Inspired", icon: inspiredSvg, color: "#B8B8D1" },
];

// Constants
const BORDER_COLOR = "#2D3436";
const CHAR_STAGGER_DELAY = 0.025; // 25ms between each character

const MoodSelector = ({ selectedMood, onSelectMood }: MoodSelectorProps) => {
  const isMobile = useIsMobile();

  const handleSelect = useCallback(
    (moodId: string) => {
      onSelectMood(moodId);
      trackMoodSelection(moodId);
    },
    [onSelectMood]
  );

  return (
    <div id="mood-selector" className="w-full max-w-5xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8 justify-items-center">
        {moods.map((mood, index) => (
          <MoodButton
            key={mood.id}
            mood={mood}
            index={index}
            isSelected={selectedMood === mood.id}
            onSelect={handleSelect}
            isMobile={isMobile}
          />
        ))}
      </div>
    </div>
  );
};

interface MoodButtonProps {
  mood: MoodData;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  isMobile: boolean;
}

const MoodButton = memo(({ mood, index, isSelected, onSelect, isMobile }: MoodButtonProps) => {
  const [animState, setAnimState] = useState<AnimState>(1);
  const [isHovered, setIsHovered] = useState(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Clear all timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  // Handle animation state progression
  useEffect(() => {
    // Clear existing timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    if (isHovered || isSelected) {
      // Forward animation: 1 → 2 → 3 → 4
      if (animState === 1) {
        const t1 = setTimeout(() => setAnimState(2), 50);
        timeoutsRef.current.push(t1);
      } else if (animState === 2) {
        const t2 = setTimeout(() => setAnimState(3), 200);
        timeoutsRef.current.push(t2);
      } else if (animState === 3) {
        const t3 = setTimeout(() => setAnimState(4), 150);
        timeoutsRef.current.push(t3);
      }
    } else {
      // Reverse animation: 4 → 3 → 2 → 1
      if (animState === 4) {
        const t1 = setTimeout(() => setAnimState(3), 50);
        timeoutsRef.current.push(t1);
      } else if (animState === 3) {
        const t2 = setTimeout(() => setAnimState(2), 120);
        timeoutsRef.current.push(t2);
      } else if (animState === 2) {
        const t3 = setTimeout(() => setAnimState(1), 160);
        timeoutsRef.current.push(t3);
      }
    }
  }, [isHovered, isSelected, animState]);

  // Dimensions
  const buttonWidth = isMobile ? 140 : 180;
  const buttonHeight = isMobile ? 100 : 130;
  const borderRadius = 28;
  const iconSize = isMobile ? 42 : 54;

  // Split label into characters for stagger animation
  const characters = mood.label.split("");

  const handleClick = () => {
    onSelect(mood.id);
  };

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.04,
        duration: 0.4,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => {
        const t = setTimeout(() => setIsHovered(false), 600);
        timeoutsRef.current.push(t);
      }}
      className="relative flex flex-col items-center cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
      style={{ 
        width: buttonWidth,
        willChange: "transform",
      }}
      aria-label={`Select ${mood.label} mood`}
    >
      {/* Main Button Container */}
      <motion.div
        className="relative overflow-hidden"
        style={{
          width: buttonWidth,
          height: buttonHeight,
          borderRadius,
          backgroundColor: mood.color,
          willChange: "transform, box-shadow",
        }}
        animate={{
          scale: animState === 4 ? 1.05 : animState === 3 ? 1.02 : 1,
          boxShadow: animState >= 3 
            ? "0 16px 40px rgba(0, 0, 0, 0.2)" 
            : "0 8px 24px rgba(0, 0, 0, 0.12)",
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
        }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Border - Visible in State 3 and 4 */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius,
            border: `4px solid ${BORDER_COLOR}`,
          }}
          animate={{
            opacity: animState >= 3 ? 1 : 0,
          }}
          transition={{ duration: 0.15 }}
        />

        {/* Icon - Visible only in State 1 */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            opacity: animState === 1 ? 1 : 0,
            scale: animState === 1 ? 1 : 0.85,
            y: animState === 1 ? 0 : -25,
          }}
          transition={{ 
            duration: 0.25, 
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          <img
            src={mood.icon}
            alt=""
            className="select-none object-contain"
            style={{ width: iconSize, height: iconSize }}
            draggable={false}
          />
        </motion.div>

        {/* Morphing Text Container - Animates from below */}
        <div 
          className="absolute inset-0 flex items-center justify-center overflow-hidden"
          style={{ willChange: "transform" }}
        >
          <AnimatePresence>
            {animState >= 3 && (
              <motion.div
                key="text-container"
                className="flex items-center justify-center"
                initial={{ y: "100%" }}
                animate={{ 
                  y: animState === 4 ? "0%" : "50%",
                }}
                exit={{ y: "100%" }}
                transition={{
                  duration: 0.5,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
              >
                <div className="flex items-center justify-center">
                  {characters.map((char, charIndex) => (
                    <motion.span
                      key={charIndex}
                      className="font-extrabold text-white inline-block"
                      style={{
                        fontSize: isMobile ? 18 : 24,
                        textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                        willChange: "transform, opacity, filter",
                      }}
                      initial={{ 
                        y: 50, 
                        opacity: 0.3,
                        scale: 0.8,
                        filter: "blur(8px)",
                      }}
                      animate={animState === 4 ? { 
                        y: 0, 
                        opacity: 1,
                        scale: 1,
                        filter: "blur(0px)",
                      } : {
                        y: 50,
                        opacity: 0.3,
                        scale: 0.8,
                        filter: "blur(8px)",
                      }}
                      transition={{
                        duration: 0.5,
                        delay: charIndex * CHAR_STAGGER_DELAY,
                        ease: [0.34, 1.56, 0.64, 1],
                      }}
                    >
                      {char === " " ? "\u00A0" : char}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* External Label - Below button, visible in State 1 & 2 */}
      <motion.span
        className="mt-3 font-bold text-foreground text-center"
        style={{ 
          fontSize: isMobile ? 16 : 20,
          willChange: "transform, opacity",
        }}
        animate={{
          opacity: animState <= 2 ? 1 : 0,
          y: animState <= 2 ? 0 : -15,
          scale: animState <= 2 ? 1 : 0.9,
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
});

MoodButton.displayName = "MoodButton";

export default MoodSelector;
