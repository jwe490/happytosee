import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Info, Play } from "lucide-react";
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
  autoPlayInterval = 4500,
}: CinematicCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [dominantColor, setDominantColor] = useState("220, 38, 38");
  const [direction, setDirection] = useState(0);

  const dragX = useMotionValue(0);
  const isMobile = useMediaQuery("(max-width: 767px)");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const currentMovie = movies[currentIndex];
  const nextMovie = movies[(currentIndex + 1) % movies.length];
  const prevMovie = movies[(currentIndex - 1 + movies.length) % movies.length];

  useEffect(() => {
    if (currentMovie?.posterUrl) {
      extractDominantColor(currentMovie.posterUrl)
        .then(setDominantColor)
        .catch(() => setDominantColor("220, 38, 38"));
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

  useEffect(() => {
    if (!isAutoPlaying || movies.length <= 1) return;
    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isAutoPlaying, goToNext, autoPlayInterval, movies.length]);

  const handleInteraction = () => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      goToPrevious();
      handleInteraction();
    } else if (info.offset.x < -100) {
      goToNext();
      handleInteraction();
    }
    dragX.set(0);
  };

  if (!currentMovie || movies.length === 0) return null;

  return (
    <section className="relative w-full">
      {/* DESKTOP: Full Width Hero with Side Cards */}
      {isDesktop ? (
        <div className="relative w-full h-[calc(100vh-80px)] min-h-[600px] max-h-[900px] overflow-hidden bg-black">
          {/* Cinematic Background */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`bg-${currentMovie.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <img
                src={currentMovie.backdropUrl || currentMovie.posterUrl}
                alt=""
                className="w-full h-full object-cover"
                style={{ filter: 'brightness(0.3) blur(40px)' }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(90deg, rgba(0,0,0,0.95) 0%, rgba(${dominantColor},0.1) 50%, rgba(0,0,0,0.95) 100%)`,
                }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Main Content Container */}
          <div className="relative h-full flex items-center justify-center px-8">
            {/* Left Preview Card */}
            <motion.div
              onClick={() => {
                goToPrevious();
                handleInteraction();
              }}
              className="absolute left-8 w-48 h-72 cursor-pointer z-10"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 0.4, x: 0 }}
              whileHover={{ opacity: 0.7, scale: 1.05, x: 10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl">
                <img
                  src={prevMovie.posterUrl}
                  alt={prevMovie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" />
              </div>
            </motion.div>

            {/* Center Active Card */}
            <div className="relative w-[420px] h-[600px] z-20">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentMovie.id}
                  custom={direction}
                  initial={{
                    opacity: 0,
                    x: direction > 0 ? 300 : -300,
                    rotateY: direction > 0 ? 30 : -30,
                    scale: 0.8,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    rotateY: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    x: direction > 0 ? -300 : 300,
                    rotateY: direction > 0 ? -30 : 30,
                    scale: 0.8,
                  }}
                  transition={{
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="absolute inset-0"
                  style={{ transformStyle: 'preserve-3d', perspective: '1500px' }}
                >
                  <div
                    className="relative w-full h-full rounded-2xl overflow-hidden group cursor-pointer"
                    style={{
                      boxShadow: `0 50px 100px rgba(0,0,0,0.9), 0 0 100px rgba(${dominantColor},0.4)`,
                    }}
                    onClick={() => onMovieSelect(currentMovie)}
                  >
                    {/* Poster */}
                    <motion.img
                      src={currentMovie.posterUrl}
                      alt={currentMovie.title}
                      className="w-full h-full object-cover"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* Gradient Overlay */}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"
                    />

                    {/* Top Info */}
                    <div className="absolute top-6 left-6 right-6 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-xl"
                          style={{
                            background: 'rgba(255,215,0,0.2)',
                            border: '1px solid rgba(255,215,0,0.3)',
                          }}
                        >
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          <span className="text-yellow-400 text-sm font-bold">{currentMovie.rating.toFixed(1)}</span>
                        </div>
                        <div
                          className="px-3 py-1.5 rounded-full text-white/90 text-sm font-medium backdrop-blur-xl"
                          style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.15)',
                          }}
                        >
                          {currentMovie.year}
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-full backdrop-blur-xl"
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.15)',
                        }}
                      >
                        <Info className="w-4 h-4 text-white" />
                      </motion.button>
                    </div>

                    {/* Bottom Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl font-bold text-white mb-3 leading-tight"
                        style={{ textShadow: '0 4px 20px rgba(0,0,0,0.9)' }}
                      >
                        {currentMovie.title}
                      </motion.h2>

                      {currentMovie.genre && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="text-white/70 text-sm mb-4"
                        >
                          {currentMovie.genre.split(',')[0].trim()}
                        </motion.p>
                      )}

                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 backdrop-blur-xl"
                        style={{
                          background: 'rgba(255,255,255,0.95)',
                          color: '#000',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        }}
                      >
                        <Play className="w-4 h-4" fill="currentColor" />
                        Watch Now
                      </motion.button>
                    </div>

                    {/* Hover Shine Effect */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                      style={{
                        background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                      }}
                      initial={false}
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Preview Card */}
            <motion.div
              onClick={() => {
                goToNext();
                handleInteraction();
              }}
              className="absolute right-8 w-48 h-72 cursor-pointer z-10"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 0.4, x: 0 }}
              whileHover={{ opacity: 0.7, scale: 1.05, x: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl">
                <img
                  src={nextMovie.posterUrl}
                  alt={nextMovie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" />
              </div>
            </motion.div>

            {/* Navigation Arrows */}
            <motion.button
              onClick={() => {
                goToPrevious();
                handleInteraction();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white/80 backdrop-blur-xl z-30"
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              whileHover={{ scale: 1.1, background: 'rgba(0,0,0,0.5)' }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>

            <motion.button
              onClick={() => {
                goToNext();
                handleInteraction();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white/80 backdrop-blur-xl z-30"
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              whileHover={{ scale: 1.1, background: 'rgba(0,0,0,0.5)' }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Progress Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-30">
            {movies.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  goToSlide(index);
                  handleInteraction();
                }}
                className="relative overflow-hidden rounded-full"
                whileHover={{ scale: 1.2 }}
                style={{
                  width: index === currentIndex ? '32px' : '8px',
                  height: '3px',
                  background: index === currentIndex ? `rgba(${dominantColor},0.5)` : 'rgba(255,255,255,0.3)',
                  transition: 'all 0.3s ease',
                }}
              >
                {index === currentIndex && isAutoPlaying && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ background: `rgb(${dominantColor})` }}
                    initial={{ scaleX: 0, transformOrigin: 'left' }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: autoPlayInterval / 1000, ease: 'linear' }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        /* MOBILE: Compact Full-Screen Experience */
        <div className="relative w-full h-[calc(100vh-60px)] min-h-[600px] bg-black overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={`mobile-bg-${currentMovie.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at center, rgba(${dominantColor},0.2), rgba(0,0,0,0.98))`,
              }}
            />
          </AnimatePresence>

          <div className="relative h-full flex items-center justify-center px-4 py-4">
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="relative w-full max-w-sm"
              style={{ height: 'calc(100% - 80px)' }}
            >
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={`mobile-${currentMovie.id}`}
                  custom={direction}
                  initial={{ opacity: 0, scale: 0.85, rotateY: direction > 0 ? 20 : -20 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.85, rotateY: direction > 0 ? -20 : 20 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div
                    className="relative w-full h-full rounded-3xl overflow-hidden"
                    style={{
                      boxShadow: `0 40px 80px rgba(0,0,0,0.8), 0 0 60px rgba(${dominantColor},0.3)`,
                    }}
                    onClick={() => onMovieSelect(currentMovie)}
                  >
                    <img
                      src={currentMovie.posterUrl}
                      alt={currentMovie.title}
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                      <div className="flex gap-2">
                        <div
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full backdrop-blur-xl"
                          style={{
                            background: 'rgba(255,215,0,0.2)',
                            border: '1px solid rgba(255,215,0,0.3)',
                          }}
                        >
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-yellow-400 text-xs font-bold">{currentMovie.rating.toFixed(1)}</span>
                        </div>
                        <div
                          className="px-2.5 py-1.5 rounded-full text-white text-xs backdrop-blur-xl"
                          style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.15)',
                          }}
                        >
                          {currentMovie.year}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
                        {currentMovie.title}
                      </h2>
                      {currentMovie.genre && (
                        <p className="text-white/60 text-xs mb-4">
                          {currentMovie.genre.split(',')[0].trim()}
                        </p>
                      )}
                      <button
                        className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 backdrop-blur-xl"
                        style={{
                          background: 'rgba(255,255,255,0.95)',
                          color: '#000',
                        }}
                      >
                        <Play className="w-4 h-4" fill="currentColor" />
                        Watch Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
            {movies.map((_, index) => (
              <button
                key={index}
      
