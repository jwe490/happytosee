import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { trackMoodSelection } from "@/lib/analytics";

import happySvg from "@/assets/mood-happy.svg";
import sadSvg from "@/assets/mood-sad.svg";
import romanticSvg from "@/assets/mood-romantic.svg";
import excitedSvg from "@/assets/mood-excited.svg";
import chillSvg from "@/assets/mood-chill.svg";
import adventurousSvg from "@/assets/mood-adventurous.svg";
import nostalgicSvg from "@/assets/mood-nostalgic.svg";
import thrilledSvg from "@/assets/mood-thrilled.svg";
import stressedSvg from "@/assets/mood-stressed.svg";
import motivatedSvg from "@/assets/mood-motivated.svg";
import boredSvg from "@/assets/mood-bored.svg";
import inspiredSvg from "@/assets/mood-inspired.svg";

interface FloatingMoodSelectorProps {
  selectedMood: string | null;
  onSelectMood: (mood: string) => void;
  isLoading?: boolean;
}

const moods = [
  { id: "happy", icon: happySvg, label: "Happy", tagline: "Something uplifting 🎉" },
  { id: "sad", icon: sadSvg, label: "Sad", tagline: "Comfort movies for you 💙" },
  { id: "romantic", icon: romanticSvg, label: "Romantic", tagline: "Love is in the air 💕" },
  { id: "excited", icon: excitedSvg, label: "Excited", tagline: "Action-packed thrills! 🔥" },
  { id: "bored", icon: boredSvg, label: "Bored", tagline: "Something surprising 🎲" },
  { id: "chill", icon: chillSvg, label: "Chill", tagline: "Chill vibes only 🌿" },
  { id: "nostalgic", icon: nostalgicSvg, label: "Nostalgic", tagline: "A trip down memory lane ✨" },
];

const FloatingMoodSelector = ({ selectedMood, onSelectMood, isLoading }: FloatingMoodSelectorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [recentMoods, setRecentMoods] = useState<string[]>([]);

  // Load recent moods from session storage
  useEffect(() => {
    const stored = sessionStorage.getItem("recentMoods");
    if (stored) {
      setRecentMoods(JSON.parse(stored));
    }
  }, []);

  const handleMoodSelect = (moodId: string) => {
    onSelectMood(moodId);
    setIsExpanded(false);
    
    // Track mood selection for analytics
    trackMoodSelection(moodId);
    
    // Track recent moods (last 3)
    const updated = [moodId, ...recentMoods.filter(m => m !== moodId)].slice(0, 3);
    setRecentMoods(updated);
    sessionStorage.setItem("recentMoods", JSON.stringify(updated));
  };

  const currentMood = moods.find(m => m.id === selectedMood);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Floating Button & Expanded Panel */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-card border border-border rounded-2xl p-4 shadow-xl w-[280px] sm:w-[320px]"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-foreground text-sm">
                  How are you feeling?
                </h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 hover:bg-secondary rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Mood Grid */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {moods.map((mood, index) => {
                  const isSelected = selectedMood === mood.id;
                  const isRecent = recentMoods.includes(mood.id);
                  
                  return (
                    <motion.button
                      key={mood.id}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleMoodSelect(mood.id)}
                      disabled={isLoading}
                      className={`
                        relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200
                        ${isSelected
                          ? "bg-foreground/10 ring-2 ring-foreground scale-110 shadow-lg"
                          : "hover:bg-secondary hover:scale-105"
                        }
                        ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                      `}
                    >
                      <img
                        src={mood.icon}
                        alt={mood.label}
                        className="w-8 h-8 sm:w-10 sm:h-10 object-contain transition-transform hover:scale-110"
                      />
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {mood.label}
                      </span>
                      {isRecent && !isSelected && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Surprise Me Button */}
              <button
                onClick={() => {
                  const randomMood = moods[Math.floor(Math.random() * moods.length)];
                  handleMoodSelect(randomMood.id);
                }}
                disabled={isLoading}
                className="w-full py-2 px-3 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium text-foreground transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                Surprise me! 🎲
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="collapsed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(true)}
              className={`
                flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-full shadow-xl
                hover:shadow-2xl transition-all duration-300
                ${isLoading ? "animate-pulse" : ""}
              `}
            >
              {currentMood ? (
                <img src={currentMood.icon} alt={currentMood.label} className="w-7 h-7 object-contain" />
              ) : (
                <span className="text-2xl">🎬</span>
              )}
              <span className="font-medium text-sm text-foreground hidden sm:inline">
                {currentMood?.label || "Pick Mood"}
              </span>
              {isLoading && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                </motion.div>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Dynamic Mood Tagline */}
      <AnimatePresence>
        {currentMood && !isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-20 right-4 sm:bottom-[88px] sm:right-6 z-40"
          >
            <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg">
              <p className="text-xs text-muted-foreground">
                Feeling <span className="font-semibold text-foreground">{currentMood.label}</span>?
              </p>
              <p className="text-sm font-medium text-foreground">{currentMood.tagline}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingMoodSelector;
