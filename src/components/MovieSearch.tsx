import { useState, useCallback } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import MovieCard from "./MovieCard";
import ExpandedMovieView from "./ExpandedMovieView";
import { Movie } from "@/hooks/useMovieRecommendations";

const MovieSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = useCallback(async () => {
    if (query.trim().length < 2) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const { data, error } = await supabase.functions.invoke("search-movies", {
        body: { query: query.trim() },
      });

      if (error) throw error;
      setResults(data.movies || []);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
  };

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
    setTimeout(() => setSelectedMovie(null), 400);
  };

  return (
    <LayoutGroup>
      <div className="space-y-6">
        {/* Search Input */}
        <div className="flex gap-3 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for a movie by title..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-12 pr-10 h-12 text-base bg-card border-border focus:border-primary"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            onClick={handleSearch}
            disabled={query.trim().length < 2 || isSearching}
            variant="default"
            className="h-12 px-6 rounded-full"
          >
            {isSearching ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Search"
            )}
          </Button>
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 gap-4"
            >
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-muted-foreground">Searching movies...</p>
            </motion.div>
          ) : hasSearched && results.length === 0 ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground text-lg">
                No movies found for "{query}"
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Try a different search term
              </p>
            </motion.div>
          ) : results.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <p className="text-center text-muted-foreground">
                Found {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {results.map((movie, index) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    index={index}
                    onClick={() => handleMovieClick(movie)}
                  />
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <ExpandedMovieView
          movie={selectedMovie}
          isOpen={isExpanded}
          onClose={handleClose}
        />
      </div>
    </LayoutGroup>
  );
};

export default MovieSearch;
