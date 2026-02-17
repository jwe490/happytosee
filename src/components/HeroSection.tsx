import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

import brainSvg from "@/assets/brain-element.svg";
import popcornSvg from "@/assets/popcorn.svg";
import filmCameraSvg from "@/assets/film-camera.svg";
import movieReelSvg from "@/assets/movie-reel.svg";
import juiceBottleSvg from "@/assets/juice-bottle.svg";
import logoSvg from "@/assets/logo.svg";

/* ── cycling sell lines (rotate every 3.5s) ── */
const sellLines = [
  "12+ Moods · 500K+ Movies · Infinite curations",
  "AI reads your mood and picks the perfect film.",
  "From blockbusters to hidden gems — curated for you.",
  "Stop scrolling. Start feeling. Let AI find your movie.",
];

/* ── emoji cycle ── */
const emojis = ["😊", "😎", "🤯", "😴", "😡", "🤖", "😍", "🎬", "🍿", "🥰", "😢", "🤩"];

/* ── popping elements ── */
const poppingElements = [
  { src: filmCameraSvg, alt: "Film camera", style: { top: "5%", left: "-12%" } as React.CSSProperties, delay: 0 },
  { src: popcornSvg, alt: "Popcorn", style: { top: "8%", right: "-14%" } as React.CSSProperties, delay: 1 },
  { src: movieReelSvg, alt: "Movie reel", style: { bottom: "18%", left: "-10%" } as React.CSSProperties, delay: 2 },
  { src: juiceBottleSvg, alt: "Juice bottle", style: { bottom: "12%", right: "-12%" } as React.CSSProperties, delay: 3 },
];

/* ── sparkle positions ── */
const sparklePositions = [
  { top: "12%", left: "18%", delay: 0 },
  { top: "20%", right: "12%", delay: 0.7 },
  { bottom: "22%", left: "22%", delay: 1.4 },
  { bottom: "15%", right: "18%", delay: 2.1 },
];

