import { motion } from "framer-motion";

export const HeroIllustration = () => (
  <motion.svg
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.8, delay: 0.48, ease: [0.16, 1, 0.3, 1] }}
    viewBox="0 0 480 560"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <defs>
      <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#B794F6" />
        <stop offset="100%" stopColor="#9F7AEA" />
      </linearGradient>
      <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#34D399" />
      </linearGradient>
      <linearGradient id="pinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F9A8D4" />
        <stop offset="100%" stopColor="#FCA5A5" />
      </linearGradient>
      <filter id="blur1">
        <feGaussianBlur in="SourceGraphic" stdDeviation="40" />
      </filter>
    </defs>

    <motion.g
      initial={{ rotate: 0, opacity: 0 }}
      animate={{ rotate: 12, opacity: 1 }}
      transition={{ duration: 1, delay: 0.6 }}
    >
      <rect
        x="80"
        y="100"
        width="320"
        height="420"
        rx="40"
        fill="url(#purpleGrad)"
        filter="url(#blur1)"
        opacity="0.6"
      />
    </motion.g>

    <motion.circle
      cx="240"
      cy="200"
      r="140"
      fill="url(#blueGrad)"
      opacity="0.5"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 0.5 }}
      transition={{ duration: 1, delay: 0.8 }}
    />

    <motion.g
      initial={{ rotate: 0, opacity: 0 }}
      animate={{ rotate: -8, opacity: 1 }}
      transition={{ duration: 1, delay: 1 }}
    >
      <ellipse
        cx="280"
        cy="350"
        rx="180"
        ry="160"
        fill="url(#pinkGrad)"
        opacity="0.5"
      />
    </motion.g>

    {[
      { x: 120, y: 80, delay: 1.2 },
      { x: 380, y: 140, delay: 1.3 },
      { x: 100, y: 460, delay: 1.4 },
      { x: 340, y: 480, delay: 1.5 },
    ].map((star, i) => (
      <motion.g
        key={i}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.5 }}
        transition={{ duration: 0.4, delay: star.delay }}
      >
        <path
          d={`M${star.x} ${star.y - 8} L${star.x + 2} ${star.y - 2} L${star.x + 8} ${star.y} L${star.x + 2} ${star.y + 2} L${star.x} ${star.y + 8} L${star.x - 2} ${star.y + 2} L${star.x - 8} ${star.y} L${star.x - 2} ${star.y - 2} Z`}
          fill="#FFFFFF"
        />
      </motion.g>
    ))}
  </motion.svg>
);

