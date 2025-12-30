import { motion } from "framer-motion";
import { Smile, Frown, Heart, Zap, Clock, Leaf, Meh } from "lucide-react";

interface MoodSelectorProps {
  selectedMood: string | null;
  onSelectMood: (mood: string) => void;
}

const moods = [
  { id: "happy", label: "Happy", icon: Smile, color: "from-yellow-400 to-amber-500", description: "Feeling great!" },
  { id: "sad", label: "Sad", icon: Frown, color: "from-blue-400 to-blue-600", description: "Need comfort" },
  { id: "romantic", label: "Romantic", icon: Heart, color: "from-rose-400 to-pink-600", description: "In the mood for love" },
  { id: "excited", label: "Excited", icon: Zap, color: "from-orange-400 to-red-500", description: "Ready for action!" },
  { id: "nostalgic", label: "Nostalgic", icon: Clock, color: "from-amber-600 to-amber-800", description: "Feeling sentimental" },
  { id: "stressed", label: "Stressed", icon: Leaf, color: "from-teal-400 to-cyan-600", description: "Need to unwind" },
  { id: "bored", label: "Bored", icon: Meh, color: "from-violet-400 to-purple-600", description: "Surprise me!" },
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
              relative group p-6 rounded-2xl bg-card border transition-all duration-300 shadow-sm
              ${isSelected 
                ? "border-foreground shadow-card scale-105" 
                : "border-border hover:border-foreground/30 hover:shadow-card hover:scale-102"
              }
            `}
          >
            <div className={`
              absolute inset-0 rounded-2xl bg-gradient-to-br ${mood.color} opacity-0 
              transition-opacity duration-300
              ${isSelected ? "opacity-20" : "group-hover:opacity-10"}
            `} />
            
            <div className="relative flex flex-col items-center gap-3">
              <div className={`
                p-3 rounded-xl bg-gradient-to-br ${mood.color}
                shadow-lg transition-transform duration-300
                ${isSelected ? "scale-110" : "group-hover:scale-105"}
              `}>
                <Icon className="w-6 h-6 text-white" />
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
