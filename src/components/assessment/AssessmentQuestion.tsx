import { motion } from "framer-motion";
import { useState } from "react";
import { QuestionIllustration } from "./QuestionIllustration";

interface Option {
  id: string;
  label: string;
  value: string;
  image?: string;
}

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: Option[];
  visual_content?: any;
}

interface AssessmentQuestionProps {
  question: Question;
  onAnswer: (option: string) => void;
  questionNumber: number;
  totalQuestions: number;
}

export const AssessmentQuestion = ({
  question,
  onAnswer,
  questionNumber,
}: AssessmentQuestionProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleSelect = (option: string, index: number) => {
    setSelectedIndex(index);
    setTimeout(() => {
      onAnswer(option);
      setSelectedIndex(null);
    }, 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-16 py-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="flex flex-col items-center gap-12"
      >
        <QuestionIllustration questionNumber={questionNumber} />

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-3xl md:text-5xl font-bold text-center max-w-4xl leading-tight text-gray-900 px-4"
        >
          {question.question_text}
        </motion.h2>
      </motion.div>

      <div className="grid gap-4 max-w-3xl mx-auto w-full px-4">
        {question.options.map((option, index) => {
          const isHovered = hoveredIndex === index;
          const isSelected = selectedIndex === index;

          const gradients = [
            "from-blue-500 to-cyan-500",
            "from-amber-500 to-orange-500",
            "from-emerald-500 to-teal-500",
            "from-red-500 to-orange-500",
          ];

          const gradient = gradients[index % gradients.length];

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.4 + index * 0.1,
                duration: 0.5,
                type: "spring",
              }}
              whileHover={{ scale: 1.02, x: 8 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              onClick={() => handleSelect(option.value, index)}
              className={`
                group relative p-6 md:p-7 rounded-2xl transition-all duration-300
                ${
                  isSelected
                    ? `bg-gradient-to-r ${gradient} shadow-2xl`
                    : isHovered
                    ? "bg-gray-50 shadow-xl border-2 border-gray-900"
                    : "bg-white shadow-lg border-2 border-gray-200 hover:border-gray-300"
                }
              `}
            >
              <div className="flex items-center gap-5">
                <motion.div
                  animate={
                    isSelected
                      ? { scale: [1, 1.2, 1], rotate: [0, 180, 360] }
                      : {}
                  }
                  transition={{ duration: 0.4 }}
                  className={`
                    w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                    font-bold text-lg transition-all duration-300
                    ${
                      isSelected
                        ? "bg-white text-gray-900 shadow-lg"
                        : isHovered
                        ? `bg-gradient-to-br ${gradient} text-white`
                        : "bg-gray-100 text-gray-600"
                    }
                  `}
                >
                  {String.fromCharCode(65 + index)}
                </motion.div>

                <p
                  className={`
                  text-base md:text-xl font-semibold text-left flex-1 transition-colors duration-300
                  ${
                    isSelected
                      ? "text-white"
                      : isHovered
                      ? "text-gray-900"
                      : "text-gray-700"
                  }
                `}
                >
                  {option.label}
                </p>

                <motion.div
                  animate={
                    isSelected
                      ? {
                          scale: [0, 1.2, 1],
                          rotate: [0, 360],
                        }
                      : {}
                  }
                  transition={{ duration: 0.4 }}
                  className={`
                    w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300
                    ${
                      isSelected
                        ? "bg-white"
                        : isHovered
                        ? `bg-gradient-to-br ${gradient}`
                        : "bg-gray-200"
                    }
                  `}
                >
                  {(isHovered || isSelected) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`w-3 h-3 rounded-full ${
                        isSelected
                          ? `bg-gradient-to-br ${gradient}`
                          : "bg-white"
                      }`}
                    />
                  )}
                </motion.div>
              </div>

              {isSelected && (
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-white"
                  initial={{ scale: 1, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-sm text-gray-500 pt-8"
      >
        Choose the option that resonates most with you
      </motion.p>
    </motion.div>
  );
};
