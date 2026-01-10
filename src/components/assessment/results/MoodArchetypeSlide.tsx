import { motion } from "framer-motion";

// Film reel illustration
const FilmReelIllustration = () => (
  <svg
    viewBox="0 0 160 160"
    className="w-32 h-32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer circle */}
    <motion.circle
      cx="80"
      cy="80"
      r="70"
      stroke="currentColor"
      strokeWidth="2"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
    />
    
    {/* Inner circle */}
    <motion.circle
      cx="80"
      cy="80"
      r="25"
      stroke="currentColor"
      strokeWidth="2"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    />
    
    {/* Film holes around the edge */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
      const rad = (angle * Math.PI) / 180;
      const x = 80 + 50 * Math.cos(rad);
      const y = 80 + 50 * Math.sin(rad);
      return (
        <motion.rect
          key={angle}
          x={x - 6}
          y={y - 8}
          width="12"
          height="16"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 + i * 0.05, type: "spring" }}
        />
      );
    })}
    
    {/* Center dot */}
    <motion.circle
      cx="80"
      cy="80"
      r="6"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.8, type: "spring" }}
    />
  </svg>
);

interface MoodArchetypeSlideProps {
  archetype: {
    name: string;
    icon: string;
    description: string;
    traits: string[];
  };
  onContinue: () => void;
}

export const MoodArchetypeSlide = ({ archetype, onContinue }: MoodArchetypeSlideProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background flex flex-col items-center justify-between py-16 px-6"
    >
      {/* Illustration - top */}
      <motion.div
        initial={{ rotate: -10, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="text-foreground"
      >
        <FilmReelIllustration />
      </motion.div>

      {/* Main content - centered */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 -mt-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="text-6xl"
        >
          {archetype.icon}
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="font-display text-3xl font-bold text-center text-foreground"
        >
          {archetype.name}
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-muted-foreground text-center max-w-xs leading-relaxed"
        >
          {archetype.description}
        </motion.p>

        {/* Traits */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap justify-center gap-2 mt-2"
        >
          {archetype.traits.slice(0, 3).map((trait, index) => (
            <motion.span
              key={trait}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              className="px-4 py-1.5 rounded-full bg-muted text-sm font-medium text-foreground"
            >
              {trait}
            </motion.span>
          ))}
        </motion.div>
      </div>

      {/* Continue button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        whileTap={{ scale: 0.97 }}
        onClick={onContinue}
        className="flex items-center gap-3 px-8 py-3.5 rounded-full bg-muted/80 hover:bg-muted transition-colors"
      >
        <span className="font-medium text-foreground">See Recommendations</span>
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
