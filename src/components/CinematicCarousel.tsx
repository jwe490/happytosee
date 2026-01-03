import React, { useState } from 'react';
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
  }
];

export default function CinemaCarousel() {
  const [active, setActive] = useState(0);
  
  const next = () => setActive((active + 1) % movies.length);
  const prev = () => setActive(active === 0 ? movies.length - 1 : active - 1);
  
  const activeMovie = movies[active];

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: '#FAFAFA' }}>
      {/* Background with color */}
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse at center, rgba(${activeMovie.color}, 0.12), rgba(${activeMovie.color}, 0.03) 50%, #FAFAFA)`
        }}
      />

      {/* Main Container */}
      <div className="relative h-full flex items-center justify-center px-8">
        <div className="relative flex items-center justify-center" style={{ height: '540px', width: '100%', maxWidth: '1400px' }}>
          
          {/* Cards */}
          {movies.map((movie, idx) => {
            const offset = idx - active;
            const isActive = idx === active;
            const isVisible = Math.abs(offset) <= 1;
            
            if (!isVisible) return null;

            return (
              <div
                key={movie.id}
                className="absolute cursor-pointer transition-all duration-500"
                style={{
                  transform: `translateX(${offset * 280}px) scale(${isActive ? 1 : 0.88})`,
                  opacity: isActive ? 1 : 0.3,
                  filter: isActive ? 'none' : 'blur(1px)',
                  zIndex: isActive ? 20 : 10
                }}
                onClick={() => !isActive && setActive(idx)}
              >
                {/* Card */}
                <div 
                  className="relative overflow-hidden rounded-2xl"
                  style={{
                    width: '360px',
                    height: '540px',
                    border: '1px solid rgba(255,255,255,0.3)',
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: isActive ? `0 40px 120px rgba(${movie.color}, 0.3)` : 'none'
                  }}
                >
                  {/* Image */}
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Gradient Overlay */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(to bottom, transparent 25%, rgba(0,0,0,0.9) 100%)'
                    }}
                  />

                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-between" style={{ zIndex: 10 }}>
                    {/* Top Badges */}
                    <div className="flex gap-2">
                      <div 
                        className="px-2.5 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1"
                        style={{
                          background: 'rgba(0,0,0,0.4)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}
                      >
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {movie.rating}
                      </div>
                      <div 
                        className="px-2.5 py-1 rounded-full text-xs text-white"
                        style={{
                          background: 'rgba(0,0,0,0.3)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}
                      >
                        {movie.year}
                      </div>
                      <div 
                        className="px-2.5 py-1 rounded-full text-xs text-white"
                        style={{
                          background: 'rgba(0,0,0,0.3)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}
                      >
                        {movie.genre}
                      </div>
                    </div>

                    {/* Bottom Title & Button */}
                    <div className="space-y-4">
                      <h2 
                        className="text-4xl font-bold text-white leading-tight"
                        style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}
                      >
                        {movie.title}
                      </h2>
                      <button 
                        className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-transform hover:-translate-y-1"
                        style={{
                          background: 'rgba(255,255,255,0.25)',
                          backdropFilter: 'blur(16px)',
                          border: '1px solid rgba(255,255,255,0.4)'
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

          {/* Left Arrow */}
          <button
            onClick={prev}
            className="absolute left-6 z-30 w-14 h-14 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110"
            style={{
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.3)'
            }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={next}
            className="absolute right-6 z-30 w-14 h-14 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110"
            style={{
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.3)'
            }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Dots */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-8 z-30">
          {movies.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActive(idx)}
              className="transition-all"
              style={{
                width: idx === active ? '32px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: idx === active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
