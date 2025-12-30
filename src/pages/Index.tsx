import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
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

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
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
    <div className="min-h-screen bg-background">
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

      {/* Hero Section */}
      <HeroSection />

      <main className="max-w-7xl mx-auto px-6 md:px-8 pb-20">
        {/* Tabs for Mood vs Search */}
        <Tabs defaultValue="mood" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-secondary rounded-full p-1">
            <TabsTrigger 
              value="mood" 
              className="gap-2 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm font-display text-sm uppercase tracking-wide"
            >
              <Sparkles className="w-4 h-4" />
              By Mood
            </TabsTrigger>
            <TabsTrigger 
              value="search" 
              className="gap-2 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm font-display text-sm uppercase tracking-wide"
            >
              <Search className="w-4 h-4" />
              Search
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mood" className="space-y-0">
            {/* Mood Selection */}
            <section id="mood-selector" className="py-8 scroll-mt-24">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                <h2 className="font-display text-2xl md:text-3xl font-bold text-center text-foreground">
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
                    <span className="text-sm font-medium">Customize your preferences</span>
                  </div>

                  <div className="max-w-3xl mx-auto bg-card rounded-3xl p-8 border border-border shadow-card">
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
      <footer className="py-8 border-t border-border bg-secondary/50">
        <div className="max-w-7xl mx-auto px-6 md:px-8 text-center text-sm text-muted-foreground">
          <p>Movie data sourced from IMDb, TMDb, and other reliable sources.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
