import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Flame, Clock, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TrendingMovie {
  id: number;
  title: string;
  year: number;
  rating: number;
  posterUrl: string;
  genre: string;
}

interface TrendingSectionProps {
  onMovieSelect: (movie: TrendingMovie) => void;
}

export function TrendingSection({ onMovieSelect }: TrendingSectionProps) {
  const [trendingMovies, setTrendingMovies] = useState<TrendingMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"trending" | "top_rated" | "upcoming">("trending");

  useEffect(() => {
    fetchTrending();
  }, [activeTab]);

  const fetchTrending = async () => {
    setIsLoading(true);
    try {
      const TMDB_API_KEY = "2a2e2c74af2e08b56456ab150ebf99c8"; // Public API key for demo
      const endpoints = {
        trending: `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}`,
        top_rated: `https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_API_KEY}`,
        upcoming: `https://api.themoviedb.org/3/movie/upcoming?api_key=${TMDB_API_KEY}`,
      };

      const response = await fetch(endpoints[activeTab]);
      const data = await response.json();

      const genreMap: Record<number, string> = {
        28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
        99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
        27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
        10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
      };

      const movies: TrendingMovie[] = (data.results || []).slice(0, 10).map((m: any) => ({
        id: m.id,
        title: m.title,
        year: m.release_date ? new Date(m.release_date).getFullYear() : null,
        rating: Math.round(m.vote_average * 10) / 10,
        posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
        genre: m.genre_ids?.slice(0, 2).map((id: number) => genreMap[id] || "").filter(Boolean).join(", ") || "Drama",
      }));

      setTrendingMovies(movies);
    } catch (error) {
      console.error("Error fetching trending:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "trending", label: "Trending", icon: Flame },
    { id: "top_rated", label: "Top Rated", icon: Star },
    { id: "upcoming", label: "Upcoming", icon: Clock },
  ] as const;

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-accent" />
          Discover
        </h2>
        
        <div className="flex gap-1 bg-secondary rounded-full p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-36 aspect-[2/3] bg-muted rounded-xl animate-pulse"
              />
            ))
          ) : (
            trendingMovies.map((movie, index) => (
              <motion.button
                key={movie.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onMovieSelect(movie)}
                className="shrink-0 w-36 snap-start group text-left"
              >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-2">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-bold text-white flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    {movie.rating}
                  </div>
                  {activeTab === "trending" && (
                    <div className="absolute bottom-2 right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center font-bold text-accent-foreground text-sm">
                      #{index + 1}
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-sm line-clamp-1 group-hover:text-accent transition-colors">
                  {movie.title}
                </h3>
                <p className="text-xs text-muted-foreground">{movie.year}</p>
              </motion.button>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
