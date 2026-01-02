import { motion } from "framer-motion";

interface TeddyIllustrationProps {
  className?: string;
}

const TeddyIllustration = ({ className = "" }: TeddyIllustrationProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className={className}
    >
      <motion.svg
        viewBox="0 0 200 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-lg"
        whileHover={{ scale: 1.05, rotate: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <motion.g
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Left Ear */}
          <ellipse cx="65" cy="45" rx="22" ry="25" fill="hsl(var(--accent))" opacity="0.8" />
          <ellipse cx="65" cy="48" rx="14" ry="16" fill="hsl(var(--accent))" opacity="0.5" />

          {/* Right Ear */}
          <ellipse cx="135" cy="45" rx="22" ry="25" fill="hsl(var(--accent))" opacity="0.8" />
          <ellipse cx="135" cy="48" rx="14" ry="16" fill="hsl(var(--accent))" opacity="0.5" />

          {/* Head */}
          <circle cx="100" cy="80" r="45" fill="hsl(var(--accent))" opacity="0.9" />

          {/* Face */}
          <ellipse cx="100" cy="90" rx="32" ry="28" fill="hsl(var(--accent))" opacity="0.6" />

          {/* Eyes */}
          <motion.g
            animate={{
              scaleY: [1, 0.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          >
            <circle cx="85" cy="75" r="5" fill="hsl(var(--foreground))" />
            <circle cx="115" cy="75" r="5" fill="hsl(var(--foreground))" />
            <circle cx="87" cy="73" r="2" fill="hsl(var(--background))" />
            <circle cx="117" cy="73" r="2" fill="hsl(var(--background))" />
          </motion.g>

          {/* Nose */}
          <ellipse cx="100" cy="88" rx="6" ry="5" fill="hsl(var(--foreground))" opacity="0.8" />

          {/* Smile */}
          <motion.path
            d="M 90 95 Q 100 100 110 95"
            stroke="hsl(var(--foreground))"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
            animate={{
              d: [
                "M 90 95 Q 100 100 110 95",
                "M 90 95 Q 100 102 110 95",
                "M 90 95 Q 100 100 110 95",
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Body */}
          <ellipse cx="100" cy="150" rx="40" ry="45" fill="hsl(var(--accent))" opacity="0.9" />

          {/* Belly */}
          <ellipse cx="100" cy="155" rx="28" ry="32" fill="hsl(var(--accent))" opacity="0.5" />

          {/* Left Arm */}
          <motion.ellipse
            cx="65"
            cy="140"
            rx="15"
            ry="35"
            fill="hsl(var(--accent))"
            opacity="0.8"
            style={{ transformOrigin: "65px 120px" }}
            animate={{
              rotate: [0, -10, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Right Arm */}
          <motion.ellipse
            cx="135"
            cy="140"
            rx="15"
            ry="35"
            fill="hsl(var(--accent))"
            opacity="0.8"
            style={{ transformOrigin: "135px 120px" }}
            animate={{
              rotate: [0, 10, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3
            }}
          />

          {/* Left Leg */}
          <ellipse cx="80" cy="195" rx="18" ry="22" fill="hsl(var(--accent))" opacity="0.8" />
          <ellipse cx="80" cy="208" rx="20" ry="12" fill="hsl(var(--accent))" opacity="0.6" />

          {/* Right Leg */}
          <ellipse cx="120" cy="195" rx="18" ry="22" fill="hsl(var(--accent))" opacity="0.8" />
          <ellipse cx="120" cy="208" rx="20" ry="12" fill="hsl(var(--accent))" opacity="0.6" />

          {/* Heart on belly */}
          <motion.path
            d="M 100 148 C 100 145 97 142 94 142 C 91 142 89 144 89 147 C 89 144 87 142 84 142 C 81 142 79 145 79 148 C 79 153 89 158 89 158 C 89 158 100 153 100 148 Z"
            fill="hsl(var(--primary))"
            opacity="0.4"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ transformOrigin: "89.5px 150px" }}
          />
        </motion.g>
      </motion.svg>
    </motion.div>
  );
};

export default TeddyIllustration;
