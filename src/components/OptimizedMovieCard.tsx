import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Star, Bookmark, BookmarkCheck, Download } from "lucide-react";
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

  const handleDownloadPoster = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const highResUrl = movie.posterUrl?.replace("/w500/", "/original/") || movie.posterUrl;
    if (!highResUrl) return;
    
    try {
      const response = await fetch(highResUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${movie.title.replace(/[^a-zA-Z0-9]/g, "_")}_poster.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      window.open(highResUrl, "_blank");
    }
  }, [movie.posterUrl, movie.title]);

  return (
    <motion.div
      ref={ref}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.3) }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="cursor-pointer group relative"
    >
      {/* Card container */}
      <div className="rounded-xl overflow-hidden bg-card shadow-sm border border-border/50 transition-all duration-300 hover:shadow-md hover:border-border
                      md:flex md:flex-row md:aspect-auto
                      aspect-[2/3] relative">
        
        {/* Poster section */}
        <div className="relative md:w-36 lg:w-40 md:shrink-0 md:aspect-[2/3] aspect-[2/3] overflow-hidden">
          <div 
            className={cn(
              "absolute inset-0 bg-muted animate-pulse transition-opacity duration-300",
              isLoaded ? "opacity-0" : "opacity-100"
            )}
          />
          
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

          {/* Rating badge - mobile only */}
          <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm flex items-center gap-1 md:hidden">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-white text-xs font-medium">{movie.rating?.toFixed(1) || "N/A"}</span>
          </div>
        </div>

        {/* Desktop info panel */}
        <div className="hidden md:flex md:flex-col md:justify-between md:flex-1 md:p-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">
              {movie.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{movie.year}</span>
              <span>•</span>
              <span className="line-clamp-1">{movie.genre}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold">{movie.rating?.toFixed(1) || "N/A"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/50">
            <button
              onClick={handleWatchlistClick}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                inWatchlist 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
            >
              {inWatchlist ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
            <button
              onClick={handleDownloadPoster}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              title="Download HD poster"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile: Watchlist + hover overlay */}
        <button
          onClick={handleWatchlistClick}
          className={cn(
            "absolute top-2 right-2 p-2 rounded-lg backdrop-blur-sm transition-all duration-200 md:hidden",
            inWatchlist 
              ? "bg-primary text-primary-foreground" 
              : "bg-black/50 text-white hover:bg-black/70"
          )}
          aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
        >
          {inWatchlist ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile title below card */}
      <div className="mt-2 px-1 md:hidden">
        <p className="text-sm font-medium text-foreground line-clamp-1">{movie.title}</p>
        <p className="text-xs text-muted-foreground">{movie.year} • {movie.genre}</p>
      </div>
    </motion.div>
  );
});

OptimizedMovieCard.displayName = "OptimizedMovieCard";

export default OptimizedMovieCard;
