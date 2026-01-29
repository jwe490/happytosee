import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Bookmark, BookmarkCheck } from "lucide-react";
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: Math.min(index * 0.03, 0.3),
        duration: 0.3,
        ease: "easeOut"
      }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-muted shadow-sm hover:shadow-lg transition-shadow duration-300">
        {/* Skeleton loader */}
        <div 
          className={cn(
            "absolute inset-0 bg-muted animate-pulse transition-opacity duration-300",
            imageLoaded ? "opacity-0" : "opacity-100"
          )}
        />
        
        {/* Poster Image with fade-in */}
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

        {/* Rating Badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-sm">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-semibold text-white">{movie.rating}</span>
        </div>

        {/* Watchlist Button */}
        {user && (
          <button
            onClick={handleWatchlistClick}
            className={`absolute top-2 left-2 p-1.5 rounded-full transition-all ${
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

        {/* Gradient for text readability */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
      </div>

      {/* Movie Info - Always visible below card */}
      <div className="mt-2 space-y-0.5 px-1">
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
