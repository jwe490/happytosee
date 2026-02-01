import { useState, useEffect, useCallback, useRef } from "react";
import { motion, PanInfo, AnimatePresence } from "framer-motion";
import { Star, Play } from "lucide-react";

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

// Responsive sizing
const MAIN_WIDTH = 280;
const MAIN_HEIGHT = 420;
const PILL_WIDTH = 80;
const PILL_HEIGHT = 120;

export const CinematicCarousel = ({
  movies,
  onMovieSelect,
  autoPlayInterval = 5000,
}: CinematicCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [direction, setDirection] = useState(0);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const goToSlide = useCallback((index: number, dir?: number) => {
    const targetIndex = ((index % movies.length) + movies.length) % movies.length;
    setDirection(dir ?? (targetIndex > currentIndex ? 1 : -1));
    setCurrentIndex(targetIndex);
  }, [movies.length, currentIndex]);

  const goToNext = useCallback(() => {
    setDirection(1);
    goToSlide(currentIndex + 1, 1);
  }, [currentIndex, goToSlide]);

  const goToPrevious = useCallback(() => {
    setDirection(-1);
    goToSlide(currentIndex - 1, -1);
  }, [currentIndex, goToSlide]);

  const handleInteraction = useCallback(() => {
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

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 50;

    if (info.offset.x > threshold) {
      goToPrevious();
      handleInteraction();
    } else if (info.offset.x < -threshold) {
      goToNext();
      handleInteraction();
    }
  };

  // Get visible slides with positions
  const getVisibleSlides = () => {
    const slides = [];
    
    // Show 2 pills on each side + center
    for (let i = -2; i <= 2; i++) {
      const index = ((currentIndex + i) % movies.length + movies.length) % movies.length;
      slides.push({ movie: movies[index], position: i, index });
    }

    return slides;
  };

  if (movies.length === 0) return null;

  return (
    <section className="relative w-full py-8 md:py-12 overflow-hidden z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">Featured Movies</h2>
        </div>

        <div className="relative h-[480px] md:h-[520px] flex items-center justify-center">
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
          >
            <AnimatePresence mode="popLayout">
              {getVisibleSlides().map(({ movie, position, index }) => {
                const isCenter = position === 0;
                const absPosition = Math.abs(position);

                // Calculate transforms for pill-to-main morphing
                const getSlideProps = () => {
                  if (isCenter) {
                    return {
                      width: MAIN_WIDTH,
                      height: MAIN_HEIGHT,
                      borderRadius: 20,
                      x: 0,
                      scale: 1,
                      opacity: 1,
                      zIndex: 50,
                      rotateY: 0,
                    };
                  }
                  
                  // Side pills - progressively smaller and more pill-shaped
                  const pillScale = absPosition === 1 ? 0.9 : 0.75;
                  const xOffset = position * (MAIN_WIDTH * 0.55 + absPosition * 20);
                  
                  return {
                    width: PILL_WIDTH,
                    height: PILL_HEIGHT,
                    borderRadius: 40, // Pill shape
                    x: xOffset,
                    scale: pillScale,
                    opacity: absPosition === 1 ? 0.8 : 0.5,
                    zIndex: 30 - absPosition * 10,
                    rotateY: position > 0 ? -15 : 15,
                  };
                };

                const props = getSlideProps();

                return (
                  <motion.div
                    key={`${movie.id}-${index}`}
                    layout
                    className="absolute flex items-center justify-center"
                    initial={{
                      ...props,
                      opacity: 0,
                      x: props.x + (direction * 100),
                    }}
                    animate={{
                      ...props,
                    }}
                    exit={{
                      ...props,
                      opacity: 0,
                      x: props.x - (direction * 100),
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 35,
                      mass: 0.8,
                    }}
                    onClick={() => {
                      if (!isDragging && position !== 0) {
                        goToSlide(index, position > 0 ? 1 : -1);
                        handleInteraction();
                      } else if (!isDragging && isCenter) {
                        onMovieSelect(movie);
                      }
                    }}
                    style={{
                      width: props.width,
                      height: props.height,
                      perspective: "1200px",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <motion.div 
                      className={`relative w-full h-full overflow-hidden shadow-2xl cursor-pointer ${
                        isCenter ? 'ring-2 ring-primary/40' : ''
                      }`}
                      animate={{
                        borderRadius: props.borderRadius,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    >
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />

                      {/* Gradient overlay - only on center */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"
                        animate={{
                          opacity: isCenter ? 1 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                      />

                      {/* Content - only on center */}
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 p-5"
                        animate={{
                          y: isCenter ? 0 : 20,
                          opacity: isCenter ? 1 : 0,
                        }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20">
                              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                              <span className="text-xs font-semibold text-white">{movie.rating.toFixed(1)}</span>
                            </div>
                            <span className="text-xs text-white/80 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20">
                              {movie.year}
                            </span>
                          </div>

                          <h3 className="font-bold text-white text-lg leading-tight line-clamp-2">
                            {movie.title}
                          </h3>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onMovieSelect(movie);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md text-black text-sm font-semibold hover:bg-white transition-colors"
                          >
                            <Play className="w-4 h-4 fill-current" />
                            View Details
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Navigation dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {movies.slice(0, Math.min(movies.length, 10)).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                goToSlide(index, index > currentIndex ? 1 : -1);
                handleInteraction();
              }}
              className="group p-1.5 -m-1"
              aria-label={`Go to slide ${index + 1}`}
            >
              <motion.span
                className="block rounded-full bg-muted-foreground/40"
                animate={{
                  width: index === currentIndex ? 28 : 8,
                  height: 8,
                  backgroundColor: index === currentIndex 
                    ? "hsl(var(--primary))" 
                    : "hsl(var(--muted-foreground) / 0.4)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
