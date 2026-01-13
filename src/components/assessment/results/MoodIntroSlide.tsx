import { motion } from "framer-motion";

// Comet/Meteor line illustration
const CometIllustration = () => (
  <svg
    viewBox="0 0 200 180"
    className="w-48 h-44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Comet tail lines */}
    <motion.path
      d="M180 10 L120 70"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    />
    <motion.path
      d="M190 25 L130 85"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    />
    <motion.path
      d="M195 45 L135 95"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    />
    <motion.path
      d="M185 55 L140 100"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.7, delay: 0.35 }}
    />
    
    {/* Comet body - circle with crater details */}
    <motion.circle
      cx="105"
      cy="115"
      r="35"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.6, type: "spring" }}
    />
    
    {/* Crater details */}
    <motion.ellipse
      cx="95"
      cy="105"
      rx="8"
      ry="6"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.9 }}
    />
    <motion.ellipse
      cx="115"
      cy="125"
      rx="6"
      ry="4"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
    />
    <motion.circle
      cx="100"
      cy="128"
      r="4"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.1 }}
    />
    <motion.ellipse
      cx="118"
      cy="108"
      rx="5"
      ry="3"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.05 }}
    />
  </svg>
);

// Gradient text colors matching reference
const moodColors = ["#1a1a1a", "#2d5016", "#8b4513", "#c4a000"];

interface MoodIntroSlideProps {
  onContinue: () => void;
}

export const MoodIntroSlide = ({ onContinue }: MoodIntroSlideProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background flex flex-col items-center justify-between py-16 px-6"
    >
      {/* Comet illustration - top right area */}
      <motion.div
        initial={{ x: 50, y: -30, opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="self-end mr-4 text-foreground"
      >
        <CometIllustration />
      </motion.div>

      {/* Main content - centered */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="font-display text-4xl md:text-5xl font-bold tracking-tight"
        >
          <span className="text-foreground">Your </span>
          {"MOOD".split("").map((letter, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              style={{ color: moodColors[index] }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.h1>
      </div>

      {/* Share button - bottom */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        whileTap={{ scale: 0.97 }}
        onClick={onContinue}
        className="flex items-center gap-3 px-8 py-3.5 rounded-full bg-muted/80 hover:bg-muted transition-colors"
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        <span className="font-medium text-foreground">Continue</span>
      </motion.button>
    </motion.div>
  );
};
