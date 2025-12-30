import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Star, Clock, Calendar, Play, Users, 
  Film, DollarSign, TrendingUp, Clapperboard,
  Bookmark, BookmarkCheck
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/hooks/useWatchlist";

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

interface MovieDetailsModalProps {
  movieId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

// Fun loading messages
const loadingMessages = [
  "Fetching the popcorn... 🍿",
  "Rolling the film reel... 🎬",
  "Gathering the stars... ⭐",
  "Dimming the lights... 🌙",
  "Finding the plot twist... 🎭",
  "Warming up the projector... 📽️",
];

const MovieDetailsModal = ({ movieId, isOpen, onClose }: MovieDetailsModalProps) => {
  const [currentMovieId, setCurrentMovieId] = useState<number | null>(null);
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, user } = useWatchlist();

  useEffect(() => {
    if (movieId && isOpen) {
      setCurrentMovieId(movieId);
      setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
    }
  }, [movieId, isOpen]);

  useEffect(() => {
    if (currentMovieId && isOpen) {
      fetchMovieDetails(currentMovieId);
    }
  }, [currentMovieId, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setShowTrailer(false);
      setDetails(null);
      setCurrentMovieId(null);
    }
  }, [isOpen]);

  // Rotate loading messages
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  // Lock body scroll when modal is open
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

  const handleSimilarMovieClick = (id: number) => {
    setShowTrailer(false);
    setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
    setCurrentMovieId(id);
  };

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-card border-border rounded-3xl">
        {/* Sticky Close Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="absolute top-3 right-3 p-2.5 rounded-full bg-background/95 backdrop-blur-md hover:bg-background shadow-lg transition-colors z-[60] border border-border/50"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-foreground" />
        </motion.button>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-96 gap-6">
            {/* Animated Film Reel */}
            <motion.div
              className="relative"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                  <Film className="w-8 h-8 text-primary" />
                </motion.div>
              </div>
            </motion.div>
            
            {/* Fun Loading Message */}
            <motion.p
              key={loadingMessage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-lg font-medium text-foreground"
            >
              {loadingMessage}
            </motion.p>

            {/* Progress dots */}
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
          </div>
        ) : details ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative max-h-[90vh] overflow-y-auto"
          >

            {/* Backdrop Image */}
            {details.backdropUrl && (
              <div className="relative h-48 sm:h-64 md:h-80 overflow-hidden">
                <motion.img
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  src={details.backdropUrl}
                  alt={details.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
              </div>
            )}

            {/* Content */}
            <div className="relative px-4 sm:px-6 pb-6 -mt-16 sm:-mt-20 md:-mt-32 z-10">
              <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                {/* Poster */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex-shrink-0 flex justify-center md:justify-start"
                >
                  <img
                    src={details.posterUrl || "/placeholder.svg"}
                    alt={details.title}
                    className="w-32 sm:w-40 md:w-48 rounded-2xl shadow-2xl border border-border/50"
                  />
                </motion.div>

                {/* Info */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex-1 space-y-4 text-center md:text-left"
                >
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                      {details.title}
                    </h2>
                    {details.tagline && (
                      <p className="text-muted-foreground italic mt-1 text-sm sm:text-base">
                        "{details.tagline}"
                      </p>
                    )}
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-4 text-sm">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/20 text-accent">
                      <Star className="w-4 h-4 fill-accent" />
                      <span className="font-semibold">{details.rating}</span>
                      <span className="text-muted-foreground hidden sm:inline">
                        ({details.voteCount.toLocaleString()})
                      </span>
                    </div>
                    
                    {details.releaseDate && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(details.releaseDate).getFullYear()}</span>
                      </div>
                    )}
                    
                    {details.runtime > 0 && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{formatRuntime(details.runtime)}</span>
                      </div>
                    )}
                  </div>

                  {/* Genres */}
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    {details.genres.map((genre, i) => (
                      <motion.span
                        key={genre}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                        className="px-3 py-1 text-xs sm:text-sm rounded-full bg-muted text-muted-foreground"
                      >
                        {genre}
                      </motion.span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    {details.trailerKey && (
                      <Button
                        variant="default"
                        size="default"
                        onClick={() => setShowTrailer(true)}
                        className="gap-2 rounded-full"
                      >
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                        <span className="text-sm sm:text-base">Watch Trailer</span>
                      </Button>
                    )}
                    
                    {user && (
                      <Button
                        variant={isInWatchlist(details.id) ? "secondary" : "outline"}
                        size="default"
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
                            <BookmarkCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="text-sm sm:text-base">Saved</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="text-sm sm:text-base">Save</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Trailer Player */}
              <AnimatePresence>
                {showTrailer && details.trailerKey && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 overflow-hidden"
                  >
                    <div className="relative pt-[56.25%] rounded-2xl overflow-hidden">
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${details.trailerKey}?autoplay=1`}
                        title={details.trailerName || "Movie Trailer"}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Synopsis */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6 sm:mt-8 space-y-3"
              >
                <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground flex items-center gap-2">
                  <Film className="w-5 h-5 text-primary" />
                  Synopsis
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {details.overview || "No synopsis available."}
                </p>
              </motion.div>

              {/* Cast */}
              {details.cast.length > 0 && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 sm:mt-8 space-y-4"
                >
                  <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Cast
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
                    {details.cast.slice(0, 5).map((member, i) => (
                      <motion.div
                        key={member.id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5 + i * 0.05 }}
                        className="text-center space-y-2"
                      >
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
                              <Users className="w-6 h-6 sm:w-8 sm:h-8" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-xs sm:text-sm text-foreground line-clamp-1">
                            {member.name}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {member.character}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Box Office */}
              {(details.budget > 0 || details.revenue > 0) && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4"
                >
                  {details.budget > 0 && (
                    <div className="p-3 sm:p-4 rounded-2xl bg-muted/50 space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-xs sm:text-sm">Budget</span>
                      </div>
                      <p className="text-lg sm:text-xl font-semibold text-foreground">
                        {formatMoney(details.budget)}
                      </p>
                    </div>
                  )}
                  {details.revenue > 0 && (
                    <div className="p-3 sm:p-4 rounded-2xl bg-muted/50 space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs sm:text-sm">Box Office</span>
                      </div>
                      <p className="text-lg sm:text-xl font-semibold text-foreground">
                        {formatMoney(details.revenue)}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Production Companies */}
              {details.productionCompanies.length > 0 && (
                <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-muted-foreground">
                  <span className="font-medium">Production: </span>
                  {details.productionCompanies.slice(0, 3).join(", ")}
                </div>
              )}

              {/* Similar Movies */}
              {details.similarMovies && details.similarMovies.length > 0 && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-6 sm:mt-8 space-y-4"
                >
                  <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground flex items-center gap-2">
                    <Clapperboard className="w-5 h-5 text-primary" />
                    You Might Also Like
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
                    {details.similarMovies.slice(0, 6).map((movie, i) => (
                      <motion.button
                        key={movie.id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.7 + i * 0.05 }}
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSimilarMovieClick(movie.id)}
                        className="group text-left space-y-2"
                      >
                        <div className="aspect-[2/3] rounded-xl overflow-hidden bg-muted relative shadow-md">
                          <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute bottom-1 left-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-1 text-xs text-white">
                              <Star className="w-3 h-3 fill-accent text-accent" />
                              <span>{movie.rating}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-xs text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                            {movie.title}
                          </p>
                          {movie.year && (
                            <p className="text-xs text-muted-foreground">
                              {movie.year}
                            </p>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default MovieDetailsModal;
