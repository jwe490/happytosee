import { useEffect, useMemo, useRef, useState } from "react";
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
  movies: Movie[];
  onMovieSelect: (movie: Movie) => void;
  autoPlayInterval?: number;
}

/** Upgrade only valid TMDB image URLs (base + /t/p/ + size + path). [web:143] */
function tmdbUpgrade(url: string | undefined, size: "w1280" | "original") {
  if (!url) return "";
  const m = url.match(/^(https?://image.tmdb.org/t/p/)(wd+|original)(/.+)$/);
  if (!m) return url;
  return `${m[1]}${size}${m[3]}`;
}

export function CinematicCarousel({ movies, onMovieSelect, autoPlayInterval = 4800 }: CinematicCarouselProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const list = useMemo(() => (movies ?? []).filter(Boolean), [movies]);
  const total = list.length;

  const [index, setIndex] = useState(0);
  const [dominant, setDominant] = useState("59,130,246");
  const [paused, setPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const interacted = useRef(false);
  const current = list[index];

  // Swipe
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const swiping = useRef(false);

  // Hooks first (avoid “rendered fewer hooks” issues). [web:255]
  useEffect(() => {
    if (!current?.posterUrl) return;
    extractDominantColor(current.posterUrl)
      .then((c) => setDominant(c))
      .catch(() => setDominant("59,130,246"));
  }, [current?.posterUrl]);

  const onUserInteract = () => {
    interacted.current = true;
    setPaused(true);
  };

  const go = (dir: 1 | -1) => {
    if (total <= 1) return;
    if (isTransitioning) return;
    setIsTransitioning(true);
    setIndex((p) => (p + dir + total) % total);
    window.setTimeout(() => setIsTransitioning(false), 320); // snappier
  };

  const goTo = (i: number) => {
    if (i === index) return;
    onUserInteract();
    setIsTransitioning(true);
    setIndex(i);
    window.setTimeout(() => setIsTransitioning(false), 320);
  };

  // Autoplay
  useEffect(() => {
    if (reduceMotion) return;
    if (total <= 1) return;
    if (paused) return;

    const t = window.setInterval(() => {
      if (interacted.current) return;
      go(1);
    }, autoPlayInterval);

    return () => window.clearInterval(t);
  }, [autoPlayInterval, paused, reduceMotion, total]);

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
  }, [isTransitioning, total]);

  // Swipe handlers
  const SWIPE_X = 45;
  const SWIPE_Y = 90;

  const onPointerDown = (e: React.PointerEvent) => {
    onUserInteract();
    startX.current = e.clientX;
    startY.current = e.clientY;
    swiping.current = true;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!swiping.current || startX.current == null || startY.current == null) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    if (Math.abs(dy) > SWIPE_Y && Math.abs(dy) > Math.abs(dx)) swiping.current = false;
  };

  const onPointerUp = (e: React.PointerEvent) => {
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
  };

  if (!current || total === 0) return null;

  const rawBg = current.backdropUrl || current.posterUrl;
  const bgImage = tmdbUpgrade(rawBg, "w1280"); // safe HQ upgrade [web:143]

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
            className={`absolute inset-0 w-full h-full object-cover ${reduceMotion ? "" : "bgCineSnap"}`}
            style={{
              // brighter + cleaner “cinematic” grading
              filter: "saturate(1.20) contrast(1.10) brightness(1.14)",
              transform: "scale(1.03)",
            }}
            loading="eager"
            decoding="async"
          />

          {/* Lighter overlays (less dark) */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at 55% 18%, rgba(${dominant},0.22) 0%, rgba(${dominant},0.07) 44%, rgba(0,0,0,0) 76%)`,
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.14)_0%,rgba(0,0,0,0.08)_40%,rgba(0,0,0,0.70)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_46%,rgba(0,0,0,0.34)_100%)]" />
          <div className="absolute inset-0 cinematic-grain opacity-[0.016]" />
        </div>

        {/* Click hero = View Details */}
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
              className="navArrow left-4 sm:left-6 top-[45%] -translate-y-1/2 disabled:opacity-40"
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
              className="navArrow right-4 sm:right-6 top-[45%] -translate-y-1/2 disabled:opacity-40"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Bottom overlay */}
        <div className="absolute inset-x-0 bottom-0 z-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 pb-6">
            {/* Wider on desktop + shorter overall height */}
            <div key={`sheet-${current.id}`} className="infoSheetFixed max-w-[980px] lg:max-w-[1160px]">
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

              {/* On desktop show overview, on mobile hide (keeps box short) */}
              <div className="overviewSlot">
                {isDesktop && current.overview ? <p className="overviewClamp">{current.overview}</p> : <div />}
              </div>

              {/* Single button */}
              <div className="ctaRowOne">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUserInteract();
                    onMovieSelect(current);
                  }}
                  className="ctaGlassPrimary"
                >
                  <Play className="h-4 w-4" fill="currentColor" />
                  View Details
                </button>
              </div>
            </div>

            {/* Dots */}
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
          position: absolute; z-index: 30;
          width: 54px; height: 54px; border-radius: 9999px;
          display:flex; align-items:center; justify-content:center;
          color: rgba(255,255,255,0.92);
          background: rgba(255,255,255,0.14);
          border: 1px solid rgba(255,255,255,0.20);
          box-shadow: 0 14px 34px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.20);
          -webkit-backdrop-filter: blur(18px) saturate(140%);
          backdrop-filter: blur(18px) saturate(140%);
          transition: transform 140ms ease, background 140ms ease;
        }
        .navArrow:hover{ transform: translateY(-50%) scale(1.06); background: rgba(255,255,255,0.20); }
        .navArrow:active{ transform: translateY(-50%) scale(0.99); }

        /* Shorter box now (since only 1 button) */
        .infoSheetFixed{
          width: 100%;
          height: 230px;
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
          padding: 8px 12px;
          border-radius: 9999px;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.16);
          -webkit-backdrop-filter: blur(14px) saturate(140%);
          backdrop-filter: blur(14px) saturate(140%);
        }

        .titleClamp{
          margin-top: 6px;
          color: #fff;
          font-weight: 850;
          letter-spacing: -0.03em;
          line-height: 1.05;
          font-size: clamp(30px, 3.8vw, 60px);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .overviewSlot{ height: 46px; margin-top: 4px; }
        .overviewClamp{
          color: rgba(255,255,255,0.78);
          font-size: 16px;
          line-height: 1.55;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .ctaRowOne{ display:grid; grid-template-columns: 1fr; gap: 12px; margin-top: 8px; }

        .ctaGlassPrimary{
          height: 48px;
          width: 100%;
          border-radius: 9999px;
          display:flex; align-items:center; justify-content:center; gap:10px;
          font-weight: 750;
          font-size: 15px;
          color: rgba(255,255,255,0.96);
          background: rgba(255,255,255,0.20);
          border: 1px solid rgba(255,255,255,0.28);
          -webkit-backdrop-filter: blur(18px) saturate(170%);
          backdrop-filter: blur(18px) saturate(170%);
          box-shadow: 0 18px 46px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.22);
          transition: transform 140ms ease, background 140ms ease;
        }
        .ctaGlassPrimary:hover{ transform: translateY(-1px); background: rgba(255,255,255,0.24); }
        .ctaGlassPrimary:active{ transform: translateY(0px); }

        .dotsBar{
          display:flex; align-items:center; gap: 10px;
          padding: 10px 18px;
          border-radius: 9999px;
          background: rgba(0,0,0,0.22);
          border: 1px solid rgba(255,255,255,0.10);
          -webkit-backdrop-filter: blur(14px);
          backdrop-filter: blur(14px);
        }

        /* Snappy cinematic */
        @media (prefers-reduced-motion: no-preference){
          .bgCineSnap{ animation: bgEnterSnap 320ms cubic-bezier(0.2,0.9,0.2,1); }
          @keyframes bgEnterSnap{
            from{ opacity: 0; transform: scale(1.055); filter: blur(2px) saturate(1.20) contrast(1.10) brightness(1.14); }
            to{ opacity: 1; transform: scale(1.03); filter: blur(0px) saturate(1.20) contrast(1.10) brightness(1.14); }
          }
          .infoSheetFixed{ animation: sheetInSnap 260ms cubic-bezier(0.2,0.9,0.2,1); }
          @keyframes sheetInSnap{ from{ opacity: 0; transform: translateY(10px); } to{ opacity: 1; transform: translateY(0); } }
        }

        @media (max-width: 640px){
          .infoSheetFixed{ height: 225px; max-width: 760px; }
          .overviewSlot{ display: none; }
        }

        /* Desktop fills empty space: wider + a bit taller for presence */
        @media (min-width: 1024px){
          .infoSheetFixed{ height: 260px; padding: 18px 18px 16px; }
          .overviewSlot{ height: 52px; }
        }
      `}</style>
    </section>
  );
}
