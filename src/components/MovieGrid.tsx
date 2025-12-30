import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import MovieCard from "./MovieCard";
import MovieExpandedView from "./MovieExpandedView";
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
    // Delay clearing selected movie to allow exit animation
    setTimeout(() => setSelectedMovie(null), 300);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const SkeletonCards = () => (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 mt-6">
      {[...Array(4)].map((_, i) => (
        <div 
          key={i} 
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
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 md:space-y-8"
      >
        <div className="text-center space-y-1 md:space-y-2">
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground">
            Your Personalized Picks
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            {movies.length} movies curated just for your current mood
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
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

        <div ref={loadMoreRef} className="flex flex-col items-center gap-4 pt-6 md:pt-8">
          {hasMore && onLoadMore ? (
            <Button
              onClick={onLoadMore}
              disabled={isLoadingMore}
              variant="outline"
              size="lg"
              className="rounded-full px-8 py-6 text-base font-display font-semibold gap-2 hover:bg-foreground hover:text-background transition-all duration-200"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading more...
                </>
              ) : (
                <>
                  <Film className="w-5 h-5" />
                  Load More 🎬
                </>
              )}
            </Button>
          ) : movies.length > 0 && !hasMore ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-3"
            >
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Sparkles className="w-5 h-5" />
                <span className="font-medium">You've reached the end! 🎉</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Try changing your mood or filters for more recommendations
              </p>
            </motion.div>
          ) : null}
        </div>
      </motion.div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-20 left-4 sm:left-6 z-40 p-3 rounded-full bg-card border border-border shadow-lg hover:shadow-xl transition-shadow duration-200"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5 text-foreground" />
        </motion.button>
      )}

      {/* Expanded View with Seamless Animation */}
      <MovieExpandedView
        movie={selectedMovie}
        isOpen={isExpanded}
        onClose={handleClose}
      />
    </>
  );
};

export default MovieGrid;