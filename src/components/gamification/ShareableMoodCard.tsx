import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import { Download, Share2, Twitter, Facebook, Link, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MoodCardData {
  mood: string;
  moodEmoji: string;
  movieTitle?: string;
  moviePoster?: string;
  streak?: number;
  date?: Date;
}

interface ShareableMoodCardProps {
  data: MoodCardData;
  userName?: string;
}

const moodGradients: Record<string, string> = {
  happy: "from-yellow-400 via-orange-400 to-pink-400",
  sad: "from-blue-400 via-indigo-400 to-purple-400",
  romantic: "from-pink-400 via-rose-400 to-red-400",
  excited: "from-orange-400 via-red-400 to-pink-500",
  chill: "from-teal-400 via-cyan-400 to-blue-400",
  adventurous: "from-green-400 via-emerald-400 to-teal-400",
  nostalgic: "from-amber-400 via-yellow-400 to-orange-400",
  thrilled: "from-purple-500 via-pink-500 to-red-500",
  stressed: "from-red-500 via-orange-500 to-yellow-500",
  motivated: "from-blue-500 via-purple-500 to-pink-500",
  bored: "from-gray-400 via-slate-400 to-zinc-400",
  inspired: "from-violet-400 via-purple-400 to-fuchsia-400",
};

export function ShareableMoodCard({ data, userName }: ShareableMoodCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const gradient = moodGradients[data.mood] || moodGradients.happy;
  const displayDate = data.date || new Date();

  const generateImage = useCallback(async () => {
    if (!cardRef.current) return null;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
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

    const link = document.createElement("a");
    link.download = `moodflix-${data.mood}-${Date.now()}.png`;
    link.href = imageUrl;
    link.click();
    toast.success("Card downloaded!");
  };

  const handleCopyLink = async () => {
    const url = window.location.origin;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const text = `I'm feeling ${data.mood} ${data.moodEmoji} today! ${data.movieTitle ? `Watching: ${data.movieTitle}` : "Finding my perfect movie match"} on MoodFlix 🎬`;
    const url = window.location.origin;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  const handleShareFacebook = () => {
    const url = window.location.origin;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  return (
    <div className="space-y-4">
      {/* The shareable card */}
      <motion.div
        ref={cardRef}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`
          relative w-full max-w-sm mx-auto aspect-square rounded-3xl overflow-hidden
          bg-gradient-to-br ${gradient} p-6 shadow-2xl
        `}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px)`,
            backgroundSize: "30px 30px",
          }} />
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col justify-between text-white">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium opacity-80">
              {displayDate.toLocaleDateString("en-US", { 
                month: "short", 
                day: "numeric", 
                year: "numeric" 
              })}
            </span>
            {data.streak && data.streak > 1 && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 text-xs font-bold">
                🔥 {data.streak} day streak
              </span>
            )}
          </div>

          {/* Main mood */}
          <div className="text-center">
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
              className="text-8xl block mb-2"
            >
              {data.moodEmoji}
            </motion.span>
            <h2 className="text-3xl font-display font-bold capitalize mb-1">
              {data.mood}
            </h2>
            {userName && (
              <p className="text-sm opacity-80">{userName}'s mood today</p>
            )}
          </div>

          {/* Movie */}
          {data.movieTitle && (
            <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              {data.moviePoster && (
                <img
                  src={data.moviePoster}
                  alt=""
                  className="w-12 h-16 rounded-lg object-cover shadow-lg"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs opacity-70">Watching</p>
                <p className="font-semibold truncate">{data.movieTitle}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
              <span className="text-lg">🎬</span>
              <span className="font-display font-bold text-sm">MoodFlix</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Share buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={isGenerating}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          {isGenerating ? "Generating..." : "Download"}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleShareTwitter}
          className="gap-2"
        >
          <Twitter className="w-4 h-4" />
          Twitter
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleShareFacebook}
          className="gap-2"
        >
          <Facebook className="w-4 h-4" />
          Facebook
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="gap-2"
        >
          {copied ? <Check className="w-4 h-4" /> : <Link className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy Link"}
        </Button>
      </div>
    </div>
  );
}
