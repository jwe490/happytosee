import { useState, useEffect, useRef, useCallback, memo } from "react";
import { ChevronLeft, ChevronRight, Star, Play, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

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

interface CinematicImageCarouselProps {
  movies: Movie[];
  onMovieSelect: (movie: Movie) => void;
  autoPlayInterval?: number;
}

export const CinematicImageCarousel = memo(({
  movies,
  onMovieSelect,
  autoPlayInterval = 5000,
}: CinematicImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);

  // Touch gesture refs
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const slidesCount = Math.min(movies.length, 8);

  // Navigation handlers
  const goToSlide = useCallback((index: number) => {
    const targetIndex = ((index % slidesCount) + slidesCount) % slidesCount;
    setCurrentIndex(targetIndex);
    setProgress(0);
  }, [slidesCount]);

  const handleNext = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const handlePrev = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  // Pause auto-play on interaction
  const pauseAutoPlay = useCallback(() => {
    setIsAutoPlaying(false);
  }, []);

  const resumeAutoPlay = useCallback(() => {
    setIsAutoPlaying(true);
    setProgress(0);
  }, []);

  // Auto-play effect
  useEffect(() => {
    if (!isAutoPlaying || slidesCount <= 1) return;

    const interval = setInterval(() => {
      handleNext();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying, handleNext, autoPlayInterval, slidesCount]);

  // Progress bar effect
  useEffect(() => {
    if (!isAutoPlaying || slidesCount <= 1) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + (100 / (autoPlayInterval / 100));
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [currentIndex, isAutoPlaying, autoPlayInterval, slidesCount]);

  // Touch handlers for swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    pauseAutoPlay();
  }, [pauseAutoPlay]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50; // Reduced for better responsiveness

    if (diff > threshold) {
      handleNext(); // Swiped left
    } else if (diff < -threshold) {
      handlePrev(); // Swiped right
    }

    // Resume auto-play after swipe
    setTimeout(resumeAutoPlay, 3000);
  }, [handleNext, handlePrev, resumeAutoPlay]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrev();
        pauseAutoPlay();
        setTimeout(resumeAutoPlay, 5000);
      } else if (e.key === "ArrowRight") {
        handleNext();
        pauseAutoPlay();
        setTimeout(resumeAutoPlay, 5000);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, pauseAutoPlay, resumeAutoPlay]);

  if (movies.length === 0) return null;

  const currentMovie = movies[currentIndex];

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden bg-black"
      onMouseEnter={pauseAutoPlay}
      onMouseLeave={resumeAutoPlay}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Featured movies carousel"
      aria-roledescription="carousel"
    >
      {/* Progress bar at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-40">
        <div
          className="h-full bg-primary transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Slides container - THE THREE-SLIDE SYSTEM */}
      <div className="relative w-full h-full" id="carousel-container">
        {movies.slice(0, slidesCount).map((movie, index) => {
          // Calculate relative positions for the three-slide system
          const isActive = index === currentIndex;
          const isPrev = index === (currentIndex - 1 + slidesCount) % slidesCount;
          const isNext = index === (currentIndex + 1) % slidesCount;

          // Only render active, prev, and next slides for performance
          const shouldRender = isActive || isPrev || isNext;
          if (!shouldRender) return null;

          // Assign transform values based on position
          let transformClass = "translate-x-full"; // Default: off-screen right (+100%)
          let opacityClass = "opacity-0";
          let zIndex = 10;

          if (isActive) {
            transformClass = "translate-x-0"; // Center (0%)
            opacityClass = "opacity-100";
            zIndex = 20;
          } else if (isPrev) {
            transformClass = "-translate-x-full"; // Off-screen left (-100%)
            opacityClass = "opacity-0";
            zIndex = 10;
          }

          const backdropUrl = movie.backdropUrl || movie.posterUrl;

          return (
            <div
              key={movie.id}
              className={`
                absolute inset-0
                transition-all duration-700 ease-out
                ${transformClass}
                ${opacityClass}
              `}
              style={{ 
                zIndex,
                willChange: "transform, opacity",
              }}
            >
              {/* Background Image with subtle Ken Burns zoom */}
              <div className="absolute inset-0 overflow-hidden">
                <div
                  className={`
                    absolute inset-0 bg-cover bg-center bg-no-repeat
                    transition-transform duration-[8000ms] ease-out
                    ${isActive ? "scale-105" : "scale-100"}
                  `}
                  style={{
                    backgroundImage: `url(${backdropUrl})`,
                  }}
                />
              </div>

              {/* Multi-layer gradient overlays for cinematic depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70" />

              {/* Content with delayed parallax animation */}
              <div className="absolute inset-0 flex items-end">
                <div className="w-full max-w-7xl mx-auto px-6 md:px-12 pb-24 md:pb-32">
                  <div
                    className="max-w-2xl transition-all duration-700 ease-out"
                    style={{
                      transform: isActive ? "translateY(0)" : "translateY(40px)",
                      opacity: isActive ? 1 : 0,
                      transitionDelay: isActive ? "300ms" : "0ms",
                    }}
                  >
                    {/* Badges row */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-semibold text-white">
                          {movie.rating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-sm text-white/90 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm">
                        {movie.year}
                      </span>
                      {movie.genre && (
                        <span className="text-sm text-white/80 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm hidden sm:inline-block">
                          {movie.genre.split(",")[0]}
                        </span>
                      )}
                    </div>

                    {/* Title - large italic display font for premium feel */}
                    <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-4 tracking-tight">
                      {movie.title}
                    </h2>

                    {/* Overview */}
                    {movie.overview && (
                      <p className="text-white/75 text-base md:text-lg leading-relaxed line-clamp-2 md:line-clamp-3 mb-8 max-w-xl">
                        {movie.overview}
                      </p>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-4">
                      <Button
                        size="lg"
                        onClick={() => onMovieSelect(movie)}
                        className="rounded-full px-8 gap-2 font-semibold text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-200"
                      >
                        <Play className="w-5 h-5 fill-current" />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => onMovieSelect(movie)}
                        className="rounded-full px-6 gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
                      >
                        <Info className="w-5 h-5" />
                        <span className="hidden sm:inline">More Info</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation arrows - Desktop only */}
      {!isMobile && slidesCount > 1 && (
        <>
          <button
            onClick={() => {
              handlePrev();
              pauseAutoPlay();
              setTimeout(resumeAutoPlay, 5000);
            }}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all duration-200 backdrop-blur-sm border border-white/10 hover:border-white/20 hover:scale-110"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => {
              handleNext();
              pauseAutoPlay();
              setTimeout(resumeAutoPlay, 5000);
            }}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all duration-200 backdrop-blur-sm border border-white/10 hover:border-white/20 hover:scale-110"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Bottom controls container */}
      <div className="absolute bottom-6 md:bottom-8 left-0 right-0 z-30">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-end justify-between gap-6">
            {/* Thumbnail filmstrip - Desktop */}
            <div className="hidden md:flex items-center gap-2 p-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10">
              {movies.slice(0, slidesCount).map((movie, index) => (
                <button
                  key={movie.id}
                  onClick={() => {
                    goToSlide(index);
                    pauseAutoPlay();
                    setTimeout(resumeAutoPlay, 5000);
                  }}
                  className={`
                    relative w-14 h-20 rounded-lg overflow-hidden transition-all duration-300
                    ${index === currentIndex
                      ? "ring-2 ring-primary scale-105 opacity-100"
                      : "opacity-50 hover:opacity-80 hover:scale-102"
                    }
                  `}
                >
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    draggable={false}
                  />
                </button>
              ))}
            </div>

            {/* Pagination dots */}
            <div className="flex items-center gap-2">
              {movies.slice(0, slidesCount).map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    goToSlide(index);
                    pauseAutoPlay();
                    setTimeout(resumeAutoPlay, 5000);
                  }}
                  className={`
                    transition-all duration-500 ease-out rounded-full
                    ${index === currentIndex
                      ? "w-10 h-2 bg-white"
                      : "w-2 h-2 bg-white/40 hover:bg-white/60"
                    }
                  `}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === currentIndex ? "true" : "false"}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Screen reader announcement */}
      <div role="status" aria-live="polite" className="sr-only">
        Slide {currentIndex + 1} of {slidesCount}: {currentMovie?.title}
      </div>
    </section>
  );
});

CinematicImageCarousel.displayName = "CinematicImageCarousel";

export default CinematicImageCarousel;
