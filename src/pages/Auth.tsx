import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, X, ArrowRight, Shield, Eye, EyeOff, ArrowLeft } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
        </motion.div>
      </div>
    );
  }

  // Already authenticated
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
          <p className="text-sm text-neutral-500">Redirecting...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Close button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={() => navigate("/")}
        className="absolute top-5 right-5 z-50 p-2 rounded-full bg-neutral-100 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 transition-all"
      >
        <X className="w-5 h-5" />
      </motion.button>

      {/* Main content */}
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
                      className="h-14 w-auto mx-auto"
                    />
                  </motion.div>

                  {/* Title */}
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold text-neutral-900 tracking-tight"
                  >
                    Welcome Back
                  </motion.h1>

                  {/* Subtitle */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-neutral-500 mt-2 text-base"
                  >
                    Sign in with your secret key or create a new account
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
                    className="w-full py-4 px-6 rounded-xl bg-neutral-900 text-white font-medium text-center transition-all hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/50 focus:ring-offset-2"
                  >
                    Sign In with Key
                  </button>

                  {/* Secondary: Create Vault */}
                  <button
                    onClick={() => setStep("signup-persona")}
                    className="w-full py-4 px-6 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-700 font-medium text-center transition-all hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-400/50 focus:ring-offset-2"
                  >
                    Create New Account
                  </button>
                </motion.div>

                {/* Continue as guest */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center pt-4"
                >
                  <button
                    onClick={() => navigate("/")}
                    className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                  >
                    Continue as Guest →
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
                {/* Header */}
                <div className="text-center mb-6">
                  <img
                    src={logo}
                    alt="MoodFlix"
                    className="h-10 w-auto mx-auto mb-6"
                  />
                  <h1 className="text-xl font-bold text-neutral-900">
                    Create Your Profile
                  </h1>
                  <p className="text-neutral-500 text-sm mt-1">
                    Tell us a bit about yourself
                  </p>
                </div>

                <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6">
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
                {/* Header */}
                <div className="text-center mb-6">
                  <img
                    src={logo}
                    alt="MoodFlix"
                    className="h-10 w-auto mx-auto mb-6"
                  />
                  <h1 className="text-xl font-bold text-neutral-900">
                    Your Secret Key
                  </h1>
                  <p className="text-neutral-500 text-sm mt-1">
                    Save this key securely - you'll need it to sign in
                  </p>
                </div>

                <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6">
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
                {/* Header */}
                <div className="text-center mb-6">
                  <img
                    src={logo}
                    alt="MoodFlix"
                    className="h-10 w-auto mx-auto mb-6"
                  />
                  <h1 className="text-xl font-bold text-neutral-900">
                    Welcome Back
                  </h1>
                  <p className="text-neutral-500 text-sm mt-1">
                    Enter your secret key to sign in
                  </p>
                </div>

                <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6">
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
                className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="px-6 pb-8 text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-neutral-400" />
          <span className="text-xs text-neutral-500">Secure & Private</span>
        </div>
        <p className="text-neutral-400 text-xs leading-relaxed max-w-xs mx-auto">
          Your data is encrypted and stored securely. We never share your information.
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
