import { useState } from "react";
import { trackMoodSelection } from "@/lib/analytics";

interface MoodSelectorProps {
  selectedMood: string | null;
  onSelectMood: (mood: string) => void;
}

const moods = [
  { id: "happy", label: "Happy", emoji: "😊" },
  { id: "sad", label: "Sad", emoji: "😢" },
  { id: "romantic", label: "Romantic", emoji: "🥰" },
  { id: "excited", label: "Excited", emoji: "🤩" },
  { id: "chill", label: "Chill", emoji: "😌" },
  { id: "adventurous", label: "Adventurous", emoji: "🤠" },
  { id: "nostalgic", label: "Nostalgic", emoji: "🥹" },
  { id: "thrilled", label: "Thrilled", emoji: "😱" },
  { id: "stressed", label: "Stressed", emoji: "😤" },
  { id: "motivated", label: "Motivated", emoji: "💪" },
  { id: "bored", label: "Bored", emoji: "😑" },
  { id: "inspired", label: "Inspired", emoji: "✨" },
];

const MoodSelector = ({ selectedMood, onSelectMood }: MoodSelectorProps) => {
  const [animatingMood, setAnimatingMood] = useState<string | null>(null);

  const handleMoodClick = (moodId: string) => {
    setAnimatingMood(moodId);
    
    setTimeout(() => {
      onSelectMood(moodId);
      trackMoodSelection(moodId);
    }, 200);
    
    setTimeout(() => {
      setAnimatingMood(null);
    }, 500);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      {/* Grid: 2 cols mobile, 3 cols tablet, 4 cols desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {moods.map((mood, index) => {
          const isSelected = selectedMood === mood.id;
          const isAnimating = animatingMood === mood.id;

          return (
            <button
              key={mood.id}
              onClick={() => handleMoodClick(mood.id)}
              className={`
                relative flex flex-col items-center justify-center
                bg-secondary/60 hover:bg-secondary
                rounded-2xl
                py-5 px-4 md:py-6 md:px-5 lg:py-7 lg:px-6
                border border-border
                transition-all duration-200
                ${isSelected ? "ring-2 ring-foreground ring-offset-2 ring-offset-background bg-secondary shadow-lg" : "hover:shadow-md"}
                cursor-pointer
                min-h-[100px] md:min-h-[115px] lg:min-h-[130px]
                active:scale-95
                animate-fade-in
              `}
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              {/* Centered Emoji */}
              <span
                className={`text-4xl md:text-5xl lg:text-5xl select-none transition-transform duration-200 ${isAnimating ? 'scale-125' : ''}`}
              >
                {mood.emoji}
              </span>

              {/* Label */}
              <span className="mt-2 font-display font-semibold text-foreground text-sm md:text-base">
                {mood.label}
              </span>

              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-foreground flex items-center justify-center animate-scale-in">
                  <svg
                    className="w-3 h-3 text-background"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MoodSelector;