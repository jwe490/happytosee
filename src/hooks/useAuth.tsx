import { createContext, useContext, ReactNode } from "react";
import { useKeyAuth, KeyAuthProvider } from "@/hooks/useKeyAuth";
import { KeyUser } from "@/lib/keyAuth";

/**
 * Unified Auth Hook
 * This wraps useKeyAuth to provide a consistent auth interface across the app
 */

interface AuthContextType {
  user: KeyUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  username: string | null;
  displayName: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isLoading, isAuthenticated, signOut } = useKeyAuth();

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    username: user?.display_name?.toLowerCase().replace(/\s+/g, '_') || null,
    displayName: user?.display_name || null,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Re-export KeyAuthProvider for backwards compatibility
export { KeyAuthProvider };
