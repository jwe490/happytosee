import { motion } from "framer-motion";

// Brain/Mind illustration
const MindIllustration = () => (
  <svg
    viewBox="0 0 140 140"
    className="w-28 h-28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Brain outline - left hemisphere */}
    <motion.path
      d="M70 20 C45 20 30 35 30 55 C30 65 35 75 35 85 C35 100 45 115 60 118 C65 119 70 120 70 120"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1 }}
    />
    
    {/* Brain outline - right hemisphere */}
    <motion.path
      d="M70 20 C95 20 110 35 110 55 C110 65 105 75 105 85 C105 100 95 115 80 118 C75 119 70 120 70 120"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1, delay: 0.2 }}
    />
    
    {/* Inner curves */}
    <motion.path
      d="M50 50 Q60 60 50 75"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 0.6 }}
    />
    <motion.path
      d="M90 50 Q80 60 90 75"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 0.7 }}
    />
    <motion.path
      d="M55 85 Q70 95 85 85"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 0.8 }}
    />
    
    {/* Sparkle dots */}
    {[
      { x: 45, y: 40 },
      { x: 95, y: 45 },
      { x: 65, y: 65 },
    ].map((dot, i) => (
      <motion.circle
        key={i}
        cx={dot.x}
        cy={dot.y}
        r="2"
        fill="currentColor"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 + i * 0.1, type: "spring" }}
      />
    ))}
  </svg>
);

interface MoodTraitsSlideProps {
  traits: string[];
  mood: string;
  onContinue: () => void;
}

export const MoodTraitsSlide = ({ traits, mood, onContinue }: MoodTraitsSlideProps) => {
  const moodLabels: Record<string, string> = {
    happy: "Joyful",
    sad: "Reflective",
    excited: "Energetic",
    relaxed: "Calm",
    romantic: "Dreamy",
    bored: "Curious"
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background flex flex-col items-center justify-between py-16 px-6"
    >
      {/* Illustration */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-foreground"
      >
        <MindIllustration />
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 -mt-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center space-y-2"
        >
          <p className="text-sm text-muted-foreground uppercase tracking-widest">Your Vibe</p>
          <h2 className="font-display text-3xl font-bold text-foreground">
            {moodLabels[mood] || "Unique"}
          </h2>
        </motion.div>

        {/* Traits list */}
        <div className="space-y-3 w-full max-w-xs">
          {traits.map((trait, index) => (
            <motion.div
              key={trait}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.12 }}
              className="flex items-center gap-3"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7 + index * 0.12, type: "spring" }}
                className="w-2 h-2 rounded-full bg-foreground/40"
              />
              <span className="text-foreground font-medium">{trait}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Continue button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        whileTap={{ scale: 0.97 }}
        onClick={onContinue}
        className="flex items-center gap-3 px-8 py-3.5 rounded-full bg-muted/80 hover:bg-muted transition-colors"
      >
        <span className="font-medium text-foreground">View Movies</span>
        <svg 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </motion.button>
    </motion.div>
  );
};
