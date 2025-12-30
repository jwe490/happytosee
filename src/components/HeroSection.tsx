import { useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowDown, Sparkles } from "lucide-react";

// Pool of movie images
const movieImagePool = [
  "https://image.tmdb.org/t/p/w300/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
  "https://image.tmdb.org/t/p/w300/pIkRyD18kl4FhoCNQuWxWu5cBLM.jpg",
  "https://image.tmdb.org/t/p/w300/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
  "https://image.tmdb.org/t/p/w300/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
];

// Desktop positions - bigger, cleaner
const desktopPositions = [
  { position: "top-20 left-[5%]", size: "w-44 h-64", rotation: "-rotate-6" },
  { position: "top-28 right-[6%]", size: "w-40 h-60", rotation: "rotate-6" },
  { position: "bottom-36 left-[10%]", size: "w-36 h-52", rotation: "rotate-3" },
  { position: "bottom-28 right-[8%]", size: "w-40 h-60", rotation: "-rotate-3" },
];

// Mobile positions - slightly bigger
const mobilePositions = [
  { position: "top-8 left-2", size: "w-16 h-24", rotation: "-rotate-12" },
  { position: "top-12 right-2", size: "w-14 h-20", rotation: "rotate-12" },
  { position: "bottom-32 left-3", size: "w-14 h-20", rotation: "rotate-6" },
  { position: "bottom-28 right-2", size: "w-16 h-24", rotation: "-rotate-6" },
];

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const HeroSection = () => {
  const floatingImages = useMemo(() => {
    const shuffledImages = shuffleArray(movieImagePool);
    return shuffledImages.map((url, index) => ({
      id: index + 1,
      url,
      desktop: desktopPositions[index],
      mobile: mobilePositions[index],
    }));
  }, []);

  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] flex flex-col items-center justify-center overflow-hidden px-4 pt-8 pb-12">
      {/* Clean Background - No green */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/20" />

      {/* Floating Movie Posters - Mobile */}
      {floatingImages.map((img, index) => (
        <motion.div
          key={`mobile-${img.id}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 0.4, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
          className={`absolute ${img.mobile.position} lg:hidden z-0`}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5 + index, repeat: Infinity, ease: "easeInOut" }}
            className={`${img.mobile.size} ${img.mobile.rotation} rounded-xl overflow-hidden shadow-md border border-white/5`}
          >
            <img 
              src={img.url} 
              alt="Movie poster"
              className="w-full h-full object-cover opacity-60"
              loading="lazy"
            />
          </motion.div>
        </motion.div>
      ))}

      {/* Floating Movie Posters - Desktop */}
      {floatingImages.map((img, index) => (
        <motion.div
          key={`desktop-${img.id}`}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 0.5, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
          className={`absolute ${img.desktop.position} hidden lg:block z-0`}
        >
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 6 + index, repeat: Infinity, ease: "easeInOut" }}
            className={`${img.desktop.size} ${img.desktop.rotation} rounded-2xl overflow-hidden shadow-lg border border-white/10`}
          >
            <img 
              src={img.url} 
              alt="Movie poster"
              className="w-full h-full object-cover opacity-70"
              loading="lazy"
            />
          </motion.div>
        </motion.div>
      ))}

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/30 mb-6 md:mb-8"
        >
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-muted-foreground">AI-Powered Discovery</span>
        </motion.div>

        {/* Main Title - Clean */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-[3.5rem] sm:text-[5rem] md:text-[7rem] lg:text-[9rem] xl:text-[11rem] font-bold text-foreground leading-[0.85] tracking-tight"
        >
          <span className="inline-block">Mood</span>
          <span className="block text-foreground/80">Flix</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-muted-foreground max-w-md mx-auto"
        >
          Find the perfect movie for
          <span className="block mt-1 text-foreground font-medium">how you're feeling right now.</span>
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 sm:mt-10"
        >
          <motion.div whileTap={{ scale: 0.97 }}>
            <Button 
              size="xl"
              onClick={() => {
                document.getElementById('mood-selector')?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                });
              }}
              className="rounded-full px-8 sm:px-10 py-6 sm:py-7 text-base sm:text-lg font-display font-semibold gap-3"
            >
              <span className="text-xl">🎬</span>
              Get Started
              <ArrowDown className="w-5 h-5" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 sm:mt-12 flex items-center justify-center gap-6 sm:gap-10 text-muted-foreground"
        >
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-display font-bold text-foreground">500k+</div>
            <div className="text-xs sm:text-sm">Movies</div>
          </div>
          <div className="w-px h-8 bg-border/50" />
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-display font-bold text-foreground">7</div>
            <div className="text-xs sm:text-sm">Moods</div>
          </div>
          <div className="w-px h-8 bg-border/50" />
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
        transition={{ delay: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-border/50 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-foreground/50"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
