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

export const CinematicCarousel = ({
  movies,
  onMovieSelect,
  autoPlayInterval = 5000,
}: CinematicCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
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

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 50;
    if (info.offset.x > threshold) {
      goToPrevious();
      pauseAutoPlay();
    } else if (info.offset.x < -threshold) {
      goToNext();
      pauseAutoPlay();
    }
  };

  // Get 5 visible slides: 2 left, center, 2 right
  const getVisibleSlides = () => {
    const slides = [];
    for (let offset = -2; offset <= 2; offset++) {
      const index = ((currentIndex + offset) % movies.length + movies.length) % movies.length;
      slides.push({ movie: movies[index], offset, index });
    }
    return slides;
  };

  if (movies.length === 0) return null;

  return (
    <section className="relative w-full py-8 md:py-12 overflow-hidden z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
            Featured Movies
          </h2>
        </div>

        <div className="relative h-[420px] md:h-[480px] flex items-center justify-center">
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
          >
            {getVisibleSlides().map(({ movie, offset, index }) => {
              const isCenter = offset === 0;
              const absOffset = Math.abs(offset);

              // Calculate dimensions and positions
              // Center: full poster, pills: vertical capsules
              const centerWidth = 260;
              const centerHeight = 390;
              const pillWidth = 50;
              const pillHeight = 90;

              // Position calculation
              const spacing = absOffset === 1 ? 180 : 260;
              const xPos = offset * spacing;

              // Properties based on position
              const width = isCenter ? centerWidth : pillWidth;
              const height = isCenter ? centerHeight : pillHeight;
              const borderRadius = isCenter ? 16 : pillHeight / 2; // Full pill shape for sides
              const scale = isCenter ? 1 : absOffset === 1 ? 0.95 : 0.85;
              const opacity = isCenter ? 1 : absOffset === 1 ? 0.7 : 0.4;
              const zIndex = isCenter ? 50 : 40 - absOffset * 10;

              return (
                <motion.div
                  key={`${movie.id}-${index}`}
                  className="absolute"
                  animate={{
                    x: xPos,
                    width,
                    height,
                    scale,
                    opacity,
                    zIndex,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    mass: 0.9,
                  }}
                  onClick={() => {
                    if (!isDragging && offset !== 0) {
                      goToSlide(index);
                      pauseAutoPlay();
                    } else if (!isDragging && isCenter) {
                      onMovieSelect(movie);
                    }
                  }}
                  style={{
                    cursor: "pointer",
                  }}
                >
                  <motion.div
                    className="relative w-full h-full overflow-hidden shadow-2xl"
                    animate={{
                      borderRadius,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                    style={{
                      boxShadow: isCenter
                        ? "0 25px 60px -15px rgba(0,0,0,0.4)"
                        : "0 10px 30px -10px rgba(0,0,0,0.3)",
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
                      className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
                      animate={{ opacity: isCenter ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* Content - only on center */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 p-4"
                      animate={{
                        y: isCenter ? 0 : 30,
                        opacity: isCenter ? 1 : 0,
                      }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs font-semibold text-white">
                              {movie.rating.toFixed(1)}
                            </span>
                          </div>
                          <span className="text-xs text-white/70 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10">
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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-black text-xs font-semibold hover:bg-white transition-colors"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          View Details
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Navigation dots */}
        <div className="flex items-center justify-center gap-1.5 mt-6">
          {movies.slice(0, Math.min(movies.length, 10)).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                goToSlide(index);
                pauseAutoPlay();
              }}
              className="group p-1 -m-0.5"
              aria-label={`Go to slide ${index + 1}`}
            >
              <motion.span
                className="block rounded-full"
                animate={{
                  width: index === currentIndex ? 24 : 6,
                  height: 6,
                  backgroundColor:
                    index === currentIndex
                      ? "hsl(var(--primary))"
                      : "hsl(var(--muted-foreground) / 0.3)",
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
