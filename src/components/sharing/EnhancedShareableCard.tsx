import { forwardRef } from "react";
import { motion } from "framer-motion";

interface EnhancedShareableCardProps {
  archetype: {
    name: string;
    icon: string;
    description: string;
    traits: string[];
    color_scheme: string[];
  };
  mood: string;
  movies?: Array<{
    id: number;
    title: string;
    posterUrl: string;
    rating?: number;
  }>;
  className?: string;
}

// Animated geometric patterns for modern aesthetic
const GeometricPattern = () => (
  <svg 
    className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none"
    viewBox="0 0 400 500"
    preserveAspectRatio="xMidYMid slice"
  >
    {/* Diagonal lines */}
    {[...Array(12)].map((_, i) => (
      <motion.line
        key={`line-${i}`}
        x1={-50 + i * 40}
        y1={0}
        x2={-50 + i * 40 + 200}
        y2={500}
        stroke="white"
        strokeWidth="0.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: i * 0.05, duration: 1 }}
      />
    ))}
    
    {/* Circles */}
    {[
      { cx: 320, cy: 80, r: 40 },
      { cx: 60, cy: 420, r: 30 },
    ].map((circle, i) => (
      <motion.circle
        key={`circle-${i}`}
        cx={circle.cx}
        cy={circle.cy}
        r={circle.r}
        fill="none"
        stroke="white"
        strokeWidth="1"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 + i * 0.2, type: "spring" }}
      />
    ))}
  </svg>
);

// Movie poster thumbnails section
const MovieThumbnails = ({ movies }: { movies: NonNullable<EnhancedShareableCardProps['movies']> }) => (
  <div className="flex gap-2 justify-center mt-4">
    {movies.slice(0, 3).map((movie, index) => (
      <motion.div
        key={movie.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 + index * 0.1 }}
        className="relative w-12 h-16 rounded-lg overflow-hidden ring-2 ring-white/20"
      >
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
        />
        {movie.rating && (
          <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] text-center py-0.5">
            ⭐ {movie.rating.toFixed(1)}
          </div>
        )}
      </motion.div>
    ))}
  </div>
);

export const EnhancedShareableCard = forwardRef<HTMLDivElement, EnhancedShareableCardProps>(
  ({ archetype, mood, movies, className = "" }, ref) => {
    const colorScheme = archetype.color_scheme;
    
    // Create a more sophisticated gradient
    const gradientStyle = {
      background: `
        radial-gradient(ellipse at 20% 20%, ${colorScheme[0]}dd 0%, transparent 50%),
        radial-gradient(ellipse at 80% 80%, ${colorScheme[2]}dd 0%, transparent 50%),
        linear-gradient(135deg, ${colorScheme[0]} 0%, ${colorScheme[1]} 50%, ${colorScheme[2]} 100%)
      `,
    };
    
    return (
      <div
        ref={ref}
        className={`relative overflow-hidden rounded-3xl shadow-2xl ${className}`}
        style={{
          ...gradientStyle,
          aspectRatio: "4/5",
          width: 320,
        }}
      >
        {/* Geometric pattern overlay */}
        <GeometricPattern />
        
        {/* Noise texture overlay for depth */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between p-6 text-white">
          {/* Top section - Branding */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <span className="text-sm">🎬</span>
              </div>
              <span className="text-sm font-semibold tracking-wide opacity-90">MoodFlix</span>
            </div>
            
            <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-medium border border-white/10">
              Mood Match
            </div>
          </div>

          {/* Center - Main content */}
          <div className="space-y-4 text-center flex-1 flex flex-col justify-center -mt-4">
            {/* Icon with glow effect */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative mx-auto"
            >
              <div className="absolute inset-0 blur-2xl bg-white/20 rounded-full scale-150" />
              <span className="relative text-6xl">{archetype.icon}</span>
            </motion.div>
            
            <div className="space-y-2">
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xs uppercase tracking-[0.2em] opacity-70"
              >
                I am
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="font-display text-2xl font-bold tracking-tight"
              >
                {archetype.name}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ delay: 0.4 }}
                className="text-sm max-w-[240px] mx-auto leading-relaxed"
              >
                {archetype.description}
              </motion.p>
            </div>

            {/* Traits as minimal pills */}
            <div className="flex flex-wrap justify-center gap-1.5 mt-2">
              {archetype.traits.slice(0, 4).map((trait, index) => (
                <motion.span
                  key={trait}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.08 }}
                  className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm text-[10px] font-medium border border-white/10"
                >
                  {trait}
                </motion.span>
              ))}
            </div>

            {/* Movie recommendations preview */}
            {movies && movies.length > 0 && (
              <MovieThumbnails movies={movies} />
            )}
          </div>

          {/* Bottom - Mood hashtag and CTA */}
          <div className="flex items-center justify-between">
            <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-medium border border-white/10">
              #{mood}
            </div>
            
            <p className="text-[10px] opacity-50">
              Discover yours at moodflix.app
            </p>
          </div>
        </div>
      </div>
    );
  }
);

EnhancedShareableCard.displayName = "EnhancedShareableCard";
