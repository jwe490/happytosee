import { useState, useEffect, useCallback, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Play, ChevronLeft, ChevronRight, Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface Movie {
  id: number;
  title: string;
  overview?: string;
  posterUrl: string;
  backdropUrl?: string;
  rating: number;
  year: number;
  genre?: string;
}

interface CinematicHeroCarouselProps {
  movies: Movie[];
  onMovieSelect: (movie: Movie) => void;
  autoPlayInterval?: number;
}

// Memoized background component
const HeroBackground = memo(({ movie, isActive }: { movie: Movie; isActive: boolean }) => {
  const backdropUrl = movie.backdropUrl || movie.posterUrl;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="absolute inset-0"
    >
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${backdropUrl})`,
          filter: "brightness(0.4) saturate(1.2)",
        }}
      />
      
      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
      
      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background)/0.8)_100%)]" />
    </motion.div>
  );
});
HeroBackground.displayName = "HeroBackground";

// Memoized poster thumbnail
const PosterThumbnail = memo(({ 
  movie, 
  isActive, 
  onClick 
}: { 
  movie: Movie; 
  isActive: boolean; 
  onClick: () => void;
}) => (
  <motion.button
    onClick={onClick}
    className="relative flex-shrink-0 group focus:outline-none"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.98 }}
    animate={{
      opacity: isActive ? 1 : 0.5,
    }}
    transition={{ type: "spring", stiffness: 300, damping: 25 }}
  >
    <div 
      className={`
        relative w-16 h-24 md:w-20 md:h-28 rounded-lg overflow-hidden
        transition-all duration-300
        ${isActive 
          ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg shadow-primary/20" 
          : "hover:ring-1 hover:ring-white/30"
        }
      `}
    >
      <img
        src={movie.posterUrl}
        alt={movie.title}
        className="w-full h-full object-cover"
        loading="lazy"
        draggable={false}
      />
      
      {/* Active indicator glow */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none"
        />
      )}
    </div>
  </motion.button>
));
PosterThumbnail.displayName = "PosterThumbnail";

export const CinematicHeroCarousel = memo(({
  movies,
  onMovieSelect,
  autoPlayInterval = 6000,
}: CinematicHeroCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMobile = useIsMobile();

  const currentMovie = movies[currentIndex];

  const goToSlide = useCallback((index: number) => {
    const targetIndex = ((index % movies.length) + movies.length) % movies.length;
    setCurrentIndex(targetIndex);
  }, [movies.length]);

  const goToNext = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const goToPrevious = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  const pauseAutoPlay = useCallback(() => {
    setIsAutoPlaying(false);
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
    }
    autoPlayTimerRef.current = setTimeout(() => {
      setIsAutoPlaying(true);
    }, 15000);
  }, []);

  // Auto-play effect
  useEffect(() => {
    if (!isAutoPlaying || movies.length <= 1) return;
    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isAutoPlaying, goToNext, autoPlayInterval, movies.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    };
  }, []);

  if (movies.length === 0) return null;

  return (
    <section className="relative w-full min-h-[70vh] md:min-h-[80vh] overflow-hidden">
      {/* Background layers */}
      <AnimatePresence mode="wait">
        <HeroBackground 
          key={currentMovie.id} 
          movie={currentMovie} 
          isActive={true} 
        />
      </AnimatePresence>

      {/* Content container */}
      <div className="relative z-10 h-full min-h-[70vh] md:min-h-[80vh] flex flex-col justify-end pb-8 md:pb-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
          {/* Movie info - animated on change */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMovie.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mb-8 md:mb-12 max-w-2xl"
            >
              {/* Badges */}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-bold text-white">
                    {currentMovie.rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-sm text-white/80 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                  {currentMovie.year}
                </span>
                {currentMovie.genre && (
                  <span className="text-sm text-white/70 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md hidden sm:inline-block">
                    {currentMovie.genre.split(",")[0]}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                {currentMovie.title}
              </h1>

              {/* Overview */}
              {currentMovie.overview && (
                <p className="text-white/80 text-sm md:text-base leading-relaxed line-clamp-2 md:line-clamp-3 mb-6">
                  {currentMovie.overview}
                </p>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  size="lg"
                  onClick={() => onMovieSelect(currentMovie)}
                  className="rounded-full px-6 md:px-8 gap-2 font-semibold shadow-lg shadow-primary/30"
                >
                  <Play className="w-5 h-5 fill-current" />
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onMovieSelect(currentMovie)}
                  className="rounded-full px-6 gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md"
                >
                  <Info className="w-5 h-5" />
                  <span className="hidden sm:inline">More Info</span>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Thumbnail navigation */}
          <div className="relative">
            {/* Navigation arrows - desktop */}
            {!isMobile && (
              <>
                <button
                  onClick={() => { goToPrevious(); pauseAutoPlay(); }}
                  className="absolute -left-12 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-md z-10"
                  aria-label="Previous movie"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => { goToNext(); pauseAutoPlay(); }}
                  className="absolute -right-12 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-md z-10"
                  aria-label="Next movie"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Thumbnails row */}
            <div className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {movies.slice(0, 8).map((movie, index) => (
                <PosterThumbnail
                  key={movie.id}
                  movie={movie}
                  isActive={index === currentIndex}
                  onClick={() => {
                    goToSlide(index);
                    pauseAutoPlay();
                  }}
                />
              ))}
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-1 mt-4">
              {movies.slice(0, 8).map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    goToSlide(index);
                    pauseAutoPlay();
                  }}
                  className="h-1 rounded-full transition-all duration-500 overflow-hidden"
                  style={{ 
                    width: index === currentIndex ? 32 : 8,
                    backgroundColor: index === currentIndex 
                      ? "hsl(var(--primary))" 
                      : "hsl(var(--muted-foreground) / 0.3)",
                  }}
                  aria-label={`Go to slide ${index + 1}`}
                >
                  {index === currentIndex && isAutoPlaying && (
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: autoPlayInterval / 1000, ease: "linear" }}
                      className="h-full bg-white/50"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-1.5 rounded-full bg-white/60"
          />
        </motion.div>
      </motion.div>
    </section>
  );
});

CinematicHeroCarousel.displayName = "CinematicHeroCarousel";
