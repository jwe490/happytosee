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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.04, 
        duration: 0.3, 
        ease: "easeOut"
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group cursor-pointer"
    >
      {/* Clean Card Container */}
      <div className="relative bg-card/40 backdrop-blur-md rounded-2xl overflow-hidden border border-border/20 shadow-sm hover:shadow-md transition-shadow duration-200">
        
        {/* Large Poster - Full Focus */}
        <div className="relative aspect-[2/3] overflow-hidden">
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
          
          {/* Subtle gradient at bottom only */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
          
          {/* Rating - Small, bottom corner, non-intrusive */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-[11px] font-semibold text-white">{movie.rating}</span>
          </div>

          {/* Watchlist Button - Top left, appears on hover */}
          {user && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleWatchlistClick}
              className={`absolute top-3 left-3 p-2 rounded-full transition-all duration-150 ${
                inWatchlist 
                  ? "bg-accent text-accent-foreground" 
                  : "bg-black/40 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100"
              }`}
            >
              {inWatchlist ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </motion.button>
          )}

          {/* Title overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="font-display text-sm md:text-base font-bold text-white line-clamp-2 leading-tight">
              {movie.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-white/70">{movie.year}</span>
              <span className="text-[10px] text-white/50">•</span>
              <span className="text-[10px] text-white/70 truncate">{movie.genre}</span>
            </div>
          </div>
        </div>

        {/* Minimal Info Section */}
        <div className="p-3 bg-card/60 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {movie.moodMatch}
          </p>
          {movie.language && (
            <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-secondary/50 text-muted-foreground">
              {movie.language}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;
