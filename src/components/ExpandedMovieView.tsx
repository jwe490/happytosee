import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, Clock, Calendar, Play, Users,
  Film, Clapperboard, Bookmark, BookmarkCheck,
  ChevronLeft, Eye, EyeOff, Tv, ChevronDown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { Movie } from "@/hooks/useMovieRecommendations";
import { ReviewSection } from "@/components/ReviewSection";
import { ShareButton } from "@/components/ShareButton";
import { AddToCollectionButton } from "@/components/AddToCollectionButton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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

interface WatchProvider {
  id: number;
  name: string;
  logoUrl: string | null;
  url: string | null;
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
  watchProviders?: {
    flatrate: WatchProvider[];
    rent: WatchProvider[];
    buy: WatchProvider[];
  };
}

interface ExpandedMovieViewProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

const ExpandedMovieView = ({ movie, isOpen, onClose }: ExpandedMovieViewProps) => {
  const navigate = useNavigate();
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [watchProvidersOpen, setWatchProvidersOpen] = useState(false);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, user } = useWatchlist();
  const { markAsWatched, isWatched } = useWatchHistory();

  const handleBack = useCallback(() => {
    window.history.back();
  }, []);

  const { handlers: swipeHandlers } = useSwipeGesture({
    onSwipeRight: handleBack,
    threshold: 100,
  });

  useEffect(() => {
    if (movie && isOpen) {
      setCurrentMovie(movie);
      window.history.pushState({ modal: 'movie' }, '');
    }
  }, [movie, isOpen]);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (currentMovie && isOpen) {
      fetchMovieDetails(currentMovie.id);
      const timer = setTimeout(() => setShowContent(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
      setDetails(null);
      setShowTrailer(false);
    }
  }, [currentMovie, isOpen]);

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
    setShowContent(false);
    try {
      const { data, error } = await supabase.functions.invoke("movie-details", {
        body: { movieId: id },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setDetails(data);
      setTimeout(() => setShowContent(true), 200);
    } catch (error) {
      console.error("Error fetching movie details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCastClick = (member: CastMember) => {
    window.history.replaceState(null, '');
    onClose();
    navigate(`/person/${member.id}`);
  };

  const handleSimilarMovieClick = useCallback((similar: SimilarMovie) => {
    const newMovie: Movie = {
      id: similar.id,
      title: similar.title,
      rating: similar.rating,
      year: similar.year || 0,
      genre: "",
      posterUrl: similar.posterUrl,
      moodMatch: "",
    };
    setCurrentMovie(newMovie);
    const container = document.querySelector('.expanded-movie-scroll');
    if (container) container.scrollTop = 0;
  }, []);

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const hasWatchProviders = details?.watchProviders && 
    (details.watchProviders.flatrate.length > 0 || details.watchProviders.rent.length > 0);

  if (!currentMovie) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-background"
          {...swipeHandlers}
        >
          {/* Background blur */}
          <motion.div 
            className="absolute inset-0 overflow-hidden"
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <img
              src={details?.backdropUrl || currentMovie.posterUrl}
              alt=""
              className="w-full h-full object-cover opacity-15 blur-3xl scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/90 to-background" />
          </motion.div>

          {/* Back button - Fixed position to always be visible */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            onClick={handleBack}
            className="fixed top-4 left-4 z-[60] flex items-center gap-2 px-4 py-2.5 rounded-full bg-card/95 backdrop-blur-xl border border-border/50 text-foreground hover:bg-card shadow-lg active:scale-95 transition-all duration-150"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </motion.button>

          {/* Main content */}
          <div className="relative z-10 h-full overflow-y-auto expanded-movie-scroll">
            <div className="min-h-full flex flex-col items-center pt-20 pb-16 px-4">
              
              {/* Hero Poster */}
              <motion.div
                key={currentMovie.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="relative w-44 md:w-56 lg:w-64 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10"
              >
                <img
                  src={currentMovie.posterUrl}
                  alt={currentMovie.title}
                  className="w-full aspect-[2/3] object-cover"
                />
              </motion.div>

              {/* Movie Info */}
              <AnimatePresence mode="wait">
                {showContent && (
                  <motion.div
                    key={`content-${currentMovie.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.25 }}
                    className="w-full max-w-3xl mt-6 space-y-6"
                  >
                    {/* Title */}
                    <div className="text-center space-y-2">
                      <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                        {details?.title || currentMovie.title}
                      </h1>
                      
                      {details?.tagline && (
                        <p className="text-muted-foreground italic text-sm">
                          "{details.tagline}"
                        </p>
                      )}

                      {/* Meta badges */}
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-medium">
                          <Star className="w-3.5 h-3.5 fill-accent" />
                          {details?.rating || currentMovie.rating}
                        </span>
                        
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm">
                          <Calendar className="w-3.5 h-3.5" />
                          {currentMovie.year}
                        </span>
                        
                        {details?.runtime && details.runtime > 0 && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm">
                            <Clock className="w-3.5 h-3.5" />
                            {formatRuntime(details.runtime)}
                          </span>
                        )}
                      </div>

                      {/* Genres */}
                      {details?.genres && (
                        <div className="flex flex-wrap justify-center gap-2 pt-1">
                          {details.genres.map((genre) => (
                            <span
                              key={genre}
                              className="px-2.5 py-1 text-xs rounded-full bg-secondary text-secondary-foreground"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="w-full max-w-md mx-auto">
                      <div className="grid grid-cols-2 gap-3">
                        {details?.trailerKey && (
                          <Button
                            size="lg"
                            onClick={() => setShowTrailer(!showTrailer)}
                            className="gap-2 rounded-full active:scale-95 transition-transform col-span-2"
                          >
                            <Play className="w-4 h-4 fill-current" />
                            {showTrailer ? "Hide Trailer" : "Watch Trailer"}
                          </Button>
                        )}

                        {user && details && (
                          <>
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
                              className="gap-2 rounded-full active:scale-95 transition-transform"
                            >
                              {isInWatchlist(details.id) ? (
                                <>
                                  <BookmarkCheck className="w-4 h-4" />
                                  <span className="hidden sm:inline">Saved</span>
                                  <span className="sm:hidden">Save</span>
                                </>
                              ) : (
                                <>
                                  <Bookmark className="w-4 h-4" />
                                  Save
                                </>
                              )}
                            </Button>

                            <Button
                              variant={isWatched(details.id) ? "secondary" : "outline"}
                              size="lg"
                              onClick={() => markAsWatched({
                                id: details.id,
                                title: details.title,
                                poster_path: details.posterUrl,
                              })}
                              className="gap-2 rounded-full active:scale-95 transition-transform"
                            >
                              {isWatched(details.id) ? (
                                <>
                                  <Eye className="w-4 h-4" />
                                  <span className="hidden sm:inline">Watched</span>
                                  <span className="sm:hidden">Watch</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-4 h-4" />
                                  <span className="hidden sm:inline">Mark Watched</span>
                                  <span className="sm:hidden">Watch</span>
                                </>
                              )}
                            </Button>

                            <AddToCollectionButton
                              movie={{
                                id: details.id,
                                title: details.title,
                                poster_path: details.posterUrl,
                              }}
                            />
                          </>
                        )}

                        {details && (
                          <ShareButton
                            title={details.title}
                            text={`Check out ${details.title} on MoodFlix!`}
                            size="lg"
                            variant="outline"
                          />
                        )}
                      </div>
                    </div>

                    {/* Trailer */}
                    <AnimatePresence>
                      {showTrailer && details?.trailerKey && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="relative pt-[56.25%] rounded-xl overflow-hidden">
                            <iframe
                              className="absolute inset-0 w-full h-full"
                              src={`https://www.youtube.com/embed/${details.trailerKey}?autoplay=1`}
                              title="Trailer"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Loading */}
                    {isLoading && (
                      <div className="flex flex-col items-center gap-3 py-6">
                        <div className="flex gap-1.5">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 rounded-full bg-primary"
                              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                              transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">Loading details...</p>
                      </div>
                    )}

                    {/* Where to Watch - Collapsible */}
                    {hasWatchProviders && (
                      <Collapsible open={watchProvidersOpen} onOpenChange={setWatchProvidersOpen}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-card rounded-lg border border-border hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-2">
                            <Tv className="w-4 h-4 text-primary" />
                            <span className="font-medium text-sm">Where to Watch</span>
                            <span className="text-xs text-muted-foreground">
                              ({(details?.watchProviders?.flatrate.length || 0) + (details?.watchProviders?.rent.length || 0)} options)
                            </span>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${watchProvidersOpen ? "rotate-180" : ""}`} />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <div className="p-3 bg-card/50 rounded-lg border border-border space-y-3">
                            {details?.watchProviders?.flatrate && details.watchProviders.flatrate.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-xs text-muted-foreground uppercase tracking-wide">Stream</p>
                                <div className="space-y-1">
                                  {details.watchProviders.flatrate.map((provider) => (
                                    <a
                                      key={provider.id}
                                      href={provider.url || "#"}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors group"
                                    >
                                      {provider.logoUrl && (
                                        <img src={provider.logoUrl} alt="" className="w-6 h-6 rounded" />
                                      )}
                                      <span className="text-sm flex-1 group-hover:text-primary transition-colors">{provider.name}</span>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                            {details?.watchProviders?.rent && details.watchProviders.rent.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-xs text-muted-foreground uppercase tracking-wide">Rent / Buy</p>
                                <div className="space-y-1">
                                  {details.watchProviders.rent.map((provider) => (
                                    <a
                                      key={provider.id}
                                      href={provider.url || "#"}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors group"
                                    >
                                      {provider.logoUrl && (
                                        <img src={provider.logoUrl} alt="" className="w-6 h-6 rounded" />
                                      )}
                                      <span className="text-sm flex-1 group-hover:text-primary transition-colors">{provider.name}</span>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {/* Synopsis */}
                    {details?.overview && (
                      <div className="space-y-2">
                        <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                          <Film className="w-4 h-4 text-primary" />
                          Synopsis
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                          {details.overview}
                        </p>
                      </div>
                    )}

                    {/* Cast - Clickable */}
                    {details?.cast && details.cast.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" />
                          Cast
                        </h3>
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                          {details.cast.slice(0, 5).map((member) => (
                            <button
                              key={member.id}
                              onClick={() => handleCastClick(member)}
                              className="text-center space-y-1.5 group cursor-pointer"
                            >
                              <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted ring-2 ring-transparent group-hover:ring-primary transition-all">
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
                                <p className="font-medium text-xs text-foreground line-clamp-1 group-hover:text-primary transition-colors">{member.name}</p>
                                <p className="text-[10px] text-muted-foreground line-clamp-1">{member.character}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Similar Movies */}
                    {details?.similarMovies && details.similarMovies.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                          <Clapperboard className="w-4 h-4 text-primary" />
                          Similar Movies
                        </h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                          {details.similarMovies.slice(0, 6).map((similar, index) => (
                            <motion.div 
                              key={similar.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.03, duration: 0.2 }}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => handleSimilarMovieClick(similar)}
                              className="cursor-pointer group"
                            >
                              <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted shadow-sm group-hover:shadow-lg transition-shadow duration-150">
                                <img
                                  src={similar.posterUrl}
                                  alt={similar.title}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                              <p className="text-[10px] text-foreground line-clamp-1 mt-1.5 font-medium group-hover:text-primary transition-colors">
                                {similar.title}
                              </p>
                              <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                                <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                                {similar.rating}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reviews Section */}
                    {details && (
                      <ReviewSection
                        movieId={details.id}
                        movieTitle={details.title}
                        moviePoster={details.posterUrl || undefined}
                      />
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