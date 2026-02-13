import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Star, Clock, Calendar, Play, Users,
  Film, Bookmark, BookmarkCheck,
  ChevronLeft, Eye, EyeOff, Tv, ChevronDown, ExternalLink,
} from "lucide-react";
import { useEngagementTracking } from "@/hooks/useEngagementTracking";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { Movie } from "@/hooks/useMovieRecommendations";
import { EnhancedReviewSection } from "@/components/reviews/EnhancedReviewSection";
import { MinimalShareButton } from "@/components/sharing";
import { AddToCollectionButton } from "@/components/AddToCollectionButton";
import { PosterDownloadButton } from "@/components/PosterDownloadButton";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import SimilarMoviesGrid from "./SimilarMoviesGrid";

interface SimilarMovie { id: number; title: string; posterUrl: string; rating: number; year: number | null; }
interface CastMember { id: number; name: string; character: string; profileUrl: string | null; }
interface WatchProvider { id: number; name: string; logoUrl: string | null; url: string | null; }

interface MovieDetails {
  id: number; title: string; tagline: string; overview: string; releaseDate: string;
  runtime: number; rating: number; voteCount: number; posterUrl: string | null;
  backdropUrl: string | null; genres: string[]; budget: number; revenue: number;
  productionCompanies: string[]; cast: CastMember[]; trailerKey: string | null;
  trailerName: string | null; similarMovies: SimilarMovie[];
  watchProviders?: { flatrate: WatchProvider[]; rent: WatchProvider[]; buy: WatchProvider[]; };
}

interface ExpandedMovieViewProps {
  movie: Movie | null; isOpen: boolean; onClose: () => void;
  onRequestMovieChange?: (movieId: number) => void;
}

