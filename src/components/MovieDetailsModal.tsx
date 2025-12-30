import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Star, Clock, Calendar, Play, Users, 
  Film, DollarSign, TrendingUp, Loader2, Clapperboard
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

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

const MovieDetailsModal = ({ movieId, isOpen, onClose }: MovieDetailsModalProps) => {
  const [currentMovieId, setCurrentMovieId] = useState<number | null>(null);
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    if (movieId && isOpen) {
      setCurrentMovieId(movieId);
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

  const handleSimilarMovieClick = (id: number) => {
    setShowTrailer(false);
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
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-card border-border">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : details ? (
          <ScrollArea className="max-h-[90vh]">
            <div className="relative">
              {/* Backdrop Image */}
              {details.backdropUrl && (
                <div className="relative h-64 md:h-80 overflow-hidden">
                  <img
                    src={details.backdropUrl}
                    alt={details.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors z-10"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>

              {/* Content */}
              <div className="relative px-6 pb-6 -mt-20 md:-mt-32 z-10">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Poster */}
                  <div className="flex-shrink-0">
                    <img
                      src={details.posterUrl || "/placeholder.svg"}
                      alt={details.title}
                      className="w-40 md:w-48 rounded-xl shadow-2xl border border-border"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                        {details.title}
                      </h2>
                      {details.tagline && (
                        <p className="text-muted-foreground italic mt-1">
                          "{details.tagline}"
                        </p>
                      )}
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/20 text-primary">
                        <Star className="w-4 h-4 fill-primary" />
                        <span className="font-semibold">{details.rating}</span>
                        <span className="text-muted-foreground">
                          ({details.voteCount.toLocaleString()} votes)
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
                    <div className="flex flex-wrap gap-2">
                      {details.genres.map((genre) => (
                        <span
                          key={genre}
                          className="px-3 py-1 text-sm rounded-full bg-muted text-muted-foreground"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>

                    {/* Trailer Button */}
                    {details.trailerKey && (
                      <Button
                        variant="cinema"
                        size="lg"
                        onClick={() => setShowTrailer(true)}
                        className="gap-2"
                      >
                        <Play className="w-5 h-5 fill-current" />
                        Watch Trailer
                      </Button>
                    )}
                  </div>
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
                      <div className="relative pt-[56.25%] rounded-xl overflow-hidden">
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
                <div className="mt-8 space-y-3">
                  <h3 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                    <Film className="w-5 h-5 text-primary" />
                    Synopsis
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {details.overview || "No synopsis available."}
                  </p>
                </div>

                {/* Cast */}
                {details.cast.length > 0 && (
                  <div className="mt-8 space-y-4">
                    <h3 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Cast
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {details.cast.map((member) => (
                        <div
                          key={member.id}
                          className="text-center space-y-2"
                        >
                          <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted">
                            {member.profileUrl ? (
                              <img
                                src={member.profileUrl}
                                alt={member.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <Users className="w-8 h-8" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-foreground line-clamp-1">
                              {member.name}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {member.character}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Box Office */}
                {(details.budget > 0 || details.revenue > 0) && (
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    {details.budget > 0 && (
                      <div className="p-4 rounded-xl bg-muted/50 space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign className="w-4 h-4" />
                          <span className="text-sm">Budget</span>
                        </div>
                        <p className="text-xl font-semibold text-foreground">
                          {formatMoney(details.budget)}
                        </p>
                      </div>
                    )}
                    {details.revenue > 0 && (
                      <div className="p-4 rounded-xl bg-muted/50 space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-sm">Box Office</span>
                        </div>
                        <p className="text-xl font-semibold text-foreground">
                          {formatMoney(details.revenue)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Production Companies */}
                {details.productionCompanies.length > 0 && (
                  <div className="mt-6 text-sm text-muted-foreground">
                    <span className="font-medium">Production: </span>
                    {details.productionCompanies.slice(0, 3).join(", ")}
                  </div>
                )}

                {/* Similar Movies */}
                {details.similarMovies && details.similarMovies.length > 0 && (
                  <div className="mt-8 space-y-4">
                    <h3 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                      <Clapperboard className="w-5 h-5 text-primary" />
                      Similar Movies
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {details.similarMovies.map((movie) => (
                        <button
                          key={movie.id}
                          onClick={() => handleSimilarMovieClick(movie.id)}
                          className="group text-left space-y-2 transition-transform hover:scale-105"
                        >
                          <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted relative">
                            <img
                              src={movie.posterUrl}
                              alt={movie.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-1 left-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex items-center gap-1 text-xs text-white">
                                <Star className="w-3 h-3 fill-primary text-primary" />
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
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default MovieDetailsModal;
