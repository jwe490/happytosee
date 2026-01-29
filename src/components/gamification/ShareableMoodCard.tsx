import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import { Download, Share2, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface MoodCardData {
  mood: string;
  moodEmoji: string;
  movieTitle?: string;
  moviePoster?: string;
}

interface ShareableMoodCardProps {
  data: MoodCardData;
  userName?: string;
  onClose?: () => void;
}

const moodGradients: Record<string, { from: string; to: string; accent: string }> = {
  happy: { from: "#fbbf24", to: "#f97316", accent: "#fef3c7" },
  sad: { from: "#60a5fa", to: "#8b5cf6", accent: "#dbeafe" },
  romantic: { from: "#f472b6", to: "#ec4899", accent: "#fce7f3" },
  excited: { from: "#f97316", to: "#ef4444", accent: "#ffedd5" },
  chill: { from: "#2dd4bf", to: "#0ea5e9", accent: "#ccfbf1" },
  adventurous: { from: "#22c55e", to: "#14b8a6", accent: "#dcfce7" },
  nostalgic: { from: "#fbbf24", to: "#f59e0b", accent: "#fef3c7" },
  thrilled: { from: "#a855f7", to: "#ec4899", accent: "#f3e8ff" },
  stressed: { from: "#ef4444", to: "#f97316", accent: "#fee2e2" },
  motivated: { from: "#3b82f6", to: "#8b5cf6", accent: "#dbeafe" },
  bored: { from: "#6b7280", to: "#4b5563", accent: "#f3f4f6" },
  inspired: { from: "#a855f7", to: "#d946ef", accent: "#f3e8ff" },
};

export function ShareableMoodCard({ data, userName, onClose }: ShareableMoodCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const gradient = moodGradients[data.mood] || moodGradients.happy;

  const generateImage = useCallback(async () => {
    if (!cardRef.current) return null;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      });
      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Error generating image:", error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleDownload = async () => {
    const imageUrl = await generateImage();
    if (!imageUrl) {
      toast.error("Failed to generate image");
      return;
    }

    // Celebrate!
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });

    const link = document.createElement("a");
    link.download = `moodflix-${data.mood}.png`;
    link.href = imageUrl;
    link.click();
    toast.success("Card saved! 🎉");
  };

  const handleShare = async () => {
    const imageUrl = await generateImage();
    if (!imageUrl) {
      toast.error("Failed to generate image");
      return;
    }

    // Convert to blob for sharing
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const file = new File([blob], `moodflix-${data.mood}.png`, { type: "image/png" });

    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `My mood: ${data.mood}`,
          text: `I'm feeling ${data.mood} ${data.moodEmoji} on MoodFlix!`,
        });
        confetti({ particleCount: 50, spread: 40 });
      } catch (err) {
        // User cancelled or error
        if ((err as Error).name !== "AbortError") {
          // Fallback to copy
          await navigator.clipboard.writeText(window.location.origin);
          toast.success("Link copied!");
        }
      }
    } else {
      // Fallback for browsers without share API
      await navigator.clipboard.writeText(
        `I'm feeling ${data.mood} ${data.moodEmoji}! Find your mood match at ${window.location.origin}`
      );
      toast.success("Copied to clipboard!");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="relative max-w-xs w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* The card */}
        <div
          ref={cardRef}
          className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl"
          style={{
            background: `linear-gradient(145deg, ${gradient.from}, ${gradient.to})`,
          }}
        >
          {/* Subtle pattern */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 80%, ${gradient.accent} 0%, transparent 50%)`,
            }}
          />

          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-center p-8 text-white text-center">
            {/* Emoji */}
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="text-7xl mb-4 drop-shadow-lg"
            >
              {data.moodEmoji}
            </motion.span>

            {/* Mood label */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-display font-bold capitalize tracking-wide"
            >
              {data.mood}
            </motion.h2>

            {/* Username */}
            {userName && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ delay: 0.4 }}
                className="text-sm mt-2 opacity-80"
              >
                {userName}'s vibe
              </motion.p>
            )}

            {/* Movie if present */}
            {data.movieTitle && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm"
              >
                <p className="text-sm font-medium truncate max-w-[200px]">
                  🎬 {data.movieTitle}
                </p>
              </motion.div>
            )}

            {/* Branding */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute bottom-6 flex items-center gap-1.5 text-white/70"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-medium tracking-wider">MOODFLIX</span>
            </motion.div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <Button
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex-1 gap-2 rounded-full bg-white text-gray-900 hover:bg-white/90"
          >
            <Download className="w-4 h-4" />
            {isGenerating ? "..." : "Save"}
          </Button>
          <Button
            onClick={handleShare}
            disabled={isGenerating}
            variant="outline"
            className="flex-1 gap-2 rounded-full border-white/30 text-white hover:bg-white/10"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
