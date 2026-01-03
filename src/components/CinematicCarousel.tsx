import { useState, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring, PanInfo, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Play } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-mobile";
import { extractDominantColor } from "@/utils/colorExtractor";

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
  const [dominantColor, setDominantColor] = useState("15, 15, 15");
  const [direction, setDirection] = useState(0);

  const dragX = useMotionValue(0);
  const dragXSpring = useSpring(dragX, { stiffness: 400, damping: 40 });

  const isMobile = useMediaQuery("(max-width: 767px)");
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const currentMovie = movies[currentIndex];

  // Extract dominant color
  useEffect(() => {
    if (currentMovie?.posterUrl) {
      extractDominantColor(currentMovie.posterUrl)
        .then((color) => setDominantColor(color))
        .catch(() => setDominantColor("15, 15, 15"));
    }
  }, [currentMovie?.posterUrl]);

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

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying || movies.length <= 1 || isHovered) return;

    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isAutoPlaying, goToNext, autoPlayInterval, movies.length, isHovered]);

  const handleInteraction = useCallback(() => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 12000);
  }, []);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const threshold = 50;

    if (info.offset.x > threshold) {
      goToPrevious();
      handleInteraction();
    } else if (info.offset.x < -threshold) {
      goToNext();
      handleInteraction();
    }

    dragX.set(0);
  }, [goToPrevious, goToNext, handleInteraction, dragX]);

  // Safety check
  if (!currentMovie || movies.length === 0) {
    return <div className="w-full h-screen flex items-center justify-center text-white">No movies available</div>;
  }

  return (
    <section className="relative w-full">
      {/* DESKTOP LANDSCAPE */}
      {isDesktop && (
        <div 
          className="relative w-full overflow-hidden bg-black"
          style={{ height: '85vh', minHeight: '600px', maxHeight: '800px' }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Background Layer */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`bg-${currentMovie.id}`}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              {/* Backdrop with blur */}
              <div className="absolute inset-0 bg-black">
                <img
                  src={currentMovie.backdropUrl || currentMovie.posterUrl}
                  alt=""
                  className="w-full h-full object-cover opacity-40"
                  style={{ filter: 'blur(60px)' }}
                />
              </div>

              {/* Color gradient */}
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(ellipse at center, rgba(${dominantColor}, 0.2), rgba(0,0,0,0.8) 70%)`,
                }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Content Grid */}
          <div className="relative h-full flex items-center max-w-7xl mx-auto px-16">
            <div className="grid grid-cols-2 gap-16 items-center w-full">
              
              {/* LEFT: Poster */}
              <div className="relative flex items-center justify-center">
                <div 
                  className="relative"
                  style={{ width: '420px', height: '600px' }}
                >
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={currentMovie.id}
                      custom={direction}
                      initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="absolute inset-0 cursor-pointer group"
                      onClick={() => onMovieSelect(currentMovie)}
                    >
                      <div
                        className="relative w-full h-full overflow-hidden"
                        style={{
                          borderRadius: '24px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          boxShadow: `0 50px 100px rgba(0,0,0,0.8), 0 0 60px rgba(${dominantColor}, 0.3)`,
                        }}
                      >
                        <img
                          src={currentMovie.posterUrl}
                          alt={currentMovie.title}
                          className="w-full h-full object-cover"
                        />

                        {/* Hover overlay */}
                        <div
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                        >
                          <div
                            className="w-20 h-20 rounded-full flex items-center justify-center"
                            style={{
                              background: 'rgba(255,255,255,0.2)',
                              backdropFilter: 'blur(10px)',
                            }}
                          >
                            <Play className="w-8 h-8 text-white ml-1" fill="white" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* RIGHT: Info */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`info-${currentMovie.id}`}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  {/* Badges */}
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center gap-2 px-4 py-2 rounded-full"
                      style={{
                        background: 'rgba(255,200,0,0.15)',
                        border: '1px solid rgba(255,200,0,0.3)',
                      }}
                    >
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-yellow-400 font-semibold">{currentMovie.rating.toFixed(1)}</span>
                    </div>

                    <div
                      className="px-4 py-2 rounded-full text-white/80"
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.15)',
                      }}
                    >
                      {currentMovie.year}
                    </div>

                    {currentMovie.genre && (
                      <div
                        className="px-4 py-2 rounded-full text-white/80"
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.15)',
                        }}
                      >
                        {currentMovie.genre.split(',')[0].trim()}
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="text-6xl font-bold text-white leading-tight">
                    {currentMovie.title}
                  </h1>

                  {/* Overview */}
                  {currentMovie.overview && (
                    <p className="text-lg text-white/70 leading-relaxed max-w-xl line-clamp-3">
                      {currentMovie.overview}
                    </p>
                  )}

                  {/* CTA */}
                  <motion.button
                    onClick={() => onMovieSelect(currentMovie)}
                    className="flex items-center gap-2 px-10 py-4 rounded-full text-white font-semibold"
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Play className="w-5 h-5" fill="white" />
                    Watch Now
                  </motion.button>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <button
              onClick={goToPrevious}
              className="absolute left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white z-30"
              style={{
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white z-30"
              style={{
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Dots */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-30">
            {movies.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className="h-1 rounded-full transition-all"
                style={{
                  width: index === currentIndex ? '40px' : '8px',
                  background: index === currentIndex ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* MOBILE/TABLET */}
      {!isDesktop && (
        <div
          className="relative w-full overflow-hidden bg-black"
          style={{ height: '75vh', minHeight: '600px' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`mobile-bg-${currentMovie.id}`}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              style={{
                background: `radial-gradient(circle at top, rgba(${dominantColor}, 0.15), rgba(0,0,0,0.95) 60%)`,
              }}
            />
          </AnimatePresence>

          <div className="relative h-full flex flex-col items-center justify-center px-6 py-20">
            <div 
              className="relative mb-8"
              style={{ width: '320px', height: '480px' }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`mobile-${currentMovie.id}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0"
                >
                  <div
                    className="relative w-full h-full overflow-hidden"
                    style={{
                      borderRadius: '20px',
                      border: '1px solid rgba(255,255,255,0.15)',
                      boxShadow: `0 40px 80px rgba(0,0,0,0.7), 0 0 40px rgba(${dominantColor}, 0.25)`,
                    }}
                  >
                    <img
                      src={currentMovie.posterUrl}
                      alt={currentMovie.title}
                      className="w-full h-full object-cover"
                    />

                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(to top, rgba(0,0,0,0.95), transparent 40%)',
                      }}
                    />

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <div
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                        style={{
                          background: 'rgba(255,200,0,0.2)',
                          border: '1px solid rgba(255,200,0,0.4)',
                        }}
                      >
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-yellow-400 text-xs font-bold">{currentMovie.rating.toFixed(1)}</span>
                      </div>
                      <div
                        className="px-3 py-1.5 rounded-full text-white text-xs"
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.15)',
                        }}
                      >
                        {currentMovie.year}
                      </div>
                    </div>

                    {/* Title & Button */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
                      <h2 className="text-3xl font-bold text-white leading-tight">
                        {currentMovie.title}
                      </h2>

                      <button
                        onClick={() => onMovieSelect(currentMovie)}
                        className="w-full py-4 rounded-2xl text-base font-semibold bg-white text-black"
                      >
                        Watch Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Dots */}
            <div className="flex gap-2.5">
              {movies.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className="h-1 rounded-full transition-all"
                  style={{
                    width: index === currentIndex ? '32px' : '6px',
                    background: index === currentIndex ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
