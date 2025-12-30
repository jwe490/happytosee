import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Star, Clock, Calendar, Play, Users, 
  Film, DollarSign, TrendingUp, Clapperboard,
  Bookmark, BookmarkCheck, ChevronLeft
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/hooks/useWatchlist";
import { Movie } from "@/hooks/useMovieRecommendations";

interface SimilarMovie {
  id: number;
  title: string;
  posterUrl: string;
  rating: number;
  year: number | null;
}

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
  budget: number;
  revenue: number;
  productionCompanies: string[];
  cast: CastMember[];
  trailerKey: string | null;
  trailerName: string | null;
  similarMovies: SimilarMovie[];
}

interface ExpandedMovieViewProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

const loadingMessages = [
  "Fetching the popcorn... 🍿",
  "Rolling the film reel... 🎬",
  "Gathering the stars... ⭐",
  "Dimming the lights... 🌙",
];

const ExpandedMovieView = ({ movie, isOpen, onClose }: ExpandedMovieViewProps) => {
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const [showContent, setShowContent] = useState(false);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, user } = useWatchlist();

  useEffect(() => {
    if (movie && isOpen) {
      fetchMovieDetails(movie.id);
      // Delay content reveal for smooth animation
      const timer = setTimeout(() => setShowContent(true), 400);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
      setDetails(null);
      setShowTrailer(false);
    }
  }, [movie, isOpen]);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

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

  const formatMoney = (amount: number) => {
    if (amount === 0) return "N/A";
    return `$${(amount / 1000000).toFixed(1)}M`;
  };

  if (!movie) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-background"
        >
          {/* Background with poster blur */}
          <motion.div 
            className="absolute inset-0 overflow-hidden"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <img
              src={details?.backdropUrl || movie.posterUrl}
              alt=""
              className="w-full h-full object-cover opacity-30 blur-xl"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
          </motion.div>

          {/* Close button */}
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            onClick={onClose}
            className="absolute top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-md border border-border/50 text-foreground hover:bg-card transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </motion.button>

          {/* Main content */}
          <div className="relative z-10 h-full overflow-y-auto">
            <div className="min-h-full flex flex-col items-center pt-20 pb-12 px-4">
              
              {/* Hero Poster - This is the key animated element */}
              <motion.div
                layoutId={`poster-${movie.id}`}
                className="relative w-48 md:w-64 lg:w-72 rounded-2xl overflow-hidden shadow-2xl"
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 30,
                  duration: 0.5
                }}
              >
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full aspect-[2/3] object-cover"
                />
              </motion.div>

              {/* Movie Info - Fades in after poster animation */}
              <AnimatePresence>
                {showContent && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="w-full max-w-4xl mt-8 space-y-8"
                  >
                    {/* Title Section */}
                    <div className="text-center space-y-3">
                      <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground"
                      >
                        {details?.title || movie.title}
                      </motion.h1>
                      
                      {details?.tagline && (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="text-muted-foreground italic text-lg"
                        >
                          "{details.tagline}"
                        </motion.p>
                      )}

                      {/* Meta badges */}
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="flex flex-wrap items-center justify-center gap-3"
                      >
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/20 text-accent">
                          <Star className="w-4 h-4 fill-accent" />
                          <span className="font-semibold">{details?.rating || movie.rating}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{movie.year}</span>
                        </div>
                        
                        {details?.runtime && details.runtime > 0 && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{formatRuntime(details.runtime)}</span>
                          </div>
                        )}
                      </motion.div>

                      {/* Genres */}
                      {details?.genres && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="flex flex-wrap justify-center gap-2"
                        >
                          {details.genres.map((genre) => (
                            <span
                              key={genre}
                              className="px-3 py-1 text-sm rounded-full bg-muted text-muted-foreground"
                            >
                              {genre}
                            </span>
                          ))}
                        </motion.div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45 }}
                      className="flex flex-wrap justify-center gap-4"
                    >
                      {details?.trailerKey && (
                        <Button
                          size="lg"
                          onClick={() => setShowTrailer(!showTrailer)}
                          className="gap-2 rounded-full"
                        >
                          <Play className="w-5 h-5 fill-current" />
                          {showTrailer ? "Hide Trailer" : "Watch Trailer"}
                        </Button>
                      )}
                      
                      {user && details && (
                        <Button
                          variant={isInWatchlist(details.id) ? "secondary" : "outline"}
                          size="lg"
                          onClick={() => {
                            if (isInWatchlist(details.id)) {
                              removeFromWatchlist(details.id);
                            } else {
                              addToWatchlist({
                                id: details.id,
                                title: details.title,
                                poster_path: details.posterUrl?.replace("https://image.tmdb.org/t/p/w500", ""),
                                release_date: details.releaseDate,
                                vote_average: details.rating,
                                overview: details.overview,
                              });
                            }
                          }}
                          className="gap-2 rounded-full"
                        >
                          {isInWatchlist(details.id) ? (
                            <>
                              <BookmarkCheck className="w-5 h-5" />
                              Saved
                            </>
                          ) : (
                            <>
                              <Bookmark className="w-5 h-5" />
                              Save to Watchlist
                            </>
                          )}
                        </Button>
                      )}
                    </motion.div>

                    {/* Trailer Player */}
                    <AnimatePresence>
                      {showTrailer && details?.trailerKey && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="relative pt-[56.25%] rounded-2xl overflow-hidden">
                            <iframe
                              className="absolute inset-0 w-full h-full"
                              src={`https://www.youtube.com/embed/${details.trailerKey}?autoplay=1`}
                              title="Movie Trailer"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Loading State */}
                    {isLoading && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center gap-4 py-8"
                      >
                        <div className="flex gap-2">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 rounded-full bg-primary"
                              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                              transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                            />
                          ))}
                        </div>
                        <p className="text-muted-foreground">{loadingMessage}</p>
                      </motion.div>
                    )}

                    {/* Synopsis */}
                    {details?.overview && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-3"
                      >
                        <h3 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                          <Film className="w-5 h-5 text-primary" />
                          Synopsis
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {details.overview}
                        </p>
                      </motion.div>
                    )}

                    {/* Cast */}
                    {details?.cast && details.cast.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55 }}
                        className="space-y-4"
                      >
                        <h3 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                          <Users className="w-5 h-5 text-primary" />
                          Cast
                        </h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                          {details.cast.slice(0, 5).map((member) => (
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
                                    <Users className="w-8 h-8" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-sm text-foreground line-clamp-1">{member.name}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">{member.character}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Box Office */}
                    {details && (details.budget > 0 || details.revenue > 0) && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="grid grid-cols-2 gap-4"
                      >
                        {details.budget > 0 && (
                          <div className="p-4 rounded-2xl bg-muted/50 space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <DollarSign className="w-4 h-4" />
                              <span className="text-sm">Budget</span>
                            </div>
                            <p className="text-xl font-display font-semibold text-foreground">
                              {formatMoney(details.budget)}
                            </p>
                          </div>
                        )}
                        {details.revenue > 0 && (
                          <div className="p-4 rounded-2xl bg-muted/50 space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <TrendingUp className="w-4 h-4" />
                              <span className="text-sm">Revenue</span>
                            </div>
                            <p className="text-xl font-display font-semibold text-foreground">
                              {formatMoney(details.revenue)}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Similar Movies */}
                    {details?.similarMovies && details.similarMovies.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65 }}
                        className="space-y-4"
                      >
                        <h3 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                          <Clapperboard className="w-5 h-5 text-primary" />
                          Similar Movies
                        </h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                          {details.similarMovies.slice(0, 6).map((similar) => (
                            <div key={similar.id} className="space-y-2">
                              <div className="aspect-[2/3] rounded-xl overflow-hidden bg-muted">
                                <img
                                  src={similar.posterUrl}
                                  alt={similar.title}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                              <p className="text-xs text-foreground line-clamp-2 font-medium">{similar.title}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExpandedMovieView;
