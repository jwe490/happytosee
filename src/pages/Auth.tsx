import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, X, ArrowLeft, Shield, Film, Sparkles } from "lucide-react";
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
      if (error) { toast.error(error.message); return; }
      const loginResult = await signIn(generatedKey, true);
      if (loginResult.error) {
        toast.success("Account created! Please login with your key.");
        setStep("login");
      } else {
        toast.success("Welcome to MoodFlix! 🎬");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create account");
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
        setLoginError(error.message.toLowerCase().includes("invalid")
          ? "No account found with this key."
          : error.message
        );
        setIsSubmitting(false);
        return;
      }
      toast.success("Welcome back! 🎬");
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Login failed.");
      setIsSubmitting(false);
    }
  };

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 animate-gradient-flow" style={{
          background: `linear-gradient(-45deg,
            hsl(280 60% 50% / 0.08),
            hsl(200 70% 50% / 0.06),
            hsl(340 65% 55% / 0.08),
            hsl(160 60% 45% / 0.06),
            hsl(280 60% 50% / 0.08)
          )`,
          backgroundSize: '400% 400%',
        }} />
        <div className="absolute inset-0" style={{
          opacity: 0.15,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          mixBlendMode: "overlay",
        }} />
      </div>

      {/* Close */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={() => navigate("/")}
        className="absolute top-5 right-5 z-50 p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
      >
        <X className="w-5 h-5" />
      </motion.button>

      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 relative z-10">
        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            {step === "choice" && (
              <motion.div
                key="choice"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <motion.img
                    src={logo}
                    alt="MoodFlix"
                    className="h-12 w-auto mx-auto mb-8 dark:invert"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  />
                  <h1 className="text-3xl font-bold text-foreground tracking-tight">
                    Welcome to MoodFlix
                  </h1>
                  <p className="text-muted-foreground mt-3 text-base max-w-xs mx-auto">
                    Movies that match your mood. Your personal cinema journey starts here.
                  </p>
                </div>

                {/* Feature highlights */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Film, label: "Mood-Based Picks" },
                    { icon: Sparkles, label: "AI Curation" },
                  ].map(f => (
                    <div key={f.label} className="flex items-center gap-2.5 p-3 rounded-xl bg-card/50 border border-border/50">
                      <f.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-xs font-medium text-muted-foreground">{f.label}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={() => setStep("login")}
                    className="w-full py-3.5 px-6 rounded-xl bg-primary text-primary-foreground font-semibold transition-all hover:bg-primary/90 active:scale-[0.98] text-base"
                  >
                    Sign In with Key
                  </button>
                  <button
                    onClick={() => setStep("signup-persona")}
                    className="w-full py-3.5 px-6 rounded-xl bg-secondary border border-border text-foreground font-semibold transition-all hover:bg-muted active:scale-[0.98] text-base"
                  >
                    Create New Account
                  </button>
                </div>

                <div className="text-center">
                  <button
                    onClick={() => navigate("/")}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Continue as Guest →
                  </button>
                </div>
              </motion.div>
            )}

            {step === "signup-persona" && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-6">
                  <img src={logo} alt="MoodFlix" className="h-10 w-auto mx-auto mb-4 dark:invert" />
                  <h1 className="text-2xl font-bold text-foreground">Create Your Profile</h1>
                  <p className="text-muted-foreground text-sm mt-1">Quick setup — takes 30 seconds</p>
                </div>
                <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border p-6">
                  <PersonaForm onSubmit={handlePersonaSubmit} isLoading={isSubmitting} />
                </div>
              </motion.div>
            )}

            {step === "signup-key" && generatedKey && personaData && (
              <motion.div
                key="key"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-6">
                  <img src={logo} alt="MoodFlix" className="h-10 w-auto mx-auto mb-4 dark:invert" />
                  <h1 className="text-2xl font-bold text-foreground">Your Secret Key</h1>
                  <p className="text-muted-foreground text-sm mt-1">Save this — it's your only way to sign in</p>
                </div>
                <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border p-6">
                  <KeyRevealCard
                    secretKey={generatedKey}
                    displayName={personaData.displayName}
                    onConfirm={handleKeyConfirm}
                    isLoading={isSubmitting}
                  />
                </div>
              </motion.div>
            )}

            {step === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-6">
                  <img src={logo} alt="MoodFlix" className="h-10 w-auto mx-auto mb-4 dark:invert" />
                  <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
                  <p className="text-muted-foreground text-sm mt-1">Enter your key to continue</p>
                </div>
                <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border p-6">
                  <KeyLoginForm
                    onSubmit={handleLogin}
                    onSwitchToSignup={() => setStep("signup-persona")}
                    isLoading={isSubmitting}
                    error={loginError}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {step !== "choice" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-center">
              <button
                onClick={() => setStep("choice")}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-8 text-center relative z-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Secure & Private</span>
        </div>
        <p className="text-muted-foreground/60 text-[11px]">
          Your data is encrypted. We never share your information.
        </p>
      </div>
    </div>
  );
};

export default Auth;