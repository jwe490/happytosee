import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Share2, RotateCw, Trophy, Sparkles, Film, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import { supabase } from "@/integrations/supabase/client";
import { ShareButton } from "@/components/ShareButton";

interface Answer {
  question_id: string;
  selected_option: string | string[];
  response_time: number;
}

interface MoodBoardResultsProps {
  assessmentId: string;
  answers?: Answer[];
}

interface RecommendedMovie {
  id: number;
  title: string;
  year: number;
  rating: number;
  posterUrl: string;
  genre: string;
  moodMatch?: string;
}

// Archetypes with associated genres for recommendations
const mockArchetypes = [
  {
    name: "The Explorer",
    icon: "🎬",
    description: "You love discovering new films and hidden gems. Your watchlist is always growing!",
    traits: ["Curious", "Open-minded", "Adventurous", "Eclectic"],
    color_scheme: ["#667eea", "#764ba2", "#f093fb"],
    genres: ["Adventure", "Sci-Fi", "Fantasy"],
    mood: "excited"
  },
  {
    name: "The Comfort Seeker",
    icon: "🏡",
    description: "You have your favorites and love rewatching them. Familiar stories bring you joy.",
    traits: ["Nostalgic", "Cozy", "Loyal", "Sentimental"],
    color_scheme: ["#f093fb", "#f5576c", "#feca57"],
    genres: ["Comedy", "Romance", "Family"],
    mood: "relaxed"
  },
  {
    name: "The Cinephile",
    icon: "🎥",
    description: "You appreciate cinema as an art form and seek out critically acclaimed films.",
    traits: ["Analytical", "Cultured", "Discerning", "Thoughtful"],
    color_scheme: ["#4facfe", "#00f2fe", "#43e97b"],
    genres: ["Drama", "Thriller", "Mystery"],
    mood: "sad"
  },
  {
    name: "The Thrill Seeker",
    icon: "⚡",
    description: "You crave excitement and adrenaline. Action-packed blockbusters are your jam!",
    traits: ["Bold", "Energetic", "Intense", "Fearless"],
    color_scheme: ["#fa709a", "#fee140", "#f5576c"],
    genres: ["Action", "Horror", "Thriller"],
    mood: "excited"
  },
  {
    name: "The Dreamer",
    icon: "✨",
    description: "You love magical worlds and imaginative storytelling. Fantasy fuels your soul.",
    traits: ["Creative", "Imaginative", "Romantic", "Hopeful"],
    color_scheme: ["#a8edea", "#fed6e3", "#d299c2"],
    genres: ["Fantasy", "Animation", "Romance"],
    mood: "romantic"
  },
  {
    name: "The Night Owl",
    icon: "🦉",
    description: "Late night movie sessions are your thing. You thrive in mystery and suspense.",
    traits: ["Mysterious", "Intense", "Patient", "Observant"],
    color_scheme: ["#2c3e50", "#4a69bd", "#6a89cc"],
    genres: ["Thriller", "Mystery", "Horror"],
    mood: "bored"
  }
];

// Map answer choices to preferences
const extractPreferences = (answers: Answer[]) => {
  const preferences: {
    languages: string[];
    genres: string[];
    mood: string;
    movieType: string;
  } = {
    languages: [],
    genres: [],
    mood: "happy",
    movieType: "commercial"
  };

  answers.forEach(answer => {
    const options = Array.isArray(answer.selected_option) 
      ? answer.selected_option 
      : [answer.selected_option];

    // Question 2: Languages
    if (answer.question_id === "2") {
      const langMap: Record<string, string> = {
        "English": "english",
        "Hindi": "hindi",
        "Korean": "korean",
        "Japanese": "japanese",
        "Spanish": "spanish",
        "Mixed / Any": "english"
      };
      options.forEach(opt => {
        if (langMap[opt]) preferences.languages.push(langMap[opt]);
      });
    }

    // Question 3: Movie Type
    if (answer.question_id === "3") {
      preferences.movieType = options[0]?.toLowerCase() || "commercial";
    }

    // Question 4: Emotional Style (maps to mood)
    if (answer.question_id === "4") {
      const moodMap: Record<string, string> = {
        "Light & Funny": "happy",
        "Deep & Emotional": "sad",
        "Thrilling": "excited",
        "Romantic": "romantic",
        "Mind-Bending": "bored",
        "Relaxed": "relaxed"
      };
      preferences.mood = moodMap[options[0]] || "happy";
    }

    // Question 6: Genres
    if (answer.question_id === "6") {
      const genreMap: Record<string, string> = {
        "Action/Adventure": "Action",
        "Comedy": "Comedy",
        "Drama": "Drama",
        "Sci-Fi/Fantasy": "Sci-Fi",
        "Horror/Thriller": "Thriller",
        "Romance": "Romance"
      };
      options.forEach(opt => {
        if (genreMap[opt]) preferences.genres.push(genreMap[opt]);
      });
    }
  });

  // Set defaults if empty
  if (preferences.languages.length === 0) preferences.languages = ["english"];
  if (preferences.genres.length === 0) preferences.genres = ["Drama", "Comedy"];

  return preferences;
};

