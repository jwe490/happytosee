import { useMemo, useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowDown, Sparkles } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Pool of movie images to randomly select from
const movieImagePool = [
  "https://image.tmdb.org/t/p/w300/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
  "https://image.tmdb.org/t/p/w300/pIkRyD18kl4FhoCNQuWxWu5cBLM.jpg",
  "https://image.tmdb.org/t/p/w300/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
  "https://image.tmdb.org/t/p/w300/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
  "https://image.tmdb.org/t/p/w300/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
  "https://image.tmdb.org/t/p/w300/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
  "https://image.tmdb.org/t/p/w300/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
  "https://image.tmdb.org/t/p/w300/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
];

// Desktop positions - more dynamic arrangement
const desktopPositions = [
  { position: "top-16 left-[8%]", size: "w-36 h-52", rotation: "-rotate-6" },
  { position: "top-24 right-[10%]", size: "w-32 h-48", rotation: "rotate-6" },
  { position: "bottom-32 left-[15%]", size: "w-28 h-40", rotation: "rotate-3" },
  { position: "bottom-24 right-[12%]", size: "w-32 h-48", rotation: "-rotate-3" },
];

// Mobile positions - corners, smaller sizes
const mobilePositions = [
  { position: "top-4 left-2", size: "w-14 h-20", rotation: "-rotate-12" },
  { position: "top-6 right-2", size: "w-12 h-18", rotation: "rotate-12" },
  { position: "bottom-28 left-3", size: "w-12 h-18", rotation: "rotate-6" },
  { position: "bottom-24 right-2", size: "w-14 h-20", rotation: "-rotate-6" },
];

// Fisher-Yates shuffle
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const HeroSection = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.1 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Randomize images on each page load/refresh
  const floatingImages = useMemo(() => {
    const shuffledImages = shuffleArray(movieImagePool).slice(0, 4);
    return shuffledImages.map((url, index) => ({
      id: index + 1,
      url,
      desktop: desktopPositions[index],
      mobile: mobilePositions[index],
    }));
  }, []);

  // Get the correct positions based on screen size
  const positions = isMobile ? mobilePositions : desktopPositions;

  // Only animate when in view and not reduced motion
  const shouldAnimate = isInView && !prefersReducedMotion;

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-[85vh] sm:min-h-[90vh] flex flex-col items-center justify-center overflow-hidden px-4 pt-8 pb-12"
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/30 to-background" />
      
      {/* Animated Glow Orbs - only animate when in view */}
      {shouldAnimate ? (
        <>
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/20 blur-3xl will-change-transform"
          />
          <motion.div
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-primary/10 blur-3xl will-change-transform"
          />
        </>
      ) : (
        <>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/20 blur-3xl opacity-40" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-primary/10 blur-3xl opacity-30" />
        </>
      )}

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 grid-pattern opacity-50" />

      {/* Floating Movie Posters - render only mobile OR desktop, not both */}
      {floatingImages.map((img, index) => {
        const pos = isMobile ? img.mobile : img.desktop;
        return (
          <motion.div
            key={img.id}
            initial={{ opacity: 0, scale: 0.5, y: isMobile ? 50 : 100 }}
            animate={{ opacity: isMobile ? 0.7 : 1, scale: 1, y: 0 }}
            transition={{ 
              duration: isMobile ? 0.8 : 1, 
              delay: 0.3 + index * 0.15,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className={`absolute ${pos.position} z-0`}
          >
            <motion.div
              animate={shouldAnimate ? { 
                y: [0, isMobile ? -10 : -20, 0], 
                rotate: isMobile ? undefined : [0, 2, -2, 0] 
              } : undefined}
              transition={{ 
                duration: 6 + index, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              whileHover={!isMobile ? { scale: 1.05, rotate: 0 } : undefined}
              className={`
                ${pos.size} ${pos.rotation} rounded-xl overflow-hidden shadow-card 
                bg-card/30 border border-white/10
                ${!isMobile ? 'cursor-pointer backdrop-blur-[2px]' : ''}
                transform-gpu will-change-transform
              `}
            >
              <img 
                src={img.url} 
                alt="Movie poster"
                className={`w-full h-full object-cover ${isMobile ? 'opacity-80' : ''}`}
                loading="lazy"
              />
              {/* Shine effect - desktop only */}
              {!isMobile && (
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
              )}
            </motion.div>
          </motion.div>
        );
      })}

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6 md:mb-8"
        >
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-accent">AI-Powered Movie Discovery</span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display text-[3.5rem] sm:text-[5rem] md:text-[7rem] lg:text-[9rem] xl:text-[11rem] font-bold text-foreground leading-[0.85] tracking-tight"
        >
          <motion.span 
            className="inline-block"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Mood
          </motion.span>
          <motion.span 
            className="block bg-gradient-to-r from-foreground via-accent to-foreground bg-clip-text text-transparent bg-[length:200%_100%]"
            animate={shouldAnimate ? { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] } : undefined}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            whileHover={{ scale: 1.02 }}
          >
            Flix
          </motion.span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-xs sm:max-w-md md:max-w-lg mx-auto font-medium"
        >
          Find the perfect movie for
          <span className="block mt-1 text-foreground font-semibold">how you're feeling right now.</span>
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-8 sm:mt-10 md:mt-12 flex flex-col sm:flex-row gap-4 items-center justify-center"
        >
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button
              size="xl"
              onClick={() => {
                document.getElementById('mood-selector')?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
                });
              }}
              className="relative rounded-full px-8 sm:px-10 py-6 sm:py-7 text-base sm:text-lg font-display font-semibold tracking-wide gap-3 overflow-hidden group"
            >
              {/* Animated gradient background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/80 to-foreground"
                animate={shouldAnimate ? { backgroundPosition: ["0% 50%", "100% 50%"] } : undefined}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <span className="relative flex items-center gap-3 text-background">
                <span className="text-xl">🎬</span>
                Get Started Now
                <motion.span
                  animate={shouldAnimate ? { y: [0, 3, 0] } : undefined}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowDown className="w-5 h-5" />
                </motion.span>
              </span>
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button
              size="xl"
              variant="outline"
              onClick={() => navigate('/assessment')}
              className="rounded-full px-8 sm:px-10 py-6 sm:py-7 text-base sm:text-lg font-display font-semibold tracking-wide gap-3 border-2"
            >
              <Sparkles className="w-5 h-5" />
              Discover Movie Mood
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-10 sm:mt-12 flex items-center justify-center gap-6 sm:gap-10 text-muted-foreground"
        >
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-display font-bold text-foreground">500k+</div>
            <div className="text-xs sm:text-sm">Movies</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-display font-bold text-foreground">7</div>
            <div className="text-xs sm:text-sm">Moods</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-display font-bold text-foreground">∞</div>
            <div className="text-xs sm:text-sm">Possibilities</div>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={shouldAnimate ? { y: [0, 8, 0] } : undefined}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-muted-foreground"
        >
          <span className="text-xs font-medium hidden sm:block">Scroll to explore</span>
          <div className="w-6 h-10 rounded-full border-2 border-border flex items-start justify-center p-2">
            <motion.div
              animate={shouldAnimate ? { y: [0, 12, 0] } : undefined}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-foreground"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
