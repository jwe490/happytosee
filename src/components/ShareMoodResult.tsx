import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Download, Copy, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import { toast } from "sonner";

interface ShareMoodResultProps {
  mood: string;
  moodEmoji: string;
  topMovies: Array<{ title: string; year?: number }>;
  onClose?: () => void;
}

const ShareMoodResult = ({ mood, moodEmoji, topMovies, onClose }: ShareMoodResultProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const shareText = `I'm in a ${moodEmoji} ${mood} mood — MoodFlix recommended these movies for me! 🎬🍿\n\nCheck it out at MoodFlix.com`;

  const generateImage = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
        useCORS: true,
      });

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, "image/png");
      });
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNativeShare = async () => {
    const imageBlob = await generateImage();
    if (!imageBlob) return;

    const filesArray = [
      new File([imageBlob], "moodflix-recommendation.png", {
        type: "image/png",
      }),
    ];

    if (navigator.share && navigator.canShare({ files: filesArray })) {
      try {
        await navigator.share({
          title: "My MoodFlix Recommendation",
          text: shareText,
          files: filesArray,
        });
        toast.success("Shared successfully! 🎉");
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Error sharing:", error);
          toast.error("Failed to share");
        }
      }
    } else {
      setShowShareMenu(true);
    }
  };

  const handleDownload = async () => {
    const imageBlob = await generateImage();
    if (!imageBlob) return;

    const url = URL.createObjectURL(imageBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "moodflix-recommendation.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Image downloaded! 📥");
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success("Caption copied! 📋");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const handlePlatformShare = async (platform: "whatsapp" | "twitter" | "instagram") => {
    const imageBlob = await generateImage();
    if (!imageBlob) return;

    const movieList = topMovies
      .slice(0, 3)
      .map((m, i) => `${i + 1}. ${m.title}`)
      .join("\n");

    const fullText = `${moodEmoji} ${mood.toUpperCase()} MOOD\n\n${movieList}\n\nFind your perfect movie at MoodFlix.com 🎬`;

    switch (platform) {
      case "whatsapp":
        const whatsappText = encodeURIComponent(fullText);
        window.open(`https://wa.me/?text=${whatsappText}`, "_blank");
        break;

      case "twitter":
        const tweetText = encodeURIComponent(
          `I'm feeling ${moodEmoji} ${mood} today!\n\nMoodFlix recommended:\n${movieList}\n\n✨ Find your perfect movie match at MoodFlix.com`
        );
        window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, "_blank");
        break;

      case "instagram":
        toast.success("Downloading image for Instagram Stories! 📸", {
          description: "Save the image and share it on Instagram Stories",
        });
        handleDownload();
        break;
    }
  };

  const top3Movies = topMovies.slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={handleNativeShare}
            disabled={isGenerating}
            size="lg"
            className="group rounded-full gap-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Share2 className="w-5 h-5 transition-transform group-hover:scale-110" />
            {isGenerating ? "Generating..." : "Share Your Mood Result"}
          </Button>
        </motion.div>
      </div>

      <AnimatePresence>
        {showShareMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowShareMenu(false)}
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              exit={{ y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-card rounded-2xl p-6 shadow-2xl border border-border max-w-md w-full"
            >
              <button
                onClick={() => setShowShareMenu(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-xl font-display font-bold mb-4 text-center">
                Share Your Result
              </h3>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <button
                  onClick={() => handlePlatformShare("whatsapp")}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-2xl">
                    💬
                  </div>
                  <span className="text-xs font-medium">WhatsApp</span>
                </button>

                <button
                  onClick={() => handlePlatformShare("instagram")}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-2xl">
                    📸
                  </div>
                  <span className="text-xs font-medium">Instagram</span>
                </button>

                <button
                  onClick={() => handlePlatformShare("twitter")}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-2xl">
                    𝕏
                  </div>
                  <span className="text-xs font-medium">X</span>
                </button>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="w-full gap-2"
                  disabled={isGenerating}
                >
                  <Download className="w-4 h-4" />
                  Download Image
                </Button>

                <Button
                  onClick={handleCopyText}
                  variant="outline"
                  className="w-full gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Caption
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={cardRef}
        className="absolute -left-[9999px] w-[1080px] h-[1080px] bg-white flex flex-col items-center justify-center p-16"
        style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
      >
        <div className="text-center space-y-12">
          <div className="space-y-4">
            <div className="text-9xl">{moodEmoji}</div>
            <h2 className="text-6xl font-bold text-gray-900 uppercase tracking-wide">
              {mood} Mood
            </h2>
          </div>

          <div className="space-y-6">
            <p className="text-3xl text-gray-600 font-medium">
              Recommended for me:
            </p>
            <div className="space-y-4">
              {top3Movies.map((movie, index) => (
                <div
                  key={index}
                  className="text-4xl font-bold text-gray-900 px-8 py-4 bg-gray-100 rounded-2xl"
                >
                  {index + 1}. {movie.title}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-8 border-t-4 border-gray-200">
            <div className="text-5xl font-black text-gray-900">
              🎬 MoodFlix
            </div>
            <p className="text-3xl text-gray-600 font-medium">
              Find your perfect movie match
            </p>
            <p className="text-2xl text-gray-500">
              moodflix.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareMoodResult;
