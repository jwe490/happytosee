import { motion } from "framer-motion";

export const CinemaIllustration = ({ className = "" }: { className?: string }) => (
  <motion.svg
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.8 }}
    className={className}
    viewBox="0 0 400 300"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <motion.rect
      x="80"
      y="60"
      width="240"
      height="180"
      rx="12"
      fill="url(#cinema-gradient)"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    />
    <motion.circle
      cx="200"
      cy="150"
      r="40"
      fill="#fff"
      opacity="0.3"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.4, type: "spring" }}
    />
    <motion.path
      d="M180 150 L190 145 L190 155 Z"
      fill="#fff"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
    />
    <motion.rect
      x="120"
      y="30"
      width="40"
      height="20"
      rx="4"
      fill="#F59E0B"
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
    />
    <motion.rect
      x="170"
      y="30"
      width="40"
      height="20"
      rx="4"
      fill="#10B981"
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.35 }}
    />
    <motion.rect
      x="220"
      y="30"
      width="40"
      height="20"
      rx="4"
      fill="#06B6D4"
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
    />
    <defs>
      <linearGradient id="cinema-gradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1E40AF" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
    </defs>
  </motion.svg>
);

export const EmotionWheelIllustration = ({ className = "" }: { className?: string }) => (
  <motion.svg
    initial={{ opacity: 0, rotate: -10 }}
    animate={{ opacity: 1, rotate: 0 }}
    transition={{ duration: 1 }}
    className={className}
    viewBox="0 0 300 300"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {[0, 60, 120, 180, 240, 300].map((angle, i) => (
      <motion.path
        key={angle}
        d={`M150,150 L${150 + 100 * Math.cos((angle * Math.PI) / 180)},${
          150 + 100 * Math.sin((angle * Math.PI) / 180)
        } A100,100 0 0,1 ${150 + 100 * Math.cos(((angle + 60) * Math.PI) / 180)},${
          150 + 100 * Math.sin(((angle + 60) * Math.PI) / 180)
        } Z`}
        fill={
          ["#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#10B981", "#F97316"][i]
        }
        opacity="0.8"
        initial={{ scale: 0, rotate: angle }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: i * 0.1, type: "spring" }}
      />
    ))}
    <motion.circle
      cx="150"
      cy="150"
      r="40"
      fill="white"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.6, type: "spring" }}
    />
  </motion.svg>
);

export const SparklesIllustration = ({ className = "" }: { className?: string }) => (
  <motion.svg
    className={className}
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {[
      { x: 40, y: 40, size: 20, delay: 0 },
      { x: 160, y: 60, size: 15, delay: 0.2 },
      { x: 100, y: 120, size: 25, delay: 0.1 },
      { x: 50, y: 160, size: 18, delay: 0.3 },
      { x: 150, y: 150, size: 22, delay: 0.15 },
    ].map((sparkle, i) => (
      <motion.g
        key={i}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
        transition={{
          delay: sparkle.delay,
          duration: 2,
          repeat: Infinity,
          repeatDelay: 1,
        }}
      >
        <path
          d={`M${sparkle.x},${sparkle.y - sparkle.size / 2} L${sparkle.x},${
            sparkle.y + sparkle.size / 2
          } M${sparkle.x - sparkle.size / 2},${sparkle.y} L${
            sparkle.x + sparkle.size / 2
          },${sparkle.y}`}
          stroke="url(#sparkle-gradient)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </motion.g>
    ))}
    <defs>
      <linearGradient id="sparkle-gradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#EA580C" />
      </linearGradient>
    </defs>
  </motion.svg>
);

export const MovieReelIllustration = ({ className = "" }: { className?: string }) => (
  <motion.svg
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8 }}
    className={className}
    viewBox="0 0 300 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <motion.rect
      x="50"
      y="50"
      width="200"
      height="100"
      rx="8"
      fill="#1F2937"
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.6 }}
    />
    {[0, 1, 2, 3, 4].map((i) => (
      <motion.rect
        key={i}
        x={60 + i * 40}
        y="60"
        width="30"
        height="80"
        rx="4"
        fill={i % 2 === 0 ? "#06B6D4" : "#10B981"}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
      />
    ))}
    {[70, 110].map((y, i) => (
      <g key={i}>
        <motion.circle
          cx="30"
          cy={y}
          r="8"
          fill="#F59E0B"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4 + i * 0.1 }}
        />
        <motion.circle
          cx="270"
          cy={y}
          r="8"
          fill="#F59E0B"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4 + i * 0.1 }}
        />
      </g>
    ))}
  </motion.svg>
);

