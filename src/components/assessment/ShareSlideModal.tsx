import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { X, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";

interface ShareSlideModalProps {
  slideElement: React.ReactNode;
  slideName: string;
  onClose: () => void;
}

export const ShareSlideModal = ({ slideElement, slideName, onClose }: ShareSlideModalProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const slideRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const generateImage = async () => {
    if (!slideRef.current) return null;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(slideRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        width: 1080,
        height: 1400,
        windowWidth: 1080,
        windowHeight: 1400,
      });

      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Failed to generate image:", error);
      toast({
        title: "Error",
        description: "Failed to generate image",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const imageData = await generateImage();
    if (!imageData) return;

    const link = document.createElement("a");
    link.download = `moodflix-${slideName}.png`;
    link.href = imageData;
    link.click();

    toast({
      title: "Downloaded!",
      description: "Image saved to your device",
    });
  };

  const handleShare = async () => {
    const imageData = await generateImage();
    if (!imageData) return;

    try {
      const blob = await (await fetch(imageData)).blob();
      const file = new File([blob], `moodflix-${slideName}.png`, { type: "image/png" });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "My Movie Mood",
          text: "Check out my movie personality!",
        });
      } else {
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob,
          }),
        ]);
        toast({
          title: "Copied to clipboard!",
          description: "Paste to share on social media",
        });
      }
    } catch (error) {
      console.error("Share failed:", error);
      await handleDownload();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto space-y-6"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold">Share This Slide</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div
          ref={slideRef}
          className="w-full aspect-[1080/1400] bg-gray-100 rounded-2xl overflow-hidden"
          style={{ transform: "scale(1)" }}
        >
          {slideElement}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            size="lg"
            variant="outline"
            onClick={handleDownload}
            disabled={isGenerating}
            className="rounded-full h-12"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? "Generating..." : "Download PNG"}
          </Button>

          <Button
            size="lg"
            onClick={handleShare}
            disabled={isGenerating}
            className="rounded-full h-12"
          >
            <Share2 className="w-4 h-4 mr-2" />
            {isGenerating ? "Generating..." : "Share"}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              window.open(
                `https://www.instagram.com/create/story`,
                "_blank"
              );
            }}
            className="rounded-full"
          >
            Instagram
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              window.open(
                `https://twitter.com/intent/tweet?text=Check out my movie mood!`,
                "_blank"
              );
            }}
            className="rounded-full"
          >
            Twitter
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              window.open(
                `https://wa.me/?text=Check out my movie mood!`,
                "_blank"
              );
            }}
            className="rounded-full"
          >
            WhatsApp
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
