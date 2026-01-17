import { motion } from "framer-motion";

interface VaultIllustrationProps {
  isUnlocked?: boolean;
}

export function VaultIllustration({ isUnlocked = false }: VaultIllustrationProps) {
  return (
    <div className="relative w-40 h-40 mx-auto">
      {/* Outer glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: isUnlocked 
            ? 'radial-gradient(circle, hsl(var(--accent) / 0.3) 0%, transparent 70%)'
            : 'radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, transparent 70%)',
        }}
        animate={{
          scale: isUnlocked ? [1, 1.2, 1] : 1,
          opacity: isUnlocked ? [0.5, 0.8, 0.5] : 0.3,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Vault body */}
      <motion.div
        className="absolute inset-4 rounded-2xl border-4 glass"
        style={{
          borderColor: isUnlocked ? 'hsl(var(--accent))' : 'hsl(var(--border))',
        }}
        animate={{
          borderColor: isUnlocked ? 'hsl(var(--accent))' : 'hsl(var(--border))',
        }}
        transition={{ duration: 0.5 }}
      >
        {/* Vault door lines */}
        <div className="absolute inset-2 flex flex-col justify-center gap-2">
          <motion.div 
            className="h-0.5 bg-border rounded"
            animate={{ 
              scaleX: isUnlocked ? 0.8 : 1,
              opacity: isUnlocked ? 0.5 : 1,
            }}
          />
          <motion.div 
            className="h-0.5 bg-border rounded mx-4"
            animate={{ 
              scaleX: isUnlocked ? 0.6 : 1,
              opacity: isUnlocked ? 0.5 : 1,
            }}
          />
          <motion.div 
            className="h-0.5 bg-border rounded mx-2"
            animate={{ 
              scaleX: isUnlocked ? 0.7 : 1,
              opacity: isUnlocked ? 0.5 : 1,
            }}
          />
        </div>
        
        {/* Keyhole / Check */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={false}
          animate={{
            scale: isUnlocked ? 1 : 0.9,
          }}
        >
          {isUnlocked ? (
            <motion.svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-accent"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.path
                d="M20 6L9 17L4 12"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </motion.svg>
          ) : (
            <motion.div
              className="relative"
              animate={{
                rotate: [0, -5, 5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* Key icon */}
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground"
              >
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
              </svg>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
      
      {/* Handle */}
      <motion.div
        className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-8 rounded-full border-2"
        style={{
          borderColor: isUnlocked ? 'hsl(var(--accent))' : 'hsl(var(--border))',
          background: isUnlocked ? 'hsl(var(--accent) / 0.2)' : 'transparent',
        }}
        animate={{
          rotate: isUnlocked ? 90 : 0,
          x: isUnlocked ? 4 : 0,
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Sparkles when unlocked */}
      {isUnlocked && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-accent"
              style={{
                left: '50%',
                top: '50%',
              }}
              initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
              animate={{
                scale: [0, 1, 0],
                x: Math.cos((i * Math.PI * 2) / 6) * 60,
                y: Math.sin((i * Math.PI * 2) / 6) * 60,
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1,
                delay: 0.1 * i,
                ease: "easeOut",
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}
