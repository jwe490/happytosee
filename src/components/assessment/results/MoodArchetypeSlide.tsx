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
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#F5F5F0" }}
    >
      {/* Background shapes */}
      <FloatingShapes shapes={archetypeShapes} variant="light" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-lg">
        
        {/* "You are" label with fade in */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-sm font-semibold uppercase tracking-[0.25em] mb-8"
          style={{ color: "rgba(43, 43, 43, 0.5)" }}
        >
          You are
        </motion.p>

        {/* Large icon in coral circle */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            delay: 0.4, 
            duration: 0.7, 
            type: "spring",
            stiffness: 200,
            damping: 15
          }}
          className="relative mb-8"
        >
          {/* Coral circle background */}
          <div 
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center shadow-2xl"
            style={{ backgroundColor: "#FF6B4A" }}
          >
            <span className="text-6xl sm:text-7xl">{archetype.icon}</span>
          </div>
          
          {/* Ring accent */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="absolute -inset-3 rounded-full border-2"
            style={{ borderColor: "rgba(255, 107, 74, 0.3)" }}
          />
        </motion.div>

        {/* Archetype name with reveal animation */}
        <div className="relative mb-6 overflow-hidden">
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            transition={{ 
              delay: 0.6, 
              duration: 0.7, 
              ease: [0.22, 1, 0.36, 1] 
            }}
          >
            <h2 
              className="font-display text-4xl sm:text-5xl md:text-6xl font-black tracking-tight"
              style={{ color: "#2B2B2B" }}
            >
              {archetype.name}
            </h2>
          </motion.div>
          
          {/* Animated underline */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="h-1 mt-2 origin-center mx-auto"
            style={{ 
              backgroundColor: "#B8A4E8",
              width: "60%",
            }}
          />
        </div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="text-base sm:text-lg leading-relaxed max-w-sm font-medium"
          style={{ color: "rgba(43, 43, 43, 0.7)" }}
        >
          {archetype.description}
        </motion.p>
      </div>

      {/* Continue button */}
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
        See Your Traits
      </motion.button>
    </motion.div>
  );
};
