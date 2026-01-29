import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight } from "lucide-react";

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
  onAnswer: (option: string | string[]) => void;
  multiSelect?: boolean;
}

export const AssessmentQuestion = ({
  question,
  onAnswer,
  multiSelect = false,
}: AssessmentQuestionProps) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
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

  const handleOptionClick = (value: string) => {
    if (multiSelect) {
      setSelectedOptions(prev => {
        if (prev.includes(value)) {
          return prev.filter(v => v !== value);
        }
        return [...prev, value];
      });
    } else {
      onAnswer(value);
    }
  };

  const handleContinue = () => {
    if (selectedOptions.length > 0) {
      onAnswer(selectedOptions);
      setSelectedOptions([]);
    }
  };

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
        {multiSelect && (
          <p className="text-sm text-muted-foreground mt-2">
            Select all that apply
          </p>
        )}
      </div>

      <div
        className={`grid gap-3 ${
          isVisualCards
            ? "grid-cols-2"
            : normalizedOptions.length > 4 
              ? "grid-cols-2 sm:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2"
        }`}
      >
        {normalizedOptions.map((option, index) => {
          const isSelected = selectedOptions.includes(option.value);
          
          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: index * 0.08,
                duration: 0.3,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOptionClick(option.value)}
              className={`
                relative group rounded-2xl border-2
                transition-all duration-300 text-left
                min-h-[56px] touch-manipulation
                p-3 sm:p-4 md:p-5
                ${isVisualCards ? "aspect-[3/4]" : ""}
                ${isSelected 
                  ? "border-primary bg-primary/10 shadow-lg" 
                  : "border-border/50 bg-card hover:border-primary/50 hover:bg-card/80 hover:shadow-md active:scale-[0.98]"
                }
              `}
            >
              {/* Selection indicator */}
              {multiSelect && (
                <motion.div
                  initial={false}
                  animate={{ 
                    scale: isSelected ? 1 : 0.8,
                    opacity: isSelected ? 1 : 0
                  }}
                  className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-primary-foreground" />
                </motion.div>
              )}

              {/* Hover gradient effect */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />

              <div className="relative z-10 h-full flex flex-col justify-center gap-1.5 sm:gap-2">
                {/* Emoji and label row */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {option.emoji && (
                    <motion.span
                      className="text-xl sm:text-2xl md:text-3xl shrink-0"
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.4 }}
                    >
                      {option.emoji}
                    </motion.span>
                  )}
                  <span className="font-semibold text-foreground text-sm sm:text-base leading-tight">
                    {option.label}
                  </span>
                </div>

                {/* Description */}
                {option.description && (
                  <p className="text-xs md:text-sm text-muted-foreground pl-0 md:pl-10">
                    {option.description}
                  </p>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Continue button for multi-select */}
      {multiSelect && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center pt-4"
        >
          <Button
            onClick={handleContinue}
            disabled={selectedOptions.length === 0}
            size="lg"
            className="rounded-full px-8 gap-2"
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};
