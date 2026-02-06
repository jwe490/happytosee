import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
  const [renderHeavy, setRenderHeavy] = useState(false);

  // Scroll-aware floating button: morphs from pill to circle
  const [isCompactBtn, setIsCompactBtn] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // Extract state for back navigation
  const navState = location.state as { returnTo?: string; fromMovieTitle?: string; fromMovie?: number } | null;

  // Persist movie context in sessionStorage
  useEffect(() => {
    if (navState?.returnTo && navState?.fromMovieTitle) {
      sessionStorage.setItem(
        "lastMovieContext",
        JSON.stringify({ returnTo: navState.returnTo, fromMovieTitle: navState.fromMovieTitle })
      );
    }
  }, [navState]);

  // Read from sessionStorage if navState is empty
  const movieContext = useMemo(() => {
    if (navState?.returnTo && navState?.fromMovieTitle) {
      return { returnTo: navState.returnTo, fromMovieTitle: navState.fromMovieTitle };
    }
    try {
      const stored = sessionStorage.getItem("lastMovieContext");
      if (stored) return JSON.parse(stored) as { returnTo: string; fromMovieTitle: string };
    } catch {}
    return null;
  }, [navState]);

  const fromMovieTitle = movieContext?.fromMovieTitle;
  const returnTo = movieContext?.returnTo;
  const showMovieCrumb = !!fromMovieTitle && !!returnTo;

  const truncatedFromMovieTitle = useMemo(() => {
    if (!fromMovieTitle) return "";
    return fromMovieTitle.length > 26 ? `${fromMovieTitle.slice(0, 26)}...` : fromMovieTitle;
  }, [fromMovieTitle]);

  const handleGoBack = useCallback(() => {
    // First priority: use returnTo from navigation state
    if (navState?.returnTo) {
      navigate(navState.returnTo);
      return;
    }
    
    // Second priority: use sessionStorage context
    if (movieContext?.returnTo) {
      navigate(movieContext.returnTo);
      return;
    }
    
    // Third priority: browser history if available
    const canGoBack = typeof window !== "undefined" && (window.history.state?.idx ?? 0) > 0;
    if (canGoBack) {
      navigate(-1);
      return;
    }
    
    // Fallback: go home
    navigate("/");
  }, [navState, movieContext, navigate]);

  const handleBackToMovie = useCallback(() => {
    if (!returnTo) {
      // No return path available - go home
      navigate("/");
      return;
    }
    
    // Clear the session context after navigation to prevent stale data
    try {
      sessionStorage.removeItem("lastMovieContext");
    } catch {}
    
    // Navigate to the movie
    navigate(returnTo);
  }, [navigate, returnTo]);

  // Scroll-based compact button toggle
  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const threshold = 180;
          setIsCompactBtn(window.scrollY > threshold);
          lastScrollY.current = window.scrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleImageError = (movieId: number) => {
    setImageErrors(prev => new Set([...prev, movieId]));
  };

  useEffect(() => {
    if (id) {
      fetchPersonDetails(parseInt(id));
    }
  }, [id]);

  useEffect(() => {
    setRenderHeavy(false);
    const raf = requestAnimationFrame(() => setRenderHeavy(true));
    return () => cancelAnimationFrame(raf);
  }, [id]);

  const handleMovieSelect = (movie: Movie) => {
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
            {error || "We couldn't find this person."}
          </p>
          <Button onClick={handleGoBack} className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  const MovieCard = ({ movie }: { movie: Movie; index: number }) => (
    <div
      onClick={() => handleMovieSelect(movie)}
      className="group cursor-pointer transition-transform duration-150 ease-out hover:scale-[1.02] active:scale-[0.98]"
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
    </div>
  );

  return (
    <div className="min-h-screen bg-background pt-20 animate-fade-in">
      <Header />

      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 pb-24 space-y-6 sm:space-y-8 animate-fade-up">
        {/* Breadcrumbs */}
        <div className="w-full flex items-center justify-center">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Home
                  </button>
                </BreadcrumbLink>
              </BreadcrumbItem>

              {showMovieCrumb && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <button
                        type="button"
                        onClick={handleBackToMovie}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors max-w-[10rem] truncate"
                      >
                        {truncatedFromMovieTitle}
                      </button>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}

              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-[16rem] truncate">{person.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[300px_1fr] gap-6 lg:gap-8">
          <div className="space-y-4 sm:space-y-6">
            {person.profileUrl ? (
              <img
                src={person.profileUrl}
                alt={person.name}
                className="w-full max-w-[280px] mx-auto lg:max-w-none aspect-[2/3] object-cover object-top rounded-2xl shadow-lg ring-1 ring-border/50"
                loading="eager"
                decoding="async"
              />
            ) : (
              <div className="w-full max-w-[280px] mx-auto lg:max-w-none aspect-[2/3] bg-muted rounded-2xl flex items-center justify-center">
                <User className="w-16 h-16 sm:w-20 sm:h-20 text-muted-foreground" />
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
                    <p className="font-medium text-sm">{formatDate(person.birthday)}</p>
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
                    <Button variant="outline" size="sm" asChild className="gap-2 flex-1 min-w-[100px]">
                      <a href={`https://www.imdb.com/name/${person.externalIds.imdb}`} target="_blank" rel="noopener noreferrer">
                        <Film className="w-4 h-4" />
                        IMDb
                      </a>
                    </Button>
                  )}
                  {person.externalIds.instagram && (
                    <Button variant="outline" size="sm" asChild className="gap-2 flex-1 min-w-[100px]">
                      <a href={`https://www.instagram.com/${person.externalIds.instagram}`} target="_blank" rel="noopener noreferrer">
                        <Instagram className="w-4 h-4" />
                        Instagram
                      </a>
                    </Button>
                  )}
                  {person.externalIds.twitter && (
                    <Button variant="outline" size="sm" asChild className="gap-2 flex-1 min-w-[100px]">
                      <a href={`https://twitter.com/${person.externalIds.twitter}`} target="_blank" rel="noopener noreferrer">
                        <Twitter className="w-4 h-4" />
                        Twitter
                      </a>
                    </Button>
                  )}
                  {person.externalIds.facebook && (
                    <Button variant="outline" size="sm" asChild className="gap-2 flex-1 min-w-[100px]">
                      <a href={`https://www.facebook.com/${person.externalIds.facebook}`} target="_blank" rel="noopener noreferrer">
                        <Facebook className="w-4 h-4" />
                        Facebook
                      </a>
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2">
                {person.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  Popularity: {person.popularity.toFixed(0)}
                </span>
                {person.stats && (
                  <>
                    <span>•</span>
                    <span>{person.stats.totalMovies} Movies</span>
                  </>
                )}
              </div>
            </div>

            {person.biography && (
              <Card className="p-4 sm:p-5">
                <h3 className="font-semibold text-base mb-3">Biography</h3>
                <div className="relative">
                  <p className={`text-sm text-muted-foreground leading-relaxed whitespace-pre-line ${
                    !showFullBio && person.biography.length > 500 ? "line-clamp-6" : ""
                  }`}>
                    {person.biography}
                  </p>
                  {person.biography.length > 500 && (
                    <button
                      onClick={() => setShowFullBio(!showFullBio)}
                      className="mt-2 text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      {showFullBio ? (
                        <>Show Less <ChevronUp className="w-4 h-4" /></>
                      ) : (
                        <>Read More <ChevronDown className="w-4 h-4" /></>
                      )}
                    </button>
                  )}
                </div>
              </Card>
            )}

            {person.additionalPhotos && person.additionalPhotos.length > 0 && renderHeavy && (
              <Card className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <Clapperboard className="w-4 h-4 text-primary" />
                    Photos
                  </h3>
                  {person.additionalPhotos.length > 6 && (
                    <button
                      onClick={() => setShowAllPhotos(!showAllPhotos)}
                      className="text-sm text-primary hover:underline"
                    >
                      {showAllPhotos ? "Show Less" : `View All (${person.additionalPhotos.length})`}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {(showAllPhotos ? person.additionalPhotos : person.additionalPhotos.slice(0, 6)).map((photo, index) => (
                    <div key={index} className="aspect-[2/3] rounded-lg overflow-hidden bg-muted">
                      <img src={photo} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {renderHeavy && person.actingRoles && person.actingRoles.length > 0 && (
              <Card className="p-4 sm:p-5">
                <Tabs defaultValue="acting" className="w-full">
                  <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-transparent p-0 mb-4">
                    {person.actingRoles.length > 0 && (
                      <TabsTrigger value="acting" className="flex-1 min-w-[80px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full text-xs sm:text-sm">
                        Acting ({person.actingRoles.length})
                      </TabsTrigger>
                    )}
                    {Object.entries(person.crewRoles || {}).map(([category, movies]) => (
                      <TabsTrigger key={category} value={category} className="flex-1 min-w-[80px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full text-xs sm:text-sm">
                        {category} ({movies.length})
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <TabsContent value="acting">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                      {person.actingRoles.map((movie, index) => (
                        <MovieCard key={`${movie.id}-${index}`} movie={movie} index={index} />
                      ))}
                    </div>
                  </TabsContent>

                  {Object.entries(person.crewRoles || {}).map(([category, movies]) => (
                    <TabsContent key={category} value={category}>
                      {movies.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                          {movies.map((movie, index) => (
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
        </div>
      </main>

      <Footer />

      {/* Floating Back-to-movie button with butter-smooth pill-to-circle morph */}
      {returnTo && fromMovieTitle && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 24,
            delay: 0.3 
          }}
          className="fixed z-[80] bottom-6 right-6"
        >
          <div className="relative group">
            {/* Pulsing glow effect */}
            <motion.div 
              className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-full opacity-50 blur-lg"
              animate={{
                scale: [1, 1.08, 1],
                opacity: [0.4, 0.6, 0.4],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            
            <motion.button
              onClick={handleBackToMovie}
              className="relative bg-background/90 backdrop-blur-xl border border-white/25 shadow-2xl flex items-center justify-center text-foreground font-medium touch-manipulation overflow-hidden"
              initial={false}
              animate={{
                width: isCompactBtn ? 56 : 200,
                height: 56,
                borderRadius: 28,
                paddingLeft: isCompactBtn ? 0 : 18,
                paddingRight: isCompactBtn ? 0 : 18,
              }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 26,
                mass: 0.9,
              }}
              whileHover={{ 
                scale: 1.04,
                boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Back arrow icon with smooth scale */}
              <motion.div
                className="flex items-center justify-center shrink-0"
                animate={{
                  scale: isCompactBtn ? 1.15 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 25,
                }}
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.div>
              
              {/* Text with smooth width and opacity animation */}
              <motion.span 
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
                initial={false}
                animate={{
                  width: isCompactBtn ? 0 : "auto",
                  opacity: isCompactBtn ? 0 : 1,
                  marginLeft: isCompactBtn ? 0 : 10,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 28,
                  opacity: { duration: 0.15 },
                }}
              >
                Back to {fromMovieTitle.length > 16 ? `${fromMovieTitle.slice(0, 16)}...` : fromMovieTitle}
              </motion.span>
            </motion.button>
          </div>
        </motion.div>
      )}

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
