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

    // No client-side format validation - let backend verify the key
    onSubmit(cleanedKey, rememberMe);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Header with Interactive Illustration */}
      <div className="text-center mb-8">
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
          className="text-2xl font-semibold mt-4 text-neutral-100 tracking-tight"
        >
          Welcome Back
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-neutral-500 mt-2 text-sm"
        >
          Enter your secret key to unlock your vault
        </motion.p>
      </div>

      {/* Form - noir glass style */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onSubmit={handleSubmit}
        className="relative rounded-2xl p-6 space-y-5 border border-neutral-800/60"
        style={{
          background: "linear-gradient(180deg, rgba(20,20,20,0.9) 0%, rgba(10,10,10,0.95) 100%)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Subtle inner glow */}
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at top, hsl(var(--primary) / 0.04) 0%, transparent 50%)",
          }}
        />
        
        <div className="relative z-10 space-y-5">
          {/* Secret Key Input */}
          <div className="space-y-2">
            <Label htmlFor="secretKey" className="flex items-center gap-2 text-neutral-400">
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
                className="h-12 font-mono tracking-wider pr-12 bg-neutral-900/50 border-neutral-700 text-neutral-100 placeholder:text-neutral-600 focus:border-neutral-500 focus:ring-neutral-500"
                autoComplete="off"
                spellCheck={false}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors p-1"
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
              className="border-neutral-600 data-[state=checked]:bg-neutral-100 data-[state=checked]:border-neutral-100"
            />
            <label
              htmlFor="remember-me"
              className="text-sm text-neutral-500 cursor-pointer"
            >
              Remember me for 30 days
            </label>
          </div>

          {/* Error */}
          {(error || validationError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-red-950/30 border border-red-900/40 text-red-400 text-sm"
            >
              {error || validationError}
            </motion.div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 gap-2 text-base font-medium bg-neutral-100 text-neutral-900 hover:bg-white transition-all duration-200"
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
        </div>
      </motion.form>

      {/* Switch to Signup */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center"
      >
        <p className="text-sm text-neutral-500">
          Don't have a key yet?{" "}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-neutral-300 hover:text-white hover:underline font-medium transition-colors"
          >
            Create Your Vault
          </button>
        </p>
      </motion.div>
    </motion.div>
  );
}
