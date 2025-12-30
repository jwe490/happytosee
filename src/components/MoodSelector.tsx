import { motion } from "framer-motion";
import { Smile, Frown, Heart, Zap, Clock, Leaf, Meh } from "lucide-react";

interface MoodSelectorProps {
  selectedMood: string | null;
  onSelectMood: (mood: string) => void;
}

const moods = [
  { id: "happy", label: "Happy", icon: Smile, description: "Feeling great!" },
  { id: "sad", label: "Sad", icon: Frown, description: "Need comfort" },
  { id: "romantic", label: "Romantic", icon: Heart, description: "In the mood for love" },
  { id: "excited", label: "Excited", icon: Zap, description: "Ready for action!" },
  { id: "nostalgic", label: "Nostalgic", icon: Clock, description: "Feeling sentimental" },
  { id: "stressed", label: "Stressed", icon: Leaf, description: "Need to unwind" },
  { id: "bored", label: "Bored", icon: Meh, description: "Surprise me!" },
];

const MoodSelector = ({ selectedMood, onSelectMood }: MoodSelectorProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {moods.map((mood, index) => {
        const Icon = mood.icon;
        const isSelected = selectedMood === mood.id;
        
        return (
          <motion.button
            key={mood.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            onClick={() => onSelectMood(mood.id)}
            className={`
              relative group p-6 rounded-2xl glass border transition-all duration-300
              ${isSelected 
                ? "border-primary shadow-glow scale-105" 
                : "border-border hover:border-primary/50 hover:scale-102"
              }
            `}
            >
            <div className={`
              absolute inset-0 rounded-2xl bg-foreground/5 opacity-0 
              transition-opacity duration-300
              ${isSelected ? "opacity-100" : "group-hover:opacity-50"}
            `} />
            
            <div className="relative flex flex-col items-center gap-3">
              <div className={`
                p-3 rounded-xl bg-secondary border border-border
                transition-all duration-300
                ${isSelected ? "scale-110 bg-primary text-primary-foreground border-primary" : "group-hover:scale-105 group-hover:border-foreground/30"}
              `}>
                <Icon className={`w-6 h-6 ${isSelected ? "text-primary-foreground" : "text-foreground"}`} />
              </div>
              
              <div className="text-center">
                <h3 className="font-semibold text-foreground">{mood.label}</h3>
                <p className="text-xs text-muted-foreground mt-1">{mood.description}</p>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default MoodSelector;
