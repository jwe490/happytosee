import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Link2, Check, Download, Twitter, MessageCircle, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  shareUrl?: string;
  shareText?: string;
  onImageShare?: () => Promise<Blob | null>;
}

interface ShareOption {
  id: string;
  icon: React.ReactNode;
  label: string;
  action: () => void;
}

// Animated line illustration component
const LineIllustration = ({ type }: { type: "share" | "copy" | "success" }) => {
  const paths = {
    share: (
      <motion.svg 
        viewBox="0 0 120 80" 
        className="w-full h-full"
        initial="hidden"
        animate="visible"
      >
        {/* Radiating lines from center */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <motion.line
            key={angle}
            x1="60"
            y1="40"
            x2={60 + Math.cos(angle * Math.PI / 180) * 35}
            y2={40 + Math.sin(angle * Math.PI / 180) * 25}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: "easeOut" }}
          />
        ))}
        {/* Center circle */}
        <motion.circle
          cx="60"
          cy="40"
          r="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3, type: "spring" }}
        />
        {/* Floating dots */}
        {[
          { x: 25, y: 20, delay: 0.6 },
          { x: 95, y: 25, delay: 0.7 },
          { x: 30, y: 60, delay: 0.8 },
          { x: 90, y: 55, delay: 0.9 },
        ].map((dot, i) => (
          <motion.circle
            key={i}
            cx={dot.x}
            cy={dot.y}
            r="3"
            fill="currentColor"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.4 }}
            transition={{ delay: dot.delay, duration: 0.2, type: "spring" }}
          />
        ))}
      </motion.svg>
    ),
    copy: (
      <motion.svg 
        viewBox="0 0 120 80" 
        className="w-full h-full"
        initial="hidden"
        animate="visible"
      >
        {/* Document outline */}
        <motion.rect
          x="35"
          y="15"
          width="35"
          height="45"
          rx="4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        {/* Copied document */}
        <motion.rect
          x="50"
          y="25"
          width="35"
          height="45"
          rx="4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          initial={{ pathLength: 0, x: 35 }}
          animate={{ pathLength: 1, x: 50 }}
          transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
        />
        {/* Lines on document */}
        {[30, 38, 46].map((y, i) => (
          <motion.line
            key={y}
            x1="40"
            y1={y}
            x2="60"
            y2={y}
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.6 + i * 0.1 }}
          />
        ))}
      </motion.svg>
    ),
    success: (
      <motion.svg 
        viewBox="0 0 120 80" 
        className="w-full h-full"
        initial="hidden"
        animate="visible"
      >
        {/* Circle */}
        <motion.circle
          cx="60"
          cy="40"
          r="25"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
        {/* Checkmark */}
        <motion.path
          d="M45 40 L55 50 L75 30"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.3, duration: 0.3, ease: "easeOut" }}
        />
        {/* Celebration particles */}
        {[
          { x1: 60, y1: 10, x2: 60, y2: 2, delay: 0.5 },
          { x1: 85, y1: 20, x2: 92, y2: 14, delay: 0.55 },
          { x1: 90, y1: 40, x2: 98, y2: 40, delay: 0.6 },
          { x1: 85, y1: 60, x2: 92, y2: 66, delay: 0.65 },
          { x1: 35, y1: 20, x2: 28, y2: 14, delay: 0.7 },
          { x1: 30, y1: 40, x2: 22, y2: 40, delay: 0.75 },
        ].map((line, i) => (
          <motion.line
            key={i}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: 0.6, pathLength: 1 }}
            transition={{ delay: line.delay, duration: 0.2 }}
          />
        ))}
      </motion.svg>
    ),
  };

  return (
    <div className="w-24 h-16 text-accent">
      {paths[type]}
    </div>
  );
};

