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

export function CinematicCarousel({
  movies,
  onMovieSelect,
  autoPlayInterval = 6500,
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

  const current = list[index];
  if (!current || total === 0) return null;

  const bgImage = current.backdropUrl || current.posterUrl;

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
    window.setTimeout(() => setIsTransitioning(false), 520);
  };

  const goTo = (i: number) => {
    if (i === index) return;
    onUserInteract();
    setIsTransitioning(true);
    setIndex(i);
    window.setTimeout(() => setIsTransitioning(false), 520);
  };

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

  return (
    <section
      className="relative w-full overflow-hidden bg-black"
      onMouseEnter={() => setPaused(true)}
      onTouchStart={onUserInteract}
      aria-roledescription="carousel"
      aria-label="Featured movies"
    >
      <div
        className="relative w-full"
        style={{
          height: "calc(100vh - 72px)",
          minHeight: isDesktop ? 760 : 680,
          maxHeight: 980,
        }}
      >
        {/* BACKDROP (hero) */}
        <img
          key={current.id}
          src={bgImage}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover ${
            reduceMotion ? "" : "kenburnsBack"
          }`}
          style={{ filter: "saturate(1.08) contrast(1.06)" }}
        />

        {/* Controlled cinematic grading */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% 18%, rgba(${dominant},0.28) 0%, rgba(${dominant},0.10) 40%, rgba(0,0,0,0) 72%)`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.18) 35%, rgba(0,0,0,0.94) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0) 38%, rgba(0,0,0,0.62) 100%)",
          }}
        />
        <div className="absolute inset-0 cinematic-grain opacity-[0.025]" />

        {/* ARROWS: fixed edges, above sheet, never overlap */}
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

        {/* BOTTOM SHEET + DOTS (planned spacing) */}
        <div className="absolute inset-x-0 bottom-0 z-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 pb-6">
            {/* Sheet */}
            <div className="infoSheet">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="badgePill">
                  <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                  <span className="text-white font-semibold text-sm">
                    {current.rating.toFixed(1)}
                  </span>
                </div>
                <div className="badgePill">
                  <span className="text-white/90 font-medium text-sm">
                    {current.year}
                  </span>
                </div>
                {current.genre && (
                  <div className="badgePill">
                    <span className="text-white/90 font-medium text-sm">
                      {current.genre.split(",")[0].trim()}
                    </span>
                  </div>
                )}
              </div>

              <h1 className="mt-3 text-white font-extrabold tracking-[-0.03em] leading-[1.05] text-4xl sm:text-5xl lg:text-6xl">
                {current.title}
              </h1>

              {isDesktop && current.overview && (
                <p className="mt-3 text-white/72 text-base sm:text-lg leading-relaxed max-w-2xl line-clamp-2">
                  {current.overview}
                </p>
              )}

              {/* CTA hierarchy: View Details glass = primary; Play Now = secondary */}
              <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:max-w-md">
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

                <button
                  type="button"
                  onClick={() => {
                    onUserInteract();
                    onMovieSelect(current);
                  }}
                  className="ctaSecondary"
                >
                  Play Now
                </button>
              </div>
            </div>

            {/* Dots BELOW sheet (never overlap) */}
            {total > 1 && (
              <div className="mt-4 flex justify-center">
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
                          width: active ? 26 : 6,
                          height: 6,
                          borderRadius: 9999,
                          background: active
                            ? `rgba(${dominant},0.95)`
                            : "rgba(255,255,255,0.30)",
                          transition: "all 380ms ease",
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
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 30;
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
          transition: transform 220ms ease, background 220ms ease;
        }
        .navArrow:hover{ transform: translateY(-50%) scale(1.06); background: rgba(255,255,255,0.20); }
        .navArrow:active{ transform: translateY(-50%) scale(0.96); }

        .infoSheet{
          width: 100%;
          border-radius: 22px;
          padding: 18px 18px 16px;
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.14);
          box-shadow: 0 24px 70px rgba(0,0,0,0.55);
          -webkit-backdrop-filter: blur(18px) saturate(140%);
          backdrop-filter: blur(18px) saturate(140%);
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

        /* PRIMARY (glass): most emphasis */
        .ctaGlassPrimary{
          height: 48px;
          width: 100%;
          border-radius: 9999px;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:10px;
          font-weight: 700;
          font-size: 15px;
          color: rgba(255,255,255,0.95);
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.28);
          -webkit-backdrop-filter: blur(18px) saturate(170%);
          backdrop-filter: blur(18px) saturate(170%);
          box-shadow: 0 18px 46px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.24);
          transition: transform 220ms ease, background 220ms ease;
        }
        .ctaGlassPrimary:hover{ transform: translateY(-1px); background: rgba(255,255,255,0.22); }
        .ctaGlassPrimary:active{ transform: translateY(0px); }

        /* SECONDARY (quiet): outline/ghost */
        .ctaSecondary{
          height: 48px;
          width: 100%;
          border-radius: 9999px;
          font-weight: 600;
          font-size: 15px;
          color: rgba(255,255,255,0.78);
          background: rgba(0,0,0,0.10);
          border: 1px solid rgba(255,255,255,0.14);
          -webkit-backdrop-filter: blur(10px);
          backdrop-filter: blur(10px);
          transition: transform 220ms ease, background 220ms ease, color 220ms ease;
        }
        .ctaSecondary:hover{ transform: translateY(-1px); background: rgba(255,255,255,0.10); color: rgba(255,255,255,0.88); }
        .ctaSecondary:active{ transform: translateY(0px); }

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

        @media (prefers-reduced-motion: no-preference){
          .kenburnsBack{ animation: kenback 12s ease-out infinite alternate; }
          @keyframes kenback{ from{ transform: scale(1.03); } to{ transform: scale(1.055); } }
        }
        @media (prefers-reduced-motion: reduce){
          .kenburnsBack{ animation: none !important; }
        }
      `}</style>
    </section>
  );
      }
