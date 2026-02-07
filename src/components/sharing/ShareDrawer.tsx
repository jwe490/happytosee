import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Link2, Check, Download, Send } from "lucide-react";
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
  color: string;
  action: () => void;
}

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
  const { toast } = useToast();

  const url = shareUrl || (typeof window !== "undefined" ? window.location.href : "");
  const text = shareText || `Check out ${title}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleDownload = async () => {
    if (!onImageShare) return;
    setIsProcessing(true);
    try {
      const blob = await onImageShare();
      if (blob) {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = "my-movie-mood.png";
        a.click();
        URL.revokeObjectURL(blobUrl);
        toast({ title: "Downloaded!" });
      }
    } catch {
      toast({ title: "Download failed", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        onClose();
      } catch {
        // User cancelled
      }
    }
  };

  const shareOptions: ShareOption[] = [
    {
      id: "copy",
      icon: copied ? <Check className="w-5 h-5" /> : <Link2 className="w-5 h-5" />,
      label: copied ? "Copied!" : "Copy Link",
      color: "bg-muted",
      action: handleCopy,
    },
    ...(onImageShare ? [{
      id: "download",
      icon: <Download className="w-5 h-5" />,
      label: "Save",
      color: "bg-muted",
      action: handleDownload,
    }] : []),
    {
      id: "twitter",
      icon: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
      label: "X",
      color: "bg-foreground/10",
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank", "width=550,height=420"),
    },
    {
      id: "whatsapp",
      icon: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>,
      label: "WhatsApp",
      color: "bg-green-500/10 text-green-600 dark:text-green-400",
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, "_blank"),
    },
    {
      id: "telegram",
      icon: <Send className="w-5 h-5" />,
      label: "Telegram",
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      action: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank"),
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 350 }}
            className="fixed inset-x-0 bottom-0 z-50"
          >
            <div className="bg-card border-t border-border rounded-t-2xl">
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-8 h-1 rounded-full bg-muted-foreground/20" />
              </div>

              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              <div className="px-5 pb-6 pt-1">
                {/* Title */}
                <div className="text-center mb-5">
                  <h2 className="font-display text-base font-semibold truncate">{title}</h2>
                  {subtitle && (
                    <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
                  )}
                </div>

                {/* Native share (mobile) */}
                {typeof navigator !== "undefined" && navigator.share && (
                  <button
                    onClick={handleNativeShare}
                    disabled={isProcessing}
                    className="w-full py-3 mb-4 rounded-xl bg-primary text-primary-foreground font-medium
                      active:scale-[0.98] transition-transform
                      flex items-center justify-center gap-2 text-sm"
                  >
                    <Send className="w-4 h-4" />
                    Share
                  </button>
                )}

                {/* Options row */}
                <div className="flex justify-center gap-5">
                  {shareOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={option.action}
                      disabled={isProcessing && option.id === "download"}
                      className="flex flex-col items-center gap-1.5 group"
                    >
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center
                        transition-transform duration-150 active:scale-90
                        ${option.color}
                        ${option.id === "copy" && copied ? "bg-green-500/10 text-green-500" : ""}
                      `}>
                        {option.icon}
                      </div>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {option.label}
                      </span>
                    </button>
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
