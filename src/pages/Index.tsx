import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import MoodSelector from "@/components/MoodSelector";
// FloatingMoodSelector removed per user request
import PreferencesForm from "@/components/PreferencesForm";
import MovieGrid from "@/components/MovieGrid";
import MovieSearch from "@/components/MovieSearch";
import StickyFilterBar from "@/components/StickyFilterBar";
import { TrendingSection } from "@/components/TrendingSection";
import { CinematicCarousel } from "@/components/CinematicCarousel";
import { AISearch } from "@/components/AISearch";
import ExpandedMovieView from "@/components/ExpandedMovieView";
import { DiscoveryDrawer, DiscoveryFilters } from "@/components/DiscoveryDrawer";
import { ShareMoodButton } from "@/components/gamification";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, ChevronDown, Film, RotateCcw, Search, Wand2, Gem } from "lucide-react";
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

// Load/save mood from localStorage
const loadSavedMood = () => {
  try {
    const saved = localStorage.getItem("moodflix_mood");
    if (saved) {
      const { mood, timestamp } = JSON.parse(saved);
      // Mood expires after 24 hours
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        return mood;
      }
    }
  } catch (e) {
    console.error("Failed to load mood:", e);
  }
  return null;
};

const saveMood = (mood: string | null) => {
  try {
    if (mood) {
      localStorage.setItem("moodflix_mood", JSON.stringify({ mood, timestamp: Date.now() }));
    } else {
      localStorage.removeItem("moodflix_mood");
    }
  } catch (e) {
    console.error("Failed to save mood:", e);
  }
};

