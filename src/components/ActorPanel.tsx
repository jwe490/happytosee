import { useState, useEffect, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Star,
  Calendar,
  MapPin,
  Film,
  Instagram,
  Twitter,
  TrendingUp,
  Award,
  Clapperboard,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface Movie {
  id: number;
  title: string;
  character?: string | null;
  job?: string | null;
  posterUrl: string;
  rating: number;
  year: number;
}

interface PersonDetails {
  id: number;
  name: string;
  biography: string | null;
  birthday: string | null;
  deathday: string | null;
  placeOfBirth: string | null;
  profileUrl: string | null;
  knownFor: string;
  popularity: number;
  alsoKnownAs: string[];
  gender: string;
  externalIds: {
    imdb: string | null;
    instagram: string | null;
    twitter: string | null;
    facebook: string | null;
  };
  stats: {
    totalMovies: number;
    asActor: number;
    asCrew: number;
  };
  actingRoles: Movie[];
}

interface ActorPanelProps {
  actorId: number | null;
  actorName?: string;
  isOpen: boolean;
  onClose: () => void;
  onMovieClick: (movie: { id: number; title: string; posterUrl: string; rating: number; year: number }) => void;
}

// Memoized movie card for filmography
const FilmographyCard = memo(({ 
  movie, 
  onMovieClick, 
  hasImageError,
  onImageError 
}: { 
  movie: Movie; 
  onMovieClick: (movie: Movie) => void;
  hasImageError: boolean;
  onImageError: (id: number) => void;
}) => (
  <button
    onClick={() => onMovieClick(movie)}
    className="text-left group transition-transform active:scale-95"
  >
    <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted shadow-sm ring-1 ring-border/50 group-hover:ring-primary/50 transition-all">
      {!hasImageError && movie.posterUrl ? (
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => onImageError(movie.id)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-secondary">
          <Film className="w-6 h-6 text-muted-foreground" />
        </div>
      )}
    </div>
    <p className="text-[11px] font-medium text-foreground line-clamp-1 mt-1.5 group-hover:text-primary transition-colors">
      {movie.title}
    </p>
    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
      <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
      {movie.rating?.toFixed(1) || "N/A"}
    </div>
    {movie.character && (
      <p className="text-[9px] text-muted-foreground line-clamp-1 italic">
        as {movie.character}
      </p>
    )}
  </button>
));
FilmographyCard.displayName = "FilmographyCard";

// Loading skeleton for actor panel
const ActorPanelSkeleton = () => (
  <div className="p-4 space-y-6 animate-fade-in">
    <div className="flex gap-4">
      <Skeleton className="w-24 h-36 rounded-xl shrink-0" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-2">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-20 rounded-lg" />
      ))}
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-16 w-full" />
    </div>
  </div>
);

