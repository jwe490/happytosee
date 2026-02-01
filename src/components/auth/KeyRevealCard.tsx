import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Download, Check, AlertTriangle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { VaultIllustration } from "./VaultIllustration";
import { downloadKeyFile, formatKeyForDisplay } from "@/lib/keyAuth";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface KeyRevealCardProps {
  secretKey: string;
  displayName: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function KeyRevealCard({ secretKey, displayName, onConfirm, isLoading }: KeyRevealCardProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [hasConfirmedSave, setHasConfirmedSave] = useState(false);
  
  const canProceed = hasCopied || hasDownloaded || hasConfirmedSave;
  
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['hsl(var(--foreground))', 'hsl(var(--muted-foreground))', 'hsl(var(--primary))'],
    });
  };
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(secretKey);
      setHasCopied(true);
      triggerConfetti();
      toast.success("Key copied to clipboard!");
    } catch {
      toast.error("Failed to copy. Please select and copy manually.");
    }
  };
  
  const handleDownload = () => {
    downloadKeyFile(secretKey, displayName);
    setHasDownloaded(true);
    triggerConfetti();
    toast.success("Key file downloaded!");
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      {/* Header */}
      <div className="text-center mb-6 px-6 pt-6">
        <VaultIllustration isUnlocked={true} />
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-semibold mt-4 text-foreground tracking-tight"
        >
          Your Vault is Ready!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground mt-2 text-sm"
        >
          Welcome, {displayName}. Save your secret key now.
        </motion.p>
      </div>
      
      {/* Key Display */}
      <div className="px-6 pb-6 space-y-4">
        <div className="rounded-xl p-4 bg-secondary/50 border border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Your Secret Access Key
          </p>
          
          <div className="bg-background/80 rounded-lg p-4 border border-border mb-4">
            <code className="font-mono text-lg md:text-xl tracking-wider text-foreground break-all select-all">
              {formatKeyForDisplay(secretKey)}
            </code>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleCopy}
              variant={hasCopied ? "default" : "outline"}
              className={`flex-1 gap-2 ${hasCopied 
                ? "bg-foreground text-background hover:bg-foreground/90" 
                : "border-border bg-transparent text-foreground hover:bg-secondary"
              }`}
            >
              {hasCopied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Key
                </>
              )}
            </Button>
            
            <Button
              onClick={handleDownload}
              variant={hasDownloaded ? "default" : "outline"}
              className={`flex-1 gap-2 ${hasDownloaded 
                ? "bg-foreground text-background hover:bg-foreground/90" 
                : "border-border bg-transparent text-foreground hover:bg-secondary"
              }`}
            >
              {hasDownloaded ? (
                <>
                  <Check className="w-4 h-4" />
                  Downloaded!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Warning */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
        >
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Important Security Notice</p>
            <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">
              This key is your only way back. We cannot recover it for you. Store it somewhere safe!
            </p>
          </div>
        </motion.div>
        
        {/* Confirmation Checkbox */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-3"
        >
          <Checkbox
            id="confirm-save"
            checked={hasConfirmedSave}
            onCheckedChange={(checked) => setHasConfirmedSave(checked === true)}
            className="border-border data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
          />
          <label
            htmlFor="confirm-save"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            I have saved my secret key in a secure location
          </label>
        </motion.div>
        
        {/* Continue Button */}
        <AnimatePresence>
          {canProceed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Button
                onClick={onConfirm}
                disabled={isLoading}
                className="w-full h-12 gap-2 text-base font-medium bg-foreground text-background hover:bg-foreground/90 transition-all duration-200"
              >
                {isLoading ? (
                  "Creating your vault..."
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Enter MoodFlix
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