const ExpandedMovieView = ({ movie, isOpen, onClose, onRequestMovieChange }: ExpandedMovieViewProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [movieStack, setMovieStack] = useState<Movie[]>([]);
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [watchProvidersOpen, setWatchProvidersOpen] = useState(false);
  const historyDepthRef = useRef(0);
  const requestSeqRef = useRef(0);
  const wasOpenRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const { markAsWatched, isWatched } = useWatchHistory();

  const handleBack = useCallback(() => {
    if (movieStack.length > 1) {
      const newStack = movieStack.slice(0, -1);
      const prev = newStack[newStack.length - 1];
      setMovieStack(newStack); setCurrentMovie(prev);
      historyDepthRef.current = newStack.length;
      onRequestMovieChange?.(prev.id);
      requestAnimationFrame(() => { scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); });
    } else { onClose(); }
  }, [movieStack, onClose, onRequestMovieChange]);

  const { handlers: swipeHandlers } = useSwipeGesture({ onSwipeRight: handleBack, threshold: 100 });

  useEffect(() => {
    if (!isOpen) { wasOpenRef.current = false; setMovieStack([]); setCurrentMovie(null); historyDepthRef.current = 0; return; }
    if (movie && isOpen && !wasOpenRef.current) { setCurrentMovie(movie); setMovieStack([movie]); historyDepthRef.current = 1; wasOpenRef.current = true; }
    else if (movie && isOpen && wasOpenRef.current && movie.id !== currentMovie?.id) {
      const idx = movieStack.findIndex(m => m.id === movie.id);
      if (idx >= 0) { setMovieStack(movieStack.slice(0, idx + 1)); setCurrentMovie(movie); historyDepthRef.current = idx + 1; }
      else { setMovieStack(prev => [...prev, movie]); setCurrentMovie(movie); historyDepthRef.current += 1; }
    }
  }, [movie, isOpen]);

  useEffect(() => {
    if (currentMovie && isOpen) { fetchMovieDetails(currentMovie.id); const t = setTimeout(() => setShowContent(true), 300); return () => clearTimeout(t); }
    else { setShowContent(false); setDetails(null); setShowTrailer(false); }
  }, [currentMovie, isOpen]);

  useEffect(() => { document.body.style.overflow = isOpen ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [isOpen]);

  const fetchMovieDetails = async (id: number) => {
    const seq = ++requestSeqRef.current;
    setIsLoading(true); setShowContent(false); setDetails(null); setShowTrailer(false);
    try {
      const { data, error } = await supabase.functions.invoke("movie-details", { body: { movieId: id } });
      if (error) throw error; if (data.error) throw new Error(data.error);
      if (requestSeqRef.current !== seq) return;
      setDetails(data); setTimeout(() => { if (requestSeqRef.current === seq) setShowContent(true); }, 200);
    } catch (error) { console.error("Error fetching movie details:", error); }
    finally { if (requestSeqRef.current === seq) setIsLoading(false); }
  };

  const handleCastClick = (member: CastMember) => {
    navigate(`/person/${member.id}`, { state: { returnTo: `${location.pathname}${location.search}`, fromMovie: currentMovie?.id, fromMovieTitle: currentMovie?.title } });
  };

  const handleSimilarMovieClick = useCallback((similar: SimilarMovie) => {
    if (movieStack.some(m => m.id === similar.id)) return;
    const newMovie: Movie = { id: similar.id, title: similar.title, rating: similar.rating, year: similar.year || 0, genre: "", posterUrl: similar.posterUrl, moodMatch: "" };
    setMovieStack(prev => [...prev, newMovie]); setCurrentMovie(newMovie); historyDepthRef.current += 1;
    onRequestMovieChange?.(similar.id);
    requestAnimationFrame(() => { scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); });
  }, [movieStack, onRequestMovieChange]);

  const formatRuntime = (m: number) => `${Math.floor(m / 60)}h ${m % 60}m`;
  const hasWatchProviders = details?.watchProviders && (details.watchProviders.flatrate.length > 0 || details.watchProviders.rent.length > 0);

  // Scroll-based gradient fade
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => setScrollY(el.scrollTop);
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, [isOpen]);

  const gradientOpacity = Math.max(0, 1 - scrollY / 400);

  if (!currentMovie) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 bg-background" {...swipeHandlers}>

          {/* Sticky grainy gradient backdrop — fades on scroll */}
          <div 
            className="absolute inset-x-0 top-0 h-[420px] z-0 pointer-events-none overflow-hidden transition-opacity duration-300"
            style={{ opacity: gradientOpacity }}
          >
            {/* Multi-layer gradient */}
            <div 
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(ellipse 80% 60% at 30% 20%, hsl(280 60% 55% / 0.25), transparent 60%),
                  radial-gradient(ellipse 70% 50% at 70% 40%, hsl(200 70% 50% / 0.2), transparent 55%),
                  radial-gradient(ellipse 60% 40% at 50% 60%, hsl(340 65% 55% / 0.15), transparent 50%),
                  linear-gradient(to bottom, hsl(var(--background)) 0%, hsl(var(--card)) 40%, hsl(var(--background)) 100%)
                `,
              }}
            />
            {/* Shimmer layer */}
            <div 
              className="absolute inset-0 animate-gradient-shift"
              style={{
                background: `
                  radial-gradient(circle at 25% 30%, hsl(45 80% 60% / 0.12), transparent 40%),
                  radial-gradient(circle at 75% 60%, hsl(160 60% 50% / 0.1), transparent 40%)
                `,
              }}
            />
            {/* Grain texture */}
            <div 
              className="absolute inset-0"
              style={{
                opacity: 0.35,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
                mixBlendMode: "overlay",
              }}
            />
            {/* Bottom fade to background */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
          </div>

          {/* Nav buttons */}
          <div className="fixed top-4 left-4 z-[60] flex items-center gap-2">
            <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-background/50 backdrop-blur-xl border border-white/20 shadow-lg hover:bg-background/60 active:scale-95 transition-all text-foreground min-h-[44px]">
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm font-medium">{movieStack.length > 1 ? `Back` : 'Close'}</span>
            </motion.button>
          </div>

          {/* Main content */}
          <div ref={scrollRef} className="relative z-10 h-full overflow-y-auto expanded-movie-scroll">
            <div className="min-h-full flex flex-col items-center pt-20 pb-16 px-4">
              {/* Poster + Info — desktop layout */}
              <div className="w-full max-w-4xl flex flex-col md:flex-row md:items-start md:gap-10">
                {/* Poster */}
                <div className="relative mx-auto md:mx-0 shrink-0">
                  <motion.div key={currentMovie.id} initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.3 }}
                    className="relative w-44 md:w-56 lg:w-64 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                    {(details?.posterUrl || currentMovie.posterUrl) ? (
                      <img src={details?.posterUrl || currentMovie.posterUrl} alt={details?.title || currentMovie.title} className="w-full aspect-[2/3] object-cover" />
                    ) : (
                      <div className="w-full aspect-[2/3] bg-muted flex items-center justify-center animate-pulse"><Film className="w-12 h-12 text-muted-foreground" /></div>
                    )}
                  </motion.div>
                  <div className="absolute -top-1 -right-1 z-10"><PosterDownloadButton posterUrl={details?.posterUrl || currentMovie.posterUrl} movieTitle={details?.title || currentMovie.title} /></div>
                </div>

                {/* Info — on desktop sits next to poster */}
                <AnimatePresence mode="wait">
                  {showContent && (
                    <motion.div key={`content-${currentMovie.id}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 mt-6 md:mt-0 space-y-5">
                      <div className="text-center md:text-left space-y-2">
                        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">{details?.title || currentMovie.title}</h1>
                        {details?.tagline && <p className="text-muted-foreground italic text-sm">"{details.tagline}"</p>}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-medium"><Star className="w-3.5 h-3.5 fill-accent" />{details?.rating?.toFixed(1) || currentMovie.rating?.toFixed(1)}</span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm"><Calendar className="w-3.5 h-3.5" />{currentMovie.year}</span>
                          {details?.runtime && details.runtime > 0 && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm"><Clock className="w-3.5 h-3.5" />{formatRuntime(details.runtime)}</span>}
                        </div>
                        {details?.genres && <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">{details.genres.map(g => <span key={g} className="px-2.5 py-1 text-xs rounded-full bg-secondary text-secondary-foreground">{g}</span>)}</div>}
                      </div>

                      {/* Synopsis — visible on desktop next to poster */}
                      {details?.overview && (
                        <div className="hidden md:block space-y-2">
                          <p className="text-muted-foreground leading-relaxed text-base">{details.overview}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                        {details?.trailerKey && (
                          <Button size="lg" onClick={() => setShowTrailer(!showTrailer)} className="gap-2 rounded-full active:scale-95 transition-transform min-h-[48px]">
                            <Play className="w-4 h-4 fill-current" />{showTrailer ? "Hide Trailer" : "Watch Trailer"}
                          </Button>
                        )}
                        {details && (
                          <>
                            <Button variant={isInWatchlist(details.id) ? "secondary" : "outline"} size="lg" onClick={() => { isInWatchlist(details.id) ? removeFromWatchlist(details.id) : addToWatchlist({ id: details.id, title: details.title, poster_path: details.posterUrl?.replace("https://image.tmdb.org/t/p/w500", ""), release_date: details.releaseDate, vote_average: details.rating, overview: details.overview }); }} className="gap-2 rounded-full active:scale-95 transition-transform min-h-[48px]">
                              {isInWatchlist(details.id) ? <><BookmarkCheck className="w-4 h-4" />Saved</> : <><Bookmark className="w-4 h-4" />Save</>}
                            </Button>
                            <Button variant={isWatched(details.id) ? "secondary" : "outline"} size="lg" onClick={() => markAsWatched({ id: details.id, title: details.title, poster_path: details.posterUrl })} className="gap-2 rounded-full active:scale-95 transition-transform min-h-[48px]">
                              {isWatched(details.id) ? <><Eye className="w-4 h-4" />Watched</> : <><EyeOff className="w-4 h-4" />Mark Watched</>}
                            </Button>
                            <AddToCollectionButton movie={{ id: details.id, title: details.title, poster_path: details.posterUrl }} />
                            <MinimalShareButton title={details.title} text={`Check out ${details.title} on MoodFlix!`} variant="outline" />
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Below-fold content */}
              <AnimatePresence mode="wait">
                {showContent && (
                  <motion.div key={`below-${currentMovie.id}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-4xl mt-8 space-y-8">

                    {/* Trailer */}
                    <AnimatePresence>
                      {showTrailer && details?.trailerKey && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          <div className="relative pt-[56.25%] rounded-2xl overflow-hidden shadow-2xl">
                            <iframe className="absolute inset-0 w-full h-full" src={`https://www.youtube.com/embed/${details.trailerKey}?autoplay=1`} title="Trailer" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {isLoading && (
                      <div className="flex flex-col items-center gap-3 py-6">
                        <div className="flex gap-1.5">{[0,1,2].map(i => <motion.div key={i} className="w-2 h-2 rounded-full bg-primary" animate={{ scale: [1,1.3,1], opacity: [0.5,1,0.5] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} />)}</div>
                        <p className="text-sm text-muted-foreground">Loading details...</p>
                      </div>
                    )}

                    {/* Synopsis (mobile) */}
                    {details?.overview && (
                      <div className="md:hidden space-y-2">
                        <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2"><Film className="w-4 h-4 text-primary" />Synopsis</h3>
                        <p className="text-muted-foreground leading-relaxed text-base">{details.overview}</p>
                      </div>
                    )}

                    {/* Where to Watch */}
                    {hasWatchProviders && (
                      <Collapsible open={watchProvidersOpen} onOpenChange={setWatchProvidersOpen}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-card rounded-xl border border-border hover:bg-muted/50 transition-colors min-h-[48px]">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><Tv className="w-5 h-5 text-primary" /></div>
                            <div className="text-left"><span className="font-semibold text-sm block">Where to Watch</span><span className="text-xs text-muted-foreground">{(details?.watchProviders?.flatrate.length || 0) + (details?.watchProviders?.rent.length || 0)} platforms</span></div>
                          </div>
                          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${watchProvidersOpen ? "rotate-180" : ""}`} />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <div className="p-4 bg-card/50 rounded-xl border border-border space-y-4">
                            {details?.watchProviders?.flatrate && details.watchProviders.flatrate.length > 0 && (
                              <div className="space-y-3">
                                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Stream</p>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                  {details.watchProviders.flatrate.map(p => (
                                    <a key={p.id} href={p.url || "#"} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-colors group">
                                      {p.logoUrl ? <img src={p.logoUrl} alt={p.name} className="w-12 h-12 rounded-xl shadow-md" /> : <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center"><ExternalLink className="w-5 h-5 text-muted-foreground" /></div>}
                                      <span className="text-xs text-center font-medium line-clamp-1">{p.name}</span>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                            {details?.watchProviders?.rent && details.watchProviders.rent.length > 0 && (
                              <div className="space-y-3">
                                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Rent / Buy</p>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                  {details.watchProviders.rent.map(p => (
                                    <a key={p.id} href={p.url || "#"} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-colors group">
                                      {p.logoUrl ? <img src={p.logoUrl} alt={p.name} className="w-12 h-12 rounded-xl shadow-md" /> : <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center"><ExternalLink className="w-5 h-5 text-muted-foreground" /></div>}
                                      <span className="text-xs text-center font-medium line-clamp-1">{p.name}</span>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {/* Cast */}
                    {details?.cast && details.cast.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2"><Users className="w-4 h-4 text-primary" />Cast</h3>
                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                          {details.cast.slice(0, 6).map(member => (
                            <button key={member.id} onClick={() => handleCastClick(member)} className="text-center space-y-1.5 group cursor-pointer min-h-[44px]">
                              <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted ring-2 ring-transparent group-hover:ring-primary transition-all">
                                {member.profileUrl ? <img src={member.profileUrl} alt={member.name} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Users className="w-6 h-6" /></div>}
                              </div>
                              <div><p className="font-medium text-xs text-foreground line-clamp-1 group-hover:text-primary transition-colors">{member.name}</p><p className="text-[10px] text-muted-foreground line-clamp-1">{member.character}</p></div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {details?.similarMovies && details.similarMovies.length > 0 && <SimilarMoviesGrid movieId={details.id} initialMovies={details.similarMovies} onMovieClick={handleSimilarMovieClick} />}

                    <div className="scroll-mt-6">{details && <EnhancedReviewSection movieId={details.id} movieTitle={details.title} moviePoster={details.posterUrl || undefined} />}</div>
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