import { Play, Star } from "lucide-react";

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
}: CinematicCarouselProps) => {
  const featuredMovie = movies[0];

  if (!featuredMovie) return null;

  return (
    <section className="relative w-full px-4 md:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Featured Label */}
        <div className="mb-4">
          <h2 className="font-display text-lg md:text-xl font-semibold text-foreground">Featured</h2>
        </div>

        {/* Static Hero Banner */}
        <div className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-card shadow-lg aspect-[16/9] md:aspect-[21/9]">
          {/* Background Image */}
          <img
            src={featuredMovie.backdropUrl || featuredMovie.posterUrl}
            alt={featuredMovie.title}
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
                  <span className="font-semibold text-white">{featuredMovie.rating.toFixed(1)}</span>
                </div>
                <span className="text-white/80">{featuredMovie.year}</span>
                {featuredMovie.genre && (
                  <span className="text-white/60">• {featuredMovie.genre}</span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
                {featuredMovie.title}
              </h3>

              {/* Overview */}
              {featuredMovie.overview && (
                <p className="text-white/80 text-sm md:text-base line-clamp-2 hidden sm:block">
                  {featuredMovie.overview}
                </p>
              )}

              {/* CTA Button */}
              <button
                onClick={() => onMovieSelect(featuredMovie)}
                className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 md:px-6 md:py-3 rounded-full font-semibold text-sm md:text-base hover:bg-white/90 transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
