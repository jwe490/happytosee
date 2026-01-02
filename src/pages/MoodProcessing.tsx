import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CinemaIllustration, EmotionWheelIllustration, SparklesIllustration, StarsIllustration } from "@/components/assessment/Illustrations";

const MoodProcessing = () => {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const assessmentId = searchParams.get("assessmentId");

  const phrases = [
    { text: "Analyzing your cinematic taste", illustration: <CinemaIllustration className="w-full h-full" />, gradient: "from-blue-500 to-cyan-500" },
    { text: "Discovering your archetype", illustration: <EmotionWheelIllustration className="w-full h-full" />, gradient: "from-amber-500 to-orange-500" },
    { text: "Crafting your mood board", illustration: <StarsIllustration className="w-full h-full" />, gradient: "from-emerald-500 to-teal-500" },
    { text: "Preparing your story", illustration: <SparklesIllustration className="w-full h-full" />, gradient: "from-blue-600 to-cyan-600" },
  ];

  useEffect(() => {
    const phraseInterval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % phrases.length);
    }, 1200);

    const navigationTimeout = setTimeout(() => {
      if (assessmentId) {
        navigate(`/mood/story/${assessmentId}`);
      } else {
        navigate(`/assessment/results/${assessmentId || ''}`);
      }
    }, 5000);

    return () => {
      clearInterval(phraseInterval);
      clearTimeout(navigationTimeout);
    };
  }, [navigate, assessmentId]);

  const currentItem = phrases[currentPhrase];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <motion.div
        className={`absolute top-20 right-20 w-64 h-64 bg-gradient-to-br ${phrases[0].gradient} rounded-full opacity-5 blur-3xl`}
        animate={{ scale: [1, 1.5, 1], x: [-20, 20, -20] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <motion.div
        className={`absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br ${phrases[1].gradient} rounded-full opacity-5 blur-3xl`}
        animate={{ scale: [1.5, 1, 1.5], y: [-20, 20, -20] }}
        transition={{ duration: 8, repeat: Infinity, delay: 1 }}
      />

      <div className="relative z-10 flex flex-col items-center gap-16 max-w-2xl mx-auto px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhrase}
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -30 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="relative"
          >
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${currentItem.gradient} rounded-full opacity-20 blur-3xl`}
              animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            <div className="relative w-80 h-80 bg-white rounded-3xl shadow-2xl p-12 flex items-center justify-center">
              {currentItem.illustration}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-col items-center gap-6">
          <AnimatePresence mode="wait">
            <motion.h2
              key={`text-${currentPhrase}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="text-3xl md:text-4xl font-bold text-gray-900 text-center"
            >
              {currentItem.text}
            </motion.h2>
          </AnimatePresence>

          <motion.div
            className="flex gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {phrases.map((_, i) => (
              <motion.div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentPhrase
                    ? `w-12 bg-gradient-to-r ${currentItem.gradient}`
                    : "w-2 bg-gray-300"
                }`}
                animate={
                  i === currentPhrase
                    ? { scale: [1, 1.1, 1] }
                    : {}
                }
                transition={{ duration: 0.4 }}
              />
            ))}
          </motion.div>

          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-sm text-gray-500 mt-4"
          >
            This will only take a moment...
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default MoodProcessing;
