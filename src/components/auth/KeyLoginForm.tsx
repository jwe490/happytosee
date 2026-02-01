import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Key, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { InteractiveLoginIllustration } from "./InteractiveLoginIllustration";

interface KeyLoginFormProps {
  onSubmit: (key: string, rememberMe: boolean) => void;
  onSwitchToSignup: () => void;
  isLoading?: boolean;
  error?: string;
}

export function KeyLoginForm({ onSubmit, onSwitchToSignup, isLoading, error }: KeyLoginFormProps) {
  const [secretKey, setSecretKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Track typing state with debounce
  useEffect(() => {
    if (secretKey.length > 0) {
      setIsTyping(true);
      const timeout = setTimeout(() => setIsTyping(false), 500);
      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
    }
  }, [secretKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    const cleanedKey = secretKey.trim();
    
    if (!cleanedKey) {
      setValidationError("Please enter your secret key");
      return;
    }

    onSubmit(cleanedKey, rememberMe);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      {/* Header with Interactive Illustration */}
      <div className="text-center mb-8 px-6 pt-6">
        <InteractiveLoginIllustration
          isTyping={isTyping}
          hasError={!!(error || validationError)}
          isSuccess={showSuccess}
          passwordVisible={showKey}
          characterCount={secretKey.length}
        />
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-semibold mt-4 text-foreground tracking-tight"
        >
          Welcome Back
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground mt-2 text-sm"
        >
          Enter your secret key to unlock your vault
        </motion.p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
        {/* Secret Key Input */}
        <div className="space-y-2">
          <Label htmlFor="secretKey" className="flex items-center gap-2 text-muted-foreground">
            <Key className="w-4 h-4" />
            Secret Access Key
          </Label>
          <div className="relative">
            <Input
              id="secretKey"
              type={showKey ? "text" : "password"}
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Enter your secret key"
              className="h-12 font-mono tracking-wider pr-12 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground focus:border-foreground/30 focus:ring-foreground/20"
              autoComplete="off"
              spellCheck={false}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label={showKey ? "Hide key" : "Show key"}
            >
              {showKey ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center gap-3">
          <Checkbox
            id="remember-me"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
            className="border-border data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
          />
          <label
            htmlFor="remember-me"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Remember me for 30 days
          </label>
        </div>

        {/* Error */}
        {(error || validationError) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
          >
            {error || validationError}
          </motion.div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 gap-2 text-base font-medium bg-foreground text-background hover:bg-foreground/90 transition-all duration-200"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Unlocking Vault...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Unlock My Vault
            </>
          )}
        </Button>
      </form>

      {/* Switch to Signup */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="px-6 pb-6 text-center"
      >
        <p className="text-sm text-muted-foreground">
          Don't have a key yet?{" "}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-foreground hover:underline font-medium transition-colors"
          >
            Create Your Vault
          </button>
        </p>
      </motion.div>
    </motion.div>
  );
}
