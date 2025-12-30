import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Wand2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Movie {
  id: number;
  title: string;
  year: number | null;
  rating: number;
  posterUrl: string | null;
  overview: string;
  confidence?: string;
  matchReason?: string;
  surpriseReason?: string;
}

interface AISearchProps {
  onMovieSelect: (movie: Movie) => void;
}

export function AISearch({ onMovieSelect }: AISearchProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Movie[]>([]);
  const [surpriseMovie, setSurpriseMovie] = useState<Movie | null>(null);
  const { toast } = useToast();

  const handleDescribeSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setResults([]);
    setSurpriseMovie(null);

    try {
      const { data, error } = await supabase.functions.invoke("ai-search", {
        body: { description: query, type: "describe" },
      });

      if (error) throw error;

      if (data.movies?.length > 0) {
        setResults(data.movies);
      } else {
        toast({
          title: "No matches found",
          description: "Try describing the movie differently",
        });
      }
    } catch (error: any) {
      console.error("AI search error:", error);
      toast({
        title: "Search failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSurpriseMe = async () => {
    setIsLoading(true);
    setResults([]);
    setSurpriseMovie(null);

    try {
      const { data, error } = await supabase.functions.invoke("ai-search", {
        body: { type: "surprise", mood: "adventurous" },
      });

      if (error) throw error;

      if (data.movie) {
        setSurpriseMovie(data.movie);
      } else {
        toast({
          title: "Couldn't find a surprise",
          description: "Try again for a different recommendation",
        });
      }
    } catch (error: any) {
      console.error("Surprise error:", error);
      toast({
        title: "Something went wrong",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-display text-2xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-accent" />
          AI Movie Finder
        </h2>
        <p className="text-muted-foreground">
          Describe a movie you're looking for, or let AI surprise you!
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDescribeSearch()}
              placeholder="Describe the movie... 'that movie with the blue aliens on a moon'"
              className="pl-10 h-12 text-base"
            />
          </div>
          <Button 
            onClick={handleDescribeSearch}
            disabled={isLoading || !query.trim()}
            className="h-12 px-6 gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            Find It
          </Button>
        </div>

        <div className="text-center">
          <Button
            variant="outline"
            onClick={handleSurpriseMe}
            disabled={isLoading}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Surprise Me!
          </Button>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto"
          >
            <h3 className="font-display text-lg font-semibold mb-4">
              Found {results.length} possible match{results.length > 1 ? "es" : ""}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((movie, index) => (
                <motion.button
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => onMovieSelect(movie)}
                  className="bg-card rounded-xl overflow-hidden border border-border hover:border-accent/50 transition-all hover:shadow-lg text-left group"
                >
                  <div className="aspect-[2/3] relative overflow-hidden">
                    {movie.posterUrl ? (
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">No poster</span>
                      </div>
                    )}
                    {movie.confidence && (
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                        movie.confidence === "high" 
                          ? "bg-green-500/90 text-white"
                          : movie.confidence === "medium"
                          ? "bg-yellow-500/90 text-black"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {movie.confidence} match
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium line-clamp-1">{movie.title}</h4>
                    <p className="text-sm text-muted-foreground">{movie.year}</p>
                    {movie.matchReason && (
                      <p className="text-xs text-accent mt-2 line-clamp-2">
                        {movie.matchReason}
                      </p>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {surpriseMovie && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-lg mx-auto"
          >
            <div className="text-center mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 rounded-full text-accent font-medium text-sm">
                <Sparkles className="w-4 h-4" />
                Your Surprise Pick
              </span>
            </div>
            <button
              onClick={() => onMovieSelect(surpriseMovie)}
              className="w-full bg-card rounded-xl overflow-hidden border border-accent/30 hover:border-accent transition-all hover:shadow-lg text-left group"
            >
              <div className="flex gap-4 p-4">
                <div className="w-24 h-36 rounded-lg overflow-hidden shrink-0">
                  {surpriseMovie.posterUrl ? (
                    <img
                      src={surpriseMovie.posterUrl}
                      alt={surpriseMovie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted" />
                  )}
                </div>
                <div className="flex-1 py-1">
                  <h4 className="font-display text-lg font-bold">{surpriseMovie.title}</h4>
                  <p className="text-sm text-muted-foreground">{surpriseMovie.year}</p>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {surpriseMovie.overview}
                  </p>
                  {surpriseMovie.surpriseReason && (
                    <p className="text-sm text-accent mt-3">
                      ✨ {surpriseMovie.surpriseReason}
                    </p>
                  )}
                </div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
