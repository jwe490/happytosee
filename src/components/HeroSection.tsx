import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

import logoSvg from "@/assets/logo.svg";
import brainSvg from "@/assets/brain-element.svg";
import filmCameraSvg from "@/assets/film-camera.svg";
import juiceBottleSvg from "@/assets/juice-bottle.svg";
import movieReelSvg from "@/assets/movie-reel.svg";
import popcornSvg from "@/assets/popcorn.svg";

const rotatingTexts = [
  "12+ Moods to match your vibe",
  "500k+ Movies curated for you",
  "Infinite AI-powered picks",
  "Discover hidden cinematic gems",
  "Your mood, your perfect movie",
];

const HeroSection = () => {
  const isMobile = useIsMobile();
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % rotatingTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Floating elements config
  const floatingElements = useMemo(() => [
    { src: filmCameraSvg, alt: "Film camera", className: "top-[8%] left-[3%] w-16 h-16 sm:w-24 sm:h-24", delay: 0, duration: 6 },
    { src: popcornSvg, alt: "Popcorn", className: "top-[12%] right-[4%] w-14 h-14 sm:w-20 sm:h-20", delay: 0.5, duration: 5 },
    { src: movieReelSvg, alt: "Movie reel", className: "bottom-[18%] left-[5%] w-14 h-14 sm:w-20 sm:h-20", delay: 1, duration: 7 },
    { src: juiceBottleSvg, alt: "Juice bottle", className: "bottom-[15%] right-[3%] w-12 h-12 sm:w-18 sm:h-18", delay: 1.5, duration: 5.5 },
  ], []);

  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Animated gradient background - looping pastel orange/blue/green tones */}
      <div
        className="absolute inset-0 animate-gradient-flow"
        style={{
          background: "linear-gradient(135deg, hsl(30 90% 92%), hsl(200 70% 88%), hsl(140 60% 88%), hsl(20 85% 85%), hsl(280 40% 90%), hsl(30 90% 92%))",
          backgroundSize: "400% 400%",
        }}
      />

      {/* Subtle grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* Background "MOOD FLIX" text with reflection */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.06, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="relative"
        >
          <span
            className="font-display text-[12vw] sm:text-[10vw] font-black tracking-tighter text-foreground leading-none block"
          >
            MOOD
          </span>
          <span
            className="font-display text-[12vw] sm:text-[10vw] font-black tracking-tighter text-foreground leading-none block"
          >
            FLIX
          </span>
          {/* Reflection */}
          <div className="relative overflow-hidden" style={{ height: "40%", marginTop: "-4px" }}>
            <span
              className="font-display text-[12vw] sm:text-[10vw] font-black tracking-tighter text-foreground leading-none block"
              style={{
                transform: "scaleY(-1)",
                maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)",
                WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)",
              }}
            >
              MOOD
            </span>
          </div>
        </motion.div>
      </div>

      {/* Floating decorative elements */}
      {floatingElements.map((el, i) => (
        <motion.div
          key={i}
          className={`absolute z-[5] ${el.className} hidden sm:block`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.7, scale: 1 }}
          transition={{ delay: 0.8 + el.delay, duration: 0.6, type: "spring", stiffness: 200 }}
        >
          <motion.img
            src={el.src}
            alt={el.alt}
            className="w-full h-full object-contain drop-shadow-lg"
            draggable={false}
            animate={{
              y: [0, -12, 0, 8, 0],
              rotate: [0, -3, 0, 3, 0],
            }}
            transition={{
              duration: el.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: el.delay,
            }}
          />
        </motion.div>
      ))}

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mb-6"
      >
        <img src={logoSvg} alt="MoodFlix" className="h-14 sm:h-16 object-contain" draggable={false} />
      </motion.div>

      {/* Main orange card frame */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 150 }}
        className="relative z-10 w-full max-w-sm sm:max-w-md rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: "hsl(14 86% 59%)",
        }}
      >
        {/* Smiley icon top-right */}
        <motion.div
          className="absolute top-4 right-4 z-20"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 300 }}
        >
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl">
            😊
          </div>
        </motion.div>

        {/* Rotating text inside card */}
        <div className="px-6 pt-8 pb-4">
          <div className="h-14 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={textIndex}
                initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                transition={{ duration: 0.5 }}
                className="text-white text-center text-sm sm:text-base font-medium leading-snug"
              >
                {rotatingTexts[textIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Brain element with life animation */}
        <div className="relative px-4 pb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.6, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{
              delay: 0.5,
              duration: 1,
              type: "spring",
              stiffness: 120,
              damping: 14,
            }}
            className="relative mx-auto w-[80%] aspect-square"
          >
            {/* Pulsing glow behind brain */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle, hsl(30 90% 70% / 0.4) 0%, transparent 70%)",
              }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            
            {/* Brain SVG */}
            <motion.img
              src={brainSvg}
              alt="Creative brain"
              className="w-full h-full object-contain relative z-10 drop-shadow-xl"
              draggable={false}
              animate={{
                y: [0, -6, 0],
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Sparkle particles around brain */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-white/60"
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${10 + Math.random() * 80}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  y: [0, -20, -40],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 0.6,
                  ease: "easeOut",
                }}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom CTA area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="relative z-10 mt-8 flex items-center gap-4 sm:gap-6"
      >
        <span className="text-sm text-foreground/70">
          <span className="text-accent font-semibold">AI-powered</span>{" "}
          Movie Suggestions
        </span>
        <Button
          size="lg"
          onClick={() => {
            document.getElementById("mood-selector")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="rounded-full px-8 py-5 text-sm font-semibold"
        >
          Start
          <ArrowDown className="w-4 h-4 ml-1" />
        </Button>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-5 h-8 rounded-full border-2 border-foreground/20 flex items-start justify-center p-1.5"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-1 rounded-full bg-foreground/30"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
