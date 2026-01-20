import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  KeyUser,
  hashKey,
  storeSession,
  getStoredSession,
  clearSession,
  isTokenExpired,
} from "@/lib/keyAuth";

interface KeyAuthContextType {
  user: KeyUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (keyHash: string, profile: SignUpProfile) => Promise<{ error: Error | null; user?: KeyUser }>;
  signIn: (key: string, rememberMe?: boolean) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

interface SignUpProfile {
  display_name: string;
  date_of_birth?: string;
  gender?: string;
  purpose?: string;
}

const KeyAuthContext = createContext<KeyAuthContextType | undefined>(undefined);

export function KeyAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<KeyUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const stored = getStoredSession();

        if (!stored) {
          setIsLoading(false);
          return;
        }

        // Check if token is expired locally first
        if (isTokenExpired(stored.token)) {
          console.log("[KeyAuth] Token expired locally, clearing session");
          clearSession();
          setIsLoading(false);
          return;
        }

        // Verify session is still valid on server
        const { data, error } = await supabase.functions.invoke("key-auth", {
          body: { action: "verify", token: stored.token },
        });

        if (error) {
          console.error("[KeyAuth] Session verification failed:", error);
          clearSession();
          setUser(null);
        } else if (data?.valid) {
          console.log("[KeyAuth] Session verified successfully");
          setUser(stored.user);
        } else {
          console.log("[KeyAuth] Session invalid on server, clearing");
          clearSession();
          setUser(null);
        }
      } catch (err) {
        console.error("[KeyAuth] Error checking session:", err);
        clearSession();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const signUp = useCallback(async (keyHash: string, profile: SignUpProfile) => {
    try {
      console.log("[KeyAuth] Starting signup...");
      
      const { data, error } = await supabase.functions.invoke('key-auth', {
        body: {
          action: 'signup',
          keyHash,
          profile
        }
      });

      if (error) {
        console.error('[KeyAuth] Signup error:', error);
        return { error: new Error(error.message || 'Failed to create account') };
      }

      if (data?.error) {
        console.error('[KeyAuth] Signup response error:', data.error);
        return { error: new Error(data.error) };
      }

      console.log("[KeyAuth] Signup successful");
      return { error: null, user: data.user as KeyUser };
    } catch (err: any) {
      console.error('[KeyAuth] Signup exception:', err);
      return { error: new Error(err.message || 'Network error during signup') };
    }
  }, []);

  const signIn = useCallback(async (key: string, rememberMe = false) => {
    try {
      const normalizedKey = key.trim();

      if (!normalizedKey) {
        return { error: new Error("Please enter your secret key") };
      }

      console.log("[KeyAuth] Starting login...");
      
      // Hash the key
      const keyHash = await hashKey(normalizedKey);
      console.log("[KeyAuth] Key hashed, sending to backend...");

      // Call the backend
      const { data, error } = await supabase.functions.invoke("key-auth", {
        body: {
          action: "login",
          keyHash,
          rememberMe,
        },
      });

      console.log("[KeyAuth] Login response received:", { 
        hasData: !!data, 
        hasError: !!error,
        dataError: data?.error,
        hasToken: !!data?.token,
        hasUser: !!data?.user 
      });

      // Handle function invoke error
      if (error) {
        console.error("[KeyAuth] Function invoke error:", error);
        return { error: new Error("Unable to verify key. Please try again.") };
      }

      // Handle application-level error
      if (data?.error) {
        const msg = String(data.error);
        console.log("[KeyAuth] Application error:", msg);
        if (msg.toLowerCase().includes("invalid")) {
          return { error: new Error("Invalid or expired key. Please check and try again.") };
        }
        return { error: new Error(msg) };
      }

      // Handle successful login
      if (data?.token && data?.user) {
        console.log("[KeyAuth] Login successful, storing session...");
        storeSession(data.token, data.user, rememberMe);
        setUser(data.user);
        console.log("[KeyAuth] User state updated, login complete");
        return { error: null };
      }

      // Unexpected response
      console.error("[KeyAuth] Unexpected response format:", data);
      return { error: new Error("Invalid or expired key") };
    } catch (err: any) {
      console.error("[KeyAuth] Login exception:", err);
      return { error: new Error("Network error. Please check your connection.") };
    }
  }, []);

  const signOut = useCallback(async () => {
    console.log("[KeyAuth] Signing out...");
    const stored = getStoredSession();
    
    if (stored?.token) {
      try {
        await supabase.functions.invoke('key-auth', {
          body: { action: 'logout', token: stored.token }
        });
      } catch (err) {
        console.error("[KeyAuth] Logout backend call failed:", err);
        // Continue with local logout anyway
      }
    }
    
    clearSession();
    setUser(null);
    console.log("[KeyAuth] Sign out complete");
  }, []);

  const refreshSession = useCallback(async () => {
    const stored = getStoredSession();
    if (!stored) return;

    try {
      const { data, error } = await supabase.functions.invoke('key-auth', {
        body: { action: 'refresh', token: stored.token }
      });

      if (!error && data?.token && data?.user) {
        storeSession(data.token, data.user);
        setUser(data.user);
      }
    } catch (err) {
      console.error("[KeyAuth] Refresh session failed:", err);
    }
  }, []);

  return (
    <KeyAuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signUp,
        signIn,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </KeyAuthContext.Provider>
  );
}

export function useKeyAuth() {
  const context = useContext(KeyAuthContext);
  if (context === undefined) {
    throw new Error("useKeyAuth must be used within a KeyAuthProvider");
  }
  return context;
}
