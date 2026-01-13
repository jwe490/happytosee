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
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      className="min-h-screen bg-muted relative flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Floating shapes background */}
      <FloatingShapes shapes={introShapes} />

      {/* Main content - centered */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-foreground leading-tight max-w-md"
        >
          Taste like yours{" "}
          <br className="hidden sm:block" />
          can't be defined.
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-foreground mt-2"
        >
          But let's try anyway.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-muted-foreground mt-8 text-base sm:text-lg"
        >
          Your personalized movie profile awaits.
        </motion.p>
      </div>

      {/* Continue button - bottom */}
      <motion.button
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.5 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onContinue}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 px-8 py-3.5 rounded-full bg-foreground text-background font-semibold text-sm shadow-lg hover:shadow-xl transition-shadow"
      >
        Continue
      </motion.button>
    </motion.div>
  );
};
