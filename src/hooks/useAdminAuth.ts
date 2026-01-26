import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useKeyAuth } from "./useKeyAuth";

export function useAdminAuth() {
  const { user, isLoading: authLoading } = useKeyAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<string>("user");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAdminRole() {
      if (!user) {
        setIsAdmin(false);
        setRole("user");
        setIsLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error checking admin role:", error);
          setIsAdmin(false);
          setRole("user");
        } else if (profile?.role) {
          const userRole = profile.role;
          setRole(userRole);
          setIsAdmin(userRole === "admin" || userRole === "super_admin");
        } else {
          const { data: userRoleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .in("role", ["admin", "super_admin"])
            .maybeSingle();

          if (userRoleData?.role) {
            setRole(userRoleData.role);
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
            setRole("user");
          }
        }
      } catch (err) {
        console.error("Error in admin check:", err);
        setIsAdmin(false);
        setRole("user");
      } finally {
        setIsLoading(false);
      }
    }

    if (!authLoading) {
      checkAdminRole();
    }
  }, [user, authLoading]);

  return { isAdmin, role, isLoading: isLoading || authLoading, user };
}
