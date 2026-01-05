import { useState } from "react";
import { Share2, Copy, Check, Twitter, MessageCircle, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost" | "secondary";
}

export function ShareButton({ title, text, url, size = "icon", variant = "ghost" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const shareText = text || `Check out ${title}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: "Link copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({ title: "Failed to copy link", variant: "destructive" });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
        setIsOpen(false);
      } catch (error) {
        // User cancelled share
      }
    }
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, "_blank", "width=550,height=420");
    setIsOpen(false);
  };

  const shareToWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.open(whatsappUrl, "_blank");
    setIsOpen(false);
  };

  // Use native share on mobile if available
  if (typeof navigator !== "undefined" && navigator.share && size === "icon") {
    return (
      <Button variant={variant} size={size} onClick={handleNativeShare} className="rounded-full">
        <Share2 className="w-4 h-4" />
        <span className="sr-only">Share</span>
      </Button>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant={variant} size={size} className="rounded-full gap-2 active:scale-95 transition-transform">
          <Share2 className="w-4 h-4" />
          {size !== "icon" && <span>Share</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <div className="space-y-1">
          <button
            onClick={shareToTwitter}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
          >
            <Twitter className="w-4 h-4" />
            <span className="text-sm">Share on Twitter</span>
          </button>
          
          <button
            onClick={shareToWhatsApp}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">Share on WhatsApp</span>
          </button>
          
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Link2 className="w-4 h-4" />
            )}
            <span className="text-sm">{copied ? "Copied!" : "Copy link"}</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
