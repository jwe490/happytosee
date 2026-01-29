import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useKeyAuth } from "@/hooks/useKeyAuth";
import { Sparkles, Zap, Trophy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date?: string;
}

interface ThisOrThatProps {
  onComplete?: (winnerId: number) => void;
}

export function ThisOrThat({ onComplete }: ThisOrThatProps) {
  const { user } = useKeyAuth();
  const [movieA, setMovieA] = useState<Movie | null>(null);
  const [movieB, setMovieB] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<"a" | "b" | null>(null);
  const [battlesWon, setBattlesWon] = useState(0);
  const [round, setRound] = useState(1);

  const fetchMovies = useCallback(async () => {
    setIsLoading(true);
    setSelected(null);
    
    try {
      const { data, error } = await supabase.functions.invoke("trending-movies", {
        body: { category: "popular", limit: 20 },
      });

      if (error) throw error;

      const movies = data?.movies || [];
      if (movies.length >= 2) {
        // Pick two random different movies
        const shuffled = [...movies].sort(() => Math.random() - 0.5);
        setMovieA({
          id: shuffled[0].id,
          title: shuffled[0].title,
          poster_path: shuffled[0].posterUrl,
          vote_average: shuffled[0].rating,
          release_date: shuffled[0].year?.toString(),
        });
        setMovieB({
          id: shuffled[1].id,
          title: shuffled[1].title,
          poster_path: shuffled[1].posterUrl,
          vote_average: shuffled[1].rating,
          release_date: shuffled[1].year?.toString(),
        });
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const handleSelect = async (winner: "a" | "b") => {
    if (selected) return;
    
    setSelected(winner);
    const winnerMovie = winner === "a" ? movieA : movieB;
    
    // Mini confetti for selection
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { x: winner === "a" ? 0.25 : 0.75, y: 0.5 },
      colors: ["#10B981", "#3B82F6", "#8B5CF6"],
    });

    // Save to database
    if (movieA && movieB && winnerMovie) {
      try {
        await supabase.from("movie_battles").insert({
          user_id: user?.id || "anonymous",
          movie_a_id: movieA.id,
          movie_a_title: movieA.title,
          movie_a_poster: movieA.poster_path,
          movie_b_id: movieB.id,
          movie_b_title: movieB.title,
          movie_b_poster: movieB.poster_path,
          winner_id: winnerMovie.id,
        });

        setBattlesWon((prev) => prev + 1);
        onComplete?.(winnerMovie.id);
      } catch (error) {
        console.error("Error saving battle:", error);
      }
    }

    // Auto-advance after delay
    setTimeout(() => {
      setRound((prev) => prev + 1);
      fetchMovies();
    }, 1200);
  };

  const handleSkip = () => {
    setRound((prev) => prev + 1);
    fetchMovies();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Zap className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!movieA || !movieB) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No movies available for battle</p>
        <Button variant="outline" onClick={fetchMovies} className="mt-4">
          <RotateCcw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-display font-semibold text-foreground">Round {round}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10">
          <Trophy className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">{battlesWon} won</span>
        </div>
      </div>

      {/* Question */}
      <p className="text-center text-lg font-display text-foreground">
        Which would you rather watch?
      </p>

      {/* Battle arena */}
      <div className="grid grid-cols-2 gap-4 md:gap-6">
        {[
          { movie: movieA, side: "a" as const },
          { movie: movieB, side: "b" as const },
        ].map(({ movie, side }) => (
          <motion.button
            key={movie.id}
            onClick={() => handleSelect(side)}
            disabled={!!selected}
            whileHover={!selected ? { scale: 1.02 } : {}}
            whileTap={!selected ? { scale: 0.98 } : {}}
            className={`
              relative aspect-[2/3] rounded-2xl overflow-hidden
              transition-all duration-300 group
              ${selected === side 
                ? "ring-4 ring-green-500 shadow-xl shadow-green-500/20" 
                : selected 
                  ? "opacity-50 grayscale" 
                  : "hover:shadow-xl"
              }
            `}
          >
            {/* Poster */}
            <img
              src={movie.poster_path}
              alt={movie.title}
              className="w-full h-full object-cover"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Title & rating */}
            <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
              <h3 className="font-display font-bold text-white text-sm md:text-base line-clamp-2">
                {movie.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-yellow-400 text-xs">★</span>
                <span className="text-white/80 text-xs">{movie.vote_average.toFixed(1)}</span>
                {movie.release_date && (
                  <span className="text-white/60 text-xs">
                    ({movie.release_date.substring(0, 4)})
                  </span>
                )}
              </div>
            </div>

            {/* Winner badge */}
            <AnimatePresence>
              {selected === side && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-green-500/20"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    className="text-6xl"
                  >
                    ✓
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hover glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-primary/20 to-transparent pointer-events-none" />
          </motion.button>
        ))}
      </div>

      {/* VS badge */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-12 h-12 rounded-full bg-background border-4 border-primary flex items-center justify-center shadow-lg"
        >
          <span className="font-display font-bold text-primary text-sm">VS</span>
        </motion.div>
      </div>

      {/* Skip button */}
      <div className="text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          disabled={!!selected}
          className="text-muted-foreground"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Can't decide? Skip
        </Button>
      </div>
    </div>
  );
}
