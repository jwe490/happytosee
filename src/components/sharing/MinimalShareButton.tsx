import { useState } from "react";
import { motion } from "framer-motion";
import { Share2 } from "lucide-react";
import { ShareDrawer } from "./ShareDrawer";

interface MinimalShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  onImageShare?: () => Promise<Blob | null>;
  variant?: "default" | "outline" | "minimal";
  className?: string;
}

export const MinimalShareButton = ({
  title,
  text,
  url,
  onImageShare,
  variant = "default",
  className = "",
}: MinimalShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const baseStyles = "flex items-center justify-center gap-2 transition-all duration-200 active:scale-95";
  
  const variantStyles = {
    default: "px-5 py-2.5 rounded-full bg-accent text-accent-foreground font-medium hover:bg-accent/90 min-h-[48px]",
    outline: "px-5 py-2.5 rounded-full border border-border bg-transparent hover:bg-muted font-medium min-h-[48px]",
    minimal: "p-2.5 rounded-full hover:bg-muted/80 min-h-[44px] min-w-[44px]",
  };

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      >
        <Share2 className={variant === "minimal" ? "w-4 h-4" : "w-4 h-4"} />
        {variant !== "minimal" && <span>Share</span>}
      </motion.button>

      <ShareDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        subtitle={text}
        shareUrl={url}
        shareText={text}
        onImageShare={onImageShare}
      />
    </>
  );
};
