import { motion } from "framer-motion";
import { FloatingShapes, statsShapes } from "./FloatingShapes";

interface MoodTraitsSlideProps {
  traits: string[];
  mood: string;
  onContinue: () => void;
}

export const MoodTraitsSlide = ({ traits, mood, onContinue }: MoodTraitsSlideProps) => {
  const moodLabels: Record<string, { label: string; color: string }> = {
    happy: { label: "Joyful", color: "hsl(48 96% 53%)" },
    sad: { label: "Reflective", color: "hsl(220 70% 60%)" },
    excited: { label: "Energetic", color: "hsl(350 80% 60%)" },
    relaxed: { label: "Calm", color: "hsl(160 60% 50%)" },
    romantic: { label: "Dreamy", color: "hsl(330 70% 65%)" },
    bored: { label: "Curious", color: "hsl(270 60% 60%)" },
    dark: { label: "Intense", color: "hsl(0 0% 30%)" },
    nostalgic: { label: "Nostalgic", color: "hsl(30 70% 55%)" },
  };

  const moodInfo = moodLabels[mood] || { label: "Unique", color: "hsl(var(--primary))" };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      className="min-h-screen bg-muted relative flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Floating shapes */}
      <FloatingShapes shapes={statsShapes} />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-start px-8 sm:px-12 max-w-lg w-full">
        {/* Section label */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-sm text-muted-foreground uppercase tracking-[0.2em] mb-6"
        >
          Your Mood Vibe
        </motion.p>

        {/* Large mood label */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <span
            className="font-display text-6xl sm:text-7xl md:text-8xl font-black"
            style={{ color: moodInfo.color }}
          >
            {moodInfo.label}
          </span>
        </motion.div>

        {/* Traits heading */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative inline-block mb-6"
        >
          <span className="relative z-10 font-display text-xl sm:text-2xl font-bold text-background px-3 py-1">
            Your traits
          </span>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.7, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 bg-foreground origin-left"
          />
        </motion.div>

        {/* Traits list - stacked like Spotify */}
        <div className="space-y-2 w-full">
          {traits.map((trait, index) => (
            <motion.div
              key={trait}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
              className="flex items-center gap-4"
            >
              <span className="text-2xl sm:text-3xl font-black text-foreground/30 w-8">
                {index + 1}
              </span>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="relative inline-block origin-left"
              >
                <span className="relative z-10 font-display text-xl sm:text-2xl font-bold text-background px-3 py-1">
                  {trait}
                </span>
                <div className="absolute inset-0 bg-foreground" />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Continue button */}
      <motion.button
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.5 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onContinue}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 px-8 py-3.5 rounded-full bg-foreground text-background font-semibold text-sm shadow-lg hover:shadow-xl transition-shadow"
      >
        View Your Movies
      </motion.button>
    </motion.div>
  );
};
