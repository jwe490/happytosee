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

  useEffect(() => {
    if (currentMovie?.posterUrl) {
      extractDominantColor(currentMovie.posterUrl).then((color) => {
        setDominantColor(color);
      });
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
    if (!isAutoPlaying || movies.length <= 1 || isHovered) return;

    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isAutoPlaying, goToNext, autoPlayInterval, movies.length, isHovered]);

  const handleInteraction = () => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 12000);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
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

  // Responsive card dimensions
  const getCardDimensions = () => {
    if (isMobile) return { width: 300, height: 450, aspectRatio: '2/3' };
    if (isTablet) return { width: 340, height: 510, aspectRatio: '2/3' };
    return { width: 420, height: 600, aspectRatio: '2/3' }; // Desktop portrait
  };

  const cardDims = getCardDimensions();

  return (
    <section className="relative w-full">
      {/* Desktop Landscape Layout */}
      {isDesktop ? (
        <div 
          className="relative w-full overflow-hidden"
          style={{ height: '85vh', minHeight: '600px', maxHeight: '800px' }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Animated Background */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`bg-${currentMovie.id}`}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {/* Backdrop Image with Heavy Blur */}
              <div className="absolute inset-0">
                <img
                  src={currentMovie.backdropUrl || currentMovie.posterUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ filter: 'blur(60px) brightness(0.4)' }}
                />
              </div>

              {/* Color Overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(ellipse at center, rgba(${dominantColor}, 0.2) 0%, rgba(0,0,0,0.85) 70%, #000000 100%)`,
                }}
              />

              {/* Vignette */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)',
                }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Content Grid - Landscape */}
          <div className="relative h-full flex items-center max-w-[1600px] mx-auto px-16">
            <div className="grid grid-cols-2 gap-16 items-center w-full">
              {/* Left: Poster Carousel */}
              <div className="relative flex items-center justify-center">
                <motion.div
                  className="relative"
                  style={{
                    width: '420px',
                    height: '600px',
                    x: dragXSpring,
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={handleDragEnd}
                >
                  <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.div
                      key={currentMovie.id}
                      custom={direction}
                      initial={{ 
                        opacity: 0, 
                        x: direction > 0 ? 100 : -100,
                        scale: 0.9,
                        rotateY: direction > 0 ? 15 : -15
                      }}
                      animate={{ 
                        opacity: 1, 
                        x: 0, 
                        scale: 1,
                        rotateY: 0
                      }}
                      exit={{ 
                        opacity: 0, 
                        x: direction > 0 ? -100 : 100,
                        scale: 0.9,
                        rotateY: direction > 0 ? -15 : 15
                      }}
                      transition={{
                        duration: 0.6,
                        ease: [0.25, 0.1, 0.25, 1],
                      }}
                      className="absolute inset-0"
                      style={{
                        transformStyle: 'preserve-3d',
                        perspective: '1000px',
                      }}
                    >
                      {/* Card with Glassmorphism */}
                      <div
                        className="relative w-full h-full overflow-hidden group cursor-pointer"
                        style={{
                          borderRadius: '24px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                          backdropFilter: 'blur(20px) saturate(120%)',
                          boxShadow: `0 50px 100px -20px rgba(0,0,0,0.8), 0 0 80px rgba(${dominantColor}, 0.3)`,
                        }}
                        onClick={() => onMovieSelect(currentMovie)}
                      >
                        {/* Poster */}
                        <motion.div
                          className="w-full h-full"
                          animate={!prefersReducedMotion ? { scale: [1, 1.03] } : {}}
                          transition={{
                            duration: 20,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatType: "reverse",
                          }}
                        >
                          <img
                            src={currentMovie.posterUrl}
                            alt={currentMovie.title}
                            className="w-full h-full object-cover"
                          />
                        </motion.div>

                        {/* Gradient Overlay */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{
                            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 50%)',
                          }}
                        />

                        {/* Hover Play Button */}
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100"
                          initial={false}
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div
                            className="w-20 h-20 rounded-full flex items-center justify-center"
                            style={{
                              background: 'rgba(255,255,255,0.15)',
                              backdropFilter: 'blur(20px)',
                              border: '2px solid rgba(255,255,255,0.3)',
                            }}
                          >
                            <Play className="w-8 h-8 text-white ml-1" fill="white" />
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Right: Movie Info */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`info-${currentMovie.id}`}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="space-y-8"
                >
                  {/* Badges */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                      style={{
                        background: 'rgba(255,200,0,0.15)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,200,0,0.3)',
                        color: '#FFC800',
                      }}
                    >
                      <Star className="w-4 h-4 fill-current" />
                      {currentMovie.rating.toFixed(1)}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                      className="px-4 py-2 rounded-full text-sm font-medium text-white/80"
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      {currentMovie.year}
                    </motion.div>

                    {currentMovie.genre && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="px-4 py-2 rounded-full text-sm font-medium text-white/80"
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        {currentMovie.genre.split(',')[0].trim()}
                      </motion.div>
                    )}
                  </div>

                  {/* Title */}
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-6xl font-bold text-white leading-tight"
                    style={{
                      letterSpacing: '-0.02em',
                      textShadow: '0 4px 30px rgba(0,0,0,0.8)',
                    }}
                  >
                    {currentMovie.title}
                  </motion.h1>

                  {/* Overview */}
                  {currentMovie.overview && (
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-lg text-white/70 leading-relaxed max-w-xl line-clamp-3"
                    >
                      {currentMovie.overview}
                    </motion.p>
                  )}

                  {/* CTA Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    onClick={() => onMovieSelect(currentMovie)}
                    className="group relative px-10 py-4 rounded-full text-base font-semibold overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: 'white',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                    }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Play className="w-5 h-5" fill="white" />
                      Watch Now
                    </span>
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(135deg, rgba(${dominantColor}, 0.3), rgba(${dominantColor}, 0.1))`,
                      }}
                      initial={{ x: '-100%' }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.button>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Arrows - Minimal */}
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
                handleInteraction();
              }}
              className="absolute left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors z-30"
              style={{
                background: 'rgba(0,0,0,0.3)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              whileHover={{ scale: 1.1, background: 'rgba(0,0,0,0.5)' }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0.5 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>

            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
                handleInteraction();
              }}
              className="absolute right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors z-30"
              style={{
                background: 'rgba(0,0,0,0.3)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              whileHover={{ scale: 1.1, background: 'rgba(0,0,0,0.5)' }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0.5 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Progress Dots - Bottom Center */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30"
          >
            {movies.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  goToSlide(index);
                  handleInteraction();
                }}
                className="relative"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                {/* Background track */}
                <div
                  className="h-1 rounded-full"
                  style={{
                    width: index === currentIndex ? '40px' : '8px',
                    background: 'rgba(255,255,255,0.2)',
                    transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
                  }}
                />
                {/* Active progress */}
                {index === currentIndex && (
                  <motion.div
                    className="absolute top-0 left-0 h-1 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, rgba(${dominantColor}, 0.8), rgba(255,255,255,0.9))`,
                      boxShadow: `0 0 10px rgba(${dominantColor}, 0.5)`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: '40px' }}
                    transition={{
                      duration: autoPlayInterval / 1000,
                      ease: 'linear',
                    }}
                  />
                )}
              </motion.button>
            ))}
          </motion.div>
        </div>
      ) : (
        /* Mobile/Tablet Portrait Layout */
        <div
          className="relative w-full overflow-hidden"
          style={{ height: isMobile ? '75vh' : '80vh', minHeight: '600px' }}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setTimeout(() => setIsHovered(false), 3000)}
        >
          {/* Background */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`mobile-bg-${currentMovie.id}`}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              style={{
                background: `radial-gradient(ellipse at center top, rgba(${dominantColor}, 0.15) 0%, rgba(0,0,0,0.95) 60%)`,
              }}
            />
          </AnimatePresence>
        
