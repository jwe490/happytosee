import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  accent_color: string;
  favorite_genres: string[] | null;
  preferred_languages: string[] | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const { toast } = useToast();

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setAuthReady(true);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setAuthReady(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!authReady) return;
    
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No profile exists, create one
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            display_name: user.email?.split('@')[0] || 'User',
            accent_color: '#8B5CF6',
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
        } else {
          setProfile(newProfile);
        }
      } else if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, authReady]);

  useEffect(() => {
    if (authReady) {
      fetchProfile();
    }
  }, [fetchProfile, authReady]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      toast({ title: 'Profile updated successfully' });
      return { data, error: null };
    } catch (error: any) {
      toast({ title: 'Error updating profile', description: error.message, variant: 'destructive' });
      return { data: null, error };
    }
  };

  const updateAccentColor = async (color: string) => {
    return updateProfile({ accent_color: color });
  };

  return {
    profile,
    user,
    isLoading,
    authReady,
    updateProfile,
    updateAccentColor,
    refetch: fetchProfile,
  };
}
