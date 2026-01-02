import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import ExpandedPersonView from "@/components/ExpandedPersonView";
import ExpandedMovieView from "@/components/ExpandedMovieView";
import { Movie } from "@/hooks/useMovieRecommendations";

const Person = () => {
  const { id } = useParams<{ id: string }>();
  const [isPersonViewOpen, setIsPersonViewOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isMovieViewOpen, setIsMovieViewOpen] = useState(false);

  useEffect(() => {
    if (id) {
      setIsPersonViewOpen(true);
    }
  }, [id]);

  const handleMovieClick = (movie: Movie) => {
    setIsPersonViewOpen(false);
    setSelectedMovie(movie);
    setIsMovieViewOpen(true);
  };

  const handlePersonClose = () => {
    setIsPersonViewOpen(false);
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <ExpandedPersonView
        personId={id ? parseInt(id) : null}
        isOpen={isPersonViewOpen}
        onClose={handlePersonClose}
        onMovieClick={handleMovieClick}
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

export default Person;