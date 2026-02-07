import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PosterDownloadButtonProps {
  posterUrl: string | null;
  movieTitle: string;
  className?: string;
}

const QUALITY_OPTIONS = [
  { label: "HD", key: "w780", size: "780p" },
  { label: "Full HD", key: "w1280", size: "1280p" },
  { label: "4K", key: "original", size: "Original" },
] as const;

export function PosterDownloadButton({ posterUrl, movieTitle, className = "" }: PosterDownloadButtonProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  const { toast } = useToast();

  if (!posterUrl) return null;

  const getHighResUrl = (quality: string) => {
    // Extract the path from the poster URL
    const pathMatch = posterUrl.match(/\/([^/]+)$/);
    if (!pathMatch) return posterUrl;
    const filename = pathMatch[1];
    return `https://image.tmdb.org/t/p/${quality}/${filename}`;
  };

  const handleDownload = async (quality: typeof QUALITY_OPTIONS[number]) => {
    setDownloading(quality.key);
    try {
      const url = getHighResUrl(quality.key);
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${movieTitle.replace(/[^a-zA-Z0-9]/g, "_")}_${quality.label.replace(/\s/g, "")}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      setDownloaded(true);
      setShowOptions(false);
      setTimeout(() => setDownloaded(false), 2000);
      toast({ title: `${quality.label} poster downloaded!` });
    } catch {
      toast({ title: "Download failed", description: "Try a lower quality", variant: "destructive" });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main circular glassmorphic button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowOptions(!showOptions)}
        className="w-10 h-10 rounded-full flex items-center justify-center
          bg-background/40 backdrop-blur-xl
          border border-white/20
          shadow-[0_4px_20px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.15)]
          hover:bg-background/60 hover:border-white/30
          transition-all duration-200 text-foreground"
        title="Download Poster"
      >
        {downloaded ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Download className="w-4 h-4" />
        )}
      </motion.button>

      {/* Quality options popover */}
      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 right-0 z-50
              bg-card/95 backdrop-blur-xl border border-border
              rounded-xl shadow-2xl overflow-hidden min-w-[140px]"
          >
            {QUALITY_OPTIONS.map((option) => (
              <button
                key={option.key}
                onClick={() => handleDownload(option)}
                disabled={downloading !== null}
                className="w-full flex items-center justify-between gap-3 px-4 py-2.5
                  text-sm hover:bg-muted transition-colors text-left
                  disabled:opacity-50 first:rounded-t-xl last:rounded-b-xl"
              >
                <span className="font-medium">{option.label}</span>
                <span className="text-xs text-muted-foreground">{option.size}</span>
                {downloading === option.key && (
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click-away handler */}
      {showOptions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  );
}
