import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Movie {
  id: number;
  title: string;
  rating: number;
  year: number;
  genre: string;
  language?: string;
  industry?: string;
  posterUrl: string;
  backdropUrl?: string;
  moodMatch: string;
  overview?: string;
}

export interface RecommendationParams {
  mood: string;
  languages: string[];
  genres: string[];
  industries: string[];
  duration: string;
  hiddenGems?: boolean;
  maxRuntime?: number;
}

export function useMovieRecommendations() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [previouslyRecommended, setPreviouslyRecommended] = useState<string[]>([]);
  const lastParamsRef = useRef<RecommendationParams | null>(null);
  const { toast } = useToast();

  const getRecommendations = useCallback(async (params: RecommendationParams, append = false) => {
    // If not appending, this is a fresh request - reset state
    if (!append) {
      setIsLoading(true);
      setHasMore(true);
      setPreviouslyRecommended([]);
      lastParamsRef.current = params;
    } else {
      setIsLoadingMore(true);
    }
    
    try {
      const previousTitles = append ? previouslyRecommended : [];
      
      const { data, error } = await supabase.functions.invoke("recommend-movies", {
        body: {
          ...params,
          previouslyRecommended: previousTitles,
        },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const newMovies = data.movies as Movie[];
      
      // Check if we've reached the end
      if (newMovies.length === 0) {
        setHasMore(false);
        if (append) {
          toast({
            title: "You've reached the end! 🎉",
            description: "No more movies for this mood. Try changing your filters!",
          });
        }
      } else {
        // Append or replace movies
        if (append) {
          setMovies((prev) => [...prev, ...newMovies]);
        } else {
          setMovies(newMovies);
        }
        
        // Track recommended movies to avoid repetition
        const newTitles = newMovies.map((m) => m.title);
        setPreviouslyRecommended((prev) => [...prev, ...newTitles]);

        if (!append) {
          toast({
            title: "Fresh recommendations!",
            description: `Found ${newMovies.length} movies matching your ${params.mood} mood`,
          });
        }
      }

    } catch (error: any) {
      console.error("Error getting recommendations:", error);
      
      let errorMessage = "Failed to get movie recommendations";
      if (error.message?.includes("Rate limit")) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
      } else if (error.message?.includes("Payment")) {
        errorMessage = "Service temporarily unavailable. Please try again later.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [previouslyRecommended, toast]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || !lastParamsRef.current) return;
    await getRecommendations(lastParamsRef.current, true);
  }, [getRecommendations, isLoadingMore, hasMore]);

  const clearHistory = useCallback(() => {
    setPreviouslyRecommended([]);
    setHasMore(true);
    toast({
      title: "History cleared",
      description: "You may see previously recommended movies again",
    });
  }, [toast]);

  const resetAll = useCallback(() => {
    setMovies([]);
    setPreviouslyRecommended([]);
    setHasMore(true);
    lastParamsRef.current = null;
  }, []);

  return {
    movies,
    isLoading,
    isLoadingMore,
    hasMore,
    getRecommendations,
    loadMore,
    clearHistory,
    resetAll,
    recommendedCount: previouslyRecommended.length,
  };
}