export const HeartPulseIllustration = ({ className = "" }: { className?: string }) => (
  <motion.svg
    className={className}
    viewBox="0 0 300 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <motion.path
      d="M150,170 C150,170 80,120 80,80 C80,50 105,40 130,60 C140,50 150,45 150,45 C150,45 160,50 170,60 C195,40 220,50 220,80 C220,120 150,170 150,170"
      fill="url(#heart-gradient)"
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", duration: 0.8 }}
    />
    <motion.path
      d="M30,100 L60,100 L75,70 L90,130 L105,100 L120,100"
      stroke="#06B6D4"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, delay: 0.3 }}
    />
    <defs>
      <linearGradient id="heart-gradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="100%" stopColor="#F97316" />
      </linearGradient>
    </defs>
  </motion.svg>
);

export const StarsIllustration = ({ className = "" }: { className?: string }) => (
  <motion.svg
    className={className}
    viewBox="0 0 300 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {[
      { x: 60, y: 50, size: 30, delay: 0 },
      { x: 150, y: 40, size: 40, delay: 0.2 },
      { x: 240, y: 60, size: 25, delay: 0.1 },
      { x: 100, y: 130, size: 35, delay: 0.3 },
      { x: 210, y: 140, size: 28, delay: 0.15 },
    ].map((star, i) => (
      <motion.path
        key={i}
        d={`M${star.x},${star.y - star.size / 2} L${star.x + star.size / 6},${
          star.y - star.size / 6
        } L${star.x + star.size / 2},${star.y} L${star.x + star.size / 6},${
          star.y + star.size / 6
        } L${star.x},${star.y + star.size / 2} L${star.x - star.size / 6},${
          star.y + star.size / 6
        } L${star.x - star.size / 2},${star.y} L${star.x - star.size / 6},${
          star.y - star.size / 6
        } Z`}
        fill="url(#star-gradient)"
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          delay: star.delay,
          type: "spring",
          duration: 0.8,
        }}
      />
    ))}
    <defs>
      <linearGradient id="star-gradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#FBBF24" />
      </linearGradient>
    </defs>
  </motion.svg>
);

export const ThoughtBubbleIllustration = ({ className = "" }: { className?: string }) => (
  <motion.svg
    className={className}
    viewBox="0 0 300 250"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <motion.ellipse
      cx="150"
      cy="100"
      rx="120"
      ry="80"
      fill="url(#bubble-gradient)"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", duration: 0.6 }}
    />
    <motion.circle
      cx="80"
      cy="170"
      r="20"
      fill="url(#bubble-gradient)"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2, type: "spring" }}
    />
    <motion.circle
      cx="50"
      cy="200"
      r="12"
      fill="url(#bubble-gradient)"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.3, type: "spring" }}
    />
    <motion.circle
      cx="30"
      cy="220"
      r="8"
      fill="url(#bubble-gradient)"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.4, type: "spring" }}
    />
    <defs>
      <linearGradient id="bubble-gradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
    </defs>
  </motion.svg>
);

export const PopcornIllustration = ({ className = "" }: { className?: string }) => (
  <motion.svg
    className={className}
    viewBox="0 0 200 250"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <motion.path
      d="M60,150 L140,150 L160,240 L40,240 Z"
      fill="url(#popcorn-box)"
      stroke="#EF4444"
      strokeWidth="3"
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={{ duration: 0.5 }}
    />
    {[
      { x: 70, y: 130, delay: 0.2 },
      { x: 100, y: 120, delay: 0.3 },
      { x: 130, y: 135, delay: 0.25 },
      { x: 85, y: 110, delay: 0.35 },
      { x: 115, y: 105, delay: 0.4 },
    ].map((popcorn, i) => (
      <motion.circle
        key={i}
        cx={popcorn.x}
        cy={popcorn.y}
        r="12"
        fill="#FBBF24"
        initial={{ scale: 0, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{
          delay: popcorn.delay,
          type: "spring",
          stiffness: 200,
        }}
      />
    ))}
    <motion.rect
      x="80"
      y="180"
      width="40"
      height="40"
      fill="#EF4444"
      opacity="0.3"
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={{ delay: 0.6 }}
    />
    <defs>
      <linearGradient id="popcorn-box" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#FEF3C7" />
      </linearGradient>
    </defs>
  </motion.svg>
);
