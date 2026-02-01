import { useState, useEffect, useCallback, useRef } from "react";
import { motion, PanInfo, AnimatePresence } from "framer-motion";
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

  // Get 5 visible slides: 2 left pills, center main, 2 right pills
  const getVisibleSlides = () => {
    const slides = [];
    for (let offset = -2; offset <= 2; offset++) {
      const index = ((currentIndex + offset) % movies.length + movies.length) % movies.length;
      slides.push({ movie: movies[index], offset, index });
    }
    return slides;
  };

  if (movies.length === 0) return null;

  // Dimensions - main poster is large rectangle, pills are vertical capsules
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
          
          {/* Navigation arrows */}
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

        <div className="relative h-[440px] md:h-[500px] flex items-center justify-center">
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
          >
            <AnimatePresence mode="popLayout">
              {getVisibleSlides().map(({ movie, offset, index }) => {
                const isCenter = offset === 0;
                const absOffset = Math.abs(offset);

                // Calculate dimensions based on position
                let width: number, height: number, borderRadius: string;
                
                if (isCenter) {
                  // Main poster - large rounded rectangle
                  width = mainWidth;
                  height = mainHeight;
                  borderRadius = "24px";
                } else if (absOffset === 1) {
                  // Inner pills - vertical capsule shape
                  width = pillWidth;
                  height = pillHeight;
                  borderRadius = `${pillWidth / 2}px`;
                } else {
                  // Outer pills - smaller vertical capsule
                  width = outerPillWidth;
                  height = outerPillHeight;
                  borderRadius = `${outerPillWidth / 2}px`;
                }

                // Calculate X position - tighter grouping
                const getXPosition = () => {
                  if (isCenter) return 0;
                  const direction = offset > 0 ? 1 : -1;
                  
                  if (absOffset === 1) {
                    return direction * (mainWidth / 2 + 40 + pillWidth / 2);
                  } else {
                    return direction * (mainWidth / 2 + 40 + pillWidth + 20 + outerPillWidth / 2);
                  }
                };

                const xPos = getXPosition();
                const opacity = isCenter ? 1 : absOffset === 1 ? 0.7 : 0.4;
                const zIndex = isCenter ? 50 : 40 - absOffset * 10;
                const scale = isCenter ? 1 : 0.95;

                return (
                  <motion.div
                    key={`slide-${movie.id}-${offset}`}
                    layoutId={`slide-${movie.id}`}
                    className="absolute flex items-center justify-center"
                    initial={{ 
                      x: offset > 0 ? 300 : -300, 
                      opacity: 0,
                      scale: 0.8,
                    }}
                    animate={{
                      x: xPos,
                      width,
                      height,
                      opacity,
                      zIndex,
                      scale,
                    }}
                    exit={{
                      x: offset > 0 ? 300 : -300,
                      opacity: 0,
                      scale: 0.8,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 35,
                      mass: 0.8,
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
                      transformOrigin: "center center",
                    }}
                  >
                    {/* Card container with morphing border radius */}
                    <motion.div
                      className="relative w-full h-full overflow-hidden"
                      animate={{ borderRadius }}
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 35,
                        mass: 0.8,
                      }}
                      style={{
                        boxShadow: isCenter
                          ? "0 30px 60px -15px rgba(0,0,0,0.5), 0 10px 30px -10px rgba(0,0,0,0.3)"
                          : "0 10px 30px -10px rgba(0,0,0,0.3)",
                      }}
                    >
                      {/* Image */}
                      <motion.img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        draggable={false}
                        animate={{
                          scale: isCenter ? 1 : 1.1,
                        }}
                        transition={{ duration: 0.3 }}
                      />

                      {/* Gradient overlay - only on center */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none"
                        animate={{ opacity: isCenter ? 1 : 0 }}
                        transition={{ duration: 0.2 }}
                      />

                      {/* Content - only on center */}
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 p-4"
                        animate={{
                          y: isCenter ? 0 : 30,
                          opacity: isCenter ? 1 : 0,
                        }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                      >
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
                goToSlide(index);
                pauseAutoPlay();
              }}
              className="group p-1"
              aria-label={`Go to slide ${index + 1}`}
            >
              <motion.span
                className="block rounded-full"
                animate={{
                  width: index === currentIndex ? 28 : 8,
                  height: 8,
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
