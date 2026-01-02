import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MovieCard from "./MovieCard";
import ExpandedMovieView from "./ExpandedMovieView";
import { Loader2, Sparkles, ArrowUp, Popcorn } from "lucide-react";
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
            {movies.length} movies curated just for you
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
          {movies.map((movie, index) => (
            <motion.div
              key={`${movie.id}-${index}`}
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
          ))}
        </motion.div>

        {isLoadingMore && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                className="aspect-[2/3] rounded-2xl bg-muted/50"
              />
            ))}
          </div>
        )}

        <div ref={loadMoreRef} className="flex justify-center pt-4">
          {hasMore && onLoadMore ? (
            <Button
              onClick={onLoadMore}
              disabled={isLoadingMore}
              size="lg"
              className="rounded-full px-8 font-semibold gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Show More
                </>
              )}
            </Button>
          ) : movies.length > 0 && !hasMore ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-2 py-4"
            >
              <Sparkles className="w-6 h-6 text-primary" />
              <p className="text-sm text-muted-foreground font-medium">
                That's all for now!
              </p>
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
