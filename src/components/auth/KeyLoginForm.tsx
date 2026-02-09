import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Key, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Key Input */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Key className="w-3.5 h-3.5" />
          Secret Key
        </label>
        <div className="relative">
          <Input
            type={showKey ? "text" : "password"}
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            placeholder="Paste your secret key"
            className="h-12 font-mono tracking-wider pr-12 rounded-xl bg-secondary/50 border-border"
            autoComplete="off"
            spellCheck={false}
            disabled={isLoading}
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Remember Me */}
      <div className="flex items-center gap-3">
        <Checkbox
          id="remember-me"
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked === true)}
        />
        <label htmlFor="remember-me" className="text-sm text-muted-foreground cursor-pointer">
          Remember me for 30 days
        </label>
      </div>

      {/* Error */}
      {(error || validationError) && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
        >
          {error || validationError}
        </motion.div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 rounded-xl gap-2 text-base font-medium"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            Sign In
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>

      {/* Switch */}
      <p className="text-center text-sm text-muted-foreground pt-2">
        Don't have a key?{" "}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-primary hover:underline font-medium"
        >
          Create Account
        </button>
      </p>
    </form>
  );
}
