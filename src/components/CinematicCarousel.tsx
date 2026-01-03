import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const carouselRef = useRef<HTMLDivElement>(null);

  const currentMovie = movies[currentIndex];

  const { scrollYProgress } = useScroll({
    target: carouselRef,
    offset: ["start start", "end start"]
  });

  const height = useTransform(scrollYProgress, [0, 0.3, 0.6], ["50vh", "70vh", "100vh"]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.6], [0.85, 0.95, 1]);
  const borderRadius = useTransform(scrollYProgress, [0, 0.3, 0.6], ["32px", "16px", "0px"]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.6, 0.8], [0.6, 0.8, 1, 0.3]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 },
      }
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -1000 : 1000,
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
      }
    })
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
    <div className="relative w-full flex items-center justify-center py-12 md:py-16 px-4 md:px-8">
      <motion.div
        ref={carouselRef}
        style={{ height, scale, borderRadius }}
        className="relative w-full max-w-7xl overflow-hidden bg-black shadow-2xl"
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 cursor-pointer"
            onClick={() => onMovieSelect(currentMovie)}
          >
            <motion.div className="relative w-full h-full" style={{ opacity }}>
              <img
                src={currentMovie.backdropUrl || currentMovie.posterUrl}
                alt={currentMovie.title}
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="max-w-2xl"
                >
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-2 md:mb-4 font-display">
                    {currentMovie.title}
                  </h2>

                  <div className="flex items-center gap-3 md:gap-4 text-white/80 text-sm md:text-base mb-3 md:mb-4">
                    <span className="font-semibold">{currentMovie.rating.toFixed(1)} ★</span>
                    <span>•</span>
                    <span>{currentMovie.year}</span>
                    {currentMovie.genre && (
                      <>
                        <span>•</span>
                        <span>{currentMovie.genre}</span>
                      </>
                    )}
                  </div>

                  {currentMovie.overview && (
                    <p className="text-white/70 text-sm md:text-base line-clamp-2 md:line-clamp-3 max-w-xl">
                      {currentMovie.overview}
                    </p>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {movies.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
                handleInteraction();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
                handleInteraction();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
              {movies.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToSlide(index);
                    handleInteraction();
                  }}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-8 bg-white"
                      : "w-1 bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};
