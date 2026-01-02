import { motion } from "framer-motion";
import {
  CinemaIllustration,
  EmotionWheelIllustration,
  SparklesIllustration,
  MovieReelIllustration,
  HeartPulseIllustration,
  StarsIllustration,
  ThoughtBubbleIllustration,
  PopcornIllustration,
} from "./Illustrations";

interface QuestionIllustrationProps {
  questionNumber: number;
}

export const QuestionIllustration = ({
  questionNumber,
}: QuestionIllustrationProps) => {
  const illustrations = [
    { component: <CinemaIllustration className="w-full h-full" />, gradient: "from-blue-500 via-cyan-500 to-teal-500" },
    { component: <EmotionWheelIllustration className="w-full h-full" />, gradient: "from-amber-500 via-orange-500 to-red-500" },
    { component: <SparklesIllustration className="w-full h-full" />, gradient: "from-emerald-500 via-teal-500 to-cyan-500" },
    { component: <MovieReelIllustration className="w-full h-full" />, gradient: "from-blue-600 via-cyan-600 to-teal-600" },
    { component: <HeartPulseIllustration className="w-full h-full" />, gradient: "from-red-500 via-orange-500 to-amber-500" },
    { component: <StarsIllustration className="w-full h-full" />, gradient: "from-amber-400 via-yellow-400 to-orange-400" },
    { component: <ThoughtBubbleIllustration className="w-full h-full" />, gradient: "from-blue-500 via-cyan-500 to-emerald-500" },
    { component: <PopcornIllustration className="w-full h-full" />, gradient: "from-amber-500 via-orange-500 to-red-500" },
    { component: <CinemaIllustration className="w-full h-full" />, gradient: "from-teal-500 via-emerald-500 to-green-500" },
    { component: <StarsIllustration className="w-full h-full" />, gradient: "from-blue-600 via-cyan-600 to-teal-600" },
    { component: <HeartPulseIllustration className="w-full h-full" />, gradient: "from-red-600 via-orange-600 to-amber-600" },
    { component: <SparklesIllustration className="w-full h-full" />, gradient: "from-cyan-500 via-blue-500 to-blue-600" },
  ];

  const illustration = illustrations[(questionNumber - 1) % illustrations.length];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
      className="relative w-72 h-72 mx-auto"
    >
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${illustration.gradient} rounded-full opacity-10 blur-2xl`}
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="relative z-10 w-full h-full bg-white rounded-3xl shadow-2xl p-8 flex items-center justify-center overflow-hidden"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${illustration.gradient} opacity-5`} />
        <div className="relative z-10 w-full h-full">
          {illustration.component}
        </div>
      </motion.div>

      <motion.div
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-2 bg-gray-200 rounded-full blur-md opacity-40"
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.3, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  );
};
