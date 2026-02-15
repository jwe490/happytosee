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

/* ── animated text ── */
const textContent = "Randomly generated text about 12+ Moods, 500k+ Movies, Infinite curations, etc... which sells my site well";

/* ── popping elements ── */
const poppingElements = [
  { src: filmCameraSvg, alt: "Film camera", style: { top: "5%", left: "-10%" } as React.CSSProperties, delay: 0 },
  { src: popcornSvg, alt: "Popcorn", style: { top: "8%", right: "-12%" } as React.CSSProperties, delay: 1 },
  { src: movieReelSvg, alt: "Movie reel", style: { bottom: "15%", left: "-8%" } as React.CSSProperties, delay: 2 },
  { src: juiceBottleSvg, alt: "Juice bottle", style: { bottom: "8%", right: "-10%" } as React.CSSProperties, delay: 3 },
];

/* ── sparkles ── */
const sparklePositions = [
  { top: "12%", left: "18%", delay: 0 },
  { top: "20%", right: "12%", delay: 0.7 },
  { bottom: "22%", left: "22%", delay: 1.4 },
  { bottom: "15%", right: "18%", delay: 2.1 },
];

/* ── component ── */
const HeroSection = () => {
  const [moodIdx, setMoodIdx] = useState(0);
  const [textKey, setTextKey] = useState(0);

  const words = useMemo(() => textContent.split(" "), []);

  const cycleMood = useCallback(() => {
    setMoodIdx((i) => (i + 1) % moods.length);
    setTextKey((k) => k + 1);
  }, []);

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
      {/* ─── top spacing ─── */}
      <div className="h-6 sm:h-10" />

      {/* ─── main canvas ─── */}
      <div className="relative w-full max-w-[400px] sm:max-w-[460px] mx-auto flex flex-col items-center px-5">

        {/* ── gradient blob – sweeps to the RIGHT like reference ── */}
        <div className="absolute inset-0 -top-20 -bottom-16 -right-[40%] pointer-events-none" aria-hidden="true">
          <motion.div
            className="absolute w-full h-full"
            style={{
              top: "0%",
              left: "20%",
              borderRadius: "40% 60% 55% 45% / 50% 40% 60% 50%",
              background:
                "conic-gradient(from 180deg at 45% 50%, hsl(25 80% 88%) 0deg, hsl(50 75% 85%) 70deg, hsl(140 50% 85%) 140deg, hsl(195 55% 85%) 210deg, hsl(280 35% 88%) 290deg, hsl(25 80% 88%) 360deg)",
              backgroundSize: "400% 400%",
              filter: "blur(50px)",
              opacity: 0.55,
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
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* ── emoji mood button – overlapping card top-right ── */}
        <motion.button
          type="button"
          onClick={cycleMood}
          className="absolute z-30 w-14 h-14 rounded-full bg-white flex items-center justify-center cursor-pointer border-[3px] border-white/80 hover:shadow-xl transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{
            top: "-6px",
            right: "8px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
          }}
          whileTap={{ scale: 0.88, rotate: -12 }}
          whileHover={{ scale: 1.12, rotate: 10 }}
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
              <CurrentIcon className="w-6 h-6 text-foreground" strokeWidth={2.5} />
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {/* ─── ORANGE CARD ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 150, damping: 22 }}
          className="relative z-10 w-full rounded-[28px] overflow-hidden"
          style={{
            background: "linear-gradient(145deg, hsl(10 78% 62%), hsl(14 86% 59%), hsl(18 82% 56%))",
            boxShadow: "0 30px 60px rgba(255,107,107,0.25), 0 12px 30px rgba(0,0,0,0.1)",
          }}
        >
          {/* grain */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay"
            aria-hidden="true"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* light gloss */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background: "radial-gradient(circle at 15% 20%, rgba(255,255,255,0.1) 0%, transparent 45%)",
            }}
          />

          {/* ── MOOD FLIX watermark ── */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" aria-hidden="true">
            <motion.div
              className="relative"
              animate={{ scale: [1, 1.05, 1], opacity: [0.08, 0.12, 0.08] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <span
                className="block text-[72px] sm:text-[86px] font-black tracking-[-0.04em] text-white leading-[0.85] text-center"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                MOOD
                <br />
                FLIX
              </span>
              {/* reflection */}
              <span
                className="block text-[72px] sm:text-[86px] font-black tracking-[-0.04em] text-white leading-[0.85] text-center"
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  transform: "scaleY(-1)",
                  maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 55%)",
                  WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 55%)",
                  opacity: 0.4,
                  marginTop: "-4px",
                }}
              >
                MOOD
                <br />
                FLIX
              </span>
            </motion.div>
          </div>

          {/* ── word-by-word text ── */}
          <div className="relative z-10 px-7 pt-10 pb-3">
            <div className="min-h-[60px] flex items-start justify-center">
              <p className="text-white/90 text-center text-[14px] sm:text-[15px] font-medium leading-[1.65] tracking-wide">
                <AnimatePresence mode="wait">
                  <motion.span key={textKey} className="inline">
                    {words.map((word, i) => (
                      <motion.span
                        key={`${textKey}-${i}`}
                        className="inline-block mr-[5px]"
                        initial={{ opacity: 0, y: 16, scale: 0.85 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          delay: i * 0.055,
                          duration: 0.5,
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

          {/* ── brain with popping elements ── */}
          <div className="relative z-10 px-4 pt-0 pb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 130, damping: 18 }}
              className="relative mx-auto w-[82%] sm:w-[78%] aspect-square"
            >
              {/* warm glow */}
              <motion.div
                className="absolute inset-[10%] rounded-full"
                style={{
                  background: "radial-gradient(circle, hsl(35 80% 75% / 0.25) 0%, transparent 55%)",
                }}
                animate={{ scale: [1, 1.1, 1], opacity: [0.25, 0.5, 0.25] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden="true"
              />

              {/* brain SVG */}
              <motion.img
                src={brainSvg}
                alt="Creative brain illustration"
                className="w-full h-full object-contain relative z-10"
                style={{ filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.2))" }}
                draggable={false}
                animate={{ y: [0, -10, 0], rotate: [0, 1, 0, -1, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* popping elements */}
              {poppingElements.map((el, i) => (
                <motion.div
                  key={i}
                  className="absolute w-[48px] h-[48px] sm:w-[56px] sm:h-[56px] z-20"
                  style={el.style}
                  aria-hidden="true"
                >
                  <motion.img
                    src={el.src}
                    alt={el.alt}
                    className="w-full h-full object-contain"
                    style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.2))" }}
                    draggable={false}
                    animate={{
                      scale: [0, 1.3, 1, 1.15, 0],
                      opacity: [0, 1, 1, 1, 0],
                      rotate: [0, 15, -5, 10, 0],
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

              {/* sparkles */}
              {sparklePositions.map((sp, i) => (
                <motion.div
                  key={`sp-${i}`}
                  className="absolute w-1.5 h-1.5 rounded-full bg-white/60 z-20"
                  style={sp}
                  aria-hidden="true"
                  animate={{
                    opacity: [0, 0.9, 0],
                    scale: [0.3, 1.2, 0.3],
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 2 + i * 0.3,
                    repeat: Infinity,
                    delay: sp.delay,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* ─── CTA strip OUTSIDE card (below) ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="relative z-10 mt-7 sm:mt-9 flex items-center justify-center gap-6 px-5"
      >
        <p className="text-[13px] sm:text-[14px] text-muted-foreground font-medium">
          <span className="text-foreground font-bold">AI-powered</span>{" "}
          Movie Suggestions
        </p>
        <Button
          size="lg"
          onClick={() =>
            document.getElementById("mood-selector")?.scrollIntoView({ behavior: "smooth" })
          }
          className="rounded-full px-8 py-5 text-[14px] font-bold gap-1.5 shadow-lg"
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
