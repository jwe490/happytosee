import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star, Play } from "lucide-react";

type Movie = {
  id: string | number;
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
  autoPlayMs?: number;        // set undefined to disable autoplay
  height?: number;            // px (mobile-friendly fixed block)
};

export function CleanCarousel({
  movies = [],
  onMovieSelect,
  autoPlayMs = 6500,
  height = 540,
}: Props) {
  const list = useMemo(() => (movies ?? []).filter(Boolean), [movies]);
  const total = list.length;

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const interacted = useRef(false);

  useEffect(() => {
    if (total === 0) return;
    if (index > total - 1) setIndex(0);
  }, [index, total]);

  const prev = () => {
    if (total <= 1) return;
    setIndex((i) => (i - 1 + total) % total);
  };

  const next = () => {
    if (total <= 1) return;
    setIndex((i) => (i + 1) % total);
  };

  useEffect(() => {
    if (!autoPlayMs || total <= 1 || paused) return;
    const t = window.setInterval(() => {
      if (interacted.current) return;
      next();
    }, autoPlayMs);
    return () => window.clearInterval(t);
  }, [autoPlayMs, paused, total]);

  if (total === 0) return null;

  return (
    <section className="w-full">
      <div
        className="relative w-full overflow-hidden rounded-3xl bg-black"
        style={{ height }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => {
          interacted.current = true;
          setPaused(true);
        }}
      >
        {/* TRACK (translateX slider) */}
        <div
          className="absolute inset-0 flex"
          style={{
            transform: `translateX(-${index * 100}%)`,
            transition: "transform 420ms cubic-bezier(0.2, 0.9, 0.2, 1)",
            willChange: "transform",
          }}
        >
          {list.map((m) => {
            const src = m.backdropUrl || m.posterUrl;
            return (
              <div key={m.id} className="relative w-full shrink-0">
                <img
                  src={src}
                  alt={m.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  decoding="async"
                />
                {/* simple gradients (pointer-events none so no blocking) */}
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.10)_0%,rgba(0,0,0,0)_55%)]" />
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.25)_45%,rgba(0,0,0,0.88)_100%)]" />
              </div>
            );
          })}
        </div>

        {/* ARROWS */}
        {total > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous"
              onClick={() => {
                interacted.current = true;
                setPaused(true);
                prev();
              }}
              className="cc-arrow left-4"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              type="button"
              aria-label="Next"
              onClick={() => {
                interacted.current = true;
                setPaused(true);
                next();
              }}
              className="cc-arrow right-4"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* BOTTOM CONTENT */}
        <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-5">
          <div className="cc-sheet">
            <div className="flex flex-wrap items-center gap-2">
              {typeof list[index].rating === "number" && (
                <span className="cc-pill">
                  <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                  <span className="text-white text-sm font-semibold">
                    {list[index].rating!.toFixed(1)}
                  </span>
                </span>
              )}
              {list[index].year && (
                <span className="cc-pill">
                  <span className="text-white/90 text-sm font-medium">{list[index].year}</span>
                </span>
              )}
              {list[index].genre && (
                <span className="cc-pill">
                  <span className="text-white/90 text-sm font-medium">
                    {list[index].genre!.split(",")[0].trim()}
                  </span>
                </span>
              )}
            </div>

            <div className="mt-2 text-white font-extrabold tracking-[-0.03em] leading-[1.05] text-3xl">
              {list[index].title}
            </div>

            <button
              type="button"
              className="cc-cta mt-3"
              onClick={() => {
                interacted.current = true;
                setPaused(true);
                onMovieSelect(list[index]);
              }}
            >
              <Play className="h-4 w-4" fill="currentColor" />
              View Details
            </button>
          </div>

          {/* DOTS */}
          {total > 1 && (
            <div className="mt-3 flex justify-center">
              <div className="cc-dots">
                {list.map((m, i) => (
                  <button
                    key={m.id}
                    type="button"
                    aria-label={`Go to slide ${i + 1}`}
                    aria-current={i === index ? "true" : "false"}
                    onClick={() => {
                      interacted.current = true;
                      setPaused(true);
                      setIndex(i);
                    }}
                    className="cc-dot"
                    style={{ width: i === index ? 26 : 7, opacity: i === index ? 1 : 0.55 }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <style>{`
          /* Fast animations should stick to transform/opacity. [web:606] */
          .cc-arrow{
            position:absolute;
            top:50%;
            transform: translateY(-50%);
            z-index: 20;
            width: 48px; height: 48px;
            border-radius: 9999px;
            display:flex; align-items:center; justify-content:center;
            color: rgba(255,255,255,0.95);
            background: rgba(0,0,0,0.35);
            border: 1px solid rgba(255,255,255,0.18);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
          }
          .cc-sheet{
            width: 100%;
            border-radius: 22px;
            padding: 14px 14px 12px;
            background: rgba(0,0,0,0.42);
            border: 1px solid rgba(255,255,255,0.14);
            box-shadow: 0 22px 64px rgba(0,0,0,0.60);
            backdrop-filter: blur(18px) saturate(140%);
            -webkit-backdrop-filter: blur(18px) saturate(140%);
          }
          .cc-pill{
            display:inline-flex;
            align-items:center;
            gap:8px;
            padding: 7px 12px;
            border-radius: 9999px;
            background: rgba(255,255,255,0.10);
            border: 1px solid rgba(255,255,255,0.16);
          }
          .cc-cta{
            width:100%;
            height:46px;
            border-radius:9999px;
            display:flex; align-items:center; justify-content:center; gap:10px;
            font-weight:700;
            font-size:15px;
            color: rgba(255,255,255,0.96);
            background: rgba(255,255,255,0.18);
            border: 1px solid rgba(255,255,255,0.26);
          }
          .cc-dots{
            display:flex; align-items:center; gap:10px;
            padding: 10px 16px;
            border-radius: 9999px;
            background: rgba(0,0,0,0.30);
            border: 1px solid rgba(255,255,255,0.12);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
          }
          .cc-dot{
            height: 7px;
            border-radius: 9999px;
            background: rgba(255,255,255,0.55);
            transition: width 220ms cubic-bezier(0.2, 0.9, 0.2, 1), opacity 220ms ease;
            border: none;
            padding: 0;
          }
        `}</style>
      </div>
    </section>
  );
}
