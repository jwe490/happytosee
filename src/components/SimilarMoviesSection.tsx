import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Clapperboard, Star } from "lucide-react";
import { useSimilarMovies } from "@/hooks/useSimilarMovies";
import { Skeleton } from "@/components/ui/skeleton";

interface SimilarMovie {
  id: number;
  title: string;
  posterUrl: string;
  rating: number;
  year: number | null;
}

interface SimilarMoviesSectionProps {
  movieId: number;
  onMovieClick: (movie: SimilarMovie) => void;
}

const MovieCardSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="aspect-[2/3] rounded-lg w-full" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-2 w-12" />
  </div>
);

export const SimilarMoviesSection = ({ movieId, onMovieClick }: SimilarMoviesSectionProps) => {
  const { movies, isLoading, isLoadingMore, hasMore, loadMore, reset } = useSimilarMovies(movieId);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    reset();
  }, [movieId, reset]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !isLoadingMore) {
        loadMore();
      }
    },
    [hasMore, isLoadingMore, loadMore]
  );

  useEffect(() => {
    const element = sentinelRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "200px",
      threshold: 0.1,
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current && element) {
        observerRef.current.unobserve(element);
      }
    };
  }, [handleObserver]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
          <Clapperboard className="w-4 h-4 text-primary" />
          Similar Movies
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (movies.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
        <Clapperboard className="w-4 h-4 text-primary" />
        Similar Movies
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {movies.map((similar, index) => (
          <motion.div
            key={`${similar.id}-${index}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.2 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onMovieClick(similar)}
            className="cursor-pointer group"
          >
            <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted shadow-sm group-hover:shadow-lg transition-shadow duration-150">
              <img
                src={similar.posterUrl}
                alt={similar.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <p className="text-[10px] text-foreground line-clamp-1 mt-1.5 font-medium group-hover:text-primary transition-colors">
              {similar.title}
            </p>
            <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
              <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
              {similar.rating}
            </div>
          </motion.div>
        ))}

        {isLoadingMore && (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <MovieCardSkeleton key={`skeleton-${i}`} />
            ))}
          </>
        )}
      </div>

      <div ref={sentinelRef} className="h-4" />
    </div>
  );
};
