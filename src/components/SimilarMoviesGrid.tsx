import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Clapperboard, Loader2, Sparkles, Film } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEngagementTracking } from "@/hooks/useEngagementTracking";
import { cn } from "@/lib/utils";

interface SimilarMovie {
  id: number;
  title: string;
  posterUrl: string;
  rating: number;
  year: number | null;
}

interface SimilarMoviesGridProps {
  movieId: number;
  initialMovies: SimilarMovie[];
  onMovieClick: (movie: SimilarMovie) => void;
}

// Extracted movie poster card for better performance and loading states
const MoviePosterCard = ({ 
  movie, 
  index, 
  isLast, 
  lastMovieRef, 
  onClick 
}: { 
  movie: SimilarMovie; 
  index: number; 
  isLast: boolean; 
  lastMovieRef: (node: HTMLDivElement | null) => void;
  onClick: (movie: SimilarMovie) => void;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div 
      ref={isLast ? lastMovieRef : null}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: Math.min(index * 0.02, 0.5), duration: 0.2 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onClick(movie)}
      className="cursor-pointer group"
    >
      <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted shadow-sm group-hover:shadow-lg transition-shadow duration-150 relative">
        {/* Loading skeleton */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        
        {/* Error fallback */}
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Film className="w-8 h-8 text-muted-foreground" />
          </div>
        ) : (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-300",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}
      </div>
      <p className="text-[10px] text-foreground line-clamp-1 mt-1.5 font-medium group-hover:text-primary transition-colors">
        {movie.title}
      </p>
      <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
        <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
        {movie.rating?.toFixed(1) || "N/A"}
        {movie.year && <span>• {movie.year}</span>}
      </div>
    </motion.div>
  );
};

const SimilarMoviesGrid = ({ movieId, initialMovies, onMovieClick }: SimilarMoviesGridProps) => {
  const [movies, setMovies] = useState<SimilarMovie[]>(initialMovies);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(2); // Start from page 2 since page 1 is already loaded
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastClickRef = useRef<number>(0);
  const clickedMovieRef = useRef<number | null>(null);
  const { trackSimilarMovieClick, trackLoadMore } = useEngagementTracking();

  // Reset when movie changes
  useEffect(() => {
    setMovies(initialMovies);
    setCurrentPage(2);
    setHasMore(initialMovies.length >= 10); // If we got less than 10, there might not be more
  }, [movieId, initialMovies]);

  // Fetch more similar movies
  const fetchMoreSimilar = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    trackLoadMore();
    
    try {
      const { data, error } = await supabase.functions.invoke("movie-details", {
        body: { movieId, page: currentPage },
      });
      
      if (error) throw error;
      
      const newMovies = data.similarMovies || [];
      
      if (newMovies.length === 0) {
        setHasMore(false);
      } else {
        // Filter out duplicates
        const existingIds = new Set(movies.map(m => m.id));
        const uniqueNewMovies = newMovies.filter((m: SimilarMovie) => !existingIds.has(m.id));
        
        if (uniqueNewMovies.length === 0) {
          setHasMore(false);
        } else {
          setMovies(prev => [...prev, ...uniqueNewMovies]);
          setCurrentPage(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error("Error loading more similar movies:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [movieId, currentPage, isLoadingMore, hasMore, movies, trackLoadMore]);

  // Intersection Observer for infinite scroll
  const lastMovieRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoadingMore) return;
    
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchMoreSimilar();
      }
    }, { threshold: 0.1, rootMargin: '100px' });
    
    if (node) observerRef.current.observe(node);
  }, [isLoadingMore, hasMore, fetchMoreSimilar]);

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  const handleMovieClick = useCallback((movie: SimilarMovie) => {
    const now = Date.now();
    
    // Debounce rapid clicks (300ms cooldown)
    if (now - lastClickRef.current < 300) {
      return;
    }
    
    // Prevent clicking the same movie twice
    if (clickedMovieRef.current === movie.id) {
      return;
    }
    
    lastClickRef.current = now;
    clickedMovieRef.current = movie.id;
    
    trackSimilarMovieClick(movie.id, movie.title);
    onMovieClick(movie);
    
    // Reset after a short delay
    setTimeout(() => {
      clickedMovieRef.current = null;
    }, 500);
  }, [onMovieClick, trackSimilarMovieClick]);

  if (movies.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
        <Clapperboard className="w-4 h-4 text-primary" />
        Similar Movies
        <span className="text-sm font-normal text-muted-foreground">({movies.length})</span>
      </h3>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
        {movies.map((similar, index) => {
          const isLastMovie = index === movies.length - 1;
          
          return (
            <MoviePosterCard
              key={similar.id}
              movie={similar}
              index={index}
              isLast={isLastMovie}
              lastMovieRef={lastMovieRef}
              onClick={handleMovieClick}
            />
          );
        })}
      </div>

      {/* Loading indicator */}
      {isLoadingMore && (
        <div className="flex items-center justify-center gap-2 py-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-5 h-5 text-primary" />
          </motion.div>
          <span className="text-sm text-muted-foreground">Loading more...</span>
        </div>
      )}

      {/* End indicator */}
      {!hasMore && movies.length > 10 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 py-4"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">You've seen all similar movies!</span>
        </motion.div>
      )}
      
      <div ref={loadMoreRef} />
    </div>
  );
};

export default SimilarMoviesGrid;
