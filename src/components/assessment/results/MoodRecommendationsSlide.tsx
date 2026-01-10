import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

// Popcorn illustration
const PopcornIllustration = () => (
  <svg
    viewBox="0 0 120 140"
    className="w-24 h-28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Bucket */}
    <motion.path
      d="M25 60 L35 130 L85 130 L95 60"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.8 }}
    />
    
    {/* Bucket stripes */}
    <motion.line
      x1="30"
      y1="80"
      x2="90"
      y2="80"
      stroke="currentColor"
      strokeWidth="1"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 0.4 }}
    />
    <motion.line
      x1="32"
      y1="100"
      x2="88"
      y2="100"
      stroke="currentColor"
      strokeWidth="1"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 0.5 }}
    />
    
    {/* Popcorn kernels */}
    {[
      { cx: 45, cy: 45, r: 12 },
      { cx: 65, cy: 40, r: 14 },
      { cx: 85, cy: 50, r: 10 },
      { cx: 55, cy: 25, r: 11 },
      { cx: 75, cy: 28, r: 9 },
      { cx: 35, cy: 52, r: 8 },
    ].map((kernel, i) => (
      <motion.circle
        key={i}
        cx={kernel.cx}
        cy={kernel.cy}
        r={kernel.r}
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6 + i * 0.08, type: "spring" }}
      />
    ))}
  </svg>
);

interface RecommendedMovie {
  id: number;
  title: string;
  year: number;
  rating: number;
  posterUrl: string;
  genre?: string;
}

interface MoodRecommendationsSlideProps {
  movies: RecommendedMovie[];
  isLoading: boolean;
  mood: string;
  onShare: () => void;
  onRetake: () => void;
}

export const MoodRecommendationsSlide = ({ 
  movies, 
  isLoading, 
  mood,
  onShare,
  onRetake 
}: MoodRecommendationsSlideProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background flex flex-col py-12 px-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-foreground"
        >
          <PopcornIllustration />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-right"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-widest">For Your</p>
          <h2 className="font-display text-2xl font-bold text-foreground capitalize">{mood} Mood</h2>
        </motion.div>
      </div>

      {/* Movies grid */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="aspect-[2/3] bg-muted rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {movies.slice(0, 4).map((movie, index) => (
              <motion.a
                key={movie.id}
                href={`https://www.themoviedb.org/movie/${movie.id}`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileTap={{ scale: 0.97 }}
                className="group relative aspect-[2/3] rounded-2xl overflow-hidden bg-muted"
              >
                <img
                  src={movie.posterUrl || '/placeholder.svg'}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-sm font-medium line-clamp-2">{movie.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-white/70 text-xs">{movie.year}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400 text-xs">★</span>
                        <span className="text-white/70 text-xs">{movie.rating?.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating badge - always visible */}
                <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm">
                  <span className="text-yellow-400 text-xs font-medium">★ {movie.rating?.toFixed(1)}</span>
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="flex gap-3 mt-6"
      >
        <button
          onClick={onShare}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full bg-foreground text-background font-medium transition-opacity hover:opacity-90"
        >
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          Share
        </button>
        
        <button
          onClick={onRetake}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-muted font-medium text-foreground transition-colors hover:bg-muted/80"
        >
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </button>
      </motion.div>
    </motion.div>
  );
};
