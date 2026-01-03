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
  autoPlayInterval = 6000,
}: CinematicCarouselProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const [index, setIndex] = useState(0);
  const [dominant, setDominant] = useState("59, 130, 246"); // fallback blue
  const [paused, setPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const interactingRef = useRef(false);
  const current = movies?.[index];

  const safeMovies = useMemo(() => (movies ?? []).filter(Boolean), [movies]);
  const total = safeMovies.length;

  useEffect(() => {
    if (!current?.posterUrl) return;
    extractDominantColor(current.posterUrl)
      .then((c) => setDominant(c))
      .catch(() => setDominant("59, 130, 246"));
  }, [current?.posterUrl]);

  // Autoplay: pause on any interaction + respect reduced motion
  useEffect(() => {
    if (reduceMotion) return;
    if (total <= 1) return;
    if (paused) return;

    const t = window.setInterval(() => {
      if (interactingRef.current) return;
      go(1);
    }, autoPlayInterval);

    return () => window.clearInterval(t);
  }, [autoPlayInterval, paused, reduceMotion, total]);

  const go = (dir: 1 | -1) => {
    if (total <= 1) return;
    if (isTransitioning) return;
    setIsTransitioning(true);
    setIndex((prev) => (prev + dir + total) % total);
    window.setTimeout(() => setIsTransitioning(false), 650);
  };

  const goTo = (i: number) => {
    if (i === index) return;
    if (isTransitioning) return;
    setIsTransitioning(true);
    setIndex(i);
    window.setTimeout(() => setIsTransitioning(false), 650);
  };

  const onUserInteract = () => {
    interactingRef.current = true;
    setPaused(true); // permanently pause after interaction (your requirement)
  };

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
  }, [total, isTransitioning]);

  if (!current || total === 0) return null;

  // helpers for desktop preview cards
  const prevIdx = (index - 1 + total) % total;
  const nextIdx = (index + 1) % total;

  return (
    <section
      className="relative w-full bg-[#FAFAFA] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onTouchStart={onUserInteract}
      aria-roledescription="carousel"
      aria-label="Featured movies"
    >
      {/* Ambient cinematic backdrop (blurred active backdrop/poster) */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background: `radial-gradient(ellipse at 50% 20%, rgba(${dominant},0.18) 0%, rgba(${dominant},0.08) 35%, rgba(250,250,250,1) 100%)`,
          }}
        />
        <img
          key={current.id}
          src={current.backdropUrl || current.posterUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            filter: "blur(80px) brightness(0.45) saturate(1.2)",
            transform: "scale(1.08)",
          }}
        />
        {/* vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.10) 100%)",
          }}
        />
        {/* subtle grain */}
        <div className="absolute inset-0 cinematic-grain opacity-[0.03]" />
      </div>

      {/* Layout wrapper */}
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
        {/* Carousel stage */}
        <div className="relative mx-auto h-[520px] lg:h-[620px] flex items-center justify-center">
          {/* Arrows (always visible) */}
          <button
            type="button"
            onClick={() => {
              onUserInteract();
              go(-1);
            }}
            disabled={isTransitioning}
            className="glass-arrow absolute left-2 sm:left-4 lg:left-6 top-1/2 -translate-y-1/2 z-20 disabled:opacity-50"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={() => {
              onUserInteract();
              go(1);
            }}
            disabled={isTransitioning}
            className="glass-arrow absolute right-2 sm:right-4 lg:right-6 top-1/2 -translate-y-1/2 z-20 disabled:opacity-50"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Desktop side previews (subtle) */}
          {isDesktop && total > 1 && (
            <>
              <PosterPreview
                movie={safeMovies[prevIdx]}
                side="left"
                dominant={dominant}
              />
              <PosterPreview
                movie={safeMovies[nextIdx]}
                side="right"
                dominant={dominant}
              />
            </>
          )}

          {/* Active card */}
          <div className="relative z-10 w-[300px] h-[460px] sm:w-[340px] sm:h-[520px] lg:w-[360px] lg:h-[540px] rounded-[20px] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            {/* Poster */}
            <img
              key={current.id}
              src={current.posterUrl}
              alt={current.title}
              className={`absolute inset-0 w-full h-full object-cover ${
                reduceMotion ? "" : "kenburns"
              }`}
              draggable={false}
              onPointerDown={onUserInteract}
            />

            {/* cinematic bottom gradient */}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.10)_35%,rgba(0,0,0,0.92)_100%)]" />

            {/* subtle glass border */}
            <div className="absolute inset-0 pointer-events-none border border-white/25" />

            {/* Badges (glass) */}
            <div className="absolute top-5 left-5 z-10 flex flex-col gap-2">
              <div className="badge-glass flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                <span className="text-white font-semibold text-sm">
                  {current.rating.toFixed(1)}
                </span>
              </div>
              <div className="badge-glass">
                <span className="text-white/90 font-medium text-sm">
                  {current.year}
                </span>
              </div>
              {current.genre && (
                <div className="badge-glass">
                  <span className="text-white/90 font-medium text-sm">
                    {current.genre.split(",")[0].trim()}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom content */}
            <div className="absolute bottom-0 left-0 right-0 z-10 p-5 sm:p-6">
              <h3 className="text-white font-extrabold text-[22px] sm:text-[24px] leading-[1.15] tracking-[-0.01em] drop-shadow-[0_6px_18px_rgba(0,0,0,0.65)]">
                {current.title}
              </h3>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => {
                    onUserInteract();
                    onMovieSelect(current);
                  }}
                  className="glass-cta w-full h-12 rounded-full flex items-center justify-center gap-2 text-[15px] font-semibold text-slate-900"
                  aria-label={`View details for ${current.title}`}
                >
                  <Play className="h-4 w-4" fill="currentColor" />
                  View Details
                </button>
              </div>
            </div>

            {/* Ambient glow under active card */}
            <div
              className="pointer-events-none absolute -bottom-10 left-[10%] right-[10%] h-24 blur-[48px] opacity-70"
              style={{
                background: `radial-gradient(ellipse, rgba(${dominant},0.35) 0%, rgba(${dominant},0.10) 45%, transparent 70%)`,
              }}
            />
          </div>
        </div>

        {/* Dots (outside carousel, on page surface) */}
        {total > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="dots-surface flex items-center gap-2.5 px-4 py-2 rounded-full">
              {safeMovies.map((m, i) => {
                const active = i === index;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      onUserInteract();
                      goTo(i);
                    }}
                    disabled={isTransitioning}
                    aria-label={`Go to slide ${i + 1} of ${total}`}
                    aria-current={active ? "true" : "false"}
                    className="disabled:opacity-50"
                    style={{
                      width: active ? 22 : 6,
                      height: 6,
                      borderRadius: 9999,
                      background: active
                        ? `rgba(${dominant},0.95)`
                        : "rgba(148,163,184,0.65)",
                      transition: "all 400ms ease",
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* component styles (scoped) */}
      <style>{`
        /* subtle grain (simple CSS noise substitute); replace with real noise png if you have one */
        .cinematic-grain {
          background-image:
            radial-gradient(rgba(0,0,0,0.65) 1px, transparent 1px);
          background-size: 3px 3px;
          mix-blend-mode: overlay;
        }

        .glass-arrow{
          width: 56px;
          height: 56px;
          border-radius: 9999px;
          display:flex;
          align-items:center;
          justify-content:center;
          color: rgba(15,23,42,0.92);
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.28);
          box-shadow: 0 10px 26px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.45);
          -webkit-backdrop-filter: blur(20px) saturate(150%);
          backdrop-filter: blur(20px) saturate(150%);
          transition: transform 220ms ease, background 220ms ease, box-shadow 220ms ease;
        }
        .glass-arrow:hover{
          transform: translateY(-50%) scale(1.06);
          background: rgba(255,255,255,0.26);
          box-shadow: 0 14px 34px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.55);
        }
        /* keep hover transform correct (button already translated by utility classes) */
        .glass-arrow:hover{ transform: scale(1.06); }

        .badge-glass{
          width: fit-content;
          padding: 8px 12px;
          border-radius: 9999px;
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.16);
          box-shadow: 0 6px 18px rgba(0,0,0,0.20);
          -webkit-backdrop-filter: blur(16px) saturate(150%);
          backdrop-filter: blur(16px) saturate(150%);
        }

        .glass-cta{
          background: rgba(255,255,255,0.22);
          border: 1px solid rgba(255,255,255,0.35);
          box-shadow: 0 10px 26px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.55);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          backdrop-filter: blur(16px) saturate(180%);
          transition: transform 220ms ease, background 220ms ease, box-shadow 220ms ease;
        }
        .glass-cta:hover{
          transform: translateY(-1px);
          background: rgba(255,255,255,0.30);
          box-shadow: 0 14px 34px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.60);
        }

        .dots-surface{
          background: rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.08);
          -webkit-backdrop-filter: blur(12px);
          backdrop-filter: blur(12px);
        }

        @media (max-width: 640px){
          .glass-arrow{ width: 48px; height: 48px; }
        }

        /* Minimal Ken Burns only when user allows motion */
        @media (prefers-reduced-motion: no-preference){
          .kenburns{
            animation: kenburns 12s ease-out infinite alternate;
          }
          @keyframes kenburns{
            from{ transform: scale(1); }
            to{ transform: scale(1.015); }
          }
        }

        @media (prefers-reduced-motion: reduce){
          .kenburns{ animation: none !important; }
        }
      `}</style>
    </section>
  );
}

function PosterPreview({
  movie,
  side,
  dominant,
}: {
  movie: Movie;
  side: "left" | "right";
  dominant: string;
}) {
  const isLeft = side === "left";
  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 z-0 pointer-events-none"
      style={{
        left: isLeft ? "calc(50% - 420px)" : undefined,
        right: !isLeft ? "calc(50% - 420px)" : undefined,
      }}
      aria-hidden="true"
    >
      <div
        className="relative w-[260px] h-[390px] rounded-[18px] overflow-hidden"
        style={{
          transform: `translateX(${isLeft ? "-10px" : "10px"}) scale(0.88)`,
          opacity: 0.25,
          filter: "blur(1px) brightness(0.75)",
          boxShadow: `0 18px 60px rgba(0,0,0,0.18), 0 0 80px rgba(${dominant},0.10)`,
        }}
      >
        <img
          src={movie.posterUrl}
          alt=""
          className="w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>
    </div>
  );
}
