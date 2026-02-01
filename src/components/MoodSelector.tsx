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
  { id: "happy", label: "Happy", icon: happySvg, color: "hsl(14, 89%, 55%)" },
  { id: "sad", label: "Sad", icon: sadSvg, color: "hsl(210, 70%, 55%)" },
  { id: "romantic", label: "Romantic", icon: romanticSvg, color: "hsl(340, 75%, 55%)" },
  { id: "excited", label: "Excited", icon: excitedSvg, color: "hsl(45, 90%, 50%)" },
  { id: "chill", label: "Chill", icon: chillSvg, color: "hsl(180, 60%, 45%)" },
  { id: "adventurous", label: "Adventurous", icon: adventurousSvg, color: "hsl(25, 85%, 55%)" },
  { id: "nostalgic", label: "Nostalgic", icon: nostalgicSvg, color: "hsl(280, 50%, 55%)" },
  { id: "thrilled", label: "Thrilled", icon: thrilledSvg, color: "hsl(0, 80%, 55%)" },
  { id: "stressed", label: "Stressed", icon: stressedSvg, color: "hsl(0, 0%, 45%)" },
  { id: "motivated", label: "Motivated", icon: motivatedSvg, color: "hsl(120, 60%, 45%)" },
  { id: "bored", label: "Bored", icon: boredSvg, color: "hsl(200, 20%, 50%)" },
  { id: "inspired", label: "Inspired", icon: inspiredSvg, color: "hsl(50, 85%, 50%)" },
];

// Animation states: 0 = solid blob + label, 1 = label morphing up, 2 = outline only
type AnimationState = 0 | 1 | 2;

const MoodSelector = ({ selectedMood, onSelectMood }: MoodSelectorProps) => {
  const [activeStates, setActiveStates] = useState<Record<string, AnimationState>>({});
  const isMobile = useIsMobile();

  const handleMoodClick = useCallback(
    (moodId: string) => {
      const currentState = activeStates[moodId] || 0;
      
      // Cycle through states: 0 -> 1 -> 2 -> 0
      const nextState = ((currentState + 1) % 3) as AnimationState;
      
      setActiveStates(prev => ({
        ...prev,
        [moodId]: nextState
      }));

      // Select mood when reaching state 2 (outline)
      if (nextState === 2) {
        onSelectMood(moodId);
        trackMoodSelection(moodId);
      }
    },
    [activeStates, onSelectMood]
  );

  const MoodButton = ({ mood, index }: { mood: typeof moods[0]; index: number }) => {
    const animState = activeStates[mood.id] || 0;
    const isSelected = selectedMood === mood.id;
    
    // Button dimensions
    const buttonWidth = isMobile ? 100 : 120;
    const buttonHeight = isMobile ? 72 : 84;
    const borderRadius = 20;

    // State-based values
    const isState0 = animState === 0; // Solid blob + label below
    const isState1 = animState === 1; // Label morphing up
    const isState2 = animState === 2; // Outline only with label inside

    return (
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: index * 0.025,
          duration: 0.4,
          ease: [0.23, 1, 0.32, 1],
        }}
        onClick={() => handleMoodClick(mood.id)}
        className="relative flex flex-col items-center cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        style={{ 
          borderRadius: `${borderRadius}px`,
        }}
      >
        {/* Main button container */}
        <motion.div
          className="relative flex items-center justify-center overflow-hidden"
          style={{
            width: buttonWidth,
            height: buttonHeight,
            borderRadius: `${borderRadius}px`,
          }}
          animate={{
            scale: isState1 ? 1.02 : 1,
          }}
          transition={{
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          {/* State 1: Solid blob background */}
          <motion.div
            className="absolute inset-0"
            style={{
              borderRadius: `${borderRadius}px`,
              backgroundColor: mood.color,
            }}
            animate={{
              opacity: isState2 ? 0 : 1,
              scale: isState1 ? 1.05 : 1,
            }}
            transition={{
              duration: 0.8,
              ease: [0.4, 0, 0.2, 1],
            }}
          />

          {/* State 3: Outline border */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: `${borderRadius}px`,
              border: `3px solid ${mood.color}`,
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: isState2 ? 1 : 0,
              scale: isState2 ? 1 : 0.95,
            }}
            transition={{
              duration: 0.8,
              ease: [0.4, 0, 0.2, 1],
              delay: isState2 ? 0.2 : 0,
            }}
          />

          {/* Icon - visible in states 0 and 1 */}
          <motion.div
            className="relative z-10 flex items-center justify-center"
            animate={{
              opacity: isState2 ? 0 : 1,
              scale: isState1 ? 0.85 : 1,
              y: isState1 ? -8 : 0,
            }}
            transition={{
              duration: 0.8,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <img
              src={mood.icon}
              alt={mood.label}
              className="select-none object-contain"
              style={{
                width: isMobile ? 32 : 40,
                height: isMobile ? 32 : 40,
                filter: "brightness(0) invert(1)",
              }}
              draggable={false}
            />
          </motion.div>

          {/* Label inside button - State 2 */}
          <AnimatePresence>
            {isState2 && (
              <motion.span
                initial={{ opacity: 0, y: 30, scale: 0.7 }}
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
                  duration: 0.8,
                  ease: [0.4, 0, 0.2, 1],
                  delay: 0.15,
                }}
                className="absolute inset-0 flex items-center justify-center font-bold text-sm tracking-tight"
                style={{ color: mood.color }}
              >
                {mood.label}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Morphing label overlay - State 1 transition */}
          <AnimatePresence>
            {isState1 && (
              <motion.div
                className="absolute inset-0 flex items-end justify-center pb-2 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.span
                  initial={{ y: 40, scaleY: 1, opacity: 0.8 }}
                  animate={{ 
                    y: -20, 
                    scaleY: 2.5,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.8,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className="font-bold text-xs text-white/80 tracking-wider"
                  style={{
                    transformOrigin: "bottom center",
                  }}
                >
                  {mood.label}
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selection glow ring */}
          <AnimatePresence>
            {isSelected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 25 
                }}
                className="absolute inset-0 ring-2 ring-offset-2 ring-offset-background pointer-events-none"
                style={{ 
                  borderRadius: `${borderRadius}px`,
                  boxShadow: `0 0 20px ${mood.color}40`,
                  borderColor: mood.color,
                }}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* External label - visible in State 0 */}
        <motion.span
          className="mt-2.5 font-semibold text-xs sm:text-sm tracking-tight text-center"
          style={{ color: isState0 ? "hsl(var(--foreground))" : mood.color }}
          animate={{
            opacity: isState0 ? 1 : 0,
            y: isState0 ? 0 : -15,
            scale: isState0 ? 1 : 0.8,
          }}
          transition={{
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1],
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
