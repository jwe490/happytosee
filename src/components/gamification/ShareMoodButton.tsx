import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2 } from "lucide-react";
import { ShareableMoodCard } from "./ShareableMoodCard";
import { useKeyAuth } from "@/hooks/useKeyAuth";

interface ShareMoodButtonProps {
  currentMood?: string;
  currentMoodEmoji?: string;
  currentMovie?: { id: number; title: string; poster?: string };
}

export function ShareMoodButton({ currentMood, currentMoodEmoji, currentMovie }: ShareMoodButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useKeyAuth();

  // Only show if there's a mood selected
  if (!currentMood) return null;

  return (
    <>
      {/* Floating share button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow"
      >
        <Share2 className="w-5 h-5" />
        <span className="font-display font-semibold text-sm">Share Mood</span>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <ShareableMoodCard
            data={{
              mood: currentMood,
              moodEmoji: currentMoodEmoji || "😊",
              movieTitle: currentMovie?.title,
              moviePoster: currentMovie?.poster,
            }}
            userName={user?.display_name}
            onClose={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
