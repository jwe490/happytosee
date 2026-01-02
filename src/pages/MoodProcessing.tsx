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
    "Preparing your mood board...",
  ];

  useEffect(() => {
    const phraseInterval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % phrases.length);
    }, 1400);

    const navigationTimeout = setTimeout(() => {
      if (assessmentId) {
        navigate(`/mood/story/${assessmentId}`);
      } else {
        navigate(`/assessment/results/${assessmentId || ''}`);
      }
    }, 4000);

    return () => {
      clearInterval(phraseInterval);
      clearTimeout(navigationTimeout);
    };
  }, [navigate, assessmentId]);

  return (
    <div className="min-h-screen bg-[#212529] flex items-center justify-center relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-12">
        <motion.div
          className="w-[200px] h-[200px] rounded-full border-4 border-transparent bg-gradient-to-r from-[#007BFF] via-[#00D4FF] to-[#007BFF] bg-clip-padding"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
          }}
        >
          <div className="w-full h-full bg-[#212529] rounded-full" />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.p
            key={currentPhrase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="text-2xl font-medium text-white"
          >
            {phrases[currentPhrase]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MoodProcessing;
