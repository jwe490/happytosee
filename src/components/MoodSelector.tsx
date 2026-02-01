import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trackMoodSelection } from "@/lib/analytics";

// Import the complete button SVGs
import happySvg from "@/assets/mood-happy.svg";
import sadSvg from "@/assets/mood-sad.svg";
import romanticSvg from "@/assets/mood-romantic.svg";
import chillSvg from "@/assets/mood-chill.svg";
import relaxedSvg from "@/assets/mood-relaxed.svg";
import motivatedSvg from "@/assets/mood-motivated.svg";
import boredSvg from "@/assets/mood-bored.svg";
import inspiredSvg from "@/assets/mood-inspired.svg";
import angrySvg from "@/assets/mood-angry.svg";
import anxiousSvg from "@/assets/mood-anxious.svg";
import thrilledSvg from "@/assets/mood-thrilled.svg";
import nostalgicSvg from "@/assets/mood-nostalgic.svg";

interface MoodSelectorProps {
  selectedMood: string | null;
  onSelectMood: (mood: string) => void;
}

const moods = [
  { id: "happy", label: "Happy", icon: happySvg },
  { id: "sad", label: "Sad", icon: sadSvg },
  { id: "romantic", label: "Romantic", icon: romanticSvg },
  { id: "chill", label: "Chill", icon: chillSvg },
  { id: "relaxed", label: "Relaxed", icon: relaxedSvg },
  { id: "motivated", label: "Motivated", icon: motivatedSvg },
  { id: "bored", label: "Bored", icon: boredSvg },
  { id: "inspired", label: "Inspired", icon: inspiredSvg },
  { id: "angry", label: "Angry", icon: angrySvg },
  { id: "anxious", label: "Anxious", icon: anxiousSvg },
  { id: "thrilled", label: "Thrilled", icon: thrilledSvg },
  { id: "nostalgic", label: "Nostalgic", icon: nostalgicSvg },
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
          />
        ))}
      </div>
    </div>
  );
};

interface MoodButtonProps {
  mood: (typeof moods)[0];
  index: number;
  isSelected: boolean;
  isHovered: boolean;
  isPressed: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

const MoodButton = ({
  mood,
  index,
  isSelected,
  isHovered,
  isPressed,
  onSelect,
  onHover,
}: MoodButtonProps) => {
  const isActive = isSelected || isHovered;

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
      className="relative flex flex-col items-center cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {/* Container matching exact SVG viewBox ratio: 384x384 */}
      <motion.div
        className="relative"
        style={{
          // Match exact SVG viewBox proportions
          width: 120,
          height: 120, // Same aspect as viewBox 384x384
        }}
        animate={{
          scale: isPressed ? 0.92 : isHovered ? 1.06 : 1,
          y: isPressed ? 2 : isHovered ? -3 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
          mass: 0.8,
        }}
      >
        {/* State 1: Default - Your actual SVG button (full button with emoji + label) */}
        <motion.img
          src={mood.icon}
          alt={mood.label}
          className="absolute inset-0 w-full h-full select-none"
          draggable={false}
          style={{ objectFit: "contain" }}
          animate={{
            opacity: isActive ? 0 : 1,
            scale: isActive ? 0.92 : 1,
          }}
          transition={{
            duration: 0.2,
            ease: [0.4, 0, 0.2, 1],
          }}
        />

        {/* State 2-4: Hover/Active - Blank blob matching your SVG's exact proportions */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 26,
              }}
            >
              {/* SVG matching your exact viewBox and blob coordinates */}
              <svg
                viewBox="0 0 384 384"
                className="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Orange blob: exact match - x=26, y=51, width=320, height=194, rx=50 */}
                <rect
                  x="26"
                  y="51"
                  width="320"
                  height="194"
                  rx="50"
                  ry="50"
                  fill="#f15e3d"
                />
                {/* Dark border overlay */}
                <motion.rect
                  x="26"
                  y="51"
                  width="320"
                  height="194"
                  rx="50"
                  ry="50"
                  fill="none"
                  stroke="#2D3436"
                  strokeWidth="6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05, duration: 0.15 }}
                />
              </svg>

              {/* Label morphing up into the blob area */}
              <motion.div
                className="absolute left-0 right-0 flex items-center justify-center"
                style={{
                  // Position label inside the blob area (y=51 to y=245 in viewBox)
                  // In 120px height: blob spans from ~16px to ~76px
                  top: "13%",
                  bottom: "36%",
                }}
                initial={{
                  y: 50,
                  opacity: 0,
                  scale: 0.75,
                  filter: "blur(4px)",
                }}
                animate={{
                  y: 0,
                  opacity: 1,
                  scale: 1,
                  filter: "blur(0px)",
                }}
                exit={{
                  y: 50,
                  opacity: 0,
                  scale: 0.75,
                  filter: "blur(4px)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 24,
                  mass: 0.85,
                }}
              >
                <span
                  className="font-display font-bold text-white text-sm sm:text-base tracking-tight text-center"
                  style={{ textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}
                >
                  {mood.label.split("").map((char, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: i * 0.012,
                        duration: 0.2,
                        ease: [0.23, 1, 0.32, 1],
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.button>
  );
};

export default MoodSelector;
