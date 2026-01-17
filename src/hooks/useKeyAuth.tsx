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
      const stored = getStoredSession();
      
      if (stored && !isTokenExpired(stored.token)) {
        // Verify session is still valid on server
        try {
          const { data, error } = await supabase.functions.invoke('key-auth', {
            body: { action: 'verify', token: stored.token }
          });
          
          if (!error && data?.valid) {
            setUser(stored.user);
          } else {
            clearSession();
          }
        } catch {
          // If verification fails, still use cached user (offline support)
          setUser(stored.user);
        }
      } else if (stored) {
        // Token expired, clear it
        clearSession();
      }
      
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const signUp = useCallback(async (keyHash: string, profile: SignUpProfile) => {
    try {
      const { data, error } = await supabase.functions.invoke('key-auth', {
        body: {
          action: 'signup',
          keyHash,
          profile
        }
      });

      if (error) {
        console.error('Signup error:', error);
        return { error: new Error(error.message || 'Failed to create account') };
      }

      if (data?.error) {
        return { error: new Error(data.error) };
      }

      return { error: null, user: data.user as KeyUser };
    } catch (err: any) {
      return { error: new Error(err.message || 'Network error during signup') };
    }
  }, []);

  const signIn = useCallback(async (key: string, rememberMe = false) => {
    try {
      const keyHash = await hashKey(key);
      
      const { data, error } = await supabase.functions.invoke('key-auth', {
        body: {
          action: 'login',
          keyHash,
          rememberMe
        }
      });

      if (error) {
        console.error('Login error:', error);
        return { error: new Error('Invalid access key') };
      }

      if (data?.error) {
        return { error: new Error(data.error) };
      }

      if (data?.token && data?.user) {
        storeSession(data.token, data.user);
        setUser(data.user);
        return { error: null };
      }

      return { error: new Error('Invalid access key') };
    } catch (err: any) {
      return { error: new Error(err.message || 'Network error during login') };
    }
  }, []);

  const signOut = useCallback(async () => {
    const stored = getStoredSession();
    
    if (stored?.token) {
      try {
        await supabase.functions.invoke('key-auth', {
          body: { action: 'logout', token: stored.token }
        });
      } catch {
        // Ignore logout errors
      }
    }
    
    clearSession();
    setUser(null);
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
    } catch {
      // Ignore refresh errors
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
