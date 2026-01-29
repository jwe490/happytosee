import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "card" | "text" | "avatar" | "poster" | "button";
}

export function LoadingSkeleton({ className, variant = "text" }: LoadingSkeletonProps) {
  const baseClasses =
    "rounded-lg bg-gradient-to-r from-muted via-background to-muted bg-[length:200%_100%] animate-shimmer";
  
  const variants = {
    card: "h-48 w-full",
    text: "h-4 w-full",
    avatar: "h-12 w-12 rounded-full",
    poster: "aspect-[2/3] w-full",
    button: "h-10 w-24",
  };

  return (
    <div className={cn(baseClasses, variants[variant], className)} />
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="space-y-2">
      <div className="aspect-[2/3] rounded-xl bg-gradient-to-r from-muted via-background to-muted bg-[length:200%_100%] animate-shimmer" />
      <div className="space-y-1.5">
        <div className="h-3 rounded w-3/4 bg-gradient-to-r from-muted via-background to-muted bg-[length:200%_100%] animate-shimmer" />
        <div className="h-2.5 rounded w-1/2 bg-gradient-to-r from-muted via-background to-muted bg-[length:200%_100%] animate-shimmer" />
      </div>
    </div>
  );
}

export function MovieGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-muted via-background to-muted bg-[length:200%_100%] animate-shimmer" />
        <div className="space-y-2 flex-1">
          <div className="h-5 rounded w-32 bg-gradient-to-r from-muted via-background to-muted bg-[length:200%_100%] animate-shimmer" />
          <div className="h-3 rounded w-48 bg-gradient-to-r from-muted via-background to-muted bg-[length:200%_100%] animate-shimmer" />
        </div>
      </div>
      <div className="h-20 rounded-xl bg-gradient-to-r from-muted via-background to-muted bg-[length:200%_100%] animate-shimmer" />
      <div className="space-y-3">
        <div className="h-4 rounded w-24 bg-gradient-to-r from-muted via-background to-muted bg-[length:200%_100%] animate-shimmer" />
        <div className="h-24 rounded-lg bg-gradient-to-r from-muted via-background to-muted bg-[length:200%_100%] animate-shimmer" />
      </div>
    </div>
  );
}

export function PageLoadingSpinner() {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center gap-4 py-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div 
        className="relative w-12 h-12"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-0 rounded-full border-2 border-muted" />
        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent" />
      </motion.div>
      <motion.p 
        className="text-sm text-muted-foreground"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Loading...
      </motion.p>
    </motion.div>
  );
}

export function CollectionSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2].map((i) => (
        <div key={i} className="p-4 bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 rounded w-28 bg-gradient-to-r from-muted via-background to-muted bg-[length:200%_100%] animate-shimmer" />
            <div className="h-6 rounded w-16 bg-gradient-to-r from-muted via-background to-muted bg-[length:200%_100%] animate-shimmer" />
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((j) => (
              <div key={j} className="w-12 aspect-[2/3] rounded bg-gradient-to-r from-muted via-background to-muted bg-[length:200%_100%] animate-shimmer" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function PersonPageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-48 aspect-[2/3] rounded-2xl shrink-0 mx-auto md:mx-0 bg-gradient-to-r from-muted via-background to-muted bg-[length:200%_100%] animate-shimmer" />
        <div className="flex-1 space-y-4">
          <div className="h-8 rounded w-48 bg-gradient-to-r from-muted via-background to-muted bg-[length:200%_100%] animate-shimmer" />
          <div className="h-4 rounded w-32 bg-gradient-to-r from-muted via-background to-muted bg-[length:200%_100%] animate-shimmer" />
          <div className="space-y-2">
            <div className="h-3 rounded w-full bg-gradient-to-r from-muted via-background to-muted bg-[length:200%_100%] animate-shimmer" />
            <div className="h-3 rounded w-full bg-gradient-to-r from-muted via-background to-muted bg-[length:200%_100%] animate-shimmer" />
            <div className="h-3 rounded w-3/4 bg-gradient-to-r from-muted via-background to-muted bg-[length:200%_100%] animate-shimmer" />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-5 rounded w-32 bg-gradient-to-r from-muted via-background to-muted bg-[length:200%_100%] animate-shimmer" />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-lg bg-gradient-to-r from-muted via-background to-muted bg-[length:200%_100%] animate-shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}