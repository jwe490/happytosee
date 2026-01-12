import { motion } from "framer-motion";
import { Smile, Frown, Heart, Zap, Clock, Coffee, Moon, Check, LucideIcon } from "lucide-react";

interface MoodSelectorProps {
  selectedMood: string | null;
  onSelectMood: (mood: string) => void;
}

interface MoodOption {
  id: string;
  icon: LucideIcon;
  label: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
}

const moods: MoodOption[] = [
  { id: "happy", icon: Smile, label: "Happy", description: "Feeling great!", gradientFrom: "from-amber-400/20", gradientTo: "to-orange-400/20" },
  { id: "sad", icon: Frown, label: "Sad", description: "Need comfort", gradientFrom: "from-blue-400/20", gradientTo: "to-indigo-400/20" },
  { id: "romantic", icon: Heart, label: "Romantic", description: "In the mood for love", gradientFrom: "from-pink-400/20", gradientTo: "to-rose-400/20" },
  { id: "excited", icon: Zap, label: "Excited", description: "Ready for action!", gradientFrom: "from-amber-400/20", gradientTo: "to-red-400/20" },
  { id: "nostalgic", icon: Clock, label: "Nostalgic", description: "Feeling sentimental", gradientFrom: "from-purple-400/20", gradientTo: "to-violet-400/20" },
  { id: "relaxed", icon: Coffee, label: "Relaxed", description: "Need to unwind", gradientFrom: "from-green-400/20", gradientTo: "to-teal-400/20" },
  { id: "bored", icon: Moon, label: "Bored", description: "Surprise me!", gradientFrom: "from-gray-400/20", gradientTo: "to-slate-400/20" },
];

const MoodSelector = ({ selectedMood, onSelectMood }: MoodSelectorProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {moods.map((mood, index) => {
        const isSelected = selectedMood === mood.id;
        const Icon = mood.icon;
        
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
            onClick={() => onSelectMood(mood.id)}
            className={`
              relative group p-5 md:p-6 rounded-2xl md:rounded-3xl transition-all duration-300 overflow-hidden
              ${isSelected 
                ? "bg-card shadow-card-hover ring-2 ring-foreground/30" 
                : "bg-card/60 backdrop-blur-sm border border-border/50 hover:bg-card hover:shadow-card hover:border-border"
              }
            `}
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${mood.gradientFrom} ${mood.gradientTo} opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isSelected ? 'opacity-100' : ''}`} />
            
            {/* Selection Glow */}
            {isSelected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-br from-accent/10 to-transparent"
              />
            )}
            
            <div className="relative flex flex-col items-center gap-3 md:gap-4">
              {/* Icon with consistent sizing */}
              <motion.div
                className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14"
                animate={isSelected ? { 
                  scale: [1, 1.1, 1],
                } : {}}
                transition={{ duration: 0.4 }}
              >
                <Icon 
                  className="w-8 h-8 md:w-10 md:h-10 text-foreground" 
                  strokeWidth={1.5}
                />
              </motion.div>
              
              <div className="text-center space-y-1">
                <h3 className="font-display font-semibold text-sm md:text-base text-foreground">
                  {mood.label}
                </h3>
                <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">
                  {mood.description}
                </p>
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 rounded-full bg-foreground flex items-center justify-center shadow-md"
                >
                  <Check className="w-3 h-3 md:w-3.5 md:h-3.5 text-background" strokeWidth={2.5} />
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
