import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
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
  const [isDragging, setIsDragging] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  const containerHeight = isMobile ? "520px" : "620px";
  const cardWidth = isTablet ? 340 : 480;
  const cardHeight = isTablet ? 520 : 620;

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
    if (!isAutoPlaying || movies.length <= 1 || isDragging) return;

    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isAutoPlaying, goToNext, autoPlayInterval, movies.length, isDragging]);

  const handleInteraction = () => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  if (!currentMovie || movies.length === 0) return null;

  return (
    <section className="relative w-full overflow-hidden bg-[#0A0A0A] py-12 md:py-16">
      <div className="relative mx-auto" style={{ height: containerHeight }}>

        <div className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)",
          }}
        />

        <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.02]"
          style={{
            backgroundImage: "url(data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E)",
            backgroundRepeat: "repeat",
          }}
        />

        <div
          ref={constraintsRef}
          className="relative w-full h-full flex items-center justify-center overflow-visible"
        >
          <div className="relative flex items-center justify-center gap-8" style={{ height: cardHeight }}>
            {movies.map((movie, index) => {
              const offset = index - currentIndex;
              const absOffset = Math.abs(offset);

              let scale = 1;
              let opacity = 1;
              let translateX = 0;
              let blur = 0;
              let zIndex = 10;

              if (absOffset === 0) {
                scale = 1.0;
                opacity = 1;
                translateX = 0;
                blur = 0;
                zIndex = 10;
              } else if (absOffset === 1) {
                scale = 0.85;
                opacity = 0.6;
                translateX = offset > 0 ? 60 : -60;
                blur = 2;
                zIndex = 5;
              } else if (absOffset >= 2) {
                scale = 0.7;
                opacity = 0.3;
                translateX = offset > 0 ? 120 : -120;
                blur = 4;
                zIndex = 1;
              }

              const isActive = offset === 0;
              const imageUrl = isTablet ? movie.posterUrl : (movie.backdropUrl || movie.posterUrl);

              return (
                <motion.div
                  key={movie.id}
                  className="absolute cursor-pointer"
                  style={{
                    width: cardWidth,
                    height: cardHeight,
                    zIndex,
                  }}
                  initial={false}
                  animate={{
                    scale,
                    opacity,
                    x: `${translateX}%`,
                    filter: `blur(${blur}px)`,
                  }}
                  transition={{
                    duration: 0.6,
                    ease: [0.4, 0, 0.2, 1],
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
                    style={{ borderRadius: "24px" }}
                  >
                    <motion.div
                      className="w-full h-full"
                      animate={isActive ? {
                        scale: [1, 1.05, 1],
                      } : {}}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <picture>
                        <source
                          media="(min-width: 1024px)"
                          srcSet={movie.backdropUrl || movie.posterUrl}
                          type="image/webp"
                        />
                        <source
                          media="(max-width: 1023px)"
                          srcSet={movie.posterUrl}
                          type="image/webp"
                        />
                        <img
                          src={imageUrl}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                          loading={index < 3 ? "eager" : "lazy"}
                          decoding="async"
                          style={{
                            imageRendering: "high-quality",
                          }}
                        />
                      </picture>
                    </motion.div>

                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.9) 100%)",
                      }}
                    />

                    {isActive && (
                      <>
                        <div
                          className="absolute flex items-center gap-2 text-white"
                          style={{
                            top: "16px",
                            left: "16px",
                            backgroundColor: "rgba(255,255,255,0.1)",
                            backdropFilter: "blur(20px) saturate(180%)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                            padding: "8px 14px",
                            borderRadius: "20px",
                          }}
                        >
                          <span className="text-yellow-400 text-base">★</span>
                          <span className="font-bold text-sm">{movie.rating.toFixed(1)}</span>
                        </div>

                        <div
                          className="absolute text-white font-semibold text-sm"
                          style={{
                            top: "60px",
                            left: "16px",
                            backgroundColor: "rgba(255,255,255,0.1)",
                            backdropFilter: "blur(20px) saturate(180%)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                            padding: "8px 14px",
                            borderRadius: "20px",
                          }}
                        >
                          {movie.year}
                        </div>

                        {movie.genre && (
                          <div
                            className="absolute text-white font-semibold text-sm"
                            style={{
                              top: "104px",
                              left: "16px",
                              backgroundColor: "rgba(255,255,255,0.1)",
                              backdropFilter: "blur(20px) saturate(180%)",
                              border: "1px solid rgba(255,255,255,0.2)",
                              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                              padding: "8px 14px",
                              borderRadius: "20px",
                            }}
                          >
                            {movie.genre}
                          </div>
                        )}

                        <div
                          className="absolute w-full"
                          style={{
                            bottom: 0,
                            backgroundColor: "rgba(0,0,0,0.5)",
                            backdropFilter: "blur(24px)",
                            padding: "24px",
                            borderRadius: "24px 24px 24px 24px",
                          }}
                        >
                          <h2
                            className="font-bold text-white mb-4"
                            style={{
                              fontSize: isTablet ? "22px" : "26px",
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
                            className="w-full font-bold text-black transition-all hover:scale-[1.02] active:scale-95"
                            style={{
                              backgroundColor: "rgba(255,255,255,0.95)",
                              backdropFilter: "blur(20px)",
                              height: "52px",
                              borderRadius: "26px",
                              fontSize: "17px",
                              boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#FFFFFF";
                              e.currentTarget.style.transform = "translateY(-2px)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.95)";
                              e.currentTarget.style.transform = "translateY(0)";
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
                handleInteraction();
              }}
              className="absolute flex items-center justify-center transition-all hover:scale-110 z-20"
              style={{
                top: "50%",
                left: "32px",
                width: "56px",
                height: "56px",
                backgroundColor: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(16px) saturate(180%)",
                border: "1px solid rgba(255,255,255,0.18)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                borderRadius: "50%",
                transform: "translateY(-50%)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)";
              }}
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
                handleInteraction();
              }}
              className="absolute flex items-center justify-center transition-all hover:scale-110 z-20"
              style={{
                top: "50%",
                right: "32px",
                width: "56px",
                height: "56px",
                backgroundColor: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(16px) saturate(180%)",
                border: "1px solid rgba(255,255,255,0.18)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                borderRadius: "50%",
                transform: "translateY(-50%)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)";
              }}
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            <div
              className="absolute left-1/2 flex items-center gap-3 z-20"
              style={{
                bottom: "80px",
                transform: "translateX(-50%)",
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
                    height: "8px",
                    width: index === currentIndex ? "24px" : "8px",
                    backgroundColor: index === currentIndex ? "#FFFFFF" : "rgba(255,255,255,0.4)",
                    borderRadius: "4px",
                    border: "none",
                    cursor: "pointer",
                  }}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
