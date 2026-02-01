import { useState, useCallback, useEffect } from "react";
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

// Animation State: 1 = Initial, 2 = Clearing, 3 = Border + Text Rising, 4 = Final
type AnimationState = 1 | 2 | 3 | 4;

const moods = [
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

// Timing constants (in ms)
const STATE_TIMINGS = {
  state1to2: 250,
  state2to3: 200,
  state3to4: 100,
  reverseMultiplier: 0.8,
};

const BORDER_COLOR = "#2D3436";

const MoodSelector = ({ selectedMood, onSelectMood }: MoodSelectorProps) => {
  const isMobile = useIsMobile();

  const handleMoodSelect = useCallback(
    (moodId: string) => {
      onSelectMood(moodId);
      trackMoodSelection(moodId);
    },
    [onSelectMood]
  );

  return (
    <div id="mood-selector" className="w-full max-w-5xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 justify-items-center">
        {moods.map((mood, index) => (
          <MoodButton
            key={mood.id}
            mood={mood}
            index={index}
            isSelected={selectedMood === mood.id}
            onSelect={handleMoodSelect}
            isMobile={isMobile}
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
  onSelect: (id: string) => void;
  isMobile: boolean;
}

const MoodButton = ({ mood, index, isSelected, onSelect, isMobile }: MoodButtonProps) => {
  const [animState, setAnimState] = useState<AnimationState>(1);
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Button dimensions
  const buttonWidth = isMobile ? 140 : 180;
  const buttonHeight = isMobile ? 100 : 120;
  const borderRadius = 24;
  const iconSize = isMobile ? 40 : 52;

  // Progress through states on hover
  useEffect(() => {
    if (isHovered && !isAnimating) {
      setIsAnimating(true);
      
      // State 1 → 2
      const timer1 = setTimeout(() => {
        setAnimState(2);
      }, 50);

      // State 2 → 3
      const timer2 = setTimeout(() => {
        setAnimState(3);
      }, STATE_TIMINGS.state1to2 + 50);

      // State 3 → 4
      const timer3 = setTimeout(() => {
        setAnimState(4);
        setIsAnimating(false);
      }, STATE_TIMINGS.state1to2 + STATE_TIMINGS.state2to3 + 50);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else if (!isHovered && animState !== 1) {
      setIsAnimating(true);
      
      // Reverse: 4 → 3
      const timer1 = setTimeout(() => {
        setAnimState(3);
      }, 50);

      // Reverse: 3 → 2
      const timer2 = setTimeout(() => {
        setAnimState(2);
      }, STATE_TIMINGS.state3to4 * STATE_TIMINGS.reverseMultiplier + 50);

      // Reverse: 2 → 1
      const timer3 = setTimeout(() => {
        setAnimState(1);
        setIsAnimating(false);
      }, (STATE_TIMINGS.state2to3 + STATE_TIMINGS.state3to4) * STATE_TIMINGS.reverseMultiplier + 50);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isHovered, animState, isAnimating]);

  const handleClick = () => {
    onSelect(mood.id);
  };

  // Split label into characters for stagger animation
  const characters = mood.label.split("");

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.05,
        duration: 0.4,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setTimeout(() => setIsHovered(false), 800)}
      className="relative flex flex-col items-center cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
      style={{ width: buttonWidth }}
    >
      {/* Main Button Container */}
      <motion.div
        className="relative overflow-hidden"
        style={{
          width: buttonWidth,
          height: buttonHeight,
          borderRadius,
          backgroundColor: mood.color,
        }}
        animate={{
          scale: animState === 4 ? 1.05 : animState === 3 ? 1.02 : 1,
          boxShadow: isHovered 
            ? "0 16px 40px rgba(0, 0, 0, 0.18)" 
            : "0 8px 24px rgba(0, 0, 0, 0.12)",
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
        }}
      >
        {/* Border - Visible in State 3 and 4 */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius,
            border: `4px solid ${BORDER_COLOR}`,
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: animState >= 3 ? 1 : 0,
          }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        />

        {/* Icon/Emoji - Visible in State 1, fades in State 2 */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            opacity: animState === 1 ? 1 : 0,
            scale: animState === 1 ? 1 : 0.85,
            y: animState === 1 ? 0 : -30,
          }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <img
            src={mood.icon}
            alt={mood.label}
            className="select-none object-contain"
            style={{ width: iconSize, height: iconSize }}
            draggable={false}
          />
        </motion.div>

        {/* Morphing Text - Animates up from below in State 3→4 */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <AnimatePresence>
            {animState >= 3 && (
              <motion.div
                className="flex items-center justify-center"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ 
                  y: animState === 4 ? "0%" : "60%", 
                  opacity: animState === 4 ? 1 : 0.3,
                }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{
                  duration: 0.6,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
              >
                <div className="flex">
                  {characters.map((char, charIndex) => (
                    <motion.span
                      key={charIndex}
                      className="font-extrabold text-white"
                      style={{
                        fontSize: isMobile ? 20 : 26,
                        textShadow: "0 2px 12px rgba(0, 0, 0, 0.25)",
                        display: "inline-block",
                      }}
                      initial={{ 
                        y: 40, 
                        opacity: 0,
                        filter: "blur(8px)",
                      }}
                      animate={animState === 4 ? { 
                        y: 0, 
                        opacity: 1,
                        filter: "blur(0px)",
                      } : {
                        y: 40,
                        opacity: 0,
                        filter: "blur(8px)",
                      }}
                      transition={{
                        duration: 0.5,
                        delay: charIndex * 0.035,
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
        style={{ fontSize: isMobile ? 16 : 20 }}
        animate={{
          opacity: animState <= 2 ? 1 : 0,
          y: animState <= 2 ? 0 : -20,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {mood.label}
      </motion.span>
    </motion.button>
  );
};

export default MoodSelector;