export const ActorPanel = ({ actorId, actorName, isOpen, onClose, onMovieClick }: ActorPanelProps) => {
  const [person, setPerson] = useState<PersonDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [expandedDecades, setExpandedDecades] = useState<Set<string>>(new Set(["2020s"]));

  useEffect(() => {
    if (actorId && isOpen) {
      fetchPersonDetails(actorId);
    } else {
      setPerson(null);
      setShowFullBio(false);
      setImageErrors(new Set());
    }
  }, [actorId, isOpen]);

  const fetchPersonDetails = async (personId: number) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("person-details", {
        body: { personId },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setPerson(data);
    } catch (error) {
      console.error("Error fetching person details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = (movieId: number) => {
    setImageErrors((prev) => new Set([...prev, movieId]));
  };

  // Group movies by decade for categorized filmography
  const filmographyByDecade = useMemo(() => {
    if (!person?.actingRoles) return {};
    
    const grouped: Record<string, Movie[]> = {};
    
    person.actingRoles
      .filter(m => m.year && m.year > 1900)
      .sort((a, b) => b.year - a.year)
      .forEach(movie => {
        const decade = `${Math.floor(movie.year / 10) * 10}s`;
        if (!grouped[decade]) grouped[decade] = [];
        grouped[decade].push(movie);
      });
    
    return grouped;
  }, [person?.actingRoles]);

  const decades = useMemo(() => Object.keys(filmographyByDecade).sort((a, b) => parseInt(b) - parseInt(a)), [filmographyByDecade]);

  const toggleDecade = (decade: string) => {
    setExpandedDecades(prev => {
      const next = new Set(prev);
      if (next.has(decade)) {
        next.delete(decade);
      } else {
        next.add(decade);
      }
      return next;
    });
  };

  const calculateAge = (birthday: string, deathday?: string | null) => {
    const birth = new Date(birthday);
    const end = deathday ? new Date(deathday) : new Date();
    let age = end.getFullYear() - birth.getFullYear();
    const m = end.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) age--;
    return age;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 350 }}
          className="absolute inset-0 z-[70] bg-background overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-95 min-h-[44px] touch-manipulation"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to movie
            </button>
            {actorName && (
              <span className="text-sm font-medium text-foreground truncate">{actorName}</span>
            )}
          </div>

          {/* Loading state */}
          {isLoading && <ActorPanelSkeleton />}

          {/* Content */}
          {!isLoading && person && (
            <div className="p-4 space-y-6 pb-20 animate-fade-in">
              {/* Profile header */}
              <div className="flex gap-4">
                {person.profileUrl ? (
                  <img
                    src={person.profileUrl}
                    alt={person.name}
                    className="w-24 h-36 object-cover rounded-xl shadow-lg ring-1 ring-border/50 shrink-0"
                  />
                ) : (
                  <div className="w-24 h-36 bg-secondary rounded-xl flex items-center justify-center shrink-0">
                    <User className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-2">
                  <h2 className="font-display text-xl font-bold text-foreground">{person.name}</h2>
                  <p className="text-sm text-muted-foreground">{person.knownFor}</p>
                  {person.birthday && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {formatDate(person.birthday)} ({calculateAge(person.birthday, person.deathday)} years)
                    </p>
                  )}
                  {person.placeOfBirth && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" />
                      <span className="line-clamp-1">{person.placeOfBirth}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Stats */}
              {person.stats && (
                <div className="grid grid-cols-3 gap-2">
                  <Card className="p-3 text-center bg-secondary/50">
                    <Film className="w-4 h-4 mx-auto text-primary mb-1" />
                    <p className="text-lg font-bold">{person.stats.totalMovies || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Movies</p>
                  </Card>
                  <Card className="p-3 text-center bg-secondary/50">
                    <Clapperboard className="w-4 h-4 mx-auto text-primary mb-1" />
                    <p className="text-lg font-bold">{person.stats.asActor || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Acting</p>
                  </Card>
                  <Card className="p-3 text-center bg-secondary/50">
                    <TrendingUp className="w-4 h-4 mx-auto text-primary mb-1" />
                    <p className="text-lg font-bold">{person.popularity?.toFixed(0) || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Popularity</p>
                  </Card>
                </div>
              )}

              {/* Biography */}
              {person.biography && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary" />
                    Biography
                  </h3>
                  <p
                    className={cn(
                      "text-sm text-muted-foreground leading-relaxed",
                      !showFullBio && "line-clamp-4"
                    )}
                  >
                    {person.biography}
                  </p>
                  {person.biography.length > 300 && (
                    <button
                      onClick={() => setShowFullBio(!showFullBio)}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      {showFullBio ? (
                        <>
                          <ChevronUp className="w-3 h-3" /> Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3" /> Read more
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Social links */}
              {person.externalIds &&
                (person.externalIds.imdb ||
                  person.externalIds.instagram ||
                  person.externalIds.twitter) && (
                  <div className="flex flex-wrap gap-2">
                    {person.externalIds.imdb && (
                      <Button variant="outline" size="sm" asChild className="gap-2 h-8">
                        <a
                          href={`https://www.imdb.com/name/${person.externalIds.imdb}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Film className="w-3 h-3" />
                          IMDb
                        </a>
                      </Button>
                    )}
                    {person.externalIds.instagram && (
                      <Button variant="outline" size="sm" asChild className="gap-2 h-8">
                        <a
                          href={`https://www.instagram.com/${person.externalIds.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Instagram className="w-3 h-3" />
                          IG
                        </a>
                      </Button>
                    )}
                    {person.externalIds.twitter && (
                      <Button variant="outline" size="sm" asChild className="gap-2 h-8">
                        <a
                          href={`https://twitter.com/${person.externalIds.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Twitter className="w-3 h-3" />
                          X
                        </a>
                      </Button>
                    )}
                  </div>
                )}

              {/* Categorized Filmography by Decade */}
              {decades.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Clapperboard className="w-4 h-4 text-primary" />
                    Filmography ({person.actingRoles?.length || 0} credits)
                  </h3>
                  
                  <div className="space-y-3">
                    {decades.map((decade) => {
                      const movies = filmographyByDecade[decade];
                      const isExpanded = expandedDecades.has(decade);
                      
                      return (
                        <div key={decade} className="border border-border rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleDecade(decade)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-secondary/30 hover:bg-secondary/50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{decade}</span>
                              <span className="text-xs text-muted-foreground">
                                ({movies.length} {movies.length === 1 ? 'movie' : 'movies'})
                              </span>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                          
                          {isExpanded && (
                            <div className="p-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
                              {movies.map((movie) => (
                                <FilmographyCard
                                  key={movie.id}
                                  movie={movie}
                                  onMovieClick={(m) =>
                                    onMovieClick({
                                      id: m.id,
                                      title: m.title,
                                      posterUrl: m.posterUrl,
                                      rating: m.rating,
                                      year: m.year,
                                    })
                                  }
                                  hasImageError={imageErrors.has(movie.id)}
                                  onImageError={handleImageError}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error/not found */}
          {!isLoading && !person && actorId && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
              <User className="w-12 h-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Could not load actor details</p>
              <Button variant="outline" size="sm" onClick={onClose}>
                Go back
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ActorPanel;
