import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
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

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchWatchlist = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("watchlist")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWatchlist(data || []);
    } catch (error: any) {
      console.error("Error fetching watchlist:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    } else {
      setWatchlist([]);
    }
  }, [user, fetchWatchlist]);

  const addToWatchlist = async (movie: {
    id: number;
    title: string;
    poster_path?: string;
    release_date?: string;
    vote_average?: number;
    overview?: string;
  }) => {
    if (!user) {
      toast.error("Please sign in to add movies to your watchlist");
      return false;
    }

    try {
      const { error } = await supabase.from("watchlist").insert({
        user_id: user.id,
        movie_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path || null,
        release_year: movie.release_date?.split("-")[0] || null,
        rating: movie.vote_average || null,
        overview: movie.overview || null,
      });

      if (error) {
        if (error.code === "23505") {
          toast.info("This movie is already in your watchlist");
          return false;
        }
        throw error;
      }

      await fetchWatchlist();
      toast.success(`Added "${movie.title}" to watchlist`);
      return true;
    } catch (error: any) {
      console.error("Error adding to watchlist:", error);
      toast.error("Failed to add movie to watchlist");
      return false;
    }
  };

  const removeFromWatchlist = async (movieId: number) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("watchlist")
        .delete()
        .eq("movie_id", movieId)
        .eq("user_id", user.id);

      if (error) throw error;

      setWatchlist((prev) => prev.filter((item) => item.movie_id !== movieId));
      toast.success("Removed from watchlist");
      return true;
    } catch (error: any) {
      console.error("Error removing from watchlist:", error);
      toast.error("Failed to remove movie");
      return false;
    }
  };

  const isInWatchlist = (movieId: number) => {
    return watchlist.some((item) => item.movie_id === movieId);
  };

  return {
    watchlist,
    isLoading,
    user,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    fetchWatchlist,
  };
};
