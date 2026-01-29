import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Film, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActorMovieCredit } from "./actorTypes";

interface FilmographyGridProps {
  title: string;
  movies: ActorMovieCredit[];
  onMovieClick: (movie: { id: number; title: string; posterUrl: string; rating: number; year: number }) => void;
  initialCount?: number;
  step?: number;
}

export function FilmographyGrid({
  title,
  movies,
  onMovieClick,
  initialCount = 12,
  step = 24,
}: FilmographyGridProps) {
  const [expanded, setExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const sorted = useMemo(() => {
    return [...movies].sort((a, b) => (b.year || 0) - (a.year || 0));
  }, [movies]);

  const visible = useMemo(() => {
    if (!expanded) return sorted.slice(0, initialCount);
    return sorted.slice(0, visibleCount);
  }, [expanded, sorted, initialCount, visibleCount]);

  const hasMore = expanded && visibleCount < sorted.length;

  useEffect(() => {
    if (!hasMore) return;

    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((c) => Math.min(sorted.length, c + step));
        }
      },
      { rootMargin: "200px", threshold: 0.1 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, sorted.length, step]);

  // Reset when data changes
  useEffect(() => {
    setExpanded(false);
    setVisibleCount(initialCount);
  }, [movies, initialCount]);

  if (sorted.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Film className="w-4 h-4 text-primary" />
          {title}
          <span className="text-xs font-normal text-muted-foreground">({sorted.length})</span>
        </h3>

        <button
          onClick={() => {
            setExpanded((v) => {
              const next = !v;
              setVisibleCount(next ? Math.min(sorted.length, initialCount + step) : initialCount);
              return next;
            });
          }}
          className="text-xs text-primary hover:underline"
        >
          {expanded ? "Collapse" : "Show all"}
        </button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {visible.map((movie, index) => (
          <motion.button
            key={movie.id}
            type="button"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: Math.min(index * 0.01, 0.15), duration: 0.2 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() =>
              onMovieClick({
                id: movie.id,
                title: movie.title,
                posterUrl: movie.posterUrl,
                rating: movie.rating,
                year: movie.year,
              })
            }
            className="text-left group"
          >
            <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted shadow-sm ring-1 ring-border/60 group-hover:ring-primary transition-all">
              {movie.posterUrl ? (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Film className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>

            <p className="text-[10px] font-medium text-foreground line-clamp-1 mt-1 group-hover:text-primary transition-colors">
              {movie.title}
            </p>

            <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
              <Star className={cn("w-2.5 h-2.5", "text-accent fill-accent")} />
              {Number.isFinite(movie.rating) ? movie.rating.toFixed(1) : "N/A"}
              {movie.year ? <span>• {movie.year}</span> : null}
            </div>

            {movie.character ? (
              <p className="text-[9px] text-muted-foreground line-clamp-1 italic">as {movie.character}</p>
            ) : null}
          </motion.button>
        ))}
      </div>

      {hasMore ? (
        <div className="flex items-center justify-center pt-2">
          <div className="text-xs text-muted-foreground">Loading more…</div>
        </div>
      ) : null}

      <div ref={sentinelRef} />
    </div>
  );
}
