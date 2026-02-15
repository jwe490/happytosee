import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowDown, Smile, Heart, Zap, Moon, Coffee, Sparkles, Flame, CloudRain, Star, Music, Sun, Eye } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import brainSvg from "@/assets/brain-element.svg";
import popcornSvg from "@/assets/popcorn.svg";
import filmCameraSvg from "@/assets/film-camera.svg";
import movieReelSvg from "@/assets/movie-reel.svg";
import juiceBottleSvg from "@/assets/juice-bottle.svg";

/* ── mood definitions ── */
interface Mood {
  icon: LucideIcon;
  label: string;
}

const moods: Mood[] = [
  { icon: Smile, label: "Happy" },
  { icon: Heart, label: "Romantic" },
  { icon: Zap, label: "Excited" },
  { icon: Moon, label: "Chill" },
  { icon: Coffee, label: "Cozy" },
  { icon: Sparkles, label: "Inspired" },
  { icon: Flame, label: "Thrilled" },
  { icon: CloudRain, label: "Melancholy" },
  { icon: Star, label: "Dreamy" },
  { icon: Music, label: "Groovy" },
  { icon: Sun, label: "Energetic" },
  { icon: Eye, label: "Curious" },
];

/* ── animated text content ── */
const textContent = "12+ Moods · 500k+ Movies · Infinite curations tailored to how you feel right now";

/* ── popping elements config ── */
const poppingElements = [
  { src: filmCameraSvg, alt: "Film camera", style: { top: "8%", left: "-8%" }, delay: 0 },
  { src: popcornSvg, alt: "Popcorn", style: { top: "12%", right: "-10%" }, delay: 1 },
  { src: movieReelSvg, alt: "Movie reel", style: { bottom: "18%", left: "-6%" }, delay: 2 },
  { src: juiceBottleSvg, alt: "Juice bottle", style: { bottom: "10%", right: "-8%" }, delay: 3 },
];

/* ── sparkle positions ── */
const sparkles = [
  { top: "15%", left: "20%", delay: 0 },
  { top: "22%", right: "15%", delay: 0.8 },
  { bottom: "25%", left: "25%", delay: 1.6 },
  { bottom: "18%", right: "20%", delay: 2.4 },
  { top: "45%", left: "8%", delay: 0.4 },
  { top: "50%", right: "8%", delay: 1.2 },
];

