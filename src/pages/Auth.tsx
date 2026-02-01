import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, Sparkles, KeyRound, ArrowRight } from "lucide-react";
import { PersonaForm, PersonaData } from "@/components/auth/PersonaForm";
import { KeyRevealCard } from "@/components/auth/KeyRevealCard";
import { KeyLoginForm } from "@/components/auth/KeyLoginForm";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { FloatingParticles } from "@/components/auth/FloatingParticles";
import { GlassCard } from "@/components/auth/GlassCard";
import { useKeyAuth } from "@/hooks/useKeyAuth";
import { generateSecretKey, hashKey } from "@/lib/keyAuth";
import { toast } from "sonner";
import logo from "@/assets/logo.svg";

type AuthStep = "choice" | "signup-persona" | "signup-key" | "login";

// Curated movie stills for the gallery
const GALLERY_STILLS = [
  "https://image.tmdb.org/t/p/w300/hek3koDUyRQq7gkV2Fj0hMhiWtI.jpg",
  "https://image.tmdb.org/t/p/w300/jOzrELAzFxtMx2I4uDGHOotdfsS.jpg",
  "https://image.tmdb.org/t/p/w300/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
  "https://image.tmdb.org/t/p/w300/9gk7adHYeDvHkCSEqAvQNLV5Ber.jpg",
  "https://image.tmdb.org/t/p/w300/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
  "https://image.tmdb.org/t/p/w300/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
];

const Auth = () => {
  const [step, setStep] = useState<AuthStep>("choice");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [personaData, setPersonaData] = useState<PersonaData | null>(null);
  const [currentStill, setCurrentStill] = useState(0);

  const { signUp, signIn, isAuthenticated, isLoading } = useKeyAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Gallery rotation with smooth timing
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStill((prev) => (prev + 1) % GALLERY_STILLS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Redirect authenticated users
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
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
    } catch {
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create account";
      toast.error(message);
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed. Please try again.";
      setLoginError(message);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-10 h-10 animate-spin text-foreground/60" />
          <p className="text-sm text-muted-foreground font-medium">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-10 h-10 animate-spin text-foreground/60" />
          <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden relative">
      {/* Animated background layers */}
      <AuthBackground />
      <FloatingParticles />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 relative z-10">
        {/* Cinematic Gallery Strip */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="mb-10 sm:mb-12"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {GALLERY_STILLS.map((still, index) => {
              const isActive = index === currentStill;
              const distance = Math.abs(index - currentStill);
              const wrappedDistance = Math.min(distance, GALLERY_STILLS.length - distance);
              const isNear = wrappedDistance <= 2;

              return (
                <motion.div
                  key={index}
                  className="relative overflow-hidden rounded-xl"
                  animate={{
                    width: isActive ? 80 : 40,
                    height: isActive ? 56 : 36,
                    opacity: isNear ? (isActive ? 1 : 0.5) : 0.2,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                  style={{
                    boxShadow: isActive 
                      ? "0 8px 32px -8px hsl(var(--primary) / 0.3), 0 4px 16px -4px hsl(0 0% 0% / 0.2)" 
                      : "none",
                  }}
                >
                  <img
                    src={still}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {isActive && (
                    <motion.div 
                      className="absolute inset-0 ring-2 ring-foreground/20 rounded-xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <div className="w-full max-w-sm">
          {/* Logo & Brand */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
            className="text-center mb-10"
          >
            <motion.div
              className="inline-flex items-center justify-center mb-6"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <motion.img
                src={logo}
                alt="MoodFlix"
                className="h-14 sm:h-16 w-auto dark:invert"
                initial={{ filter: "blur(10px)" }}
                animate={{ filter: "blur(0px)" }}
                transition={{ duration: 0.6 }}
              />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-muted-foreground text-sm font-medium tracking-[0.2em] uppercase"
            >
              Cinema for your mood
            </motion.p>
          </motion.div>

          <AnimatePresence mode="wait">
            {step === "choice" && (
              <motion.div
                key="choice"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15, scale: 0.98 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="space-y-6"
              >
                {/* Auth Buttons */}
                <div className="space-y-3">
                  {/* Create Vault Button */}
                  <motion.button
                    onClick={() => setStep("signup-persona")}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative w-full h-16 rounded-2xl overflow-hidden"
                    style={{
                      boxShadow: "0 8px 32px -8px hsl(var(--primary) / 0.25), 0 4px 12px -4px hsl(0 0% 0% / 0.1)",
                    }}
                  >
                    {/* Button gradient background */}
                    <div className="absolute inset-0 bg-foreground" />
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: "linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, transparent 50%)",
                      }}
                    />
                    
                    <div className="relative z-10 flex items-center justify-center gap-3 text-background">
                      <Sparkles className="w-5 h-5" />
                      <span className="text-base font-semibold tracking-tight">Create Your Vault</span>
                      <motion.div
                        className="ml-1"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </div>
                  </motion.button>

                  {/* Enter With Key Button */}
                  <motion.button
                    onClick={() => setStep("login")}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative w-full h-16 rounded-2xl border-2 border-border hover:border-foreground/30 transition-colors duration-300 bg-card/50 backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <KeyRound className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      <span className="text-base font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                        Enter With Key
                      </span>
                    </div>
                  </motion.button>
                </div>

                {/* Feature Pills */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-center gap-3"
                >
                  {["Private", "Secure", "Instant"].map((feature, i) => (
                    <motion.span
                      key={feature}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 text-muted-foreground text-xs font-medium tracking-wide"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-foreground/30" />
                      {feature}
                    </motion.span>
                  ))}
                </motion.div>

                {/* Guest Option */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-center pt-4"
                >
                  <button
                    onClick={() => navigate("/")}
                    className="group text-muted-foreground hover:text-foreground transition-colors text-sm inline-flex items-center gap-2"
                  >
                    <span>Continue as guest</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              </motion.div>
            )}

            {step === "signup-persona" && (
              <GlassCard delay={0.1}>
                <PersonaForm
                  key="persona"
                  onSubmit={handlePersonaSubmit}
                  isLoading={isSubmitting}
                />
              </GlassCard>
            )}

            {step === "signup-key" && generatedKey && personaData && (
              <GlassCard delay={0.1}>
                <KeyRevealCard
                  key="reveal"
                  secretKey={generatedKey}
                  displayName={personaData.displayName}
                  onConfirm={handleKeyConfirm}
                  isLoading={isSubmitting}
                />
              </GlassCard>
            )}

            {step === "login" && (
              <GlassCard delay={0.1}>
                <KeyLoginForm
                  key="login"
                  onSubmit={handleLogin}
                  onSwitchToSignup={() => setStep("signup-persona")}
                  isLoading={isSubmitting}
                  error={loginError}
                />
              </GlassCard>
            )}
          </AnimatePresence>

          {/* Back button for sub-steps */}
          {step !== "choice" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 text-center"
            >
              <button
                onClick={() => setStep("choice")}
                className="group text-muted-foreground hover:text-foreground transition-colors text-sm inline-flex items-center gap-2"
              >
                <motion.span
                  className="inline-block"
                  animate={{ x: [0, -3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  ←
                </motion.span>
                <span>Back to options</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
    </div>
  );
};

export default Auth;
