import { motion } from "framer-motion";

interface FloatingShape {
  type: "circle" | "disc" | "ring" | "pill" | "wave" | "arc";
  x: number;
  y: number;
  size: number;
  delay: number;
  rotation?: number;
  color?: "coral" | "lavender" | "dark" | "cream";
  opacity?: number;
}

interface FloatingShapesProps {
  shapes?: FloatingShape[];
  variant?: "light" | "dark";
  className?: string;
}

// Spotify-inspired color palette
const getColorValue = (color?: FloatingShape["color"], variant: "light" | "dark" = "light") => {
  const colors = {
    coral: "rgba(255, 107, 74, 1)",      // #FF6B4A
    lavender: "rgba(184, 164, 232, 1)",   // #B8A4E8
    dark: "rgba(43, 43, 43, 1)",          // #2B2B2B
    cream: "rgba(245, 245, 240, 0.8)",    // #F5F5F0
  };
  
  if (variant === "dark") {
    return colors[color || "cream"];
  }
  return colors[color || "coral"];
};

const renderShape = (
  shape: FloatingShape, 
  index: number, 
  variant: "light" | "dark"
) => {
  const color = getColorValue(shape.color, variant);
  const baseOpacity = shape.opacity ?? (variant === "dark" ? 0.15 : 0.9);
  
  // Smooth floating animation
  const floatTransition = {
    duration: 6 + index * 0.8,
    repeat: Infinity,
    ease: "easeInOut" as const,
  };

  switch (shape.type) {
    case "circle":
      return (
        <motion.div
          key={index}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: baseOpacity }}
          transition={{ 
            delay: shape.delay, 
            duration: 0.8,
            ease: [0.34, 1.56, 0.64, 1] // Bouncy spring
          }}
          className="absolute"
          style={{ left: `${shape.x}%`, top: `${shape.y}%` }}
        >
          <motion.div
            animate={{ 
              y: [0, -12, 0],
              rotate: [shape.rotation || 0, (shape.rotation || 0) + 5, shape.rotation || 0],
            }}
            transition={floatTransition}
            className="rounded-full"
            style={{ 
              width: shape.size, 
              height: shape.size,
              backgroundColor: color,
            }}
          />
        </motion.div>
      );

    case "disc":
      // 3D disc effect - oval with shadow
      return (
        <motion.div
          key={index}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: baseOpacity }}
          transition={{ 
            delay: shape.delay, 
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="absolute"
          style={{ 
            left: `${shape.x}%`, 
            top: `${shape.y}%`,
            transform: `rotate(${shape.rotation || 0}deg)`,
          }}
        >
          <motion.div
            animate={{ 
              y: [0, -15, 0],
              rotateX: [0, 10, 0],
            }}
            transition={{ ...floatTransition, duration: 5 + index * 0.5 }}
            className="relative"
            style={{ 
              width: shape.size, 
              height: shape.size * 0.4,
              perspective: "500px",
            }}
          >
            {/* Main disc */}
            <div
              className="absolute inset-0 rounded-full"
              style={{ 
                backgroundColor: color,
                transform: "rotateX(60deg)",
              }}
            />
            {/* Shadow */}
            <div
              className="absolute rounded-full"
              style={{ 
                width: shape.size,
                height: shape.size * 0.15,
                bottom: -shape.size * 0.1,
                backgroundColor: variant === "dark" ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)",
                filter: "blur(4px)",
              }}
            />
          </motion.div>
        </motion.div>
      );

    case "ring":
      return (
        <motion.div
          key={index}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: baseOpacity }}
          transition={{ 
            delay: shape.delay, 
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="absolute"
          style={{ left: `${shape.x}%`, top: `${shape.y}%` }}
        >
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 180, 360],
            }}
            transition={{ 
              y: floatTransition,
              rotate: { duration: 20, repeat: Infinity, ease: "linear" }
            }}
            className="rounded-full border-[3px]"
            style={{ 
              width: shape.size, 
              height: shape.size,
              borderColor: color,
              backgroundColor: "transparent",
            }}
          />
        </motion.div>
      );

    case "pill":
      return (
        <motion.div
          key={index}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: baseOpacity }}
          transition={{ 
            delay: shape.delay, 
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="absolute origin-left"
          style={{ 
            left: `${shape.x}%`, 
            top: `${shape.y}%`,
            transform: `rotate(${shape.rotation || 0}deg)`,
          }}
        >
          <motion.div
            animate={{ 
              y: [0, -8, 0],
            }}
            transition={floatTransition}
            className="rounded-full"
            style={{ 
              width: shape.size, 
              height: shape.size * 0.3,
              backgroundColor: color,
            }}
          />
        </motion.div>
      );

    case "wave":
      return (
        <motion.svg
          key={index}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: baseOpacity * 0.6 }}
          transition={{ 
            delay: shape.delay, 
            duration: 1.2,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="absolute"
          style={{ 
            left: `${shape.x}%`, 
            top: `${shape.y}%`,
            transform: `rotate(${shape.rotation || 0}deg)`,
          }}
          width={shape.size}
          height={shape.size * 0.3}
          viewBox="0 0 100 30"
          fill="none"
        >
          <motion.path
            d="M0 15 Q25 0 50 15 T100 15"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: shape.delay + 0.2, duration: 1 }}
          />
        </motion.svg>
      );

    case "arc":
      return (
        <motion.svg
          key={index}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: baseOpacity * 0.5, scale: 1 }}
          transition={{ 
            delay: shape.delay, 
            duration: 0.8,
          }}
          className="absolute"
          style={{ 
            left: `${shape.x}%`, 
            top: `${shape.y}%`,
            transform: `rotate(${shape.rotation || 0}deg)`,
          }}
          width={shape.size}
          height={shape.size}
          viewBox="0 0 100 100"
          fill="none"
        >
          <motion.path
            d="M10 90 Q10 10 90 10"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: shape.delay + 0.3, duration: 1.5 }}
          />
        </motion.svg>
      );

    default:
      return null;
  }
};

