import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useKeyAuth } from "@/hooks/useKeyAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Shield, ArrowLeft, LogIn, UserCog } from "lucide-react";
import { toast } from "sonner";
import { getCurrentUserAndPromoteToAdmin } from "@/lib/adminUtils";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useKeyAuth();
  const { isAdmin, isLoading: checkingAdmin } = useAdminAuth();
  const [hasChecked, setHasChecked] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);

  const handlePromoteToAdmin = async () => {
    setIsPromoting(true);
    try {
      const result = await getCurrentUserAndPromoteToAdmin();

      if (result.success) {
        toast.success("Successfully promoted to admin! Refreshing...");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error(result.error || "Failed to promote to admin");
      }
    } catch (error) {
      toast.error("An error occurred while promoting to admin");
    } finally {
      setIsPromoting(false);
    }
  };

  // Redirect if already admin
  useEffect(() => {
    if (!authLoading && !checkingAdmin) {
      setHasChecked(true);
      if (user && isAdmin) {
        navigate("/admin/dashboard", { replace: true });
      }
    }
  }, [authLoading, user, checkingAdmin, isAdmin, navigate]);

  // Show message if user is logged in but not admin
  useEffect(() => {
    if (hasChecked && user && !isAdmin && !checkingAdmin) {
      toast.error("You don't have admin privileges");
    }
  }, [hasChecked, user, isAdmin, checkingAdmin]);

  const isBusy = authLoading || checkingAdmin;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader className="text-center space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Admin Portal</CardTitle>
            <CardDescription>
              {isBusy 
                ? "Verifying access..." 
                : user 
                  ? isAdmin 
                    ? "Redirecting to dashboard..."
                    : "Admin privileges required"
                  : "Sign in with your Secret Key to access"}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isBusy ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
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
                <p className="text-sm text-muted-foreground">
                  Your account ({user.display_name}) doesn't have admin access.
                </p>
                <div className="space-y-2">
                  <Button
                    className="w-full gap-2"
                    onClick={handlePromoteToAdmin}
                    disabled={isPromoting}
                  >
                    {isPromoting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Promoting...
                      </>
                    ) : (
                      <>
                        <UserCog className="w-4 h-4" />
                        Make Me Admin
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
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
