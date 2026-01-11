import { motion } from "framer-motion";
import { useWatchlist } from "@/hooks/useWatchlist";
import { Bookmark, BookmarkCheck, RefreshCw, Star, Share2 } from "lucide-react";
import { toast } from "sonner";

// Popcorn illustration
const PopcornIllustration = () => (
  <svg
    viewBox="0 0 120 140"
    className="w-20 h-24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Bucket */}
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
    
    {/* Bucket stripes */}
    <motion.line
      x1="30"
      y1="80"
      x2="90"
      y2="80"
      stroke="currentColor"
      strokeWidth="1"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 0.4 }}
    />
    <motion.line
      x1="32"
      y1="100"
      x2="88"
      y2="100"
      stroke="currentColor"
      strokeWidth="1"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 0.5 }}
    />
    
    {/* Popcorn kernels */}
    {[
      { cx: 45, cy: 45, r: 12 },
      { cx: 65, cy: 40, r: 14 },
      { cx: 85, cy: 50, r: 10 },
      { cx: 55, cy: 25, r: 11 },
      { cx: 75, cy: 28, r: 9 },
      { cx: 35, cy: 52, r: 8 },
    ].map((kernel, i) => (
      <motion.circle
        key={i}
        cx={kernel.cx}
        cy={kernel.cy}
        r={kernel.r}
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6 + i * 0.08, type: "spring" }}
      />
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

// Loading skeleton component
const MovieCardSkeleton = ({ index }: { index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="space-y-2"
  >
    <div className="aspect-[2/3] bg-muted rounded-xl animate-pulse" />
    <div className="h-4 bg-muted rounded-lg animate-pulse w-3/4" />
    <div className="h-3 bg-muted rounded-lg animate-pulse w-1/2" />
  </motion.div>
);

// Movie card component
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.1 }}
      className="group relative"
    >
      <a
        href={`https://www.themoviedb.org/movie/${movie.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="aspect-[2/3] rounded-xl overflow-hidden bg-muted shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
          <img
            src={movie.posterUrl || '/placeholder.svg'}
            alt={movie.title}
            className="w-full h-full object-cover"
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
              </div>
            </div>
          </div>

          {/* Rating badge */}
          <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-white text-xs font-medium">{movie.rating?.toFixed(1) || 'N/A'}</span>
          </div>
        </div>
      </a>

      {/* Watchlist button */}
      <button
        onClick={handleWatchlistClick}
        className={`absolute top-2 right-2 p-2 rounded-lg backdrop-blur-sm transition-all duration-200 ${
          inWatchlist 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-black/50 text-white hover:bg-black/70'
        }`}
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
  const hasMovies = movies && movies.length > 0;
  const displayMood = mood.charAt(0).toUpperCase() + mood.slice(1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background flex flex-col py-20 px-4 sm:px-6"
    >
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
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
            transition={{ delay: 0.3 }}
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
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <h3 className="text-lg font-semibold text-foreground">Movies For You</h3>
          <p className="text-sm text-muted-foreground">Handpicked based on your mood preferences</p>
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
                No movies found for this mood
              </h3>
              <p className="text-muted-foreground mb-6">
                Try another mood or retake the assessment
              </p>
              <button
                onClick={onRetake}
                className="px-6 py-2.5 rounded-full bg-foreground text-background font-medium transition-opacity hover:opacity-90"
              >
                Try Another Mood
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {movies.map((movie, index) => (
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
            className="flex gap-3 mt-8 justify-center"
          >
            <button
              onClick={onShare}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-foreground text-background font-medium transition-opacity hover:opacity-90"
            >
              <Share2 className="w-4 h-4" />
              Share Results
            </button>
            
            <button
              onClick={onRetake}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-muted font-medium text-foreground transition-colors hover:bg-muted/80"
            >
              <RefreshCw className="w-4 h-4" />
              Retake
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
