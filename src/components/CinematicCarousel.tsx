import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

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

  const currentMovie = movies[currentIndex];

  const slideVariants = {
    enter: {
      scale: 0.92,
      opacity: 0,
      filter: "blur(20px)",
    },
    center: {
      scale: 1,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        scale: { type: "spring", stiffness: 300, damping: 30, mass: 0.8 },
        opacity: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
        filter: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
      }
    },
    exit: {
      scale: 1.08,
      opacity: 0,
      filter: "blur(20px)",
      transition: {
        duration: 0.4,
        ease: [0.76, 0, 0.24, 1]
      }
    }
  };

  const contentVariants = {
    enter: {
      y: 60,
      opacity: 0,
    },
    center: {
      y: 0,
      opacity: 1,
      transition: {
        delay: 0.3,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    exit: {
      y: -30,
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  }, [movies.length]);

  const goToPrevious = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
  }, [movies.length]);

  const goToSlide = useCallback((index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex]);

  useEffect(() => {
    if (!isAutoPlaying || movies.length <= 1) return;

    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isAutoPlaying, goToNext, autoPlayInterval, movies.length]);

  const handleInteraction = () => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  if (!currentMovie) return null;

  return (
    <section className="relative w-full h-screen flex items-center justify-center px-4 md:px-8 lg:px-16 bg-background">
      <div className="relative w-full h-[85vh] max-w-[95vw] mx-auto">
        <div className="relative w-full h-full rounded-[2rem] md:rounded-[3rem] lg:rounded-[4rem] overflow-hidden bg-black shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]">

          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0"
            >
              <div className="relative w-full h-full">
                <img
                  src={currentMovie.backdropUrl || currentMovie.posterUrl}
                  alt={currentMovie.title}
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={`content-${currentIndex}`}
                    variants={contentVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 lg:p-16"
                  >
                    <div className="max-w-3xl space-y-4 md:space-y-6">
                      <motion.div
                        className="flex items-center gap-3 text-white/90 text-sm md:text-base"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                      >
                        <div className="flex items-center gap-2 bg-white/15 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/20">
                          <span className="text-yellow-400 text-lg">★</span>
                          <span className="font-bold">{currentMovie.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-white/50">•</span>
                        <span className="font-semibold">{currentMovie.year}</span>
                        {currentMovie.genre && (
                          <>
                            <span className="text-white/50">•</span>
                            <span className="font-semibold">{currentMovie.genre}</span>
                          </>
                        )}
                      </motion.div>

                      <motion.h2
                        className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.45, duration: 0.6 }}
                      >
                        {currentMovie.title}
                      </motion.h2>

                      {currentMovie.overview && (
                        <motion.p
                          className="text-white/90 text-base md:text-lg lg:text-xl leading-relaxed line-clamp-3 max-w-2xl"
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5, duration: 0.6 }}
                        >
                          {currentMovie.overview}
                        </motion.p>
                      )}

                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMovieSelect(currentMovie);
                        }}
                        className="group inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold text-base md:text-lg hover:bg-white/95 transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        whileHover={{ gap: "1rem" }}
                      >
                        <Play className="w-5 h-5 fill-current transition-transform group-hover:scale-110" />
                        View Details
                      </motion.button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </AnimatePresence>

          {movies.length > 1 && (
            <>
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                  handleInteraction();
                }}
                className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 z-20 w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200"
                aria-label="Previous slide"
                whileHover={{ scale: 1.1, x: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft className="w-7 h-7 md:w-8 md:h-8" />
              </motion.button>

              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                  handleInteraction();
                }}
                className="absolute right-6 md:right-8 top-1/2 -translate-y-1/2 z-20 w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200"
                aria-label="Next slide"
                whileHover={{ scale: 1.1, x: 4 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight className="w-7 h-7 md:w-8 md:h-8" />
              </motion.button>

              <div className="absolute bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20">
                {movies.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      goToSlide(index);
                      handleInteraction();
                    }}
                    className="relative group"
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Go to slide ${index + 1}`}
                  >
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === currentIndex
                          ? "w-12 bg-white shadow-lg shadow-white/50"
                          : "w-1.5 bg-white/50 group-hover:bg-white/80 group-hover:w-6"
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="absolute -inset-8 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 rounded-[4rem] lg:rounded-[5rem] -z-10 blur-3xl opacity-60" />
      </div>
    </section>
  );
};
