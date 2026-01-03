import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const movies = [
  {
    id: 1,
    title: "Blade Runner 2049",
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80",
    rating: "8.0",
    year: "2017",
    genre: "Sci-Fi",
    color: "255, 107, 53"
  },
  {
    id: 2,
    title: "Interstellar",
    poster: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&q=80",
    rating: "8.7",
    year: "2014",
    genre: "Adventure",
    color: "59, 130, 246"
  },
  {
    id: 3,
    title: "The Grand Budapest",
    poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80",
    rating: "8.1",
    year: "2014",
    genre: "Comedy",
    color: "236, 72, 153"
  },
  {
    id: 4,
    title: "Mad Max: Fury Road",
    poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80",
    rating: "8.1",
    year: "2015",
    genre: "Action",
    color: "251, 146, 60"
  },
  {
    id: 5,
    title: "Arrival",
    poster: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80",
    rating: "7.9",
    year: "2016",
    genre: "Drama",
    color: "168, 85, 247"
  }
];

export default function CinematicCarousel() {
  const [active, setActive] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const goToSlide = useCallback((index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActive(index);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning]);

  const goToPrev = useCallback(() => {
    goToSlide(active === 0 ? movies.length - 1 : active - 1);
  }, [active, goToSlide]);

  const goToNext = useCallback(() => {
    goToSlide(active === movies.length - 1 ? 0 : active + 1);
  }, [active, goToSlide]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrev, goToNext]);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) goToNext();
    if (touchStart - touchEnd < -75) goToPrev();
  };

  const activeMovie = movies[active];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#FAFAFA]">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-out"
        style={{
          background: `radial-gradient(ellipse at center, rgba(${activeMovie.color}, 0.12) 0%, rgba(${activeMovie.color}, 0.03) 50%, #FAFAFA 100%)`,
          backdropFilter: 'blur(80px)'
        }}
      />

      {/* Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.08) 100%)'
        }}
      />

      {/* Carousel Container */}
      <div className="relative h-full flex items-center justify-center px-4 md:px-8">
        {/* Edge Fade Mask */}
        <div 
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)'
          }}
        />

        {/* Cards Container */}
        <div 
          className="relative w-full max-w-7xl mx-auto flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="relative w-full flex items-center justify-center" style={{ height: '540px' }}>
            {movies.map((movie, index) => {
              const offset = index - active;
              const isActive = index === active;
              const isAdjacent = Math.abs(offset) === 1;
              const isVisible = Math.abs(offset) <= 1;

              return (
                <div
                  key={movie.id}
                  className="absolute transition-all duration-[600ms] cursor-pointer"
                  style={{
                    transform: `translateX(${offset * 280}px) scale(${isActive ? 1 : 0.88})`,
                    opacity: isActive ? 1 : isAdjacent ? 0.3 : 0,
                    filter: isActive ? 'blur(0)' : 'blur(1px)',
                    zIndex: isActive ? 20 : isAdjacent ? 10 : 0,
                    pointerEvents: isVisible ? 'auto' : 'none',
                    transitionTimingFunction: 'cubic-bezier(0.22, 0.61, 0.36, 1)'
                  }}
                  onClick={() => !isActive && goToSlide(index)}
                >
                  {/* Card */}
                  <div 
                    className="relative overflow-hidden rounded-2xl w-[320px] h-[480px] md:w-[360px] md:h-[540px]"
                    style={{
                      border: '1px solid rgba(255,255,255,0.3)',
                      background: 'rgba(255,255,255,0.05)',
                      backdropFilter: 'blur(20px) saturate(120%)',
                      boxShadow: isActive ? `0 40px 120px rgba(${movie.color}, 0.3)` : 'none'
                    }}
                  >
                    {/* Poster with Ken Burns */}
                    <div className="absolute inset-0 overflow-hidden">
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                        style={{
                          animation: isActive ? 'kenBurns 12s ease-in-out infinite alternate' : 'none'
                        }}
                      />
                      {/* Gradient Overlay */}
                      <div 
                        className="absolute inset-0"
                        style={{
                          background: 'linear-gradient(to bottom, transparent 25%, rgba(0,0,0,0.92) 100%)'
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-between">
                      {/* Badges */}
                      <div className="flex gap-2">
                        <div 
                          className="px-2.5 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1"
                          style={{
                            background: 'rgba(0,0,0,0.35)',
                            backdropFilter: 'blur(16px) saturate(150%)',
                            border: '1px solid rgba(255,255,255,0.15)'
                          }}
                        >
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {movie.rating}
                        </div>
                        <div 
                          className="px-2.5 py-1 rounded-full text-xs font-medium text-white"
                          style={{
                            background: 'rgba(0,0,0,0.3)',
                            backdropFilter: 'blur(16px) saturate(150%)',
                            border: '1px solid rgba(255,255,255,0.15)'
                          }}
                        >
                          {movie.year}
                        </div>
                        <div 
                          className="px-2.5 py-1 rounded-full text-xs font-medium text-white"
                          style={{
                            background: 'rgba(0,0,0,0.3)',
                            backdropFilter: 'blur(16px) saturate(150%)',
                            border: '1px solid rgba(255,255,255,0.15)'
                          }}
                        >
                          {movie.genre}
                        </div>
                      </div>

                      {/* Title & Button */}
                      <div className="space-y-4">
                        <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                          {movie.title}
                        </h2>
                        <button 
                          className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
                          style={{
                            background: 'rgba(255,255,255,0.25)',
                            backdropFilter: 'blur(16px) saturate(180%)',
                            border: '1px solid rgba(255,255,255,0.4)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 4px 12px rgba(0,0,0,0.15)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.35)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrev}
            className="absolute left-4 md:left-6 z-30 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
            style={{
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(20px) saturate(150%)',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 md:right-6 z-30 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
            style={{
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(20px) saturate(150%)',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-8 z-30">
          {movies.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="transition-all duration-300"
              style={{
                width: index === active ? '32px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: index === active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                backdropFilter: 'blur(8px)'
              }}
            />
          ))}
        </div>
      </div>

      {/* Ken Burns Animation */}
      <style>{`
        @keyframes kenBurns {
          0% { transform: scale(1); }
          100% { transform: scale(1.015); }
        }
      `}</style>
    </div>
  );
          }
