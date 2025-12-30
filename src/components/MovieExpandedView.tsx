import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Star, Clock, Calendar, Play, Users, 
  Film, Bookmark, BookmarkCheck, ChevronLeft
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/hooks/useWatchlist";
import { Movie } from "@/hooks/useMovieRecommendations";

interface CastMember {
  id: number;
  name: string;
  character: string;
  profileUrl: string | null;
}

interface MovieDetails {
  id: number;
  title: string;
  tagline: string;
  overview: string;
  releaseDate: string;
  runtime: number;
  rating: number;
  voteCount: number;
  posterUrl: string | null;
  backdropUrl: string | null;
  genres: string[];
  cast: CastMember[];
  trailerKey: string | null;
  trailerName: string | null;
}

interface MovieExpandedViewProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

const MovieExpandedView = ({ movie, isOpen, onClose }: MovieExpandedViewProps) => {
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, user } = useWatchlist();

  useEffect(() => {
    if (movie && isOpen) {
      fetchMovieDetails(movie.id);
    }
  }, [movie, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setShowTrailer(false);
      setDetails(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const fetchMovieDetails = async (id: number) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("movie-details", {
        body: { movieId: id },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setDetails(data);
    } catch (error) {
      console.error("Error fetching movie details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (!movie) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Expanded Content */}
          <motion.div
            layoutId={`movie-card-${movie.id}`}
            className="fixed inset-4 md:inset-8 lg:inset-12 z-50 bg-card rounded-3xl overflow-hidden shadow-2xl"
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              onClick={onClose}
              className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </motion.button>

            <div className="h-full overflow-y-auto">
              {/* Hero Section with Backdrop */}
              <div className="relative h-64 sm:h-80 md:h-96">
                {details?.backdropUrl ? (
                  <motion.img
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    src={details.backdropUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-muted to-secondary" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />

                {/* Poster & Title */}
                <div className="absolute bottom-0 left-0 right-0 p-6 flex gap-5">
                  <motion.div 
                    layoutId={`movie-poster-${movie.id}`}
                    className="flex-shrink-0 w-28 sm:w-36 md:w-44 rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                  >
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full aspect-[2/3] object-cover"
                    />
                  </motion.div>

                  <div className="flex-1 flex flex-col justify-end pb-2">
                    <motion.h1 
                      layoutId={`movie-title-${movie.id}`}
                      className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-foreground"
                    >
                      {movie.title}
                    </motion.h1>
                    {details?.tagline && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-muted-foreground italic mt-1 text-sm"
                      >
                        "{details.tagline}"
                      </motion.p>
                    )}

                    {/* Quick Info */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="flex flex-wrap items-center gap-3 mt-3"
                    >
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-semibold text-sm">{movie.rating}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{movie.year}</span>
                      </div>
                      {details?.runtime > 0 && (
                        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                          <Clock className="w-4 h-4" />
                          <span>{formatRuntime(details.runtime)}</span>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="p-6 space-y-6"
              >
                {/* Loading State */}
                {isLoading && (
                  <div className="flex items-center justify-center py-8 gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <Film className="w-6 h-6 text-primary" />
                    </motion.div>
                    <span className="text-muted-foreground">Loading details...</span>
                  </div>
                )}

                {/* Genres */}
                {details?.genres && details.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {details.genres.map((genre) => (
                      <span
                        key={genre}
                        className="px-3 py-1 text-sm rounded-full bg-secondary text-muted-foreground"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  {details?.trailerKey && (
                    <Button
                      onClick={() => setShowTrailer(true)}
                      className="gap-2 rounded-full"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Watch Trailer
                    </Button>
                  )}
                  {user && (
                    <Button
                      variant={isInWatchlist(movie.id) ? "secondary" : "outline"}
                      onClick={() => {
                        if (isInWatchlist(movie.id)) {
                          removeFromWatchlist(movie.id);
                        } else {
                          addToWatchlist({
                            id: movie.id,
                            title: movie.title,
                            poster_path: movie.posterUrl?.replace("https://image.tmdb.org/t/p/w500", ""),
                            release_date: String(movie.year),
                            vote_average: movie.rating,
                            overview: movie.moodMatch,
                          });
                        }
                      }}
                      className="gap-2 rounded-full"
                    >
                      {isInWatchlist(movie.id) ? (
                        <>
                          <BookmarkCheck className="w-4 h-4" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-4 h-4" />
                          Save to Watchlist
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Trailer */}
                <AnimatePresence>
                  {showTrailer && details?.trailerKey && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="relative pt-[56.25%] rounded-2xl overflow-hidden bg-black">
                        <iframe
                          className="absolute inset-0 w-full h-full"
                          src={`https://www.youtube.com/embed/${details.trailerKey}?autoplay=1`}
                          title={details.trailerName || "Movie Trailer"}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      <button
                        onClick={() => setShowTrailer(false)}
                        className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Close trailer
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Synopsis */}
                <div className="space-y-2">
                  <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                    <Film className="w-5 h-5 text-primary" />
                    Synopsis
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {details?.overview || movie.moodMatch || "No synopsis available."}
                  </p>
                </div>

                {/* Cast */}
                {details?.cast && details.cast.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Cast
                    </h3>
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                      {details.cast.slice(0, 6).map((member) => (
                        <div key={member.id} className="text-center space-y-2">
                          <div className="aspect-[2/3] rounded-xl overflow-hidden bg-muted">
                            {member.profileUrl ? (
                              <img
                                src={member.profileUrl}
                                alt={member.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <Users className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-xs text-foreground line-clamp-1">
                              {member.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground line-clamp-1">
                              {member.character}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MovieExpandedView;