/* ── component ── */
const HeroSection = () => {
  const [moodIdx, setMoodIdx] = useState(0);
  const [textKey, setTextKey] = useState(0);

  const words = useMemo(() => textContent.split(" "), []);

  /* cycle mood on click */
  const cycleMood = useCallback(() => {
    setMoodIdx((i) => (i + 1) % moods.length);
    setTextKey((k) => k + 1); // re-trigger text animation
  }, []);

  /* auto-cycle mood every 5s */
  useEffect(() => {
    const id = setInterval(() => {
      setMoodIdx((i) => (i + 1) % moods.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const CurrentIcon = moods[moodIdx].icon;

  return (
    <section
      className="relative flex flex-col items-center bg-background overflow-hidden"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      {/* ─── spacing top ─── */}
      <div className="h-4 sm:h-8" />

      {/* ─── canvas with gradient blob ─── */}
      <div className="relative w-full max-w-[420px] sm:max-w-[480px] mx-auto flex flex-col items-center px-4">

        {/* flowing gradient blob – behind card */}
        <div className="absolute inset-0 -top-16 -bottom-12 pointer-events-none" aria-hidden="true">
          <motion.div
            className="absolute"
            style={{
              top: "5%",
              left: "8%",
              width: "120%",
              height: "95%",
              borderRadius: "40% 60% 55% 45% / 50% 40% 60% 50%",
              background:
                "conic-gradient(from 200deg at 40% 50%, hsl(25 80% 88%) 0deg, hsl(45 70% 85%) 60deg, hsl(140 45% 85%) 120deg, hsl(195 55% 85%) 200deg, hsl(280 35% 88%) 280deg, hsl(25 80% 88%) 360deg)",
              backgroundSize: "400% 400%",
              filter: "blur(55px)",
              opacity: 0.5,
            }}
            animate={{
              backgroundPosition: ["0% 50%", "50% 0%", "100% 50%", "50% 100%", "0% 50%"],
              borderRadius: [
                "40% 60% 55% 45% / 50% 40% 60% 50%",
                "55% 45% 40% 60% / 45% 55% 45% 55%",
                "45% 55% 50% 50% / 55% 45% 50% 50%",
                "40% 60% 55% 45% / 50% 40% 60% 50%",
              ],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* secondary accent blob */}
          <motion.div
            className="absolute"
            style={{
              top: "25%",
              right: "-10%",
              width: "55%",
              height: "50%",
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse at center, hsl(170 50% 85% / 0.5), hsl(200 60% 88% / 0.25), transparent 70%)",
              filter: "blur(40px)",
              opacity: 0.45,
            }}
            animate={{ scale: [1, 1.12, 1], x: [0, 8, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* ─── ORANGE CARD ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 150, damping: 22 }}
          className="relative z-10 w-full rounded-[28px] overflow-hidden shadow-xl"
          style={{
            background: "linear-gradient(135deg, hsl(8 82% 60%), hsl(14 86% 59%), hsl(20 85% 57%))",
          }}
        >
          {/* grain texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
            aria-hidden="true"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* light overlay for depth */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background: "radial-gradient(circle at 20% 25%, rgba(255,255,255,0.12) 0%, transparent 50%)",
            }}
          />

          {/* ── "MOOD FLIX" watermark with reflection ── */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none" aria-hidden="true">
            <motion.div
              className="relative"
              animate={{ scale: [1, 1.04, 1], opacity: [0.06, 0.09, 0.06] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* main text */}
              <span
                className="block text-[68px] sm:text-[80px] font-black tracking-[-0.04em] text-white leading-[0.85] text-center"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                MOOD
                <br />
                FLIX
              </span>
              {/* reflection */}
              <span
                className="block text-[68px] sm:text-[80px] font-black tracking-[-0.04em] text-white leading-[0.85] text-center"
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  transform: "scaleY(-1)",
                  maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 60%)",
                  WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 60%)",
                  opacity: 0.5,
                  marginTop: "-2px",
                }}
              >
                MOOD
                <br />
                FLIX
              </span>
            </motion.div>
          </div>

          {/* ── interactive mood emoji button ── */}
          <div className="relative z-20 px-5 pt-5 flex justify-end">
            <motion.button
              type="button"
              onClick={cycleMood}
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer border-2 border-white/30 hover:bg-white/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              whileTap={{ scale: 0.88, rotate: -10 }}
              whileHover={{ scale: 1.12, rotate: 8 }}
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              aria-label={`Current mood: ${moods[moodIdx].label}. Click to change.`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={moodIdx}
                  initial={{ scale: 0, rotate: -45, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0, rotate: 45, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <CurrentIcon className="w-5 h-5 text-white" strokeWidth={2.5} />
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>

          {/* ── word-by-word animated text ── */}
          <div className="relative z-10 px-6 pt-1 pb-2">
            <div className="min-h-[52px] flex items-center justify-center">
              <p className="text-white/90 text-center text-[13px] sm:text-[14px] font-medium leading-relaxed tracking-wide">
                <AnimatePresence mode="wait">
                  <motion.span key={textKey} className="inline">
                    {words.map((word, i) => (
                      <motion.span
                        key={`${textKey}-${i}`}
                        className="inline-block mr-[5px]"
                        initial={{ opacity: 0, y: 14, scale: 0.85 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          delay: i * 0.06,
                          duration: 0.45,
                          ease: [0.34, 1.56, 0.64, 1],
                        }}
                      >
                        {word}
                      </motion.span>
                    ))}
                  </motion.span>
                </AnimatePresence>
              </p>
            </div>
          </div>

          {/* ── brain illustration with popping elements ── */}
          <div className="relative z-10 px-6 pt-1 pb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 130, damping: 18 }}
              className="relative mx-auto w-[75%] sm:w-[70%] aspect-square"
            >
              {/* warm glow behind brain */}
              <motion.div
                className="absolute inset-[12%] rounded-full"
                style={{
                  background: "radial-gradient(circle, hsl(35 80% 75% / 0.3) 0%, transparent 60%)",
                }}
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.55, 0.3] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden="true"
              />

              {/* brain SVG */}
              <motion.img
                src={brainSvg}
                alt="Creative brain illustration"
                className="w-full h-full object-contain relative z-10 drop-shadow-lg"
                draggable={false}
                animate={{ y: [0, -8, 0], rotate: [0, 1.5, 0, -1.5, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* popping elements around brain */}
              {poppingElements.map((el, i) => (
                <motion.div
                  key={i}
                  className="absolute w-[52px] h-[52px] sm:w-[60px] sm:h-[60px] z-20"
                  style={el.style}
                  aria-hidden="true"
                >
                  <motion.img
                    src={el.src}
                    alt={el.alt}
                    className="w-full h-full object-contain drop-shadow-md"
                    draggable={false}
                    initial={{ scale: 0, opacity: 0, rotate: 0 }}
                    animate={{
                      scale: [0, 1.25, 1, 1.1, 0],
                      opacity: [0, 1, 1, 1, 0],
                      rotate: [0, 12, -5, 8, 0],
                    }}
                    transition={{
                      duration: 4,
                      delay: el.delay,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
              ))}

              {/* sparkle particles */}
              {sparkles.map((sp, i) => (
                <motion.div
                  key={`spark-${i}`}
                  className="absolute w-1.5 h-1.5 rounded-full bg-white/60 z-20"
                  style={sp}
                  aria-hidden="true"
                  animate={{
                    opacity: [0, 0.9, 0],
                    scale: [0.3, 1.3, 0.3],
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 2.2 + i * 0.3,
                    repeat: Infinity,
                    delay: sp.delay,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          </div>

          {/* ── bottom CTA strip inside card ── */}
          <div className="relative z-10 px-6 pb-6 flex items-center justify-between gap-3">
            <p className="text-[12px] sm:text-[13px] text-white/80 font-medium">
              <span className="text-white font-bold">AI-powered</span>{" "}
              <span className="text-white/70">Movie Suggestions</span>
            </p>
            <Button
              size="sm"
              onClick={() =>
                document.getElementById("mood-selector")?.scrollIntoView({ behavior: "smooth" })
              }
              className="rounded-full px-6 py-2.5 text-[13px] font-bold gap-1.5 bg-foreground text-background hover:bg-foreground/90 shadow-lg"
            >
              Start
              <ArrowDown className="w-3.5 h-3.5" />
            </Button>
          </div>
        </motion.div>
      </div>

      {/* ─── mood label tooltip ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 mt-5"
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={moodIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-xs text-muted-foreground tracking-widest uppercase font-semibold"
          >
            {moods[moodIdx].label} mode
          </motion.p>
        </AnimatePresence>
      </motion.div>

      {/* ─── spacing bottom ─── */}
      <div className="h-10 sm:h-14" />
    </section>
  );
};

export default HeroSection;
