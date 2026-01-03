import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star, Play } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-mobile";

type Movie = {
  id: number | string;
  title: string;
  posterUrl: string;
  backdropUrl?: string;
  rating?: number;
  year?: number;
  genre?: string;
};

type Props = {
  movies?: Movie[];
  onMovieSelect: (movie: Movie) => void;
  autoPlayMs?: number;
  height?: { mobile: number; desktop: number };
};

export function MinimalCinematicCarousel({
  movies = [],
  onMovieSelect,
  autoPlayMs = 6500,
  height = { mobile: 520, desktop: 640 },
}: Props) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const list = useMemo(() => (movies ?? []).filter(Boolean), [movies]);
  const total = list.length;

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const interacted = useRef(false);
  const timerRef = useRef<number | null>(null);

  const current = total > 0 ? list[Math.min(index, total - 1)] : undefined;

  // keep index safe
  useEffect(() => {
    if (total === 0) return;
    if (index > total - 1) setIndex(0);
  }, [index, total]);

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const onUserInteract = useCallback(() => {
    interacted.current = true;
    setPaused(true);
  }, []);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (total <= 1) return;
      if (isTransitioning) return;

      clearTimer();
      setIsTransitioning(true);
      setIndex((p) => (p + dir + total) % total);

      timerRef.current = window.setTimeout(() => {
        setIsTransitioning(false);
        timerRef.current = null;
      }, 260);
    },
    [clearTimer, isTransitioning, total],
  );

  const goTo = useCallback(
    (i: number) => {
      if (total <= 1) return;
      if (i === index) return;

      onUserInteract();
      clearTimer();
      setIsTransitioning(true);
      setIndex(i);

      timerRef.current = window.setTimeout(() => {
        setIsTransitioning(false);
        timerRef.current = null;
      }, 260);
    },
    [clearTimer, index, onUserInteract, total],
  );

  useEffect(() => {
    if (reduceMotion || total <= 1 || paused) return;

    const t = window.setInterval(() => {
      if (interacted.current) return;
      go(1);
    }, autoPlayMs);

    return () => window.clearInterval(t);
  }, [autoPlayMs, go, paused, reduceMotion, total]);

  if (!current) return null;

  const bg = current.backdropUrl || current.posterUrl;

  return (
    <section className="w-full">
      <div
        className="relative w-full overflow-hidden rounded-3xl bg-black"
        style={{ height: isDesktop ? height.desktop : height.mobile }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        aria-roledescription="carousel"
        aria-label="Featured movies"
      >
        {/* Background (never blocks clicks) */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            key={`bg-${current.id}`}
            src={bg}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover ${reduceMotion ? "" : "mc-bgEnter"}`}
            decoding="async"
          />
          <div className="absolute inset-0 mc-gradTop" />
          <div className="absolute inset-0 mc-gradBottom" />
        </div>

        {/* Arrows */}
        {total > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous"
              onClick={() => {
                onUserInteract();
                go(-1);
              }}
              disabled={isTransitioning}
              className="mc-arrow left-4"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              type="button"
              aria-label="Next"
              onClick={() => {
                onUserInteract();
                go(1);
              }}
              disabled={isTransitioning}
              className="mc-arrow right-4"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Bottom compact sheet */}
        <div className="absolute inset-x-0 bottom-0 z-10">
          <div className="px-4 sm:px-6 lg:px-10 pb-5">
            <div className={reduceMotion ? "mc-sheet" : "mc-sheet mc-sheetEnter"}>
              <div className="flex flex-wrap items-center gap-2">
                {typeof current.rating === "number" && (
                  <div className="mc-pill">
                    <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                    <span className="text-white text-sm font-semibold">{current.rating.toFixed(1)}</span>
                  </div>
                )}
                {current.year && (
                  <div className="mc-pill">
                    <span className="text-white/90 text-sm font-medium">{current.year}</span>
                  </div>
                )}
                {current.genre && (
                  <div className="mc-pill">
                    <span className="text-white/90 text-sm font-medium">
                      {current.genre.split(",")[0].trim()}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-2 text-white font-extrabold tracking-[-0.03em] leading-[1.05] text-3xl sm:text-4xl">
                {current.title}
              </div>

              <button
                type="button"
                className="mc-cta mt-3"
                onClick={() => {
                  onUserInteract();
                  onMovieSelect(current);
                }}
              >
                <Play className="h-4 w-4" fill="currentColor" />
                View Details
              </button>
            </div>

            {/* Dots */}
            {total > 1 && (
              <div className="mt-3 flex justify-center">
                <div className="mc-dots">
                  {list.map((m, i) => {
                    const active = i === index;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => goTo(i)}
                        disabled={isTransitioning}
                        aria-label={`Go to slide ${i + 1}`}
                        aria-current={active ? "true" : "false"}
                        className="mc-dot"
                        style={{ width: active ? 26 : 7, opacity: active ? 1 : 0.55 }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <style>{`
          /* High-performance: animate transform + opacity. [web:606] */
          .mc-bgEnter{ will-change: transform, opacity; animation: mcBg 360ms cubic-bezier(0.16,1,0.3,1); }
          @keyframes mcBg{ from{ opacity:0; transform: scale(1.05);} to{ opacity:1; transform: scale(1.02);} }

          .mc-gradTop{
            background: radial-gradient(ellipse at 50% 18%, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0) 60%);
          }
          .mc-gradBottom{
            background: linear-gradient(180deg, rgba(0,0,0,0.00) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0.85) 100%);
          }

          .mc-arrow{
            position:absolute; top:50%; transform: translateY(-50%);
            z-index: 20;
            width: 48px; height: 48px;
            border-radius: 9999px;
            display:flex; align-items:center; justify-content:center;
            color: rgba(255,255,255,0.95);
            background: rgba(0,0,0,0.35);
            border: 1px solid rgba(255,255,255,0.18);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            transition: transform 160ms ease, background 160ms ease, opacity 160ms ease;
          }
          .mc-arrow:hover{ transform: translateY(-50%) scale(1.06); background: rgba(0,0,0,0.50); }
          .mc-arrow:active{ transform: translateY(-50%) scale(0.95); }
          .mc-arrow:disabled{ opacity: 0.45; }

          .mc-sheet{
            width: 100%;
            max-width: 720px;
            border-radius: 22px;
            padding: 14px 14px 12px;
            background: rgba(0,0,0,0.42);
            border: 1px solid rgba(255,255,255,0.14);
            box-shadow: 0 22px 64px rgba(0,0,0,0.60);
            backdrop-filter: blur(18px) saturate(140%);
            -webkit-backdrop-filter: blur(18px) saturate(140%);
          }
          .mc-sheetEnter{ will-change: transform, opacity; animation: mcSheet 280ms cubic-bezier(0.16,1,0.3,1); }
          @keyframes mcSheet{ from{ opacity:0; transform: translateY(10px);} to{ opacity:1; transform: translateY(0);} }

          .mc-pill{
            display:flex; align-items:center; gap:8px;
            padding: 7px 12px;
            border-radius: 9999px;
            background: rgba(255,255,255,0.10);
            border: 1px solid rgba(255,255,255,0.16);
          }

          .mc-cta{
            width: 100%;
            height: 46px;
            border-radius: 9999px;
            display:flex; align-items:center; justify-content:center; gap:10px;
            font-weight: 700;
            font-size: 15px;
            color: rgba(255,255,255,0.96);
            background: rgba(255,255,255,0.18);
            border: 1px solid rgba(255,255,255,0.26);
            transition: transform 160ms ease, background 160ms ease;
          }
          .mc-cta:hover{ transform: translateY(-1px); background: rgba(255,255,255,0.22); }
          .mc-cta:active{ transform: translateY(0) scale(0.98); }

          .mc-dots{
            display:flex; align-items:center; gap:10px;
            padding: 10px 16px;
            border-radius: 9999px;
            background: rgba(0,0,0,0.30);
            border: 1px solid rgba(255,255,255,0.12);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
          }
          .mc-dot{
            height: 7px;
            border-radius: 9999px;
            background: rgba(255,255,255,0.55);
            transition: width 220ms cubic-bezier(0.16,1,0.3,1), opacity 220ms ease;
            border: none;
            padding: 0;
          }
          .mc-dot:hover{ opacity: 1; }

          @media (min-width: 1024px){
            .mc-sheet{ max-width: 760px; }
            .mc-arrow{ width: 52px; height: 52px; }
          }
        `}</style>
      </div>
    </section>
  );
      }
