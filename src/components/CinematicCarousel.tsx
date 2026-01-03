import { useState, useEffect, useCallback, useRef } from "react";
import { motion, useMotionValue, useSpring, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-mobile";
import { extractDominantColor } from "@/utils/colorExtractor";
import { FilmGrain } from "./FilmGrain";

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
  autoPlayInterval = 6000,
}: CinematicCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [dominantColor, setDominantColor] = useState("15, 15, 15");
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const dragX = useMotionValue(0);
  const dragXSpring = useSpring(dragX, { stiffness: 300, damping: 30 });

  const isMobile = useMediaQuery("(max-width: 640px)");
  const containerHeight = isMobile ? "480px" : "560px";
  const cardWidth = isMobile ? 280 : 320;
  const cardHeight = isMobile ? 420 : 480;

  const currentMovie = movies[currentIndex];
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    if (currentMovie?.posterUrl) {
      setIsImageLoaded(false);
      extractDominantColor(currentMovie.posterUrl).then((color) => {
        setDominantColor(color);
      });
    }
  }, [currentMovie?.posterUrl]);

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
    if (!isAutoPlaying  movies.length <= 1  isHovered) return;

    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isAutoPlaying, goToNext, autoPlayInterval, movies.length, isHovered]);

  const handleInteraction = () => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;

    if (info.offset.x > threshold) {
      goToPrevious();
      handleInteraction();
    } else if (info.offset.x < -threshold) {
      goToNext();
      handleInteraction();
    }

    dragX.set(0);
  };

  if (!currentMovie || movies.length === 0) return null;

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        height: containerHeight,
        cursor: 'grab',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        key={bg-${currentMovie.id}}
        className="absolute inset-0 -z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        style={{
          background: radial-gradient(ellipse at center, rgba(${dominantColor}, 0.15) 0%, rgba(${dominantColor}, 0.05) 40%, #0F0F0F 100%),
        }}
      />
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: isMobile ? '40px 16px' : '60px 80px',
        }}
      >
        <motion.div
          className="relative flex items-center justify-center"
          style={{
            width: '100%',
            x: dragXSpring,
          }}
          drag={!isMobile ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
        >
          {movies.map((movie, index) => {
            const offset = index - currentIndex;
            const absOffset = Math.abs(offset);

            if (isMobile && absOffset > 0) return null;
            if (!isMobile && absOffset > 1) return null;

            let scale = 1;
            let opacity = 1;
            let translateX = 0;
            let translateY = 0;
            let brightness = 1;
            let blur = 0;

            if (absOffset === 0) {
              scale = 1.0;
              opacity = 1;
              translateX = 0;
              translateY = 0;
              brightness = 1;
              blur = 0;
            } else if (absOffset === 1) {
              scale = 0.88;
              opacity = 0.4;
              translateX = offset > 0 ? 35 : -35;
              translateY = 12;
              brightness = 0.6;
              blur = 1;
            }

            const isActive = offset === 0;

            return (
              <motion.div
                key={movie.id}
                className="absolute cursor-pointer will-change-transform"
                style={{
                  width: ${cardWidth}px,
                  height: ${cardHeight}px,
                  pointerEvents: isActive ? "auto" : "none",
                }}
                initial={false}
                animate={{
                  scale,
                  opacity,
                  x: ${translateX}%,
                  y: translateY,
                  filter: brightness(${brightness}) blur(${blur}px),
                }}
                transition={{
                  duration: 0.6,
                  ease: [0.22, 0.61, 0.36, 1],
                  scale: {
                    duration: 0.6,
                    ease: [0.22, 0.61, 0.36, 1],
                  },
                  x: {
                    duration: 0.65,
                    delay: 0.05,
                    ease: [0.22, 0.61, 0.36, 1],
                  },
                }}
                onClick={() => {
                  if (offset !== 0) {
                    goToSlide(index);
                    handleInteraction();
                  }
                }}
              >
                <div
                  className="relative w-full h-full overflow-hidden"
                  style={{
                    borderRadius: '16px',
                    boxShadow: isActive
                      ? 0 24px 80px rgba(0,0,0,0.6), 0 0 120px rgba(${dominantColor}, 0.25)
                      : '0 24px 80px rgba(0,0,0,0.6)',
                  }}
                >
                  <motion.div
                    className="w-full h-full"
                    animate={
                      isActive && !prefersReducedMotion
                        ? { scale: [1, 1.02] }
                        : { scale: 1 }
                    }
                    transition={{
                      duration: 12,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  >
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover"

      <FilmGrain />

      <div
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          maskImage: 'linear-gradient(90deg, transparent 0%, black 15%, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 15%, black 85%, transparent 100%)',
        }}
      />
  loading={index < 3 ? "eager" : "lazy"}
                      decoding="async"
                      onLoad={() => {
                        if (isActive) setIsImageLoaded(true);
                      }}
                      style={{
                        imageRendering: 'high-quality',
                      }}
                    />
                  </motion.div>

                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.92) 100%)',
                      height: '75%',
                      top: '25%',
                    }}
                  />

                  {isActive && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="absolute flex items-center gap-2 text-white"
                        style={{
                          top: '20px',
                          left: '20px',
                          backgroundColor: 'rgba(0,0,0,0.75)',
                          backdropFilter: 'blur(16px)',
                          padding: '8px 12px',
                          borderRadius: '20px',
                          height: '32px',
                        }}
                      >
                        <span className="text-yellow-400" style={{ fontSize: '14px' }}>★</span>
                        <span className="font-medium" style={{ fontSize: '15px' }}>{movie.rating.toFixed(1)}</span>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                        className="absolute text-white font-medium"
                        style={{
                          top: '60px',
                          left: '20px',
                          backgroundColor: 'rgba(0,0,0,0.65)',
                          backdropFilter: 'blur(16px)',
                          padding: '6px 12px',
                          borderRadius: '12px',
                          fontSize: '14px',
                        }}
                      >
                        {movie.year}
                      </motion.div>

                      {movie.genre && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5, duration: 0.4 }}
                          className="absolute text-white font-medium"
                          style={{
                            top: '100px',
                            left: '20px',
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(16px)',
                            padding: '6px 12px',
                            borderRadius: '12px',
                            fontSize: '13px',
                          }}
                        >
                          {movie.genre.split(',')[0].trim()}
                        </motion.div>
                      )}

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="absolute"
                        style={{
                          bottom: '20px',
                          left: '20px',
                          right: '20px',
                        }}
                      >
                        <h2
                          className="font-bold text-white mb-3"
                          style={{
                            fontSize: '26px',
                            lineHeight: '1.15',
                            textShadow: '0 4px 16px rgba(0,0,0,0.8)',
                            letterSpacing: '-0.01em',
                            fontWeight: 800,
                          }}
                        >
                          {movie.title}
                        </h2>

                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMovieSelect(movie);
                          }}
                          className="w-full font-semibold transition-all"
                          style={{
                            height: '44px',
                            backgroundColor: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(12px)',
                            borderRadius: '22px',
                            fontSize: '15px',
                            fontWeight: 600,
                            color: '#1F1F1F',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                          whileHover={{
                            backgroundColor: 'rgba(255,255,255,1)',
                            y: -1,
                            boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                          }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                        >
                          View Details
                        </motion.button>
                      </motion.div>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {movies.length > 1 && !isMobile && (
        <>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
              handleInteraction();
            }}
            className="absolute flex items-center justify-center transition-all z-20"
            style={{
              top: '50%',
              left: '40px',
              width: '52px',
              height: '52px',
              backgroundColor: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '26px',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 0.9 : 0 }}
            whileHover={{ opacity: 1, scale: 1.08 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.35 }}
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
              top: '50%',
              right: '40px',
              width: '52px',
              height: '52px',
              backgroundColor: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '26px',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 0.9 : 0 }}
            whileHover={{ opacity: 1, scale: 1.08 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.35 }}
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </motion.button>
        </>
      )}

      {movies.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="absolute left-1/2 flex items-center gap-3 z-20"
          style={{
            bottom: isMobile ? '16px' : '-40px',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0,0,0,0.25)',
            backdropFilter: 'blur(12px)',
            padding: '10px 20px',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {movies.map((_, index) => (
            <motion.button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                goToSlide(index);
                handleInteraction();
              }}
              className="transition-all"
              style={{
                height: '5px',
                width: index === currentIndex ? '18px' : '5px',
                backgroundColor: index === currentIndex ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
                borderRadius: '3px',
                border: 'none',
                cursor: 'pointer',
              }}
              whileHover={{
                backgroundColor: 'rgba(255,255,255,0.7)',
              }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              aria-label={Go to slide ${index + 1}}
            />
          ))}
        </motion.div>
      )}

      {isMobile && movies.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
              handleInteraction();
            }}
            className="absolute flex items-center justify-center z-20"
            style={{
              top: '50%',
              left: '16px',
              width: '48px',
              height: '48px',
              backgroundColor: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '24px',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
            }}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
              handleInteraction();
            }}
            className="absolute flex items-center justify-center z-20"
            style={{
              top: '50%',
              right: '16px',
              width: '48px',
              height: '48px',
              backgroundColor: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '24px',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
            }}
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </>
      )}
    </section>
  );
};
