import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-mobile";

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
  const [isHovered, setIsHovered] = useState(false);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const containerHeight = isMobile ? "500px" : "580px";

  const currentMovie = movies[currentIndex];

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  }, [movies.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
  }, [movies.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || movies.length <= 1) return;

    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isAutoPlaying, goToNext, autoPlayInterval, movies.length]);

  const handleInteraction = () => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  if (!currentMovie || movies.length === 0) return null;

  return (
    <section
      className="relative w-full overflow-hidden py-10"
      style={{ height: containerHeight }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        key={currentMovie.id}
        className="absolute inset-0 -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        style={{
          backgroundImage: `url(${currentMovie.posterUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(60px) brightness(0.3) saturate(1.2)",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      <div className="relative w-full h-full flex items-center justify-center px-4">
        <div className="relative flex items-center justify-center" style={{ width: "100%", maxWidth: "1200px" }}>
          {movies.map((movie, index) => {
            const offset = index - currentIndex;
            const absOffset = Math.abs(offset);

            let scale = 1;
            let opacity = 1;
            let translateX = 0;
            let brightness = 1;

            if (absOffset === 0) {
              scale = 1.0;
              opacity = 1;
              translateX = 0;
              brightness = 1;
            } else if (absOffset === 1) {
              scale = 0.92;
              opacity = 0.5;
              translateX = offset > 0 ? 40 : -40;
              brightness = 0.7;
            } else {
              scale = 0.85;
              opacity = 0;
              translateX = offset > 0 ? 80 : -80;
              brightness = 0.5;
            }

            const isActive = offset === 0;

            return (
              <motion.div
                key={movie.id}
                className="absolute cursor-pointer"
                style={{
                  width: "100%",
                  maxWidth: "360px",
                  pointerEvents: isActive ? "auto" : "none",
                }}
                initial={false}
                animate={{
                  scale,
                  opacity,
                  x: `${translateX}%`,
                  filter: `brightness(${brightness})`,
                }}
                transition={{
                  duration: 0.5,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                onClick={() => {
                  if (offset !== 0) {
                    goToSlide(index);
                    handleInteraction();
                  }
                }}
              >
                <div
                  className="relative w-full overflow-hidden"
                  style={{
                    aspectRatio: "2/3",
                    borderRadius: "24px",
                    boxShadow: isActive ? "0 20px 60px rgba(0,0,0,0.5), 0 0 80px rgba(255,255,255,0.1)" : "0 20px 60px rgba(0,0,0,0.5)",
                  }}
                >
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    loading={index < 3 ? "eager" : "lazy"}
                    decoding="async"
                    style={{
                      imageRendering: "high-quality",
                    }}
                  />

                  {isActive && (
                    <>
                      <div
                        className="absolute flex items-center gap-2 text-white"
                        style={{
                          top: "16px",
                          left: "16px",
                          backgroundColor: "rgba(0,0,0,0.7)",
                          backdropFilter: "blur(12px)",
                          padding: "6px 12px",
                          borderRadius: "20px",
                        }}
                      >
                        <span className="text-yellow-400 text-sm">★</span>
                        <span className="font-bold text-sm">{movie.rating.toFixed(1)}</span>
                      </div>

                      <div
                        className="absolute text-white font-semibold text-sm"
                        style={{
                          top: "56px",
                          left: "16px",
                          backgroundColor: "rgba(0,0,0,0.7)",
                          backdropFilter: "blur(12px)",
                          padding: "6px 12px",
                          borderRadius: "20px",
                        }}
                      >
                        {movie.year}
                      </div>

                      {movie.genre && (
                        <div
                          className="absolute text-white font-semibold text-sm"
                          style={{
                            top: "96px",
                            left: "16px",
                            backgroundColor: "rgba(0,0,0,0.7)",
                            backdropFilter: "blur(12px)",
                            padding: "6px 12px",
                            borderRadius: "20px",
                          }}
                        >
                          {movie.genre}
                        </div>
                      )}

                      <div
                        className="absolute bottom-0 w-full"
                        style={{
                          background: "linear-gradient(transparent, rgba(0,0,0,0.95))",
                          padding: "80px 24px 24px 24px",
                          borderRadius: "0 0 24px 24px",
                        }}
                      >
                        <h2
                          className="font-bold text-white mb-4"
                          style={{
                            fontSize: isMobile ? "20px" : "24px",
                            lineHeight: "1.2",
                          }}
                        >
                          {movie.title}
                        </h2>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMovieSelect(movie);
                          }}
                          className="w-full bg-white text-black font-bold transition-all hover:scale-[1.02] active:scale-95"
                          style={{
                            height: "48px",
                            borderRadius: "24px",
                            fontSize: "16px",
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {movies.length > 1 && (
        <>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
              handleInteraction();
            }}
            className="absolute flex items-center justify-center transition-all z-20"
            style={{
              top: "50%",
              left: "24px",
              width: "48px",
              height: "48px",
              backgroundColor: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "50%",
              transform: "translateY(-50%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </motion.button>

          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
              handleInteraction();
            }}
            className="absolute flex items-center justify-center transition-all z-20"
            style={{
              top: "50%",
              right: "24px",
              width: "48px",
              height: "48px",
              backgroundColor: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "50%",
              transform: "translateY(-50%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </motion.button>

          <div
            className="absolute left-1/2 flex items-center gap-2.5 z-20"
            style={{
              bottom: "16px",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(0,0,0,0.3)",
              backdropFilter: "blur(8px)",
              padding: "8px 16px",
              borderRadius: "20px",
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
                style={{
                  height: "6px",
                  width: index === currentIndex ? "20px" : "6px",
                  backgroundColor: index === currentIndex ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                  borderRadius: "3px",
                  border: "none",
                  cursor: "pointer",
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};
