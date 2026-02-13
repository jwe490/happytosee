import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ExpandedMovieView from "./ExpandedMovieView";
import { Movie } from "@/hooks/useMovieRecommendations";
import { useIsMobile } from "@/hooks/use-mobile";

interface SearchResult extends Movie {
  mediaType?: string;
}

// Featured/Trending content to show before search
const FEATURED_CATEGORIES = [
  { title: "Trending Now", id: "trending" },
  { title: "Popular Movies", id: "popular" },
];

const MovieSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  // Fetch trending on mount — get 30 movies for endless grid
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("trending-movies", {
          body: { category: "trending" },
        });
        if (!error && data?.movies) {
          setTrendingMovies(data.movies.slice(0, 30));
        }
      } catch (err) {
        console.error("Failed to fetch trending:", err);
      }
    };
    fetchTrending();
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data, error } = await supabase.functions.invoke("search-movies", {
          body: { query: query.trim() },
        });
        if (!error) {
          setResults(data.movies || []);
        }
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  }, []);

  const handleBack = useCallback(() => {
    if (query) {
      clearSearch();
    } else {
      setIsInputFocused(false);
      inputRef.current?.blur();
    }
  }, [query, clearSearch]);

  const handleMovieClick = useCallback((movie: SearchResult) => {
    setSelectedMovie(movie);
    setIsExpanded(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsExpanded(false);
    setTimeout(() => setSelectedMovie(null), 300);
  }, []);

  const showingResults = query.trim().length >= 2;
  const showingGrid = !showingResults && !isInputFocused;

  return (
    <div className="min-h-[60vh] space-y-0">
      {/* Search Header - Apple TV+ Style */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-lg pb-4">
        <AnimatePresence mode="wait">
          {!isInputFocused && !showingResults ? (
            <motion.div
              key="header-title"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-4"
            >
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Search
              </h1>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Search Input */}
        <div className="relative">
          <AnimatePresence>
            {(isInputFocused || showingResults) && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onClick={handleBack}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>

          <div 
            className={`
              relative flex items-center rounded-xl bg-muted/50 border border-border/50
              transition-all duration-300
              ${isInputFocused || showingResults ? "pl-12" : "pl-4"}
            `}
          >
            {!isInputFocused && !showingResults && (
              <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            )}
            <input
              ref={inputRef}
              type="text"
              placeholder="Movies, Shows and More"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              className={`
                flex-1 bg-transparent py-4 pr-4 text-base text-foreground
                placeholder:text-muted-foreground/70 focus:outline-none
                ${!isInputFocused && !showingResults ? "pl-3" : "pl-0"}
              `}
            />
            
            {/* Clear button */}
            <AnimatePresence>
              {query && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {/* Loading State */}
        {isSearching && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-20"
          >
            <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
          </motion.div>
        )}

        {/* Search Results - List View */}
        {!isSearching && showingResults && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Autocomplete suggestion */}
            {results.length > 0 && (
              <button
                onClick={() => {
                  if (results[0]) {
                    setQuery(results[0].title);
                  }
                }}
                className="flex items-center gap-3 px-1 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Search className="w-4 h-4" />
                <span className="text-base">
                  <span className="text-foreground">{query}</span>
                  <span className="text-muted-foreground">
                    {results[0]?.title.toLowerCase().startsWith(query.toLowerCase()) 
                      ? results[0].title.slice(query.length)
                      : ` - ${results[0]?.title}`
                    }
                  </span>
                </span>
              </button>
            )}

            {/* Results header */}
            {results.length > 0 && (
              <>
                <div className="border-t border-border/50" />
                <h2 className="font-display text-xl font-bold text-foreground">
                  Top Results
                </h2>
                <div className="border-t border-border/50" />
              </>
            )}

            {/* Results list */}
            <div className="space-y-1">
              {results.map((movie, index) => (
                <motion.button
                  key={movie.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleMovieClick(movie)}
                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left group"
                >
                  {/* Poster thumbnail */}
                  <div className="w-16 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {movie.posterUrl ? (
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Search className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Movie info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {movie.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Movie · {movie.genre?.split(",")[0] || "Drama"} · {movie.year || ""}
                    </p>
                  </div>

                  {/* More options */}
                  <button className="p-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <circle cx="10" cy="4" r="1.5" />
                      <circle cx="10" cy="10" r="1.5" />
                      <circle cx="10" cy="16" r="1.5" />
                    </svg>
                  </button>
                </motion.button>
              ))}
            </div>

            {/* No results */}
            {results.length === 0 && !isSearching && query.length >= 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <p className="text-muted-foreground text-lg">
                  No results for "{query}"
                </p>
                <p className="text-muted-foreground/70 text-sm mt-1">
                  Try searching for something else
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Default Grid View - Trending/Featured */}
        {!isSearching && showingGrid && trendingMovies.length > 0 && (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6 pt-4"
          >
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
              {trendingMovies.map((movie, index) => (
                <motion.button
                  key={movie.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.35, ease: "easeOut" }}
                  onClick={() => handleMovieClick(movie)}
                  className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-muted shadow-sm hover:shadow-lg transition-shadow duration-300"
                >
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-2.5">
                      <h3 className="text-white text-xs sm:text-sm font-semibold line-clamp-2">
                        {movie.title}
                      </h3>
                      <p className="text-white/60 text-[10px] mt-0.5">{movie.year}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty focused state */}
        {!isSearching && isInputFocused && !showingResults && (
          <motion.div
            key="empty-focused"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-20 text-center"
          >
            <p className="text-muted-foreground">
              Start typing to search for movies
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Movie View */}
      <ExpandedMovieView
        movie={selectedMovie}
        isOpen={isExpanded}
        onClose={handleClose}
      />
    </div>
  );
};

export default MovieSearch;
