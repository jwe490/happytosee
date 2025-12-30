import { motion } from "framer-motion";
import { Star, Calendar, Film, Sparkles, Globe } from "lucide-react";
import { Movie } from "@/hooks/useMovieRecommendations";

interface MovieCardProps {
  movie: Movie;
  index: number;
}

const MovieCard = ({ movie, index }: MovieCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      className="group relative glass rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-500 hover-lift"
    >
      {/* Poster Image */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent opacity-80" />
        
        {/* Rating Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/90 backdrop-blur-sm">
          <Star className="w-4 h-4 fill-primary-foreground text-primary-foreground" />
          <span className="text-sm font-bold text-primary-foreground">{movie.rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 space-y-3">
        <h3 className="font-display text-xl font-semibold text-foreground line-clamp-2">
          {movie.title}
        </h3>
        
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{movie.year}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Film className="w-4 h-4" />
            <span>{movie.genre}</span>
          </div>
          {movie.language && (
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4" />
              <span>{movie.language}</span>
            </div>
          )}
        </div>

        {/* Mood Match */}
        <div className="flex items-start gap-2 pt-2 border-t border-border/50">
          <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            {movie.moodMatch}
          </p>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
      </div>
    </motion.div>
  );
};

export default MovieCard;
