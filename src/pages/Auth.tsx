import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, Film, Sparkles, Lock, Key } from "lucide-react";
import { PersonaForm, PersonaData } from "@/components/auth/PersonaForm";
import { KeyRevealCard } from "@/components/auth/KeyRevealCard";
import { KeyLoginForm } from "@/components/auth/KeyLoginForm";
import { useKeyAuth } from "@/hooks/useKeyAuth";
import { generateSecretKey, hashKey } from "@/lib/keyAuth";
import { toast } from "sonner";
import logo from "@/assets/logo.svg";

type AuthStep = "choice" | "signup-persona" | "signup-key" | "login";

// Cinematic movie stills for gallery
const GALLERY_STILLS = [
  "https://image.tmdb.org/t/p/w300/hek3koDUyRQq7gkV2Fj0hMhiWtI.jpg",
  "https://image.tmdb.org/t/p/w300/jOzrELAzFxtMx2I4uDGHOotdfsS.jpg",
  "https://image.tmdb.org/t/p/w300/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
  "https://image.tmdb.org/t/p/w300/9gk7adHYeDvHkCSEqAvQNLV5Ber.jpg",
  "https://image.tmdb.org/t/p/w300/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
  "https://image.tmdb.org/t/p/w300/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
  "https://image.tmdb.org/t/p/w300/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
  "https://image.tmdb.org/t/p/w300/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
];

const Auth = () => {
  const [step, setStep] = useState<AuthStep>("choice");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [personaData, setPersonaData] = useState<PersonaData | null>(null);
  const [currentStill, setCurrentStill] = useState(0);
  const [isHoveringCreate, setIsHoveringCreate] = useState(false);
  const [isHoveringLogin, setIsHoveringLogin] = useState(false);

  const { signUp, signIn, isAuthenticated, isLoading } = useKeyAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Gallery rotation - smooth crossfade
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
    <div className="min-h-screen bg-background flex flex-col overflow-hidden relative">
      {/* Cinematic grain texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Spotlight gradient */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08)_0%,transparent_60%)]" />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 relative z-10">
        {/* Film strip gallery - horizontal scrolling stills */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="mb-10 sm:mb-12"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3 px-4">
            {GALLERY_STILLS.map((still, index) => {
              const isActive = index === currentStill;
              const distance = Math.min(
                Math.abs(index - currentStill),
                GALLERY_STILLS.length - Math.abs(index - currentStill)
              );
              const isNear = distance <= 2;

              return (
                <motion.div
                  key={index}
                  className="relative overflow-hidden"
                  animate={{
                    width: isActive ? 80 : 28,
                    height: isActive ? 56 : 28,
                    borderRadius: isActive ? 12 : 14,
                    opacity: isNear ? (isActive ? 1 : 0.5) : 0.2,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
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
                      layoutId="active-frame"
                      className="absolute inset-0 ring-2 ring-primary/80 rounded-xl"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
          
          {/* Film perforations decoration */}
          <div className="flex justify-center gap-3 mt-3 opacity-20">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-foreground" />
            ))}
          </div>
        </motion.div>

        <div className="w-full max-w-sm">
          {/* Logo & Brand */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1], delay: 0.15 }}
            className="text-center mb-10"
          >
            <motion.div
              className="inline-flex items-center justify-center mb-6"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <div className="relative">
                <img
                  src={logo}
                  alt="MoodFlix"
                  className="h-14 sm:h-16 w-auto dark:invert"
                />
                {/* Subtle glow behind logo */}
                <div className="absolute inset-0 blur-2xl opacity-20 bg-primary -z-10 scale-150" />
              </div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-muted-foreground text-sm font-light tracking-[0.2em] uppercase"
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
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="space-y-5"
              >
                {/* Create Vault Button - Primary */}
                <motion.button
                  onClick={() => setStep("signup-persona")}
                  onMouseEnter={() => setIsHoveringCreate(true)}
                  onMouseLeave={() => setIsHoveringCreate(false)}
                  whileTap={{ scale: 0.98 }}
                  className="relative w-full h-14 rounded-2xl text-base font-semibold overflow-hidden group"
                >
                  {/* Background with gradient */}
                  <motion.div
                    className="absolute inset-0 bg-foreground"
                    animate={{
                      opacity: isHoveringCreate ? 0.9 : 1,
                    }}
                  />
                  
                  {/* Border on hover */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-primary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHoveringCreate ? 1 : 0 }}
                    transition={{ duration: 0.15 }}
                  />
                  
                  {/* Content */}
                  <span className="relative z-10 flex items-center justify-center gap-3 text-background">
                    <motion.span
                      animate={{ 
                        y: isHoveringCreate ? -2 : 0,
                        scale: isHoveringCreate ? 1.1 : 1,
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.span>
                    <motion.span
                      animate={{ y: isHoveringCreate ? -1 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.02 }}
                    >
                      Create Your Vault
                    </motion.span>
                  </span>
                </motion.button>

                {/* Enter With Key Button - Secondary */}
                <motion.button
                  onClick={() => setStep("login")}
                  onMouseEnter={() => setIsHoveringLogin(true)}
                  onMouseLeave={() => setIsHoveringLogin(false)}
                  whileTap={{ scale: 0.98 }}
                  className="relative w-full h-14 rounded-2xl text-base font-medium overflow-hidden"
                >
                  {/* Background */}
                  <motion.div
                    className="absolute inset-0 bg-secondary"
                    animate={{
                      opacity: isHoveringLogin ? 0 : 1,
                    }}
                    transition={{ duration: 0.15 }}
                  />
                  
                  {/* Border - always visible, highlighted on hover */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    style={{ borderWidth: 2, borderStyle: "solid" }}
                    animate={{
                      borderColor: isHoveringLogin 
                        ? "hsl(var(--foreground) / 0.5)" 
                        : "hsl(var(--border))",
                    }}
                    transition={{ duration: 0.15 }}
                  />
                  
                  {/* Content */}
                  <span className="relative z-10 flex items-center justify-center gap-3 text-foreground">
                    <motion.span
                      animate={{ 
                        rotate: isHoveringLogin ? 15 : 0,
                        scale: isHoveringLogin ? 1.1 : 1,
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    >
                      <Key className="w-5 h-5 opacity-70" />
                    </motion.span>
                    <motion.span
                      animate={{ y: isHoveringLogin ? -1 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.02 }}
                    >
                      Enter With Key
                    </motion.span>
                  </span>
                </motion.button>

                {/* Feature indicators */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-center gap-8 pt-4"
                >
                  {[
                    { icon: Lock, label: "Private" },
                    { icon: Film, label: "Personal" },
                    { icon: Sparkles, label: "Instant" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-muted-foreground text-xs tracking-wide uppercase">
                      <Icon className="w-3.5 h-3.5 opacity-60" />
                      <span>{label}</span>
                    </div>
                  ))}
                </motion.div>

                {/* Guest option */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center pt-6"
                >
                  <button
                    onClick={() => navigate("/")}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm group"
                  >
                    Continue as guest
                    <span className="inline-block ml-1 group-hover:translate-x-1 transition-transform">→</span>
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
                className="text-muted-foreground hover:text-foreground transition-colors text-sm inline-flex items-center gap-1"
              >
                <span className="text-lg">←</span>
                Back
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom decorative elements */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="h-20 bg-gradient-to-t from-muted/20 to-transparent" />
      </div>
    </div>
  );
};

export default Auth;
