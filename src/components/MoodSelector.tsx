import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trackMoodSelection } from "@/lib/analytics";

interface MoodSelectorProps {
  selectedMood: string | null;
  onSelectMood: (mood: string) => void;
}

// Unique SVG face components for each mood
const MoodFaces = {
  happy: ({ isAnimating }: { isAnimating: boolean }) => (
    <svg viewBox="0 0 100 80" className="w-full h-full">
      {/* Ears */}
      <motion.path
        d="M20 15 Q15 5 25 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        animate={isAnimating ? { rotate: [0, -10, 10, 0] } : {}}
        transition={{ duration: 0.5 }}
      />
      <motion.path
        d="M80 15 Q85 5 75 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        animate={isAnimating ? { rotate: [0, 10, -10, 0] } : {}}
        transition={{ duration: 0.5 }}
      />
      {/* Big smile */}
      <motion.path
        d="M25 50 Q50 80 75 50"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        animate={isAnimating ? { d: ["M25 50 Q50 80 75 50", "M25 45 Q50 90 75 45", "M25 50 Q50 80 75 50"] } : {}}
        transition={{ duration: 0.6 }}
      />
    </svg>
  ),
  
  sad: ({ isAnimating }: { isAnimating: boolean }) => (
    <svg viewBox="0 0 100 80" className="w-full h-full">
      {/* Ears drooping */}
      <motion.path
        d="M20 15 Q10 20 25 25"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        animate={isAnimating ? { y: [0, 5, 0] } : {}}
        transition={{ duration: 0.8 }}
      />
      <motion.path
        d="M80 15 Q90 20 75 25"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        animate={isAnimating ? { y: [0, 5, 0] } : {}}
        transition={{ duration: 0.8 }}
      />
      {/* Sad mouth */}
      <motion.path
        d="M30 60 Q50 40 70 60"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        animate={isAnimating ? { d: ["M30 60 Q50 40 70 60", "M30 65 Q50 35 70 65", "M30 60 Q50 40 70 60"] } : {}}
        transition={{ duration: 0.6 }}
      />
    </svg>
  ),
  
  romantic: ({ isAnimating }: { isAnimating: boolean }) => (
    <svg viewBox="0 0 100 80" className="w-full h-full">
      {/* Heart */}
      <motion.path
        d="M50 70 C20 45 20 20 50 35 C80 20 80 45 50 70"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        animate={isAnimating ? { 
          scale: [1, 1.2, 1, 1.15, 1],
          fill: ["transparent", "currentColor", "transparent"]
        } : {}}
        transition={{ duration: 0.8 }}
        style={{ transformOrigin: "center" }}
      />
      {/* Little hearts floating */}
      {isAnimating && (
        <>
          <motion.circle
            cx="30"
            cy="25"
            r="3"
            fill="currentColor"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], y: -20 }}
            transition={{ duration: 1 }}
          />
          <motion.circle
            cx="70"
            cy="20"
            r="2"
            fill="currentColor"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], y: -15 }}
            transition={{ duration: 1, delay: 0.2 }}
          />
        </>
      )}
    </svg>
  ),
  
  excited: ({ isAnimating }: { isAnimating: boolean }) => (
    <svg viewBox="0 0 100 80" className="w-full h-full">
      {/* Sparkle lines */}
      <motion.g
        animate={isAnimating ? { rotate: [0, 15, -15, 0] } : {}}
        transition={{ duration: 0.4, repeat: isAnimating ? 2 : 0 }}
        style={{ transformOrigin: "center" }}
      >
        <line x1="20" y1="10" x2="15" y2="0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="25" y1="8" x2="30" y2="0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="75" y1="8" x2="70" y2="0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="80" y1="10" x2="85" y2="0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </motion.g>
      {/* Wide eyes */}
      <motion.circle
        cx="35"
        cy="35"
        r="8"
        fill="currentColor"
        animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3, repeat: isAnimating ? 2 : 0 }}
      />
      <motion.circle
        cx="65"
        cy="35"
        r="8"
        fill="currentColor"
        animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3, repeat: isAnimating ? 2 : 0 }}
      />
      {/* Big open smile */}
      <path d="M30 55 Q50 75 70 55" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),
  
  nostalgic: ({ isAnimating }: { isAnimating: boolean }) => (
    <svg viewBox="0 0 100 80" className="w-full h-full">
      {/* Teardrop */}
      <motion.ellipse
        cx="75"
        cy="40"
        rx="4"
        ry="6"
        fill="currentColor"
        opacity="0.6"
        animate={isAnimating ? { 
          cy: [35, 60, 35],
          opacity: [0.6, 0, 0.6]
        } : {}}
        transition={{ duration: 1.2 }}
      />
      {/* Eyes looking up */}
      <ellipse cx="35" cy="35" rx="6" ry="4" fill="currentColor" />
      <ellipse cx="65" cy="35" rx="6" ry="4" fill="currentColor" />
      {/* Gentle smile */}
      <motion.path
        d="M35 55 Q50 65 65 55"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        animate={isAnimating ? { opacity: [1, 0.5, 1] } : {}}
        transition={{ duration: 1.5 }}
      />
    </svg>
  ),
  
  relaxed: ({ isAnimating }: { isAnimating: boolean }) => (
    <svg viewBox="0 0 100 80" className="w-full h-full">
      {/* Closed happy eyes */}
      <motion.path
        d="M25 35 Q35 30 45 35"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        animate={isAnimating ? { d: ["M25 35 Q35 30 45 35", "M25 33 Q35 28 45 33", "M25 35 Q35 30 45 35"] } : {}}
        transition={{ duration: 2, repeat: isAnimating ? 1 : 0 }}
      />
      <motion.path
        d="M55 35 Q65 30 75 35"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        animate={isAnimating ? { d: ["M55 35 Q65 30 75 35", "M55 33 Q65 28 75 33", "M55 35 Q65 30 75 35"] } : {}}
        transition={{ duration: 2, repeat: isAnimating ? 1 : 0 }}
      />
      {/* Peaceful smile */}
      <path d="M35 55 Q50 65 65 55" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  
  bored: ({ isAnimating }: { isAnimating: boolean }) => (
    <svg viewBox="0 0 100 80" className="w-full h-full">
      {/* Half-lidded eyes */}
      <ellipse cx="35" cy="38" rx="8" ry="5" fill="currentColor" />
      <ellipse cx="65" cy="38" rx="8" ry="5" fill="currentColor" />
      <rect x="27" y="30" width="16" height="6" fill="hsl(var(--primary))" />
      <rect x="57" y="30" width="16" height="6" fill="hsl(var(--primary))" />
      {/* Straight mouth */}
      <motion.line
        x1="35"
        y1="58"
        x2="65"
        y2="58"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        animate={isAnimating ? { 
          x1: [35, 33, 35],
          x2: [65, 67, 65]
        } : {}}
        transition={{ duration: 0.8 }}
      />
      {/* ZZZ */}
      {isAnimating && (
        <motion.text
          x="75"
          y="25"
          fontSize="14"
          fontWeight="bold"
          fill="currentColor"
          initial={{ opacity: 0, x: 70 }}
          animate={{ opacity: [0, 1, 0], x: 85, y: 15 }}
          transition={{ duration: 1.5 }}
        >
          z
        </motion.text>
      )}
    </svg>
  ),
};

