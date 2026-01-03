import { useState, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
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

  const dragX = useMotionValue(0);
  const dragXSpring = useSpring(dragX, { stiffness: 300, damping: 30 });

  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const cardWidth = isDesktop ? 360 : 320;
  const cardHeight = isDesktop ? 540 : 480;

  const currentMovie = movies[currentIndex];
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    if (currentMovie?.posterUrl) {
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
    if (!isAutoPlaying || movies.length <= 1 || isHovered) return;

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
    <section className="relative w-full mb-16">
      <div
        className="relative w-full overflow-hidden"
        style={{ height: '600px' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Cinematic Background with Radial Gradient */}
        <motion.div
          key={`bg-${currentMovie.id}`}
          className="absolute inset-0 -z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          style={{
            background: `radial-gradient(ellipse at center, rgba(${dominantColor}, 0.12) 0%, rgba(${dominantColor}, 0.03) 50%, #FAFAFA 100%)`,
            backdropFilter: 'blur(80px)',
          }}
        />

        {/* Vignette Effect */}
        <div
          className="absolute inset-0 pointer-events-none -z-10"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.08) 100%)',
          }}
        />

        <FilmGrain />

        {/* Edge Fade Mask */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
          }}
        />

        <div className="relative w-full h-full flex items-center justify-center max-w-7xl mx-auto px-4">
          <motion.div
            className="relative flex items-center justify-center"
            style={{
              width: '100%',
              height: `${cardHeight}px`,
              x: dragXSpring,
              cursor: 'grab',
            }}
            drag={isDesktop ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            whileTap={{ cursor: 'grabbing' }}
          >
            {movies.map((movie, index) => {
              const offset = index - currentIndex;
              const absOffset = Math.abs(offset);

              if (!isDesktop && absOffset > 0) return null;
              if (isDesktop && absOffset > 1) return null;

              const isActive = offset === 0;
              
              // Cinematic positioning and styling
              const scale = isActive ? 1.0 : 0.88;
              const opacity = isActive ? 1 : 0.3;
              const blur = isActive ? 0 : 1;
              const translateX = isActive ? 0 : offset * 280;

              return (
                <motion.div
                  key={movie.id}
                  className="absolute will-change-transform"
                  style={{
                    width: `${cardWidth}px`,
                    height: `${cardHeight}px`,
                    pointerEvents: isActive ? "auto" : "auto",
                    zIndex: isActive ? 20 : absOffset === 1 ? 10 : 0,
                    cursor: isActive ? 'auto' : 'pointer',
                  }}
                  initial={false}
                  animate={{
                    scale,
                    opacity,
                    x: translateX,
                    filter: `blur(${blur}px)`,
                  }}
                  transition={{
                    duration: 0.6,
                    ease: [0.22, 0.61, 0.36, 1],
                  }}
                  onClick={() => {
                    if (!isActive) {
                      goToSlide(index);
                      handleInteraction();
                    }
                  }}
                >
                  {/* Glassmorphic Card */}
                  <div
                    className="relative w-full h-full overflow-hidden"
                    style={{
                      borderRadius: '16px',
                      border: '1px solid rgba(255,255,255,0.3)',
                      background: 'rgba(255,255,255,0.05)',
                      backdropFilter: 'blur(20px) saturate(120%)',
                      boxShadow: isActive
                        ? `0 40px 120px rgba(${dominantColor}, 0.3)`
                        : 'none',
                    }}
                  >
                    {/* Ken Burns Effect on Poster */}
                    <motion.div
                      className="w-full h-full"
                      animate={
                        isActive && !prefersReducedMotion
                          ? { scale: [1, 1.015] }
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
                        loading={index < 3 ? "eager" : "lazy"}
                        decoding="async"
                      />
                    </motion.div>

                    {/* Gradient Overlay - Bottom 75% */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'linear-gradient(to bottom, transparent 25%, rgba(0,0,0,0.92) 100%)',
                      }}
                    />

                    {isActive && (
                      <>
                        {/* Glassmorphic Rating Badge */}
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3, duration: 0.4 }}
                          className="absolute flex items-center gap-1.5 text-white"
                          style={{
                            top: '20px',
                            left: '20px',
                            background: 'rgba(0,0,0,0.35)',
                            backdropFilter: 'blur(16px) saturate(150%)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: 600,
                          }}
                        >
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {movie.rating.toFixed(1)}
                        </motion.div>

                        {/* Year Badge */}
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4, duration: 0.4 }}
                          className="absolute text-white font-medium"
                          style={{
                            top: '20px',
                            left: '90px',
                            background: 'rgba(0,0,0,0.3)',
                            backdropFilter: 'blur(16px) saturate(150%)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '13px',
                          }}
                        >
                          {movie.year}
                        </motion.div>

                        {/* Genre Badge */}
                        {movie.genre && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.4 }}
                            className="absolute text-white font-medium"
                            style={{
                              top: '20px',
                              left: '150px',
                              background: 'rgba(0,0,0,0.3)',
                              backdropFilter: 'blur(16px) saturate(150%)',
                              border: '1px solid rgba(255,255,255,0.15)',
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontSize: '13px',
                            }}
                          >
                            {movie.genre.split(',')[0].trim()}
                          </motion.div>
                        )}

                        {/* Title and Button */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4, duration: 0.5 }}
                          className="absolute"
                          style={{
                            bottom: '24px',
                            left: '24px',
                            right: '24px',
                          }}
                        >
                          <h2
                            className="font-bold text-white mb-4"
                            style={{
                              fontSize: isDesktop ? '32px' : '28px',
                              lineHeight: '1.2',
                              textShadow: '0 4px 20px rgba(0,0,0,0.8)',
                              letterSpacing: '-0.01em',
                              fontWeight: 700,
                            }}
                          >
                            {movie.title}
                          </h2>

                          {/* Glassmorphic Button */}
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              onMovieSelect(movie);
                            }}
                            className="font-semibold transition-all text-white"
                            style={{
                              width: '100%',
                              height: '48px',
                              background: 'rgba(255,255,255,0.25)',
                              backdropFilter: 'blur(16px) saturate(180%)',
                              border: '1px solid rgba(255,255,255,0.4)',
                              borderRadius: '12px',
                              fontSize: '14px',
                              fontWeight: 600,
                              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 4px 12px rgba(0,0,0,0.15)',
                              cursor: 'pointer',
                            }}
                            whileHover={{
                              y: -2,
                              background: 'rgba(255,255,255,0.35)',
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

        {/* Glassmorphic Navigation Arrows - Always Visible */}
        {movies.length > 1 && isDesktop && (
          <>
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
                handleInteraction();
              }}
              className="absolute flex items-center justify-center transition-all text-white"
              style={{
                top: '50%',
                left: '24px',
                width: '56px',
                height: '56px',
                background: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(20px) saturate(150%)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '28px',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                zIndex: 30,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.2 }}
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>

            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
                handleInteraction();
              }}
              className="absolute flex items-center justify-center transition-all text-white"
              style={{
                top: '50%',
                right: '24px',
                width: '56px',
                height: '56px',
                background: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(20px) saturate(150%)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '28px',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                zIndex: 30,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.2 }}
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {movies.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-8 mt-8"
          style={{ zIndex: 20 }}
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
                height: '8px',
                width: index === currentIndex ? '32px' : '8px',
                background: index === currentIndex ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                backdropFilter: 'blur(8px)',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
              }}
              whileHover={{
                background: index === currentIndex ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
              }}
              transition={{ duration: 0.3 }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </motion.div>
      )}
    </section>
  );
};
