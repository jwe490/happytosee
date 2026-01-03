import { motion } from "framer-motion";
import { Check } from "lucide-react";

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
}

export const AssessmentQuestion = ({
  question,
  onAnswer,
}: AssessmentQuestionProps) => {
  const isVisualCards = question.question_type === "visual_cards";

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-display font-semibold text-foreground">
          {question.question_text}
        </h2>
      </div>

      <div
        className={`grid gap-4 ${
          isVisualCards
            ? "grid-cols-2 md:grid-cols-2"
            : "grid-cols-1 md:grid-cols-2"
        }`}
      >
        {question.options.map((option, index) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: index * 0.1,
              duration: 0.3,
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onAnswer(option.value)}
            className={`
              relative group p-6 rounded-2xl border-2 border-border/50
              bg-card hover:border-primary/50 hover:bg-card/80
              transition-all duration-300 text-left
              ${isVisualCards ? "aspect-[3/4]" : ""}
            `}
          >
            {isVisualCards && (
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            )}

            <div className="relative z-10 h-full flex flex-col justify-end space-y-2">
              <motion.div
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Check className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
              </motion.div>

              <div>
                <h3
                  className={`font-semibold ${
                    isVisualCards
                      ? "text-white text-xl"
                      : "text-foreground text-lg"
                  }`}
                >
                  {option.label}
                </h3>
              </div>
            </div>

            <div className="absolute top-3 right-3 w-8 h-8 rounded-full border-2 border-border/50 group-hover:border-primary/50 bg-background/50 group-hover:bg-primary/20 transition-all duration-300" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};
