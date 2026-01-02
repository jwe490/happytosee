import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const MoodProcessing = () => {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const assessmentId = searchParams.get("assessmentId");

  const phrases = [
    "Analyzing your taste...",
    "Finding your archetype...",
    "Crafting your mood board...",
  ];

  useEffect(() => {
    const phraseInterval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % phrases.length);
    }, 1800);

    const navigationTimeout = setTimeout(() => {
      if (assessmentId) {
        navigate(`/mood/story/${assessmentId}`);
      } else {
        navigate(`/assessment/results/${assessmentId || ''}`);
      }
    }, 5400);

    return () => {
      clearInterval(phraseInterval);
      clearTimeout(navigationTimeout);
    };
  }, [navigate, assessmentId, phrases.length]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-[#3B82F6]/[0.08] to-white" />

      <div className="relative z-10 flex flex-col items-center gap-10">
        <motion.div
          className="w-[280px] h-[280px] rounded-full"
          style={{
            background: 'radial-gradient(circle, #3B82F6, #1E40AF)',
            filter: 'drop-shadow(0 0 60px rgba(59, 130, 246, 0.4))',
          }}
          animate={{
            scale: [0.92, 1.05, 0.92],
            opacity: [0.6, 0.95, 0.6],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <AnimatePresence mode="wait">
          <motion.p
            key={currentPhrase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="text-[22px] font-medium text-[#6B7280]"
          >
            {phrases[currentPhrase]}
          </motion.p>
        </AnimatePresence>

        <motion.div className="flex gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-[#3B82F6] opacity-40"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default MoodProcessing;
