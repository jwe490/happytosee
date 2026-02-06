import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Star, Bookmark, BookmarkCheck, Download } from "lucide-react";
import { Movie } from "@/hooks/useMovieRecommendations";
import { useWatchlist } from "@/hooks/useWatchlist";
import { cn } from "@/lib/utils";

interface MovieCardProps {
  movie: Movie;
  index: number;
  onClick: () => void;
}

const MovieCard = ({ movie, index, onClick }: MovieCardProps) => {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, user } = useWatchlist();
  const inWatchlist = isInWatchlist(movie.id);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Prevent showing the previous poster while the new one loads.
  useEffect(() => {
    setImageLoaded(false);
  }, [movie.posterUrl, movie.id]);

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

  const handleDownloadPoster = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
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
      // Fallback: open in new tab
      window.open(highResUrl, "_blank");
    }
  }, [movie.posterUrl, movie.title]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: Math.min(index * 0.03, 0.3),
        duration: 0.3,
        ease: "easeOut"
      }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="group cursor-pointer"
    >
      {/* Desktop: Horizontal card layout | Mobile: Standard poster */}
      <div className="relative rounded-xl overflow-hidden bg-card shadow-sm border border-border/50 transition-all duration-300 hover:shadow-md hover:border-border
                      md:flex md:flex-row md:aspect-auto
                      aspect-[2/3]">
        
        {/* Poster */}
        <div className="relative md:w-36 lg:w-40 md:shrink-0 md:aspect-[2/3] aspect-[2/3] overflow-hidden">
          {/* Skeleton loader */}
          <div 
            className={cn(
              "absolute inset-0 bg-muted animate-pulse transition-opacity duration-300",
              imageLoaded ? "opacity-0" : "opacity-100"
            )}
          />
          
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://picsum.photos/seed/${encodeURIComponent(movie.title.replace(/\s+/g, ''))}/400/600`;
              setImageLoaded(true);
            }}
            loading="lazy"
            decoding="async"
          />

          {/* Rating Badge - on poster for mobile, hidden on desktop */}
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-sm md:hidden">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-semibold text-white">{movie.rating}</span>
          </div>

          {/* Watchlist Button - mobile overlay */}
          {user && (
            <button
              onClick={handleWatchlistClick}
              className={`absolute top-2 left-2 p-1.5 rounded-full transition-all md:hidden ${
                inWatchlist
                  ? "bg-accent text-accent-foreground"
                  : "bg-black/50 text-white opacity-0 group-hover:opacity-100"
              }`}
            >
              {inWatchlist ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Mobile gradient */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent md:hidden" />
        </div>

        {/* Desktop: Info panel beside poster */}
        <div className="hidden md:flex md:flex-col md:justify-between md:flex-1 md:p-4 md:min-h-0">
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">
              {movie.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{movie.year}</span>
              {movie.genre && (
                <>
                  <span>•</span>
                  <span className="line-clamp-1">{movie.genre}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold text-foreground">{movie.rating}</span>
              <span className="text-xs text-muted-foreground">/10</span>
            </div>
            {movie.language && (
              <span className="text-xs text-muted-foreground">{movie.language}</span>
            )}
          </div>

          {/* Desktop action row */}
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/50">
            {user && (
              <button
                onClick={handleWatchlistClick}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  inWatchlist 
                    ? "text-accent" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                title={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
              >
                {inWatchlist ? (
                  <BookmarkCheck className="w-4 h-4" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
            )}
            <button
              onClick={handleDownloadPoster}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              title="Download HD poster"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Movie Info - Mobile only, below card */}
      <div className="mt-2 space-y-0.5 px-1 md:hidden">
        <h3 className="font-medium text-foreground text-sm leading-tight line-clamp-2">
          {movie.title}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{movie.year}</span>
          {movie.genre && (
            <>
              <span>•</span>
              <span className="line-clamp-1">{movie.genre}</span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;
