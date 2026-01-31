import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, Sparkles, KeyRound, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PersonaForm, PersonaData } from "@/components/auth/PersonaForm";
import { KeyRevealCard } from "@/components/auth/KeyRevealCard";
import { KeyLoginForm } from "@/components/auth/KeyLoginForm";
import { useKeyAuth } from "@/hooks/useKeyAuth";
import { generateSecretKey, hashKey } from "@/lib/keyAuth";
import { toast } from "sonner";
import logo from "@/assets/logo.svg";

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
      const from = (location.state as any)?.from?.pathname;
      
      if (from?.startsWith("/admin")) {
        navigate("/admin/dashboard", { replace: true });
        return;
      }
      
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

      const loginResult = await signIn(generatedKey, true);
      if (loginResult.error) {
        toast.success("Account created! Please login with your key.");
        setStep("login");
      } else {
        toast.success("Welcome to MoodFlix! 🎬");
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
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>
      
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo & Brand */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 sm:mb-8"
          >
            <motion.div 
              className="inline-flex items-center justify-center mb-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img 
                src={logo} 
                alt="MoodFlix" 
                className="h-14 sm:h-16 md:h-20 w-auto dark:invert"
              />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-sm sm:text-base"
            >
              Your personal movie vault awaits
            </motion.p>
          </motion.div>

          <AnimatePresence mode="wait">
            {step === "choice" && (
              <motion.div
                key="choice"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Main auth card */}
                <div className="glass rounded-3xl p-6 sm:p-8 border border-border/50 shadow-2xl backdrop-blur-xl">
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <KeyRound className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                      Key-Based Auth
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      No email, no password. Just one secret key.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      onClick={() => setStep("signup-persona")} 
                      className="w-full h-12 sm:h-14 gap-2 rounded-xl text-base font-semibold"
                      size="lg"
                    >
                      <Sparkles className="w-5 h-5" />
                      Create New Vault
                    </Button>
                    <Button 
                      onClick={() => setStep("login")} 
                      variant="outline" 
                      className="w-full h-12 sm:h-14 gap-2 rounded-xl text-base font-semibold border-2"
                      size="lg"
                    >
                      <Shield className="w-5 h-5" />
                      I Have a Key
                    </Button>
                  </div>

                  {/* Features grid */}
                  <div className="mt-6 pt-6 border-t border-border/50">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      {[
                        { icon: "🔐", label: "Secure" },
                        { icon: "🎭", label: "Anonymous" },
                        { icon: "⚡", label: "Fast" },
                      ].map((feature) => (
                        <div key={feature.label} className="py-2">
                          <div className="text-xl sm:text-2xl mb-1">{feature.icon}</div>
                          <div className="text-xs text-muted-foreground">{feature.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Guest option */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate("/")} 
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Continue as Guest
                  </Button>
                </motion.div>
              </motion.div>
            )}

            {step === "signup-persona" && (
              <PersonaForm 
                key="persona" 
                onSubmit={handlePersonaSubmit} 
                isLoading={isSubmitting} 
              />
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

          {/* Back button for sub-steps */}
          {step !== "choice" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-center"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("choice")}
                className="text-muted-foreground"
              >
                ← Back to options
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
