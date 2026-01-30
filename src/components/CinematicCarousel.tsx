import { useEffect, useRef } from "react";
import { Splide, SplideSlide, SplideTrack } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import "./CinematicCarousel.css";

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
  autoPlayInterval = 3200,
}: CinematicCarouselProps) => {
  const splideRef = useRef<Splide>(null);

  useEffect(() => {
    if (splideRef.current) {
      const splide = splideRef.current.splide;
      if (splide) {
        splide.on("click", (slide) => {
          const index = slide.index;
          const movie = movies[index];
          if (movie && slide.slide.classList.contains("is-active")) {
            onMovieSelect(movie);
          }
        });
      }
    }
  }, [movies, onMovieSelect]);

  if (!movies || movies.length === 0) return null;

  return (
    <section className="cinematic-carousel-section">
      <Splide
        ref={splideRef}
        hasTrack={false}
        options={{
          type: "loop",
          perPage: 5,
          focus: "center",
          gap: "12px",
          speed: 650,
          easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          autoplay: true,
          interval: autoPlayInterval,
          pauseOnHover: true,
          pauseOnFocus: true,
          arrows: false,
          pagination: true,
          drag: true,
          updateOnMove: true,
          trimSpace: false,
          breakpoints: {
            640: { perPage: 1, gap: "8px" },
            768: { perPage: 3, gap: "10px" },
            1024: { perPage: 5, gap: "12px" },
          },
        }}
        aria-label="Featured Movies"
        className="cinematic-morph"
      >
        <SplideTrack>
          {movies.map((movie) => (
            <SplideSlide key={movie.id}>
              <div
                className="slide-content"
                onClick={() => onMovieSelect(movie)}
              >
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  loading="lazy"
                  draggable={false}
                />
                <div className="slide-overlay">
                  <span className="slide-title">{movie.title}</span>
                </div>
              </div>
            </SplideSlide>
          ))}
        </SplideTrack>

        <div className="splide__pagination cinematic-pagination"></div>
      </Splide>
    </section>
  );
};
