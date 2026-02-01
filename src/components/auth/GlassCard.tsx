import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  delay?: number;
}

export function GlassCard({ children, className, glowColor = "primary", delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        ease: [0.23, 1, 0.32, 1],
        delay 
      }}
      className={cn(
        "relative rounded-3xl overflow-hidden",
        className
      )}
    >
      {/* Outer glow */}
      <div 
        className="absolute -inset-[1px] rounded-3xl opacity-60"
        style={{
          background: `linear-gradient(135deg, hsl(var(--${glowColor}) / 0.15) 0%, transparent 50%, hsl(var(--${glowColor}) / 0.1) 100%)`,
        }}
      />
      
      {/* Glass background */}
      <div 
        className="relative rounded-3xl border border-border/50 dark:border-border/30"
        style={{
          background: `
            linear-gradient(135deg, 
              hsl(var(--card) / 0.9) 0%, 
              hsl(var(--card) / 0.7) 100%
            )
          `,
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
        }}
      >
        {/* Inner highlight */}
        <div 
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 100% 80% at 50% 0%, hsl(var(--${glowColor}) / 0.05) 0%, transparent 50%),
              linear-gradient(180deg, hsl(var(--foreground) / 0.02) 0%, transparent 20%)
            `,
          }}
        />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </motion.div>
  );
}
