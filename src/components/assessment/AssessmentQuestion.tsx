import { motion } from "framer-motion";
import { useState } from "react";

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

const questionIllustrations: Record<number, { emoji: string; gradient: string; animate?: any }> = {
  1: { emoji: "🍿", gradient: "from-[#FF6B9D] to-[#C86DD7]", animate: { rotate: [0, -10, 10, 0] } },
  2: { emoji: "🎬", gradient: "from-[#06B6D4] to-[#3B82F6]", animate: { scale: [1, 1.2, 1] } },
  3: { emoji: "🌟", gradient: "from-[#FBBF24] to-[#F59E0B]", animate: { y: [0, -10, 0] } },
  4: { emoji: "🎭", gradient: "from-[#A855F7] to-[#EC4899]", animate: { rotate: [0, 360] } },
  5: { emoji: "🎨", gradient: "from-[#10B981] to-[#06B6D4]", animate: { scale: [1, 1.1, 1] } },
  6: { emoji: "💫", gradient: "from-[#F472B6] to-[#C084FC]", animate: { rotate: [0, 180, 360] } },
  7: { emoji: "🎪", gradient: "from-[#FB923C] to-[#EF4444]", animate: { y: [0, -15, 0] } },
  8: { emoji: "🌈", gradient: "from-[#34D399] to-[#FBBF24]", animate: { x: [-5, 5, -5] } },
  9: { emoji: "🎯", gradient: "from-[#EF4444] to-[#F59E0B]", animate: { scale: [1, 1.15, 1] } },
  10: { emoji: "🧠", gradient: "from-[#8B5CF6] to-[#6366F1]", animate: { rotate: [0, -5, 5, 0] } },
  11: { emoji: "🔮", gradient: "from-[#C86DD7] to-[#06B6D4]", animate: { y: [0, -10, 0] } },
  12: { emoji: "✨", gradient: "from-[#FF6B9D] to-[#FBBF24]", animate: { rotate: [0, 360] } },
};

export const AssessmentQuestion = ({
  question,
  onAnswer,
  questionNumber,
  totalQuestions,
}: AssessmentQuestionProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const illustration = questionIllustrations[questionNumber] || questionIllustrations[1];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-12"
    >
      {/* Illustration */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="flex flex-col items-center gap-8"
      >
        <motion.div
          className={`w-32 h-32 rounded-full bg-gradient-to-br ${illustration.gradient} flex items-center justify-center shadow-2xl`}
          animate={illustration.animate}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-6xl">{illustration.emoji}</span>
        </motion.div>

        <h2 className="text-2xl md:text-4xl font-display font-bold text-center max-w-2xl">
          {question.question_text}
        </h2>
      </motion.div>

      {/* Options */}
      <div className="grid gap-4 md:gap-5">
        {question.options.map((option, index) => {
          const isHovered = hoveredIndex === index;
          const optionGradients = [
            "from-[#FF6B9D]/10 to-[#C86DD7]/10",
            "from-[#06B6D4]/10 to-[#3B82F6]/10",
            "from-[#F59E0B]/10 to-[#EF4444]/10",
            "from-[#10B981]/10 to-[#06B6D4]/10",
          ];
          const optionGradient = optionGradients[index % optionGradients.length];

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.4 + index * 0.1,
                duration: 0.5,
                type: "spring",
                stiffness: 100,
              }}
              whileHover={{ scale: 1.02, x: 8 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              onClick={() => onAnswer(option.value)}
              className="group relative"
            >
              <div
                className={`
                  relative p-6 md:p-8 rounded-3xl border-2
                  transition-all duration-300
                  ${isHovered ? 'border-primary/50 bg-gradient-to-br ' + optionGradient : 'border-border/30 bg-card/50'}
                `}
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      font-display font-bold text-lg
                      transition-all duration-300
                      ${isHovered ? 'bg-primary text-primary-foreground scale-110' : 'bg-secondary text-secondary-foreground'}
                    `}
                    animate={isHovered ? { rotate: [0, -10, 10, 0] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {String.fromCharCode(65 + index)}
                  </motion.div>

                  <p className="text-lg md:text-xl font-medium text-left flex-1">
                    {option.label}
                  </p>

                  <motion.div
                    className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center"
                    animate={isHovered ? { scale: 1.2, borderColor: "rgb(var(--primary))" } : {}}
                  >
                    {isHovered && (
                      <motion.div
                        className="w-3 h-3 rounded-full bg-primary"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Shine effect on hover */}
              <motion.div
                className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/10 to-transparent"
                initial={{ x: "-100%" }}
                animate={isHovered ? { x: "100%" } : {}}
                transition={{ duration: 0.6 }}
                style={{ pointerEvents: "none" }}
              />
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};
