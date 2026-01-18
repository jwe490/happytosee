import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useKeyAuth } from "./useKeyAuth";

export function useAdminAuth() {
  const { user, isLoading: authLoading } = useKeyAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAdminRole() {
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (error) {
          console.error("Error checking admin role:", error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data);
        }
      } catch (err) {
        console.error("Error in admin check:", err);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    }

    if (!authLoading) {
      checkAdminRole();
    }
  }, [user, authLoading]);

  return { isAdmin, isLoading: isLoading || authLoading, user };
}
