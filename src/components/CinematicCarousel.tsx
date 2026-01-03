import { useCallback, useEffect, useMemo, useState } from "react";
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
}

export function CinematicCarousel({ movies = [], onMovieSelect }: CinematicCarouselProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const list = useMemo(() => (movies ?? []).filter(Boolean), [movies]);
  const total = list.length;

  const [index, setIndex] = useState(0);
  const [dominant, setDominant] = useState("59,130,246");

  const current = total > 0 ? list[Math.min(index, total - 1)] : undefined;

  useEffect(() => {
    if (!current?.posterUrl) return;
    extractDominantColor(current.posterUrl)
      .then((c) => setDominant(c))
      .catch(() => setDominant("59,130,246"));
  }, [current?.posterUrl]);

  useEffect(() => {
    if (total === 0) return;
    if (index > total - 1) setIndex(0);
  }, [index, total]);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (total <= 1) return;
      setIndex((p) => (p + dir + total) % total);
    },
    [total],
  );

  if (!current) return null;

  const bgImage = current.backdropUrl || current.posterUrl;

  return (
    <section className="w-full bg-black">
      {/* Fixed block height: cannot hide other sections */}
      <div className="relative w-full" style={{ height: isDesktop ? 620 : 520 }}>
        {/* Background (NOT clickable, cannot block page) */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            key={current.id}
            src={bgImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "saturate(1.1) contrast(1.06) brightness(1.08)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at 55% 18%, rgba(${dominant},0.22) 0%, rgba(${dominant},0.07) 44%, rgba(0,0,0,0) 78%)`,
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.10)_0%,rgba(0,0,0,0.06)_40%,rgba(0,0,0,0.70)_100%)]" />
        </div>

        {/* Arrows */}
        {total > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous"
              onClick={() => go(-1)}
              className="navArrow left-4 sm:left-6 top-1/2 -translate-y-1/2"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              type="button"
              aria-label="Next"
              onClick={() => go(1)}
              className="navArrow right-4 sm:right-6 top-1/2 -translate-y-1/2"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Bottom card */}
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 pb-6">
            <div className="infoSheetFixed">
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

              <h2 className="titleClamp">{current.title}</h2>

              {isDesktop && current.overview ? (
                <p className="overviewClamp">{current.overview}</p>
              ) : (
                <div />
              )}

              <button type="button" className="ctaGlassPrimary" onClick={() => onMovieSelect(current)}>
                <Play className="h-4 w-4" fill="currentColor" />
                View Details
              </button>
            </div>
          </div>
        </div>

        <style>{`
          .navArrow{
            position:absolute; z-index:10;
            width:54px; height:54px; border-radius:9999px;
            display:flex; align-items:center; justify-content:center;
            color:rgba(255,255,255,0.92);
            background:rgba(255,255,255,0.14);
            border:1px solid rgba(255,255,255,0.20);
            box-shadow:0 14px 34px rgba(0,0,0,0.35);
            backdrop-filter: blur(18px) saturate(140%);
            -webkit-backdrop-filter: blur(18px) saturate(140%);
          }
          .infoSheetFixed{
            width:100%;
            height: 210px;
            border-radius: 22px;
            padding: 16px 16px 14px;
            background: rgba(0,0,0,0.28);
            border: 1px solid rgba(255,255,255,0.14);
            box-shadow: 0 24px 70px rgba(0,0,0,0.50);
            backdrop-filter: blur(18px) saturate(140%);
            -webkit-backdrop-filter: blur(18px) saturate(140%);
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
          }
          .titleClamp{
            margin-top: 6px;
            color:#fff;
            font-weight:850;
            letter-spacing:-0.03em;
            line-height:1.05;
            font-size:clamp(28px, 3.6vw, 56px);
            display:-webkit-box;
            -webkit-line-clamp:2;
            -webkit-box-orient:vertical;
            overflow:hidden;
          }
          .overviewClamp{
            color: rgba(255,255,255,0.78);
            font-size: 15px;
            line-height: 1.5;
            display:-webkit-box;
            -webkit-line-clamp:2;
            -webkit-box-orient:vertical;
            overflow:hidden;
          }
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
          }
          @media (max-width: 640px){
            .overviewClamp{ display:none; }
            .infoSheetFixed{ height: 200px; }
          }
        `}</style>
      </div>
    </section>
  );
}
