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
    enter: (direction: number) => ({
      x: direction > 0 ? 1200 : -1200,
      opacity: 0,
      scale: 0.85,
      rotateY: direction > 0 ? 25 : -25,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        x: { type: "spring", stiffness: 280, damping: 35, mass: 0.9 },
        opacity: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
        scale: { type: "spring", stiffness: 300, damping: 30 },
        rotateY: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
      }
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -1200 : 1200,
      opacity: 0,
      scale: 0.85,
      rotateY: direction > 0 ? -25 : 25,
      transition: {
        duration: 0.4,
        ease: [0.76, 0, 0.24, 1]
      }
    })
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
    <section className="relative w-full h-screen flex items-center justify-center px-3 md:px-6 lg:px-10 bg-background" style={{ perspective: "2000px" }}>
      <div className="relative w-full h-[92vh] max-w-[98vw] mx-auto">
        <div className="relative w-full h-full rounded-[2.5rem] md:rounded-[3.5rem] lg:rounded-[4.5rem] overflow-hidden bg-black shadow-[0_50px_150px_-30px_rgba(0,0,0,0.6)]">

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

                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/30" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={`content-${currentIndex}`}
                    variants={contentVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 flex flex-col justify-end px-24 md:px-28 lg:px-32 py-6 md:py-10 lg:py-14 pb-20 md:pb-24"
                  >
                    <div className="max-w-4xl space-y-3 md:space-y-5 w-full">
                      <motion.div
                        className="flex flex-wrap items-center gap-2.5 md:gap-3 text-white text-sm md:text-base"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                      >
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-xl px-4 py-2 rounded-full border border-white/30 shadow-lg">
                          <span className="text-yellow-400 text-lg md:text-xl">★</span>
                          <span className="font-bold text-base md:text-lg">{currentMovie.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-white/60 text-lg">•</span>
                        <span className="font-semibold text-base md:text-lg bg-white/15 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20">{currentMovie.year}</span>
                        {currentMovie.genre && (
                          <>
                            <span className="text-white/60 text-lg">•</span>
                            <span className="font-semibold text-base md:text-lg bg-white/15 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20">{currentMovie.genre}</span>
                          </>
                        )}
                      </motion.div>

                      <motion.h2
                        className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.05] tracking-tight drop-shadow-2xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.6 }}
                      >
                        {currentMovie.title}
                      </motion.h2>

                      {currentMovie.overview && (
                        <motion.p
                          className="text-white text-base md:text-xl lg:text-2xl leading-relaxed line-clamp-2 max-w-3xl drop-shadow-lg font-medium"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4, duration: 0.6 }}
                        >
                          {currentMovie.overview}
                        </motion.p>
                      )}

                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMovieSelect(currentMovie);
                        }}
                        className="group inline-flex items-center gap-3 bg-white text-black px-9 py-4 md:px-10 md:py-5 rounded-full font-bold text-base md:text-xl hover:bg-white/95 transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 mt-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        whileHover={{ gap: "1rem" }}
                      >
                        <Play className="w-5 h-5 md:w-6 md:h-6 fill-current transition-transform group-hover:scale-110" />
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
                className="absolute left-4 md:left-6 lg:left-8 top-1/2 z-20 w-16 h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-full bg-white/15 backdrop-blur-2xl border-2 border-white/25 flex items-center justify-center text-white hover:bg-white/25 hover:border-white/40 transition-colors duration-200 shadow-2xl"
                style={{ transform: "translateY(-50%)", transformOrigin: "center" }}
                aria-label="Previous slide"
                whileHover={{ scale: 1.15, x: -6 }}
                whileTap={{ scale: 0.92 }}
              >
                <ChevronLeft className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 stroke-[3]" />
              </motion.button>

              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                  handleInteraction();
                }}
                className="absolute right-4 md:right-6 lg:right-8 top-1/2 z-20 w-16 h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-full bg-white/15 backdrop-blur-2xl border-2 border-white/25 flex items-center justify-center text-white hover:bg-white/25 hover:border-white/40 transition-colors duration-200 shadow-2xl"
                style={{ transform: "translateY(-50%)", transformOrigin: "center" }}
                aria-label="Next slide"
                whileHover={{ scale: 1.15, x: 6 }}
                whileTap={{ scale: 0.92 }}
              >
                <ChevronRight className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 stroke-[3]" />
              </motion.button>

              <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
                {movies.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      goToSlide(index);
                      handleInteraction();
                    }}
                    className="relative group"
                    whileHover={{ scale: 1.4 }}
                    whileTap={{ scale: 0.85 }}
                    aria-label={`Go to slide ${index + 1}`}
                  >
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentIndex
                          ? "w-14 md:w-16 bg-white shadow-lg shadow-white/60"
                          : "w-2 bg-white/60 group-hover:bg-white group-hover:w-8"
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
