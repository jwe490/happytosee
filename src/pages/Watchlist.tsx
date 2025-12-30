import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import MovieDetailsModal from "@/components/MovieDetailsModal";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/hooks/useWatchlist";
import { Bookmark, Trash2, Calendar, Star, ArrowLeft } from "lucide-react";

const Watchlist = () => {
  const { watchlist, isLoading, user, removeFromWatchlist } = useWatchlist();
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/")}
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
                className="aspect-[2/3] rounded-2xl bg-secondary animate-pulse"
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {watchlist.map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative"
              >
                <div
                  onClick={() => setSelectedMovieId(movie.movie_id)}
                  className="cursor-pointer"
                >
                  <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-secondary shadow-card group-hover:shadow-card-hover transition-all duration-300">
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-foreground/80 transition-colors">
                      {movie.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      {movie.release_year && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {movie.release_year}
                        </span>
                      )}
                      {movie.rating && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current text-yellow-500" />
                          {movie.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWatchlist(movie.movie_id);
                  }}
                  className="absolute top-2 right-2 p-2 rounded-full bg-background/90 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {selectedMovieId && (
        <MovieDetailsModal
          movieId={selectedMovieId}
          isOpen={true}
          onClose={() => setSelectedMovieId(null)}
        />
      )}
    </div>
  );
};

export default Watchlist;
