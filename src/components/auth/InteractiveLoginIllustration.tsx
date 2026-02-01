import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useState, useEffect } from "react";

interface InteractiveLoginIllustrationProps {
  isTyping?: boolean;
  hasError?: boolean;
  isSuccess?: boolean;
  passwordVisible?: boolean;
  characterCount?: number;
}

export function InteractiveLoginIllustration({
  isTyping = false,
  hasError = false,
  isSuccess = false,
  passwordVisible = false,
  characterCount = 0,
}: InteractiveLoginIllustrationProps) {
  const [eyesClosed, setEyesClosed] = useState(false);
  const eyeY = useMotionValue(0);
  const pupilX = useMotionValue(0);
  
  // Close eyes when password is being typed and not visible
  useEffect(() => {
    if (isTyping && !passwordVisible) {
      setEyesClosed(true);
    } else {
      setEyesClosed(false);
    }
  }, [isTyping, passwordVisible]);

  // Pupil follows input (simulated)
  useEffect(() => {
    const targetX = Math.min(characterCount * 0.5, 4) - 2;
    animate(pupilX, targetX, { duration: 0.2 });
  }, [characterCount, pupilX]);

  // Use CSS variables for theming - computed at runtime
  const strokeColor = isSuccess 
    ? "hsl(var(--primary))" 
    : hasError 
      ? "hsl(var(--destructive))" 
      : "hsl(var(--foreground) / 0.6)";
  
  const fillColor = isSuccess
    ? "hsl(var(--primary))"
    : hasError
      ? "hsl(var(--destructive))"
      : "hsl(var(--foreground) / 0.8)";

  return (
    <div className="relative w-40 h-40 mx-auto">
      {/* Background glow */}
      <motion.div
        className="absolute inset-0 rounded-full blur-2xl bg-foreground/10"
        animate={{
          scale: isSuccess ? [1, 1.3, 1] : hasError ? [1, 1.1, 1, 1.1, 1] : 1,
          opacity: isTyping ? 0.4 : 0.2,
        }}
        transition={{
          duration: isSuccess ? 0.8 : hasError ? 0.3 : 2,
          repeat: isSuccess || hasError ? 0 : Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main character body */}
      <motion.svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        animate={{
          y: isTyping ? [0, -3, 0] : 0,
        }}
        transition={{
          duration: 0.5,
          repeat: isTyping ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        {/* Face circle */}
        <motion.circle
          cx="100"
          cy="100"
          r="70"
          fill="none"
          strokeWidth="3"
          className={`
            ${isSuccess ? 'stroke-foreground' : hasError ? 'stroke-destructive' : 'stroke-foreground/40'}
          `}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />

        {/* Inner face fill */}
        <motion.circle
          cx="100"
          cy="100"
          r="66"
          className="fill-card"
        />

        {/* Left eye */}
        <motion.g
          animate={{
            y: eyesClosed ? 0 : eyeY.get(),
          }}
        >
          {eyesClosed ? (
            <motion.path
              d="M60 95 Q70 100 80 95"
              className={`${isSuccess ? 'stroke-foreground' : hasError ? 'stroke-destructive' : 'stroke-foreground/60'}`}
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.15 }}
            />
          ) : (
            <>
              <circle 
                cx="70" 
                cy="90" 
                r="12" 
                className={`fill-background ${isSuccess ? 'stroke-foreground' : hasError ? 'stroke-destructive' : 'stroke-foreground/40'}`}
                strokeWidth="2" 
              />
              <motion.circle
                cx="70"
                cy="90"
                r="6"
                className="fill-foreground"
                animate={{ cx: 70 + pupilX.get() }}
              />
              <circle cx="72" cy="88" r="2" className="fill-background" />
            </>
          )}
        </motion.g>

        {/* Right eye */}
        <motion.g
          animate={{
            y: eyesClosed ? 0 : eyeY.get(),
          }}
        >
          {eyesClosed ? (
            <motion.path
              d="M120 95 Q130 100 140 95"
              className={`${isSuccess ? 'stroke-foreground' : hasError ? 'stroke-destructive' : 'stroke-foreground/60'}`}
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.15 }}
            />
          ) : (
            <>
              <circle 
                cx="130" 
                cy="90" 
                r="12" 
                className={`fill-background ${isSuccess ? 'stroke-foreground' : hasError ? 'stroke-destructive' : 'stroke-foreground/40'}`}
                strokeWidth="2" 
              />
              <motion.circle
                cx="130"
                cy="90"
                r="6"
                className="fill-foreground"
                animate={{ cx: 130 + pupilX.get() }}
              />
              <circle cx="132" cy="88" r="2" className="fill-background" />
            </>
          )}
        </motion.g>

        {/* Hands covering eyes when password visible is false and typing */}
        {eyesClosed && (
          <>
            <motion.ellipse
              cx="65"
              cy="90"
              rx="20"
              ry="16"
              className={`fill-secondary ${isSuccess ? 'stroke-foreground' : hasError ? 'stroke-destructive' : 'stroke-foreground/40'}`}
              strokeWidth="2"
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
            <motion.ellipse
              cx="135"
              cy="90"
              rx="20"
              ry="16"
              className={`fill-secondary ${isSuccess ? 'stroke-foreground' : hasError ? 'stroke-destructive' : 'stroke-foreground/40'}`}
              strokeWidth="2"
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          </>
        )}

        {/* Mouth */}
        <motion.path
          d={
            isSuccess
              ? "M70 125 Q100 150 130 125"
              : hasError
              ? "M70 135 Q100 120 130 135"
              : isTyping
              ? "M85 130 Q100 135 115 130"
              : "M80 125 Q100 140 120 125"
          }
          className={`${isSuccess ? 'stroke-foreground' : hasError ? 'stroke-destructive' : 'stroke-foreground/60'}`}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          animate={{
            d: isSuccess
              ? "M70 125 Q100 150 130 125"
              : hasError
              ? "M70 135 Q100 120 130 135"
              : isTyping
              ? "M85 130 Q100 135 115 130"
              : "M80 125 Q100 140 120 125",
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Blush circles when success */}
        {isSuccess && (
          <>
            <motion.circle
              cx="55"
              cy="115"
              r="8"
              className="fill-primary/30"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            />
            <motion.circle
              cx="145"
              cy="115"
              r="8"
              className="fill-primary/30"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            />
          </>
        )}

        {/* Error shake lines */}
        {hasError && (
          <>
            <motion.line
              x1="45" y1="70" x2="55" y2="80"
              className="stroke-destructive"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.5 }}
            />
            <motion.line
              x1="55" y1="70" x2="45" y2="80"
              className="stroke-destructive"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.5 }}
            />
            <motion.line
              x1="145" y1="70" x2="155" y2="80"
              className="stroke-destructive"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.5 }}
            />
            <motion.line
              x1="155" y1="70" x2="145" y2="80"
              className="stroke-destructive"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.5 }}
            />
          </>
        )}
      </motion.svg>

      {/* Sparkles on success */}
      {isSuccess && (
        <>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-foreground"
              style={{
                left: '50%',
                top: '50%',
              }}
              initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.5, 0],
                x: Math.cos((i * Math.PI * 2) / 8) * 80,
                y: Math.sin((i * Math.PI * 2) / 8) * 80,
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 0.8,
                delay: 0.05 * i,
                ease: "easeOut",
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}