const moods = [
  { id: "happy", label: "Happy", color: "from-amber-400 to-orange-500" },
  { id: "sad", label: "Sad", color: "from-blue-400 to-indigo-500" },
  { id: "romantic", label: "Romantic", color: "from-pink-400 to-rose-500" },
  { id: "excited", label: "Excited", color: "from-yellow-400 to-amber-500" },
  { id: "nostalgic", label: "Nostalgic", color: "from-purple-400 to-violet-500" },
  { id: "relaxed", label: "Relaxed", color: "from-emerald-400 to-teal-500" },
  { id: "bored", label: "Bored", color: "from-slate-400 to-gray-500" },
];

const MoodSelector = ({ selectedMood, onSelectMood }: MoodSelectorProps) => {
  const [animatingMood, setAnimatingMood] = useState<string | null>(null);
  const [clickedPosition, setClickedPosition] = useState<{ x: number; y: number } | null>(null);

  const handleMoodClick = (moodId: string, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setClickedPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
    
    setAnimatingMood(moodId);
    
    // Delay selection to show animation
    setTimeout(() => {
      onSelectMood(moodId);
      trackMoodSelection(moodId);
    }, 400);
    
    // Reset animation state
    setTimeout(() => {
      setAnimatingMood(null);
      setClickedPosition(null);
    }, 1200);
  };

  const FaceComponent = (moodId: string) => {
    const Face = MoodFaces[moodId as keyof typeof MoodFaces];
    return Face ? <Face isAnimating={animatingMood === moodId} /> : null;
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
          Choose your{" "}
          <span className="bg-gradient-to-r from-pink-500 via-amber-500 to-emerald-500 bg-clip-text text-transparent">
            MOOD
          </span>
        </h2>
      </div>

      {/* Mood Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
        {moods.map((mood, index) => {
          const isSelected = selectedMood === mood.id;
          const isAnimating = animatingMood === mood.id;

          return (
            <motion.button
              key={mood.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => handleMoodClick(mood.id, e)}
              className={`
                relative group aspect-square rounded-3xl overflow-hidden
                bg-gradient-to-br ${mood.color}
                shadow-lg hover:shadow-xl transition-shadow duration-300
                ${isSelected ? "ring-4 ring-foreground/30 ring-offset-2 ring-offset-background" : ""}
              `}
            >
              {/* Ripple effect on click */}
              <AnimatePresence>
                {isAnimating && clickedPosition && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0.5 }}
                    animate={{ scale: 4, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute w-20 h-20 rounded-full bg-white/40"
                    style={{
                      left: clickedPosition.x - 40,
                      top: clickedPosition.y - 40,
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Face illustration */}
              <motion.div
                className="absolute inset-4 text-foreground/90"
                animate={isAnimating ? {
                  scale: [1, 1.1, 1],
                  rotate: [0, -3, 3, 0],
                } : {}}
                transition={{ duration: 0.5 }}
              >
                {FaceComponent(mood.id)}
              </motion.div>

              {/* Sparkle particles on selection */}
              <AnimatePresence>
                {isAnimating && (
                  <>
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ 
                          opacity: 1, 
                          scale: 0,
                          x: "50%",
                          y: "50%"
                        }}
                        animate={{ 
                          opacity: 0,
                          scale: 1,
                          x: `${50 + (Math.random() - 0.5) * 100}%`,
                          y: `${50 + (Math.random() - 0.5) * 100}%`,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                        className="absolute w-2 h-2 rounded-full bg-white"
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>

              {/* Selected checkmark */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-foreground/90 flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Label */}
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/30 to-transparent">
                <motion.span
                  className="font-display font-semibold text-white text-sm md:text-base drop-shadow-md"
                  animate={isAnimating ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {mood.label}
                </motion.span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default MoodSelector;
