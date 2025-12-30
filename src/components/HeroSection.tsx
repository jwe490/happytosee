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

const imagePositions = [
  { position: "top-20 left-[5%]", size: "w-32 md:w-44 h-20 md:h-28", rotation: "-rotate-3" },
  { position: "top-32 right-[8%]", size: "w-28 md:w-40 h-18 md:h-24", rotation: "rotate-2" },
  { position: "bottom-40 left-[12%]", size: "w-36 md:w-48 h-22 md:h-30", rotation: "rotate-1" },
  { position: "bottom-28 right-[10%]", size: "w-30 md:w-42 h-20 md:h-26", rotation: "-rotate-2" },
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
      ...imagePositions[index],
      animation: animationClasses[index],
    }));
  }, []);

  return (
    <section className="relative min-h-[45vh] sm:min-h-[55vh] md:min-h-[80vh] flex flex-col items-center justify-center overflow-hidden grid-pattern px-4 pt-4 pb-8 sm:pb-12 md:pb-8">
      {/* Floating Movie Images - Hidden on mobile and tablet */}
      {floatingImages.map((img, index) => (
        <motion.div
          key={img.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 + index * 0.15 }}
          className={`absolute ${img.position} ${img.animation} hidden lg:block`}
        >
          <div 
            className={`${img.size} ${img.rotation} rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300`}
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