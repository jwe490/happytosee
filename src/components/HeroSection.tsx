import { useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

// Pool of movie images to randomly select from
const movieImagePool = [
  "https://image.tmdb.org/t/p/w300/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
  "https://image.tmdb.org/t/p/w300/pIkRyD18kl4FhoCNQuWxWu5cBLM.jpg",
  "https://image.tmdb.org/t/p/w300/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
  "https://image.tmdb.org/t/p/w300/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
  "https://image.tmdb.org/t/p/w300/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
  "https://image.tmdb.org/t/p/w300/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
];

// Desktop positions - minimal, refined placement
const desktopPositions = [
  { position: "top-32 left-[8%]", size: "w-32 h-48", rotation: "-rotate-6" },
  { position: "top-24 right-[10%]", size: "w-28 h-40", rotation: "rotate-4" },
  { position: "bottom-40 left-[14%]", size: "w-24 h-36", rotation: "rotate-2" },
  { position: "bottom-32 right-[12%]", size: "w-28 h-40", rotation: "-rotate-3" },
];

// Mobile positions - subtle corners
const mobilePositions = [
  { position: "top-16 -left-4", size: "w-16 h-24", rotation: "-rotate-12" },
  { position: "top-20 -right-4", size: "w-14 h-20", rotation: "rotate-12" },
  { position: "bottom-40 -left-2", size: "w-12 h-18", rotation: "rotate-8" },
  { position: "bottom-36 -right-2", size: "w-14 h-20", rotation: "-rotate-8" },
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

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Clean gradient background */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Subtle radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-muted/30 via-transparent to-transparent opacity-60" />

      {/* Floating Movie Posters - Mobile (very subtle) */}
      {floatingImages.map((img, index) => (
        <motion.div
          key={`mobile-${img.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 1.5, delay: 0.5 + index * 0.2 }}
          className={`absolute ${img.mobile.position} lg:hidden z-0 pointer-events-none`}
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 8 + index * 2, repeat: Infinity, ease: "easeInOut" }}
            className={`${img.mobile.size} ${img.mobile.rotation} rounded-lg overflow-hidden`}
          >
            <img 
              src={img.url} 
              alt=""
              className="w-full h-full object-cover grayscale"
              loading="lazy"
            />
          </motion.div>
        </motion.div>
      ))}

      {/* Floating Movie Posters - Desktop (elegant, subtle) */}
      {floatingImages.map((img, index) => (
        <motion.div
          key={`desktop-${img.id}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.25, y: 0 }}
          transition={{ duration: 1.5, delay: 0.3 + index * 0.15 }}
          className={`absolute ${img.desktop.position} hidden lg:block z-0`}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 10 + index * 2, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ opacity: 0.6, scale: 1.02 }}
            className={`${img.desktop.size} ${img.desktop.rotation} rounded-xl overflow-hidden shadow-2xl/10 cursor-pointer transition-all duration-500`}
          >
            <img 
              src={img.url} 
              alt=""
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              loading="lazy"
            />
          </motion.div>
        </motion.div>
      ))}

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Main Title - Clean typography */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="font-display text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-bold text-foreground tracking-tighter leading-none"
        >
          MoodFlix
        </motion.h1>

        {/* Tagline - Simple and elegant */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-6 sm:mt-8 text-lg sm:text-xl md:text-2xl text-muted-foreground font-light tracking-wide"
        >
          Movies that match your mood
        </motion.p>

        {/* CTA Button - Minimal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 sm:mt-16"
        >
          <Button 
            size="lg"
            variant="outline"
            onClick={() => {
              document.getElementById('mood-selector')?.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
              });
            }}
            className="group rounded-full px-8 py-6 text-base font-medium border-foreground/20 hover:bg-foreground hover:text-background transition-all duration-300"
          >
            <span className="flex items-center gap-3">
              Start Exploring
              <motion.span
                animate={{ y: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowDown className="w-4 h-4" />
              </motion.span>
            </span>
          </Button>
        </motion.div>
      </div>

      {/* Scroll Indicator - Minimal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full border border-foreground/20 flex items-start justify-center p-1.5"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-1 rounded-full bg-foreground/40"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
