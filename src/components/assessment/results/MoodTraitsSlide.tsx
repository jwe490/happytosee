import { motion } from "framer-motion";
import { FloatingShapes, statsShapes } from "./FloatingShapes";

interface MoodTraitsSlideProps {
  traits: string[];
  mood: string;
  onContinue: () => void;
}

export const MoodTraitsSlide = ({ traits, mood, onContinue }: MoodTraitsSlideProps) => {
  // Spotify-style mood labels with vibrant colors
  const moodConfig: Record<string, { label: string; color: string }> = {
    happy: { label: "Joyful", color: "#FF6B4A" },      // Coral
    sad: { label: "Reflective", color: "#B8A4E8" },    // Lavender
    excited: { label: "Energetic", color: "#FF6B4A" }, // Coral
    relaxed: { label: "Calm", color: "#7DD3C0" },      // Teal-ish
    romantic: { label: "Dreamy", color: "#E8A4C8" },   // Pink
    bored: { label: "Curious", color: "#B8A4E8" },     // Lavender
    dark: { label: "Intense", color: "#2B2B2B" },      // Dark
    nostalgic: { label: "Nostalgic", color: "#D4A574" }, // Warm brown
  };

  const moodInfo = moodConfig[mood] || { label: "Unique", color: "#FF6B4A" };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      className="min-h-screen relative flex flex-col overflow-hidden"
      style={{ backgroundColor: "#F5F5F0" }}
    >
      {/* Background shapes */}
      <FloatingShapes shapes={statsShapes} variant="light" />

      {/* Main content - left aligned like Spotify */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 max-w-2xl">
        
        {/* Section label */}
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-xs font-semibold uppercase tracking-[0.25em] mb-4"
          style={{ color: "rgba(43, 43, 43, 0.5)" }}
        >
          Your Mood Vibe
        </motion.p>

        {/* HUGE mood label - the hero */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            delay: 0.3, 
            duration: 0.8, 
            ease: [0.22, 1, 0.36, 1] 
          }}
          className="mb-12"
        >
          <h1
            className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black leading-[0.85] tracking-tight"
            style={{ color: moodInfo.color }}
          >
            {moodInfo.label}
          </h1>
        </motion.div>

        {/* Traits heading with animated highlight */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="relative inline-flex items-center mb-6"
        >
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.7, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 origin-left"
            style={{ backgroundColor: "#2B2B2B" }}
          />
          <span 
            className="relative z-10 px-4 py-2 font-display text-lg sm:text-xl font-bold"
            style={{ color: "#F5F5F0" }}
          >
            Your top traits
          </span>
        </motion.div>

        {/* Traits list - numbered like Spotify rankings */}
        <div className="space-y-3">
          {traits.map((trait, index) => (
            <motion.div
              key={trait}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: 0.8 + index * 0.12, 
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="flex items-center gap-5"
            >
              {/* Rank number */}
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: 0.9 + index * 0.12, 
                  type: "spring",
                  stiffness: 300,
                  damping: 15
                }}
                className="text-3xl sm:text-4xl font-black w-10 text-right"
                style={{ color: "rgba(43, 43, 43, 0.2)" }}
              >
                {index + 1}
              </motion.span>
              
              {/* Trait with background highlight */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ 
                  delay: 0.95 + index * 0.12, 
                  duration: 0.4, 
                  ease: [0.22, 1, 0.36, 1] 
                }}
                className="relative origin-left"
              >
                <span
                  className="absolute inset-0"
                  style={{ backgroundColor: "#2B2B2B" }}
                />
                <span 
                  className="relative z-10 px-4 py-2 font-display text-xl sm:text-2xl font-bold inline-block"
                  style={{ color: "#F5F5F0" }}
                >
                  {trait}
                </span>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Continue button */}
      <motion.button
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onContinue}
        className="fixed bottom-12 sm:bottom-16 left-1/2 -translate-x-1/2 z-20 px-10 py-4 rounded-full font-bold text-base shadow-xl transition-all duration-300"
        style={{ 
          backgroundColor: "#2B2B2B",
          color: "#F5F5F0",
        }}
      >
        View Your Movies
      </motion.button>
    </motion.div>
  );
};
