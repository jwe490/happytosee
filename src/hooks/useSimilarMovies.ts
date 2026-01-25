import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SimilarMovie {
  id: number;
  title: string;
  posterUrl: string;
  rating: number;
  year: number | null;
}

interface UseSimilarMoviesReturn {
  movies: SimilarMovie[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  reset: () => void;
}

export const useSimilarMovies = (movieId: number | null): UseSimilarMoviesReturn => {
  const [movies, setMovies] = useState<SimilarMovie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const loadingRef = useRef(false);

  const fetchSimilarMovies = useCallback(async (pageNum: number, isInitial = false) => {
    if (!movieId || loadingRef.current) return;

    loadingRef.current = true;

    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const { data, error } = await supabase.functions.invoke("similar-movies", {
        body: { movieId, page: pageNum },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      if (isInitial) {
        setMovies(data.movies || []);
      } else {
        setMovies(prev => [...prev, ...(data.movies || [])]);
      }

      setHasMore(data.hasMore || false);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching similar movies:", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      loadingRef.current = false;
    }
  }, [movieId]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || loadingRef.current) return;
    await fetchSimilarMovies(page + 1, false);
  }, [hasMore, isLoadingMore, page, fetchSimilarMovies]);

  const reset = useCallback(() => {
    setMovies([]);
    setPage(1);
    setHasMore(true);
    setIsLoading(false);
    setIsLoadingMore(false);
    loadingRef.current = false;

    if (movieId) {
      fetchSimilarMovies(1, true);
    }
  }, [movieId, fetchSimilarMovies]);

  return {
    movies,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    reset,
  };
};
