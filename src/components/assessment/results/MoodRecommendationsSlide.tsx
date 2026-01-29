import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWatchlist } from "@/hooks/useWatchlist";
import { Bookmark, BookmarkCheck, RefreshCw, Star, Share2, X } from "lucide-react";
import ExpandedMovieView from "@/components/ExpandedMovieView";
import { Movie } from "@/hooks/useMovieRecommendations";

// Popcorn illustration
const PopcornIllustration = () => (
  <svg
    viewBox="0 0 120 140"
    className="w-16 h-20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <motion.path
      d="M25 60 L35 130 L85 130 L95 60"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.8 }}
    />
    <motion.line x1="30" y1="80" x2="90" y2="80" stroke="currentColor" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4 }} />
    <motion.line x1="32" y1="100" x2="88" y2="100" stroke="currentColor" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5 }} />
    {[{ cx: 45, cy: 45, r: 12 }, { cx: 65, cy: 40, r: 14 }, { cx: 85, cy: 50, r: 10 }, { cx: 55, cy: 25, r: 11 }, { cx: 75, cy: 28, r: 9 }, { cx: 35, cy: 52, r: 8 }].map((kernel, i) => (
      <motion.circle key={i} cx={kernel.cx} cy={kernel.cy} r={kernel.r} stroke="currentColor" strokeWidth="1.5" fill="none" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.6 + i * 0.08, type: "spring" }} />
    ))}
  </svg>
);

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
    className="space-y-2"
  >
    <div className="aspect-[2/3] bg-muted rounded-xl animate-pulse relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
    <div className="h-4 bg-muted rounded-lg animate-pulse w-3/4" />
    <div className="h-3 bg-muted rounded-lg animate-pulse w-1/2" />
  </motion.div>
);

// Movie card component with internal navigation - FIXED to use internal modal
const MovieCard = ({ 
  movie, 
  index,
  onMovieClick,
}: { 
  movie: RecommendedMovie; 
  index: number;
  onMovieClick: (movie: RecommendedMovie) => void;
}) => {
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
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.1 + index * 0.05, type: "spring", stiffness: 300, damping: 25 }}
      className="group relative cursor-pointer touch-manipulation"
      onClick={() => onMovieClick(movie)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onMovieClick(movie)}
    >
      <div className="aspect-[2/3] rounded-xl overflow-hidden bg-muted shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-[1.03]">
        <img
          src={movie.posterUrl || '/placeholder.svg'}
          alt={movie.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-white text-sm font-medium line-clamp-2">{movie.title}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-white/70 text-xs">{movie.year}</span>
              <span className="text-primary text-xs font-medium">View Details →</span>
            </div>
          </div>
        </div>

        {/* Rating badge */}
        <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-white text-xs font-medium">{movie.rating?.toFixed(1) || 'N/A'}</span>
        </div>
      </div>

      {/* Watchlist button */}
      <button
        onClick={handleWatchlistClick}
        className={`absolute top-2 right-2 p-2 rounded-lg backdrop-blur-sm transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center ${
          inWatchlist 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-black/50 text-white hover:bg-black/70'
        }`}
        aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
      >
        {inWatchlist ? (
          <BookmarkCheck className="w-4 h-4" />
        ) : (
          <Bookmark className="w-4 h-4" />
        )}
      </button>

      {/* Title below card */}
      <div className="mt-2 px-1">
        <p className="text-sm font-medium text-foreground line-clamp-1">{movie.title}</p>
        <p className="text-xs text-muted-foreground">{movie.year} • {movie.genre || 'Movie'}</p>
      </div>
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
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const hasMovies = movies && movies.length > 0;
  const displayMood = mood.charAt(0).toUpperCase() + mood.slice(1);

  // CRITICAL FIX: Open internal movie modal instead of external TMDb link
  const handleMovieClick = useCallback((movie: RecommendedMovie) => {
    // Convert to Movie type for ExpandedMovieView
    const movieData: Movie = {
      id: movie.id,
      title: movie.title,
      rating: movie.rating,
      year: movie.year,
      genre: movie.genre || "",
      posterUrl: movie.posterUrl,
      moodMatch: `Perfect for your ${mood} mood`,
    };
    setSelectedMovie(movieData);
    setIsExpanded(true);
  }, [mood]);

  const handleCloseExpanded = useCallback(() => {
    setIsExpanded(false);
    // Delay clearing the movie to allow exit animation
    setTimeout(() => setSelectedMovie(null), 300);
  }, []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-background flex flex-col py-20 px-4 sm:px-6"
      >
        <div className="max-w-4xl mx-auto w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-foreground"
            >
              <PopcornIllustration />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-right"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Recommended for your</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">{displayMood} Mood</h2>
            </motion.div>
          </div>

          {/* Section heading */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <h3 className="text-lg font-semibold text-foreground">Movies For You</h3>
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Finding movies for your mood…" : "Tap any movie to see details"}
            </p>
          </motion.div>

          {/* Movies grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <MovieCardSkeleton key={i} index={i} />
                ))}
              </div>
            ) : !hasMovies ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No matches found
                </h3>
                <p className="text-muted-foreground mb-6">
                  Try another mood for different recommendations
                </p>
                <button
                  onClick={onRetake}
                  className="px-6 py-2.5 rounded-full bg-foreground text-background font-medium transition-opacity hover:opacity-90 min-h-[44px]"
                >
                  Try Another Mood
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {movies.map((movie, index) => (
                  <MovieCard 
                    key={movie.id} 
                    movie={movie} 
                    index={index}
                    onMovieClick={handleMovieClick}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Action buttons - FIXED with proper touch targets */}
          {hasMovies && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex gap-3 mt-8 justify-center flex-wrap"
            >
              <button
                onClick={onShare}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-foreground text-background font-medium transition-opacity hover:opacity-90 min-w-[140px] min-h-[48px] touch-manipulation"
              >
                <Share2 className="w-4 h-4" />
                Share Results
              </button>
              
              <button
                onClick={onRetake}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-muted font-medium text-foreground transition-colors hover:bg-muted/80 min-w-[140px] min-h-[48px] touch-manipulation"
              >
                <RefreshCw className="w-4 h-4" />
                Retake
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Expanded Movie View Modal - INTERNAL navigation, no external links */}
      <AnimatePresence>
        {isExpanded && selectedMovie && (
          <ExpandedMovieView
            movie={selectedMovie}
            isOpen={isExpanded}
            onClose={handleCloseExpanded}
          />
        )}
      </AnimatePresence>
    </>
  );
};