export const ArchetypeIcon = ({ archetype }: { archetype: string }) => {
  const icons: Record<string, JSX.Element> = {
    midnightCinephile: (
      <g>
        <path
          d="M 120 60 Q 80 60 60 100 Q 60 140 120 140"
          stroke="white"
          strokeWidth="5"
          fill="none"
        />
        <rect x="100" y="90" width="40" height="30" stroke="white" strokeWidth="5" fill="none" />
        <line x1="110" y1="95" x2="110" y2="115" stroke="white" strokeWidth="5" />
        <line x1="130" y1="95" x2="130" y2="115" stroke="white" strokeWidth="5" />
      </g>
    ),
    feelGoodExplorer: (
      <g>
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const x1 = 120 + Math.cos(angle) * 40;
          const y1 = 100 + Math.sin(angle) * 40;
          const x2 = 120 + Math.cos(angle) * 60;
          const y2 = 100 + Math.sin(angle) * 60;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="white"
              strokeWidth="5"
              strokeLinecap="round"
            />
          );
        })}
        <circle cx="120" cy="100" r="25" stroke="white" strokeWidth="5" fill="none" />
      </g>
    ),
    thrillerSeeker: (
      <g>
        <path
          d="M 90 120 L 120 70 L 150 120 L 135 120 L 135 140 L 105 140 L 105 120 Z"
          stroke="white"
          strokeWidth="5"
          fill="none"
        />
        <circle cx="120" cy="85" r="8" fill="white" />
      </g>
    ),
    indieWanderer: (
      <g>
        <rect x="80" y="70" width="80" height="60" rx="8" stroke="white" strokeWidth="5" fill="none" />
        <circle cx="100" cy="95" r="12" stroke="white" strokeWidth="5" fill="none" />
        <circle cx="140" cy="95" r="12" stroke="white" strokeWidth="5" fill="none" />
        <path d="M 95 110 Q 120 120 145 110" stroke="white" strokeWidth="5" fill="none" />
      </g>
    ),
    epicAdventurer: (
      <g>
        <path
          d="M 120 60 L 140 90 L 170 95 L 145 120 L 150 150 L 120 135 L 90 150 L 95 120 L 70 95 L 100 90 Z"
          stroke="white"
          strokeWidth="5"
          fill="none"
        />
      </g>
    ),
    comfortCurator: (
      <g>
        <path
          d="M 120 130 Q 90 130 80 100 Q 80 80 100 70 Q 110 65 120 70 Q 130 65 140 70 Q 160 80 160 100 Q 150 130 120 130"
          stroke="white"
          strokeWidth="5"
          fill="none"
        />
      </g>
    ),
    mindBender: (
      <g>
        <circle cx="120" cy="100" r="40" stroke="white" strokeWidth="5" fill="none" />
        <path
          d="M 90 100 Q 105 80 120 100 Q 135 120 150 100"
          stroke="white"
          strokeWidth="5"
          fill="none"
        />
        <circle cx="105" cy="95" r="5" fill="white" />
        <circle cx="135" cy="95" r="5" fill="white" />
      </g>
    ),
    classicRomantic: (
      <g>
        <path
          d="M 120 130 L 90 100 Q 80 90 80 80 Q 80 65 95 65 Q 107 65 120 80 Q 133 65 145 65 Q 160 65 160 80 Q 160 90 150 100 Z"
          stroke="white"
          strokeWidth="5"
          fill="none"
        />
      </g>
    ),
  };

  return (
    <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-60 h-60">
      {icons[archetype] || icons.epicAdventurer}
    </svg>
  );
};

export const ConstellationPattern = ({ count = 20 }: { count?: number }) => {
  const dots = Array.from({ length: count }, (_, i) => ({
    x: 10 + Math.random() * 80,
    y: 5 + Math.random() * 25,
    size: 4 + Math.random() * 4,
    opacity: 0.3 + Math.random() * 0.3,
  }));

  const connections = dots.slice(0, 4).map((dot, i) => {
    const next = dots[(i + 2) % dots.length];
    return { x1: dot.x, y1: dot.y, x2: next.x, y2: next.y };
  });

  return (
    <g>
      {connections.map((line, i) => (
        <line
          key={`line-${i}`}
          x1={`${line.x1}%`}
          y1={`${line.y1}%`}
          x2={`${line.x2}%`}
          y2={`${line.y2}%`}
          stroke="white"
          strokeWidth="1"
          opacity="0.2"
        />
      ))}
      {dots.map((dot, i) => (
        <circle
          key={`dot-${i}`}
          cx={`${dot.x}%`}
          cy={`${dot.y}%`}
          r={dot.size}
          fill="white"
          opacity={dot.opacity}
        />
      ))}
    </g>
  );
};

export const FilmGrainTexture = () => (
  <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none opacity-[0.03]">
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)" />
  </svg>
);

export const AbstractBlob = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 180 180" fill="none" className={className}>
    <defs>
      <linearGradient id="blobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.6" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
      </linearGradient>
    </defs>
    <motion.path
      d="M 90 10 Q 140 30 160 70 Q 170 110 140 140 Q 100 170 60 140 Q 20 110 30 70 Q 40 30 90 10"
      fill="url(#blobGrad)"
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    />
  </svg>
);

export const ConfettiPiece = ({ x, y, shape, color, rotation }: {
  x: number;
  y: number;
  shape: 'circle' | 'square' | 'triangle';
  color: string;
  rotation: number;
}) => {
  const shapes = {
    circle: <circle cx="0" cy="0" r="6" fill={color} />,
    square: <rect x="-6" y="-6" width="12" height="12" fill={color} />,
    triangle: <path d="M 0 -8 L 7 6 L -7 6 Z" fill={color} />,
  };

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      {shapes[shape]}
    </g>
  );
};
