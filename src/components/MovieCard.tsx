import { motion } from "framer-motion";
import { Star, Bookmark, BookmarkCheck } from "lucide-react";
import { Movie } from "@/hooks/useMovieRecommendations";
import { useWatchlist } from "@/hooks/useWatchlist";

interface MovieCardProps {
  movie: Movie;
  index: number;
  onClick: () => void;
}

const MovieCard = ({ movie, index, onClick }: MovieCardProps) => {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, user } = useWatchlist();
  const inWatchlist = isInWatchlist(movie.id);

  const handleWatchlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inWatchlist) {
      await removeFromWatchlist(movie.id);
    } else {
      await addToWatchlist({
        id: movie.id,
        title: movie.title,
        poster_path: movie.posterUrl?.replace("https://image.tmdb.org/t/p/w500", ""),
        release_date: String(movie.year),
        vote_average: movie.rating,
        overview: movie.moodMatch,
      });
    }
  };

  return (
    <motion.div
      layoutId={`movie-card-${movie.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.03, 
        duration: 0.25, 
        ease: "easeOut"
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group cursor-pointer"
    >
      {/* Glass Card Container */}
      <div className="relative bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/40 dark:border-white/10 shadow-sm hover:shadow-lg transition-shadow duration-200">
        
        {/* Poster Section - Clean, no overlays */}
        <motion.div 
          layoutId={`movie-poster-${movie.id}`}
          className="relative aspect-[2/3] overflow-hidden"
        >
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://picsum.photos/seed/${encodeURIComponent(movie.title.replace(/\s+/g, ''))}/400/600`;
            }}
            loading="lazy"
          />
          
          {/* Watchlist Button - Top left, appears on hover */}
          {user && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleWatchlistClick}
              className={`absolute top-2 left-2 p-2 rounded-full transition-all duration-150 ${
                inWatchlist 
                  ? "bg-accent text-accent-foreground" 
                  : "bg-black/30 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100"
              }`}
            >
              {inWatchlist ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </motion.button>
          )}

          {/* Title overlay at bottom of poster */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
            <motion.h3 
              layoutId={`movie-title-${movie.id}`}
              className="font-display text-sm md:text-base font-bold text-white line-clamp-2 leading-tight"
            >
              {movie.title}
            </motion.h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-white/80">{movie.year}</span>
              <span className="text-[10px] text-white/50">•</span>
              <span className="text-[10px] text-white/80 truncate">{movie.genre}</span>
            </div>
          </div>
        </motion.div>

        {/* Glass Info Section - Rating moved here */}
        <div className="p-3 bg-white/80 dark:bg-card/80 backdrop-blur-sm space-y-2">
          {/* Rating in white section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
              <span className="text-sm font-semibold text-foreground">{movie.rating}</span>
            </div>
            {movie.language && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/60 text-muted-foreground">
                {movie.language}
              </span>
            )}
          </div>
          
          {/* Mood match */}
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {movie.moodMatch}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;