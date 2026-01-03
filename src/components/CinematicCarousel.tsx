import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Play, Info, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.15]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 1.1
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.6 }
      }
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -1000 : 1000,
      opacity: 0,
      scale: 0.9,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
        scale: { duration: 0.4 }
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
    <div ref={carouselRef} className="relative w-full h-[70vh] md:h-[80vh] lg:h-[90vh] overflow-hidden bg-black">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 w-full h-full"
          style={{ scale, opacity }}
        >
          {/* Background Image with Parallax */}
          <motion.div className="absolute inset-0" style={{ y }}>
            <img
              src={currentMovie.backdropUrl || currentMovie.posterUrl}
              alt={currentMovie.title}
              className="w-full h-full object-cover brightness-110 contrast-105"
              loading="eager"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/30" />
          </motion.div>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-end px-6 md:px-12 lg:px-16 pb-16 md:pb-20 lg:pb-24">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="max-w-2xl space-y-4 md:space-y-6"
            >
              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="font-display text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight"
              >
                {currentMovie.title}
              </motion.h1>

              {/* Meta Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex items-center gap-4 text-white/90"
              >
                <div className="flex items-center gap-1.5">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-semibold">{currentMovie.rating.toFixed(1)}</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-white/60" />
                <span className="text-lg">{currentMovie.year}</span>
                {currentMovie.genre && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/60" />
                    <span className="text-lg">{currentMovie.genre}</span>
                  </>
                )}
              </motion.div>

              {/* Overview */}
              {currentMovie.overview && (
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="text-white/80 text-base md:text-lg leading-relaxed line-clamp-3"
                >
                  {currentMovie.overview}
                </motion.p>
              )}

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="flex items-center gap-3"
              >
                <Button
                  size="lg"
                  onClick={() => onMovieSelect(currentMovie)}
                  className="gap-2 bg-white text-black hover:bg-white/90 rounded-full px-8 h-12 text-base font-semibold"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Watch Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => onMovieSelect(currentMovie)}
                  className="gap-2 bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 rounded-full px-6 h-12"
                >
                  <Info className="w-5 h-5" />
                  More Info
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 md:px-8 pointer-events-none z-20">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            goToPrevious();
            handleInteraction();
          }}
          className="pointer-events-auto w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 md:w-7 md:h-7" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            goToNext();
            handleInteraction();
          }}
          className="pointer-events-auto w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <ChevronRight className="w-6 h-6 md:w-7 md:h-7" />
        </motion.button>
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {movies.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => {
              goToSlide(index);
              handleInteraction();
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "w-8 bg-white"
                : "w-1.5 bg-white/40 hover:bg-white/60"
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-white/80 z-20"
        initial={{ width: "0%" }}
        animate={{ width: isAutoPlaying ? "100%" : "0%" }}
        transition={{
          duration: autoPlayInterval / 1000,
          ease: "linear",
        }}
        key={currentIndex}
      />
    </div>
  );
};
