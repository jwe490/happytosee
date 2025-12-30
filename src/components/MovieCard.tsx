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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        delay: index * 0.03, 
        duration: 0.25, 
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative cursor-pointer"
    >
      {/* Clean Poster Card */}
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-muted shadow-md hover:shadow-xl transition-shadow duration-200">
        
        {/* Poster Image with layoutId for shared element transition */}
        <motion.div
          layoutId={`poster-${movie.id}`}
          className="absolute inset-0"
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30 
          }}
        >
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://picsum.photos/seed/${encodeURIComponent(movie.title.replace(/\s+/g, ''))}/400/600`;
            }}
            loading="lazy"
          />
        </motion.div>
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        
        {/* Rating Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.03 + 0.1, duration: 0.2 }}
          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm"
        >
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-[11px] font-semibold text-white">{movie.rating}</span>
        </motion.div>

        {/* Watchlist Button */}
        {user && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleWatchlistClick}
            className={`absolute top-2 left-2 p-1.5 rounded-md transition-all duration-150 ${
              inWatchlist 
                ? "bg-accent text-accent-foreground" 
                : "bg-black/60 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100"
            }`}
          >
            {inWatchlist ? (
              <BookmarkCheck className="w-3.5 h-3.5" />
            ) : (
              <Bookmark className="w-3.5 h-3.5" />
            )}
          </motion.button>
        )}

        {/* Title on hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out">
          <h3 className="font-display text-sm font-semibold text-white line-clamp-2 leading-snug">
            {movie.title}
          </h3>
          <p className="text-white/70 text-[10px] mt-0.5">
            {movie.year} • {movie.genre}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;
