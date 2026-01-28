import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useKeyAuth } from "./useKeyAuth";

export type AdminRole = "super_admin" | "admin" | "moderator" | "analyst" | null;

export function useAdminAuth() {
  const { user, isLoading: authLoading } = useKeyAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [role, setRole] = useState<AdminRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAdminRole = useCallback(async () => {
    if (!user) {
      console.log("[AdminAuth] No user, setting non-admin state");
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setRole(null);
      setIsLoading(false);
      return;
    }

    console.log("[AdminAuth] Checking admin role for user:", user.id);
    setIsLoading(true);
    setError(null);

    try {
      // Use the RPC function for secure role checking
      const { data: roleData, error: rpcError } = await supabase.rpc("get_user_role", {
        _user_id: user.id,
      });

      if (rpcError) {
        console.error("[AdminAuth] RPC error:", rpcError);
        // Fallback to direct query if RPC fails
        const { data: directData, error: directError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .in("role", ["admin", "super_admin", "moderator", "analyst"])
          .limit(1)
          .maybeSingle();

        if (directError) {
          console.error("[AdminAuth] Direct query also failed:", directError);
          setError("Failed to verify admin status");
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setRole(null);
        } else if (directData) {
          const userRole = directData.role as AdminRole;
          console.log("[AdminAuth] Direct query role:", userRole);
          setRole(userRole);
          setIsAdmin(userRole === "admin" || userRole === "super_admin");
          setIsSuperAdmin(userRole === "super_admin");
        } else {
          console.log("[AdminAuth] No admin role found for user");
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setRole(null);
        }
      } else {
        const userRole = roleData as AdminRole;
        console.log("[AdminAuth] RPC returned role:", userRole);
        
        if (userRole === "super_admin" || userRole === "admin") {
          setIsAdmin(true);
          setIsSuperAdmin(userRole === "super_admin");
          setRole(userRole);
        } else if (userRole === "moderator" || userRole === "analyst") {
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setRole(userRole);
        } else {
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setRole(null);
        }
      }
    } catch (err) {
      console.error("[AdminAuth] Exception during role check:", err);
      setError("Network error checking admin status");
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      checkAdminRole();
    }
  }, [authLoading, checkAdminRole]);

  return { 
    isAdmin, 
    isSuperAdmin,
    role,
    isLoading: isLoading || authLoading, 
    user,
    error,
    refetch: checkAdminRole
  };
}
