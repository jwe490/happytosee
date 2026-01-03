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
  const [fade, setFade] = useState(true);

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
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % movies.length);
        setFade(true);
      }, 300);
    }, autoPlayInterval);
    return () => clearInterval(interval);
  }, [movies.length, autoPlayInterval]);

  const goToNext = () => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
      setFade(true);
    }, 300);
  };

  const goToPrevious = () => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
      setFade(true);
    }, 300);
  };

  const goToSlide = (index: number) => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex(index);
      setFade(true);
    }, 300);
  };

  if (!currentMovie || movies.length === 0) return null;

  return (
    <section className="relative w-full bg-black">
      {isDesktop ? (
        <div className="relative w-full h-screen max-h-[900px] min-h-[600px] overflow-hidden">
          {/* Background */}
          <div
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: fade ? 1 : 0 }}
          >
            <div className="absolute inset-0 bg-black">
              <img
                src={currentMovie.backdropUrl || currentMovie.posterUrl}
                alt=""
                className="w-full h-full object-cover opacity-30"
                style={{ filter: "blur(50px)" }}
              />
            </div>
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to right, rgba(0,0,0,0.98) 0%, rgba(${dominantColor},0.1) 50%, rgba(0,0,0,0.98) 100%)`,
              }}
            />
          </div>

          {/* Content */}
          <div className="relative h-full max-w-7xl mx-auto px-16 flex items-center">
            <div className="grid grid-cols-2 gap-20 items-center w-full">
              {/* LEFT: Poster */}
              <div className="flex items-center justify-center">
                <div
                  className="relative cursor-pointer transition-opacity duration-500"
                  onClick={() => onMovieSelect(currentMovie)}
                  style={{
                    width: "400px",
                    height: "600px",
                    opacity: fade ? 1 : 0,
                    transform: fade ? "scale(1)" : "scale(0.95)",
                    transition: "all 0.5s ease",
                  }}
                >
                  <div
                    className="relative w-full h-full rounded-3xl overflow-hidden group"
                    style={{
                      boxShadow: `0 50px 100px rgba(0,0,0,0.9), 0 0 80px rgba(${dominantColor},0.4)`,
                    }}
                  >
                    <img
                      src={currentMovie.posterUrl}
                      alt={currentMovie.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center"
                        style={{
                          background: "rgba(255,255,255,0.2)",
                          backdropFilter: "blur(10px)",
                        }}
                      >
                        <Play className="w-10 h-10 text-white ml-1" fill="white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: Info */}
              <div
                className="space-y-8 transition-opacity duration-500"
                style={{ opacity: fade ? 1 : 0 }}
              >
                {/* Badges */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center gap-2 px-4 py-2 rounded-full"
                    style={{
                      background: "rgba(255,215,0,0.15)",
                      border: "1px solid rgba(255,215,0,0.3)",
                    }}
                  >
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-yellow-400 font-bold">
                      {currentMovie.rating.toFixed(1)}
                    </span>
                  </div>
                  <div
                    className="px-4 py-2 rounded-full text-white/90 font-medium"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    {currentMovie.year}
                  </div>
                  {currentMovie.genre && (
                    <div
                      className="px-4 py-2 rounded-full text-white/90 font-medium"
                      style={{
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.15)",
                      }}
                    >
                      {currentMovie.genre.split(",")[0].trim()}
                    </div>
                  )}
                </div>

                {/* Title */}
                <h1
                  className="text-7xl font-bold text-white leading-tight"
                  style={{
                    letterSpacing: "-0.02em",
                    textShadow: "0 4px 20px rgba(0,0,0,0.8)",
                  }}
                >
                  {currentMovie.title}
                </h1>

                {/* Overview */}
                {currentMovie.overview && (
                  <p className="text-xl text-white/70 leading-relaxed max-w-2xl">
                    {currentMovie.overview.length > 200
                      ? currentMovie.overview.substring(0, 200) + "..."
                      : currentMovie.overview}
                  </p>
                )}

                {/* Buttons */}
                <div className="flex items-center gap-4 pt-4">
                  <button
                    onClick={() => onMovieSelect(currentMovie)}
                    className="flex items-center gap-3 px-10 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105"
                    style={{
                      background: "white",
                      color: "black",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                    }}
                  >
                    <Play className="w-6 h-6" fill="black" />
                    Play Now
                  </button>
                  <button
                    className="flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-white transition-all hover:bg-white/25"
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  >
                    More Info
                  </button>
                </div>
              </div>
            </div>

            {/* Arrows */}
            <button
              onClick={goToPrevious}
              className="absolute left-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:scale-110 transition-all z-30"
              style={{
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:scale-110 transition-all z-30"
              style={{
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          </div>

          {/* Dots */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30">
            {movies.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className="rounded-full transition-all"
                style={{
                  width: index === currentIndex ? "40px" : "8px",
                  height: "4px",
                  background:
                    index === currentIndex
                      ? `rgb(${dominantColor})`
                      : "rgba(255,255,255,0.3)",
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        /* MOBILE */
        <div className="relative w-full min-h-screen bg-black overflow-hidden py-8">
          <div
            className="absolute inset-0 transition-opacity duration-700"
            style={{
              opacity: fade ? 1 : 0,
              background: `radial-gradient(circle at center, rgba(${dominantColor},0.2), rgba(0,0,0,0.95))`,
            }}
          />

          <div className="relative h-full flex flex-col items-center justify-center px-6 py-16 space-y-8">
            <div
              className="relative transition-opacity duration-500"
              style={{
                width: "340px",
                height: "510px",
                opacity: fade ? 1 : 0,
              }}
            >
              <div
                className="relative w-full h-full rounded-3xl overflow-hidden"
                style={{
                  boxShadow: `0 40px 80px rgba(0,0,0,0.8), 0 0 60px rgba(${dominantColor},0.3)`,
                }}
              >
                <img
                  src={currentMovie.posterUrl}
                  alt={currentMovie.title}
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 50%)",
                  }}
                />

                <div className="absolute top-5 left-5 flex gap-2">
                  <div
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full"
                    style={{
                      background: "rgba(255,215,0,0.2)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,215,0,0.4)",
                    }}
                  >
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-yellow-400 text-sm font-bold">
                      {currentMovie.rating.toFixed(1)}
                    </span>
                  </div>
                  <div
                    className="px-3 py-2 rounded-full text-white text-sm font-medium"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  >
                    {currentMovie.year}
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
                  <h2 className="text-3xl font-bold text-white leading-tight">
                    {currentMovie.title}
                  </h2>
                  {currentMovie.genre && (
                    <p className="text-white/70 text-sm">
                      {currentMovie.genre.split(",")[0].trim()}
                    </p>
                  )}
                  <button
                    onClick={() => onMovieSelect(currentMovie)}
                    className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2"
                    style={{
                      background: "white",
                      color: "black",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                    }}
                  >
                    <Play className="w-5 h-5" fill="black" />
                    Watch Now
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {movies.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className="rounded-full transition-all"
                  style={{
                    width: index === currentIndex ? "32px" : "8px",
                    height: "4px",
                    background:
                      index === currentIndex
                        ? `rgb(${dominantColor})`
                        : "rgba(255,255,255,0.3)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
