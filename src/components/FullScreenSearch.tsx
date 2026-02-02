import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Movie } from "@/hooks/useMovieRecommendations";

interface SearchResult extends Movie {
  mediaType?: string;
}

interface FullScreenSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

// Smooth overlay animation variants
const overlayVariants = {
  closed: {
    opacity: 0,
    transition: {
      duration: 0.25,
      ease: "easeInOut" as const,
    },
  },
  open: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeInOut" as const,
    },
  },
};

// Content slide-up animation
const contentVariants = {
  closed: {
    opacity: 0,
    y: 30,
    transition: {
      duration: 0.2,
      ease: "easeIn" as const,
    },
  },
  open: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: 0.05,
      ease: "easeOut" as const,
    },
  },
};

// Staggered item animation
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.04,
      duration: 0.3,
      ease: "easeOut" as const,
    },
  }),
};

const FullScreenSearch = ({ isOpen, onClose }: FullScreenSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  // Fetch trending on mount
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("trending-movies", {
          body: { category: "trending" },
        });
        if (!error && data?.movies) {
          setTrendingMovies(data.movies.slice(0, 12));
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

  // Navigate to movie via URL param and close search
  const handleMovieClick = useCallback((movie: SearchResult) => {
    onClose();
    // Small delay to let close animation start, then navigate
    setTimeout(() => {
      navigate(`/?movie=${movie.id}`);
    }, 100);
  }, [onClose, navigate]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const showingResults = query.trim().length >= 2;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md"
          variants={overlayVariants}
          initial="closed"
          animate="open"
          exit="closed"
        >
          {/* Header */}
          <motion.div
            variants={contentVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50"
          >
            <div className="max-w-4xl mx-auto px-4 py-4">
              <div className="flex items-center gap-3">
                {/* Back button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-2.5 -ml-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>

                {/* Search input */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search movies, shows..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full h-12 pl-12 pr-12 rounded-2xl bg-secondary/80 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                  />
                  {/* Clear button */}
                  <AnimatePresence>
                    {query && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

                {/* Cancel button */}
                <button
                  onClick={onClose}
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors px-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            variants={contentVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="max-w-4xl mx-auto px-4 py-6 overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 80px)" }}
          >
            {/* Loading State */}
            {isSearching && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-20"
              >
                <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
              </motion.div>
            )}

            {/* Search Results */}
            {!isSearching && showingResults && (
              <div className="space-y-4">
                {results.length > 0 && (
                  <>
                    <h2 className="font-display text-lg font-semibold text-foreground">
                      Top Results
                    </h2>
                    <div className="space-y-1">
                      {results.map((movie, index) => (
                        <motion.button
                          key={movie.id}
                          custom={index}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          whileHover={{ backgroundColor: "hsl(var(--muted))" }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleMovieClick(movie)}
                          className="w-full flex items-center gap-4 p-3 rounded-xl transition-colors text-left group"
                        >
                          {/* Poster thumbnail */}
                          <div className="w-14 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            {movie.posterUrl ? (
                              <img
                                src={movie.posterUrl}
                                alt={movie.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <Search className="w-5 h-5" />
                              </div>
                            )}
                          </div>

                          {/* Movie info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                              {movie.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {movie.genre?.split(",")[0] || "Movie"} · {movie.year || ""}
                            </p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </>
                )}

                {/* No results */}
                {results.length === 0 && !isSearching && query.length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
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
              </div>
            )}

            {/* Default Grid - Trending */}
            {!isSearching && !showingResults && trendingMovies.length > 0 && (
              <div className="space-y-5">
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Trending Now
                </h2>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {trendingMovies.map((movie, index) => (
                    <motion.button
                      key={movie.id}
                      custom={index}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleMovieClick(movie)}
                      className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-muted"
                    >
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <h3 className="text-white text-sm font-semibold line-clamp-2">
                            {movie.title}
                          </h3>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state when no query */}
            {!isSearching && !showingResults && trendingMovies.length === 0 && (
              <div className="py-20 text-center">
                <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Start typing to search for movies
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullScreenSearch;
