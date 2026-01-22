import { motion } from "framer-motion";
import { trackMoodSelection } from "@/lib/analytics";

interface MoodSelectorProps {
  selectedMood: string | null;
  onSelectMood: (mood: string) => void;
}

const handleMoodClick = (moodId: string, onSelectMood: (mood: string) => void) => {
  onSelectMood(moodId);
  trackMoodSelection(moodId);
};

const moods = [
  { id: "happy", emoji: "😀", label: "Happy", description: "Feeling great!", color: "from-yellow-400/20 to-orange-400/20" },
  { id: "sad", emoji: "😢", label: "Sad", description: "Need comfort", color: "from-blue-400/20 to-indigo-400/20" },
  { id: "romantic", emoji: "❤️", label: "Romantic", description: "In the mood for love", color: "from-pink-400/20 to-rose-400/20" },
  { id: "excited", emoji: "⚡", label: "Excited", description: "Ready for action!", color: "from-amber-400/20 to-red-400/20" },
  { id: "nostalgic", emoji: "🥹", label: "Nostalgic", description: "Feeling sentimental", color: "from-purple-400/20 to-violet-400/20" },
  { id: "relaxed", emoji: "😌", label: "Relaxed", description: "Need to unwind", color: "from-green-400/20 to-teal-400/20" },
  { id: "bored", emoji: "😴", label: "Bored", description: "Surprise me!", color: "from-gray-400/20 to-slate-400/20" },
];

const MoodSelector = ({ selectedMood, onSelectMood }: MoodSelectorProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {moods.map((mood, index) => {
        const isSelected = selectedMood === mood.id;
        
        return (
          <motion.button
            key={mood.id}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: index * 0.08, 
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleMoodClick(mood.id, onSelectMood)}
            className={`
              relative group p-5 md:p-6 rounded-2xl md:rounded-3xl transition-all duration-300 overflow-hidden
              ${isSelected 
                ? "bg-card shadow-card-hover ring-2 ring-foreground/30" 
                : "bg-card/60 backdrop-blur-sm border border-border/50 hover:bg-card hover:shadow-card hover:border-border"
              }
            `}
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${mood.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isSelected ? 'opacity-100' : ''}`} />
            
            {/* Selection Glow */}
            {isSelected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-br from-accent/10 to-transparent"
              />
            )}
            
            <div className="relative flex flex-col items-center gap-3 md:gap-4">
              {/* Emoji with bounce animation */}
              <motion.span
                className="text-4xl md:text-5xl"
                animate={isSelected ? { 
                  scale: [1, 1.3, 1],
                  rotate: [0, -10, 10, 0]
                } : {}}
                transition={{ duration: 0.5 }}
              >
                {mood.emoji}
              </motion.span>
              
              <div className="text-center">
                <h3 className="font-display font-semibold text-sm md:text-base text-foreground">
                  {mood.label}
                </h3>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1 hidden sm:block">
                  {mood.description}
                </p>
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center shadow-lg"
                >
                  <span className="text-xs">✓</span>
                </motion.div>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default MoodSelector;
