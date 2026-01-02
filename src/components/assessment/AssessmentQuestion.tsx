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
  totalQuestions,
}: AssessmentQuestionProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-16"
    >
      {/* Illustration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="flex flex-col items-center gap-12"
      >
        <QuestionIllustration questionNumber={questionNumber} />

        <h2 className="text-3xl md:text-5xl font-display font-bold text-center max-w-3xl leading-tight">
          {question.question_text}
        </h2>
      </motion.div>

      {/* Options */}
      <div className="grid gap-3 max-w-2xl mx-auto w-full">
        {question.options.map((option, index) => {
          const isHovered = hoveredIndex === index;

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.2 + index * 0.08,
                duration: 0.4,
              }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              onClick={() => onAnswer(option.value)}
              className={`
                group relative p-5 md:p-6 rounded-2xl border transition-all duration-200
                ${isHovered ? 'border-foreground bg-foreground/5' : 'border-border/40 bg-background'}
              `}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                    font-display font-semibold text-sm transition-all duration-200
                    ${isHovered ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}
                  `}
                >
                  {String.fromCharCode(65 + index)}
                </div>

                <p className={`
                  text-base md:text-lg font-medium text-left flex-1 transition-colors duration-200
                  ${isHovered ? 'text-foreground' : 'text-foreground/80'}
                `}>
                  {option.label}
                </p>

                <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                  ${isHovered ? 'border-foreground' : 'border-muted-foreground/30'}
                `}>
                  {isHovered && (
                    <motion.div
                      className="w-2.5 h-2.5 rounded-full bg-foreground"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.15 }}
                    />
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};