/* ── component ── */
const HeroSection = () => {
  const [emojiIdx, setEmojiIdx] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);

  /* auto-cycle sell lines every 3.5s */
  useEffect(() => {
    const id = setInterval(() => {
      setLineIdx((i) => (i + 1) % sellLines.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  /* auto-cycle emojis every 5s */
  useEffect(() => {
    const id = setInterval(() => {
      setEmojiIdx((i) => (i + 1) % emojis.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const cycleEmoji = useCallback(() => {
    setEmojiIdx((i) => (i + 1) % emojis.length);
  }, []);

  const currentWords = useMemo(() => sellLines[lineIdx].split(" "), [lineIdx]);

  return (
    <section className="relative flex flex-col items-center bg-background overflow-hidden">

      {/* ─── top bar: logo + hamburger ─── */}
      <div className="w-full max-w-[460px] mx-auto flex items-center justify-between px-5 pt-4 pb-2 relative z-20">
        <motion.img
          src={logoSvg}
          alt="MoodFlix logo"
          className="h-10 sm:h-12 w-auto"
          draggable={false}
          animate={{ filter: [
            "drop-shadow(2px 2px 10px rgba(255,107,107,0.4))",
            "drop-shadow(2px 2px 20px rgba(255,107,107,0.6))",
            "drop-shadow(2px 2px 10px rgba(255,107,107,0.4))",
          ]}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.button
          type="button"
          className="w-11 h-11 rounded-xl bg-card flex flex-col items-center justify-center gap-[5px] cursor-pointer border border-border/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
          whileHover={{ translateY: -3, rotate: 180 }}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          aria-label="Open menu"
        >
          <span className="block w-5 h-[2.5px] rounded-full bg-foreground transition-transform" />
          <span className="block w-5 h-[2.5px] rounded-full bg-foreground" />
          <span className="block w-5 h-[2.5px] rounded-full bg-foreground transition-transform" />
        </motion.button>
      </div>

      {/* ─── spacing ─── */}
      <div className="h-3 sm:h-5" />

      {/* ─── main canvas ─── */}
      <div className="relative w-full max-w-[400px] sm:max-w-[440px] mx-auto flex flex-col items-center px-5">

        {/* ── gradient blob (pastel rainbow, sweeps right) ── */}
        <div className="absolute inset-0 -top-24 -bottom-20 -right-[45%] -left-[25%] pointer-events-none" aria-hidden="true">
          <motion.div
            className="absolute w-full h-full"
            style={{
              borderRadius: "40% 60% 55% 45% / 50% 40% 60% 50%",
              background: "conic-gradient(from 200deg at 50% 50%, hsl(200 70% 90%) 0deg, hsl(40 80% 92%) 90deg, hsl(50 85% 88%) 150deg, hsl(130 55% 88%) 220deg, hsl(195 60% 90%) 300deg, hsl(200 70% 90%) 360deg)",
              backgroundSize: "400% 400%",
              filter: "blur(55px)",
              opacity: 0.6,
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
        </div>

        {/* ── emoji mood button (overlapping card top-right) ── */}
        <motion.button
          type="button"
          onClick={cycleEmoji}
          className="absolute z-30 w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] rounded-full bg-white flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{
            top: "-8px",
            right: "12px",
            border: "4px solid rgba(255,255,255,0.8)",
            boxShadow: "0 10px 35px rgba(0,0,0,0.2)",
          }}
          whileTap={{ scale: 0.88, rotate: -15 }}
          whileHover={{ scale: 1.2, rotate: 15 }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          aria-label={`Current mood emoji. Click to change.`}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={emojiIdx}
              className="text-[28px] sm:text-[34px] leading-none select-none"
              style={{
                filter: "grayscale(100%) brightness(0) invert(1)",
              }}
              initial={{ scale: 0, rotate: -45, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: 45, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              {emojis[emojiIdx]}
            </motion.span>
          </AnimatePresence>
        </motion.button>

        {/* ─── CORAL CARD ─── */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 140, damping: 20 }}
          className="relative z-10 w-full rounded-[32px] overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #E8775E 0%, #D4654E 100%)",
            boxShadow: "0 35px 70px rgba(255,107,107,0.3), 0 15px 35px rgba(0,0,0,0.12)",
          }}
        >
          {/* grain overlay */}
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
              background: "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 50%)",
            }}
          />

          {/* ── MOOD FLIX watermark ── */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" aria-hidden="true">
            <motion.div
              className="relative"
              animate={{ scale: [1, 1.06, 1], opacity: [0.08, 0.12, 0.08] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <span
                className="block text-[72px] sm:text-[88px] font-black tracking-[-0.04em] text-white leading-[0.85] text-center"
                style={{ fontFamily: "'Space Grotesk', 'Manrope', sans-serif" }}
              >
                MOOD
                <br />
                FLIX
              </span>
              {/* reflection */}
              <span
                className="block text-[72px] sm:text-[88px] font-black tracking-[-0.04em] text-white leading-[0.85] text-center"
                style={{
                  fontFamily: "'Space Grotesk', 'Manrope', sans-serif",
                  transform: "scaleY(-1)",
                  maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 50%)",
                  WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 50%)",
                  opacity: 0.35,
                  marginTop: "-4px",
                }}
              >
                MOOD
                <br />
                FLIX
              </span>
            </motion.div>
          </div>

          {/* ── cycling word-by-word text ── */}
          <div className="relative z-10 px-7 pt-10 pb-3">
            <div className="min-h-[56px] flex items-start justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={lineIdx}
                  className="text-white/90 text-center text-[14px] sm:text-[15px] font-medium leading-[1.7] tracking-wide"
                  style={{ textShadow: "0 2px 10px rgba(0,0,0,0.1)" }}
                >
                  {currentWords.map((word, i) => (
                    <motion.span
                      key={`${lineIdx}-${i}`}
                      className="inline-block mr-[5px]"
                      initial={{ opacity: 0, y: 20, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        delay: i * 0.06,
                        duration: 0.6,
                        ease: [0.34, 1.56, 0.64, 1],
                      }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* ── brain with popping elements ── */}
          <div className="relative z-10 px-4 pt-0 pb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 130, damping: 18 }}
              className="relative mx-auto w-[80%] sm:w-[75%] aspect-square"
            >
              {/* warm glow behind brain */}
              <motion.div
                className="absolute inset-[10%] rounded-full"
                style={{
                  background: "radial-gradient(circle, hsl(35 80% 75% / 0.25) 0%, transparent 55%)",
                }}
                animate={{ scale: [1, 1.12, 1], opacity: [0.25, 0.5, 0.25] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden="true"
              />

              {/* brain SVG */}
              <motion.img
                src={brainSvg}
                alt="Creative brain illustration"
                className="w-full h-full object-contain relative z-10"
                style={{ filter: "drop-shadow(0 12px 35px rgba(0,0,0,0.25))" }}
                draggable={false}
                animate={{
                  y: [0, -12, 0],
                  rotate: [0, 2, 0, -2, 0],
                }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* popping elements */}
              {poppingElements.map((el, i) => (
                <motion.div
                  key={i}
                  className="absolute w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] z-20"
                  style={el.style}
                  aria-hidden="true"
                >
                  <motion.img
                    src={el.src}
                    alt={el.alt}
                    className="w-full h-full object-contain"
                    style={{ filter: "drop-shadow(0 5px 15px rgba(0,0,0,0.2))" }}
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

      {/* ─── CTA strip OUTSIDE card ─── */}
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

      {/* ─── scroll indicator ─── */}
      <motion.div
        className="mt-8 mb-4 flex flex-col items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <motion.div
          className="w-6 h-9 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center pt-1.5"
          aria-hidden="true"
        >
          <motion.div
            className="w-1 h-2 rounded-full bg-muted-foreground/50"
            animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>

      {/* ─── spacing ─── */}
      <div className="h-6 sm:h-10" />
    </section>
  );
};

export default HeroSection;
