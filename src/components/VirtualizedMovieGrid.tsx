import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, ArrowUp, Popcorn } from "lucide-react";
import OptimizedMovieCard from "./OptimizedMovieCard";
import ExpandedMovieView from "./ExpandedMovieView";
import { Button } from "@/components/ui/button";
import { useEngagementTracking } from "@/hooks/useEngagementTracking";
import { useHistoryState } from "@/hooks/useHistoryState";
import { Movie } from "@/hooks/useMovieRecommendations";
import { cn } from "@/lib/utils";

interface VirtualizedMovieGridProps {
  movies: Movie[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

const VirtualizedMovieGrid = ({
  movies,
  isLoading,
  isLoadingMore = false,
  hasMore = true,
  onLoadMore,
}: VirtualizedMovieGridProps) => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [columnCount, setColumnCount] = useState(5);
  const parentRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { trackMovieClick, trackLoadMore, trackMovieView } = useEngagementTracking();
  const { pushState } = useHistoryState();

  // Responsive column count
  useEffect(() => {
    const updateColumnCount = () => {
      const width = window.innerWidth;
      if (width < 640) setColumnCount(2);
      else if (width < 768) setColumnCount(3);
      else if (width < 1024) setColumnCount(4);
      else setColumnCount(5);
    };

    updateColumnCount();
    window.addEventListener("resize", updateColumnCount);
    return () => window.removeEventListener("resize", updateColumnCount);
  }, []);

  // Deduplicate movies
  const uniqueMovies = useMemo(() => {
    const seenIds = new Set<number>();
    return movies.filter(movie => {
      if (seenIds.has(movie.id)) return false;
      seenIds.add(movie.id);
      return true;
    });
  }, [movies]);

  // Calculate row count
  const rowCount = Math.ceil(uniqueMovies.length / columnCount);
  
  // Estimated row height (poster aspect ratio 2:3 + gap + title)
  const estimateRowHeight = useCallback(() => {
    const width = window.innerWidth;
    const containerWidth = Math.min(width - 32, 1280); // Account for padding
    const gap = width < 640 ? 16 : 24;
    const cardWidth = (containerWidth - gap * (columnCount - 1)) / columnCount;
    const cardHeight = cardWidth * 1.5; // 2:3 aspect ratio
    const titleHeight = 48; // Title + year text
    return cardHeight + titleHeight + gap;
  }, [columnCount]);

  const [rowHeight, setRowHeight] = useState(estimateRowHeight);

  useEffect(() => {
    const updateRowHeight = () => {
      setRowHeight(estimateRowHeight());
    };

    updateRowHeight();
    window.addEventListener("resize", updateRowHeight);
    return () => window.removeEventListener("resize", updateRowHeight);
  }, [estimateRowHeight]);

  // Virtual rows
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 3,
  });

  // Infinite scroll detection
  useEffect(() => {
    if (!loadMoreRef.current || !onLoadMore || isLoadingMore || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackLoadMore();
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [onLoadMore, isLoadingMore, hasMore, trackLoadMore]);

  // Back to top visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 1000);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMovieClick = useCallback((movie: Movie) => {
    trackMovieClick(movie.id, movie.title);
    trackMovieView(movie.id, movie.title);
    pushState(movie.id);
    setSelectedMovie(movie);
    setIsExpanded(true);
  }, [trackMovieClick, trackMovieView, pushState]);

  const handleClose = useCallback(() => {
    setIsExpanded(false);
    setTimeout(() => setSelectedMovie(null), 400);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6">
        <motion.div
          animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
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

  if (uniqueMovies.length === 0) {
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
        {/* Header */}
        <motion.div
          className="text-center space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold font-display">Your Picks</h2>
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <p className="text-muted-foreground">
            {uniqueMovies.length} movies curated just for you
          </p>
        </motion.div>

        {/* Virtualized Grid Container */}
        <div
          ref={parentRef}
          className="relative"
          style={{ height: rowVirtualizer.getTotalSize() }}
        >
          <div
            className={cn(
              "grid gap-4 md:gap-6",
              columnCount === 2 && "grid-cols-2",
              columnCount === 3 && "grid-cols-3",
              columnCount === 4 && "grid-cols-4",
              columnCount === 5 && "grid-cols-5"
            )}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const startIndex = virtualRow.index * columnCount;
              const rowMovies = uniqueMovies.slice(startIndex, startIndex + columnCount);

              return rowMovies.map((movie, colIndex) => {
                const index = startIndex + colIndex;
                return (
                  <OptimizedMovieCard
                    key={movie.id}
                    movie={movie}
                    index={index}
                    onClick={() => handleMovieClick(movie)}
                  />
                );
              });
            })}
          </div>
        </div>

        {/* Load more trigger */}
        <div ref={loadMoreRef} className="h-4" />

        {/* Loading more indicator */}
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

        {/* End of list */}
        {!hasMore && uniqueMovies.length > 0 && (
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
        )}
      </motion.div>

      {/* Back to top button */}
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

      {/* Expanded movie view */}
      <ExpandedMovieView
        movie={selectedMovie}
        isOpen={isExpanded}
        onClose={handleClose}
      />
    </>
  );
};

export default VirtualizedMovieGrid;
