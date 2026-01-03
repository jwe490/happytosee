import { useState, useEffect } from "react";
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

export const CinematicCarousel = ({
  movies,
  onMovieSelect,
  autoPlayInterval = 5000,
}: CinematicCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dominantColor, setDominantColor] = useState("220, 38, 38");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const currentMovie = movies[currentIndex];

  useEffect(() => {
    if (currentMovie?.posterUrl) {
      extractDominantColor(currentMovie.posterUrl)
        .then((color) => setDominantColor(color))
        .catch(() => setDominantColor("220, 38, 38"));
    }
  }, [currentMovie]);

  useEffect(() => {
    if (movies.length <= 1) return;
    const interval = setInterval(() => {
      goToNext();
    }, autoPlayInterval);
    return () => clearInterval(interval);
  }, [movies.length, autoPlayInterval, currentIndex]);

  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % movies.length);
    setTimeout(() => setIsTransitioning(false), 600);
  };

  const goToPrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
    setTimeout(() => setIsTransitioning(false), 600);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 600);
  };

  if (!currentMovie || movies.length === 0) return null;

  return (
    <section className="relative w-full bg-black">
      {/* DESKTOP - Netflix Style Split Layout */}
      {isDesktop ? (
        <div className="relative w-full" style={{ height: "calc(100vh - 80px)", minHeight: "650px", maxHeight: "850px" }}>
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              key={currentMovie.id}
              className="absolute inset-0 transition-opacity duration-1000"
            >
              <img
                src={currentMovie.backdropUrl || currentMovie.posterUrl}
                alt=""
                className="w-full h-full object-cover"
                style={{ filter: "blur(60px) brightness(0.3)" }}
              />
            </div>
            <div
              className="absolute inset-0 transition-all duration-1000"
              style={{
                background: `linear-gradient(90deg, rgba(0,0,0,0.98) 0%, rgba(${dominantColor},0.08) 50%, rgba(0,0,0,0.98) 100%)`,
              }}
            />
          </div>

          {/* Content Container */}
          <div className="relative h-full max-w-[1600px] mx-auto px-20 flex items-center">
            <div className="grid grid-cols-5 gap-16 items-center w-full">
              
              {/* LEFT SIDE - Poster (2 columns) */}
              <div className="col-span-2 flex items-center justify-end">
                <div
                  key={`poster-${currentMovie.id}`}
                  className="relative group cursor-pointer"
                  onClick={() => onMovieSelect(currentMovie)}
                  style={{
                    width: "380px",
                    height: "570px",
                    animation: "fadeIn 0.6s ease-out",
                  }}
                >
                  <div
                    className="relative w-full h-full rounded-2xl overflow-hidden"
                    style={{
                      boxShadow: `0 60px 120px rgba(0,0,0,0.9), 0 0 100px rgba(${dominantColor},0.5)`,
                    }}
                  >
                    <img
                      src={currentMovie.posterUrl}
                      alt={currentMovie.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <div
                        className="w-24 h-24 rounded-full flex items-center justify-center backdrop-blur-xl"
                        style={{
                          background: "rgba(255,255,255,0.25)",
                          border: "2px solid rgba(255,255,255,0.4)",
                        }}
                      >
                        <Play className="w-12 h-12 text-white ml-2" fill="white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE - Movie Info (3 columns) */}
              <div
                key={`info-${currentMovie.id}`}
                className="col-span-3 space-y-8 pl-8"
                style={{
                  animation: "slideInRight 0.6s ease-out",
                }}
              >
                {/* Badges */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full"
                    style={{
                      background: "rgba(255,215,0,0.15)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,215,0,0.35)",
                    }}
                  >
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-yellow-400 font-bold text-lg">
                      {currentMovie.rating.toFixed(1)}
                    </span>
                  </div>

                  <div
                    className="px-5 py-2.5 rounded-full text-white/90 font-semibold text-base"
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  >
                    {currentMovie.year}
                  </div>

                  {currentMovie.genre && (
                    <div
                      className="px-5 py-2.5 rounded-full text-white/90 font-semibold text-base"
                      style={{
                        background: "rgba(255,255,255,0.12)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.2)",
                      }}
                    >
                      {currentMovie.genre.split(",")[0].trim()}
                    </div>
                  )}
                </div>

                {/* Title */}
                <h1
                  className="font-bold text-white leading-[1.1]"
                  style={{
                    fontSize: "clamp(3rem, 5vw, 5rem)",
                    letterSpacing: "-0.03em",
                    textShadow: "0 8px 32px rgba(0,0,0,0.9)",
                  }}
                >
                  {currentMovie.title}
                </h1>

                {/* Overview */}
                {currentMovie.overview && (
                  <p className="text-xl text-white/75 leading-relaxed max-w-2xl line-clamp-3">
                    {currentMovie.overview}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-4 pt-2">
                  <button
                    onClick={() => onMovieSelect(currentMovie)}
                    className="flex items-center gap-3 px-12 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: "white",
                      color: "black",
                      boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
                    }}
                  >
                    <Play className="w-6 h-6" fill="black" />
                    Play Now
                  </button>

                  <button
                    className="px-10 py-4 rounded-full font-semibold text-white text-lg transition-all hover:bg-white/25"
                    style={{
                      background: "rgba(255,255,255,0.18)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.25)",
                    }}
                  >
                    More Info
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={goToPrevious}
              disabled={isTransitioning}
              className="absolute left-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:scale-110 transition-all disabled:opacity-50 z-30"
              style={{
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <button
              onClick={goToNext}
              disabled={isTransitioning}
              className="absolute right-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:scale-110 transition-all disabled:opacity-50 z-30"
              style={{
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>

          {/* Progress Dots */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30">
            {movies.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className="rounded-full transition-all hover:scale-125 disabled:opacity-50"
                style={{
                  width: index === currentIndex ? "48px" : "10px",
                  height: "4px",
                  background:
                    index === currentIndex
                      ? `rgb(${dominantColor})`
                      : "rgba(255,255,255,0.35)",
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        /* MOBILE - Clean Portrait Layout */
        <div className="relative w-full min-h-screen bg-black py-4">
          <div
            className="absolute inset-0 transition-opacity duration-1000"
            style={{
              background: `radial-gradient(circle at top, rgba(${dominantColor},0.25), rgba(0,0,0,0.98))`,
            }}
          />

          <div className="relative h-full flex flex-col items-center justify-center px-5 py-12 space-y-6">
            {/* Poster Card */}
            <div
              key={`mobile-${currentMovie.id}`}
              className="relative"
              style={{
                width: "min(90vw, 360px)",
                height: "min(135vw, 540px)",
                animation: "fadeIn 0.5s ease-out",
              }}
            >
              <div
                className="relative w-full h-full rounded-3xl overflow-hidden"
                style={{
                  boxShadow: `0 50px 100px rgba(0,0,0,0.9), 0 0 80px rgba(${dominantColor},0.4)`,
                }}
              >
                <img
                  src={currentMovie.posterUrl}
                  alt={currentMovie.title}
                  className="w-full h-full object-cover"
                />

                {/* Bottom Gradient */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to top, rgba(0,0,0,0.98) 0%, transparent 60%)",
                  }}
                />

                {/* Top Badges */}
                <div className="absolute top-6 left-6 flex gap-2.5">
                  <div
                    className="flex items-center gap-2 px-3.5 py-2 rounded-full"
                    style={{
                      background: "rgba(255,215,0,0.2)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,215,0,0.4)",
                    }}
                  >
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-yellow-400 text-sm font-bold">
                      {currentMovie.rating.toFixed(1)}
                    </span>
                  </div>

                  <div
                    className="px-3.5 py-2 rounded-full text-white text-sm font-medium"
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  >
                    {currentMovie.year}
                  </div>
                </div>

                {/* Bottom Content */}
                <div className="absolute bottom-0 left-0 right-0 p-7 space-y-5">
                  <h2 className="text-4xl font-bold text-white leading-tight">
                    {currentMovie.title}
                  </h2>

                  {currentMovie.genre && (
                    <p className="text-white/70 text-base">
                      {currentMovie.genre.split(",")[0].trim()}
                    </p>
                  )}

                  <button
                    onClick={() => onMovieSelect(currentMovie)}
                    className="w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3"
                    style={{
                      background: "white",
                      color: "black",
                      boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
                    }}
                  >
                    <Play className="w-5 h-5" fill="black" />
                    Watch Now
                  </button>
                </div>
              </div>
            </div>

            {/* Dots */}
            <div className="flex items-center gap-2.5 pt-4">
              {movies.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  disabled={isTransitioning}
                  className="rounded-full transition-all disabled:opacity-50"
                  style={{
                    width: index === currentIndex ? "40px" : "8px",
                    height: "4px",
                    background:
                      index === currentIndex
                        ? `rgb(${dominantColor})`
                        : "rgba(255,255,255,0.35)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </section>
  );
};
