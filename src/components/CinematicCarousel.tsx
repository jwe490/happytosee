import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  const currentMovie = movies[currentIndex];

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
        opacity: { duration: 0.3 },
      }
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -1000 : 1000,
      opacity: 0,
      transition: {
        duration: 0.3,
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
    <section className="relative w-full h-screen flex items-center justify-center px-4 md:px-6 lg:px-10 bg-background">
      <div className="relative w-full max-w-7xl mx-auto" style={{ height: "85vh", maxHeight: "800px" }}>

        <div
          className="relative w-full h-full overflow-hidden"
          style={{ borderRadius: "20px" }}
        >
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
              <img
                src={currentMovie.backdropUrl || currentMovie.posterUrl}
                alt={currentMovie.title}
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
              />

              <div
                className="absolute bottom-0 w-full pointer-events-none"
                style={{
                  height: "65%",
                  background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 35%, rgba(0,0,0,0.85) 100%)"
                }}
              />

              <div
                className="absolute flex items-center gap-2 text-white pointer-events-none"
                style={{
                  top: "16px",
                  left: "16px",
                  backgroundColor: "rgba(0,0,0,0.7)",
                  backdropFilter: "blur(8px)",
                  padding: "6px 12px",
                  borderRadius: "20px"
                }}
              >
                <span className="text-yellow-400 text-base">★</span>
                <span className="font-bold text-sm">{currentMovie.rating.toFixed(1)}</span>
              </div>

              <div
                className="absolute text-white font-semibold text-sm pointer-events-none"
                style={{
                  top: "56px",
                  left: "16px",
                  backgroundColor: "rgba(0,0,0,0.7)",
                  backdropFilter: "blur(8px)",
                  padding: "6px 12px",
                  borderRadius: "20px"
                }}
              >
                {currentMovie.year}
              </div>

              {currentMovie.genre && (
                <div
                  className="absolute flex gap-2 pointer-events-none"
                  style={{
                    top: "96px",
                    left: "16px"
                  }}
                >
                  <div
                    className="text-white font-semibold text-sm"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.7)",
                      backdropFilter: "blur(8px)",
                      padding: "6px 12px",
                      borderRadius: "20px"
                    }}
                  >
                    {currentMovie.genre}
                  </div>
                </div>
              )}

              <h2
                className="absolute font-bold text-white pointer-events-none"
                style={{
                  bottom: "64px",
                  left: "20px",
                  right: "20px",
                  fontSize: "28px",
                  lineHeight: "1.2",
                  textShadow: "0 2px 12px rgba(0,0,0,0.6)"
                }}
              >
                {currentMovie.title}
              </h2>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMovieSelect(currentMovie);
                }}
                className="absolute bg-white text-black font-bold rounded-full flex items-center justify-center transition-all hover:bg-white/95 active:scale-95"
                style={{
                  bottom: "20px",
                  left: "20px",
                  right: "20px",
                  height: "44px",
                  borderRadius: "22px"
                }}
              >
                View Details
              </button>
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
                className="absolute flex items-center justify-center bg-white/95 hover:bg-white transition-colors rounded-full shadow-lg"
                style={{
                  top: "50%",
                  left: "12px",
                  width: "40px",
                  height: "40px",
                  transform: "translateY(-50%)",
                  zIndex: 10
                }}
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5 text-black" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                  handleInteraction();
                }}
                className="absolute flex items-center justify-center bg-white/95 hover:bg-white transition-colors rounded-full shadow-lg"
                style={{
                  top: "50%",
                  right: "12px",
                  width: "40px",
                  height: "40px",
                  transform: "translateY(-50%)",
                  zIndex: 10
                }}
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5 text-black" />
              </button>

              <div
                className="absolute left-1/2 flex items-center gap-2"
                style={{
                  bottom: "80px",
                  transform: "translateX(-50%)",
                  zIndex: 10
                }}
              >
                {movies.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      goToSlide(index);
                      handleInteraction();
                    }}
                    className="transition-all"
                    aria-label={`Go to slide ${index + 1}`}
                  >
                    <div
                      className="rounded-full transition-all"
                      style={{
                        height: "8px",
                        width: index === currentIndex ? "32px" : "8px",
                        backgroundColor: index === currentIndex ? "#ffffff" : "rgba(255,255,255,0.5)"
                      }}
                    />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
