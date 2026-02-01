import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
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
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col overflow-hidden relative">
      {/* Artistic textured background - subtle paper grain */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Base subtle noise texture */}
        <div 
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Elegant single spotlight - cinematic */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[900px]"
          style={{
            background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 100%)",
          }}
        />
        
        {/* Subtle edge vignette for depth */}
        <div 
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, rgba(0,0,0,0.4) 100%)",
          }}
        />
      </div>
      
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 relative z-10">
        <div className="w-full max-w-sm">
          {/* Logo & Brand - Ultra minimal */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="text-center mb-12"
          >
            <motion.div 
              className="inline-flex items-center justify-center mb-6"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <img 
                src={logo} 
                alt="MoodFlix" 
                className="h-12 sm:h-14 w-auto invert opacity-80"
              />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-neutral-500 text-sm font-light tracking-[0.2em] uppercase"
            >
              Cinema for your mood
            </motion.p>
          </motion.div>

          <AnimatePresence mode="wait">
            {step === "choice" && (
              <motion.div
                key="choice"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="space-y-8"
              >
                {/* Ultra-minimal auth buttons */}
                <div className="space-y-3">
                  <motion.button 
                    onClick={() => setStep("signup-persona")} 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full h-14 rounded-xl text-base font-medium bg-white text-black 
                              hover:bg-neutral-100 transition-colors duration-200
                              flex items-center justify-center gap-3"
                  >
                    <span className="text-lg">✦</span>
                    Create Your Vault
                  </motion.button>
                  
                  <motion.button 
                    onClick={() => setStep("login")} 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full h-14 rounded-xl text-base font-medium 
                              bg-transparent text-neutral-400 
                              border border-neutral-800 hover:border-neutral-600
                              hover:text-neutral-200 transition-all duration-200
                              flex items-center justify-center gap-3"
                  >
                    <span className="text-lg opacity-60">⚿</span>
                    Enter With Key
                  </motion.button>
                </div>

                {/* Minimal feature indicators */}
                <div className="flex justify-center gap-8 text-neutral-600 text-xs tracking-wider uppercase">
                  <span>Private</span>
                  <span className="text-neutral-700">•</span>
                  <span>Secure</span>
                  <span className="text-neutral-700">•</span>
                  <span>Instant</span>
                </div>

                {/* Guest option */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-center pt-4"
                >
                  <button 
                    onClick={() => navigate("/")} 
                    className="text-neutral-600 hover:text-neutral-400 transition-colors text-sm"
                  >
                    Continue as guest →
                  </button>
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
              className="mt-8 text-center"
            >
              <button
                onClick={() => setStep("choice")}
                className="text-neutral-600 hover:text-neutral-400 transition-colors text-sm"
              >
                ← Back
              </button>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />
    </div>
  );
};

export default Auth;