export const ShareDrawer = ({
  isOpen,
  onClose,
  title,
  subtitle,
  shareUrl,
  shareText,
  onImageShare,
}: ShareDrawerProps) => {
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const { toast } = useToast();

  const url = shareUrl || (typeof window !== "undefined" ? window.location.href : "");
  const text = shareText || `Check out ${title}`;

  const handleCopy = async () => {
    setActiveAction("copy");
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setActiveAction(null);
      }, 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
      setActiveAction(null);
    }
  };

  const handleDownload = async () => {
    if (!onImageShare) return;
    setIsProcessing(true);
    setActiveAction("download");
    
    try {
      const blob = await onImageShare();
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "my-movie-mood.png";
        a.click();
        URL.revokeObjectURL(url);
        toast({ title: "Downloaded!" });
      }
    } catch {
      toast({ title: "Download failed", variant: "destructive" });
    } finally {
      setIsProcessing(false);
      setActiveAction(null);
    }
  };

  const handleNativeShare = async () => {
    setActiveAction("native");
    
    if (navigator.share) {
      try {
        if (onImageShare) {
          const blob = await onImageShare();
          if (blob) {
            const file = new File([blob], "my-movie-mood.png", { type: "image/png" });
            await navigator.share({ title, text, files: [file] });
          }
        } else {
          await navigator.share({ title, text, url });
        }
        onClose();
      } catch {
        // User cancelled
      }
    }
    setActiveAction(null);
  };

  const handleTwitter = () => {
    setActiveAction("twitter");
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, "_blank", "width=550,height=420");
    setTimeout(() => setActiveAction(null), 500);
  };

  const handleWhatsApp = () => {
    setActiveAction("whatsapp");
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
    window.open(whatsappUrl, "_blank");
    setTimeout(() => setActiveAction(null), 500);
  };

  const handleTelegram = () => {
    setActiveAction("telegram");
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(telegramUrl, "_blank");
    setTimeout(() => setActiveAction(null), 500);
  };

  const shareOptions: ShareOption[] = [
    {
      id: "copy",
      icon: copied ? <Check className="w-5 h-5" /> : <Link2 className="w-5 h-5" />,
      label: copied ? "Copied!" : "Copy link",
      action: handleCopy,
    },
    ...(onImageShare ? [{
      id: "download",
      icon: <Download className="w-5 h-5" />,
      label: "Save image",
      action: handleDownload,
    }] : []),
    {
      id: "twitter",
      icon: <Twitter className="w-5 h-5" />,
      label: "Twitter",
      action: handleTwitter,
    },
    {
      id: "whatsapp",
      icon: <MessageCircle className="w-5 h-5" />,
      label: "WhatsApp",
      action: handleWhatsApp,
    },
    {
      id: "telegram",
      icon: <Send className="w-5 h-5" />,
      label: "Telegram",
      action: handleTelegram,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh]"
          >
            <div className="bg-card border-t border-border rounded-t-3xl overflow-hidden">
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              <div className="px-6 pb-8 pt-2">
                {/* Header with illustration */}
                <div className="flex flex-col items-center text-center mb-8">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                  >
                    <LineIllustration type={copied ? "success" : "share"} />
                  </motion.div>
                  
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="font-display text-xl font-semibold mt-3"
                  >
                    {title}
                  </motion.h2>
                  
                  {subtitle && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-sm text-muted-foreground mt-1"
                    >
                      {subtitle}
                    </motion.p>
                  )}
                </div>

                {/* Native share button (mobile) */}
                {typeof navigator !== "undefined" && navigator.share && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    onClick={handleNativeShare}
                    disabled={isProcessing}
                    className="w-full py-4 mb-4 rounded-2xl bg-accent text-accent-foreground font-medium
                      hover:bg-accent/90 active:scale-[0.98] transition-all duration-200
                      flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    Share
                  </motion.button>
                )}

                {/* Share options grid */}
                <div className="grid grid-cols-4 gap-3">
                  {shareOptions.map((option, index) => (
                    <motion.button
                      key={option.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      onClick={option.action}
                      disabled={isProcessing && option.id === "download"}
                      className={`
                        flex flex-col items-center gap-2 p-4 rounded-2xl
                        transition-all duration-200 active:scale-95
                        ${activeAction === option.id 
                          ? "bg-accent/10 text-accent" 
                          : "hover:bg-muted text-foreground"
                        }
                        ${option.id === "copy" && copied ? "text-accent" : ""}
                        disabled:opacity-50
                      `}
                    >
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center
                        transition-colors duration-200
                        ${activeAction === option.id || (option.id === "copy" && copied)
                          ? "bg-accent/20" 
                          : "bg-muted"
                        }
                      `}>
                        {option.icon}
                      </div>
                      <span className="text-xs font-medium">{option.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
