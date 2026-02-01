import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, X, ArrowRight } from "lucide-react";
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-8 h-8 animate-spin text-white/40" />
        </motion.div>
      </div>
    );
  }

  // Already authenticated
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-8 h-8 animate-spin text-white/40" />
          <p className="text-sm text-white/50">Redirecting...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Close button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={() => navigate("/")}
        className="absolute top-6 right-6 z-50 p-2 rounded-full bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-all"
      >
        <X className="w-5 h-5" />
      </motion.button>

      {/* Main content - centered vertically */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            {step === "choice" && (
              <motion.div
                key="choice"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                {/* Logo */}
                <div className="text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="inline-block mb-8"
                  >
                    <img
                      src={logo}
                      alt="MoodFlix"
                      className="h-16 w-auto mx-auto invert opacity-60"
                    />
                  </motion.div>

                  {/* Title */}
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-semibold text-white tracking-tight"
                  >
                    Sign In or Sign Up
                  </motion.h1>

                  {/* Subtitle */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-white/50 mt-3 text-base"
                  >
                    Enter your secret key or create a new vault to get started.
                  </motion.p>
                </div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3 pt-4"
                >
                  {/* Primary: Login with Key */}
                  <button
                    onClick={() => setStep("login")}
                    className="w-full py-4 px-6 rounded-xl bg-white/[0.08] border border-white/10 text-white/70 text-left transition-all hover:bg-white/[0.12] hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <span className="text-base">Enter with Secret Key</span>
                  </button>

                  {/* Secondary: Create Vault */}
                  <button
                    onClick={() => setStep("signup-persona")}
                    className="w-full py-4 px-6 rounded-xl bg-white/[0.08] border border-white/10 text-white/70 text-left transition-all hover:bg-white/[0.12] hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <span className="text-base">Create New Vault</span>
                  </button>
                </motion.div>
              </motion.div>
            )}

            {step === "signup-persona" && (
              <motion.div
                key="signup-persona"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Logo */}
                <div className="text-center mb-8">
                  <img
                    src={logo}
                    alt="MoodFlix"
                    className="h-12 w-auto mx-auto invert opacity-60"
                  />
                </div>

                <h1 className="text-xl font-semibold text-white text-center">
                  Create Your Profile
                </h1>

                <div className="bg-white/[0.05] rounded-2xl border border-white/10 p-6">
                  <PersonaForm
                    onSubmit={handlePersonaSubmit}
                    isLoading={isSubmitting}
                  />
                </div>
              </motion.div>
            )}

            {step === "signup-key" && generatedKey && personaData && (
              <motion.div
                key="signup-key"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Logo */}
                <div className="text-center mb-8">
                  <img
                    src={logo}
                    alt="MoodFlix"
                    className="h-12 w-auto mx-auto invert opacity-60"
                  />
                </div>

                <div className="bg-white/[0.05] rounded-2xl border border-white/10 p-6">
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
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Logo */}
                <div className="text-center mb-8">
                  <img
                    src={logo}
                    alt="MoodFlix"
                    className="h-12 w-auto mx-auto invert opacity-60"
                  />
                </div>

                <h1 className="text-xl font-semibold text-white text-center">
                  Enter Your Key
                </h1>

                <div className="bg-white/[0.05] rounded-2xl border border-white/10 p-6">
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

          {/* Back button for sub-steps */}
          {step !== "choice" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 text-center"
            >
              <button
                onClick={() => setStep("choice")}
                className="text-white/40 hover:text-white/70 transition-colors text-sm inline-flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                <span>Back</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom info section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="px-6 pb-8 text-center"
      >
        <div className="flex justify-center mb-4">
          <svg className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        </div>
        <p className="text-white/40 text-xs leading-relaxed max-w-xs mx-auto">
          Your data is encrypted and stored securely. 
          We never share your information with third parties.
          <br />
          <button className="text-primary/80 hover:text-primary mt-1">
            Learn more about privacy...
          </button>
        </p>

        {/* Continue as Guest */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={() => navigate("/")}
          className="mt-6 w-full py-4 rounded-full bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-colors"
        >
          Continue as Guest
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Auth;
