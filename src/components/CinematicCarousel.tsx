import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star, Play } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-mobile";
import { extractDominantColor } from "@/utils/colorExtractor";

interface Movie {
  id: number;
  title: string;
  overview?: string;
  posterUrl: string;
  backdropUrl?: string;
  rating: number;
  year: number;
  genre?: string;
}

interface CinematicCarouselProps {
  movies?: Movie[];
  onMovieSelect: (movie: Movie) => void;
  autoPlayInterval?: number;
}

export function CinematicCarousel({
  movies = [],
  onMovieSelect,
  autoPlayInterval = 5200,
}: CinematicCarouselProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const list = useMemo(() => (movies ?? []).filter(Boolean), [movies]);
  const total = list.length;

  const [index, setIndex] = useState(0);
  const [dominant, setDominant] = useState("59,130,246");
  const [paused, setPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const interacted = useRef(false);
  const transitionTimer = useRef<number | null>(null);

  // Swipe refs
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const swiping = useRef(false);

  const current = total > 0 ? list[Math.min(index, total - 1)] : undefined;

  // Keep index valid when list changes
  useEffect(() => {
    if (total === 0) return;
    if (index > total - 1) setIndex(0);
  }, [index, total]);

  // Dominant color (safe)
  useEffect(() => {
    if (!current?.posterUrl) return;
    extractDominantColor(current.posterUrl)
      .then((c) => setDominant(c))
      .catch(() => setDominant("59,130,246"));
  }, [current?.posterUrl]);

  const onUserInteract = useCallback(() => {
    interacted.current = true;
    setPaused(true);
  }, []);

  const clearTransitionTimer = useCallback(() => {
    if (transitionTimer.current != null) {
      window.clearTimeout(transitionTimer.current);
      transitionTimer.current = null;
    }
  }, []);

  useEffect(() => clearTransitionTimer, [clearTransitionTimer]); // cleanup on unmount [web:490]

  const go = useCallback(
    (dir: 1 | -1) => {
      if (total <= 1) return;
      if (isTransitioning) return;

      clearTransitionTimer();
      setIsTransitioning(true);

      setIndex((p) => (p + dir + total) % total);

      transitionTimer.current = window.setTimeout(() => {
        setIsTransitioning(false);
        transitionTimer.current = null;
      }, 360);
    },
    [clearTransitionTimer, isTransitioning, total],
  );

  const goTo = useCallback(
    (i: number) => {
      if (total <= 1) return;
      if (i === index) return;

      onUserInteract();
      clearTransitionTimer();
      setIsTransitioning(true);
      setIndex(i);

      transitionTimer.current = window.setTimeout(() => {
        setIsTransitioning(false);
        transitionTimer.current = null;
      }, 360);
    },
    [clearTransitionTimer, index, onUserInteract, total],
  );

  // Autoplay (stops after interaction)
  useEffect(() => {
    if (reduceMotion) return;
    if (total <= 1) return;
    if (paused) return;

    const t = window.setInterval(() => {
      if (interacted.current) return;
      go(1);
    }, autoPlayInterval);

    return () => window.clearInterval(t);
  }, [autoPlayInterval, paused, reduceMotion, total, go]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        onUserInteract();
        go(-1);
      }
      if (e.key === "ArrowRight") {
        onUserInteract();
        go(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onUserInteract]);

  // Swipe handlers
  const SWIPE_X = 45;
  const SWIPE_Y = 90;

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      onUserInteract();
      startX.current = e.clientX;
      startY.current = e.clientY;
      swiping.current = true;
    },
    [onUserInteract],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!swiping.current || startX.current == null || startY.current == null) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    if (Math.abs(dy) > SWIPE_Y && Math.abs(dy) > Math.abs(dx)) swiping.current = false;
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!swiping.current || startX.current == null || startY.current == null) return;

      const dx = e.clientX - startX.current;
      const dy = e.clientY - startY.current;

      swiping.current = false;
      startX.current = null;
      startY.current = null;

      if (Math.abs(dy) > SWIPE_Y) return;
      if (Math.abs(dx) < SWIPE_X) return;

      if (dx < 0) go(1);
      else go(-1);
    },
    [go],
  );

  // Render safe placeholder when no movies (prevents WSOD)
  if (!current) {
    return (
      <section className="relative w-full overflow-hidden bg-black">
        <div
          className="relative w-full flex items-center justify-center"
          style={{ height: "calc(100vh - 72px)", minHeight: isDesktop ? 760 : 690, maxHeight: 980 }}
        >
          <div className="text-white/70 text-sm">Loading featured movies…</div>
        </div>
      </section>
    );
  }

  const bgImage = current.backdropUrl || current.posterUrl;

  return (
    <section
      className="relative w-full overflow-hidden bg-black"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onUserInteract}
      aria-roledescription="carousel"
      aria-label="Featured movies"
    >
      <div
        className="relative w-full"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ height: "calc(100vh - 72px)", minHeight: isDesktop ? 760 : 690, maxHeight: 980 }}
      >
        {/* BACKDROP */}
        <div className="absolute inset-0">
          <img
            key={current.id}
            src={bgImage}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover ${reduceMotion ? "" : "bgCine"}`}
            style={{
              filter: "saturate(1.10) contrast(1.06) brightness(1.08)",
              transform: "scale(1.03)",
            }}
            decoding="async"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at 55% 18%, rgba(${dominant},0.22) 0%, rgba(${dominant},0.07) 44%, rgba(0,0,0,0) 78%)`,
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.06)_40%,rgba(0,0,0,0.68)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_50%,rgba(0,0,0,0.30)_100%)]" />
          <div className="absolute inset-0 cinematic-grain opacity-[0.015]" />
        </div>

        {/* Hero click (behind controls) */}
        <button
          type="button"
          onClick={() => {
            onUserInteract();
            onMovieSelect(current);
          }}
          className="absolute inset-0 z-10 cursor-pointer"
          aria-label={`View details for ${current.title}`}
        >
          <span className="sr-only">View details</span>
        </button>

        {/* Arrows */}
        {total > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous"
              onClick={(e) => {
                e.stopPropagation();
                onUserInteract();
                go(-1);
              }}
              disabled={isTransitioning}
              className="navArrow left-4 sm:left-6 top-[45%] -translate-y-1/2 z-30 disabled:opacity-40"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              type="button"
              aria-label="Next"
              onClick={(e) => {
                e.stopPropagation();
                onUserInteract();
                go(1);
              }}
              disabled={isTransitioning}
              className="navArrow right-4 sm:right-6 top-[45%] -translate-y-1/2 z-30 disabled:opacity-40"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Bottom overlay */}
        <div className="absolute inset-x-0 bottom-0 z-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 pb-6">
            <div key={`sheet-${current.id}`} className="infoSheetFixed w-full lg:w-[min(1100px,100%)]">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="badgePill">
                  <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                  <span className="text-white font-semibold text-sm">{current.rating.toFixed(1)}</span>
                </div>
                <div className="badgePill">
                  <span className="text-white/90 font-medium text-sm">{current.year}</span>
                </div>
                {current.genre && (
                  <div className="badgePill">
                    <span className="text-white/90 font-medium text-sm">{current.genre.split(",")[0].trim()}</span>
                  </div>
                )}
              </div>

              <h1 className="titleClamp">{current.title}</h1>

              <div className="overviewSlot">
                {isDesktop && current.overview ? <p className="overviewClamp">{current.overview}</p> : <div />}
              </div>

              <div className="ctaRowOne">
                <button
                  type="button"
                  className="ctaGlassPrimary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUserInteract();
                    onMovieSelect(current);
                  }}
                >
                  <Play className="h-4 w-4" fill="currentColor" />
                  View Details
                </button>
              </div>
            </div>

            {total > 1 && (
              <div className="mt-4 flex justify-center">
                <div className="dotsBar">
                  {list.map((m, i) => {
                    const active = i === index;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          goTo(i);
                        }}
                        disabled={isTransitioning}
                        aria-label={`Go to slide ${i + 1} of ${total}`}
                        aria-current={active ? "true" : "false"}
                        style={{
                          width: active ? 28 : 7,
                          height: 7,
                          borderRadius: 9999,
                          background: active ? `rgba(${dominant},0.95)` : "rgba(255,255,255,0.28)",
                          transition: "all 200ms ease",
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .cinematic-grain{
          background-image: radial-gradient(rgba(0,0,0,0.7) 1px, transparent 1px);
          background-size: 3px 3px;
          mix-blend-mode: overlay;
          pointer-events: none;
        }
        .navArrow{
          position:absolute;
          width:54px; height:54px; border-radius:9999px;
          display:flex; align-items:center; justify-content:center;
          color:rgba(255,255,255,0.92);
          background:rgba(255,255,255,0.14);
          border:1px solid rgba(255,255,255,0.20);
          box-shadow:0 14px 34px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.20);
          -webkit-backdrop-filter: blur(18px) saturate(140%);
          backdrop-filter: blur(18px) saturate(140%);
          transition: transform 140ms ease, background 140ms ease;
        }
        .infoSheetFixed{
          height: 215px;
          border-radius: 22px;
          padding: 16px 16px 14px;
          background: rgba(0,0,0,0.28);
          border: 1px solid rgba(255,255,255,0.14);
          box-shadow: 0 24px 70px rgba(0,0,0,0.50);
          -webkit-backdrop-filter: blur(18px) saturate(140%);
          backdrop-filter: blur(18px) saturate(140%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .badgePill{
          display:flex; align-items:center; gap:8px;
          padding:8px 12px;
          border-radius:9999px;
          background:rgba(255,255,255,0.10);
          border:1px solid rgba(255,255,255,0.16);
          -webkit-backdrop-filter: blur(14px) saturate(140%);
          backdrop-filter: blur(14px) saturate(140%);
        }
        .titleClamp{
          margin-top: 6px;
          color:#fff;
          font-weight:850;
          letter-spacing:-0.03em;
          line-height:1.05;
          font-size:clamp(30px, 3.8vw, 60px);
          display:-webkit-box;
          -webkit-line-clamp:2;
          -webkit-box-orient:vertical;
          overflow:hidden;
        }
        .overviewSlot{ height: 36px; margin-top: 4px; }
        .overviewClamp{
          color: rgba(255,255,255,0.78);
          font-size: 15px;
          line-height: 1.5;
          display:-webkit-box;
          -webkit-line-clamp:2;
          -webkit-box-orient:vertical;
          overflow:hidden;
        }
        .ctaRowOne{ display:grid; grid-template-columns:1fr; gap:12px; margin-top: 8px; }
        .ctaGlassPrimary{
          height:48px;
          width:100%;
          border-radius:9999px;
          display:flex; align-items:center; justify-content:center; gap:10px;
          font-weight:750;
          font-size:15px;
          color:rgba(255,255,255,0.96);
          background:rgba(255,255,255,0.20);
          border:1px solid rgba(255,255,255,0.28);
          -webkit-backdrop-filter: blur(18px) saturate(170%);
          backdrop-filter: blur(18px) saturate(170%);
          box-shadow:0 18px 46px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.22);
          transition: transform 140ms ease, background 140ms ease;
        }
        .dotsBar{
          display:flex; align-items:center; gap:10px;
          padding:10px 18px;
          border-radius:9999px;
          background:rgba(0,0,0,0.22);
          border:1px solid rgba(255,255,255,0.10);
          -webkit-backdrop-filter: blur(14px);
          backdrop-filter: blur(14px);
        }
        @media (prefers-reduced-motion: no-preference){
          .bgCine{
            will-change: transform, opacity;
            animation: bgEnter 420ms cubic-bezier(0.2,0.9,0.2,1);
          }
          @keyframes bgEnter{
            from{ opacity:0; transform: scale(1.055); filter: blur(2px) saturate(1.10) contrast(1.06) brightness(1.08); }
            to{ opacity:1; transform: scale(1.03); filter: blur(0px) saturate(1.10) contrast(1.06) brightness(1.08); }
          }
        }
        @media (max-width: 640px){
          .overviewSlot{ display:none; }
          .infoSheetFixed{ height: 210px; }
        }
      `}</style>
    </section>
  );
      }
