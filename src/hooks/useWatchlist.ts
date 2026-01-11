import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

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

const WATCHLIST_STORAGE_KEY = "moodflix_watchlist";

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load watchlist from localStorage on mount
  useEffect(() => {
    const loadWatchlist = () => {
      try {
        const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
        if (stored) {
          setWatchlist(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Error loading watchlist:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWatchlist();
  }, []);

  // Save watchlist to localStorage whenever it changes
  const saveWatchlist = useCallback((items: WatchlistItem[]) => {
    try {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Error saving watchlist:", error);
    }
  }, []);

  const fetchWatchlist = useCallback(() => {
    // No-op for local storage version
  }, []);

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
      id: `local_${movie.id}_${Date.now()}`,
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
  }, [watchlist, saveWatchlist]);

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
    user: true, // Always return true for guest mode
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    fetchWatchlist,
  };
};
