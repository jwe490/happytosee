import { useState, useEffect, useCallback, useRef } from "react";
import { motion, PanInfo } from "framer-motion";
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

const SLIDE_WIDTH = 280;
const SLIDE_HEIGHT = 420;
const VISIBLE_SLIDES = 7;
const CENTER_SCALE = 1.15;
const SIDE_SCALE = 0.8;
const FAR_SCALE = 0.6;

export const CinematicCarousel = ({
  movies,
  onMovieSelect,
  autoPlayInterval = 5000,
}: CinematicCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  const getSlideStyle = (position: number) => {
    const absPosition = Math.abs(position);

    if (absPosition === 0) {
      return {
        scale: CENTER_SCALE,
        opacity: 1,
        zIndex: 50,
        filter: 'blur(0px)',
        borderRadius: 16,
        rotateY: 0,
      };
    } else if (absPosition === 1) {
      return {
        scale: SIDE_SCALE,
        opacity: 0.8,
        zIndex: 40,
        filter: 'blur(0px)',
        borderRadius: 24,
        rotateY: position > 0 ? -12 : 12,
      };
    } else if (absPosition === 2) {
      return {
        scale: FAR_SCALE,
        opacity: 0.5,
        zIndex: 30,
        filter: 'blur(0.5px)',
        borderRadius: 32,
        rotateY: position > 0 ? -20 : 20,
      };
    } else {
      return {
        scale: FAR_SCALE * 0.85,
        opacity: 0.25,
        zIndex: 20,
        filter: 'blur(1px)',
        borderRadius: 40,
        rotateY: position > 0 ? -25 : 25,
      };
    }
  };

  const getVisibleSlides = () => {
    const slides = [];
    const halfVisible = Math.floor(VISIBLE_SLIDES / 2);

    for (let i = -halfVisible; i <= halfVisible; i++) {
      const index = ((currentIndex + i) % movies.length + movies.length) % movies.length;
      slides.push({ movie: movies[index], position: i, index });
    }

    return slides;
  };

  if (movies.length === 0) return null;

  return (
    <section className="relative w-full py-8 md:py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">Featured Movies</h2>
        </div>

        <div className="relative h-[500px] md:h-[560px] flex items-center justify-center">
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
          >
            {getVisibleSlides().map(({ movie, position, index }) => {
              const style = getSlideStyle(position);
              const isCenter = position === 0;

              return (
                <motion.div
                  key={`${index}-${position}`}
                  className="absolute"
                  initial={false}
                  animate={{
                    x: position * (SLIDE_WIDTH * 0.82),
                    scale: style.scale,
                    opacity: style.opacity,
                    filter: style.filter,
                    zIndex: style.zIndex,
                    rotateY: style.rotateY,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 35,
                    mass: 0.9,
                  }}
                  onClick={() => {
                    if (!isDragging && position !== 0) {
                      goToSlide(index);
                      handleInteraction();
                    } else if (!isDragging && isCenter) {
                      onMovieSelect(movie);
                    }
                  }}
                  style={{
                    width: SLIDE_WIDTH,
                    height: SLIDE_HEIGHT,
                    perspective: '1200px',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div className="relative w-full h-full group" style={{ transformStyle: 'preserve-3d' }}>
                    <motion.div
                      className={`relative w-full h-full overflow-hidden shadow-2xl ${
                        isCenter ? 'ring-2 ring-primary/60' : ''
                      }`}
                      animate={{
                        borderRadius: `${style.borderRadius}px`,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 35,
                        mass: 0.9,
                      }}
                    >
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />

                      <motion.div
                        className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
                        animate={{
                          opacity: isCenter ? 1 : 0,
                        }}
                        transition={{
                          duration: 0.4,
                          ease: "easeInOut",
                        }}
                      />

                      <motion.div
                        className="absolute bottom-0 left-0 right-0 p-4"
                        animate={{
                          y: isCenter ? 0 : 16,
                          opacity: isCenter ? 1 : 0,
                        }}
                        transition={{
                          duration: 0.4,
                          ease: "easeInOut",
                        }}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/40 backdrop-blur-md border border-white/20 shadow-lg">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              <span className="text-xs font-semibold text-white">{movie.rating.toFixed(1)}</span>
                            </div>
                            <span className="text-xs text-white/80 px-2 py-0.5 rounded-full bg-background/40 backdrop-blur-md border border-white/20">
                              {movie.year}
                            </span>
                          </div>

                          <h3 className={`font-bold text-white leading-tight ${
                            isCenter ? 'text-base md:text-lg' : 'text-sm'
                          } line-clamp-2`}>
                            {movie.title}
                          </h3>

                          {isCenter && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onMovieSelect(movie);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-black text-xs font-semibold hover:bg-white transition-colors"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              Details
                            </button>
                          )}
                        </div>
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6">
          {movies.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                goToSlide(index);
                handleInteraction();
              }}
              className="group p-2 -m-1"
              aria-label={`Go to slide ${index + 1}`}
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-primary'
                    : 'w-1.5 bg-muted-foreground/40 group-hover:bg-muted-foreground/70'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
