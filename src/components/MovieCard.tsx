import { motion } from "framer-motion";
import { Star, Bookmark, BookmarkCheck, Play } from "lucide-react";
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: index * 0.03,
        duration: 0.3,
        ease: "easeOut"
      }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative cursor-pointer"
    >
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-card shadow-md hover:shadow-2xl ring-1 ring-border/20 hover:ring-primary/50 transition-all duration-300">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://picsum.photos/seed/${encodeURIComponent(movie.title.replace(/\s+/g, ''))}/400/600`;
          }}
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/20 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-bold text-white">{movie.rating}</span>
        </div>

        {user && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleWatchlistClick}
            className={`absolute top-3 left-3 p-2 rounded-full transition-all duration-200 ${
              inWatchlist
                ? "bg-primary text-primary-foreground shadow-lg"
                : "bg-black/60 backdrop-blur-md text-white opacity-0 group-hover:opacity-100"
            }`}
          >
            {inWatchlist ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </motion.button>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileHover={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
          >
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </motion.div>
        </motion.div>

        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black via-black/90 to-transparent translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <h3 className="font-bold text-white text-sm leading-tight line-clamp-2 mb-1">
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 text-white/70 text-xs">
            <span>{movie.year}</span>
            <span>•</span>
            <span className="line-clamp-1">{movie.genre}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;
