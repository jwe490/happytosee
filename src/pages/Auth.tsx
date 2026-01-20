import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Film, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PersonaForm, PersonaData } from "@/components/auth/PersonaForm";
import { KeyRevealCard } from "@/components/auth/KeyRevealCard";
import { KeyLoginForm } from "@/components/auth/KeyLoginForm";
import { useKeyAuth } from "@/hooks/useKeyAuth";
import { generateSecretKey, hashKey } from "@/lib/keyAuth";
import { toast } from "sonner";

type AuthStep = "choice" | "signup-persona" | "signup-key" | "login";

const Auth = () => {
  const [step, setStep] = useState<AuthStep>("choice");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [personaData, setPersonaData] = useState<PersonaData | null>(null);
  
  const { signUp, signIn, isAuthenticated, isLoading } = useKeyAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect authenticated users
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Get the intended destination
      const from = (location.state as any)?.from?.pathname;
      
      // If coming from admin, go to admin dashboard
      if (from?.startsWith("/admin")) {
        navigate("/admin/dashboard", { replace: true });
        return;
      }
      
      // Otherwise go to dashboard
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  const handlePersonaSubmit = async (data: PersonaData) => {
    setIsSubmitting(true);
    try {
      const key = await generateSecretKey();
      setGeneratedKey(key);
      setPersonaData(data);
      setStep("signup-key");
    } catch (err) {
      toast.error("Failed to generate key. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyConfirm = async () => {
    if (!personaData || !generatedKey) return;
    
    setIsSubmitting(true);
    try {
      const keyHash = await hashKey(generatedKey);
      const { error } = await signUp(keyHash, {
        display_name: personaData.displayName,
        date_of_birth: personaData.dateOfBirth,
        gender: personaData.gender,
        purpose: personaData.purpose,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      // Auto login after signup
      const loginResult = await signIn(generatedKey, true);
      if (loginResult.error) {
        toast.success("Account created! Please login with your key.");
        setStep("login");
      } else {
        toast.success("Welcome to MoodFlix! 🎬");
        // Navigation handled by useEffect
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (key: string, rememberMe: boolean) => {
    setLoginError("");
    setIsSubmitting(true);
    
    try {
      const { error } = await signIn(key, rememberMe);
      
      if (error) {
        setLoginError(error.message);
        setIsSubmitting(false);
        return;
      }
      
      // Success - navigation handled by useEffect when isAuthenticated changes
      toast.success("Welcome back! 🎬");
    } catch (err: any) {
      setLoginError(err.message || "Login failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render auth page if already authenticated (will redirect via useEffect)
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 mb-2">
              <Film className="w-10 h-10 text-primary" />
              <span className="text-3xl font-bold tracking-tight">MoodFlix</span>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {step === "choice" && (
              <motion.div
                key="choice"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass rounded-2xl p-8 text-center"
              >
                <h2 className="text-xl font-semibold mb-2">Secure Key Authentication</h2>
                <p className="text-muted-foreground mb-6">
                  No email, no password. Just one secret key.
                </p>
                <div className="space-y-3">
                  <Button onClick={() => setStep("signup-persona")} className="w-full h-12">
                    Create New Vault
                  </Button>
                  <Button onClick={() => setStep("login")} variant="outline" className="w-full h-12">
                    I Have a Key
                  </Button>
                </div>
                <div className="mt-6 pt-6 border-t border-border">
                  <Button variant="ghost" onClick={() => navigate("/")} className="text-muted-foreground">
                    Continue as Guest
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "signup-persona" && (
              <PersonaForm key="persona" onSubmit={handlePersonaSubmit} isLoading={isSubmitting} />
            )}

            {step === "signup-key" && generatedKey && personaData && (
              <KeyRevealCard
                key="reveal"
                secretKey={generatedKey}
                displayName={personaData.displayName}
                onConfirm={handleKeyConfirm}
                isLoading={isSubmitting}
              />
            )}

            {step === "login" && (
              <KeyLoginForm
                key="login"
                onSubmit={handleLogin}
                onSwitchToSignup={() => setStep("signup-persona")}
                isLoading={isSubmitting}
                error={loginError}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Auth;
