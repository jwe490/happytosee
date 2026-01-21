import { useState } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import ExpandedMovieView from "@/components/ExpandedMovieView";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/hooks/useWatchlist";
import { Bookmark, Trash2, Star, ArrowLeft } from "lucide-react";
import { Movie } from "@/hooks/useMovieRecommendations";

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

  return (
    <LayoutGroup>
      <div className="min-h-screen bg-background pt-20">
        <Header />
        
        <main className="max-w-7xl mx-auto px-6 md:px-8 py-12">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>

          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-foreground text-background">
              <Bookmark className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                My Watchlist
              </h1>
              <p className="text-muted-foreground">
                {watchlist.length} {watchlist.length === 1 ? "movie" : "movies"} saved
              </p>
            </div>
          </div>

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
              <Bookmark className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Your watchlist is empty
              </h2>
              <p className="text-muted-foreground mb-6">
                Start adding movies to keep track of what you want to watch
              </p>
              <Button onClick={() => navigate("/")} className="rounded-full">
                Discover Movies
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {watchlist.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03, duration: 0.2 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative cursor-pointer"
                  onClick={() => handleMovieClick(movie)}
                >
                  <div className="aspect-[2/3] rounded-xl overflow-hidden bg-muted shadow-md hover:shadow-xl transition-shadow duration-200">
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
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </motion.div>
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    
                    {/* Title on hover */}
                    <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out">
                      <h3 className="font-display text-sm font-semibold text-white line-clamp-2 leading-snug">
                        {movie.title}
                      </h3>
                      <div className="flex items-center gap-2 text-white/70 text-[10px] mt-0.5">
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

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWatchlist(movie.movie_id);
                    }}
                    className="absolute top-2 right-2 p-2 rounded-md bg-black/60 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-all duration-150 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </main>

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
