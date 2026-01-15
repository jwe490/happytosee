import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface WatchlistItem {
  id: string;
  movie_id: number;
  title: string;
  poster_path: string | null;
  release_year: string | null;
  rating: number | null;
  overview: string | null;
  created_at: string;
}

const getStorageKey = (userId: string | null) => 
  userId ? `moodflix_watchlist_${userId}` : "moodflix_watchlist_guest";

export const useWatchlist = () => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const storageKey = getStorageKey(user?.id ?? null);

  // Load watchlist from localStorage on mount or when user changes
  useEffect(() => {
    const loadWatchlist = () => {
      setIsLoading(true);
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          setWatchlist(JSON.parse(stored));
        } else {
          setWatchlist([]);
        }
      } catch (error) {
        console.error("Error loading watchlist:", error);
        setWatchlist([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadWatchlist();
  }, [storageKey]);

  // Save watchlist to localStorage whenever it changes
  const saveWatchlist = useCallback((items: WatchlistItem[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (error) {
      console.error("Error saving watchlist:", error);
    }
  }, [storageKey]);

  const fetchWatchlist = useCallback(() => {
    // Re-load from storage
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setWatchlist(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error fetching watchlist:", error);
    }
  }, [storageKey]);

  const addToWatchlist = useCallback((movie: {
    id: number;
    title: string;
    poster_path?: string;
    release_date?: string;
    vote_average?: number;
    overview?: string;
  }) => {
    // Check if already in watchlist
    if (watchlist.some((item) => item.movie_id === movie.id)) {
      toast.info("This movie is already in your watchlist");
      return false;
    }

    const newItem: WatchlistItem = {
      id: `${user?.id || 'guest'}_${movie.id}_${Date.now()}`,
      movie_id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path || null,
      release_year: movie.release_date?.split("-")[0] || null,
      rating: movie.vote_average || null,
      overview: movie.overview || null,
      created_at: new Date().toISOString(),
    };

    const updatedWatchlist = [newItem, ...watchlist];
    setWatchlist(updatedWatchlist);
    saveWatchlist(updatedWatchlist);
    toast.success(`Added "${movie.title}" to watchlist`);
    return true;
  }, [watchlist, saveWatchlist, user?.id]);

  const removeFromWatchlist = useCallback((movieId: number) => {
    const updatedWatchlist = watchlist.filter((item) => item.movie_id !== movieId);
    setWatchlist(updatedWatchlist);
    saveWatchlist(updatedWatchlist);
    toast.success("Removed from watchlist");
    return true;
  }, [watchlist, saveWatchlist]);

  const isInWatchlist = useCallback((movieId: number) => {
    return watchlist.some((item) => item.movie_id === movieId);
  }, [watchlist]);

  return {
    watchlist,
    isLoading,
    user: !!user,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    fetchWatchlist,
  };
};
