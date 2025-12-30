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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.025, 
        duration: 0.2, 
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ y: -4, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative cursor-pointer"
    >
      {/* Minimal Glass Card */}
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-card/50 backdrop-blur-sm ring-1 ring-border/30 shadow-sm hover:shadow-xl hover:ring-border/50 transition-all duration-150">
        
        {/* Poster */}
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://picsum.photos/seed/${encodeURIComponent(movie.title.replace(/\s+/g, ''))}/400/600`;
          }}
          loading="lazy"
        />
        
        {/* Subtle glass overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
        
        {/* Rating - Glass pill */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md ring-1 ring-white/10">
          <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
          <span className="text-[10px] font-semibold text-white">{movie.rating}</span>
        </div>

        {/* Watchlist - Glass button */}
        {user && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleWatchlistClick}
            className={`absolute top-2 left-2 p-1.5 rounded-full transition-all duration-100 ${
              inWatchlist 
                ? "bg-accent text-accent-foreground" 
                : "bg-black/40 backdrop-blur-md ring-1 ring-white/10 text-white opacity-0 group-hover:opacity-100"
            }`}
          >
            {inWatchlist ? (
              <BookmarkCheck className="w-3 h-3" />
            ) : (
              <Bookmark className="w-3 h-3" />
            )}
          </motion.button>
        )}

        {/* Title on hover - Glass footer */}
        <div className="absolute inset-x-0 bottom-0 p-2.5 bg-black/40 backdrop-blur-md translate-y-full group-hover:translate-y-0 transition-transform duration-150 ease-out">
          <h3 className="font-display text-xs font-semibold text-white line-clamp-2 leading-tight">
            {movie.title}
          </h3>
          <p className="text-white/60 text-[9px] mt-0.5">
            {movie.year} • {movie.genre}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;
