import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Star,
  Calendar,
  MapPin,
  Film,
  ExternalLink,
  Instagram,
  Twitter,
  Facebook,
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

export const ActorPanel = ({ actorId, actorName, isOpen, onClose, onMovieClick }: ActorPanelProps) => {
  const [person, setPerson] = useState<PersonDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (actorId && isOpen) {
      fetchPersonDetails(actorId);
    } else {
      setPerson(null);
      setShowFullBio(false);
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

  const calculateAge = (birthday: string, deathday?: string | null) => {
    const birth = new Date(birthday);
    const end = deathday ? new Date(deathday) : new Date();
    let age = end.getFullYear() - birth.getFullYear();
    const m = end.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) age--;
    return age;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
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
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
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
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
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
              <p className="text-sm text-muted-foreground">Loading actor details...</p>
            </div>
          )}

          {/* Content */}
          {!isLoading && person && (
            <div className="p-4 space-y-6 pb-20">
              {/* Profile header */}
              <div className="flex gap-4">
                {person.profileUrl ? (
                  <img
                    src={person.profileUrl}
                    alt={person.name}
                    className="w-24 h-36 object-cover rounded-xl shadow-lg ring-1 ring-border/50 shrink-0"
                  />
                ) : (
                  <div className="w-24 h-36 bg-muted rounded-xl flex items-center justify-center shrink-0">
                    <User className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-2">
                  <h2 className="font-display text-xl font-bold text-foreground">{person.name}</h2>
                  <p className="text-sm text-muted-foreground">{person.knownFor}</p>
                  {person.birthday && (
                    <p className="text-xs text-muted-foreground">
                      {formatDate(person.birthday)} ({calculateAge(person.birthday, person.deathday)} years)
                    </p>
                  )}
                  {person.placeOfBirth && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {person.placeOfBirth}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats */}
              {person.stats && (
                <div className="grid grid-cols-3 gap-2">
                  <Card className="p-3 text-center">
                    <Film className="w-4 h-4 mx-auto text-primary mb-1" />
                    <p className="text-lg font-bold">{person.stats.totalMovies || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Movies</p>
                  </Card>
                  <Card className="p-3 text-center">
                    <Clapperboard className="w-4 h-4 mx-auto text-primary mb-1" />
                    <p className="text-lg font-bold">{person.stats.asActor || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Acting</p>
                  </Card>
                  <Card className="p-3 text-center">
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
                  person.externalIds.twitter ||
                  person.externalIds.facebook) && (
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

              {/* Filmography */}
              {person.actingRoles && person.actingRoles.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Clapperboard className="w-4 h-4 text-primary" />
                    Filmography ({person.actingRoles.length})
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {person.actingRoles.slice(0, 12).map((movie) => (
                      <motion.button
                        key={movie.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() =>
                          onMovieClick({
                            id: movie.id,
                            title: movie.title,
                            posterUrl: movie.posterUrl,
                            rating: movie.rating,
                            year: movie.year,
                          })
                        }
                        className="text-left group"
                      >
                        <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted shadow-sm ring-1 ring-border/50 group-hover:ring-primary transition-all">
                          {!imageErrors.has(movie.id) && movie.posterUrl ? (
                            <img
                              src={movie.posterUrl}
                              alt={movie.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={() => handleImageError(movie.id)}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Film className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] font-medium text-foreground line-clamp-1 mt-1 group-hover:text-primary transition-colors">
                          {movie.title}
                        </p>
                        <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                          <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                          {movie.rating?.toFixed(1) || "N/A"}
                          {movie.year && <span>• {movie.year}</span>}
                        </div>
                        {movie.character && (
                          <p className="text-[9px] text-muted-foreground line-clamp-1 italic">
                            as {movie.character}
                          </p>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error/not found */}
          {!isLoading && !person && actorId && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
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
