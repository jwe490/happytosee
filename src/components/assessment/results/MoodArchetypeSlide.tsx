import { motion } from "framer-motion";
import { FloatingShapes, archetypeShapes } from "./FloatingShapes";

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
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      className="min-h-screen bg-muted relative flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Floating shapes background */}
      <FloatingShapes shapes={archetypeShapes} />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-lg">
        {/* Small label */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-sm text-muted-foreground uppercase tracking-[0.2em] mb-8"
        >
          You are
        </motion.p>

        {/* Archetype name with highlight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative inline-block mb-6"
        >
          <span className="relative z-10 font-display text-4xl sm:text-5xl md:text-6xl font-black text-background px-4 py-2">
            {archetype.name}
          </span>
          {/* Black highlight background */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 bg-foreground origin-left"
          />
        </motion.div>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.9, type: "spring", stiffness: 300, damping: 20 }}
          className="text-5xl mb-6"
        >
          {archetype.icon}
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          className="text-foreground/80 text-base sm:text-lg leading-relaxed max-w-sm"
        >
          {archetype.description}
        </motion.p>
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
        See Your Traits
      </motion.button>
    </motion.div>
  );
};
