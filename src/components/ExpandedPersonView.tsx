import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Star, Calendar, MapPin, Film, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Movie } from "@/hooks/useMovieRecommendations";

interface PersonDetails {
  id: number;
  name: string;
  biography: string | null;
  birthday: string | null;
  deathday: string | null;
  placeOfBirth: string | null;
  profileUrl: string | null;
  knownFor: string;
  filmography: {
    id: number;
    title: string;
    character: string;
    posterUrl: string;
    rating: number;
    year: number | null;
  }[];
}

interface ExpandedPersonViewProps {
  personId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onMovieClick?: (movie: Movie) => void;
}

const ExpandedPersonView = ({ personId, isOpen, onClose, onMovieClick }: ExpandedPersonViewProps) => {
  const navigate = useNavigate();
  const [person, setPerson] = useState<PersonDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (personId && isOpen) {
      fetchPersonDetails(personId);
      const timer = setTimeout(() => setShowContent(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
      setPerson(null);
    }
  }, [personId, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const fetchPersonDetails = async (id: number) => {
    setIsLoading(true);
    setShowContent(false);
    try {
      const { data, error } = await supabase.functions.invoke("person-details", {
        body: { personId: id },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setPerson(data);
      setTimeout(() => setShowContent(true), 200);
    } catch (error) {
      console.error("Error fetching person details:", error);
    } finally {
      setIsLoading(false);
    }
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

  const handleMovieClick = (film: PersonDetails['filmography'][0]) => {
    if (onMovieClick) {
      const movie: Movie = {
        id: film.id,
        title: film.title,
        year: film.year || 0,
        rating: film.rating,
        genre: "",
        posterUrl: film.posterUrl,
        moodMatch: "",
      };
      onMovieClick(movie);
    }
  };

  if (!personId) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-background"
        >
          <motion.div
            className="absolute inset-0 overflow-hidden"
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <img
              src={person?.profileUrl || "/placeholder.svg"}
              alt=""
              className="w-full h-full object-cover opacity-10 blur-3xl scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/90 to-background" />
          </motion.div>

          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            onClick={onClose}
            className="absolute top-4 left-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-card/90 backdrop-blur-xl border border-border/50 text-foreground hover:bg-card active:scale-95 transition-all duration-150"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </motion.button>

          <div className="relative z-10 h-full overflow-y-auto">
            <div className="min-h-full flex flex-col items-center pt-20 pb-16 px-4">

              <motion.div
                key={personId}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="relative w-44 md:w-56 lg:w-64 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10"
              >
                {person?.profileUrl ? (
                  <img
                    src={person.profileUrl}
                    alt={person.name}
                    className="w-full aspect-[2/3] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-muted flex items-center justify-center">
                    <Users className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </motion.div>

              <AnimatePresence mode="wait">
                {showContent && person && (
                  <motion.div
                    key={`content-${personId}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.25 }}
                    className="w-full max-w-3xl mt-6 space-y-6"
                  >
                    <div className="text-center space-y-3">
                      <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                        {person.name}
                      </h1>

                      <p className="text-muted-foreground text-sm md:text-base">
                        {person.knownFor}
                      </p>

                      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        {person.birthday && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            <span className="text-foreground">
                              {formatDate(person.birthday)}
                            </span>
                            <span className="text-muted-foreground">
                              ({calculateAge(person.birthday, person.deathday)} years{person.deathday ? " old when passed" : " old"})
                            </span>
                          </span>
                        )}
                        {person.deathday && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm text-muted-foreground">
                            † {formatDate(person.deathday)}
                          </span>
                        )}
                        {person.placeOfBirth && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm">
                            <MapPin className="w-3.5 h-3.5 text-primary" />
                            {person.placeOfBirth}
                          </span>
                        )}
                      </div>
                    </div>

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

                    {person.biography && (
                      <div className="space-y-2">
                        <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" />
                          Biography
                        </h3>
                        <p className={`text-muted-foreground leading-relaxed text-sm ${!showFullBio ? "line-clamp-6" : ""}`}>
                          {person.biography}
                        </p>
                        {person.biography.length > 400 && (
                          <button
                            onClick={() => setShowFullBio(!showFullBio)}
                            className="text-primary text-sm hover:underline font-medium"
                          >
                            {showFullBio ? "Show less" : "Read more"}
                          </button>
                        )}
                      </div>
                    )}

                    {person.filmography.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                          <Film className="w-4 h-4 text-primary" />
                          Filmography
                          <span className="text-sm text-muted-foreground font-normal">
                            ({person.filmography.length} {person.filmography.length === 1 ? 'movie' : 'movies'})
                          </span>
                        </h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                          {person.filmography.map((film, index) => (
                            <motion.div
                              key={film.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.02, duration: 0.2 }}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => handleMovieClick(film)}
                              className="cursor-pointer group"
                            >
                              <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted shadow-sm group-hover:shadow-lg transition-shadow duration-150 ring-2 ring-transparent group-hover:ring-primary">
                                <img
                                  src={film.posterUrl}
                                  alt={film.title}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                              <div className="mt-1.5 space-y-0.5">
                                <p className="text-[10px] text-foreground line-clamp-1 font-medium group-hover:text-primary transition-colors">
                                  {film.title}
                                </p>
                                <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
                                  {film.year && <span>{film.year}</span>}
                                  <span className="flex items-center gap-0.5">
                                    <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                                    {film.rating}
                                  </span>
                                </div>
                                {film.character && (
                                  <p className="text-[9px] text-muted-foreground line-clamp-1">
                                    as {film.character}
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
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

export default ExpandedPersonView;
