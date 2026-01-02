import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import ActorCard from "@/components/ActorCard";
import ExpandedPersonView from "@/components/ExpandedPersonView";
import ExpandedMovieView from "@/components/ExpandedMovieView";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Movie } from "@/hooks/useMovieRecommendations";

interface Actor {
  id: number;
  name: string;
  profileUrl: string | null;
  knownFor: string;
  popularity: number;
}

const Actors = () => {
  const [actors, setActors] = useState<Actor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
  const [isPersonViewOpen, setIsPersonViewOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isMovieViewOpen, setIsMovieViewOpen] = useState(false);

  useEffect(() => {
    fetchActors(1);
  }, []);

  const fetchActors = async (page: number) => {
    if (page === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const { data, error } = await supabase.functions.invoke("popular-actors", {
        body: { page },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      if (page === 1) {
        setActors(data.actors);
      } else {
        setActors((prev) => [...prev, ...data.actors]);
      }

      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching actors:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleActorClick = (personId: number) => {
    setSelectedPersonId(personId);
    setIsPersonViewOpen(true);
  };

  const handleMovieClickFromPerson = (movie: Movie) => {
    setIsPersonViewOpen(false);
    setSelectedMovie(movie);
    setIsMovieViewOpen(true);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !isLoadingMore) {
      fetchActors(currentPage + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center space-y-3"
        >
          <div className="flex items-center justify-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Popular Actors
            </h1>
          </div>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
            Discover talented actors and explore their filmography
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full bg-primary"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">Loading actors...</p>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
            >
              {actors.map((actor, index) => (
                <ActorCard
                  key={actor.id}
                  {...actor}
                  onClick={handleActorClick}
                  index={index}
                />
              ))}
            </motion.div>

            {currentPage < totalPages && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center mt-12"
              >
                <Button
                  size="lg"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="gap-2 rounded-full"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More
                      <span className="text-xs opacity-70">
                        ({currentPage} of {totalPages})
                      </span>
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {actors.length === 0 && !isLoading && (
              <div className="text-center py-20">
                <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No actors found</p>
              </div>
            )}
          </>
        )}
      </main>

      <ExpandedPersonView
        personId={selectedPersonId}
        isOpen={isPersonViewOpen}
        onClose={() => setIsPersonViewOpen(false)}
        onMovieClick={handleMovieClickFromPerson}
      />

      <ExpandedMovieView
        movie={selectedMovie}
        isOpen={isMovieViewOpen}
        onClose={() => {
          setIsMovieViewOpen(false);
          setIsPersonViewOpen(true);
        }}
      />
    </div>
  );
};

export default Actors;
