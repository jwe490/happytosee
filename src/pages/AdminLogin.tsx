import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useKeyAuth } from "@/hooks/useKeyAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Shield } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: authLoading } = useKeyAuth();
  const { isAdmin, isLoading: checkingAdmin } = useAdminAuth();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!authLoading && user && !checkingAdmin && isAdmin) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [authLoading, user, checkingAdmin, isAdmin, navigate]);

  useEffect(() => {
    if (!authLoading && !user && !redirecting) {
      setRedirecting(true);
      toast.message("Please unlock your vault to access admin.");
      navigate("/auth", { replace: true, state: { from: location } });
    }
  }, [authLoading, user, redirecting, navigate, location]);

  const isBusy = authLoading || checkingAdmin || redirecting;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Admin Portal</CardTitle>
            <CardDescription>
              {user ? "Verifying admin access…" : "Redirecting to Secret Key login…"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => navigate("/auth", { state: { from: location } })} disabled={isBusy}>
            {isBusy ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Please wait…
              </>
            ) : (
              "Go to Secret Key Login"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
