import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const floatingImages = [
  {
    id: 1,
    url: "https://image.tmdb.org/t/p/w300/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    position: "top-20 left-[5%]",
    size: "w-32 md:w-44 h-20 md:h-28",
    animation: "animate-float",
    rotation: "-rotate-3",
  },
  {
    id: 2,
    url: "https://image.tmdb.org/t/p/w300/pIkRyD18kl4FhoCNQuWxWu5cBLM.jpg",
    position: "top-32 right-[8%]",
    size: "w-28 md:w-40 h-18 md:h-24",
    animation: "animate-float-delayed",
    rotation: "rotate-2",
  },
  {
    id: 3,
    url: "https://image.tmdb.org/t/p/w300/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    position: "bottom-40 left-[12%]",
    size: "w-36 md:w-48 h-22 md:h-30",
    animation: "animate-float-slow",
    rotation: "rotate-1",
  },
  {
    id: 4,
    url: "https://image.tmdb.org/t/p/w300/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    position: "bottom-28 right-[10%]",
    size: "w-30 md:w-42 h-20 md:h-26",
    animation: "animate-float",
    rotation: "-rotate-2",
  },
];

const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden grid-pattern">
      {/* Floating Movie Images */}
      {floatingImages.map((img, index) => (
        <motion.div
          key={img.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 + index * 0.15 }}
          className={`absolute ${img.position} ${img.animation} hidden md:block`}
        >
          <div 
            className={`${img.size} ${img.rotation} rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300`}
          >
            <img 
              src={img.url} 
              alt="Movie scene"
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
      ))}

      {/* Main Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display text-[4rem] md:text-[8rem] lg:text-[10rem] font-bold text-foreground leading-[0.85] tracking-tight"
        >
          Mood
          <span className="block">Flix</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 text-lg md:text-xl text-muted-foreground max-w-lg mx-auto font-medium italic"
        >
          The Creative Sidekick<br />
          Made for Movie Lovers.<br />
          Built for Storytellers.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10"
        >
          <Button 
            size="lg"
            onClick={() => {
              document.getElementById('mood-selector')?.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
              });
            }}
            className="rounded-full px-8 py-6 text-base font-display font-semibold tracking-wide bg-foreground text-background hover:bg-foreground/90 gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-lg">🎬</span>
            </div>
            Get Started Now
          </Button>
        </motion.div>
      </div>

      {/* Bottom Search Bar Hint */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4"
      >
        <div className="px-6 py-3 rounded-full bg-secondary text-muted-foreground text-sm font-medium">
          Discover by mood
        </div>
        <div className="px-6 py-3 rounded-full border border-border bg-background text-foreground text-sm font-medium">
          Search
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
