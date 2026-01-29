import { useState } from "react";
import { motion } from "framer-motion";
import { trackMoodSelection } from "@/lib/analytics";

interface MoodSelectorProps {
  selectedMood: string | null;
  onSelectMood: (mood: string) => void;
}

const moods = [
  { id: "happy", label: "Happy", emoji: "😊", bg: "bg-amber-400", shadow: "shadow-amber-500/40" },
  { id: "sad", label: "Sad", emoji: "😢", bg: "bg-blue-400", shadow: "shadow-blue-500/40" },
  { id: "romantic", label: "Romantic", emoji: "🥰", bg: "bg-pink-400", shadow: "shadow-pink-500/40" },
  { id: "excited", label: "Excited", emoji: "🤩", bg: "bg-orange-400", shadow: "shadow-orange-500/40" },
  { id: "chill", label: "Chill", emoji: "😌", bg: "bg-cyan-400", shadow: "shadow-cyan-500/40" },
  { id: "adventurous", label: "Adventurous", emoji: "🤠", bg: "bg-emerald-400", shadow: "shadow-emerald-500/40" },
  { id: "nostalgic", label: "Nostalgic", emoji: "🥹", bg: "bg-purple-400", shadow: "shadow-purple-500/40" },
  { id: "thrilled", label: "Thrilled", emoji: "😱", bg: "bg-red-400", shadow: "shadow-red-500/40" },
  { id: "stressed", label: "Stressed", emoji: "😤", bg: "bg-slate-400", shadow: "shadow-slate-500/40" },
  { id: "motivated", label: "Motivated", emoji: "💪", bg: "bg-lime-400", shadow: "shadow-lime-500/40" },
  { id: "bored", label: "Bored", emoji: "😑", bg: "bg-zinc-400", shadow: "shadow-zinc-500/40" },
  { id: "inspired", label: "Inspired", emoji: "✨", bg: "bg-indigo-400", shadow: "shadow-indigo-500/40" },
];

const MoodSelector = ({ selectedMood, onSelectMood }: MoodSelectorProps) => {
  const [hoveredMood, setHoveredMood] = useState<string | null>(null);

  const handleMoodClick = (moodId: string) => {
    onSelectMood(moodId);
    trackMoodSelection(moodId);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Grid: 2 cols mobile, 3 cols tablet, 4 cols desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
        {moods.map((mood, index) => {
          const isSelected = selectedMood === mood.id;
          const isHovered = hoveredMood === mood.id;

          return (
            <motion.button
              key={mood.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.3, ease: "easeOut" }}
              onClick={() => handleMoodClick(mood.id)}
              onMouseEnter={() => setHoveredMood(mood.id)}
              onMouseLeave={() => setHoveredMood(null)}
              className={`
                relative group
                ${mood.bg}
                rounded-2xl md:rounded-3xl
                py-4 px-3 md:py-5 md:px-4 lg:py-6 lg:px-5
                shadow-lg ${mood.shadow}
                transition-all duration-200 ease-out
                ${isSelected ? "ring-2 ring-white ring-offset-2 ring-offset-background scale-[0.98]" : ""}
                hover:scale-[1.03] active:scale-[0.97]
                cursor-pointer
                overflow-visible
                min-h-[80px] md:min-h-[100px] lg:min-h-[110px]
              `}
              style={{ willChange: "transform" }}
            >
              {/* Floating Emoji with offset effect */}
              <motion.div
                className="absolute -top-3 -right-2 md:-top-4 md:-right-3 z-10"
                animate={{
                  y: isHovered || isSelected ? -4 : 0,
                  rotate: isHovered || isSelected ? [0, -8, 8, -4, 0] : 0,
                  scale: isHovered || isSelected ? 1.15 : 1,
                }}
                transition={{
                  y: { duration: 0.2 },
                  rotate: { duration: 0.5, ease: "easeInOut" },
                  scale: { duration: 0.2 },
                }}
              >
                <div
                  className={`
                    text-3xl md:text-4xl lg:text-5xl
                    drop-shadow-lg
                    select-none
                  `}
                  style={{
                    filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.25))",
                  }}
                >
                  {mood.emoji}
                </div>
              </motion.div>

              {/* Label */}
              <div className="flex items-end h-full pt-4 md:pt-5">
                <motion.span
                  className="font-display font-bold text-white text-sm md:text-base lg:text-lg drop-shadow-sm"
                  animate={{
                    scale: isHovered || isSelected ? 1.02 : 1,
                  }}
                  transition={{ duration: 0.15 }}
                >
                  {mood.label}
                </motion.span>
              </div>

              {/* Subtle shine effect on hover */}
              <motion.div
                className="absolute inset-0 rounded-2xl md:rounded-3xl pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: isHovered ? 1 : 0,
                }}
                transition={{ duration: 0.2 }}
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, transparent 100%)",
                }}
              />

              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute bottom-2 right-2 w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/90 flex items-center justify-center shadow-md"
                >
                  <svg
                    className="w-3 h-3 md:w-4 md:h-4 text-gray-800"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default MoodSelector;