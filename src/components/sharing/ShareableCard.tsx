import { forwardRef } from "react";
import { motion } from "framer-motion";

interface ShareableCardProps {
  archetype: {
    name: string;
    icon: string;
    description: string;
    traits: string[];
    color_scheme: string[];
  };
  mood: string;
  className?: string;
}

// Animated line patterns for the shareable card
const LinePattern = () => (
  <svg 
    className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
    viewBox="0 0 400 500"
    preserveAspectRatio="xMidYMid slice"
  >
    {/* Horizontal flowing lines */}
    {[60, 140, 220, 300, 380, 460].map((y, i) => (
      <motion.path
        key={`h-${i}`}
        d={`M-50 ${y} Q100 ${y + (i % 2 === 0 ? 20 : -20)} 200 ${y} T450 ${y}`}
        fill="none"
        stroke="white"
        strokeWidth="0.8"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.6 }}
        transition={{ delay: i * 0.15, duration: 1.2, ease: "easeOut" }}
      />
    ))}
    
    {/* Accent dots */}
    {[
      { cx: 50, cy: 80 },
      { cx: 350, cy: 120 },
      { cx: 80, cy: 280 },
      { cx: 320, cy: 350 },
      { cx: 180, cy: 420 },
    ].map((dot, i) => (
      <motion.circle
        key={`dot-${i}`}
        cx={dot.cx}
        cy={dot.cy}
        r="4"
        fill="white"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.5 }}
        transition={{ delay: 0.8 + i * 0.1, type: "spring" }}
      />
    ))}
  </svg>
);

export const ShareableCard = forwardRef<HTMLDivElement, ShareableCardProps>(
  ({ archetype, mood, className = "" }, ref) => {
    const colorScheme = archetype.color_scheme;
    
    return (
      <div
        ref={ref}
        className={`relative overflow-hidden rounded-3xl ${className}`}
        style={{
          background: `linear-gradient(165deg, ${colorScheme[0]} 0%, ${colorScheme[1]} 50%, ${colorScheme[2]} 100%)`,
          aspectRatio: "4/5",
        }}
      >
        {/* Line pattern overlay */}
        <LinePattern />
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between p-8 text-white">
          {/* Top section */}
          <div className="space-y-1">
            <p className="text-sm font-medium opacity-80 tracking-wide uppercase">
              Your Movie Mood
            </p>
            <div className="w-12 h-0.5 bg-white/40 rounded-full" />
          </div>

          {/* Center - Main content */}
          <div className="space-y-6 text-center -mt-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="text-7xl"
            >
              {archetype.icon}
            </motion.div>
            
            <div className="space-y-3">
              <h1 className="font-display text-3xl font-bold tracking-tight">
                {archetype.name}
              </h1>
              <p className="text-sm text-white/80 max-w-[260px] mx-auto leading-relaxed">
                {archetype.description}
              </p>
            </div>

            {/* Traits */}
            <div className="flex flex-wrap justify-center gap-2">
              {archetype.traits.slice(0, 3).map((trait, index) => (
                <motion.span
                  key={trait}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-xs font-medium"
                >
                  {trait}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Bottom - Branding */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-xs">🎬</span>
              </div>
              <span className="text-xs font-medium opacity-70">MoodFlix</span>
            </div>
            
            <div className="px-2.5 py-1 rounded-full bg-white/15 text-xs font-medium">
              #{mood}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ShareableCard.displayName = "ShareableCard";
