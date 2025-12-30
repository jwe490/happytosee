import { motion } from "framer-motion";

interface MoodSelectorProps {
  selectedMood: string | null;
  onSelectMood: (mood: string) => void;
}

const moods = [
  { id: "happy", emoji: "😀", label: "Happy", description: "Feeling great!" },
  { id: "sad", emoji: "😢", label: "Sad", description: "Need comfort" },
  { id: "romantic", emoji: "❤️", label: "Romantic", description: "In the mood for love" },
  { id: "excited", emoji: "⚡", label: "Excited", description: "Ready for action!" },
  { id: "nostalgic", emoji: "🥹", label: "Nostalgic", description: "Feeling sentimental" },
  { id: "relaxed", emoji: "😌", label: "Relaxed", description: "Need to unwind" },
  { id: "bored", emoji: "😴", label: "Bored", description: "Surprise me!" },
];

const MoodSelector = ({ selectedMood, onSelectMood }: MoodSelectorProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {moods.map((mood, index) => {
        const isSelected = selectedMood === mood.id;
        
        return (
          <motion.button
            key={mood.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectMood(mood.id)}
            className={`
              relative group p-4 md:p-6 rounded-xl md:rounded-2xl bg-card border transition-all duration-300 shadow-sm
              ${isSelected 
                ? "border-foreground shadow-card scale-105 ring-2 ring-foreground/20" 
                : "border-border hover:border-foreground/30 hover:shadow-card"
              }
            `}
          >
            {/* Glow effect on selection */}
            {isSelected && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 rounded-xl md:rounded-2xl bg-foreground/5"
              />
            )}
            
            <div className="relative flex flex-col items-center gap-2 md:gap-3">
              {/* Emoji with animation */}
              <motion.span
                className="text-4xl md:text-5xl"
                animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {mood.emoji}
              </motion.span>
              
              <div className="text-center">
                <h3 className="font-semibold text-sm md:text-base text-foreground">{mood.label}</h3>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 hidden sm:block">{mood.description}</p>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default MoodSelector;
