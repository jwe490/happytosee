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

  const list = useMemo(() => (movies ?? []).filter(Boolean), [movies]);
  const total = list.length;

  const [index, setIndex] = useState(0);
  const [dominant, setDominant] = useState("59,130,246");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [paused, setPaused] = useState(false);

  const interactingRef = useRef(false);
  const current = list[index];

  useEffect(() => {
    if (!current?.posterUrl) return;
    extractDominantColor(current.posterUrl)
      .then((c) => setDominant(c))
      .catch(() => setDominant("59,130,246"));
  }, [current?.posterUrl]);

  const go = (dir: 1 | -1) => {
    if (total <= 1) return;
    if (isTransitioning) return;
    setIsTransitioning(true);
    setIndex((p) => (p + dir + total) % total);
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
    setPaused(true);
  };

  // autoplay (pause after any interaction) + reduced motion respect
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

  const bgImage = current.backdropUrl || current.posterUrl;

  return (
    <section
      className="relative w-full overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Featured movies"
      onMouseEnter={() => setPaused(true)}
      onTouchStart={onUserInteract}
    >
      {/* FULLSCREEN STAGE */}
      <div
        className="relative w-full"
        style={{
          height: "calc(100vh - 72px)",
          minHeight: isDesktop ? 720 : 640,
          maxHeight: 980,
        }}
      >
        {/* BACKDROP IMAGE */}
        <img
          key={current.id}
          src={bgImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            filter: "saturate(1.1)",
            transform: "scale(1.04)",
          }}
        />

        {/* CINEMATIC LAYERS (minimal) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.90) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 60% 15%, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0) 45%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% 20%, rgba(${dominant},0.22) 0%, rgba(${dominant},0.08) 35%, rgba(0,0,0,0) 65%)`,
          }}
        />
        <div className="absolute inset-0 cinematic-grain opacity-[0.03]" />

        {/* STATIC ARROWS (never shift, never overlap info) */}
        <button
          type="button"
          onClick={() => {
            onUserInteract();
            go(-1);
          }}
          disabled={isTransitioning}
          className="glass-arrow absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 disabled:opacity-50"
          aria-label="Previous"
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
          className="glass-arrow absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 disabled:opacity-50"
          aria-label="Next"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* CONTENT GRID (uses space wisely) */}
        <div className="relative z-20 h-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="h-full grid lg:grid-cols-12 gap-10 items-center pt-10 pb-28">
            {/* LEFT: INFO */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3">
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

              <h1 className="mt-6 text-white font-extrabold leading-[1.03] tracking-[-0.03em] text-4xl sm:text-5xl lg:text-6xl drop-shadow-[0_10px_30px_rgba(0,0,0,0.75)]">
                {current.title}
              </h1>

              {current.overview && (
                <p className="mt-6 text-white/75 text-base sm:text-lg leading-relaxed max-w-2xl line-clamp-3">
                  {current.overview}
                </p>
              )}

              <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md">
                <button
                  type="button"
                  onClick={() => {
                    onUserInteract();
                    onMovieSelect(current);
                  }}
                  className="glass-cta h-12 rounded-full flex items-center justify-center gap-2 text-[15px] font-semibold text-white"
                  style={{
                    background: "rgba(255,255,255,0.14)",
                    border: "1px solid rgba(255,255,255,0.22)",
                  }}
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
                  className="h-12 rounded-full px-5 font-semibold text-[15px] text-slate-900 bg-white/90 hover:bg-white transition"
                >
                  Play Now
                </button>
              </div>
            </div>

            {/* RIGHT: POSTER (big, not tiny) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div
                className="relative w-[min(78vw,420px)] aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.75)]"
                style={{
                  boxShadow: `0 50px 140px rgba(0,0,0,0.75), 0 0 120px rgba(${dominant},0.22)`,
                }}
              >
                <img
                  src={current.posterUrl}
                  alt={current.title}
                  className={`absolute inset-0 w-full h-full object-cover ${
                    reduceMotion ? "" : "kenburns"
                  }`}
                  draggable={false}
                  onPointerDown={onUserInteract}
                />
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute inset-0 pointer-events-none border border-white/15" />
              </div>
            </div>
          </div>
        </div>

        {/* DOTS: ALWAYS OUTSIDE INFO AREA (fixed bottom bar) */}
        {total > 1 && (
          <div className="absolute left-0 right-0 bottom-6 z-30 flex justify-center px-4">
            <div className="dots-surface flex items-center gap-2.5 px-4 py-2 rounded-full">
              {list.map((m, i) => {
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
                      width: active ? 26 : 6,
                      height: 6,
                      borderRadius: 9999,
                      background: active
                        ? `rgba(${dominant},0.95)`
                        : "rgba(255,255,255,0.28)",
                      transition: "all 400ms ease",
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* minimal styles */}
      <style>{`
        .cinematic-grain {
          background-image: radial-gradient(rgba(0,0,0,0.7) 1px, transparent 1px);
          background-size: 3px 3px;
          mix-blend-mode: overlay;
          pointer-events: none;
        }

        .glass-arrow{
          width: 56px;
          height: 56px;
          border-radius: 9999px;
          display:flex;
          align-items:center;
          justify-content:center;
          color: rgba(255,255,255,0.92);
          background: rgba(255,255,255,0.14);
          border: 1px solid rgba(255,255,255,0.22);
          box-shadow: 0 12px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.25);
          -webkit-backdrop-filter: blur(18px) saturate(140%);
          backdrop-filter: blur(18px) saturate(140%);
          transition: transform 220ms ease, background 220ms ease;
        }
        .glass-arrow:hover{
          transform: translateY(-50%) scale(1.06);
          background: rgba(255,255,255,0.20);
        }
        /* keep hover scale correct (avoid double translate from utilities in some browsers) */
        .glass-arrow:hover{ transform: scale(1.06); }

        .badge-glass{
          width: fit-content;
          padding: 8px 12px;
          border-radius: 9999px;
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.16);
          -webkit-backdrop-filter: blur(16px) saturate(150%);
          backdrop-filter: blur(16px) saturate(150%);
          box-shadow: 0 10px 26px rgba(0,0,0,0.25);
        }

        .glass-cta{
          -webkit-backdrop-filter: blur(16px) saturate(160%);
          backdrop-filter: blur(16px) saturate(160%);
          box-shadow: 0 12px 34px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.20);
          transition: transform 220ms ease, background 220ms ease;
        }
        .glass-cta:hover{ transform: translateY(-1px); background: rgba(255,255,255,0.18) !important; }

        .dots-surface{
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.14);
          -webkit-backdrop-filter: blur(14px);
          backdrop-filter: blur(14px);
        }

        @media (max-width: 640px){
          .glass-arrow{ width: 48px; height: 48px; }
        }

        @media (prefers-reduced-motion: no-preference){
          .kenburns{ animation: kenburns 12s ease-out infinite alternate; }
          @keyframes kenburns{ from{ transform: scale(1); } to{ transform: scale(1.015); } }
        }
        @media (prefers-reduced-motion: reduce){
          .kenburns{ animation: none !important; }
        }
      `}</style>
    </section>
  );
      }
