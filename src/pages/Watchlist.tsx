import { useState } from "react";
import { motion, LayoutGroup, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ExpandedMovieView from "@/components/ExpandedMovieView";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/hooks/useWatchlist";
import { Bookmark, Trash2, Star, ArrowLeft, Film, Sparkles } from "lucide-react";
import { Movie } from "@/hooks/useMovieRecommendations";
import { Card } from "@/components/ui/card";

const Watchlist = () => {
  const { watchlist, isLoading, removeFromWatchlist } = useWatchlist();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleMovieClick = (watchlistItem: typeof watchlist[0]) => {
    const movie: Movie = {
      id: watchlistItem.movie_id,
      title: watchlistItem.title,
      rating: watchlistItem.rating || 0,
      year: watchlistItem.release_year ? parseInt(watchlistItem.release_year) : 0,
      genre: "",
      posterUrl: watchlistItem.poster_path ? `https://image.tmdb.org/t/p/w500${watchlistItem.poster_path}` : "",
      moodMatch: watchlistItem.overview || "",
    };
    setSelectedMovie(movie);
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
    setTimeout(() => setSelectedMovie(null), 400);
  };

  const stats = {
    total: watchlist.length,
    avgRating: watchlist.length > 0 
      ? (watchlist.reduce((acc, m) => acc + (m.rating || 0), 0) / watchlist.length).toFixed(1) 
      : "0.0",
    recentlyAdded: watchlist.filter(m => {
      const added = new Date(m.created_at);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return added > weekAgo;
    }).length,
  };

  return (
    <LayoutGroup>
      <div className="min-h-screen bg-background pt-20">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
          {/* Back button */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
          </motion.div>

          {/* Header with Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20">
                  <Bookmark className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                    My Watchlist
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Your curated collection of movies to watch
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              <Card className="p-4 bg-gradient-to-br from-card to-muted/30 border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Film className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Movies Saved</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-card to-muted/30 border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/10">
                    <Star className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.avgRating}</p>
                    <p className="text-xs text-muted-foreground">Avg Rating</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-card to-muted/30 border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Sparkles className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.recentlyAdded}</p>
                    <p className="text-xs text-muted-foreground">This Week</p>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] rounded-xl bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : watchlist.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                <Bookmark className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Your watchlist is empty
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start adding movies to keep track of what you want to watch next
              </p>
              <Button onClick={() => navigate("/")} className="rounded-full gap-2">
                <Sparkles className="w-4 h-4" />
                Discover Movies
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              <AnimatePresence mode="popLayout">
                {watchlist.map((movie, index) => (
                  <motion.div
                    key={movie.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.02, duration: 0.2 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative cursor-pointer"
                    onClick={() => handleMovieClick(movie)}
                  >
                    <div className="aspect-[2/3] rounded-xl overflow-hidden bg-muted shadow-md hover:shadow-xl transition-shadow duration-200 ring-1 ring-border/30 group-hover:ring-primary/50">
                      <motion.div
                        layoutId={`poster-${movie.movie_id}`}
                        className="w-full h-full"
                      >
                        {movie.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            alt={movie.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                            <Film className="w-10 h-10" />
                          </div>
                        )}
                      </motion.div>
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      
                      {/* Title on hover */}
                      <div className="absolute inset-x-0 bottom-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out">
                        <h3 className="font-display text-sm font-semibold text-white line-clamp-2 leading-snug">
                          {movie.title}
                        </h3>
                        <div className="flex items-center gap-2 text-white/70 text-[10px] mt-1">
                          {movie.release_year && <span>{movie.release_year}</span>}
                          {movie.rating && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                                {movie.rating.toFixed(1)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWatchlist(movie.movie_id);
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute top-2 right-2 p-2 rounded-full bg-black/60 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-all duration-150 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>

        <Footer />

        <ExpandedMovieView
          movie={selectedMovie}
          isOpen={isExpanded}
          onClose={handleClose}
        />
      </div>
    </LayoutGroup>
  );
};

export default Watchlist;
