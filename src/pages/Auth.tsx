import { useState, useEffect, useCallback } from "react";
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

// Sample movie stills for gallery strip
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

  // Gallery rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStill((prev) => (prev + 1) % GALLERY_STILLS.length);
    }, 4000);
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
      {/* Subtle texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 relative z-10">
        {/* Gallery Strip - Rotating stills */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="mb-8 sm:mb-10"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {GALLERY_STILLS.map((still, index) => {
              const isActive = index === currentStill;
              const distance = Math.abs(index - currentStill);
              const isNear = distance <= 2 || distance >= GALLERY_STILLS.length - 2;

              return (
                <motion.div
                  key={index}
                  className="relative overflow-hidden rounded-lg"
                  animate={{
                    width: isActive ? 72 : 36,
                    height: isActive ? 48 : 32,
                    opacity: isNear ? (isActive ? 1 : 0.4) : 0.15,
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
                    <div className="absolute inset-0 ring-2 ring-primary/60 rounded-lg" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <div className="w-full max-w-sm">
          {/* Logo & Brand */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
            className="text-center mb-10"
          >
            <motion.div
              className="inline-flex items-center justify-center mb-5"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <img
                src={logo}
                alt="MoodFlix"
                className="h-12 sm:h-14 w-auto dark:invert opacity-90"
              />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-muted-foreground text-sm font-light tracking-[0.15em] uppercase"
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
                className="space-y-6"
              >
                {/* Auth buttons */}
                <div className="space-y-3">
                  <motion.button
                    onClick={() => setStep("signup-persona")}
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full h-14 rounded-2xl text-base font-semibold bg-foreground text-background 
                              hover:opacity-90 transition-opacity duration-200
                              flex items-center justify-center gap-3 shadow-lg"
                  >
                    <span className="text-lg">✦</span>
                    Create Your Vault
                  </motion.button>

                  <motion.button
                    onClick={() => setStep("login")}
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full h-14 rounded-2xl text-base font-medium 
                              bg-secondary text-foreground 
                              border border-border hover:border-foreground/20
                              transition-all duration-200
                              flex items-center justify-center gap-3"
                  >
                    <span className="text-lg opacity-70">⚿</span>
                    Enter With Key
                  </motion.button>
                </div>

                {/* Feature tags */}
                <div className="flex justify-center gap-6 text-muted-foreground text-xs tracking-wide uppercase">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                    Private
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                    Secure
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                    Instant
                  </span>
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
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm underline-offset-4 hover:underline"
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
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                ← Back
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
};

export default Auth;
