import { useState, useEffect, useCallback, memo } from "react";
import { ChevronLeft, ChevronRight, Play, Star } from "lucide-react";
import { cn } from "@/lib/utils";

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

// Memoized slide component for performance
const CarouselSlide = memo(({ movie, onMovieSelect }: { movie: Movie; onMovieSelect: (movie: Movie) => void }) => (
  <div className="absolute inset-0 animate-fade-in">
    {/* Background Image */}
    <img
      src={movie.backdropUrl || movie.posterUrl}
      alt={movie.title}
      className="w-full h-full object-cover"
      loading="eager"
      fetchPriority="high"
    />

    {/* Gradient Overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

    {/* Content */}
    <div className="absolute inset-0 flex items-center">
      <div className="px-6 md:px-10 lg:px-12 max-w-xl space-y-3 md:space-y-4">
        {/* Rating & Year */}
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="font-semibold text-white">{movie.rating.toFixed(1)}</span>
          </div>
          <span className="text-white/80">{movie.year}</span>
          {movie.genre && (
            <span className="text-white/60">• {movie.genre}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight font-display">
          {movie.title}
        </h3>

        {/* Overview */}
        {movie.overview && (
          <p className="text-white/80 text-sm md:text-base line-clamp-2 hidden sm:block">
            {movie.overview}
          </p>
        )}

        {/* CTA Button */}
        <button
          onClick={() => onMovieSelect(movie)}
          className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 md:px-6 md:py-3 rounded-full font-semibold text-sm md:text-base hover:bg-white/90 active:scale-95 transition-all"
        >
          <Play className="w-4 h-4 fill-current" />
          View Details
        </button>
      </div>
    </div>
  </div>
));
CarouselSlide.displayName = "CarouselSlide";

export const CinematicCarousel = ({
  movies,
  onMovieSelect,
  autoPlayInterval = 6000,
}: CinematicCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const currentMovie = movies[currentIndex];

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  }, [movies.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
  }, [movies.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || movies.length <= 1) return;

    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isAutoPlaying, goToNext, autoPlayInterval, movies.length]);

  const handleInteraction = useCallback(() => {
    setIsAutoPlaying(false);
    const timer = setTimeout(() => setIsAutoPlaying(true), 10000);
    return () => clearTimeout(timer);
  }, []);

  if (!currentMovie) return null;

  return (
    <section className="relative w-full px-4 md:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Featured Label */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg md:text-xl font-semibold text-foreground">Featured</h2>
          <div className="flex items-center gap-1">
            {movies.map((_, index) => (
              <button
                key={index}
                onClick={() => { goToSlide(index); handleInteraction(); }}
                className="p-2 -m-1 flex items-center justify-center"
                aria-label={`Go to slide ${index + 1}`}
              >
                <span className={cn(
                  "block h-1.5 rounded-full transition-all duration-300",
                  index === currentIndex ? "w-6 bg-foreground" : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground"
                )} />
              </button>
            ))}
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-card shadow-lg aspect-[16/9] md:aspect-[21/9]">
          {/* Use key to trigger CSS animation on slide change */}
          <CarouselSlide
            key={currentIndex}
            movie={currentMovie}
            onMovieSelect={onMovieSelect}
          />

          {/* Navigation Arrows */}
          {movies.length > 1 && (
            <>
              <button
                onClick={() => { goToPrevious(); handleInteraction(); }}
                className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 active:scale-95 transition-all"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              <button
                onClick={() => { goToNext(); handleInteraction(); }}
                className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 active:scale-95 transition-all"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
