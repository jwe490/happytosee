import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { addToWatchlistApi, removeFromWatchlistApi } from "@/lib/userDataApi";
import { getStoredSession } from "@/lib/keyAuth";

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

export const useWatchlist = () => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch watchlist from backend via edge function
  const fetchWatchlist = useCallback(async () => {
    if (!user) {
      setWatchlist([]);
      setIsLoading(false);
      return;
    }

    const session = getStoredSession();
    if (!session?.token) {
      setWatchlist([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke("user-data", {
        body: {
          action: "get_watchlist",
          token: session.token,
          data: {},
        },
      });

      if (error) {
        console.error("[Watchlist] Fetch error:", error);
        setWatchlist([]);
      } else if (data?.watchlist) {
        setWatchlist(data.watchlist);
      } else {
        setWatchlist([]);
      }
    } catch (err) {
      console.error("[Watchlist] Exception:", err);
      setWatchlist([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load watchlist on mount or when user changes
  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const addToWatchlist = useCallback(async (movie: {
    id: number;
    title: string;
    poster_path?: string;
    release_date?: string;
    vote_average?: number;
    overview?: string;
  }) => {
    if (!user) {
      toast.error("Please sign in to add to watchlist");
      return false;
    }

    // Check if already in watchlist (optimistic)
    if (watchlist.some((item) => item.movie_id === movie.id)) {
      toast.info("This movie is already in your watchlist");
      return false;
    }

    // Optimistic update
    const tempItem: WatchlistItem = {
      id: `temp_${movie.id}_${Date.now()}`,
      movie_id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path || null,
      release_year: movie.release_date?.split("-")[0] || null,
      rating: movie.vote_average || null,
      overview: movie.overview || null,
      created_at: new Date().toISOString(),
    };
    
    setWatchlist(prev => [tempItem, ...prev]);

    const result = await addToWatchlistApi({
      movie_id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      rating: movie.vote_average,
      release_year: movie.release_date?.split("-")[0],
      overview: movie.overview,
    });

    if (result.error) {
      // Rollback optimistic update
      setWatchlist(prev => prev.filter(item => item.id !== tempItem.id));
      toast.error("Failed to add to watchlist");
      console.error(result.error);
      return false;
    }

    const data = result.data as { alreadyExists?: boolean } | undefined;
    if (data?.alreadyExists) {
      // Remove temp item, it already exists
      setWatchlist(prev => prev.filter(item => item.id !== tempItem.id));
      toast.info("This movie is already in your watchlist");
      return false;
    }

    // Refetch to get the real ID
    await fetchWatchlist();
    toast.success(`Added "${movie.title}" to watchlist`);
    return true;
  }, [user, watchlist, fetchWatchlist]);

  const removeFromWatchlist = useCallback(async (movieId: number) => {
    if (!user) return false;

    // Optimistic update
    const removedItem = watchlist.find(item => item.movie_id === movieId);
    setWatchlist(prev => prev.filter(item => item.movie_id !== movieId));

    const result = await removeFromWatchlistApi(movieId);

    if (result.error) {
      // Rollback
      if (removedItem) {
        setWatchlist(prev => [removedItem, ...prev]);
      }
      toast.error("Failed to remove from watchlist");
      console.error(result.error);
      return false;
    }

    toast.success("Removed from watchlist");
    return true;
  }, [user, watchlist]);

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
