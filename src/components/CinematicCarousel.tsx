import { useState, useEffect, useCallback, useRef } from "react";
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
      scale: 0.95,
      opacity: 0,
      filter: "blur(10px)",
    }),
    center: {
      scale: 1,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        scale: { type: "spring", stiffness: 400, damping: 35 },
        opacity: { duration: 0.4 },
        filter: { duration: 0.4 },
      }
    },
    exit: (direction: number) => ({
      scale: 1.05,
      opacity: 0,
      filter: "blur(10px)",
      transition: {
        scale: { duration: 0.3 },
        opacity: { duration: 0.3 },
        filter: { duration: 0.3 },
      }
    })
  };

  const contentVariants = {
    enter: {
      y: 30,
      opacity: 0,
    },
    center: {
      y: 0,
      opacity: 1,
      transition: {
        delay: 0.2,
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: {
        duration: 0.2
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
    <section className="relative w-full py-12 md:py-16 px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative w-full max-w-[1400px] mx-auto"
      >
        <div className="relative w-full aspect-[21/9] rounded-3xl md:rounded-[2.5rem] overflow-hidden bg-black shadow-2xl shadow-black/20">
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

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={`content-${currentIndex}`}
                    variants={contentVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 lg:p-14"
                  >
                    <div className="max-w-2xl space-y-3 md:space-y-4">
                      <motion.div
                        className="flex items-center gap-3 text-white/90 text-xs md:text-sm"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                      >
                        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full">
                          <span className="text-yellow-400 text-sm md:text-base">★</span>
                          <span className="font-semibold">{currentMovie.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-white/60">•</span>
                        <span className="font-medium">{currentMovie.year}</span>
                        {currentMovie.genre && (
                          <>
                            <span className="text-white/60">•</span>
                            <span className="font-medium">{currentMovie.genre}</span>
                          </>
                        )}
                      </motion.div>

                      <motion.h2
                        className="text-3xl md:text-5xl lg:text-6xl font-bold text-white font-display leading-tight"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35, duration: 0.5 }}
                      >
                        {currentMovie.title}
                      </motion.h2>

                      {currentMovie.overview && (
                        <motion.p
                          className="text-white/80 text-sm md:text-base lg:text-lg leading-relaxed line-clamp-2 max-w-xl"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4, duration: 0.5 }}
                        >
                          {currentMovie.overview}
                        </motion.p>
                      )}

                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMovieSelect(currentMovie);
                        }}
                        className="group inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-semibold text-sm md:text-base hover:bg-white/90 transition-all duration-200 hover:scale-105 active:scale-95"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                        whileHover={{ gap: "0.75rem" }}
                      >
                        <Play className="w-4 h-4 fill-current" />
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
                className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 active:scale-95 transition-all duration-200"
                aria-label="Previous slide"
                whileHover={{ x: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </motion.button>

              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                  handleInteraction();
                }}
                className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 active:scale-95 transition-all duration-200"
                aria-label="Next slide"
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </motion.button>

              <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                {movies.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      goToSlide(index);
                      handleInteraction();
                    }}
                    className="relative group"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Go to slide ${index + 1}`}
                  >
                    <div
                      className={`h-1 rounded-full transition-all duration-300 ${
                        index === currentIndex
                          ? "w-8 bg-white"
                          : "w-1 bg-white/40 group-hover:bg-white/60 group-hover:w-4"
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="absolute -inset-4 md:-inset-6 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-[2.5rem] md:rounded-[3rem] -z-10 blur-2xl opacity-50" />
      </motion.div>
    </section>
  );
};
