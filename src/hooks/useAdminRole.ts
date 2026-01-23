import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useKeyAuth } from "./useKeyAuth";

export type AdminRole = "super_admin" | "admin" | "moderator" | "analyst" | "user";

export function useAdminRole() {
  const { user, isLoading: authLoading } = useKeyAuth();
  const [role, setRole] = useState<AdminRole>("user");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      if (!user) {
        setRole("user");
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc("get_user_role", {
          _user_id: user.id,
        });

        if (error) {
          console.error("Error fetching user role:", error);
          setRole("user");
        } else {
          setRole((data as AdminRole) || "user");
        }
      } catch (err) {
        console.error("Error in role fetch:", err);
        setRole("user");
      } finally {
        setIsLoading(false);
      }
    }

    if (!authLoading) {
      fetchRole();
    }
  }, [user, authLoading]);

  const isAdmin = role === "admin" || role === "super_admin";
  const isSuperAdmin = role === "super_admin";
  const isModerator = role === "moderator" || isAdmin;
  const isAnalyst = role === "analyst" || isAdmin;

  return {
    role,
    isAdmin,
    isSuperAdmin,
    isModerator,
    isAnalyst,
    isLoading: isLoading || authLoading,
    user,
  };
}
