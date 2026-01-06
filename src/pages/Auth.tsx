import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Mail, Lock, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type AuthMode = "signin" | "signup" | "forgot" | "reset";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        navigate(redirectPath.startsWith("/") ? redirectPath : "/");
      }

      if (event === "PASSWORD_RECOVERY") {
        setMode("reset");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate(redirectPath.startsWith("/") ? redirectPath : "/");
      }
    });

    const type = searchParams.get("type");
    if (type === "recovery") {
      setMode("reset");
    }

    return () => subscription.unsubscribe();
  }, [navigate, redirectPath, searchParams]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Signed in successfully!");
    } catch (error: any) {
      if (error.message?.includes("Invalid login credentials")) {
        toast.error("Invalid email or password");
      } else if (error.message?.includes("Email not confirmed")) {
        toast.error("Please verify your email before signing in");
      } else {
        toast.error(error.message || "Sign in failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}${redirectPath}`,
        },
      });

      if (error) throw error;

      setSignupSuccess(true);
      toast.success("Account created! Please check your email to verify your account.");
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.message?.includes("already registered")) {
        toast.error("This email is already registered");
      } else if (error.message?.includes("Invalid API key") || error.message?.includes("invalid_api_key")) {
        toast.error("Unable to connect to authentication service. Please try again later.");
      } else if (error.message?.includes("fetch")) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error(error.message || "Sign up failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?type=recovery`,
      });

      if (error) throw error;

      setResetEmailSent(true);
      toast.success("Password reset email sent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      toast.error("Please enter a new password");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      toast.success("Password updated successfully!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (mode === "signin") return handleSignIn(e);
    if (mode === "signup") return handleSignUp(e);
    if (mode === "forgot") return handleForgotPassword(e);
    if (mode === "reset") return handleResetPassword(e);
  };

  const getTitle = () => {
    switch (mode) {
      case "signin": return "Welcome Back";
      case "signup": return "Create Account";
      case "forgot": return "Reset Password";
      case "reset": return "Set New Password";
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case "signin": return "Sign in to continue to MoodFlix";
      case "signup": return "Sign up to start tracking your movies";
      case "forgot": return "Enter your email to receive a reset link";
      case "reset": return "Enter your new password";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to home
        </button>

        <motion.div
          layout
          className="bg-card rounded-2xl p-8 border border-border shadow-xl"
        >
          <AnimatePresence mode="wait">
            {signupSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center space-y-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="flex justify-center"
                >
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                </motion.div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Check Your Email</h2>
                  <p className="text-muted-foreground">
                    We've sent a verification link to <strong>{email}</strong>
                  </p>
                </div>

                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    Click the link in the email to verify your account and start using MoodFlix
                  </AlertDescription>
                </Alert>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSignupSuccess(false);
                    setMode("signin");
                    setEmail("");
                    setPassword("");
                    setConfirmPassword("");
                  }}
                  className="w-full"
                >
                  Back to Sign In
                </Button>
              </motion.div>
            ) : resetEmailSent ? (
              <motion.div
                key="reset-sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center space-y-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="flex justify-center"
                >
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </motion.div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Check Your Email</h2>
                  <p className="text-muted-foreground">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    The link will expire in 1 hour. Check your spam folder if you don't see it.
                  </AlertDescription>
                </Alert>

                <Button
                  variant="outline"
                  onClick={() => {
                    setResetEmailSent(false);
                    setMode("signin");
                    setEmail("");
                  }}
                  className="w-full"
                >
                  Back to Sign In
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold">{getTitle()}</h1>
                  <p className="text-muted-foreground">{getSubtitle()}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {(mode === "signin" || mode === "signup" || mode === "forgot") && (
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11"
                        autoFocus
                        required
                      />
                    </div>
                  )}

                  {(mode === "signin" || mode === "signup" || mode === "reset") && (
                    <div className="space-y-2">
                      <Label htmlFor="password" className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        {mode === "reset" ? "New Password" : "Password"}
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11"
                        required
                      />
                      {(mode === "signup" || mode === "reset") && (
                        <p className="text-xs text-muted-foreground">
                          At least 6 characters
                        </p>
                      )}
                    </div>
                  )}

                  {(mode === "signup" || mode === "reset") && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4" />
                        Confirm Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-11"
                        required
                      />
                    </div>
                  )}

                  {mode === "signin" && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setMode("forgot")}
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 font-medium"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        {mode === "signin" && "Signing in..."}
                        {mode === "signup" && "Creating account..."}
                        {mode === "forgot" && "Sending email..."}
                        {mode === "reset" && "Updating password..."}
                      </span>
                    ) : (
                      <span>
                        {mode === "signin" && "Sign In"}
                        {mode === "signup" && "Sign Up"}
                        {mode === "forgot" && "Send Reset Link"}
                        {mode === "reset" && "Reset Password"}
                      </span>
                    )}
                  </Button>
                </form>

                <div className="space-y-2">
                  {mode === "signin" && (
                    <div className="text-center text-sm">
                      <button
                        onClick={() => {
                          setMode("signup");
                          setPassword("");
                          setConfirmPassword("");
                        }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Don't have an account?{" "}
                        <span className="text-primary font-medium">Sign up</span>
                      </button>
                    </div>
                  )}

                  {mode === "signup" && (
                    <div className="text-center text-sm">
                      <button
                        onClick={() => {
                          setMode("signin");
                          setConfirmPassword("");
                        }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Already have an account?{" "}
                        <span className="text-primary font-medium">Sign in</span>
                      </button>
                    </div>
                  )}

                  {mode === "forgot" && (
                    <div className="text-center text-sm">
                      <button
                        onClick={() => {
                          setMode("signin");
                          setEmail("");
                        }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Remember your password?{" "}
                        <span className="text-primary font-medium">Sign in</span>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {!signupSuccess && !resetEmailSent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center"
          >
            <Alert className="bg-card/50 border-muted">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                {mode === "signup" && "You'll receive a verification email after signing up"}
                {mode === "signin" && "Secure authentication powered by Supabase"}
                {mode === "forgot" && "Password reset links expire after 1 hour"}
                {mode === "reset" && "Choose a strong password you haven't used before"}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Auth;
