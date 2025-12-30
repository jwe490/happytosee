import { useState } from "react";
import { motion } from "framer-motion";
import MovieCard from "./MovieCard";
import MovieDetailsModal from "./MovieDetailsModal";
import { Loader2 } from "lucide-react";
import { Movie } from "@/hooks/useMovieRecommendations";

interface MovieGridProps {
  movies: Movie[];
  isLoading: boolean;
}

const MovieGrid = ({ movies, isLoading }: MovieGridProps) => {
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMovieClick = (movieId: number) => {
    setSelectedMovieId(movieId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMovieId(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse">
          Finding perfect movies for your mood...
        </p>
      </div>
    );
  }

  if (movies.length === 0) {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="text-center space-y-2">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground">
            Your Personalized Picks
          </h2>
          <p className="text-muted-foreground">
            {movies.length} movies curated just for your current mood
          </p>
        </div>

        <div className="max-h-[800px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-4">
            {movies.map((movie, index) => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                index={index} 
                onClick={() => handleMovieClick(movie.id)}
              />
            ))}
          </div>
        </div>
      </motion.div>

      <MovieDetailsModal
        movieId={selectedMovieId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default MovieGrid;
