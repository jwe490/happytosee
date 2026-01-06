import { motion } from "framer-motion";

interface OptionData {
  emoji?: string;
  label: string;
  description?: string;
}

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: (string | OptionData)[];
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

  // Handle both string options and object options
  const normalizeOption = (option: string | OptionData, index: number) => {
    if (typeof option === "string") {
      return { id: `opt-${index}`, label: option, value: option, emoji: "", description: "" };
    }
    return { 
      id: `opt-${index}`, 
      label: option.label, 
      value: option.label, 
      emoji: option.emoji || "", 
      description: option.description || "" 
    };
  };

  const normalizedOptions = question.options.map(normalizeOption);

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
            ? "grid-cols-2"
            : "grid-cols-1 sm:grid-cols-2"
        }`}
      >
        {normalizedOptions.map((option, index) => (
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
              relative group p-5 md:p-6 rounded-2xl border-2 border-border/50
              bg-card hover:border-primary/50 hover:bg-card/80
              hover:shadow-lg transition-all duration-300 text-left
              ${isVisualCards ? "aspect-[3/4]" : ""}
            `}
          >
            {/* Hover gradient effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10 h-full flex flex-col justify-center gap-3">
              {/* Emoji and label row */}
              <div className="flex items-center gap-3">
                {option.emoji && (
                  <motion.span
                    className="text-3xl md:text-4xl"
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.3 }}
                  >
                    {option.emoji}
                  </motion.span>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-base md:text-lg">
                    {option.label}
                  </h3>
                  {option.description && (
                    <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                      {option.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Selection indicator */}
            <motion.div 
              className="absolute top-3 right-3 w-6 h-6 md:w-7 md:h-7 rounded-full border-2 border-border/50 group-hover:border-primary group-hover:bg-primary/20 transition-all duration-300 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
            >
              <motion.div 
                className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" 
              />
            </motion.div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};