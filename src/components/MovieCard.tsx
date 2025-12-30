import { motion } from "framer-motion";
import { Star, Calendar, Film, Sparkles, Globe, Bookmark, BookmarkCheck } from "lucide-react";
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
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.08, 
        duration: 0.4, 
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ y: -8, transition: { duration: 0.25 } }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative bg-card rounded-3xl overflow-hidden border border-border/50 hover:border-border transition-all duration-300 cursor-pointer shadow-soft hover:shadow-card-hover"
    >
      {/* Image Container with rounded inner corners */}
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary m-2 md:m-3 rounded-2xl">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://picsum.photos/seed/${encodeURIComponent(movie.title.replace(/\s+/g, ''))}/400/600`;
          }}
          loading="lazy"
        />
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
        
        {/* Rating Badge - Floating pill */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-foreground/90 backdrop-blur-md shadow-lg">
          <Star className="w-3 h-3 fill-background text-background" />
          <span className="text-xs font-bold text-background">{movie.rating}</span>
        </div>

        {/* Watchlist Button */}
        {user && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleWatchlistClick}
            className={`absolute top-3 left-3 p-2 rounded-full transition-all duration-200 shadow-lg ${
              inWatchlist 
                ? "bg-accent text-accent-foreground" 
                : "bg-background/80 backdrop-blur-md text-foreground opacity-0 group-hover:opacity-100"
            }`}
          >
            {inWatchlist ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </motion.button>
        )}

        {/* Play indicator on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.div 
            initial={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            className="w-14 h-14 rounded-full bg-background/90 backdrop-blur-md flex items-center justify-center shadow-xl group-hover:scale-100 transition-transform duration-300"
          >
            <Film className="w-6 h-6 text-foreground ml-0.5" />
          </motion.div>
        </div>
      </div>

      {/* Content Section - Clean and minimal */}
      <div className="px-3 md:px-4 pb-3 md:pb-4 pt-1 space-y-2">
        {/* Meta tags */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {movie.year}
          </span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span className="truncate">{movie.genre}</span>
        </div>

        {/* Title */}
        <h3 className="font-display text-sm md:text-base font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-200">
          {movie.title}
        </h3>
        
        {/* Mood Match - Compact pill */}
        <div className="flex items-center gap-2 pt-1">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-accent/10 text-accent">
            <Sparkles className="w-3 h-3" />
            <span className="text-[10px] md:text-xs font-medium truncate max-w-[120px] md:max-w-[160px]">
              {movie.moodMatch?.split(' ').slice(0, 3).join(' ')}...
            </span>
          </div>
        </div>

        {/* Language tag - subtle */}
        {movie.language && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
            <Globe className="w-2.5 h-2.5" />
            <span>{movie.language}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MovieCard;