export const MoodBoardResults = ({ assessmentId, answers = [] }: MoodBoardResultsProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [recommendedMovies, setRecommendedMovies] = useState<RecommendedMovie[]>([]);
  const [isLoadingMovies, setIsLoadingMovies] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Extract preferences from answers
  const preferences = extractPreferences(answers);

  // Determine archetype based on answers and assessment ID
  const determineArchetype = () => {
    // Find archetype based on mood preference
    const moodArchetype = mockArchetypes.find(a => a.mood === preferences.mood);
    if (moodArchetype) return moodArchetype;
    
    // Fallback to assessment ID based selection
    const archetypeIndex = assessmentId ? 
      assessmentId.charCodeAt(0) % mockArchetypes.length : 
      Math.floor(Math.random() * mockArchetypes.length);
    return mockArchetypes[archetypeIndex];
  };

  const archetype = determineArchetype();

  const stats = [
    { label: "Escapism", value: 6 + (assessmentId.charCodeAt(1) || 0) % 4, max: 10 },
    { label: "Emotion", value: 6 + (assessmentId.charCodeAt(2) || 0) % 4, max: 10 },
    { label: "Adventure", value: 6 + (assessmentId.charCodeAt(3) || 0) % 4, max: 10 },
    { label: "Comfort", value: 6 + (assessmentId.charCodeAt(4) || 0) % 4, max: 10 },
    { label: "Variety", value: 6 + (assessmentId.charCodeAt(5) || 0) % 4, max: 10 },
  ];

  const badges = [
    { name: "Movie Buff", icon: "🎬" },
    { name: "Night Owl", icon: "🦉" },
  ];

  const randomThought = "Every movie is a chance to live another life for a few hours.";

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setIsLoadingMovies(true);
      
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsLoading(false);

      // Fetch movie recommendations based on assessment answers
      try {
        const genresToUse = preferences.genres.length > 0 
          ? preferences.genres 
          : archetype.genres;

        const { data, error } = await supabase.functions.invoke('recommend-movies', {
          body: { 
            mood: preferences.mood,
            genres: genresToUse,
            languages: preferences.languages,
            limit: 5
          }
        });

        if (error) throw error;

        if (data?.movies && Array.isArray(data.movies)) {
          setRecommendedMovies(data.movies.slice(0, 5));
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        // Fallback to trending movies
        try {
          const { data: trendingData } = await supabase.functions.invoke('trending-movies', {
            body: { category: 'trending' }
          });
          if (trendingData?.movies) {
            setRecommendedMovies(trendingData.movies.slice(0, 5));
          }
        } catch {
          // Silent fail
        }
      } finally {
        setIsLoadingMovies(false);
      }
    };

    loadData();
  }, [archetype.genres, preferences]);

  const handleShare = async () => {
    if (!resultRef.current) return;
    setIsSharing(true);

    try {
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], "my-movie-mood.png", { type: "image/png" });

        if (navigator.share) {
          await navigator.share({
            title: "My Movie Mood Board",
            text: `I'm ${archetype.name}! Discover your movie personality on MoodFlix.`,
            files: [file],
          });
          toast({ title: "Shared!", description: "Your mood board has been shared" });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "my-movie-mood.png";
          a.click();
          URL.revokeObjectURL(url);
          toast({ title: "Downloaded!", description: "Your mood board image has been saved" });
        }
      }, "image/png");
    } catch (error) {
      console.error("Error sharing:", error);
      toast({ title: "Error", description: "Failed to share mood board", variant: "destructive" });
    } finally {
      setIsSharing(false);
    }
  };

  const handleRetake = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent"
          />
          <p className="text-muted-foreground">Analyzing your movie personality...</p>
        </div>
      </div>
    );
  }

  const colorScheme = archetype.color_scheme;
  const traits = archetype.traits;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div
            ref={resultRef}
            className="relative overflow-hidden rounded-3xl"
            style={{
              background: `linear-gradient(135deg, ${colorScheme[0]} 0%, ${colorScheme[1]} 50%, ${colorScheme[2]} 100%)`,
            }}
          >
            <div className="absolute inset-0 bg-black/20" />

            <div className="relative z-10 p-8 md:p-12 space-y-8 text-white">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center space-y-4"
              >
                <div className="text-6xl">{archetype.icon}</div>
                <h1 className="font-display text-4xl md:text-5xl font-bold">{archetype.name}</h1>
                <p className="text-lg md:text-xl text-white/90 max-w-xl mx-auto">{archetype.description}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Your Movie Traits
                </h3>
                <div className="flex flex-wrap gap-2">
                  {traits.map((trait: string, index: number) => (
                    <motion.span
                      key={trait}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium"
                    >
                      {trait}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-4"
              >
                <h3 className="font-semibold text-lg">Your Stats</h3>
                <div className="space-y-3">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{stat.label}</span>
                        <span className="text-white/80">{stat.value}/{stat.max}</span>
                      </div>
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(stat.value / stat.max) * 100}%` }}
                          transition={{ delay: 0.8 + index * 0.1, duration: 0.8 }}
                          className="h-full bg-white rounded-full"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {badges.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="space-y-3"
                >
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Achievements Unlocked
                  </h3>
                  <div className="flex gap-4">
                    {badges.map((badge, index) => (
                      <motion.div
                        key={badge.name}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.3 + index * 0.1, type: "spring" as const, stiffness: 200 }}
                        className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm"
                      >
                        <span className="text-3xl">{badge.icon}</span>
                        <span className="text-xs font-medium text-center">{badge.name}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="pt-6 border-t border-white/20"
              >
                <p className="text-center italic text-white/90">"{randomThought}"</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.7 }}
                className="text-center text-sm text-white/60"
              >
                MoodFlix • Discover Your Movie Mood
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Movie Recommendations Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Film className="w-6 h-6" />
            Movies We Think You'll Love
          </h2>
          <p className="text-muted-foreground text-sm">
            Based on your {preferences.mood} mood and love for {preferences.genres.slice(0, 2).join(" & ")}
          </p>
          
          {isLoadingMovies ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : recommendedMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {recommendedMovies.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.9 + index * 0.1 }}
                  className="group relative overflow-hidden rounded-xl bg-card border border-border shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="aspect-[2/3] overflow-hidden">
                    <img
                      src={movie.posterUrl || '/placeholder.svg'}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  
                  {/* Mood tag */}
                  {movie.moodMatch && (
                    <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium">
                      ✨ {preferences.mood}
                    </div>
                  )}

                  {/* Share button */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ShareButton
                      title={movie.title}
                      text={`This movie matches my ${preferences.mood} mood 🎭 – via MoodFlix`}
                      size="icon"
                      variant="secondary"
                    />
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h4 className="text-white text-sm font-semibold line-clamp-2">{movie.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-yellow-400 text-xs">★ {movie.rating?.toFixed(1) || 'N/A'}</span>
                      <span className="text-white/60 text-xs">{movie.year}</span>
                    </div>
                  </div>
                  {/* Always visible title below */}
                  <div className="p-2 bg-card">
                    <p className="text-xs font-medium line-clamp-1">{movie.title}</p>
                    <p className="text-xs text-muted-foreground">{movie.year}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No recommendations available at the moment.
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.3 }}
          className="flex gap-3 justify-center"
        >
          <Button size="lg" onClick={handleShare} disabled={isSharing} className="gap-2 rounded-full">
            <Share2 className="w-4 h-4" />
            {isSharing ? "Preparing..." : "Share Results"}
          </Button>

          <Button size="lg" variant="outline" onClick={handleRetake} className="gap-2 rounded-full">
            <RotateCw className="w-4 h-4" />
            Retake
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
