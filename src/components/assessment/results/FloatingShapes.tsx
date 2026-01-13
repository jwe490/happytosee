import { motion } from "framer-motion";

interface FloatingShape {
  type: "circle" | "oval" | "pill" | "line";
  x: number;
  y: number;
  size: number;
  delay: number;
  rotation?: number;
  color?: "primary" | "secondary" | "accent";
}

const defaultShapes: FloatingShape[] = [
  { type: "circle", x: 15, y: 10, size: 60, delay: 0, color: "primary" },
  { type: "oval", x: 75, y: 15, size: 45, delay: 0.1, rotation: -15, color: "primary" },
  { type: "circle", x: 85, y: 35, size: 30, delay: 0.2, color: "secondary" },
  { type: "pill", x: 20, y: 25, size: 50, delay: 0.15, rotation: 45, color: "secondary" },
  { type: "oval", x: 10, y: 60, size: 55, delay: 0.25, rotation: 20, color: "primary" },
  { type: "circle", x: 80, y: 70, size: 40, delay: 0.3, color: "primary" },
  { type: "line", x: 60, y: 20, size: 80, delay: 0.35, rotation: -30, color: "secondary" },
  { type: "oval", x: 45, y: 75, size: 35, delay: 0.4, rotation: -10, color: "primary" },
  { type: "circle", x: 25, y: 85, size: 25, delay: 0.45, color: "secondary" },
  { type: "pill", x: 70, y: 85, size: 60, delay: 0.5, rotation: -20, color: "secondary" },
];

interface FloatingShapesProps {
  shapes?: FloatingShape[];
  className?: string;
}

export const FloatingShapes = ({ shapes = defaultShapes, className = "" }: FloatingShapesProps) => {
  const getColorClass = (color?: "primary" | "secondary" | "accent") => {
    switch (color) {
      case "primary":
        return "bg-primary";
      case "secondary":
        return "bg-foreground";
      case "accent":
        return "bg-accent";
      default:
        return "bg-primary";
    }
  };

  const renderShape = (shape: FloatingShape, index: number) => {
    const colorClass = getColorClass(shape.color);
    const floatVariant = {
      initial: { y: 0, rotate: shape.rotation || 0 },
      animate: {
        y: [0, -8, 0],
        rotate: [(shape.rotation || 0), (shape.rotation || 0) + 3, (shape.rotation || 0)],
      },
    };

    switch (shape.type) {
      case "circle":
        return (
          <motion.div
            key={index}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: shape.delay, type: "spring", stiffness: 200, damping: 15 }}
            className="absolute"
            style={{ left: `${shape.x}%`, top: `${shape.y}%` }}
          >
            <motion.div
              variants={floatVariant}
              initial="initial"
              animate="animate"
              transition={{ duration: 4 + index * 0.5, repeat: Infinity, ease: "easeInOut" }}
              className={`rounded-full ${colorClass}`}
              style={{ width: shape.size, height: shape.size }}
            />
          </motion.div>
        );

      case "oval":
        return (
          <motion.div
            key={index}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: shape.delay, type: "spring", stiffness: 200, damping: 15 }}
            className="absolute"
            style={{ left: `${shape.x}%`, top: `${shape.y}%` }}
          >
            <motion.div
              variants={floatVariant}
              initial="initial"
              animate="animate"
              transition={{ duration: 3.5 + index * 0.4, repeat: Infinity, ease: "easeInOut" }}
              className={`rounded-full ${colorClass}`}
              style={{ 
                width: shape.size, 
                height: shape.size * 0.6,
                transform: `rotate(${shape.rotation || 0}deg)`,
              }}
            />
            {/* 3D shadow effect */}
            <motion.div
              variants={floatVariant}
              initial="initial"
              animate="animate"
              transition={{ duration: 3.5 + index * 0.4, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-full bg-foreground absolute -z-10"
              style={{ 
                width: shape.size, 
                height: shape.size * 0.3,
                top: shape.size * 0.35,
                left: 0,
                transform: `rotate(${shape.rotation || 0}deg)`,
              }}
            />
          </motion.div>
        );

      case "pill":
        return (
          <motion.div
            key={index}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: shape.delay, type: "spring", stiffness: 200, damping: 15 }}
            className="absolute"
            style={{ left: `${shape.x}%`, top: `${shape.y}%` }}
          >
            <motion.div
              variants={floatVariant}
              initial="initial"
              animate="animate"
              transition={{ duration: 4.5 + index * 0.3, repeat: Infinity, ease: "easeInOut" }}
              className={`rounded-full ${colorClass}`}
              style={{ 
                width: shape.size, 
                height: shape.size * 0.35,
                transform: `rotate(${shape.rotation || 0}deg)`,
              }}
            />
          </motion.div>
        );

      case "line":
        return (
          <motion.div
            key={index}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: shape.delay, duration: 0.6 }}
            className="absolute origin-left"
            style={{ 
              left: `${shape.x}%`, 
              top: `${shape.y}%`,
              transform: `rotate(${shape.rotation || 0}deg)`,
            }}
          >
            <div
              className="h-1 bg-foreground rounded-full"
              style={{ width: shape.size }}
            />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {shapes.map((shape, index) => renderShape(shape, index))}
    </div>
  );
};

