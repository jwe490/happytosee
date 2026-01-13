import { motion } from "framer-motion";
import { useWatchlist } from "@/hooks/useWatchlist";
import { Bookmark, BookmarkCheck, RefreshCw, Star, Share2 } from "lucide-react";
import { FloatingShapes, recommendationsShapes } from "./FloatingShapes";

interface RecommendedMovie {
  id: number;
  title: string;
  year: number;
  rating: number;
  posterUrl: string;
  genre?: string;
}

interface MoodRecommendationsSlideProps {
  movies: RecommendedMovie[];
  isLoading: boolean;
  mood: string;
  onShare: () => void;
  onRetake: () => void;
}

// Skeleton card for loading state
const MovieCardSkeleton = ({ index }: { index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="flex items-center gap-4"
  >
    <span className="text-3xl font-black text-foreground/20 w-8">{index + 1}</span>
    <div className="w-16 h-24 bg-foreground/10 rounded-lg animate-pulse" />
    <div className="flex-1 space-y-2">
      <div className="h-5 bg-foreground/10 rounded-lg animate-pulse w-3/4" />
      <div className="h-4 bg-foreground/10 rounded-lg animate-pulse w-1/2" />
    </div>
  </motion.div>
);

// Movie card component - horizontal list style like Spotify
const MovieCard = ({ movie, index }: { movie: RecommendedMovie; index: number }) => {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const inWatchlist = isInWatchlist(movie.id);

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (inWatchlist) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist({
        id: movie.id,
        title: movie.title,
        poster_path: movie.posterUrl?.replace('https://image.tmdb.org/t/p/w500', '') || '',
        release_date: movie.year?.toString() || '',
        vote_average: movie.rating || 0,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-4 group"
    >
      {/* Rank number */}
      <span className="text-3xl sm:text-4xl font-black text-foreground/20 w-8 sm:w-10 text-right shrink-0">
        {index + 1}
      </span>

      {/* Poster */}
      <a
        href={`https://www.themoviedb.org/movie/${movie.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="relative shrink-0"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="w-16 h-24 sm:w-20 sm:h-28 rounded-lg overflow-hidden bg-foreground/10 shadow-md"
        >
          <img
            src={movie.posterUrl || '/placeholder.svg'}
            alt={movie.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        </motion.div>
      </a>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-foreground text-base sm:text-lg truncate">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{movie.year}</span>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span>{movie.rating?.toFixed(1) || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Watchlist button */}
      <button
        onClick={handleWatchlistClick}
        aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
        className={`p-2.5 rounded-full transition-all duration-200 shrink-0 ${
          inWatchlist 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-foreground/10 text-foreground hover:bg-foreground/20'
        }`}
      >
        {inWatchlist ? (
          <BookmarkCheck className="w-5 h-5" />
        ) : (
          <Bookmark className="w-5 h-5" />
        )}
      </button>
    </motion.div>
  );
};

export const MoodRecommendationsSlide = ({ 
  movies, 
  isLoading, 
  mood,
  onShare,
  onRetake 
}: MoodRecommendationsSlideProps) => {
  const hasMovies = movies && movies.length > 0;
  const displayMood = mood.charAt(0).toUpperCase() + mood.slice(1);
  const topMovies = movies.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      className="min-h-screen bg-foreground relative flex flex-col overflow-hidden"
    >
      {/* Subtle shapes on dark background */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <FloatingShapes shapes={recommendationsShapes} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col px-6 sm:px-8 py-16 sm:py-20 max-w-lg mx-auto w-full">
        {/* Header with decorative line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          {/* Decorative curved line */}
          <svg
            viewBox="0 0 200 60"
            className="w-32 h-12 mb-4 text-background/20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <motion.path
              d="M0 50 Q50 10 100 30 T200 20"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </svg>

          {/* Title with highlight */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative inline-block"
          >
            <span className="relative z-10 font-display text-xl sm:text-2xl font-bold text-foreground px-3 py-1">
              Your top movies
            </span>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 bg-background origin-left"
            />
          </motion.div>
        </motion.div>

        {/* Movies list */}
        <div className="flex-1">
          {isLoading ? (
            <div className="space-y-5">
              {[...Array(5)].map((_, i) => (
                <MovieCardSkeleton key={i} index={i} />
              ))}
            </div>
          ) : !hasMovies ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-background/10 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-background/50" />
              </div>
              <h3 className="text-lg font-semibold text-background mb-2">
                No matches found
              </h3>
              <p className="text-background/60 mb-6">
                Try another mood for different recommendations
              </p>
              <button
                onClick={onRetake}
                className="px-6 py-2.5 rounded-full bg-background text-foreground font-medium transition-opacity hover:opacity-90"
              >
                Try Another Mood
              </button>
            </motion.div>
          ) : (
            <div className="space-y-5">
              {topMovies.map((movie, index) => (
                <MovieCard key={movie.id} movie={movie} index={index} />
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        {hasMovies && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col gap-3 mt-8"
          >
            <button
              onClick={onShare}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-background text-foreground font-semibold text-sm shadow-lg hover:shadow-xl transition-shadow"
            >
              <Share2 className="w-4 h-4" />
              Share this story
            </button>
            
            <button
              onClick={onRetake}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-transparent border border-background/30 font-medium text-background/80 text-sm transition-colors hover:bg-background/10"
            >
              <RefreshCw className="w-4 h-4" />
              Retake Assessment
            </button>
          </motion.div>
        )}
      </div>

      {/* Bottom decorative stripes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden pointer-events-none"
      >
        <svg
          viewBox="0 0 400 100"
          className="w-full h-full text-background/10"
          fill="currentColor"
        >
          {/* Vertical stripes */}
          {[0, 20, 40, 60, 80, 100, 120].map((x, i) => (
            <motion.rect
              key={i}
              x={x + 50}
              y="0"
              width="12"
              height="100"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 1.1 + i * 0.05, duration: 0.4 }}
              style={{ transformOrigin: "bottom" }}
            />
          ))}
        </svg>
      </motion.div>
    </motion.div>
  );
};
