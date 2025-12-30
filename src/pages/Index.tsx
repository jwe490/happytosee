import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import MoodSelector from "@/components/MoodSelector";
import PreferencesForm from "@/components/PreferencesForm";
import MovieGrid from "@/components/MovieGrid";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronDown, Film } from "lucide-react";

// Sample movie data - in production this would come from an API
const sampleMovies = [
  {
    id: 1,
    title: "The Shawshank Redemption",
    rating: 9.3,
    year: 1994,
    genre: "Drama",
    posterUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop",
    moodMatch: "A powerful story of hope and resilience that will lift your spirits and remind you that good things come to those who wait."
  },
  {
    id: 2,
    title: "Amélie",
    rating: 8.3,
    year: 2001,
    genre: "Romance",
    posterUrl: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=600&fit=crop",
    moodMatch: "A whimsical French film perfect for feeling good about life's simple pleasures and unexpected connections."
  },
  {
    id: 3,
    title: "Interstellar",
    rating: 8.6,
    year: 2014,
    genre: "Sci-Fi",
    posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=600&fit=crop",
    moodMatch: "An epic space adventure that combines emotional depth with stunning visuals, perfect for when you want to dream big."
  },
  {
    id: 4,
    title: "The Grand Budapest Hotel",
    rating: 8.1,
    year: 2014,
    genre: "Comedy",
    posterUrl: "https://images.unsplash.com/photo-1518109050801-587f1cb64e1d?w=400&h=600&fit=crop",
    moodMatch: "Wes Anderson's visual masterpiece delivers quirky humor and heartwarming moments in equal measure."
  },
  {
    id: 5,
    title: "Spirited Away",
    rating: 8.6,
    year: 2001,
    genre: "Animation",
    posterUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop",
    moodMatch: "Studio Ghibli's enchanting tale of courage and growth that speaks to the child in all of us."
  },
  {
    id: 6,
    title: "La La Land",
    rating: 8.0,
    year: 2016,
    genre: "Musical",
    posterUrl: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=400&h=600&fit=crop",
    moodMatch: "A modern musical celebrating dreams, love, and the bittersweet nature of chasing your passions."
  },
];

const Index = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    language: "any",
    genres: [] as string[],
    duration: "any",
    movieType: "any",
  });
  const [movies, setMovies] = useState<typeof sampleMovies>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    setShowPreferences(true);
  };

  const updatePreferences = (key: string, value: string | string[]) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleGetRecommendations = async () => {
    setIsLoading(true);
    // Simulate API call - in production this would call your AI backend
    await new Promise(resolve => setTimeout(resolve, 2000));
    setMovies(sampleMovies);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen">
      <Header />

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

                <div className="mt-10 flex justify-center">
                  <Button 
                    variant="cinema" 
                    size="xl"
                    onClick={handleGetRecommendations}
                    disabled={isLoading}
                    className="group"
                  >
                    <Film className="w-5 h-5 transition-transform group-hover:rotate-12" />
                    Get My Recommendations
                    <Sparkles className="w-5 h-5 transition-transform group-hover:scale-110" />
                  </Button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Movie Recommendations */}
        <section className="py-12">
          <MovieGrid movies={movies} isLoading={isLoading} />
        </section>
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
