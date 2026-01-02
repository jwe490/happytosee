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

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center space-y-2"
        >
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
            Popular Actors
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto font-light">
            Discover talented performers and explore their work
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 gap-6"
            >
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full bg-primary"
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.2,
                      delay: i * 0.2,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground font-light">Discovering talent...</p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {actors.length === 0 ? (
                <div className="text-center py-32">
                  <Users className="w-20 h-20 text-muted-foreground/20 mx-auto mb-4" strokeWidth={1.5} />
                  <p className="text-muted-foreground font-light">No actors found</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6 lg:gap-8">
                    {actors.map((actor, index) => (
                      <ActorCard
                        key={actor.id}
                        {...actor}
                        onClick={handleActorClick}
                        index={index}
                      />
                    ))}
                  </div>

                  {currentPage < totalPages && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex justify-center mt-16"
                    >
                      <Button
                        size="lg"
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        variant="outline"
                        className="gap-2 rounded-full px-8 py-6 border-border/50 hover:border-primary/50 transition-all duration-300"
                      >
                        {isLoadingMore ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Loading more...</span>
                          </>
                        ) : (
                          <>
                            <span>Load More Actors</span>
                            <span className="text-xs text-muted-foreground font-light ml-1">
                              Page {currentPage} of {totalPages}
                            </span>
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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
