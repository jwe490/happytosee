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

// Skeleton for loading state
const MovieCardSkeleton = ({ index }: { index: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.08 }}
    className="flex items-center gap-4"
  >
    <span 
      className="text-3xl sm:text-4xl font-black w-10 text-right"
      style={{ color: "rgba(245, 245, 240, 0.15)" }}
    >
      {index + 1}
    </span>
    <div 
      className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl animate-pulse"
      style={{ backgroundColor: "rgba(245, 245, 240, 0.1)" }}
    />
    <div className="flex-1 space-y-3">
      <div 
        className="h-5 rounded-lg animate-pulse w-3/4"
        style={{ backgroundColor: "rgba(245, 245, 240, 0.1)" }}
      />
      <div 
        className="h-4 rounded-lg animate-pulse w-1/2"
        style={{ backgroundColor: "rgba(245, 245, 240, 0.08)" }}
      />
    </div>
  </motion.div>
);

// Movie card - horizontal list style
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
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        delay: 0.4 + index * 0.1, 
        duration: 0.5, 
        ease: [0.22, 1, 0.36, 1] 
      }}
      className="flex items-center gap-4 group"
    >
      {/* Rank number */}
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          delay: 0.5 + index * 0.1, 
          type: "spring",
          stiffness: 300,
          damping: 15
        }}
        className="text-3xl sm:text-4xl font-black w-10 text-right shrink-0"
        style={{ color: "rgba(245, 245, 240, 0.2)" }}
      >
        {index + 1}
      </motion.span>

      {/* Poster with hover effect */}
      <a
        href={`https://www.themoviedb.org/movie/${movie.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="relative shrink-0"
      >
        <motion.div
          whileHover={{ scale: 1.05, rotate: 2 }}
          whileTap={{ scale: 0.98 }}
          className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl overflow-hidden shadow-lg"
          style={{ backgroundColor: "rgba(245, 245, 240, 0.1)" }}
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
        
        {/* Coral accent on hover */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute -inset-1 rounded-xl border-2 pointer-events-none"
          style={{ borderColor: "#FF6B4A" }}
        />
      </a>

      {/* Movie info */}
      <div className="flex-1 min-w-0">
        <h3 
          className="font-bold text-base sm:text-lg truncate"
          style={{ color: "#F5F5F0" }}
        >
          {movie.title}
        </h3>
        <div 
          className="flex items-center gap-2 text-sm mt-1"
          style={{ color: "rgba(245, 245, 240, 0.6)" }}
        >
          <span>{movie.year}</span>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-current" style={{ color: "#FF6B4A" }} />
            <span>{movie.rating?.toFixed(1) || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Watchlist button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleWatchlistClick}
        aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
        className="p-3 rounded-full transition-all duration-200 shrink-0"
        style={{ 
          backgroundColor: inWatchlist ? "#FF6B4A" : "rgba(245, 245, 240, 0.1)",
          color: inWatchlist ? "#F5F5F0" : "rgba(245, 245, 240, 0.8)",
        }}
      >
        {inWatchlist ? (
          <BookmarkCheck className="w-5 h-5" />
        ) : (
          <Bookmark className="w-5 h-5" />
        )}
      </motion.button>
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
  const topMovies = movies.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      className="min-h-screen relative flex flex-col overflow-hidden"
      style={{ backgroundColor: "#2B2B2B" }}
    >
      {/* Subtle background shapes */}
      <FloatingShapes shapes={recommendationsShapes} variant="dark" />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col px-6 sm:px-8 lg:px-12 py-16 sm:py-20 max-w-xl mx-auto w-full">
        
        {/* Header section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-10"
        >
          {/* Decorative curved line */}
          <svg
            viewBox="0 0 200 50"
            className="w-28 h-10 mb-4"
            fill="none"
          >
            <motion.path
              d="M0 40 Q50 10 100 25 T200 15"
              stroke="rgba(245, 245, 240, 0.3)"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
            />
          </svg>

          {/* Title with highlight */}
          <div className="relative inline-flex items-center">
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 origin-left"
              style={{ backgroundColor: "#F5F5F0" }}
            />
            <span 
              className="relative z-10 px-4 py-2 font-display text-xl sm:text-2xl font-bold"
              style={{ color: "#2B2B2B" }}
            >
              Your top movies
            </span>
          </div>
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
              className="text-center py-16"
            >
              <div 
                className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(245, 245, 240, 0.1)" }}
              >
                <RefreshCw className="w-10 h-10" style={{ color: "rgba(245, 245, 240, 0.5)" }} />
              </div>
              <h3 
                className="text-xl font-bold mb-3"
                style={{ color: "#F5F5F0" }}
              >
                No matches found
              </h3>
              <p 
                className="mb-8"
                style={{ color: "rgba(245, 245, 240, 0.6)" }}
              >
                Try another mood for different recommendations
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onRetake}
                className="px-8 py-3 rounded-full font-bold transition-all"
                style={{ 
                  backgroundColor: "#F5F5F0",
                  color: "#2B2B2B",
                }}
              >
                Try Another Mood
              </motion.button>
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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex flex-col gap-3 mt-10"
          >
            {/* Primary share button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onShare}
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-base shadow-xl transition-all"
              style={{ 
                backgroundColor: "#FF6B4A",
                color: "#F5F5F0",
              }}
            >
              <Share2 className="w-5 h-5" />
              Share Your Story
            </motion.button>
            
            {/* Secondary retake button */}
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "rgba(245, 245, 240, 0.1)" }}
              whileTap={{ scale: 0.98 }}
              onClick={onRetake}
              className="flex items-center justify-center gap-3 px-8 py-3.5 rounded-full font-semibold text-sm border transition-all"
              style={{ 
                backgroundColor: "transparent",
                borderColor: "rgba(245, 245, 240, 0.3)",
                color: "rgba(245, 245, 240, 0.8)",
              }}
            >
              <RefreshCw className="w-4 h-4" />
              Retake Assessment
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Bottom decorative bars */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-0 left-0 right-0 h-20 overflow-hidden pointer-events-none"
      >
        <div className="flex justify-center gap-3 h-full items-end pb-4">
          {[0.3, 0.5, 0.7, 0.9, 0.6, 0.4, 0.8].map((height, i) => (
            <motion.div
              key={i}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 1.3 + i * 0.05, duration: 0.4 }}
              className="w-3 rounded-t-full origin-bottom"
              style={{ 
                height: `${height * 100}%`,
                backgroundColor: i % 2 === 0 ? "rgba(255, 107, 74, 0.3)" : "rgba(184, 164, 232, 0.3)",
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
