import { useMemo, useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowDown, Sparkles } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Pool of movie images - refreshes on each page load
const movieImagePool = [
  "https://image.tmdb.org/t/p/w300/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
  "https://image.tmdb.org/t/p/w300/pIkRyD18kl4FhoCNQuWxWu5cBLM.jpg",
  "https://image.tmdb.org/t/p/w300/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
  "https://image.tmdb.org/t/p/w300/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
  "https://image.tmdb.org/t/p/w300/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
  "https://image.tmdb.org/t/p/w300/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
  "https://image.tmdb.org/t/p/w300/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
  "https://image.tmdb.org/t/p/w300/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
  "https://image.tmdb.org/t/p/w300/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
  "https://image.tmdb.org/t/p/w300/6CoRTJTmijhBLJTUNoVSUNxZMEI.jpg",
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
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.1 });
  const [imageKey, setImageKey] = useState(Date.now());

  // Refresh images on mount
  useEffect(() => {
    setImageKey(Date.now());
  }, []);

  // Randomize images using imageKey for true refresh
  const floatingImages = useMemo(() => {
    const shuffled = shuffleArray(movieImagePool).slice(0, 4);
    return shuffled.map((url, i) => ({ id: `${imageKey}-${i}`, url }));
  }, [imageKey]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[70vh] sm:min-h-[75vh] flex flex-col items-center justify-center overflow-hidden px-4 pt-6 pb-12"
    >
      {/* Simple gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      
      {/* Subtle glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-accent/10 blur-[100px] opacity-50" />

      {/* Floating posters - positioned at corners, smaller */}
      {!isMobile && floatingImages.map((img, index) => {
        const positions = [
          "top-20 left-[5%]",
          "top-24 right-[5%]",
          "bottom-20 left-[8%]",
          "bottom-16 right-[8%]",
        ];
        const rotations = ["-rotate-6", "rotate-6", "rotate-3", "-rotate-3"];
        
        return (
          <motion.div
            key={img.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.6, scale: 1 }}
            transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
            className={`absolute ${positions[index]} z-0 hidden lg:block`}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5 + index, repeat: Infinity, ease: "easeInOut" }}
              className={`w-24 h-36 ${rotations[index]} rounded-lg overflow-hidden shadow-lg opacity-70 hover:opacity-100 transition-opacity`}
            >
              <img 
                src={img.url} 
                alt="Movie poster"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </motion.div>
          </motion.div>
        );
      })}

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6"
        >
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-accent">AI-Powered Discovery</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-foreground leading-[0.9] tracking-tight"
        >
          <span className="block">Mood</span>
          <span className="block bg-gradient-to-r from-foreground via-accent to-foreground bg-clip-text text-transparent">
            Flix
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-md mx-auto"
        >
          Find the perfect movie for{" "}
          <span className="text-foreground font-semibold">how you're feeling right now.</span>
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8"
        >
          <Button
            size="lg"
            onClick={() => {
              document.getElementById('mood-selector')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="rounded-full px-8 py-6 text-base font-semibold gap-3"
          >
            <span>🎬</span>
            Discover Now
            <ArrowDown className="w-4 h-4" />
          </Button>
        </motion.div>

        {/* Minimal stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex items-center justify-center gap-8 text-muted-foreground text-sm"
        >
          <div className="text-center">
            <div className="font-display font-bold text-foreground text-xl">500k+</div>
            <div>Movies</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <div className="font-display font-bold text-foreground text-xl">7</div>
            <div>Moods</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <div className="font-display font-bold text-foreground text-xl">∞</div>
            <div>Picks</div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-border flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
