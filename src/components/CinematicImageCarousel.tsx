import { useState, useEffect, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Play, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWatchlist } from "@/hooks/useWatchlist";

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

const backgroundVariants = {
  enter: { scale: 1, opacity: 0 },
  center: {
    scale: 1.08, opacity: 1,
    transition: {
      scale: { duration: 12, ease: "linear" as const },
      opacity: { duration: 0.8, ease: "easeOut" as const },
    },
  },
  exit: {
    scale: 1.08, opacity: 0,
    transition: { opacity: { duration: 0.6, ease: "easeIn" as const } },
  },
};

const contentVariants = {
  enter: { opacity: 0, y: 60 },
  center: {
    opacity: 1, y: 0,
    transition: { duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: {
    opacity: 0, y: -30,
    transition: { duration: 0.4, ease: "easeIn" as const },
  },
};

export const CinematicImageCarousel = memo(({
  movies,
  onMovieSelect,
  autoPlayInterval = 6000,
}: CinematicImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const isSwiping = useRef(false);
  const slidesCount = Math.min(movies.length, 8);

  const clearAutoPlayTimeout = useCallback(() => {
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
      autoPlayTimeoutRef.current = null;
    }
  }, []);

  const goToSlide = useCallback((index: number) => {
    const targetIndex = (index % slidesCount + slidesCount) % slidesCount;
    setCurrentIndex(targetIndex);
    setProgress(0);
  }, [slidesCount]);

  const handleNext = useCallback(() => goToSlide(currentIndex + 1), [currentIndex, goToSlide]);
  const handlePrev = useCallback(() => goToSlide(currentIndex - 1), [currentIndex, goToSlide]);

  const pauseAutoPlay = useCallback(() => {
    setIsAutoPlaying(false);
    clearAutoPlayTimeout();
  }, [clearAutoPlayTimeout]);

  const resumeAutoPlayDelayed = useCallback((delay = 5000) => {
    clearAutoPlayTimeout();
    autoPlayTimeoutRef.current = setTimeout(() => {
      setIsAutoPlaying(true);
      setProgress(0);
    }, delay);
  }, [clearAutoPlayTimeout]);

  useEffect(() => {
    if (!isAutoPlaying || slidesCount <= 1) return;
    const interval = setInterval(handleNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying, handleNext, autoPlayInterval, slidesCount]);

  useEffect(() => {
    if (!isAutoPlaying || slidesCount <= 1) return;
    const progressInterval = setInterval(() => {
      setProgress(prev => prev >= 100 ? 0 : prev + 100 / (autoPlayInterval / 50));
    }, 50);
    return () => clearInterval(progressInterval);
  }, [currentIndex, isAutoPlaying, autoPlayInterval, slidesCount]);

  useEffect(() => () => clearAutoPlayTimeout(), [clearAutoPlayTimeout]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndX.current = e.touches[0].clientX;
    isSwiping.current = false;
    pauseAutoPlay();
  }, [pauseAutoPlay]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = Math.abs(currentX - touchStartX.current);
    const diffY = Math.abs(currentY - touchStartY.current);
    if (diffX > diffY && diffX > 10) {
      isSwiping.current = true;
      e.preventDefault();
    }
    touchEndX.current = currentX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping.current) {
      resumeAutoPlayDelayed(3000);
      return;
    }
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 40) handleNext();
    else if (diff < -40) handlePrev();
    isSwiping.current = false;
    resumeAutoPlayDelayed(4000);
  }, [handleNext, handlePrev, resumeAutoPlayDelayed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { handlePrev(); pauseAutoPlay(); resumeAutoPlayDelayed(); }
      else if (e.key === "ArrowRight") { handleNext(); pauseAutoPlay(); resumeAutoPlayDelayed(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, pauseAutoPlay, resumeAutoPlayDelayed]);

  if (movies.length === 0) return null;

  const currentMovie = movies[currentIndex];
  const inWatchlist = isInWatchlist(currentMovie.id);

  const handleWatchlistToggle = () => {
    if (inWatchlist) {
      removeFromWatchlist(currentMovie.id);
    } else {
      addToWatchlist({
        id: currentMovie.id,
        title: currentMovie.title,
        poster_path: currentMovie.posterUrl?.replace("https://image.tmdb.org/t/p/w500", ""),
        vote_average: currentMovie.rating,
      });
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[75vh] md:h-[85vh] overflow-hidden bg-black select-none"
      onMouseEnter={pauseAutoPlay}
      onMouseLeave={() => resumeAutoPlayDelayed(1000)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: "pan-y pinch-zoom" }}
      role="region"
      aria-label="Featured movies carousel"
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/10 z-50">
        <motion.div
          className="h-full bg-white"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.05, ease: "linear" }}
        />
      </div>

      {/* Background */}
      <AnimatePresence mode="sync">
        <motion.div key={currentMovie.id} className="absolute inset-0" variants={backgroundVariants} initial="enter" animate="center" exit="exit">
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${currentMovie.backdropUrl || currentMovie.posterUrl})` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="absolute inset-0 z-20 flex items-end">
        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div key={currentMovie.id} className="max-w-7xl mx-auto px-5 md:px-12 pb-28 md:pb-36" variants={contentVariants} initial="enter" animate="center" exit="exit">
              {currentMovie.genre && (
                <div className="inline-block mb-4">
                  <span className="text-xs md:text-sm uppercase tracking-[0.2em] text-white/60 font-medium">
                    {currentMovie.genre.split(",")[0]}
                  </span>
                </div>
              )}

              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[0.95] mb-4 md:mb-6 tracking-tight max-w-4xl">
                {currentMovie.title}
              </h2>

              <div className="flex items-center gap-4 mb-5 md:mb-6 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm md:text-base font-semibold text-white">{currentMovie.rating.toFixed(1)}</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-white/40" />
                <span className="text-sm md:text-base text-white/80">{currentMovie.year}</span>
              </div>

              {currentMovie.overview && (
                <p className="text-white/70 text-sm md:text-base lg:text-lg leading-relaxed line-clamp-2 md:line-clamp-3 mb-6 md:mb-8 max-w-2xl">
                  {currentMovie.overview}
                </p>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-3 md:gap-4">
                {/* View Details / Watch Trailer - opens movie card */}
                <Button
                  size="lg"
                  onClick={() => onMovieSelect(currentMovie)}
                  className="rounded-xl md:rounded-2xl px-6 md:px-10 h-12 md:h-14 gap-2.5 font-semibold text-sm md:text-base bg-white text-black hover:bg-white/90 shadow-2xl shadow-white/10 transition-all duration-300 hover:scale-[1.02]"
                >
                  <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                  <span>Watch Trailer</span>
                </Button>

                {/* Add to Watchlist */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleWatchlistToggle}
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center
                    backdrop-blur-md transition-all duration-300 border
                    ${inWatchlist
                      ? "bg-white/20 border-white/40 text-white"
                      : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                    }`}
                  aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                >
                  {inWatchlist ? (
                    <Check className="w-5 h-5 md:w-6 md:h-6" />
                  ) : (
                    <Plus className="w-5 h-5 md:w-6 md:h-6" />
                  )}
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation arrows */}
      {!isMobile && slidesCount > 1 && (
        <>
          <button
            onClick={() => { handlePrev(); pauseAutoPlay(); resumeAutoPlayDelayed(); }}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center bg-black/40 hover:bg-black/60 text-white/80 hover:text-white transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/20 hover:scale-110 group"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 transition-transform group-hover:-translate-x-0.5" />
          </button>
          <button
            onClick={() => { handleNext(); pauseAutoPlay(); resumeAutoPlayDelayed(); }}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center bg-black/40 hover:bg-black/60 text-white/80 hover:text-white transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/20 hover:scale-110 group"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 md:w-7 md:h-7 transition-transform group-hover:translate-x-0.5" />
          </button>
        </>
      )}

      {/* Pagination dots */}
      <div className="absolute bottom-5 md:bottom-8 left-0 right-0 z-30">
        <div className="max-w-7xl mx-auto px-5 md:px-12">
          <div className="flex items-end justify-between gap-4">
            <div className="flex items-center gap-2 lg:ml-auto">
              {movies.slice(0, slidesCount).map((_, index) => (
                <button
                  key={index}
                  onClick={() => { goToSlide(index); pauseAutoPlay(); resumeAutoPlayDelayed(); }}
                  className={`transition-all duration-400 ease-out rounded-full ${
                    index === currentIndex ? "w-8 md:w-10 h-2 bg-white" : "w-2 h-2 bg-white/30 hover:bg-white/50"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === currentIndex ? "true" : "false"}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {isMobile && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 text-white/40 text-xs">
          <ChevronLeft className="w-3 h-3" />
          <span>Swipe</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      )}

      <div role="status" aria-live="polite" className="sr-only">
        Slide {currentIndex + 1} of {slidesCount}: {currentMovie?.title}
      </div>
    </section>
  );
});

CinematicImageCarousel.displayName = "CinematicImageCarousel";
export default CinematicImageCarousel;