// Preset shape configurations for different slides
export const introShapes: FloatingShape[] = [
  { type: "circle", x: 5, y: 8, size: 70, delay: 0, color: "primary" },
  { type: "oval", x: 20, y: 18, size: 55, delay: 0.08, rotation: 10, color: "primary" },
  { type: "circle", x: 35, y: 8, size: 45, delay: 0.12, color: "primary" },
  { type: "oval", x: 55, y: 15, size: 40, delay: 0.15, rotation: -20, color: "primary" },
  { type: "line", x: 70, y: 22, size: 60, delay: 0.18, rotation: 0, color: "secondary" },
  { type: "circle", x: 85, y: 12, size: 35, delay: 0.1, color: "primary" },
  { type: "oval", x: 10, y: 35, size: 50, delay: 0.2, rotation: 25, color: "primary" },
  { type: "pill", x: 75, y: 35, size: 55, delay: 0.22, rotation: -10, color: "secondary" },
  { type: "circle", x: 92, y: 45, size: 30, delay: 0.25, color: "primary" },
  { type: "oval", x: 5, y: 65, size: 60, delay: 0.28, rotation: -15, color: "primary" },
  { type: "circle", x: 25, y: 78, size: 40, delay: 0.3, color: "primary" },
  { type: "line", x: 40, y: 72, size: 50, delay: 0.32, rotation: 15, color: "secondary" },
  { type: "oval", x: 55, y: 80, size: 45, delay: 0.35, rotation: 5, color: "primary" },
  { type: "circle", x: 78, y: 75, size: 55, delay: 0.38, color: "primary" },
  { type: "pill", x: 88, y: 85, size: 40, delay: 0.4, rotation: -25, color: "secondary" },
];

export const archetypeShapes: FloatingShape[] = [
  { type: "line", x: -5, y: 20, size: 150, delay: 0, rotation: 25, color: "secondary" },
  { type: "line", x: 80, y: 5, size: 100, delay: 0.1, rotation: 70, color: "secondary" },
  { type: "circle", x: 85, y: 30, size: 25, delay: 0.2, color: "primary" },
  { type: "oval", x: 75, y: 65, size: 40, delay: 0.25, rotation: -10, color: "primary" },
  { type: "line", x: 60, y: 85, size: 120, delay: 0.3, rotation: -20, color: "secondary" },
];

export const statsShapes: FloatingShape[] = [
  { type: "line", x: 10, y: 15, size: 80, delay: 0, rotation: -15, color: "secondary" },
  { type: "line", x: 20, y: 18, size: 60, delay: 0.05, rotation: -15, color: "secondary" },
  { type: "line", x: 70, y: 70, size: 100, delay: 0.1, rotation: 30, color: "secondary" },
  { type: "circle", x: 85, y: 20, size: 30, delay: 0.15, color: "primary" },
  { type: "oval", x: 5, y: 75, size: 50, delay: 0.2, rotation: 20, color: "primary" },
];

export const recommendationsShapes: FloatingShape[] = [
  { type: "line", x: -5, y: 12, size: 80, delay: 0, rotation: 20, color: "secondary" },
  { type: "oval", x: 80, y: 8, size: 35, delay: 0.1, rotation: -15, color: "primary" },
  { type: "circle", x: 92, y: 25, size: 25, delay: 0.15, color: "primary" },
];
