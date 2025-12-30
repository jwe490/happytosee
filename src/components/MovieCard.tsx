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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.02, duration: 0.2 }}
      onClick={onClick}
      className="group cursor-pointer active:scale-[0.98] transition-transform duration-100"
    >
      {/* Glass Card */}
      <div className="relative bg-white/70 dark:bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden border border-black/5 dark:border-white/10">
        
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden bg-muted">
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
          
          {/* Watchlist - Top left */}
          {user && (
            <button
              onClick={handleWatchlistClick}
              className={`absolute top-2 left-2 p-2 rounded-full transition-opacity duration-150 ${
                inWatchlist 
                  ? "bg-accent text-white" 
                  : "bg-black/40 text-white opacity-0 group-hover:opacity-100"
              }`}
            >
              {inWatchlist ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}

          {/* Title at bottom with solid gradient for readability */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <h3 className="font-semibold text-sm text-white line-clamp-2 leading-snug drop-shadow-sm">
              {movie.title}
            </h3>
            <p className="text-[11px] text-white/70 mt-0.5">{movie.year} • {movie.genre}</p>
          </div>
        </div>

        {/* Info Section - Minimal */}
        <div className="p-3 space-y-2">
          {/* Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
              <span className="text-sm font-medium text-foreground">{movie.rating}</span>
            </div>
            {movie.language && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {movie.language}
              </span>
            )}
          </div>
          
          {/* Mood match - one line */}
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {movie.moodMatch}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;