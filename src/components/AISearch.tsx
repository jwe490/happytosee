import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Wand2, Loader2, RefreshCw } from "lucide-react";
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
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const previousSurprises = useRef<number[]>([]);
  const { toast } = useToast();

  const handleDescribeSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setResults([]);
    setSurpriseMovie(null);
    setSearchTerms([]);

    try {
      const { data, error } = await supabase.functions.invoke("ai-search", {
        body: { description: query, type: "describe" },
      });

      if (error) throw error;

      if (data.movies?.length > 0) {
        setResults(data.movies);
        setSearchTerms(data.searchTerms || []);
      } else {
        toast({
          title: "No matches found",
          description: "Try describing the movie differently or use different keywords",
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
        body: { 
          type: "surprise", 
          mood: "adventurous",
          excludeIds: previousSurprises.current,
        },
      });

      if (error) throw error;

      if (data.movie) {
        setSurpriseMovie(data.movie);
        previousSurprises.current = [...previousSurprises.current.slice(-20), data.movie.id];
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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full">
          <Sparkles className="w-5 h-5 text-accent" />
          <span className="font-display font-semibold text-accent">AI Movie Finder</span>
        </div>
        <p className="text-muted-foreground max-w-md mx-auto">
          Describe any movie in your own words — actors, plot, scenes, or vibes — and our AI will find it for you.
        </p>
      </div>

      {/* Search Input */}
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDescribeSearch()}
              placeholder="e.g. 'that movie with a blue alien named Jaduu and Hrithik Roshan'"
              className="pl-12 h-14 text-base rounded-xl border-border/50 focus:border-accent"
            />
          </div>
          <Button 
            onClick={handleDescribeSearch}
            disabled={isLoading || !query.trim()}
            size="lg"
            className="h-14 px-8 gap-2 rounded-xl shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Wand2 className="w-5 h-5" />
            )}
            Find Movie
          </Button>
        </div>

        {/* Surprise Me */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={handleSurpriseMe}
            disabled={isLoading}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Surprise Me!
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4 py-12"
        >
          <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
          <p className="text-muted-foreground">AI is analyzing your description...</p>
        </motion.div>
      )}

      {/* AI Search Terms Found */}
      {searchTerms.length > 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-sm text-muted-foreground">
            AI identified: {searchTerms.map((term, i) => (
              <span key={term} className="font-medium text-foreground">
                {term}{i < searchTerms.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence mode="wait">
        {results.length > 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <h3 className="font-display text-lg font-semibold text-center">
              Found {results.length} possible match{results.length > 1 ? "es" : ""}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {results.map((movie, index) => (
                <motion.button
                  key={movie.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onMovieSelect(movie)}
                  className="bg-card rounded-xl overflow-hidden border border-border hover:border-accent/50 transition-all hover:shadow-lg text-left group"
                >
                  <div className="aspect-[2/3] relative overflow-hidden bg-muted">
                    {movie.posterUrl ? (
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-muted-foreground text-xs">No poster</span>
                      </div>
                    )}
                    {movie.confidence && (
                      <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        movie.confidence === "high" 
                          ? "bg-green-500/90 text-white"
                          : movie.confidence === "medium"
                          ? "bg-yellow-500/90 text-black"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {movie.confidence}
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <h4 className="font-medium text-sm line-clamp-1">{movie.title}</h4>
                    <p className="text-xs text-muted-foreground">{movie.year}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Surprise Result */}
        {surpriseMovie && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-md mx-auto"
          >
            <div className="text-center mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/20 rounded-full text-accent font-medium text-sm">
                <Sparkles className="w-4 h-4" />
                Your Surprise Pick
              </span>
            </div>
            <button
              onClick={() => onMovieSelect(surpriseMovie)}
              className="w-full bg-card rounded-xl overflow-hidden border border-accent/30 hover:border-accent transition-all hover:shadow-lg text-left group"
            >
              <div className="flex gap-4 p-4">
                <div className="w-20 h-28 rounded-lg overflow-hidden shrink-0 bg-muted">
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
                <div className="flex-1 min-w-0">
                  <h4 className="font-display text-base font-bold truncate">{surpriseMovie.title}</h4>
                  <p className="text-sm text-muted-foreground">{surpriseMovie.year} · ⭐ {surpriseMovie.rating}</p>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {surpriseMovie.overview}
                  </p>
                  {surpriseMovie.surpriseReason && (
                    <p className="text-xs text-accent mt-2">
                      ✨ {surpriseMovie.surpriseReason}
                    </p>
                  )}
                </div>
              </div>
            </button>
            
            {/* Get Another */}
            <div className="flex justify-center mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSurpriseMe}
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Get Another
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
