import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Star,
  Film,
  Instagram,
  Twitter,
  Facebook,
  TrendingUp,
  Award,
  Clapperboard,
  ChevronDown,
  ChevronUp,
  User,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Movie {
  id: number;
  title: string;
  character?: string | null;
  job?: string | null;
  jobs?: string[];
  posterUrl: string;
  backdropUrl?: string | null;
  rating: number;
  year: number;
  releaseDate?: string | null;
  popularity: number;
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
  homepage: string | null;
  externalIds: {
    imdb: string | null;
    instagram: string | null;
    twitter: string | null;
    facebook: string | null;
  };
  additionalPhotos: string[];
  stats: {
    totalMovies: number;
    asActor: number;
    asCrew: number;
  };
  actingRoles: Movie[];
  crewRoles: { [category: string]: Movie[] };
}

interface ActorPanelProps {
  personId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onMovieSelect?: (movieId: number) => void;
}

export function ActorPanel({ personId, isOpen, onClose, onMovieSelect }: ActorPanelProps) {
  const [person, setPerson] = useState<PersonDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({ acting: true });
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const requestSeqRef = useRef(0);

  useEffect(() => {
    if (personId && isOpen) {
      fetchPersonDetails(personId);
    } else {
      setPerson(null);
      setShowFullBio(false);
    }
  }, [personId, isOpen]);

  // Lock body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const fetchPersonDetails = async (id: number) => {
    const seq = ++requestSeqRef.current;
    setIsLoading(true);
    setPerson(null);

    try {
      const { data, error } = await supabase.functions.invoke("person-details", {
        body: { personId: id },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      if (requestSeqRef.current !== seq) return;
      setPerson(data);
    } catch (error) {
      console.error("Error fetching person details:", error);
    } finally {
      if (requestSeqRef.current === seq) setIsLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
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

  const handleImageError = (movieId: number) => {
    setImageErrors((prev) => new Set([...prev, movieId]));
  };

  const handleMovieClick = (movie: Movie) => {
    if (onMovieSelect) {
      onMovieSelect(movie.id);
    }
  };

  const MovieCard = ({ movie, index }: { movie: Movie; index: number }) => (
    <div
      onClick={() => handleMovieClick(movie)}
      className="group cursor-pointer transition-transform duration-150 ease-out hover:scale-[1.02] active:scale-[0.98]"
    >
      <div className="aspect-[2/3] rounded-xl overflow-hidden bg-muted shadow-md group-hover:shadow-xl transition-all ring-1 ring-border/50 group-hover:ring-2 group-hover:ring-primary/50">
        {!imageErrors.has(movie.id) && movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            onError={() => handleImageError(movie.id)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Film className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="mt-2 space-y-1 px-1">
        <p className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">
          {movie.title}
        </p>
        {movie.year && <p className="text-xs text-muted-foreground">{movie.year}</p>}
        <div className="flex items-center gap-1.5">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs text-muted-foreground">{movie.rating?.toFixed(1) || "N/A"}</span>
        </div>
        {movie.character && (
          <p className="text-xs text-muted-foreground line-clamp-1 italic">as {movie.character}</p>
        )}
        {movie.job && (
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
            {movie.job}
          </Badge>
        )}
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed inset-0 z-[70] bg-background"
        >
          {/* Back button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={onClose}
            className="fixed top-4 left-4 z-[80] flex items-center gap-2 px-4 py-2.5 rounded-full bg-card/95 backdrop-blur-xl border border-border/50 text-foreground hover:bg-card shadow-lg active:scale-95 transition-all duration-150 min-h-[44px]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </motion.button>

          {/* Scrollable content */}
          <div className="h-full overflow-y-auto pt-20 pb-8 px-4">
            {isLoading && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <div className="w-32 h-48 rounded-2xl bg-muted animate-shimmer" />
                <div className="w-48 h-6 rounded bg-muted animate-shimmer" />
              </div>
            )}

            {!isLoading && person && (
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Profile header */}
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="w-40 sm:w-48 flex-shrink-0 mx-auto sm:mx-0">
                    {person.profileUrl ? (
                      <img
                        src={person.profileUrl}
                        alt={person.name}
                        className="w-full aspect-[2/3] object-cover rounded-2xl shadow-2xl ring-1 ring-border/50"
                      />
                    ) : (
                      <div className="w-full aspect-[2/3] bg-muted rounded-2xl flex items-center justify-center">
                        <User className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-4 text-center sm:text-left">
                    <h1 className="font-display text-2xl sm:text-3xl font-bold">{person.name}</h1>
                    {person.alsoKnownAs && person.alsoKnownAs.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Also known as: {person.alsoKnownAs.slice(0, 2).join(", ")}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2">
                      <Card className="p-3 text-center">
                        <Film className="w-4 h-4 mx-auto text-primary" />
                        <p className="text-lg font-bold">{person.stats?.totalMovies || 0}</p>
                        <p className="text-[10px] text-muted-foreground">Movies</p>
                      </Card>
                      <Card className="p-3 text-center">
                        <Clapperboard className="w-4 h-4 mx-auto text-primary" />
                        <p className="text-lg font-bold">{person.stats?.asActor || 0}</p>
                        <p className="text-[10px] text-muted-foreground">Acting</p>
                      </Card>
                      <Card className="p-3 text-center">
                        <TrendingUp className="w-4 h-4 mx-auto text-primary" />
                        <p className="text-lg font-bold">{person.popularity?.toFixed(0) || 0}</p>
                        <p className="text-[10px] text-muted-foreground">Popularity</p>
                      </Card>
                    </div>

                    {/* Personal info */}
                    <Card className="p-4 text-left">
                      <div className="space-y-2 text-sm">
                        {person.birthday && (
                          <p>
                            <span className="text-muted-foreground">Born:</span>{" "}
                            {formatDate(person.birthday)} ({calculateAge(person.birthday, person.deathday)} years)
                          </p>
                        )}
                        {person.placeOfBirth && (
                          <p>
                            <span className="text-muted-foreground">Place:</span> {person.placeOfBirth}
                          </p>
                        )}
                        <p>
                          <span className="text-muted-foreground">Known for:</span> {person.knownFor}
                        </p>
                      </div>
                    </Card>

                    {/* Social links */}
                    {person.externalIds && (
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        {person.externalIds.imdb && (
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={`https://www.imdb.com/name/${person.externalIds.imdb}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Film className="w-4 h-4 mr-1" />
                              IMDb
                            </a>
                          </Button>
                        )}
                        {person.externalIds.instagram && (
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={`https://instagram.com/${person.externalIds.instagram}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Instagram className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        {person.externalIds.twitter && (
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={`https://twitter.com/${person.externalIds.twitter}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Twitter className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Biography */}
                {person.biography && (
                  <Card className="p-4">
                    <h2 className="font-semibold text-lg mb-2">Biography</h2>
                    <p
                      className={cn(
                        "text-sm text-muted-foreground leading-relaxed",
                        !showFullBio && "line-clamp-4"
                      )}
                    >
                      {person.biography}
                    </p>
                    {person.biography.length > 300 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFullBio(!showFullBio)}
                        className="mt-2"
                      >
                        {showFullBio ? (
                          <>
                            Show less <ChevronUp className="w-4 h-4 ml-1" />
                          </>
                        ) : (
                          <>
                            Read more <ChevronDown className="w-4 h-4 ml-1" />
                          </>
                        )}
                      </Button>
                    )}
                  </Card>
                )}

                {/* Filmography */}
                {(person.actingRoles || person.crewRoles) && (
                  <Card className="p-4">
                    <h2 className="font-semibold text-lg mb-4">Filmography</h2>
                    <Tabs defaultValue="acting">
                      <TabsList className="w-full justify-start flex-wrap h-auto gap-2 bg-transparent p-0">
                        {person.actingRoles && person.actingRoles.length > 0 && (
                          <TabsTrigger value="acting" className="flex-shrink-0">
                            Acting ({person.actingRoles.length})
                          </TabsTrigger>
                        )}
                        {person.crewRoles &&
                          Object.keys(person.crewRoles).map((category) => (
                            <TabsTrigger key={category} value={category} className="flex-shrink-0">
                              {category} ({person.crewRoles[category].length})
                            </TabsTrigger>
                          ))}
                      </TabsList>

                      {person.actingRoles && person.actingRoles.length > 0 && (
                        <TabsContent value="acting" className="mt-4">
                          <button
                            onClick={() => toggleSection("acting")}
                            className="flex items-center justify-between w-full mb-3 text-left"
                          >
                            <span className="font-medium flex items-center gap-2">
                              <Clapperboard className="w-4 h-4 text-primary" />
                              Acting ({person.actingRoles.length})
                            </span>
                            {expandedSections.acting ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          {expandedSections.acting && (
                            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                              {person.actingRoles.slice(0, 20).map((movie, index) => (
                                <MovieCard key={movie.id} movie={movie} index={index} />
                              ))}
                            </div>
                          )}
                        </TabsContent>
                      )}

                      {person.crewRoles &&
                        Object.entries(person.crewRoles).map(([category, movies]) => (
                          <TabsContent key={category} value={category} className="mt-4">
                            <button
                              onClick={() => toggleSection(category)}
                              className="flex items-center justify-between w-full mb-3 text-left"
                            >
                              <span className="font-medium flex items-center gap-2">
                                <Film className="w-4 h-4 text-primary" />
                                {category} ({movies.length})
                              </span>
                              {expandedSections[category] ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                            {expandedSections[category] && (
                              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                                {movies.slice(0, 20).map((movie, index) => (
                                  <MovieCard key={`${movie.id}-${index}`} movie={movie} index={index} />
                                ))}
                              </div>
                            )}
                          </TabsContent>
                        ))}
                    </Tabs>
                  </Card>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
