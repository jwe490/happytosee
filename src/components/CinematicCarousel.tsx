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

/** TMDB URL format is base_url + size + file_path, so we can safely replace the size segment [web:143]. */
const upgradeTmdbImage = (url: string | undefined, type: "backdrop" | "poster") => {
  if (!url) return "";
  if (!url.includes("image.tmdb.org/t/p/")) return url;
  const size = type === "backdrop" ? "w1280" : "w780";
  return url.replace(//t/p/(wd+|original)//, `/t/p/${size}/`);
};

export function CinematicCarousel({ movies, onMovieSelect, autoPlayInterval = 6500 }: CinematicCarouselProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const list = useMemo(() => (movies ?? []).filter(Boolean), [movies]);
  const total = list.length;

  const [index, setIndex] = useState(0);
  const [dominant, setDominant] = useState("59,130,246");
  const [paused, setPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [wipeDir, setWipeDir] = useState<1 | -1>(1);

  const interacted = useRef(false);

  // Swipe
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const swiping = useRef(false);

  const current = list[index];
  if (!current || total === 0) return null;

  // IMPORTANT: carousel forces high quality even if incoming urls are w500
  const bgImage = upgradeTmdbImage(current.backdropUrl || current.posterUrl, "backdrop");

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
    setWipeDir(dir);
    setIsTransitioning(true);
    setIndex((p) => (p + dir + total) % total);
    window.setTimeout(() => setIsTransitioning(false), 720);
  };

  const goTo = (i: number) => {
    if (i === index) return;
    onUserInteract();
    setWipeDir(i > index ? 1 : -1);
    setIsTransitioning(true);
    setIndex(i);
    window.setTimeout(() => setIsTransitioning(false), 720);
  };

  // Autoplay stops after interaction
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

  // Keyboard arrows
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
  const SWIPE_X = 40;
  const SWIPE_Y = 70;

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

  return (
    <section className="relative w-full overflow-hidden bg-black" onMouseEnter={() => setPaused(true)} onTouchStart={onUserInteract}>
      <div
        className="relative w-full"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ height: "calc(100vh - 72px)", minHeight: isDesktop ? 760 : 690, maxHeight: 980 }}
      >
        {/* Background */}
        <div className="absolute inset-0">
          <img
            key={`bg-${current.id}`}
            src={bgImage}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover ${reduceMotion ? "" : "bgCine"}`}
            style={{ filter: "saturate(1.12) contrast(1.06) brightness(1.06)", transform: "scale(1.03)" }}
          />

          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 18%, rgba(${dominant},0.26) 0%, rgba(${dominant},0.10) 40%, rgba(0,0,0,0) 72%)` }} />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18)_0%,rgba(0,0,0,0.14)_35%,rgba(0,0,0,0.82)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_38%,rgba(0,0,0,0.55)_100%)]" />
          <div className="absolute inset-0 cinematic-grain opacity-[0.022]" />
        </div>

        {/* Wipe overlay */}
        <div key={`wipe-${current.id}`} className={`wipeOverlay ${wipeDir === 1 ? "wipeNext" : "wipePrev"} ${reduceMotion ? "wipeOff" : ""}`} />

        {/* Background tap */}
        <button type="button" onClick={() => { onUserInteract(); onMovieSelect(current); }} className="absolute inset-0 z-10 cursor-pointer" aria-label={`Open ${current.title}`}>
          <span className="sr-only">Open</span>
        </button>

        {/* Arrows */}
        {total > 1 && (
          <>
            <button type="button" aria-label="Previous" onClick={(e) => { e.stopPropagation(); onUserInteract(); go(-1); }} disabled={isTransitioning} className="navArrow left-4 sm:left-6 top-[45%] -translate-y-1/2 disabled:opacity-40">
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button type="button" aria-label="Next" onClick={(e) => { e.stopPropagation(); onUserInteract(); go(1); }} disabled={isTransitioning} className="navArrow right-4 sm:right-6 top-[45%] -translate-y-1/2 disabled:opacity-40">
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Bottom sheet */}
        <div className="absolute inset-x-0 bottom-0 z-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 pb-6">
            <div key={`sheet-${current.id}`} className="infoSheetFixed max-w-[760px]">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="badgePill"><Star className="h-4 w-4 text-yellow-300 fill-yellow-300" /><span className="text-white font-semibold text-sm">{current.rating.toFixed(1)}</span></div>
                <div className="badgePill"><span className="text-white/90 font-medium text-sm">{current.year}</span></div>
                {current.genre && <div className="badgePill"><span className="text-white/90 font-medium text-sm">{current.genre.split(",")[0].trim()}</span></div>}
              </div>

              <h1 className="titleClamp">{current.title}</h1>

              <div className="overviewSlot">{isDesktop && current.overview ? <p className="overviewClamp">{current.overview}</p> : <div />}</div>

              <div className="ctaRow">
                <button type="button" className="ctaGlassPrimary" onClick={(e) => { e.stopPropagation(); onUserInteract(); onMovieSelect(current); }}>
                  <Play className="h-4 w-4" fill="currentColor" />View Details
                </button>
                <button type="button" className="ctaSecondary" onClick={(e) => { e.stopPropagation(); onUserInteract(); onMovieSelect(current); }}>
                  Play Now
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
                        onClick={(e) => { e.stopPropagation(); goTo(i); }}
                        disabled={isTransitioning}
                        aria-label={`Go to slide ${i + 1} of ${total}`}
                        aria-current={active ? "true" : "false"}
                        style={{
                          width: active ? 26 : 6,
                          height: 6,
                          borderRadius: 9999,
                          background: active ? `rgba(${dominant},0.95)` : "rgba(255,255,255,0.30)",
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

        <style>{finalCss}</style>
      </div>
    </section>
  );
}

const finalCss = `
.cinematic-grain{ background-image: radial-gradient(rgba(0,0,0,0.7) 1px, transparent 1px); background-size: 3px 3px; mix-blend-mode: overlay; pointer-events: none; }

.navArrow{ position:absolute; z-index:30; width:54px; height:54px; border-radius:9999px; display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,0.92); background:rgba(255,255,255,0.14); border:1px solid rgba(255,255,255,0.20); box-shadow:0 14px 34px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.20); -webkit-backdrop-filter: blur(18px) saturate(140%); backdrop-filter: blur(18px) saturate(140%); transition: transform 220ms ease, background 220ms ease; }
.navArrow:hover{ transform: translateY(-50%) scale(1.06); background: rgba(255,255,255,0.20); }

.infoSheetFixed{ width:100%; height:240px; border-radius:22px; padding:18px 18px 16px; background:rgba(0,0,0,0.34); border:1px solid rgba(255,255,255,0.14); box-shadow:0 24px 70px rgba(0,0,0,0.55); -webkit-backdrop-filter: blur(18px) saturate(140%); backdrop-filter: blur(18px) saturate(140%); display:flex; flex-direction:column; justify-content:space-between; }

.badgePill{ display:flex; align-items:center; gap:8px; padding:8px 12px; border-radius:9999px; background:rgba(255,255,255,0.10); border:1px solid rgba(255,255,255,0.16); -webkit-backdrop-filter: blur(14px) saturate(140%); backdrop-filter: blur(14px) saturate(140%); }

.titleClamp{ margin-top:8px; color:#fff; font-weight:800; letter-spacing:-0.03em; line-height:1.05; font-size:clamp(28px, 4.2vw, 56px); display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }

.overviewSlot{ height:44px; margin-top:6px; }
.overviewClamp{ color:rgba(255,255,255,0.72); font-size:16px; line-height:1.55; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }

.ctaRow{ display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:10px; }

.ctaGlassPrimary{ height:48px; width:100%; border-radius:9999px; display:flex; align-items:center; justify-content:center; gap:10px; font-weight:700; font-size:15px; color:rgba(255,255,255,0.95); background:rgba(255,255,255,0.18); border:1px solid rgba(255,255,255,0.28); -webkit-backdrop-filter: blur(18px) saturate(170%); backdrop-filter: blur(18px) saturate(170%); box-shadow:0 18px 46px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.24); transition: transform 220ms ease, background 220ms ease; }
.ctaGlassPrimary:hover{ transform: translateY(-1px); background: rgba(255,255,255,0.22); }

.ctaSecondary{ height:48px; width:100%; border-radius:9999px; font-weight:600; font-size:15px; color:rgba(255,255,255,0.78); background:rgba(0,0,0,0.10); border:1px solid rgba(255,255,255,0.14); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); transition: transform 220ms ease, background 220ms ease, color 220ms ease; }
.ctaSecondary:hover{ transform: translateY(-1px); background: rgba(255,255,255,0.10); color: rgba(255,255,255,0.88); }

.dotsBar{ display:flex; align-items:center; gap:10px; padding:10px 18px; border-radius:9999px; background:rgba(0,0,0,0.26); border:1px solid rgba(255,255,255,0.12); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); }

.wipeOverlay{ position:absolute; inset:-20%; z-index:15; pointer-events:none; opacity:0; background: linear-gradient(110deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.10) 48%, rgba(255,255,255,0) 62%); mix-blend-mode: overlay; filter: blur(2px); }
.wipeOff{ display:none; }

@media (prefers-reduced-motion: no-preference){
  .bgCine{ animation: bgEnter 720ms cubic-bezier(0.22,0.61,0.36,1); }
  @keyframes bgEnter{ from{ opacity:0; transform: scale(1.08); filter: blur(3px) saturate(1.12) contrast(1.06) brightness(1.06);} to{ opacity:1; transform: scale(1.03); filter: blur(0px) saturate(1.12) contrast(1.06) brightness(1.06);} }

  .wipeNext{ animation: wipeNext 520ms cubic-bezier(0.22,0.61,0.36,1); }
  .wipePrev{ animation: wipePrev 520ms cubic-bezier(0.22,0.61,0.36,1); }
  @keyframes wipeNext{ 0%{ transform: translateX(-18%) skewX(-10deg); opacity:0;} 20%{ opacity:1;} 100%{ transform: translateX(18%) skewX(-10deg); opacity:0;} }
  @keyframes wipePrev{ 0%{ transform: translateX(18%) skewX(10deg); opacity:0;} 20%{ opacity:1;} 100%{ transform: translateX(-18%) skewX(10deg); opacity:0;} }

  .infoSheetFixed{ animation: sheetIn 520ms cubic-bezier(0.22,0.61,0.36,1); }
  @keyframes sheetIn{ from{ opacity:0; transform: translateY(10px);} to{ opacity:1; transform: translateY(0);} }
}

@media (prefers-reduced-motion: reduce){
  .bgCine,.infoSheetFixed,.wipeNext,.wipePrev{ animation:none !important; }
}

@media (max-width: 640px){
  .infoSheetFixed{ height:255px; }
  .overviewSlot{ display:none; }
  .ctaRow{ grid-template-columns:1fr; }
}
`;
