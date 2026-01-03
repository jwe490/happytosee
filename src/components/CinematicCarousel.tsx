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
  const transTimer = useRef<number | null>(null);

  const current = total > 0 ? list[Math.min(index, total - 1)] : undefined;

  // keep index valid if movies change
  useEffect(() => {
    if (total === 0) return;
    if (index > total - 1) setIndex(0);
  }, [index, total]);

  // dominant color
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

  const clearTransTimer = useCallback(() => {
    if (transTimer.current != null) {
      window.clearTimeout(transTimer.current);
      transTimer.current = null;
    }
  }, []);

  useEffect(() => clearTransTimer, [clearTransTimer]);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (total <= 1) return;
      if (isTransitioning) return;

      clearTransTimer();
      setIsTransitioning(true);
      setIndex((p) => (p + dir + total) % total);

      transTimer.current = window.setTimeout(() => {
        setIsTransitioning(false);
        transTimer.current = null;
      }, 320); // snappy
    },
    [clearTransTimer, isTransitioning, total],
  );

  const goTo = useCallback(
    (i: number) => {
      if (total <= 1) return;
      if (i === index) return;

      onUserInteract();
      clearTransTimer();
      setIsTransitioning(true);
      setIndex(i);

      transTimer.current = window.setTimeout(() => {
        setIsTransitioning(false);
        transTimer.current = null;
      }, 320);
    },
    [clearTransTimer, index, onUserInteract, total],
  );

  // autoplay
  useEffect(() => {
    if (reduceMotion || total <= 1 || paused) return;

    const t = window.setInterval(() => {
      if (interacted.current) return;
      go(1);
    }, autoPlayInterval);

    return () => window.clearInterval(t);
  }, [autoPlayInterval, paused, reduceMotion, total, go]);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        onUserInteract();
        go(-1);
      } else if (e.key === "ArrowRight") {
        onUserInteract();
        go(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onUserInteract]);

  // Safe: render nothing if no movies
  if (!current) return null;

  const bgImage = current.backdropUrl || current.posterUrl;

  return (
    <section
      className="relative w-full bg-black"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onUserInteract}
      aria-roledescription="carousel"
      aria-label="Featured movies"
    >
      <div
        className="relative w-full overflow-hidden"
        style={{
          height: "calc(100vh - 72px)",
          minHeight: isDesktop ? 760 : 680,
          maxHeight: 980,
        }}
      >
        {/* BACKDROP */}
        <div className="absolute inset-0">
          <img
            key={current.id}
            src={bgImage}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover ${reduceMotion ? "" : "bgEnter"}`}
            decoding="async"
          />

          {/* grading */}
          <div
            className={`absolute inset-0 ${reduceMotion ? "" : "gradeEnter"}`}
            style={{
              background: `radial-gradient(ellipse at 50% 18%, rgba(${dominant},0.28) 0%, rgba(${dominant},0.10) 40%, rgba(0,0,0,0) 72%)`,
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18)_0%,rgba(0,0,0,0.12)_35%,rgba(0,0,0,0.92)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_40%,rgba(0,0,0,0.58)_100%)]" />
          <div className="absolute inset-0 cinematic-grain opacity-[0.02]" />
        </div>

        {/* Desktop poster to fill empty space */}
        <div className="hidden lg:block absolute right-16 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <div className="posterWrap">
            <div key={`poster-${current.id}`} className={reduceMotion ? "posterCard" : "posterCard posterEnter"}>
              <img src={current.posterUrl} alt={current.title} className="w-full h-full object-cover" />
              <div className="posterShine" />
            </div>
          </div>
        </div>

        {/* ARROWS */}
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
              className="navArrow left-4 sm:left-6"
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
              className="navArrow right-4 sm:right-6"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* BOTTOM SHEET + DOTS */}
        <div className="absolute inset-x-0 bottom-0 z-30">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 pb-6">
            <div key={`sheet-${current.id}`} className={reduceMotion ? "infoSheet" : "infoSheet sheetEnter"}>
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

              {/* On desktop, cap title width so poster area feels balanced */}
              <h1 className="titleCine lg:max-w-[58%]">{current.title}</h1>

              {isDesktop && current.overview && (
                <p className="overviewCine lg:max-w-[58%] line-clamp-2">{current.overview}</p>
              )}

              {/* Only ONE button now */}
              <div className="mt-4 sm:mt-4 lg:max-w-[420px]">
                <button
                  type="button"
                  onClick={() => {
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

            {total > 1 && (
              <div className="mt-3 flex justify-center">
                <div className="dotsBar">
                  {list.map((m, i) => {
                    const active = i === index;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => goTo(i)}
                        disabled={isTransitioning}
                        aria-label={`Go to slide ${i + 1} of ${total}`}
                        aria-current={active ? "true" : "false"}
                        style={{
                          width: active ? 28 : 7,
                          height: 7,
                          borderRadius: 9999,
                          background: active ? `rgba(${dominant},0.95)` : "rgba(255,255,255,0.28)",
                          transition: "all 220ms cubic-bezier(0.2,0.9,0.2,1)",
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
        /* Performance: animate transform/opacity (smooth), avoid heavy animating filters. [web:606] */
        .bgEnter{
          will-change: transform, opacity;
          animation: bgEnter 360ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes bgEnter{
          from{ opacity:0; transform: scale(1.055); }
          to{ opacity:1; transform: scale(1.03); }
        }

        .gradeEnter{
          will-change: opacity;
          animation: fadeFast 260ms ease-out;
        }
        @keyframes fadeFast{ from{opacity:0;} to{opacity:1;} }

        .posterWrap{ width: 360px; height: 540px; }
        .posterCard{
          position: relative;
          width: 100%; height: 100%;
          border-radius: 22px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.14);
          box-shadow: 0 70px 160px rgba(0,0,0,0.85), 0 30px 80px rgba(0,0,0,0.60);
        }
        .posterEnter{
          will-change: transform, opacity;
          animation: posterEnter 420ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes posterEnter{
          from{ opacity:0; transform: translateX(24px) scale(0.96); }
          to{ opacity:1; transform: translateX(0) scale(1); }
        }
        .posterShine{
          position:absolute; inset:0; pointer-events:none;
          opacity:0.35;
          background: linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.16) 50%, rgba(255,255,255,0.06) 55%, transparent 100%);
          transform: translateX(-60%) translateY(-60%);
          animation: shine 3.2s ease-in-out infinite;
        }
        @keyframes shine{
          0%,100%{ transform: translateX(-70%) translateY(-70%); }
          50%{ transform: translateX(70%) translateY(70%); }
        }

        .cinematic-grain{
          background-image: radial-gradient(rgba(0,0,0,0.7) 1px, transparent 1px);
          background-size: 3px 3px;
          mix-blend-mode: overlay;
          pointer-events: none;
        }

        .navArrow{
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 40;
          width: 54px;
          height: 54px;
          border-radius: 9999px;
          display:flex;
          align-items:center;
          justify-content:center;
          color: rgba(255,255,255,0.92);
          background: rgba(255,255,255,0.14);
          border: 1px solid rgba(255,255,255,0.20);
          box-shadow: 0 14px 34px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.20);
          -webkit-backdrop-filter: blur(18px) saturate(140%);
          backdrop-filter: blur(18px) saturate(140%);
          transition: transform 160ms ease, background 160ms ease, opacity 160ms ease;
        }
        .navArrow:hover{ transform: translateY(-50%) scale(1.06); background: rgba(255,255,255,0.20); }
        .navArrow:active{ transform: translateY(-50%) scale(0.96); }
        .navArrow:disabled{ opacity:0.45; }

        /* SHORTER sheet (one CTA) */
        .infoSheet{
          width: 100%;
          border-radius: 22px;
          padding: 14px 16px 14px;
          background: rgba(0,0,0,0.34);
          border: 1px solid rgba(255,255,255,0.14);
          box-shadow: 0 22px 64px rgba(0,0,0,0.55);
          -webkit-backdrop-filter: blur(18px) saturate(140%);
          backdrop-filter: blur(18px) saturate(140%);
        }
        .sheetEnter{
          will-change: transform, opacity;
          animation: sheetEnter 320ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes sheetEnter{
          from{ opacity:0; transform: translateY(10px); }
          to{ opacity:1; transform: translateY(0); }
        }

        .badgePill{
          display:flex;
          align-items:center;
          gap:8px;
          padding: 8px 12px;
          border-radius: 9999px;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.16);
          -webkit-backdrop-filter: blur(14px) saturate(140%);
          backdrop-filter: blur(14px) saturate(140%);
        }

        .titleCine{
          margin-top: 10px;
          color:#fff;
          font-weight: 900;
          letter-spacing: -0.03em;
          line-height: 1.04;
          font-size: clamp(30px, 4.0vw, 60px);
          text-shadow: 0 8px 26px rgba(0,0,0,0.55);
        }
        .overviewCine{
          margin-top: 10px;
          color: rgba(255,255,255,0.76);
          font-size: 15px;
          line-height: 1.55;
        }

        .ctaGlassPrimary{
          height: 48px;
          width: 100%;
          border-radius: 9999px;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:10px;
          font-weight: 750;
          font-size: 15px;
          color: rgba(255,255,255,0.95);
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.28);
          -webkit-backdrop-filter: blur(18px) saturate(170%);
          backdrop-filter: blur(18px) saturate(170%);
          box-shadow: 0 16px 40px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.24);
          transition: transform 160ms ease, background 160ms ease;
        }
        .ctaGlassPrimary:hover{ transform: translateY(-1px); background: rgba(255,255,255,0.22); }
        .ctaGlassPrimary:active{ transform: translateY(0px) scale(0.98); }

        .dotsBar{
          display:flex;
          align-items:center;
          gap: 10px;
          padding: 10px 18px;
          border-radius: 9999px;
          background: rgba(0,0,0,0.28);
          border: 1px solid rgba(255,255,255,0.12);
          -webkit-backdrop-filter: blur(14px);
          backdrop-filter: blur(14px);
        }

        @media (max-width: 640px){
          .infoSheet{ padding: 14px 14px 14px; }
          .overviewCine{ display: none; }
        }
      `}</style>
    </section>
  );
}
