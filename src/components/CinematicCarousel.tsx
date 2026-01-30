import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";

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

const SLIDE_COLOR = "#E89B8C";
const ANIMATION_DURATION = 0.7;
const VISIBLE_PILLS = 3;

export const CinematicCarousel = ({
  movies,
  onMovieSelect,
  autoPlayInterval = 4000,
}: CinematicCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const interactionTimeout = useRef<NodeJS.Timeout | null>(null);

  const getSlideIndex = (offset: number) => {
    const len = movies.length;
    return ((currentIndex + offset) % len + len) % len;
  };

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  }, [movies.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
  }, [movies.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const handleInteraction = useCallback(() => {
    setIsAutoPlaying(false);
    if (interactionTimeout.current) {
      clearTimeout(interactionTimeout.current);
    }
    interactionTimeout.current = setTimeout(() => {
      setIsAutoPlaying(true);
    }, 2500);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || movies.length <= 1) return;

    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isAutoPlaying, goToNext, autoPlayInterval, movies.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrevious();
        handleInteraction();
      } else if (e.key === "ArrowRight") {
        goToNext();
        handleInteraction();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrevious, handleInteraction]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
      handleInteraction();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    touchStartX.current = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const diff = touchStartX.current - e.clientX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
      handleInteraction();
    }
  };

  const handlePillClick = (offset: number) => {
    if (offset === 0) {
      onMovieSelect(movies[currentIndex]);
      return;
    }
    const targetIndex = getSlideIndex(offset);
    goToSlide(targetIndex);
    handleInteraction();
  };

  if (movies.length === 0) return null;

  const slidePositions = [];
  for (let i = -VISIBLE_PILLS; i <= VISIBLE_PILLS; i++) {
    slidePositions.push(i);
  }

  const getSlideStyles = (offset: number) => {
    const absOffset = Math.abs(offset);

    if (offset === 0) {
      return {
        width: "min(400px, 70vw)",
        height: "min(450px, 60vh)",
        borderRadius: "28px",
        scale: 1,
        opacity: 1,
        x: 0,
        zIndex: 10,
        scaleX: 1,
      };
    }

    const baseWidth = 60;
    const baseHeight = 180;
    const scaleFactor = Math.max(0.5, 1 - absOffset * 0.25);
    const xOffset = offset * 90;
    const additionalOffset = offset > 0 ? 200 : -200;

    return {
      width: `${baseWidth * scaleFactor}px`,
      height: `${baseHeight * scaleFactor}px`,
      borderRadius: "50%",
      scale: scaleFactor,
      opacity: Math.max(0.3, 1 - absOffset * 0.2),
      x: xOffset + additionalOffset,
      zIndex: 10 - absOffset,
      scaleX: 0.6,
    };
  };

  return (
    <section className="relative w-full py-12 md:py-16 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      <div
        ref={containerRef}
        className="relative flex items-center justify-center min-h-[500px] md:min-h-[550px]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        style={{ cursor: "grab" }}
      >
        {slidePositions.map((offset) => {
          const slideIndex = getSlideIndex(offset);
          const movie = movies[slideIndex];
          const styles = getSlideStyles(offset);
          const isMain = offset === 0;

          return (
            <motion.div
              key={`${slideIndex}-${offset}`}
              className="absolute flex items-center justify-center"
              initial={false}
              animate={{
                width: styles.width,
                height: styles.height,
                borderRadius: styles.borderRadius,
                scale: styles.scale,
                opacity: styles.opacity,
                x: styles.x,
                zIndex: styles.zIndex,
                scaleX: styles.scaleX,
              }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 25,
                duration: ANIMATION_DURATION,
              }}
              onClick={() => handlePillClick(offset)}
              style={{
                backgroundColor: SLIDE_COLOR,
                boxShadow: isMain
                  ? "0 30px 60px -20px rgba(0,0,0,0.2), 0 20px 40px -20px rgba(232, 155, 140, 0.3)"
                  : "0 15px 30px -10px rgba(0,0,0,0.15)",
                cursor: isMain ? "pointer" : "pointer",
                transformOrigin: "center center",
              }}
            >
              {isMain && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="absolute inset-0 flex flex-col items-center justify-end p-6 text-white"
                  style={{
                    background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 40%, transparent 100%)",
                    borderRadius: "28px",
                  }}
                >
                  <h3 className="text-lg md:text-xl font-semibold text-center mb-1 drop-shadow-lg">
                    {movie.title}
                  </h3>
                  <p className="text-sm text-white/80">
                    {movie.year} • {movie.rating.toFixed(1)}
                  </p>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-2 mt-8">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              goToSlide(index);
              handleInteraction();
            }}
            className="p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded-full"
            aria-label={`Go to slide ${index + 1}`}
          >
            <motion.span
              className="block rounded-full"
              animate={{
                width: index === currentIndex ? 24 : 8,
                height: 8,
                backgroundColor: index === currentIndex ? "#374151" : "transparent",
                borderWidth: 2,
                borderColor: "#374151",
              }}
              transition={{ duration: 0.2 }}
            />
          </button>
        ))}
      </div>
    </section>
  );
};
