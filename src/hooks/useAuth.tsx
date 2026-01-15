import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (username: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (username: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  username: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert username to internal email format
const usernameToEmail = (username: string) => `${username.toLowerCase().trim()}@moodflix.app`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Extract username from email
        if (session?.user?.email) {
          const extractedUsername = session.user.email.split("@")[0];
          setUsername(extractedUsername);
        } else {
          setUsername(null);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user?.email) {
        const extractedUsername = session.user.email.split("@")[0];
        setUsername(extractedUsername);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (username: string, password: string) => {
    const trimmedUsername = username.trim().toLowerCase();
    
    // Validate username
    if (trimmedUsername.length < 3) {
      return { error: new Error("Username must be at least 3 characters") };
    }
    if (trimmedUsername.length > 20) {
      return { error: new Error("Username must be less than 20 characters") };
    }
    if (!/^[a-z0-9_]+$/.test(trimmedUsername)) {
      return { error: new Error("Username can only contain letters, numbers, and underscores") };
    }
    
    // Validate password
    if (password.length < 6) {
      return { error: new Error("Password must be at least 6 characters") };
    }

    const email = usernameToEmail(trimmedUsername);
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: trimmedUsername,
        },
      },
    });

    if (error) {
      // Make error messages more user-friendly
      if (error.message.includes("already registered")) {
        return { error: new Error("This username is already taken") };
      }
      return { error: new Error(error.message) };
    }

    return { error: null };
  };

  const signIn = async (username: string, password: string) => {
    const trimmedUsername = username.trim().toLowerCase();
    const email = usernameToEmail(trimmedUsername);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Make error messages more user-friendly
      if (error.message.includes("Invalid login credentials")) {
        return { error: new Error("Invalid username or password") };
      }
      return { error: new Error(error.message) };
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signUp,
        signIn,
        signOut,
        username,
      }}
    >
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
