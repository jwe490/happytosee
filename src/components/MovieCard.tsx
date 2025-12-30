import { motion } from "framer-motion";
import { Star, Calendar, Sparkles, Bookmark, BookmarkCheck, Play } from "lucide-react";
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
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.06, 
        duration: 0.5, 
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ y: -10, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="group relative cursor-pointer"
    >
      {/* Glass Card Container */}
      <div className="relative bg-card/60 backdrop-blur-xl rounded-3xl overflow-hidden border border-border/30 shadow-soft hover:shadow-card-hover transition-all duration-300">
        
        {/* Large Poster Section */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://picsum.photos/seed/${encodeURIComponent(movie.title.replace(/\s+/g, ''))}/400/600`;
            }}
            loading="lazy"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
          
          {/* Rating Badge - Glass effect */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.06 + 0.2, type: "spring", stiffness: 200 }}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30"
          >
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-bold text-white">{movie.rating}</span>
          </motion.div>

          {/* Watchlist Button - Glass */}
          {user && (
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              onClick={handleWatchlistClick}
              className={`absolute top-3 left-3 p-2.5 rounded-full transition-all duration-200 ${
                inWatchlist 
                  ? "bg-accent text-accent-foreground shadow-lg" 
                  : "bg-white/20 backdrop-blur-md border border-white/30 text-white opacity-0 group-hover:opacity-100"
              }`}
            >
              {inWatchlist ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </motion.button>
          )}

          {/* Play Button on Hover */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            whileHover={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <motion.div 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-lg flex items-center justify-center border border-white/40 shadow-2xl"
            >
              <Play className="w-7 h-7 text-white fill-white ml-1" />
            </motion.div>
          </motion.div>

          {/* Bottom Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
            {/* Year Tag */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px] font-medium">
                <Calendar className="w-2.5 h-2.5" />
                {movie.year}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px] font-medium truncate max-w-[100px]">
                {movie.genre}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-display text-base md:text-lg font-bold text-white line-clamp-2 leading-tight drop-shadow-lg">
              {movie.title}
            </h3>
          </div>
        </div>

        {/* Glass Bottom Section */}
        <div className="p-3 md:p-4 bg-gradient-to-b from-card/80 to-card backdrop-blur-sm space-y-2">
          {/* Mood Match */}
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-accent" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {movie.moodMatch}
            </p>
          </div>

          {/* Language pill */}
          {movie.language && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
                {movie.language}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;
