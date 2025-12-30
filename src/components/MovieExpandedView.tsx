import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Star, Clock, Calendar, Play, Users, 
  Film, Bookmark, BookmarkCheck
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
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const fetchMovieDetails = async (id: number) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("movie-details", {
        body: { movieId: id },
      });
      if (error) throw error;
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-card rounded-3xl overflow-hidden shadow-2xl z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="h-full max-h-[90vh] overflow-y-auto">
              {/* Hero with Backdrop */}
              <div className="relative h-56 sm:h-72 md:h-80">
                {details?.backdropUrl ? (
                  <img
                    src={details.backdropUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-secondary to-muted" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />

                {/* Poster & Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 flex gap-4">
                  <div className="flex-shrink-0 w-24 sm:w-32 rounded-xl overflow-hidden shadow-xl border border-white/20">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full aspect-[2/3] object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-end min-w-0">
                    <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-foreground truncate">
                      {movie.title}
                    </h1>
                    {details?.tagline && (
                      <p className="text-muted-foreground italic text-sm mt-1 line-clamp-1">
                        "{details.tagline}"
                      </p>
                    )}

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-sm">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-semibold">{movie.rating}</span>
                      </div>
                      <span className="text-muted-foreground text-sm flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {movie.year}
                      </span>
                      {details?.runtime > 0 && (
                        <span className="text-muted-foreground text-sm flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatRuntime(details.runtime)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-5 space-y-5">
                {/* Loading */}
                {isLoading && (
                  <div className="flex items-center justify-center py-6 gap-2">
                    <Film className="w-5 h-5 text-primary animate-spin" />
                    <span className="text-muted-foreground text-sm">Loading details...</span>
                  </div>
                )}

                {/* Genres */}
                {details?.genres && details.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {details.genres.map((genre) => (
                      <span key={genre} className="px-3 py-1 text-xs rounded-full bg-secondary text-muted-foreground">
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {details?.trailerKey && (
                    <Button onClick={() => setShowTrailer(true)} size="sm" className="gap-2 rounded-full">
                      <Play className="w-4 h-4 fill-current" />
                      Trailer
                    </Button>
                  )}
                  {user && (
                    <Button
                      variant={isInWatchlist(movie.id) ? "secondary" : "outline"}
                      size="sm"
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
                        <><BookmarkCheck className="w-4 h-4" /> Saved</>
                      ) : (
                        <><Bookmark className="w-4 h-4" /> Save</>
                      )}
                    </Button>
                  )}
                </div>

                {/* Trailer */}
                {showTrailer && details?.trailerKey && (
                  <div className="space-y-2">
                    <div className="relative pt-[56.25%] rounded-xl overflow-hidden bg-black">
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${details.trailerKey}?autoplay=1`}
                        title="Trailer"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <button onClick={() => setShowTrailer(false)} className="text-xs text-muted-foreground hover:text-foreground">
                      Close trailer
                    </button>
                  </div>
                )}

                {/* Synopsis */}
                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Film className="w-4 h-4 text-primary" />
                    Synopsis
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {details?.overview || movie.moodMatch || "No synopsis available."}
                  </p>
                </div>

                {/* Cast */}
                {details?.cast && details.cast.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      Cast
                    </h3>
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                      {details.cast.slice(0, 6).map((member) => (
                        <div key={member.id} className="text-center">
                          <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted mb-1.5">
                            {member.profileUrl ? (
                              <img src={member.profileUrl} alt={member.name} className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <Users className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs font-medium text-foreground line-clamp-1">{member.name}</p>
                          <p className="text-[10px] text-muted-foreground line-clamp-1">{member.character}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MovieExpandedView;