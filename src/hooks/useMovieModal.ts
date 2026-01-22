import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Movie } from "@/hooks/useMovieRecommendations";

/**
 * URL-driven movie modal hook
 * Synchronizes modal state with browser history via query params
 */
export const useMovieModal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  // Get movieId from URL
  const movieIdParam = searchParams.get("movieId");
  const isOpen = Boolean(movieIdParam);

  // Open movie modal - push query param to URL
  const openMovie = useCallback(
    (movie: Movie) => {
      setSelectedMovie(movie);
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set("movieId", String(movie.id));
          return newParams;
        },
        { replace: false } // Push to history stack
      );
    },
    [setSearchParams]
  );

  // Close movie modal - remove query param
  const closeMovie = useCallback(() => {
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.delete("movieId");
        return newParams;
      },
      { replace: true } // Replace to not add to history
    );
    // Delay clearing movie data for exit animation
    setTimeout(() => setSelectedMovie(null), 300);
  }, [setSearchParams]);

  // Handle browser back button - detect when movieId is removed
  useEffect(() => {
    if (!movieIdParam && selectedMovie) {
      // URL no longer has movieId, but we have a selected movie
      // This means user pressed back - close modal
      setSelectedMovie(null);
    }
  }, [movieIdParam, selectedMovie]);

  return {
    selectedMovie,
    isOpen,
    movieId: movieIdParam ? Number(movieIdParam) : null,
    openMovie,
    closeMovie,
  };
};
