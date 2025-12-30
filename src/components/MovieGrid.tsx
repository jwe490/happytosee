import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import MovieCard from "./MovieCard";
import ExpandedMovieView from "./ExpandedMovieView";
import { Loader2, Film, Sparkles, ArrowUp } from "lucide-react";
import { Movie } from "@/hooks/useMovieRecommendations";
import { Button } from "@/components/ui/button";

interface MovieGridProps {
  movies: Movie[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

const MovieGrid = ({ 
  movies, 
  isLoading, 
  isLoadingMore = false, 
  hasMore = true,
  onLoadMore 
}: MovieGridProps) => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 1000);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
    // Delay clearing movie to allow exit animation
    setTimeout(() => setSelectedMovie(null), 400);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const SkeletonCards = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 mt-6">
      {[...Array(5)].map((_, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="aspect-[2/3] rounded-xl bg-muted animate-pulse"
        />
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse">
          Finding perfect movies for your mood...
        </p>
      </div>
    );
  }

  if (movies.length === 0) {
    return null;
  }

  return (
    <LayoutGroup>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 md:space-y-8"
      >
        <div className="text-center space-y-1">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
            Your Personalized Picks
          </h2>
          <p className="text-sm text-muted-foreground">
            {movies.length} movies curated just for you
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {movies.map((movie, index) => (
            <MovieCard 
              key={`${movie.id}-${index}`} 
              movie={movie} 
              index={index} 
              onClick={() => handleMovieClick(movie)}
            />
          ))}
        </div>

        {isLoadingMore && <SkeletonCards />}

        <div ref={loadMoreRef} className="flex flex-col items-center gap-4 pt-6">
          {hasMore && onLoadMore ? (
            <Button
              onClick={onLoadMore}
              disabled={isLoadingMore}
              variant="outline"
              size="lg"
              className="rounded-full px-8 font-display font-semibold gap-2 hover:bg-foreground hover:text-background transition-all duration-200"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Film className="w-4 h-4" />
                  Load More
                </>
              )}
            </Button>
          ) : movies.length > 0 && !hasMore ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-2"
            >
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">End of results</span>
              </div>
            </motion.div>
          ) : null}
        </div>
      </motion.div>

      {/* Back to Top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToTop}
            className="fixed bottom-20 left-4 z-40 p-3 rounded-full bg-card border border-border shadow-lg hover:shadow-xl transition-shadow duration-200"
            aria-label="Back to top"
          >
            <ArrowUp className="w-5 h-5 text-foreground" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded Movie View with shared element transition */}
      <ExpandedMovieView
        movie={selectedMovie}
        isOpen={isExpanded}
        onClose={handleClose}
      />
    </LayoutGroup>
  );
};

export default MovieGrid;
