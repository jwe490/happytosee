import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { PersonPageSkeleton } from "@/components/ui/loading-skeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExpandedMovieView from "@/components/ExpandedMovieView";

interface Movie {
  id: number;
  title: string;
  character?: string | null;
  job?: string | null;
  jobs?: string[];
  posterUrl: string;
  backdropUrl?: string | null;
  rating: number;
  year: number | null;
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
  crewRoles: {
    [category: string]: Movie[];
  };
}

const Person = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [person, setPerson] = useState<PersonDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullBio, setShowFullBio] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    acting: true,
  });
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isMovieViewOpen, setIsMovieViewOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPersonDetails(parseInt(id));
    }
  }, [id]);

  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsMovieViewOpen(true);
  };

  const fetchPersonDetails = async (personId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("person-details", {
        body: { personId },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      console.log("Person data received:", data);
      setPerson(data);
    } catch (error) {
      console.error("Error fetching person details:", error);
      setError(error instanceof Error ? error.message : "Failed to load person details");
    } finally {
      setIsLoading(false);
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <PersonPageSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-destructive font-semibold">Error loading person details</p>
          <p className="text-muted-foreground text-sm">{error}</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Go Back
            </Button>
            <Button onClick={() => id && fetchPersonDetails(parseInt(id))}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-muted-foreground">Person not found</p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const MovieCard = ({ movie, index }: { movie: Movie; index: number }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.02, duration: 0.2 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => handleMovieSelect(movie)}
      className="group cursor-pointer"
    >
      <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted shadow-md group-hover:shadow-xl transition-all ring-1 ring-border group-hover:ring-2 group-hover:ring-primary">
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-muted"><svg class="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg></div>';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Film className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="mt-2 space-y-1">
        <p className="text-xs font-semibold line-clamp-1 group-hover:text-primary transition-colors">
          {movie.title}
        </p>
        {movie.year && (
          <p className="text-[10px] text-muted-foreground">{movie.year}</p>
        )}
        <div className="flex items-center gap-1">
          <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
          <span className="text-[10px] text-muted-foreground">{movie.rating}</span>
        </div>
        {movie.character && (
          <p className="text-[10px] text-muted-foreground line-clamp-1 italic">
            as {movie.character}
          </p>
        )}
        {movie.job && (
          <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
            {movie.job}
          </Badge>
        )}
        {movie.jobs && movie.jobs.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {movie.jobs.slice(0, 2).map((job, i) => (
              <Badge key={i} variant="secondary" className="text-[9px] px-1.5 py-0">
                {job}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </motion.button>

        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            {person.profileUrl ? (
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                src={person.profileUrl}
                alt={person.name}
                className="w-full aspect-[2/3] object-cover rounded-2xl shadow-2xl ring-1 ring-border"
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-muted rounded-2xl flex items-center justify-center">
                <User className="w-24 h-24 text-muted-foreground" />
              </div>
            )}

            <Card className="p-4 space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                Personal Info
              </h3>
              <div className="space-y-2 text-sm">
                {person.birthday && (
                  <div>
                    <p className="text-muted-foreground text-xs">Birthday</p>
                    <p className="font-medium">
                      {formatDate(person.birthday)}
                      <span className="text-muted-foreground ml-1">
                        ({calculateAge(person.birthday, person.deathday)} years old)
                      </span>
                    </p>
                  </div>
                )}
                {person.deathday && (
                  <div>
                    <p className="text-muted-foreground text-xs">Died</p>
                    <p className="font-medium">{formatDate(person.deathday)}</p>
                  </div>
                )}
                {person.placeOfBirth && (
                  <div>
                    <p className="text-muted-foreground text-xs">Place of Birth</p>
                    <p className="font-medium">{person.placeOfBirth}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground text-xs">Known For</p>
                  <p className="font-medium">{person.knownFor}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Gender</p>
                  <p className="font-medium">{person.gender}</p>
                </div>
              </div>
            </Card>

            {person.externalIds && (person.externalIds.imdb ||
              person.externalIds.instagram ||
              person.externalIds.twitter ||
              person.externalIds.facebook) && (
              <Card className="p-4 space-y-3">
                <h3 className="font-semibold text-sm">Social</h3>
                <div className="flex flex-wrap gap-2">
                  {person.externalIds.imdb && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="gap-2"
                    >
                      <a
                        href={`https://www.imdb.com/name/${person.externalIds.imdb}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Film className="w-4 h-4" />
                        IMDb
                      </a>
                    </Button>
                  )}
                  {person.externalIds.instagram && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="gap-2"
                    >
                      <a
                        href={`https://www.instagram.com/${person.externalIds.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Instagram className="w-4 h-4" />
                        Instagram
                      </a>
                    </Button>
                  )}
                  {person.externalIds.twitter && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="gap-2"
                    >
                      <a
                        href={`https://twitter.com/${person.externalIds.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Twitter className="w-4 h-4" />
                        Twitter
                      </a>
                    </Button>
                  )}
                  {person.externalIds.facebook && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="gap-2"
                    >
                      <a
                        href={`https://www.facebook.com/${person.externalIds.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Facebook className="w-4 h-4" />
                        Facebook
                      </a>
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">
                {person.name}
              </h1>
              {person.alsoKnownAs && person.alsoKnownAs.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Also known as: {person.alsoKnownAs.slice(0, 3).join(", ")}
                </p>
              )}
            </div>

            {person.stats && (
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 text-center space-y-1">
                  <Film className="w-6 h-6 mx-auto text-primary" />
                  <p className="text-2xl font-bold">{person.stats.totalMovies || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Movies</p>
                </Card>
                <Card className="p-4 text-center space-y-1">
                  <Clapperboard className="w-6 h-6 mx-auto text-primary" />
                  <p className="text-2xl font-bold">{person.stats.asActor || 0}</p>
                  <p className="text-xs text-muted-foreground">Acting Roles</p>
                </Card>
                <Card className="p-4 text-center space-y-1">
                  <TrendingUp className="w-6 h-6 mx-auto text-primary" />
                  <p className="text-2xl font-bold">{person.popularity || 0}</p>
                  <p className="text-xs text-muted-foreground">Popularity</p>
                </Card>
              </div>
            )}

            {person.biography && (
              <Card className="p-6">
                <h2 className="font-display text-xl font-semibold mb-3">Biography</h2>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={showFullBio ? "full" : "preview"}
                    initial={{ opacity: 0, height: "auto" }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className={`text-muted-foreground leading-relaxed text-sm ${!showFullBio ? "line-clamp-6" : ""}`}>
                      {person.biography}
                    </p>
                  </motion.div>
                </AnimatePresence>
                {person.biography.length > 400 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFullBio(!showFullBio)}
                    className="mt-3 gap-2"
                  >
                    {showFullBio ? (
                      <>
                        Show less <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Read more <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                )}
              </Card>
            )}

            {person.additionalPhotos && person.additionalPhotos.length > 0 && (
              <Card className="p-6">
                <h2 className="font-display text-xl font-semibold mb-4">Photos</h2>
                <div className="grid grid-cols-3 gap-3">
                  {(showAllPhotos ? person.additionalPhotos : person.additionalPhotos.slice(0, 3)).map(
                    (photo, index) => (
                      <motion.img
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        src={photo}
                        alt={`${person.name} photo ${index + 1}`}
                        className="w-full aspect-[2/3] object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
                        loading="lazy"
                      />
                    )
                  )}
                </div>
                {person.additionalPhotos.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllPhotos(!showAllPhotos)}
                    className="mt-3 gap-2"
                  >
                    {showAllPhotos ? (
                      <>
                        Show less <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        View all {person.additionalPhotos.length} photos <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                )}
              </Card>
            )}

            {(person.actingRoles || person.crewRoles) && (
              <Card className="p-6">
                <h2 className="font-display text-2xl font-semibold mb-4">Filmography</h2>

                <Tabs defaultValue="acting" className="w-full">
                  <TabsList className="w-full justify-start">
                    {person.actingRoles && person.actingRoles.length > 0 && (
                      <TabsTrigger value="acting">
                        Acting ({person.actingRoles.length})
                      </TabsTrigger>
                    )}
                    {person.crewRoles && Object.keys(person.crewRoles).map((category) => (
                      <TabsTrigger key={category} value={category}>
                        {category} ({person.crewRoles[category].length})
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {person.actingRoles && person.actingRoles.length > 0 && (
                    <TabsContent value="acting" className="mt-6">
                      <motion.button
                        onClick={() => toggleSection("acting")}
                        className="flex items-center justify-between w-full mb-4 text-left"
                      >
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Clapperboard className="w-5 h-5 text-primary" />
                          Acting Roles ({person.actingRoles.length})
                        </h3>
                        {expandedSections.acting ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </motion.button>

                      <AnimatePresence>
                        {expandedSections.acting && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                              {person.actingRoles.map((movie, index) => (
                                <MovieCard key={movie.id} movie={movie} index={index} />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </TabsContent>
                  )}

                  {person.crewRoles && Object.entries(person.crewRoles).map(([category, movies]) => (
                    <TabsContent key={category} value={category} className="mt-6">
                      <motion.button
                        onClick={() => toggleSection(category)}
                        className="flex items-center justify-between w-full mb-4 text-left"
                      >
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Film className="w-5 h-5 text-primary" />
                          {category} ({movies.length})
                        </h3>
                        {expandedSections[category] ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </motion.button>

                      <AnimatePresence>
                        {expandedSections[category] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                              {movies.map((movie, index) => (
                                <MovieCard key={`${movie.id}-${index}`} movie={movie} index={index} />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </TabsContent>
                  ))}
                </Tabs>
              </Card>
            )}
          </motion.div>
        </div>
      </main>

      <ExpandedMovieView
        movie={selectedMovie}
        isOpen={isMovieViewOpen}
        onClose={() => {
          setIsMovieViewOpen(false);
          setSelectedMovie(null);
        }}
      />
    </div>
  );
};

export default Person;