const Index = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(() => loadSavedMood());
  const [showPreferences, setShowPreferences] = useState(() => !!loadSavedMood());
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

  // Discovery drawer state
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [discoveryFilters, setDiscoveryFilters] = useState<DiscoveryFilters>({
    hiddenGems: false,
    maxRuntime: 240,
    dateNightMoods: null,
  });

  const ticking = useRef(false);
  const lastScrollY = useRef(0);

  const { movies, isLoading, isLoadingMore, hasMore, getRecommendations, loadMore, clearHistory, recommendedCount } = useMovieRecommendations();

  // Current mood emoji for sharing
  const moodEmojis: Record<string, string> = {
    happy: "😊", sad: "😢", romantic: "🥰", excited: "🤩", chill: "😌",
    adventurous: "🤠", nostalgic: "🥹", thrilled: "😱", stressed: "😤",
    motivated: "💪", bored: "😑", inspired: "✨",
  };

  // Initial fetch is handled by the preferences useEffect

  // Save mood when it changes
  useEffect(() => {
    saveMood(selectedMood);
  }, [selectedMood]);

  const fetchTrendingMovies = async (lang?: string, type?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("trending-movies", {
        body: { 
          category: "trending",
          language: lang !== "any" ? lang : undefined,
          movieType: type !== "any" ? type : undefined,
        },
      });

      if (error) throw error;
      const movies = data?.movies || [];
      setTrendingMovies(movies.slice(0, 8).map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        year: typeof movie.year === 'number' ? movie.year : parseInt(movie.year) || 0,
        rating: movie.rating,
        genre: movie.genre || "",
        posterUrl: movie.posterUrl,
        backdropUrl: movie.backdropUrl,
        overview: movie.overview,
        moodMatch: "",
      })));
    } catch (error) {
      console.error("Error fetching trending:", error);
    }
  };

  // Refetch featured movies when preferences change
  useEffect(() => {
    fetchTrendingMovies(preferences.language, preferences.movieType);
  }, [preferences.language, preferences.movieType]);

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

  // Throttled scroll handler
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

  const handleMoodSelect = useCallback((mood: string) => {
    setSelectedMood(mood);
    setShowPreferences(true);
  }, []);

  const handleFloatingMoodSelect = useCallback(async (mood: string) => {
    setSelectedMood(mood);
    setShowPreferences(true);
    
    await getRecommendations({
      mood: mood,
      languages: preferences.language === "any" ? [] : [preferences.language],
      genres: preferences.genres,
      industries: preferences.movieType === "any" ? [] : [preferences.movieType],
      duration: preferences.duration,
      hiddenGems: discoveryFilters.hiddenGems,
      maxRuntime: discoveryFilters.maxRuntime,
      dateNightMoods: discoveryFilters.dateNightMoods,
    });
  }, [getRecommendations, preferences, discoveryFilters]);

  const updatePreferences = (key: string, value: string | string[]) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleGetRecommendations = async () => {
    // Allow Date Night mode even without a mood selected
    if (!selectedMood && !discoveryFilters.dateNightMoods) return;
    
    await getRecommendations({
      mood: selectedMood || "romantic", // Default mood for Date Night if none selected
      languages: preferences.language === "any" ? [] : [preferences.language],
      genres: preferences.genres,
      industries: preferences.movieType === "any" ? [] : [preferences.movieType],
      duration: preferences.duration,
      hiddenGems: discoveryFilters.hiddenGems,
      maxRuntime: discoveryFilters.maxRuntime,
      dateNightMoods: discoveryFilters.dateNightMoods,
    });
  };

  const handleClearMood = () => {
    setSelectedMood(null);
    setShowPreferences(false);
    clearHistory();
    saveMood(null);
  };

  const handleDiscoveryFiltersChange = (filters: DiscoveryFilters) => {
    setDiscoveryFilters(filters);
    
    // Auto-trigger recommendations if Date Night mode is activated OR mood is selected
    if (filters.dateNightMoods || selectedMood) {
      getRecommendations({
        mood: selectedMood || "romantic",
        languages: preferences.language === "any" ? [] : [preferences.language],
        genres: preferences.genres,
        industries: preferences.movieType === "any" ? [] : [preferences.movieType],
        duration: preferences.duration,
        hiddenGems: filters.hiddenGems,
        maxRuntime: filters.maxRuntime,
        dateNightMoods: filters.dateNightMoods,
      });
    }
  };

  const discoveryActive = discoveryFilters.hiddenGems || discoveryFilters.maxRuntime < 240 || discoveryFilters.dateNightMoods !== null;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pt-16 md:pt-20">
      <Header 
        onOpenDiscovery={() => setIsDiscoveryOpen(true)} 
        discoveryActive={discoveryActive}
      />

      {/* Discovery Drawer */}
      <DiscoveryDrawer
        isOpen={isDiscoveryOpen}
        onClose={() => setIsDiscoveryOpen(false)}
        filters={discoveryFilters}
        onFiltersChange={handleDiscoveryFiltersChange}
      />

      {/* Floating Mood Selector - Removed per user request */}

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

      <main className="pb-16">
        {/* Hero Section */}
        <HeroSection />

        {/* Cinematic Carousel */}
        {trendingMovies.length > 0 && (
          <CinematicCarousel
            movies={trendingMovies}
            onMovieSelect={handleMovieSelect}
            autoPlayInterval={6000}
          />
        )}

        {/* Active filters indicator */}
        {discoveryActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 mt-4"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Active filters:</span>
              {discoveryFilters.hiddenGems && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                  <Gem className="w-3 h-3" />
                  Hidden Gems
                </span>
              )}
              {discoveryFilters.maxRuntime < 240 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  ⏱️ Max {Math.floor(discoveryFilters.maxRuntime / 60)}h {discoveryFilters.maxRuntime % 60}m
                </span>
              )}
              {discoveryFilters.dateNightMoods && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-pink-500/20 text-pink-600 dark:text-pink-400">
                  ❤️ Date Night
                </span>
              )}
              <button
                onClick={() => setIsDiscoveryOpen(true)}
                className="text-xs text-primary hover:underline"
              >
                Edit
              </button>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <Tabs defaultValue="mood" className="w-full">
            <div className="sticky top-16 md:top-20 z-30 bg-background/95 backdrop-blur-lg border-b border-border py-3">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-secondary rounded-full p-1 px-4">
                <TabsTrigger
                  value="mood"
                  className="gap-2 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm font-display text-xs md:text-sm uppercase tracking-wide"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">By Mood</span>
                  <span className="sm:hidden">Mood</span>
                </TabsTrigger>
                <TabsTrigger
                  value="ai"
                  className="gap-2 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm font-display text-xs md:text-sm uppercase tracking-wide"
                >
                  <Wand2 className="w-4 h-4" />
                  <span className="hidden sm:inline">AI Find</span>
                  <span className="sm:hidden">AI</span>
                </TabsTrigger>
                <TabsTrigger
                  value="search"
                  className="gap-2 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm font-display text-xs md:text-sm uppercase tracking-wide"
                >
                  <Search className="w-4 h-4" />
                  Search
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="mood" className="space-y-0">
              <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
                {/* Trending */}
                <TrendingSection 
                  onMovieSelect={handleMovieSelect}
                  language={preferences.language}
                  movieType={preferences.movieType}
                />

                {/* Mood Selection */}
                <section id="mood-selector" className="py-8 scroll-mt-24">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                        How are you feeling?
                      </h2>
                      {selectedMood && (
                        <button
                          onClick={handleClearMood}
                          className="text-sm text-muted-foreground hover:text-foreground mt-2 inline-flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Reset mood
                        </button>
                      )}
                    </div>
                    
                    <MoodSelector 
                      selectedMood={selectedMood} 
                      onSelectMood={handleMoodSelect} 
                    />
                  </motion.div>
                </section>

                {/* Preferences */}
                <AnimatePresence>
                  {showPreferences && (
                    <motion.section
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4 }}
                      className="py-8 space-y-6"
                    >
                      {selectedMood && (
                        <motion.div
                          key={selectedMood}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-center"
                        >
                          <p className="text-lg font-display font-semibold text-foreground">
                            {moodTaglines[selectedMood] || "Great choice!"}
                          </p>
                        </motion.div>
                      )}

                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <ChevronDown className="w-4 h-4 animate-bounce" />
                        <span className="text-sm font-medium">Customize preferences</span>
                      </div>

                      <div className="max-w-2xl mx-auto bg-card rounded-2xl p-6 border border-border shadow-sm">
                        <PreferencesForm 
                          preferences={preferences}
                          onUpdatePreferences={updatePreferences}
                        />

                        <div className="mt-8 flex flex-col items-center gap-3">
                          <Button 
                            size="lg"
                            onClick={handleGetRecommendations}
                            disabled={isLoading}
                            className="rounded-full px-8 gap-2"
                          >
                            <Film className="w-5 h-5" />
                            {isLoading ? "Finding Movies..." : "Get Recommendations"}
                            <Sparkles className="w-5 h-5" />
                          </Button>

                          {recommendedCount > 0 && (
                            <button
                              onClick={clearHistory}
                              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
                            >
                              <RotateCcw className="w-4 h-4" />
                              Clear history ({recommendedCount} tracked)
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.section>
                  )}
                </AnimatePresence>

                {/* Movie Recommendations */}
                <section className="py-8">
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

      {/* Share Mood Button - appears when mood is selected */}
      <ShareMoodButton
        currentMood={selectedMood || undefined}
        currentMoodEmoji={selectedMood ? moodEmojis[selectedMood] : undefined}
        currentMovie={selectedMovie ? { 
          id: selectedMovie.id, 
          title: selectedMovie.title, 
          poster: selectedMovie.posterUrl 
        } : undefined}
      />

      {/* Footer */}
      <footer className="py-6 border-t border-border bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>Movie data from TMDb. Find your perfect movie match.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
