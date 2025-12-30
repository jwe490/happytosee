import { useState, useCallback } from "react";
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
  moodMatch: string;
}

export interface RecommendationParams {
  mood: string;
  languages: string[];
  genres: string[];
  industries: string[];
  duration: string;
}

export function useMovieRecommendations() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previouslyRecommended, setPreviouslyRecommended] = useState<string[]>([]);
  const { toast } = useToast();

  const getRecommendations = useCallback(async (params: RecommendationParams) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("recommend-movies", {
        body: {
          ...params,
          previouslyRecommended,
        },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const newMovies = data.movies as Movie[];
      setMovies(newMovies);
      
      // Track recommended movies to avoid repetition
      const newTitles = newMovies.map((m) => m.title);
      setPreviouslyRecommended((prev) => [...prev, ...newTitles].slice(-50)); // Keep last 50

      toast({
        title: "Fresh recommendations!",
        description: `Found ${newMovies.length} movies matching your ${params.mood} mood`,
      });

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
    }
  }, [previouslyRecommended, toast]);

  const clearHistory = useCallback(() => {
    setPreviouslyRecommended([]);
    toast({
      title: "History cleared",
      description: "You may see previously recommended movies again",
    });
  }, [toast]);

  return {
    movies,
    isLoading,
    getRecommendations,
    clearHistory,
    recommendedCount: previouslyRecommended.length,
  };
}
