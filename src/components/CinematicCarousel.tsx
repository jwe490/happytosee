import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Star } from "lucide-react";

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
      x: direction > 0 ? 500 : -500,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
      }
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -500 : 500,
      opacity: 0,
      transition: { duration: 0.3 }
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
    <section className="relative w-full px-4 md:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Featured Label */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg md:text-xl font-semibold text-foreground">Featured</h2>
          <div className="flex items-center gap-1">
            {movies.map((_, index) => (
              <button
                key={index}
                onClick={() => { goToSlide(index); handleInteraction(); }}
                className="p-2 -m-1 flex items-center justify-center"
                aria-label={`Go to slide ${index + 1}`}
              >
                <span className={`block h-1.5 rounded-full transition-all ${
                  index === currentIndex ? "w-6 bg-foreground" : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground"
                }`} />
              </button>
            ))}
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-card shadow-lg aspect-[16/9] md:aspect-[21/9]">
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
              {/* Background Image */}
              <img
                src={currentMovie.backdropUrl || currentMovie.posterUrl}
                alt={currentMovie.title}
                className="w-full h-full object-cover"
                loading="eager"
                // @ts-expect-error fetchpriority is valid HTML but React types it differently
                fetchpriority="high"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="px-6 md:px-10 lg:px-12 max-w-xl space-y-3 md:space-y-4">
                  {/* Rating & Year */}
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-semibold text-white">{currentMovie.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-white/80">{currentMovie.year}</span>
                    {currentMovie.genre && (
                      <span className="text-white/60">• {currentMovie.genre}</span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
                    {currentMovie.title}
                  </h3>

                  {/* Overview */}
                  {currentMovie.overview && (
                    <p className="text-white/80 text-sm md:text-base line-clamp-2 hidden sm:block">
                      {currentMovie.overview}
                    </p>
                  )}

                  {/* CTA Button */}
                  <button
                    onClick={() => onMovieSelect(currentMovie)}
                    className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 md:px-6 md:py-3 rounded-full font-semibold text-sm md:text-base hover:bg-white/90 transition-colors"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          {movies.length > 1 && (
            <>
              <button
                onClick={() => { goToPrevious(); handleInteraction(); }}
                className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              <button
                onClick={() => { goToNext(); handleInteraction(); }}
                className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
