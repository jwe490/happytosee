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
  const [imageLoaded, setImageLoaded] = useState(false);

  const interacted = useRef(false);
  const current = list[index];
  const prevIndex = useRef(index);

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
    setImageLoaded(false);
    prevIndex.current = index;
    setIndex((p) => (p + dir + total) % total);
    window.setTimeout(() => setIsTransitioning(false), 900);
  };

  const goTo = (i: number) => {
    if (i === index) return;
    onUserInteract();
    setIsTransitioning(true);
    setImageLoaded(false);
    prevIndex.current = index;
    setIndex(i);
    window.setTimeout(() => setIsTransitioning(false), 900);
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
  }, [autoPlayInterval, paused, reduceMotion, total, index]);

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

  useEffect(() => {
    setImageLoaded(false);
  }, [current?.id]);

  if (!current || total === 0) return null;

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
        style={{
          height: "calc(100vh - 72px)",
          minHeight: isDesktop ? 760 : 690,
          maxHeight: 980,
        }}
      >
        {/* Enhanced Background with Parallax */}
        <div className="absolute inset-0">
          <div className="bgImageWrapper">
            <img
              key={current.id}
              src={bgImage}
              alt=""
              className="bgImage"
              onLoad={() => setImageLoaded(true)}
              style={{
                filter: "saturate(1.15) contrast(1.08) brightness(1.05)",
                transform: imageLoaded ? "scale(1.02)" : "scale(1.08)",
                opacity: imageLoaded ? 1 : 0,
              }}
            />
          </div>

          {/* Lighter, More Cinematic Overlays */}
          <div
            className="colorGradient"
            style={{
              background: `radial-gradient(ellipse 80% 50% at 50% 20%, rgba(${dominant},0.22) 0%, rgba(${dominant},0.08) 45%, rgba(0,0,0,0) 75%)`,
            }}
          />
          <div className="bottomGradient" />
          <div className="vignette" />
          <div className="filmGrain" />
        </div>

        {/* Clickable Area */}
        <button
          type="button"
          onClick={() => {
            onUserInteract();
            onMovieSelect(current);
          }}
          className="absolute inset-0 z-10 cursor-pointer"
          aria-label={`Open ${current.title}`}
        >
          <span className="sr-only">Open</span>
        </button>

        {/* Navigation Arrows */}
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

        {/* Content Sheet with Animations */}
        <div className="absolute inset-x-0 bottom-0 z-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 pb-6">
            <div key={`sheet-${current.id}`} className="infoSheetFixed">
              {/* Badges with Stagger Animation */}
              <div className="badgeRow">
                <div className="badgePill" style={{ animationDelay: "0ms" }}>
                  <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                  <span className="text-white font-semibold text-sm">{current.rating.toFixed(1)}</span>
                </div>
                <div className="badgePill" style={{ animationDelay: "80ms" }}>
                  <span className="text-white/90 font-medium text-sm">{current.year}</span>
                </div>
                {current.genre && (
                  <div className="badgePill" style={{ animationDelay: "160ms" }}>
                    <span className="text-white/90 font-medium text-sm">{current.genre.split(",")[0].trim()}</span>
                  </div>
                )}
              </div>

              {/* Title with Slide Animation */}
              <h1 className="titleClamp">{current.title}</h1>

              {/* Overview */}
              <div className="overviewSlot">
                {isDesktop && current.overview ? <p className="overviewClamp">{current.overview}</p> : <div />}
              </div>

              {/* CTA Button with Scale Animation */}
              <div className="ctaRowOne">
                <button type="button" className="ctaGlassPrimary" onClick={() => onMovieSelect(current)}>
                  <Play className="h-4 w-4" fill="currentColor" />
                  View Details
                </button>
              </div>
            </div>

            {/* Progress Dots */}
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
                        className="dotButton"
                        style={{
                          width: active ? 32 : 8,
                          background: active ? `rgba(${dominant},0.92)` : "rgba(255,255,255,0.35)",
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
        /* Enhanced Background Animation */
        .bgImageWrapper {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .bgImage {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transition: all 1200ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
          will-change: transform, opacity;
        }

        /* Lighter Overlays for Better Image Quality */
        .colorGradient {
          position: absolute;
          inset: 0;
          transition: background 1000ms ease;
          pointer-events: none;
        }

        .bottomGradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(0,0,0,0.15) 0%,
            rgba(0,0,0,0.08) 35%,
            rgba(0,0,0,0.75) 85%,
            rgba(0,0,0,0.92) 100%
          );
          pointer-events: none;
        }

        .vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse at center,
            rgba(0,0,0,0) 40%,
            rgba(0,0,0,0.35) 85%,
            rgba(0,0,0,0.55) 100%
          );
          pointer-events: none;
        }

        .filmGrain {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.018;
          mix-blend-mode: overlay;
          pointer-events: none;
        }

        /* Enhanced Navigation Arrows */
        .navArrow {
          position: absolute;
          z-index: 30;
          width: 56px;
          height: 56px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.95);
          background: rgba(255,255,255,0.16);
          border: 1px solid rgba(255,255,255,0.25);
          box-shadow: 0 16px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.25);
          backdrop-filter: blur(20px) saturate(150%);
          -webkit-backdrop-filter: blur(20px) saturate(150%);
          transition: all 280ms cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
        }

        .navArrow:hover:not(:disabled) {
          transform: scale(1.1);
          background: rgba(255,255,255,0.22);
          box-shadow: 0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3);
        }

        .navArrow:active:not(:disabled) {
          transform: scale(0.95);
        }

        /* Info Sheet with Slide-up Animation */
        .infoSheetFixed {
          width: 100%;
          height: 230px;
          border-radius: 24px;
          padding: 18px 18px 16px;
          background: rgba(0,0,0,0.32);
          border: 1px solid rgba(255,255,255,0.16);
          box-shadow: 0 28px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08);
          backdrop-filter: blur(24px) saturate(150%);
          -webkit-backdrop-filter: blur(24px) saturate(150%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          animation: slideUpFade 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Badge Row with Stagger */
        .badgeRow {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
        }

        .badgePill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 14px;
          border-radius: 9999px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.20);
          backdrop-filter: blur(16px) saturate(150%);
          -webkit-backdrop-filter: blur(16px) saturate(150%);
          animation: badgeFadeIn 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          opacity: 0;
        }

        @keyframes badgeFadeIn {
          from {
            opacity: 0;
            transform: scale(0.85) translateY(-5px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        /* Enhanced Title */
        .titleClamp {
          margin-top: 8px;
          color: #fff;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.05;
          font-size: clamp(30px, 4.5vw, 60px);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-shadow: 0 4px 20px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4);
          animation: titleSlideIn 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 100ms forwards;
          opacity: 0;
        }

        @keyframes titleSlideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .overviewSlot {
          height: 48px;
          margin-top: 8px;
        }

        .overviewClamp {
          color: rgba(255,255,255,0.78);
          font-size: 16px;
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          animation: fadeIn 600ms ease 200ms forwards;
          opacity: 0;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .ctaRowOne {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-top: 10px;
        }

        /* Enhanced CTA Button */
        .ctaGlassPrimary {
          height: 52px;
          width: 100%;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-weight: 700;
          font-size: 15px;
          color: rgba(255,255,255,0.97);
          background: rgba(255,255,255,0.20);
          border: 1px solid rgba(255,255,255,0.32);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          box-shadow: 0 20px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3);
          transition: all 320ms cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
          animation: buttonPop 500ms cubic-bezier(0.34, 1.56, 0.64, 1) 300ms forwards;
          opacity: 0;
          transform: scale(0.9);
        }

        @keyframes buttonPop {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .ctaGlassPrimary:hover {
          background: rgba(255,255,255,0.28);
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.35);
        }

        .ctaGlassPrimary:active {
          transform: translateY(0) scale(0.98);
        }

        /* Enhanced Dots Bar */
        .dotsBar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          border-radius: 9999px;
          background: rgba(0,0,0,0.30);
          border: 1px solid rgba(255,255,255,0.14);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.4);
        }

        .dotButton {
          height: 6px;
          border-radius: 9999px;
          transition: all 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
          border: none;
          padding: 0;
        }

        .dotButton:hover:not(:disabled) {
          transform: scale(1.3);
          opacity: 1;
        }

        @media (max-width: 640px) {
          .infoSheetFixed {
            height: 225px;
          }
          .overviewSlot {
            display: none;
          }
          .navArrow {
            width: 50px;
            height: 50px;
          }
        }
      `}</style>
    </section>
  );
        }
