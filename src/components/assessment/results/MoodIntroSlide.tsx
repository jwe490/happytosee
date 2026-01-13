import { motion } from "framer-motion";
import { FloatingShapes, introShapes } from "./FloatingShapes";

interface MoodIntroSlideProps {
  onContinue: () => void;
}

export const MoodIntroSlide = ({ onContinue }: MoodIntroSlideProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#F5F5F0" }} // Cream background
    >
      {/* Animated floating shapes */}
      <FloatingShapes shapes={introShapes} variant="light" />

      {/* Main content container */}
      <div className="relative z-10 flex flex-col items-center justify-center px-8 text-center max-w-xl">
        
        {/* Bold headline - word by word animation */}
        <div className="overflow-hidden mb-4">
          <motion.h1
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
              delay: 0.3, 
              duration: 0.8, 
              ease: [0.22, 1, 0.36, 1] 
            }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight"
            style={{ color: "#2B2B2B" }}
          >
            Taste like yours
          </motion.h1>
        </div>
        
        <div className="overflow-hidden mb-2">
          <motion.h1
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
              delay: 0.45, 
              duration: 0.8, 
              ease: [0.22, 1, 0.36, 1] 
            }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight"
            style={{ color: "#2B2B2B" }}
          >
            can't be{" "}
            <span 
              className="relative inline-block"
              style={{ color: "#FF6B4A" }}
            >
              defined
              {/* Underline accent */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.9, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -bottom-1 left-0 right-0 h-[4px] origin-left"
                style={{ backgroundColor: "#FF6B4A" }}
              />
            </span>
            .
          </motion.h1>
        </div>

        {/* Secondary line */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="font-display text-xl sm:text-2xl md:text-3xl font-bold mt-6"
          style={{ color: "#2B2B2B" }}
        >
          But let's try anyway.
        </motion.p>

        {/* Subtle tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          className="mt-8 text-base sm:text-lg font-medium"
          style={{ color: "rgba(43, 43, 43, 0.6)" }}
        >
          Your cinematic personality awaits.
        </motion.p>
      </div>

      {/* Continue button - large touch target */}
      <motion.button
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onContinue}
        className="absolute bottom-12 sm:bottom-16 left-1/2 -translate-x-1/2 z-10 px-10 py-4 rounded-full font-bold text-base shadow-xl transition-all duration-300"
        style={{ 
          backgroundColor: "#2B2B2B",
          color: "#F5F5F0",
        }}
      >
        Let's go
      </motion.button>

      {/* Decorative bottom wave */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 0.4, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
      >
        <svg
          viewBox="0 0 400 80"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0 40 Q100 10 200 40 T400 40 L400 80 L0 80 Z"
            fill="rgba(43, 43, 43, 0.05)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
};
