import { useAdminAuth } from "./useAdminAuth";

// Re-export AdminRole type from useAdminAuth
export type { AdminRole } from "./useAdminAuth";

/**
 * Legacy hook for backwards compatibility
 * Use useAdminAuth directly for new code
 */
export function useAdminRole() {
  const { 
    role, 
    isAdmin, 
    isSuperAdmin, 
    isLoading, 
    user, 
    error, 
    refetch 
  } = useAdminAuth();

  // Map role to match legacy expectations
  const mappedRole = role || "user";
  const isModerator = role === "moderator" || isAdmin;
  const isAnalyst = role === "analyst" || isAdmin;

  return {
    role: mappedRole,
    isAdmin,
    isSuperAdmin,
    isModerator,
    isAnalyst,
    isLoading,
    user,
    error,
    refetch,
  };
}
