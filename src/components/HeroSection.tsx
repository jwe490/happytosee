import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

import brainSvg from "@/assets/brain-element.svg";

const rotatingTexts = [
  "12+ Moods · 500k+ Movies · Infinite curations",
  "AI picks the perfect movie for your mood",
  "Discover hidden gems you'll actually love",
  "Your vibe, your cinema, your moment",
];

const HeroSection = () => {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % rotatingTexts.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative flex flex-col items-center justify-center px-4 pt-8 pb-16 sm:pt-12 sm:pb-24 bg-background overflow-hidden">
      {/* Gradient blob behind the card - only element with color */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] w-[500px] h-[500px] sm:w-[600px] sm:h-[600px]">
        <motion.div
          className="w-full h-full rounded-full animate-gradient-flow"
          style={{
            background: "conic-gradient(from 180deg, hsl(30 85% 88%), hsl(160 50% 85%), hsl(200 60% 85%), hsl(280 40% 88%), hsl(340 50% 88%), hsl(30 85% 88%))",
            backgroundSize: "400% 400%",
            filter: "blur(60px)",
            opacity: 0.6,
          }}
        />
      </div>

      {/* Orange card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, type: "spring", stiffness: 120, damping: 18 }}
        className="relative z-10 w-full max-w-[340px] sm:max-w-[380px] rounded-[28px] overflow-hidden"
        style={{ background: "hsl(14 86% 59%)" }}
      >
        {/* Smiley top-right */}
        <motion.div
          className="absolute top-4 right-4 z-20"
          initial={{ opacity: 0, scale: 0, rotate: -90 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 260, damping: 15 }}
        >
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl">
            😊
          </div>
        </motion.div>

        {/* "MOOD FLIX" watermark behind brain */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.08 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="font-display text-[72px] sm:text-[80px] font-black tracking-tighter text-white leading-none text-center"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            MOOD<br />FLIX
          </motion.span>
        </div>

        {/* Rotating text */}
        <div className="px-6 pt-10 pb-3">
          <div className="h-12 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={textIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="text-white text-center text-[13px] sm:text-sm font-medium leading-relaxed tracking-wide"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                {rotatingTexts[textIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Brain element */}
        <div className="relative px-6 pb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8, type: "spring", stiffness: 100, damping: 14 }}
            className="relative mx-auto w-full aspect-[4/3]"
          >
            {/* Soft glow behind brain */}
            <motion.div
              className="absolute inset-[10%] rounded-full"
              style={{
                background: "radial-gradient(circle, hsl(30 90% 75% / 0.35) 0%, transparent 70%)",
              }}
              animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.img
              src={brainSvg}
              alt="Creative brain illustration"
              className="w-full h-full object-contain relative z-10"
              draggable={false}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="relative z-10 mt-10 flex items-center gap-5"
      >
        <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>
          <span className="text-foreground font-semibold">AI-powered</span>{" "}
          Movie Suggestions
        </p>
        <Button
          size="lg"
          onClick={() => document.getElementById("mood-selector")?.scrollIntoView({ behavior: "smooth" })}
          className="rounded-full px-8 py-5 text-sm font-semibold"
        >
          Start
          <ArrowDown className="w-4 h-4 ml-1" />
        </Button>
      </motion.div>
    </section>
  );
};

export default HeroSection;
