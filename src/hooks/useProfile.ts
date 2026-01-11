import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

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

const PROFILE_STORAGE_KEY = "moodflix_profile";

const defaultProfile: Profile = {
  id: 'local',
  user_id: 'local',
  display_name: 'Guest User',
  bio: null,
  avatar_url: null,
  accent_color: '#8B5CF6',
  favorite_genres: null,
  preferred_languages: null,
  is_public: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile from localStorage on mount
  useEffect(() => {
    const loadProfile = () => {
      try {
        const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
        if (stored) {
          setProfile(JSON.parse(stored));
        } else {
          setProfile(defaultProfile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setProfile(defaultProfile);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Save profile to localStorage whenever it changes
  const saveProfile = useCallback((updatedProfile: Profile) => {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  }, []);

  const updateProfile = useCallback((updates: Partial<Profile>) => {
    if (!profile) return { error: new Error('No profile') };

    const updatedProfile = { ...profile, ...updates, updated_at: new Date().toISOString() };
    setProfile(updatedProfile);
    saveProfile(updatedProfile);
    toast.success('Profile updated');
    return { data: updatedProfile, error: null };
  }, [profile, saveProfile]);

  const updateAccentColor = useCallback((color: string) => {
    return updateProfile({ accent_color: color });
  }, [updateProfile]);

  return {
    profile,
    user: true, // Always return true for guest mode
    isLoading,
    authReady: true, // Always ready since no auth
    updateProfile,
    updateAccentColor,
    refetch: () => {},
  };
}
