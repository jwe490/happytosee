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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        delay: index * 0.04, 
        duration: 0.3, 
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="group relative cursor-pointer"
    >
      {/* Clean Poster Card */}
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-muted shadow-lg hover:shadow-2xl transition-shadow duration-300">
        
        {/* Poster Image - Full Coverage */}
        <motion.img
          layoutId={`movie-poster-${movie.id}`}
          src={movie.posterUrl}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://picsum.photos/seed/${encodeURIComponent(movie.title.replace(/\s+/g, ''))}/400/600`;
          }}
          loading="lazy"
        />
        
        {/* Subtle gradient at bottom for text readability */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Rating Badge - Minimal glass */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 + 0.15 }}
          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm"
        >
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-[11px] font-semibold text-white">{movie.rating}</span>
        </motion.div>

        {/* Watchlist Button - Appears on hover */}
        {user && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: inWatchlist ? 1 : 0, scale: inWatchlist ? 1 : 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleWatchlistClick}
            className={`absolute top-2 left-2 p-2 rounded-lg transition-all duration-200 ${
              inWatchlist 
                ? "bg-accent text-accent-foreground" 
                : "bg-black/50 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100"
            }`}
          >
            {inWatchlist ? (
              <BookmarkCheck className="w-3.5 h-3.5" />
            ) : (
              <Bookmark className="w-3.5 h-3.5" />
            )}
          </motion.button>
        )}

        {/* Title & Info - Appears on hover */}
        <motion.div 
          className="absolute inset-x-0 bottom-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"
        >
          <h3 className="font-display text-sm font-semibold text-white line-clamp-2 leading-snug drop-shadow-lg">
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-white/80 text-[10px]">
            <span>{movie.year}</span>
            <span>•</span>
            <span className="truncate">{movie.genre}</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MovieCard;
