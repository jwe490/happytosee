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
  const [direction, setDirection] = useState<1 | -1>(1);
  const [imageLoaded, setImageLoaded] = useState(true);

  const interacted = useRef(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const navigationQueue = useRef<number[]>([]);
  const isNavigating = useRef(false);

  const current = list[index];
  const nextIndex = (index + 1) % total;
  const prevIndex = (index - 1 + total) % total;

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

  const processNavigationQueue = () => {
    if (isNavigating.current || navigationQueue.current.length === 0) return;
    
    isNavigating.current = true;
    const targetIndex = navigationQueue.current.shift()!;
    
    setImageLoaded(false);
    setIndex(targetIndex);
    
    setTimeout(() => {
      setImageLoaded(true);
      isNavigating.current = false;
      processNavigationQueue();
    }, 50);
  };

  const go = (dir: 1 | -1) => {
    if (total <= 1) return;
    setDirection(dir);
    const targetIndex = (index + dir + total) % total;
    navigationQueue.current.push(targetIndex);
    processNavigationQueue();
  };

  const goTo = (i: number) => {
    if (i === index) return;
    onUserInteract();
    const dir = i > index ? 1 : -1;
    setDirection(dir);
    navigationQueue.current.push(i);
    processNavigationQueue();
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
        e.preventDefault();
        onUserInteract();
        go(-1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        onUserInteract();
        go(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total, index]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      onUserInteract();
      if (diff > 0) {
        go(1);
      } else {
        go(-1);
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  if (!current || total === 0) return null;

  const bgImage = current.backdropUrl || current.posterUrl;

  return (
    <section
      className="relative w-full overflow-hidden bg-black"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
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
        {/* Enhanced Background Layers */}
        <div className="absolute inset-0">
          {/* Previous Image (fade out) */}
          <div className="bgImageWrapper">
            <img
              src={bgImage}
              alt=""
              className="bgImage"
              style={{
                filter: "saturate(1.25) contrast(1.12) brightness(1.15)",
                transform: imageLoaded ? "scale(1)" : "scale(1.15)",
                opacity: imageLoaded ? 1 : 0,
              }}
            />
          </div>

          {/* Vibrant Color Overlay */}
          <div
            className="colorGradient"
            style={{
              background: `radial-gradient(ellipse 85% 60% at 50% 25%, rgba(${dominant},0.28) 0%, rgba(${dominant},0.12) 50%, rgba(0,0,0,0) 80%)`,
            }}
          />

          {/* Lighter Bottom Gradient */}
          <div className="bottomGradient" />
          <div className="vignette" />
          <div className="filmGrain" />
        </div>

        {/* Cinematic Poster Showcase (Desktop) */}
        {isDesktop && (
          <div className="absolute left-20 top-1/2 -translate-y-1/2 z-15 pointer-events-none">
            <div className="relative" style={{ width: "340px", height: "510px" }}>
              {/* Previous Poster (slide out) */}
              {!imageLoaded && (
                <div
                  className="posterCard"
                  style={{
                    animation: direction === 1 ? "slideOutLeft 600ms ease-out forwards" : "slideOutRight 600ms ease-out forwards",
                  }}
                >
                  <img
                    src={list[direction === 1 ? prevIndex : nextIndex]?.posterUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Current Poster (slide in) */}
              <div
                className="posterCard"
                style={{
                  animation: imageLoaded
                    ? direction === 1
                      ? "slideInFromRight 700ms cubic-bezier(0.16, 1, 0.3, 1) forwards"
                      : "slideInFromLeft 700ms cubic-bezier(0.16, 1, 0.3, 1) forwards"
                    : "none",
                  opacity: imageLoaded ? 1 : 0,
                }}
              >
                <img
                  src={current.posterUrl}
                  alt={current.title}
                  className="w-full h-full object-cover"
                  onLoad={() => setImageLoaded(true)}
                />
                <div className="posterShine" />
              </div>
            </div>
          </div>
        )}

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

        {/* Always Responsive Navigation Arrows */}
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
              className="navArrow left-4 sm:left-6 top-[45%] -translate-y-1/2"
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
              className="navArrow right-4 sm:right-6 top-[45%] -translate-y-1/2"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Content Sheet with Enhanced Animations */}
        <div className="absolute inset-x-0 bottom-0 z-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 pb-6">
            <div key={`sheet-${current.id}`} className="infoSheetFixed">
              {/* Badges */}
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

              {/* Title */}
              <h1 className="titleClamp">{current.title}</h1>

              {/* Overview */}
              <div className="overviewSlot">
                {isDesktop && current.overview ? <p className="overviewClamp">{current.overview}</p> : <div />}
              </div>

              {/* CTA Button */}
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
        /* Optimized Background Transitions */
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
          transition: transform 1000ms cubic-bezier(0.16, 1, 0.3, 1), 
                      opacity 800ms ease-out,
                      filter 800ms ease-out;
          will-change: transform, opacity;
        }

        /* Vibrant, Lighter Overlays */
        .colorGradient {
          position: absolute;
          inset: 0;
          transition: background 900ms ease-out;
          pointer-events: none;
        }

        .bottomGradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(0,0,0,0) 0%,
            rgba(0,0,0,0.05) 40%,
            rgba(0,0,0,0.65) 80%,
            rgba(0,0,0,0.88) 100%
          );
          pointer-events: none;
        }

        .vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse at center,
            rgba(0,0,0,0) 45%,
            rgba(0,0,0,0.25) 80%,
            rgba(0,0,0,0.45) 100%
          );
          pointer-events: none;
        }

        .filmGrain {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.015;
          mix-blend-mode: overlay;
          pointer-events: none;
        }

        /* Cinematic Poster Card */
        .posterCard {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 
            0 60px 140px rgba(0,0,0,0.85),
            0 30px 70px rgba(0,0,0,0.6),
            0 0 100px rgba(255,255,255,0.08),
            inset 0 1px 0 rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.12);
        }

        .posterShine {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            transparent 0%,
            rgba(255,255,255,0.05) 45%,
            rgba(255,255,255,0.15) 50%,
            rgba(255,255,255,0.05) 55%,
            transparent 100%
          );
          animation: shine 3s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes shine {
          0%, 100% { transform: translateX(-100%) translateY(-100%); }
          50% { transform: translateX(100%) translateY(100%); }
        }

        /* Poster Slide Animations */
        @keyframes slideInFromRight {
          0% {
            opacity: 0;
            transform: translateX(80px) scale(0.92) rotateY(15deg);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1) rotateY(0deg);
          }
        }

        @keyframes slideInFromLeft {
          0% {
            opacity: 0;
            transform: translateX(-80px) scale(0.92) rotateY(-15deg);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1) rotateY(0deg);
          }
        }

        @keyframes slideOutLeft {
          0% {
            opacity: 1;
            transform: translateX(0) scale(1) rotateY(0deg);
          }
          100% {
            opacity: 0;
            transform: translateX(-80px) scale(0.92) rotateY(-15deg);
          }
        }

        @keyframes slideOutRight {
          0% {
            opacity: 1;
            transform: translateX(0) scale(1) rotateY(0deg);
          }
          100% {
            opacity: 0;
            transform: translateX(80px) scale(0.92) rotateY(15deg);
          }
        }

        /* Always Responsive Navigation */
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
          transition: all 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
        }

        .navArrow:hover {
          transform: scale(1.15);
          background: rgba(255,255,255,0.24);
          box-shadow: 0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3);
        }

        .navArrow:active {
          transform: scale(0.95);
          transition: all 100ms ease;
        }

        /* Info Sheet */
        .infoSheetFixed {
          width: 100%;
          height: 230px;
          border-radius: 24px;
          padding: 18px 18px 16px;
          background: rgba(0,0,0,0.28);
          border: 1px solid rgba(255,255,255,0.16);
          box-shadow: 0 28px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08);
          backdrop-filter: blur(28px) saturate(160%);
          -webkit-backdrop-filter: blur(28px) saturate(160%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          animation: slideUpFade 700ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
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
          background: rgba(255,255,255,0.14);
          border: 1px solid rgba(255,255,255,0.22);
          backdrop-filter: blur(16px) saturate(150%);
          -webkit-backdrop-filter: blur(16px) saturate(150%);
          animation: badgeFadeIn 500ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          opacity: 0;
        }

        @keyframes badgeFadeIn {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(-8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

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
          animation: titleSlideIn 600ms cubic-bezier(0.16, 1, 0.3, 1) 80ms forwards;
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
          color: rgba(255,255,255,0.82);
          font-size: 16px;
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          animation: fadeIn 500ms ease 150ms forwards;
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

        .ctaGlassPrimary {
          height: 52px;
          width: 100%;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-weight: 700;
          font-size: 15
