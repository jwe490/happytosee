import { useState, useEffect } from "react";
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
  language?: string;
  movieType?: string;
}

export function TrendingSection({ onMovieSelect, language, movieType }: TrendingSectionProps) {
  const [trendingMovies, setTrendingMovies] = useState<TrendingMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"trending" | "top_rated" | "upcoming">("trending");

  useEffect(() => {
    fetchTrending();
  }, [activeTab, language, movieType]);

  const fetchTrending = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("trending-movies", {
        body: { 
          category: activeTab,
          language: language !== "any" ? language : undefined,
          movieType: movieType !== "any" ? movieType : undefined,
        },
      });

      if (error) throw error;
      setTrendingMovies(data?.movies || []);
    } catch (error) {
      console.error("Error fetching trending:", error);
      setTrendingMovies([]);
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
              aria-label={`Show ${tab.label} movies`}
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
          ) : trendingMovies.length === 0 ? (
            <div className="w-full text-center py-8 text-muted-foreground">
              No movies found for your preferences. Try adjusting your filters.
            </div>
          ) : (
            trendingMovies.map((movie, index) => (
              <button
                key={movie.id}
                onClick={() => onMovieSelect(movie)}
                className="shrink-0 w-36 snap-start group text-left animate-fade-in active:scale-95 transition-transform"
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-2 shadow-sm">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-semibold text-foreground flex items-center gap-1 border border-border/60">
                    <Star className="w-3 h-3 fill-foreground text-foreground" />
                    {movie.rating}
                  </div>
                  {activeTab === "trending" && (
                    <div className="absolute bottom-2 right-2 w-8 h-8 bg-foreground rounded-full flex items-center justify-center font-bold text-background text-sm">
                      #{index + 1}
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-sm line-clamp-1 group-hover:text-muted-foreground transition-colors">
                  {movie.title}
                </h3>
                <p className="text-xs text-muted-foreground">{movie.year}</p>
              </button>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