export const FloatingShapes = ({ 
  shapes = introShapes, 
  variant = "light",
  className = "" 
}: FloatingShapesProps) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {shapes.map((shape, index) => renderShape(shape, index, variant))}
    </div>
  );
};

// ================== SHAPE PRESETS ==================

// Intro slide - playful scattered shapes
export const introShapes: FloatingShape[] = [
  // Top area
  { type: "circle", x: 8, y: 5, size: 80, delay: 0, color: "coral" },
  { type: "disc", x: 25, y: 12, size: 60, delay: 0.1, color: "coral", rotation: 15 },
  { type: "circle", x: 45, y: 6, size: 50, delay: 0.15, color: "lavender" },
  { type: "ring", x: 65, y: 10, size: 40, delay: 0.2, color: "coral" },
  { type: "disc", x: 82, y: 8, size: 55, delay: 0.12, color: "coral", rotation: -10 },
  
  // Middle area  
  { type: "pill", x: 5, y: 35, size: 70, delay: 0.25, color: "lavender", rotation: 25 },
  { type: "wave", x: 70, y: 40, size: 100, delay: 0.3, color: "dark", rotation: -15 },
  { type: "circle", x: 88, y: 45, size: 35, delay: 0.22, color: "lavender" },
  
  // Bottom area
  { type: "disc", x: 10, y: 70, size: 65, delay: 0.35, color: "coral", rotation: 20 },
  { type: "circle", x: 30, y: 78, size: 45, delay: 0.4, color: "coral" },
  { type: "ring", x: 50, y: 72, size: 55, delay: 0.32, color: "lavender" },
  { type: "pill", x: 68, y: 82, size: 80, delay: 0.38, color: "coral", rotation: -20 },
  { type: "circle", x: 85, y: 75, size: 60, delay: 0.42, color: "lavender" },
];

// Archetype slide - dramatic centered focus
export const archetypeShapes: FloatingShape[] = [
  { type: "arc", x: -5, y: 15, size: 180, delay: 0, color: "dark", rotation: 0 },
  { type: "wave", x: 60, y: 8, size: 120, delay: 0.1, color: "coral", rotation: 10 },
  { type: "circle", x: 85, y: 25, size: 40, delay: 0.2, color: "coral" },
  { type: "disc", x: 78, y: 55, size: 50, delay: 0.25, color: "lavender", rotation: -15 },
  { type: "wave", x: 50, y: 85, size: 150, delay: 0.3, color: "dark", rotation: -10 },
  { type: "circle", x: 15, y: 80, size: 35, delay: 0.35, color: "lavender" },
];

// Stats/Traits slide - organized vertical energy
export const statsShapes: FloatingShape[] = [
  { type: "wave", x: 5, y: 10, size: 100, delay: 0, color: "dark", rotation: -10 },
  { type: "wave", x: 10, y: 16, size: 80, delay: 0.08, color: "dark", rotation: -10 },
  { type: "circle", x: 85, y: 15, size: 45, delay: 0.15, color: "coral" },
  { type: "disc", x: 75, y: 35, size: 55, delay: 0.2, color: "lavender", rotation: 10 },
  { type: "pill", x: 80, y: 60, size: 60, delay: 0.25, color: "coral", rotation: 45 },
  { type: "wave", x: 65, y: 80, size: 120, delay: 0.3, color: "dark", rotation: 20 },
  { type: "circle", x: 5, y: 85, size: 40, delay: 0.35, color: "lavender" },
];

// Recommendations slide - dark theme with subtle accents
export const recommendationsShapes: FloatingShape[] = [
  { type: "arc", x: -10, y: 5, size: 150, delay: 0, color: "cream", rotation: 15 },
  { type: "circle", x: 85, y: 8, size: 30, delay: 0.1, color: "coral", opacity: 0.4 },
  { type: "disc", x: 90, y: 30, size: 45, delay: 0.15, color: "lavender", opacity: 0.3 },
  { type: "wave", x: 70, y: 85, size: 100, delay: 0.2, color: "cream", rotation: -15 },
];
