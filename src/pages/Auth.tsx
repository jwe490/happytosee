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
        // Provide clearer guidance when account doesn't exist
        if (error.message.toLowerCase().includes("invalid")) {
          setLoginError("No account found with this key. Try creating a new vault first.");
        } else {
          setLoginError(error.message);
        }
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
    <div className="min-h-screen bg-black flex flex-col overflow-hidden relative">
      {/* Noir cinema background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Film grain overlay */}
        <div 
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Dramatic spotlight from top */}
        <div 
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[600px]"
          style={{
            background: "radial-gradient(ellipse at center, hsl(var(--primary) / 0.12) 0%, transparent 60%)",
          }}
        />
        
        {/* Secondary ambient glow */}
        <div 
          className="absolute bottom-0 left-0 w-full h-1/2"
          style={{
            background: "linear-gradient(to top, hsl(var(--primary) / 0.03) 0%, transparent 100%)",
          }}
        />
        
        {/* Subtle vignette */}
        <div 
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
          }}
        />
      </div>
      
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo & Brand */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 sm:mb-10"
          >
            <motion.div 
              className="inline-flex items-center justify-center mb-5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img 
                src={logo} 
                alt="MoodFlix" 
                className="h-16 sm:h-20 md:h-24 w-auto invert opacity-90"
              />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-neutral-400 text-sm sm:text-base font-light tracking-wide"
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
                {/* Main auth card - noir glass style */}
                <div 
                  className="relative rounded-2xl p-6 sm:p-8 border border-neutral-800/60 shadow-2xl"
                  style={{
                    background: "linear-gradient(180deg, rgba(20,20,20,0.9) 0%, rgba(10,10,10,0.95) 100%)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  {/* Subtle inner glow */}
                  <div 
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      background: "radial-gradient(ellipse at top, hsl(var(--primary) / 0.06) 0%, transparent 50%)",
                    }}
                  />
                  
                  <div className="relative z-10">
                    <div className="text-center mb-6">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-neutral-800/80 flex items-center justify-center mx-auto mb-4 border border-neutral-700/50">
                        <KeyRound className="w-7 h-7 sm:w-8 sm:h-8 text-neutral-300" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-semibold text-neutral-100 mb-2 tracking-tight">
                        Key-Based Auth
                      </h2>
                      <p className="text-neutral-500 text-sm">
                        No email, no password. Just one secret key.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Button 
                        onClick={() => setStep("signup-persona")} 
                        className="w-full h-12 sm:h-14 gap-2 rounded-xl text-base font-medium bg-neutral-100 text-neutral-900 hover:bg-white transition-all duration-200"
                        size="lg"
                      >
                        <Sparkles className="w-5 h-5" />
                        Create New Vault
                      </Button>
                      <Button 
                        onClick={() => setStep("login")} 
                        variant="outline" 
                        className="w-full h-12 sm:h-14 gap-2 rounded-xl text-base font-medium border-neutral-700 bg-transparent text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 hover:border-neutral-600 transition-all duration-200"
                        size="lg"
                      >
                        <Shield className="w-5 h-5" />
                        I Have a Key
                      </Button>
                    </div>

                    {/* Features grid */}
                    <div className="mt-6 pt-6 border-t border-neutral-800/80">
                      <div className="grid grid-cols-3 gap-3 text-center">
                        {[
                          { icon: "🔐", label: "Secure" },
                          { icon: "🎭", label: "Anonymous" },
                          { icon: "⚡", label: "Fast" },
                        ].map((feature) => (
                          <div key={feature.label} className="py-2">
                            <div className="text-xl sm:text-2xl mb-1 grayscale opacity-80">{feature.icon}</div>
                            <div className="text-xs text-neutral-500 uppercase tracking-wider">{feature.label}</div>
                          </div>
                        ))}
                      </div>
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
                    className="text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900/50"
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
                className="text-neutral-500 hover:text-neutral-300"
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
