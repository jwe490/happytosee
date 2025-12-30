import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import MoodSelector from "@/components/MoodSelector";
import PreferencesForm from "@/components/PreferencesForm";
import MovieGrid from "@/components/MovieGrid";
import MovieSearch from "@/components/MovieSearch";
import StickyFilterBar from "@/components/StickyFilterBar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, ChevronDown, Film, RotateCcw, Search } from "lucide-react";
import { useMovieRecommendations } from "@/hooks/useMovieRecommendations";
const Index = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [preferences, setPreferences] = useState({
    language: "any",
    genres: [] as string[],
    duration: "any",
    movieType: "any",
  });

  const { movies, isLoading, getRecommendations, clearHistory, recommendedCount } = useMovieRecommendations();

  // Show sticky bar when scrolling past preferences and there are movies
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Show sticky bar after scrolling 400px and when movies exist
      setShowStickyBar(scrollY > 400 && movies.length > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [movies.length]);

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    setShowPreferences(true);
  };

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
    <div className="min-h-screen">
      <Header />

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

      <main className="max-w-7xl mx-auto px-6 md:px-8 pb-20">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center py-12 md:py-20 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 text-sm text-primary">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Recommendations</span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
            What's Your
            <span className="block text-gradient-gold">Movie Mood?</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed">
            Tell us how you're feeling, and we'll curate the perfect movies 
            for your current state of mind. No more endless scrolling.
          </p>
        </motion.section>

        {/* Tabs for Mood vs Search */}
        <Tabs defaultValue="mood" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="mood" className="gap-2">
              <Sparkles className="w-4 h-4" />
              By Mood
            </TabsTrigger>
            <TabsTrigger value="search" className="gap-2">
              <Search className="w-4 h-4" />
              Search
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mood" className="space-y-0">
            {/* Mood Selection */}
            <section className="py-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-center text-foreground">
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
                  className="py-12 space-y-8"
                >
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <ChevronDown className="w-5 h-5 animate-bounce" />
                    <span>Customize your preferences</span>
                  </div>

                  <div className="max-w-3xl mx-auto glass rounded-3xl p-8 border border-border">
                    <PreferencesForm 
                      preferences={preferences}
                      onUpdatePreferences={updatePreferences}
                    />

                    <div className="mt-10 flex flex-col items-center gap-4">
                      <Button 
                        variant="cinema" 
                        size="xl"
                        onClick={handleGetRecommendations}
                        disabled={isLoading}
                        className="group"
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
              <MovieGrid movies={movies} isLoading={isLoading} />
            </section>
          </TabsContent>

          <TabsContent value="search">
            <section className="py-8">
              <MovieSearch />
            </section>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-8 text-center text-sm text-muted-foreground">
          <p>Movie data sourced from IMDb, TMDb, and other reliable sources.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
