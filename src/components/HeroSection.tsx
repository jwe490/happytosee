import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

import brainSvg from "@/assets/brain-element.svg";

/* ── rotating headline copy ── */
const headlines = [
  "12+ Moods · 500k+ Movies · Infinite curations",
  "AI picks the perfect movie for your mood",
  "Discover hidden gems you'll actually love",
  "Your vibe, your cinema, your moment",
];

/* ── mood emojis for the interactive button ── */
const moodEmojis = ["😊", "🤩", "😌", "🥺", "😤", "🤔", "😴", "🥳", "😎", "💀", "🫠", "🤯"];

/* ── component ── */
const HeroSection = () => {
  const [headlineIdx, setHeadlineIdx] = useState(0);
  const [emojiIdx, setEmojiIdx] = useState(0);

  /* auto-rotate headlines */
  useEffect(() => {
    const id = setInterval(() => setHeadlineIdx((i) => (i + 1) % headlines.length), 3800);
    return () => clearInterval(id);
  }, []);

  /* interactive emoji click */
  const cycleEmoji = useCallback(() => {
    setEmojiIdx((i) => (i + 1) % moodEmojis.length);
  }, []);

  return (
    <section className="relative flex flex-col items-center bg-background overflow-hidden">
      {/* ─── white space above card ─── */}
      <div className="h-6 sm:h-10" />

      {/* ─── canvas area ─── */}
      <div className="relative w-full max-w-lg mx-auto flex flex-col items-center px-5">
        {/* flowing gradient – positioned behind the card, sweeps to the right */}
        <div className="absolute inset-0 -top-12 -bottom-8 pointer-events-none">
          {/* primary sweep */}
          <motion.div
            className="absolute animate-gradient-flow"
            style={{
              top: "10%",
              left: "15%",
              width: "110%",
              height: "90%",
              borderRadius: "40% 60% 55% 45% / 50% 40% 60% 50%",
              background:
                "conic-gradient(from 200deg at 40% 50%, hsl(25 80% 85%) 0deg, hsl(45 70% 82%) 60deg, hsl(140 45% 82%) 120deg, hsl(195 55% 82%) 200deg, hsl(280 35% 85%) 280deg, hsl(25 80% 85%) 360deg)",
              backgroundSize: "400% 400%",
              filter: "blur(50px)",
              opacity: 0.55,
            }}
            animate={{
              borderRadius: [
                "40% 60% 55% 45% / 50% 40% 60% 50%",
                "55% 45% 40% 60% / 45% 55% 45% 55%",
                "40% 60% 55% 45% / 50% 40% 60% 50%",
              ],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* accent sweep – teal/green that peeks right */}
          <motion.div
            className="absolute animate-gradient-flow-reverse"
            style={{
              top: "20%",
              right: "-15%",
              width: "65%",
              height: "60%",
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse at center, hsl(170 50% 82% / 0.6), hsl(200 60% 85% / 0.3), transparent 70%)",
              backgroundSize: "400% 400%",
              filter: "blur(40px)",
              opacity: 0.5,
            }}
            animate={{
              scale: [1, 1.15, 1],
              x: [0, 10, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* ─── orange card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, type: "spring", stiffness: 140, damping: 20 }}
          className="relative z-10 w-full rounded-[26px] overflow-hidden shadow-xl"
          style={{ background: "hsl(14 86% 59%)" }}
        >
          {/* subtle grain on card */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* interactive emoji button – top right */}
          <motion.button
            type="button"
            onClick={cycleEmoji}
            className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center cursor-pointer border border-white/20 hover:bg-white/25 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.08 }}
            aria-label="Cycle mood emoji"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={emojiIdx}
                initial={{ scale: 0, rotate: -60, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0, rotate: 60, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="text-xl leading-none select-none"
                style={{ filter: "grayscale(100%) brightness(2)" }}
              >
                {moodEmojis[emojiIdx]}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          {/* "MOOD FLIX" watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.07 }}
              transition={{ delay: 0.6, duration: 1.2 }}
              className="text-[76px] sm:text-[88px] font-black tracking-[-0.06em] text-white leading-[0.85] text-center"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              MOOD
              <br />
              FLIX
            </motion.span>
          </div>

          {/* rotating headline */}
          <div className="relative z-10 px-7 pt-10 pb-2">
            <div className="h-[48px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={headlineIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                  className="text-white/90 text-center text-[13px] sm:text-sm font-medium leading-relaxed tracking-wide"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                  {headlines[headlineIdx]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* brain illustration */}
          <div className="relative z-10 px-5 pt-2 pb-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25, duration: 0.7, type: "spring", stiffness: 120, damping: 16 }}
              className="relative mx-auto w-[85%] aspect-square"
            >
              {/* warm glow */}
              <motion.div
                className="absolute inset-[15%] rounded-full"
                style={{
                  background: "radial-gradient(circle, hsl(35 80% 72% / 0.3) 0%, transparent 65%)",
                }}
                animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.6, 0.35] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* brain image */}
              <motion.img
                src={brainSvg}
                alt="Creative brain illustration"
                className="w-full h-full object-contain relative z-10"
                draggable={false}
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* tiny floating sparks */}
              {[0, 1, 2, 3].map((i) => {
                const positions = [
                  { top: "18%", left: "22%" },
                  { top: "25%", right: "18%" },
                  { bottom: "28%", left: "28%" },
                  { bottom: "22%", right: "24%" },
                ];
                return (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-white/50"
                    style={positions[i]}
                    animate={{
                      opacity: [0, 0.8, 0],
                      scale: [0.5, 1.2, 0.5],
                      y: [0, -8, 0],
                    }}
                    transition={{
                      duration: 2.5 + i * 0.5,
                      repeat: Infinity,
                      delay: i * 0.8,
                      ease: "easeInOut",
                    }}
                  />
                );
              })}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* ─── CTA strip ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.45 }}
        className="relative z-10 mt-8 sm:mt-10 flex items-center gap-5 px-5"
      >
        <p
          className="text-[13px] sm:text-sm text-muted-foreground"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <span className="text-foreground font-semibold">AI-powered</span> Movie Suggestions
        </p>
        <Button
          size="lg"
          onClick={() => document.getElementById("mood-selector")?.scrollIntoView({ behavior: "smooth" })}
          className="rounded-full px-8 py-5 text-sm font-semibold gap-1.5"
        >
          Start
          <ArrowDown className="w-3.5 h-3.5" />
        </Button>
      </motion.div>

      {/* ─── spacing before next section ─── */}
      <div className="h-12 sm:h-16" />
    </section>
  );
};

export default HeroSection;
