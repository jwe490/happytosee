import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { Star, Play, ChevronLeft, ChevronRight } from "lucide-react";
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

interface CinematicCarouselProps {
  movies: Movie[];
  onMovieSelect: (movie: Movie) => void;
  autoPlayInterval?: number;
}

export const CinematicCarousel = ({
  movies,
  onMovieSelect,
  autoPlayInterval = 5000,
}: CinematicCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(0);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);

  const goToSlide = useCallback(
    (index: number, dir?: number) => {
      const targetIndex = ((index % movies.length) + movies.length) % movies.length;
      setDirection(dir ?? (targetIndex > currentIndex ? 1 : -1));
      setCurrentIndex(targetIndex);
    },
    [movies.length, currentIndex]
  );

  const goToNext = useCallback(() => {
    goToSlide(currentIndex + 1, 1);
  }, [currentIndex, goToSlide]);

  const goToPrevious = useCallback(() => {
    goToSlide(currentIndex - 1, -1);
  }, [currentIndex, goToSlide]);

  const pauseAutoPlay = useCallback(() => {
    setIsAutoPlaying(false);
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
    }
    autoPlayTimerRef.current = setTimeout(() => {
      setIsAutoPlaying(true);
    }, 10000);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || movies.length <= 1) return;
    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isAutoPlaying, goToNext, autoPlayInterval, movies.length]);

  useEffect(() => {
    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    };
  }, []);

  // Responsive dimensions
  const getCenterDimensions = () => {
    if (isMobile) return { width: 200, height: 280 };
    return { width: 300, height: 420 };
  };

  const getPillDimensions = (position: number) => {
    // Pills get smaller as they go further from center
    const basePillWidth = isMobile ? 32 : 48;
    const basePillHeight = isMobile ? 100 : 160;
    const scaleFactor = 1 - position * 0.2;
    
    return {
      width: Math.round(basePillWidth * scaleFactor),
      height: Math.round(basePillHeight * scaleFactor),
    };
  };

  const getSlidePosition = (offset: number) => {
    const absOffset = Math.abs(offset);
    const { width: centerWidth } = getCenterDimensions();
    
    if (offset === 0) return 0;
    
    const direction = offset > 0 ? 1 : -1;
    const baseGap = isMobile ? 20 : 40;
    
    // Calculate cumulative position
    let position = centerWidth / 2 + baseGap;
    
    for (let i = 1; i < absOffset; i++) {
      const { width: pillWidth } = getPillDimensions(i);
      position += pillWidth + (isMobile ? 8 : 16);
    }
    
    return direction * position;
  };

  // Get visible slides based on screen size
  const getVisibleSlides = () => {
    const slides = [];
    const range = isMobile ? 2 : 3;
    
    for (let offset = -range; offset <= range; offset++) {
      const index = ((currentIndex + offset) % movies.length + movies.length) % movies.length;
      slides.push({ movie: movies[index], offset, index });
    }
    return slides;
  };

  if (movies.length === 0) return null;

  const { width: centerWidth, height: centerHeight } = getCenterDimensions();

  // Spring config for smooth morphing
  const springConfig = {
    type: "spring" as const,
    stiffness: 200,
    damping: 28,
    mass: 1,
  };

  return (
    <section className="relative w-full py-8 md:py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Featured Movies
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Handpicked for your mood
            </p>
          </div>
          
          {/* Navigation arrows - desktop only */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => { goToPrevious(); pauseAutoPlay(); }}
              className="p-2.5 rounded-full bg-muted/80 hover:bg-muted text-foreground transition-colors"
              aria-label="Previous movie"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => { goToNext(); pauseAutoPlay(); }}
              className="p-2.5 rounded-full bg-muted/80 hover:bg-muted text-foreground transition-colors"
              aria-label="Next movie"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div 
          ref={containerRef}
          className="relative flex items-center justify-center"
          style={{ height: centerHeight + 60 }}
        >
          {/* Ambient glow behind center card */}
          <motion.div
            className="absolute rounded-[60px] opacity-40 blur-3xl pointer-events-none"
            style={{
              width: centerWidth * 0.8,
              height: centerHeight * 0.6,
              background: `linear-gradient(135deg, hsl(var(--primary) / 0.4), hsl(var(--accent) / 0.3))`,
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Slides */}
          <AnimatePresence initial={false} mode="popLayout">
            {getVisibleSlides().map(({ movie, offset, index }) => {
              const isCenter = offset === 0;
              const absOffset = Math.abs(offset);
              
              // Morphing dimensions
              const dimensions = isCenter 
                ? getCenterDimensions() 
                : getPillDimensions(absOffset);
              
              const xPos = getSlidePosition(offset);
              
              // Opacity and scale
              const opacity = isCenter ? 1 : Math.max(0.3, 1 - absOffset * 0.25);
              const zIndex = isCenter ? 50 : 40 - absOffset * 10;
              
              // Border radius morphs from pill to rounded rectangle
              const borderRadius = isCenter ? 24 : dimensions.width / 2;

              return (
                <motion.div
                  key={`${movie.id}-${index}`}
                  className="absolute cursor-pointer"
                  layout
                  initial={{ 
                    x: direction > 0 ? 300 : -300, 
                    opacity: 0,
                    scale: 0.8,
                  }}
                  animate={{
                    x: xPos,
                    width: dimensions.width,
                    height: dimensions.height,
                    opacity,
                    scale: 1,
                    zIndex,
                  }}
                  exit={{ 
                    x: direction > 0 ? -300 : 300, 
                    opacity: 0,
                    scale: 0.8,
                  }}
                  transition={springConfig}
                  onClick={() => {
                    if (isCenter) {
                      onMovieSelect(movie);
                    } else {
                      goToSlide(index, offset > 0 ? 1 : -1);
                      pauseAutoPlay();
                    }
                  }}
                  whileHover={isCenter ? { scale: 1.02 } : { scale: 1.1, opacity: 0.9 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Card container with morphing border radius */}
                  <motion.div
                    className="relative w-full h-full overflow-hidden"
                    animate={{ borderRadius }}
                    transition={springConfig}
                    style={{
                      boxShadow: isCenter
                        ? "0 30px 60px -15px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)"
                        : "0 10px 30px -10px rgba(0,0,0,0.3)",
                    }}
                  >
                    {/* Poster Image */}
                    <motion.img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      draggable={false}
                      style={{ 
                        filter: isCenter ? "none" : "brightness(0.7) saturate(0.8)",
                      }}
                    />

                    {/* Gradient overlay - only on center */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
                      initial={false}
                      animate={{ opacity: isCenter ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* Content overlay - only on center */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 p-4 md:p-5"
                      initial={false}
                      animate={{
                        y: isCenter ? 0 : 30,
                        opacity: isCenter ? 1 : 0,
                      }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <div className="space-y-2.5">
                        {/* Rating & Year badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10">
                            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs font-bold text-white">
                              {movie.rating.toFixed(1)}
                            </span>
                          </div>
                          <span className="text-xs text-white/90 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10">
                            {movie.year}
                          </span>
                          {movie.genre && (
                            <span className="text-xs text-white/80 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md hidden sm:inline-block">
                              {movie.genre.split(",")[0]}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-white text-base md:text-lg leading-tight line-clamp-2">
                          {movie.title}
                        </h3>

                        {/* CTA Button */}
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMovieSelect(movie);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors shadow-lg"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Play className="w-4 h-4 fill-current" />
                          View Details
                        </motion.button>
                      </div>
                    </motion.div>

                    {/* Hover glow effect on pills */}
                    {!isCenter && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-white/0 hover:bg-white/10 transition-colors"
                      />
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mt-8">
          {movies.slice(0, Math.min(movies.length, 8)).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                goToSlide(index, index > currentIndex ? 1 : -1);
                pauseAutoPlay();
              }}
              className="group p-1.5 -m-1"
              aria-label={`Go to slide ${index + 1}`}
            >
              <motion.div
                className="rounded-full"
                animate={{
                  width: index === currentIndex ? 28 : 8,
                  height: 8,
                  backgroundColor: index === currentIndex 
                    ? "hsl(var(--primary))" 
                    : "hsl(var(--muted-foreground) / 0.25)",
                }}
                transition={springConfig}
              />
            </button>
          ))}
        </div>

        {/* Swipe indicator for mobile */}
        {isMobile && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1 }}
            className="text-center text-xs text-muted-foreground mt-4"
          >
            Tap sides to navigate
          </motion.p>
        )}
      </div>
    </section>
  );
};
