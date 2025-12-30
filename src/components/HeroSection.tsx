import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

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

// Desktop positions
const desktopPositions = [
  { position: "top-20 left-[5%]", size: "w-44 h-28", rotation: "-rotate-3" },
  { position: "top-32 right-[8%]", size: "w-40 h-24", rotation: "rotate-2" },
  { position: "bottom-40 left-[12%]", size: "w-48 h-30", rotation: "rotate-1" },
  { position: "bottom-28 right-[10%]", size: "w-42 h-26", rotation: "-rotate-2" },
];

// Mobile positions - corners, smaller sizes
const mobilePositions = [
  { position: "top-4 left-2", size: "w-16 h-10", rotation: "-rotate-6" },
  { position: "top-8 right-2", size: "w-14 h-9", rotation: "rotate-6" },
  { position: "bottom-32 left-3", size: "w-16 h-10", rotation: "rotate-3" },
  { position: "bottom-28 right-2", size: "w-14 h-9", rotation: "-rotate-3" },
];

const animationClasses = ["animate-float", "animate-float-delayed", "animate-float-slow", "animate-float"];

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
      animation: animationClasses[index],
    }));
  }, []);

  return (
    <section className="relative min-h-[50vh] sm:min-h-[55vh] md:min-h-[80vh] flex flex-col items-center justify-center overflow-hidden grid-pattern px-4 pt-4 pb-8 sm:pb-12 md:pb-8">
      {/* Floating Movie Images - Mobile Version */}
      {floatingImages.map((img, index) => (
        <motion.div
          key={`mobile-${img.id}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 + index * 0.15 }}
          className={`absolute ${img.mobile.position} ${img.animation} lg:hidden z-0`}
        >
          <div 
            className={`${img.mobile.size} ${img.mobile.rotation} rounded-lg overflow-hidden shadow-md opacity-50`}
          >
            <img 
              src={img.url} 
              alt="Movie scene"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </motion.div>
      ))}

      {/* Floating Movie Images - Desktop Version */}
      {floatingImages.map((img, index) => (
        <motion.div
          key={`desktop-${img.id}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 + index * 0.15 }}
          className={`absolute ${img.desktop.position} ${img.animation} hidden lg:block`}
        >
          <div 
            className={`${img.desktop.size} ${img.desktop.rotation} rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300`}
          >
            <img 
              src={img.url} 
              alt="Movie scene"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </motion.div>
      ))}

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display text-[2.75rem] sm:text-[4rem] md:text-[6rem] lg:text-[8rem] xl:text-[10rem] font-bold text-foreground leading-[0.85] tracking-tight"
        >
          Mood
          <span className="block">Flix</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-4 sm:mt-6 md:mt-8 text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-xs sm:max-w-md md:max-w-lg mx-auto font-medium italic"
        >
          The Creative Sidekick<br />
          Made for Movie Lovers.<br />
          Built for Storytellers.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-6 sm:mt-8 md:mt-10"
        >
          <Button 
            size="lg"
            onClick={() => {
              document.getElementById('mood-selector')?.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
              });
            }}
            className="rounded-full px-6 sm:px-8 md:px-8 py-5 sm:py-6 md:py-6 text-sm sm:text-sm md:text-base font-display font-semibold tracking-wide bg-foreground text-background hover:bg-foreground/90 gap-2 md:gap-3"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-sm sm:text-base md:text-lg">🎬</span>
            </div>
            Get Started Now
          </Button>
        </motion.div>
      </div>

      {/* Bottom Search Bar Hint - Hidden on mobile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2 md:gap-4"
      >
        <div className="px-4 md:px-6 py-2 md:py-3 rounded-full bg-secondary text-muted-foreground text-xs md:text-sm font-medium">
          Discover by mood
        </div>
        <div className="px-4 md:px-6 py-2 md:py-3 rounded-full border border-border bg-background text-foreground text-xs md:text-sm font-medium">
          Search
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;