import React, { useEffect, useMemo, useRef, useState } from "react";
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

/** TMDB images are served as base_url + "/t/p/" + size + "/" + file_path, so size can be replaced. [web:143] */
const upgradeTmdbImage = (url: string | undefined, type: "backdrop" | "poster") => {
  if (!url) return "";
  if (!url.includes("image.tmdb.org/t/p/")) return url;
  const size = type === "backdrop" ? "w1280" : "w780";
  return url.replace(//t/p/(wd+|original)//, `/t/p/${size}/`);
};

const cssBlock = `
.navArrow{
  position:absolute; z-index:30;
  width:54px; height:54px; border-radius:9999px;
  display:flex; align-items:center; justify-content:center;
  color:rgba(255,255,255,0.92);
  background:rgba(255,255,255,0.14);
  border:1px solid rgba(255,255,255,0.20);
  box-shadow:0 14px 34px rgba(0,0,0,0.35);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  backdrop-filter: blur(18px) saturate(140%);
}
.infoSheetFixed{
  width:100%;
  height:240px;
  border-radius:22px;
  padding:18px 18px 16px;
  background:rgba(0,0,0,0.34);
  border:1px solid rgba(255,255,255,0.14);
  box-shadow:0 24px 70px rgba(0,0,0,0.55);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  backdrop-filter: blur(18px) saturate(140%);
  display:flex;
  flex-direction:column;
  justify-content:space-between;
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
  margin-top:8px;
  color:#fff;
  font-weight:800;
  letter-spacing:-0.03em;
  line-height:1.05;
  font-size:clamp(28px, 4.2vw, 56px);
  display:-webkit-box;
  -webkit-line-clamp:2;
  -webkit-box-orient:vertical;
  overflow:hidden;
}
.overviewSlot{ height:44px; margin-top:6px; }
.overviewClamp{
  color:rgba(255,255,255,0.72);
  font-size:16px;
  line-height:1.55;
  display:-webkit-box;
  -webkit-line-clamp:2;
  -webkit-box-orient:vertical;
  overflow:hidden;
}
.ctaRow{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:12px;
  margin-top:10px;
}
.ctaGlassPrimary{
  height:48px;
  border-radius:9999px;
  display:flex; align-items:center; justify-content:center; gap:10px;
  font-weight:700;
  font-size:15px;
  color:rgba(255,255,255,0.95);
  background:rgba(255,255,255,0.18);
  border:1px solid rgba(255,255,255,0.28);
  -webkit-backdrop-filter: blur(18px) saturate(170%);
  backdrop-filter: blur(18px) saturate(170%);
  box-shadow:0 18px 46px rgba(0,0,0,0.34);
}
.ctaSecondary{
  height:48px;
  border-radius:9999px;
  font-weight:600;
  font-size:15px;
  color:rgba(255,255,255,0.78);
  background:rgba(0,0,0,0.10);
  border:1px solid rgba(255,255,255,0.14);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}
@media (max-width: 640px){
  .infoSheetFixed{ height:255px; }
  .overviewSlot{ display:none; }
  .ctaRow{ grid-template-columns:1fr; }
}
`;

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

  useEffect(() => {
    if (reduceMotion) return;
    if (total <= 1) return;
    if (paused) return;

    const t = window.setInterval(() => {
      if (interacted.current) return;
      go(1);
    }, autoPlayInterval);

    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlayInterval, paused, reduceMotion, total]);

  if (!current || total === 0) return null;

  const bgImage = upgradeTmdbImage(current.backdropUrl || current.posterUrl, "backdrop");

  return (
    <section
      className="relative w-full overflow-hidden bg-black"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onUserInteract}
    >
      <div
        className="relative w-full"
        style={{
          height: "calc(100vh - 72px)",
          minHeight: isDesktop ? 760 : 690,
          maxHeight: 980,
        }}
      >
        <img
          src={bgImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "saturate(1.08) contrast(1.06)" }}
        />

        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% 18%, rgba(${dominant},0.26) 0%, rgba(${dominant},0.10) 40%, rgba(0,0,0,0) 72%)`,
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18)_0%,rgba(0,0,0,0.14)_35%,rgba(0,0,0,0.82)_100%)]" />

        {total > 1 && (
          <>
            <button
              type="button"
              className="navArrow left-4 sm:left-6 top-[45%] -translate-y-1/2"
              onClick={() => {
                onUserInteract();
                go(-1);
              }}
              aria-label="Previous"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              className="navArrow right-4 sm:right-6 top-[45%] -translate-y-1/2"
              onClick={() => {
                onUserInteract();
                go(1);
              }}
              aria-label="Next"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        <div className="absolute inset-x-0 bottom-0 z-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 pb-6">
            <div className="infoSheetFixed max-w-[760px]">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="badgePill">
                  <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                  <span className="text-white font-semibold text-sm">
                    {current.rating.toFixed(1)}
                  </span>
                </div>
                <div className="badgePill">
                  <span className="text-white/90 font-medium text-sm">{current.year}</span>
                </div>
                {current.genre && (
                  <div className="badgePill">
                    <span className="text-white/90 font-medium text-sm">
                      {current.genre.split(",")[0].trim()}
                    </span>
                  </div>
                )}
              </div>

              <h1 className="titleClamp">{current.title}</h1>

              <div className="overviewSlot">
                {isDesktop && current.overview ? (
                  <p className="overviewClamp">{current.overview}</p>
                ) : (
                  <div />
                )}
              </div>

              <div className="ctaRow">
                <button type="button" className="ctaGlassPrimary" onClick={() => onMovieSelect(current)}>
                  <Play className="h-4 w-4" fill="currentColor" />
                  View Details
                </button>
                <button type="button" className="ctaSecondary" onClick={() => onMovieSelect(current)}>
                  Play Now
                </button>
              </div>
            </div>
          </div>
        </div>

        <style>{cssBlock}</style>
      </div>
    </section>
  );
}
