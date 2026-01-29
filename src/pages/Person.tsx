import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
import Footer from "@/components/Footer";
import { Movie as RecommendationMovie } from "@/hooks/useMovieRecommendations";

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
  genre?: string;
  moodMatch?: string;
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
  const location = useLocation();
  const [person, setPerson] = useState<PersonDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullBio, setShowFullBio] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    acting: true,
  });
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<RecommendationMovie | null>(null);
  const [isMovieViewOpen, setIsMovieViewOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // Robust back navigation:
  // 1) Prefer explicit returnTo (sent from the movie modal)
  // 2) Otherwise, only navigate(-1) when browser history has entries
  // 3) Else go home
  const handleGoBack = () => {
    const state = location.state as { returnTo?: string } | null;
    if (state?.returnTo) {
      navigate(state.returnTo);
      return;
    }

    const canGoBack = typeof window !== "undefined" && (window.history.state?.idx ?? 0) > 0;
    if (canGoBack) {
      navigate(-1);
      return;
    }

    navigate("/");
  };

  const handleImageError = (movieId: number) => {
    setImageErrors(prev => new Set([...prev, movieId]));
  };

  useEffect(() => {
    if (id) {
      fetchPersonDetails(parseInt(id));
    }
  }, [id]);

  const handleMovieSelect = (movie: Movie) => {
    // Convert to format expected by ExpandedMovieView
    const convertedMovie: RecommendationMovie = {
      id: movie.id,
      title: movie.title,
      year: movie.year || 0,
      rating: movie.rating,
      genre: movie.genre || "",
      posterUrl: movie.posterUrl,
      backdropUrl: movie.backdropUrl || undefined,
      moodMatch: movie.moodMatch || "",
    };
    setSelectedMovie(convertedMovie);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
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

  if (error || !person) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="p-8 text-center max-w-md">
          <Film className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Person Not Found</h2>
          <p className="text-muted-foreground mb-6">
            {error || "We couldn't find this person. They might not exist or there was an error loading their details."}
          </p>
          <Button onClick={handleGoBack} className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Go Back
          </Button>
        </Card>
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
      <div className="aspect-[2/3] rounded-xl overflow-hidden bg-muted shadow-md group-hover:shadow-xl transition-all ring-1 ring-border/50 group-hover:ring-2 group-hover:ring-primary/50">
        {!imageErrors.has(movie.id) && movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
            loading="lazy"
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
        {movie.year && (
          <p className="text-xs text-muted-foreground">{movie.year}</p>
        )}
        <div className="flex items-center gap-1.5">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs text-muted-foreground">{movie.rating.toFixed(1)}</span>
        </div>
        {movie.character && (
          <p className="text-xs text-muted-foreground line-clamp-1 italic">
            as {movie.character}
          </p>
        )}
        {movie.job && (
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
            {movie.job}
          </Badge>
        )}
        {movie.jobs && movie.jobs.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {movie.jobs.slice(0, 2).map((job, i) => (
              <Badge key={i} variant="secondary" className="text-[10px] px-2 py-0.5">
                {job}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background pt-20 animate-fade-in">
      <Header />

      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8 animate-fade-up">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr] gap-6 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4 sm:space-y-6"
          >
            {person.profileUrl ? (
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                src={person.profileUrl}
                alt={person.name}
                className="w-full aspect-[2/3] object-cover rounded-2xl shadow-2xl ring-1 ring-border/50"
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-muted rounded-2xl flex items-center justify-center">
                <User className="w-20 h-20 sm:w-24 sm:h-24 text-muted-foreground" />
              </div>
            )}

            <Card className="p-4 sm:p-5 space-y-3">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                Personal Info
              </h3>
              <div className="space-y-3 text-sm">
                {person.birthday && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Birthday</p>
                    <p className="font-medium text-sm">
                      {formatDate(person.birthday)}
                    </p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      ({calculateAge(person.birthday, person.deathday)} years old)
                    </p>
                  </div>
                )}
                {person.deathday && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Died</p>
                    <p className="font-medium text-sm">{formatDate(person.deathday)}</p>
                  </div>
                )}
                {person.placeOfBirth && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Place of Birth</p>
                    <p className="font-medium text-sm">{person.placeOfBirth}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Known For</p>
                  <p className="font-medium text-sm">{person.knownFor}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Gender</p>
                  <p className="font-medium text-sm">{person.gender}</p>
                </div>
              </div>
            </Card>

            {person.externalIds && (person.externalIds.imdb ||
              person.externalIds.instagram ||
              person.externalIds.twitter ||
              person.externalIds.facebook) && (
              <Card className="p-4 sm:p-5 space-y-3">
                <h3 className="font-semibold text-base">Social</h3>
                <div className="flex flex-wrap gap-2">
                  {person.externalIds.imdb && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="gap-2 flex-1 min-w-[100px]"
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
                      className="gap-2 flex-1 min-w-[100px]"
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
                      className="gap-2 flex-1 min-w-[100px]"
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
                      className="gap-2 flex-1 min-w-[100px]"
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
            className="space-y-4 sm:space-y-6"
          >
            <div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
                {person.name}
              </h1>
              {person.alsoKnownAs && person.alsoKnownAs.length > 0 && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Also known as: {person.alsoKnownAs.slice(0, 3).join(", ")}
                </p>
              )}
            </div>

            {person.stats && (
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <Card className="p-3 sm:p-4 text-center space-y-1">
                  <Film className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-primary" />
                  <p className="text-xl sm:text-2xl font-bold">{person.stats.totalMovies || 0}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Total Movies</p>
                </Card>
                <Card className="p-3 sm:p-4 text-center space-y-1">
                  <Clapperboard className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-primary" />
                  <p className="text-xl sm:text-2xl font-bold">{person.stats.asActor || 0}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Acting Roles</p>
                </Card>
                <Card className="p-3 sm:p-4 text-center space-y-1">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-primary" />
                  <p className="text-xl sm:text-2xl font-bold">{person.popularity ? person.popularity.toFixed(1) : 0}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Popularity</p>
                </Card>
              </div>
            )}

            {person.biography && (
              <Card className="p-4 sm:p-6">
                <h2 className="font-display text-lg sm:text-xl font-semibold mb-3">Biography</h2>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={showFullBio ? "full" : "preview"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
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
              <Card className="p-4 sm:p-6">
                <h2 className="font-display text-lg sm:text-xl font-semibold mb-4">Photos</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {(showAllPhotos ? person.additionalPhotos : person.additionalPhotos.slice(0, 6)).map(
                    (photo, index) => (
                      <motion.img
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        src={photo}
                        alt={`${person.name} photo ${index + 1}`}
                        className="w-full aspect-[2/3] object-cover rounded-xl hover:scale-105 transition-transform cursor-pointer ring-1 ring-border/50"
                        loading="lazy"
                      />
                    )
                  )}
                </div>
                {person.additionalPhotos.length > 6 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllPhotos(!showAllPhotos)}
                    className="mt-4 gap-2 w-full sm:w-auto"
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
              <Card className="p-4 sm:p-6">
                <h2 className="font-display text-xl sm:text-2xl font-semibold mb-4">Filmography</h2>

                <Tabs defaultValue="acting" className="w-full">
                  <TabsList className="w-full justify-start flex-wrap h-auto gap-2 bg-transparent p-0">
                    {person.actingRoles && person.actingRoles.length > 0 && (
                      <TabsTrigger value="acting" className="flex-shrink-0">
                        Acting ({person.actingRoles.length})
                      </TabsTrigger>
                    )}
                    {person.crewRoles && Object.keys(person.crewRoles).map((category) => (
                      <TabsTrigger key={category} value={category} className="flex-shrink-0">
                        {category} ({person.crewRoles[category].length})
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {person.actingRoles && person.actingRoles.length > 0 && (
                    <TabsContent value="acting" className="mt-6">
                      <motion.button
                        onClick={() => toggleSection("acting")}
                        className="flex items-center justify-between w-full mb-4 text-left group"
                      >
                        <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
                          <Clapperboard className="w-5 h-5 text-primary" />
                          Acting Roles ({person.actingRoles.length})
                        </h3>
                        {expandedSections.acting ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
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
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
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
                        className="flex items-center justify-between w-full mb-4 text-left group"
                      >
                        <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
                          <Film className="w-5 h-5 text-primary" />
                          {category} ({movies.length})
                        </h3>
                        {expandedSections[category] ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
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
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
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

      <Footer />

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
