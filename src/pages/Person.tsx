import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Star, Calendar, MapPin, Film, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { PersonPageSkeleton } from "@/components/ui/loading-skeleton";

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

const Person = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [person, setPerson] = useState<PersonDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullBio, setShowFullBio] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPersonDetails(parseInt(id));
    }
  }, [id]);

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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </motion.button>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row gap-6 mb-8 max-w-5xl mx-auto"
        >
          {/* Profile Image */}
          {person.profileUrl ? (
            <motion.img
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              src={person.profileUrl}
              alt={person.name}
              className="w-48 md:w-56 aspect-[2/3] object-cover rounded-2xl shadow-lg mx-auto md:mx-0 ring-1 ring-border shrink-0"
            />
          ) : (
            <div className="w-48 md:w-56 aspect-[2/3] bg-muted rounded-2xl flex items-center justify-center mx-auto md:mx-0 shrink-0">
              <Film className="w-12 h-12 text-muted-foreground" />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 space-y-4 text-center md:text-left min-w-0">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                {person.name}
              </h1>
              <p className="text-muted-foreground mt-1">{person.knownFor}</p>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {person.birthday && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm">
                  <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate">
                    {formatDate(person.birthday)}
                    <span className="text-muted-foreground ml-1">
                      ({calculateAge(person.birthday, person.deathday)} years{person.deathday ? " old when passed" : " old"})
                    </span>
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
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate">{person.placeOfBirth}</span>
                </span>
              )}
            </div>

            {/* Biography */}
            {person.biography && (
              <div className="space-y-2">
                <p className={`text-muted-foreground leading-relaxed text-sm ${!showFullBio ? "line-clamp-4" : ""}`}>
                  {person.biography}
                </p>
                {person.biography.length > 300 && (
                  <button
                    onClick={() => setShowFullBio(!showFullBio)}
                    className="text-primary text-sm hover:underline active:scale-95 transition-transform"
                  >
                    {showFullBio ? "Show less" : "Read more"}
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Filmography */}
        {person.filmography.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h2 className="font-display text-xl font-semibold flex items-center gap-2">
              <Film className="w-5 h-5 text-primary" />
              Filmography
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {person.filmography.map((film, index) => (
                <motion.div
                  key={film.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => navigate(`/?movie=${film.id}`)}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted shadow-sm group-hover:shadow-lg transition-all ring-1 ring-transparent group-hover:ring-primary">
                    <img
                      src={film.posterUrl}
                      alt={film.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="mt-2 space-y-0.5">
                    <p className="text-xs font-medium line-clamp-1 group-hover:text-primary transition-colors">
                      {film.title}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      {film.year && <span>{film.year}</span>}
                      <span className="flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                        {film.rating}
                      </span>
                    </div>
                    {film.character && (
                      <p className="text-[10px] text-muted-foreground line-clamp-1">
                        as {film.character}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
};

export default Person;