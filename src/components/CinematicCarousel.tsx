import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Play, ChevronLeft, ChevronRight } from "lucide-react";

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

// Optimized spring config for smooth 60fps animations
const springConfig = {
  type: "spring" as const,
  stiffness: 280,
  damping: 28,
  mass: 0.9,
};

export const CinematicCarousel = ({
  movies,
  onMovieSelect,
  autoPlayInterval = 5000,
}: CinematicCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const goToSlide = useCallback(
    (index: number) => {
      const targetIndex = ((index % movies.length) + movies.length) % movies.length;
      setCurrentIndex(targetIndex);
    },
    [movies.length]
  );

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
    }, 8000);
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

  // Memoized visible slides calculation
  const visibleSlides = useMemo(() => {
    const slides = [];
    for (let offset = -2; offset <= 2; offset++) {
      const index = ((currentIndex + offset) % movies.length + movies.length) % movies.length;
      slides.push({ movie: movies[index], offset, index });
    }
    return slides;
  }, [currentIndex, movies]);

  if (movies.length === 0) return null;

  // Dimensions
  const mainWidth = 260;
  const mainHeight = 380;
  const pillWidth = 48;
  const pillHeight = 120;
  const outerPillWidth = 32;
  const outerPillHeight = 80;

  return (
    <section className="relative w-full py-8 md:py-12 overflow-hidden z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
            Featured Movies
          </h2>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                goToPrevious();
                pauseAutoPlay();
              }}
              className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              aria-label="Previous movie"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                goToNext();
                pauseAutoPlay();
              }}
              className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              aria-label="Next movie"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div 
          className="relative h-[440px] md:h-[500px] flex items-center justify-center"
          style={{ willChange: "transform" }}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <AnimatePresence initial={false} mode="sync">
              {visibleSlides.map(({ movie, offset, index }) => {
                const isCenter = offset === 0;
                const absOffset = Math.abs(offset);

                // Calculate dimensions
                let width: number, height: number, borderRadius: number;
                
                if (isCenter) {
                  width = mainWidth;
                  height = mainHeight;
                  borderRadius = 24;
                } else if (absOffset === 1) {
                  width = pillWidth;
                  height = pillHeight;
                  borderRadius = pillWidth / 2;
                } else {
                  width = outerPillWidth;
                  height = outerPillHeight;
                  borderRadius = outerPillWidth / 2;
                }

                // Calculate X position
                const getXPosition = () => {
                  if (isCenter) return 0;
                  const direction = offset > 0 ? 1 : -1;
                  
                  if (absOffset === 1) {
                    return direction * (mainWidth / 2 + 40 + pillWidth / 2);
                  }
                  return direction * (mainWidth / 2 + 40 + pillWidth + 20 + outerPillWidth / 2);
                };

                const xPos = getXPosition();
                const opacity = isCenter ? 1 : absOffset === 1 ? 0.7 : 0.4;
                const zIndex = isCenter ? 50 : 40 - absOffset * 10;

                return (
                  <motion.div
                    key={`${movie.id}-${offset}`}
                    className="absolute cursor-pointer"
                    style={{
                      willChange: "transform, opacity",
                      transformOrigin: "center center",
                    }}
                    initial={false}
                    animate={{
                      x: xPos,
                      width,
                      height,
                      opacity,
                      zIndex,
                      borderRadius,
                    }}
                    transition={springConfig}
                    onClick={() => {
                      if (offset !== 0) {
                        goToSlide(index);
                        pauseAutoPlay();
                      } else {
                        onMovieSelect(movie);
                      }
                    }}
                  >
                    <div 
                      className="relative w-full h-full overflow-hidden"
                      style={{
                        borderRadius,
                        boxShadow: isCenter
                          ? "0 30px 60px -15px rgba(0,0,0,0.5)"
                          : "0 10px 30px -10px rgba(0,0,0,0.3)",
                      }}
                    >
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        draggable={false}
                        style={{
                          transform: isCenter ? "scale(1)" : "scale(1.1)",
                          transition: "transform 0.3s ease-out",
                        }}
                      />

                      {/* Gradient overlay - only on center */}
                      {isCenter && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
                      )}

                      {/* Content - only on center */}
                      {isCenter && (
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
                                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                <span className="text-xs font-semibold text-white">
                                  {movie.rating.toFixed(1)}
                                </span>
                              </div>
                              <span className="text-xs text-white/80 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
                                {movie.year}
                              </span>
                            </div>

                            <h3 className="font-bold text-white text-base leading-tight line-clamp-2">
                              {movie.title}
                            </h3>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onMovieSelect(movie);
                              }}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              View Details
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {movies.slice(0, Math.min(movies.length, 10)).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                goToSlide(index);
                pauseAutoPlay();
              }}
              className="group p-1"
              aria-label={`Go to slide ${index + 1}`}
            >
              <span
                className="block rounded-full transition-all duration-300"
                style={{
                  width: index === currentIndex ? 28 : 8,
                  height: 8,
                  backgroundColor: index === currentIndex
                    ? "hsl(var(--primary))"
                    : "hsl(var(--muted-foreground) / 0.3)",
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
