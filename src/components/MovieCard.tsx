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
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      onClick={onClick}
      className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-foreground/30 transition-all duration-500 hover-lift cursor-pointer shadow-card"
    >
      {/* Poster Image */}
      <div className="relative aspect-[2/3] overflow-hidden bg-secondary">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://picsum.photos/seed/${encodeURIComponent(movie.title.replace(/\s+/g, ''))}/400/600`;
          }}
          loading="lazy"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent opacity-80" />
        
        {/* Rating Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground/90 backdrop-blur-sm">
          <Star className="w-4 h-4 fill-background text-background" />
          <span className="text-sm font-bold text-background">{movie.rating}</span>
        </div>

        {/* Watchlist Button */}
        {user && (
          <button
            onClick={handleWatchlistClick}
            className={`absolute top-4 left-4 p-2 rounded-full transition-all ${
              inWatchlist 
                ? "bg-accent text-accent-foreground" 
                : "bg-background/80 text-foreground opacity-0 group-hover:opacity-100"
            }`}
          >
            {inWatchlist ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5 space-y-2 md:space-y-3">
        <h3 className="font-display text-base md:text-xl font-semibold text-foreground line-clamp-2">
          {movie.title}
        </h3>
        
        <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 md:w-4 md:h-4" />
            <span>{movie.year}</span>
          </div>
          <div className="flex items-center gap-1 hidden sm:flex">
            <Film className="w-3 h-3 md:w-4 md:h-4" />
            <span>{movie.genre}</span>
          </div>
          {movie.language && (
            <div className="flex items-center gap-1 hidden md:flex">
              <Globe className="w-3 h-3 md:w-4 md:h-4" />
              <span>{movie.language}</span>
            </div>
          )}
        </div>

        {/* Mood Match - Hidden on small screens */}
        <div className="hidden sm:flex items-start gap-2 pt-2 border-t border-border/50">
          <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-accent mt-0.5 flex-shrink-0" />
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {movie.moodMatch}
          </p>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-accent/5 to-transparent" />
      </div>
    </motion.div>
  );
};

export default MovieCard;
