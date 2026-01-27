import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useKeyAuth } from "@/hooks/useKeyAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Shield, ArrowLeft, LogIn, RefreshCw, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: authLoading } = useKeyAuth();
  const { isAdmin, isSuperAdmin, isLoading: checkingAdmin, role, error, refetch } = useAdminAuth();
  const [hasChecked, setHasChecked] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log("[AdminLogin] State:", {
      user: user?.id,
      authLoading,
      checkingAdmin,
      isAdmin,
      isSuperAdmin,
      role,
      hasChecked,
      error
    });
  }, [user, authLoading, checkingAdmin, isAdmin, isSuperAdmin, role, hasChecked, error]);

  // Redirect if already admin
  useEffect(() => {
    if (!authLoading && !checkingAdmin) {
      setHasChecked(true);
      if (user && isAdmin) {
        console.log("[AdminLogin] Admin verified, redirecting to dashboard");
        toast.success(`Welcome back, ${role === 'super_admin' ? 'Super Admin' : 'Admin'}!`);
        navigate("/admin/dashboard", { replace: true });
      }
    }
  }, [authLoading, user, checkingAdmin, isAdmin, role, navigate]);

  // Show message if user is logged in but not admin
  useEffect(() => {
    if (hasChecked && user && !isAdmin && !checkingAdmin && !error) {
      toast.error("Your account doesn't have admin privileges");
    }
  }, [hasChecked, user, isAdmin, checkingAdmin, error]);

  const isBusy = authLoading || checkingAdmin;

  const handleRetry = () => {
    refetch();
  };

  const getStatusMessage = () => {
    if (isBusy) return "Verifying access...";
    if (error) return "Verification failed";
    if (user && isAdmin) return "Access granted! Redirecting...";
    if (user && !isAdmin) return "Admin privileges required";
    return "Sign in with your Secret Key to access";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader className="text-center space-y-4">
          <button
            onClick={() => navigate("/")}
            className="absolute top-4 left-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </button>
          
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
            isAdmin ? 'bg-green-500/10' : 'bg-primary/10'
          }`}>
            {isAdmin ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : (
              <Shield className="w-8 h-8 text-primary" />
            )}
          </div>
          <div>
            <CardTitle className="text-2xl">Admin Portal</CardTitle>
            <CardDescription>{getStatusMessage()}</CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isBusy ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-destructive">{error}</p>
              <Button onClick={handleRetry} className="w-full gap-2">
                <RefreshCw className="w-4 h-4" />
                Retry Verification
              </Button>
            </div>
          ) : user ? (
            isAdmin ? (
              <Button 
                className="w-full gap-2" 
                onClick={() => navigate("/admin/dashboard")}
              >
                <Shield className="w-4 h-4" />
                Go to Dashboard
              </Button>
            ) : (
              <div className="text-center space-y-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    Logged in as: <span className="font-medium text-foreground">{user.display_name}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    User ID: {user.id.slice(0, 8)}...
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  This account doesn't have admin access.
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={handleRetry}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate("/")}
                  >
                    Return Home
                  </Button>
                </div>
              </div>
            )
          ) : (
            <Button 
              className="w-full gap-2" 
              onClick={() => navigate("/auth", { state: { returnTo: "/admin/login" } })}
            >
              <LogIn className="w-4 h-4" />
              Sign In with Secret Key
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
