import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Film } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PageLoadingSpinner } from "@/components/ui/loading-skeleton";

interface CollectionMovie {
  id: string;
  movie_id: number;
  title: string;
  poster_path: string | null;
  added_at: string;
}

interface Collection {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  mood?: string | null;
  created_at: string;
  movies: CollectionMovie[];
}

const moods: Record<string, { emoji: string; label: string; color: string }> = {
  happy: { emoji: "😀", label: "Happy", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  sad: { emoji: "😢", label: "Sad", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  romantic: { emoji: "❤️", label: "Romantic", color: "bg-pink-500/10 text-pink-600 border-pink-500/20" },
  excited: { emoji: "⚡", label: "Excited", color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  bored: { emoji: "😴", label: "Bored", color: "bg-gray-500/10 text-gray-600 border-gray-500/20" },
  relaxed: { emoji: "😌", label: "Relaxed", color: "bg-green-500/10 text-green-600 border-green-500/20" },
  nostalgic: { emoji: "🥹", label: "Nostalgic", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
};

const SharedCollection = () => {
  const { id } = useParams();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollection = async () => {
      if (!id) {
        setError("Collection not found");
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("collections")
          .select(`
            *,
            movies:collection_movies (*)
          `)
          .eq("id", id)
          .single();

        if (fetchError) throw fetchError;

        if (!data) {
          setError("Collection not found");
        } else if (!data.is_public) {
          setError("This collection is private");
        } else {
          setCollection(data);
        }
      } catch (err) {
        console.error("Error fetching collection:", err);
        setError("Failed to load collection");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollection();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <PageLoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4">
          {error === "This collection is private" ? (
            <Lock className="w-16 h-16 mx-auto text-muted-foreground" />
          ) : (
            <Film className="w-16 h-16 mx-auto text-muted-foreground" />
          )}
          <h1 className="text-2xl font-bold text-foreground">{error}</h1>
          <p className="text-muted-foreground">
            {error === "This collection is private"
              ? "The owner has set this collection to private."
              : "The collection you're looking for doesn't exist."}
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!collection) return null;

  const moodInfo = collection.mood ? moods[collection.mood] : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link to="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="font-display font-bold text-lg text-foreground truncate">
              {collection.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {collection.movies.length} movie{collection.movies.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Mood Badge */}
        {moodInfo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8"
          >
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${moodInfo.color}`}
            >
              <span className="text-xl">{moodInfo.emoji}</span>
              <span className="font-medium">{moodInfo.label} Vibes</span>
            </div>
          </motion.div>
        )}

        {/* Description */}
        {collection.description && (
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            {collection.description}
          </p>
        )}

        {/* Movies Grid */}
        {collection.movies.length === 0 ? (
          <div className="text-center py-16">
            <Film className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">This collection is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {collection.movies.map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-secondary">
                  {movie.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-foreground line-clamp-2">
                  {movie.title}
                </h3>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">Want to create your own movie collections?</p>
          <Button asChild size="lg" className="rounded-full">
            <Link to="/">
              <Film className="w-4 h-4 mr-2" />
              Explore MoodFlix
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default SharedCollection;
