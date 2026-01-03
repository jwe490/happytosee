import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import MoodSelector from "@/components/MoodSelector";
import FloatingMoodSelector from "@/components/FloatingMoodSelector";
import PreferencesForm from "@/components/PreferencesForm";
import MovieGrid from "@/components/MovieGrid";
import MovieSearch from "@/components/MovieSearch";
import StickyFilterBar from "@/components/StickyFilterBar";
import { TrendingSection } from "@/components/TrendingSection";
import { CinematicCarousel } from "@/components/CinematicCarousel";
import { AISearch } from "@/components/AISearch";
import ExpandedMovieView from "@/components/ExpandedMovieView";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, ChevronDown, Film, RotateCcw, Search, Wand2 } from "lucide-react";
import { useMovieRecommendations, Movie } from "@/hooks/useMovieRecommendations";
import { supabase } from "@/integrations/supabase/client";

const moodTaglines: Record<string, string> = {
  happy: "Feeling Happy? Here's something uplifting 🎉",
  sad: "Feeling Sad? Comfort movies for you 💙",
  romantic: "In the mood for love? 💕",
  excited: "Ready for action? 🔥",
  bored: "Let's surprise you! 🎲",
  relaxed: "Chill vibes only 🌿",
  nostalgic: "A trip down memory lane ✨",
};

