import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Star, Bookmark, BookmarkCheck } from "lucide-react";
import { useProgressiveImage } from "@/hooks/useProgressiveImage";
import { useWatchlist } from "@/hooks/useWatchlist";
import { Movie } from "@/hooks/useMovieRecommendations";
import { cn } from "@/lib/utils";

interface OptimizedMovieCardProps {
  movie: Movie;
  index: number;
  onClick: () => void;
  style?: React.CSSProperties;
}

const OptimizedMovieCard = memo(({ movie, index, onClick, style }: OptimizedMovieCardProps) => {
  const { ref, src, isLoaded } = useProgressiveImage({
    src: movie.posterUrl,
    placeholder: "/placeholder.svg",
  });

  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const inWatchlist = isInWatchlist(movie.id);

  const handleWatchlistClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (inWatchlist) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist({
        id: movie.id,
        title: movie.title,
        poster_path: movie.posterUrl?.replace("https://image.tmdb.org/t/p/w500", "") || "",
        release_date: movie.year?.toString() || "",
        vote_average: movie.rating || 0,
        overview: movie.overview || "",
      });
    }
  }, [inWatchlist, movie, addToWatchlist, removeFromWatchlist]);

  return (
    <motion.div
      ref={ref}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.3) }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="cursor-pointer group relative"
    >
      {/* Card container */}
      <div className="aspect-[2/3] rounded-xl overflow-hidden bg-muted shadow-md hover:shadow-xl transition-all duration-300 relative">
        {/* Skeleton loading state */}
        <div 
          className={cn(
            "absolute inset-0 bg-muted animate-pulse transition-opacity duration-300",
            isLoaded ? "opacity-0" : "opacity-100"
          )}
        />
        
        {/* Image with blur-up and fade-in effect */}
        <img
          src={src}
          alt={movie.title}
          className={cn(
            "w-full h-full object-cover transition-all duration-500 ease-out",
            isLoaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-sm scale-105"
          )}
          loading="lazy"
          decoding="async"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-white text-sm font-medium line-clamp-2">{movie.title}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-white/70 text-xs">{movie.year}</span>
              <span className="text-white/70 text-xs">{movie.genre}</span>
            </div>
          </div>
        </div>

        {/* Rating badge */}
        <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-white text-xs font-medium">{movie.rating?.toFixed(1) || "N/A"}</span>
        </div>

        {/* Mood match badge */}
        {movie.moodMatch && (
          <div className="absolute top-2 right-10 px-2 py-1 rounded-lg bg-primary/80 backdrop-blur-sm">
            <span className="text-primary-foreground text-xs font-medium">{movie.moodMatch}</span>
          </div>
        )}
      </div>

      {/* Watchlist button */}
      <button
        onClick={handleWatchlistClick}
        className={cn(
          "absolute top-2 right-2 p-2 rounded-lg backdrop-blur-sm transition-all duration-200",
          inWatchlist 
            ? "bg-primary text-primary-foreground" 
            : "bg-black/50 text-white hover:bg-black/70"
        )}
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
        <p className="text-xs text-muted-foreground">{movie.year} • {movie.genre}</p>
      </div>
    </motion.div>
  );
});

OptimizedMovieCard.displayName = "OptimizedMovieCard";

export default OptimizedMovieCard;
