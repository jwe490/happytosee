import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trackMoodSelection } from "@/lib/analytics";

interface MoodSelectorProps {
  selectedMood: string | null;
  onSelectMood: (mood: string) => void;
}

const moods = [
  { id: "happy", label: "Happy", gradient: "from-amber-400 to-yellow-500" },
  { id: "sad", label: "Sad", gradient: "from-blue-400 to-blue-600" },
  { id: "romantic", label: "Romantic", gradient: "from-pink-400 to-rose-500" },
  { id: "excited", label: "Excited", gradient: "from-orange-400 to-red-500" },
  { id: "chill", label: "Chill", gradient: "from-cyan-400 to-teal-500" },
  { id: "adventurous", label: "Adventurous", gradient: "from-emerald-400 to-green-600" },
  { id: "nostalgic", label: "Nostalgic", gradient: "from-purple-400 to-violet-600" },
  { id: "thrilled", label: "Thrilled", gradient: "from-red-400 to-pink-600" },
  { id: "stressed", label: "Stressed", gradient: "from-slate-400 to-gray-600" },
  { id: "motivated", label: "Motivated", gradient: "from-lime-400 to-green-500" },
  { id: "bored", label: "Bored", gradient: "from-zinc-400 to-neutral-500" },
  { id: "inspired", label: "Inspired", gradient: "from-indigo-400 to-purple-600" },
];

const MoodSelector = ({ selectedMood, onSelectMood }: MoodSelectorProps) => {
  const [animatingMood, setAnimatingMood] = useState<string | null>(null);

  const handleMoodClick = (moodId: string) => {
    setAnimatingMood(moodId);
    
    // Small delay to show animation before selection
    setTimeout(() => {
      onSelectMood(moodId);
      trackMoodSelection(moodId);
    }, 300);
    
    // Reset animation state
    setTimeout(() => {
      setAnimatingMood(null);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
          How are you feeling{" "}
          <span className="bg-gradient-to-r from-pink-500 via-amber-500 to-emerald-500 bg-clip-text text-transparent">
            today?
          </span>
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Pick your mood and we'll find the perfect movie for you
        </p>
      </div>

      {/* Mood Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 md:gap-4 max-w-2xl mx-auto">
        {moods.map((mood, index) => {
          const isSelected = selectedMood === mood.id;
          const isAnimating = animatingMood === mood.id;

          return (
            <motion.button
              key={mood.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleMoodClick(mood.id)}
              className={`
                relative overflow-hidden rounded-full py-3 px-4 md:py-4 md:px-6
                bg-gradient-to-r ${mood.gradient}
                shadow-md hover:shadow-lg transition-shadow duration-200
                ${isSelected ? "ring-2 ring-white ring-offset-2 ring-offset-background" : ""}
              `}
            >
              {/* Shimmer effect on click */}
              <AnimatePresence>
                {isAnimating && (
                  <motion.div
                    initial={{ x: "-100%", opacity: 0.7 }}
                    animate={{ x: "200%", opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  />
                )}
              </AnimatePresence>

              {/* Burst particles on click */}
              <AnimatePresence>
                {isAnimating && (
                  <>
                    {[...Array(6)].map((_, i) => (
                      <motion.span
                        key={i}
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{
                          scale: 1,
                          opacity: 0,
                          x: (Math.random() - 0.5) * 60,
                          y: (Math.random() - 0.5) * 60,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.03 }}
                        className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full bg-white"
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>

              {/* Label */}
              <motion.span
                className="relative z-10 font-semibold text-white text-sm md:text-base drop-shadow-sm"
                animate={isAnimating ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {mood.label}
              </motion.span>

              {/* Selected checkmark */}
              <AnimatePresence>
                {isSelected && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white/90 flex items-center justify-center"
                  >
                    <svg className="w-2.5 h-2.5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.span>
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