const Index = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [hasScrolledPastMood, setHasScrolledPastMood] = useState(false);
  const [preferences, setPreferences] = useState({
    language: "any",
    genres: [] as string[],
    duration: "any",
    movieType: "any",
  });

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isMovieViewOpen, setIsMovieViewOpen] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);

  // Refs for throttled scroll
  const ticking = useRef(false);
  const lastScrollY = useRef(0);

  const { movies, isLoading, isLoadingMore, hasMore, getRecommendations, loadMore, clearHistory, recommendedCount } = useMovieRecommendations();

  useEffect(() => {
    fetchTrendingMovies();
  }, []);

  const fetchTrendingMovies = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("trending-movies", {
        body: { category: "trending" },
      });

      if (error) throw error;
      const movies = data?.movies || [];
      setTrendingMovies(movies.slice(0, 8).map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        year: movie.year,
        rating: movie.rating,
        genre: movie.genre,
        posterUrl: movie.posterUrl,
        backdropUrl: movie.backdropUrl,
        overview: movie.overview,
        moodMatch: "",
      })));
    } catch (error) {
      console.error("Error fetching trending:", error);
    }
  };

  const handleMovieSelect = (movie: any) => {
    const movieData: Movie = {
      id: movie.id,
      title: movie.title,
      year: movie.year || 0,
      rating: movie.rating || 0,
      genre: movie.genre || "",
      posterUrl: movie.posterUrl || movie.poster_path,
      moodMatch: movie.matchReason || movie.surpriseReason || "",
    };
    setSelectedMovie(movieData);
    setIsMovieViewOpen(true);
  };

  // Throttled scroll handler using requestAnimationFrame
  useEffect(() => {
    const handleScroll = () => {
      lastScrollY.current = window.scrollY;
      
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const scrollY = lastScrollY.current;
          const shouldShowSticky = scrollY > 400 && movies.length > 0;
          const shouldShowFloat = scrollY > 600;
          
          setShowStickyBar(shouldShowSticky);
          setHasScrolledPastMood(shouldShowFloat);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [movies.length]);

  // Real-time mood update with debounce
  const handleMoodSelect = useCallback((mood: string) => {
    setSelectedMood(mood);
    setShowPreferences(true);
  }, []);

  // Floating mood selector - triggers instant recommendations
  const handleFloatingMoodSelect = useCallback(async (mood: string) => {
    setSelectedMood(mood);
    setShowPreferences(true);
    
    // Instantly fetch recommendations
    await getRecommendations({
      mood: mood,
      languages: preferences.language === "any" ? [] : [preferences.language],
      genres: preferences.genres,
      industries: preferences.movieType === "any" ? [] : [preferences.movieType],
      duration: preferences.duration,
    });
  }, [getRecommendations, preferences]);

  const updatePreferences = (key: string, value: string | string[]) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleGetRecommendations = async () => {
    if (!selectedMood) return;
    
    await getRecommendations({
      mood: selectedMood,
      languages: preferences.language === "any" ? [] : [preferences.language],
      genres: preferences.genres,
      industries: preferences.movieType === "any" ? [] : [preferences.movieType],
      duration: preferences.duration,
    });
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pt-20">
      <Header />

      {/* Floating Mood Selector - always visible after scrolling */}
      <AnimatePresence>
        {hasScrolledPastMood && (
          <FloatingMoodSelector
            selectedMood={selectedMood}
            onSelectMood={handleFloatingMoodSelect}
            isLoading={isLoading}
          />
        )}
      </AnimatePresence>

      {/* Sticky Filter Bar */}
      <AnimatePresence>
        {showStickyBar && (
          <StickyFilterBar
            preferences={preferences}
            onUpdatePreferences={updatePreferences}
            onGetRecommendations={handleGetRecommendations}
            isLoading={isLoading}
            selectedMood={selectedMood}
          />
        )}
      </AnimatePresence>

      <main className="pb-16 md:pb-20">
        {/* Hero Section - Always visible first */}
        <HeroSection />

        {/* Cinematic Carousel - Expands to fullscreen on scroll */}
        {trendingMovies.length > 0 && (
          <CinematicCarousel
            movies={trendingMovies}
            onMovieSelect={handleMovieSelect}
            autoPlayInterval={6000}
          />
        )}

        {/* Tabs for Mood vs Search vs AI - Appears after carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Tabs defaultValue="mood" className="w-full">
            <div className="sticky top-16 md:top-20 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50 py-4">
              <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 bg-secondary rounded-full p-1 px-4 md:px-6">
              <TabsTrigger
                value="mood"
                className="gap-1.5 md:gap-2 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm font-display text-xs md:text-sm uppercase tracking-wide"
              >
                <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">By Mood</span>
                <span className="sm:hidden">Mood</span>
              </TabsTrigger>
              <TabsTrigger
                value="ai"
                className="gap-1.5 md:gap-2 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm font-display text-xs md:text-sm uppercase tracking-wide"
              >
                <Wand2 className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">AI Find</span>
                <span className="sm:hidden">AI</span>
              </TabsTrigger>
              <TabsTrigger
                value="search"
                className="gap-1.5 md:gap-2 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm font-display text-xs md:text-sm uppercase tracking-wide"
              >
                <Search className="w-3 h-3 md:w-4 md:h-4" />
                Search
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="mood" className="space-y-0">

            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
              {/* Trending Section */}
              <TrendingSection onMovieSelect={handleMovieSelect} />

              {/* Mood Selection */}
              <section id="mood-selector" className="py-6 md:py-8 scroll-mt-20 md:scroll-mt-24">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-4 md:space-y-6"
              >
                <h2 className="font-display text-xl md:text-2xl lg:text-3xl font-bold text-center text-foreground">
                  How are you feeling right now?
                </h2>
                
                <MoodSelector 
                  selectedMood={selectedMood} 
                  onSelectMood={handleMoodSelect} 
                />
              </motion.div>
            </section>

            {/* Preferences Section */}
            <AnimatePresence>
              {showPreferences && (
                <motion.section
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5 }}
                  className="py-8 md:py-12 space-y-6 md:space-y-8"
                >
                  {/* Dynamic Mood Tagline */}
                  {selectedMood && (
                    <motion.div
                      key={selectedMood}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center"
                    >
                      <p className="text-lg md:text-xl font-display font-semibold text-foreground">
                        {moodTaglines[selectedMood] || "Great choice!"}
                      </p>
                    </motion.div>
                  )}

                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <ChevronDown className="w-4 h-4 md:w-5 md:h-5 animate-bounce" />
                    <span className="text-xs md:text-sm font-medium">Customize your preferences</span>
                  </div>

                  <div className="max-w-3xl mx-auto bg-card rounded-2xl md:rounded-3xl p-4 md:p-8 border border-border shadow-card">
                    <PreferencesForm 
                      preferences={preferences}
                      onUpdatePreferences={updatePreferences}
                    />

                    <div className="mt-10 flex flex-col items-center gap-4">
                      <Button 
                        variant="default" 
                        size="xl"
                        onClick={handleGetRecommendations}
                        disabled={isLoading}
                        className="group rounded-full"
                      >
                        <Film className="w-5 h-5 transition-transform group-hover:rotate-12" />
                        {isLoading ? "Finding Movies..." : "Get My Recommendations"}
                        <Sparkles className="w-5 h-5 transition-transform group-hover:scale-110" />
                      </Button>

                      {recommendedCount > 0 && (
                        <button
                          onClick={clearHistory}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Clear history ({recommendedCount} movies tracked)
                        </button>
                      )}
                    </div>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

              {/* Movie Recommendations */}
              <section className="py-12">
                <MovieGrid
                  movies={movies}
                  isLoading={isLoading}
                  isLoadingMore={isLoadingMore}
                  hasMore={hasMore}
                  onLoadMore={loadMore}
                />
              </section>
            </div>
          </TabsContent>
          
          <TabsContent value="ai">
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
              <section className="py-8">
                <AISearch onMovieSelect={handleMovieSelect} />
              </section>
            </div>
          </TabsContent>

          <TabsContent value="search">
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
              <section className="py-8">
                <MovieSearch />
              </section>
            </div>
          </TabsContent>
          </Tabs>
        </motion.div>
      </main>
      
      {/* Expanded Movie View */}
      <ExpandedMovieView
        movie={selectedMovie}
        isOpen={isMovieViewOpen}
        onClose={() => setIsMovieViewOpen(false)}
      />

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-secondary/50">
        <div className="max-w-7xl mx-auto px-6 md:px-8 text-center text-sm text-muted-foreground">
          <p>Movie data sourced from IMDb, TMDb, and other reliable sources.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
