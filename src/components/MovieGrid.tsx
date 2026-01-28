import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MovieCard from "./MovieCard";
import ExpandedMovieView from "./ExpandedMovieView";
import { Loader2, Sparkles, ArrowUp, Popcorn } from "lucide-react";
import { Movie } from "@/hooks/useMovieRecommendations";
import { Button } from "@/components/ui/button";
import { useEngagementTracking } from "@/hooks/useEngagementTracking";

interface MovieGridProps {
  movies: Movie[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  enableInfiniteScroll?: boolean;
}

const MovieGrid = ({
  movies,
  isLoading,
  isLoadingMore = false,
  hasMore = true,
  onLoadMore,
  enableInfiniteScroll = true
}: MovieGridProps) => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { trackMovieClick, trackLoadMore, trackMovieView } = useEngagementTracking();

  // Infinite scroll with Intersection Observer
  const lastMovieRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoadingMore || !enableInfiniteScroll) return;
    
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && onLoadMore) {
        trackLoadMore();
        onLoadMore();
      }
    }, { threshold: 0.1, rootMargin: '100px' });
    
    if (node) observerRef.current.observe(node);
  }, [isLoadingMore, hasMore, onLoadMore, enableInfiniteScroll]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 1000);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  const handleMovieClick = (movie: Movie) => {
    trackMovieClick(movie.id, movie.title);
    trackMovieView(movie.id, movie.title);
    setSelectedMovie(movie);
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
    setTimeout(() => setSelectedMovie(null), 400);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6">
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Popcorn className="w-16 h-16 text-primary" />
        </motion.div>
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-lg text-muted-foreground font-medium"
        >
          Finding your perfect matches...
        </motion.p>
      </div>
    );
  }

  if (movies.length === 0) {
    return null;
  }

  // Track unique movies to prevent duplicates
  const seenIds = new Set<number>();
  const uniqueMovies = movies.filter(movie => {
    if (seenIds.has(movie.id)) return false;
    seenIds.add(movie.id);
    return true;
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <motion.div
          className="text-center space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold">
              Your Picks
            </h2>
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <p className="text-muted-foreground">
            {uniqueMovies.length} movies curated just for you
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
        >
          {uniqueMovies.map((movie, index) => {
            const isLastMovie = index === uniqueMovies.length - 1;
            
            return (
              <motion.div
                key={`${movie.id}-${index}`}
                ref={isLastMovie ? lastMovieRef : null}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
              >
                <MovieCard
                  movie={movie}
                  index={index}
                  onClick={() => handleMovieClick(movie)}
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Loading indicator for infinite scroll */}
        {isLoadingMore && (
          <div className="flex flex-col items-center gap-4 py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-8 h-8 text-primary" />
            </motion.div>
            <p className="text-sm text-muted-foreground">Loading more movies...</p>
          </div>
        )}

        {/* Manual load more button (fallback) */}
        <div ref={loadMoreRef} className="flex justify-center pt-4 pb-4">
          {hasMore && onLoadMore && !enableInfiniteScroll ? (
            <Button
              onClick={onLoadMore}
              disabled={isLoadingMore}
              size="lg"
              className="rounded-full px-10 py-6 font-semibold gap-3 shadow-lg hover:shadow-xl transition-all bg-foreground text-background hover:bg-foreground/90"
            >
              {isLoadingMore ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-5 h-5" />
                  </motion.div>
                  <span>Loading more...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Load More Movies</span>
                </>
              )}
            </Button>
          ) : uniqueMovies.length > 0 && !hasMore ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-6"
            >
              <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-muted">
                <Sparkles className="w-5 h-5 text-primary" />
                <p className="text-sm font-medium text-muted-foreground">
                  You've seen all {uniqueMovies.length} movies!
                </p>
              </div>
            </motion.div>
          ) : null}
        </div>
      </motion.div>

      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-20 right-4 z-40 p-4 rounded-full bg-primary text-primary-foreground shadow-xl hover:shadow-2xl transition-shadow"
            aria-label="Back to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <ExpandedMovieView
        movie={selectedMovie}
        isOpen={isExpanded}
        onClose={handleClose}
      />
    </>
  );
};

export default MovieGrid;
