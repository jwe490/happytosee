import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { RotateCw, Film, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import { supabase } from "@/integrations/supabase/client";
import { ShareableCard, MinimalShareButton } from "@/components/sharing";

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
  const [recommendedMovies, setRecommendedMovies] = useState<RecommendedMovie[]>([]);
  const [isLoadingMovies, setIsLoadingMovies] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);
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

  // Generate shareable image
  const generateShareImage = useCallback(async (): Promise<Blob | null> => {
    if (!shareCardRef.current) return null;
    
    try {
      const canvas = await html2canvas(shareCardRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true,
      });

      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png", 1.0);
      });
    } catch (error) {
      console.error("Error generating image:", error);
      return null;
    }
  }, []);

  const handleRetake = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          {/* Animated loading illustration */}
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16"
            >
              <svg viewBox="0 0 64 64" className="w-full h-full text-accent">
                <motion.circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="120"
                  strokeDashoffset="40"
                />
              </svg>
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center text-2xl"
            >
              🎬
            </motion.div>
          </div>
          <p className="text-muted-foreground font-medium">Analyzing your movie personality...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-lg mx-auto space-y-8">
        {/* Shareable Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <ShareableCard
            ref={shareCardRef}
            archetype={archetype}
            mood={preferences.mood}
          />
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3 justify-center"
        >
          <MinimalShareButton
            title={`I'm ${archetype.name}!`}
            text={`I'm ${archetype.name}! Discover your movie personality on MoodFlix 🎬`}
            onImageShare={generateShareImage}
            variant="default"
          />
          
          <Button 
            variant="outline" 
            onClick={handleRetake} 
            className="gap-2 rounded-full px-5"
          >
            <RotateCw className="w-4 h-4" />
            Retake
          </Button>
        </motion.div>

        {/* Movie Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4 pt-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-accent" />
              <h2 className="font-display text-lg font-semibold">For You</h2>
            </div>
            <span className="text-xs text-muted-foreground">
              Based on your {preferences.mood} mood
            </span>
          </div>
          
          {isLoadingMovies ? (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="flex-shrink-0 w-28 aspect-[2/3] bg-muted animate-pulse rounded-xl" 
                />
              ))}
            </div>
          ) : recommendedMovies.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {recommendedMovies.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.08 }}
                  className="flex-shrink-0 w-28 group"
                >
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-muted shadow-card hover:shadow-card-hover transition-shadow duration-300">
                    <img
                      src={movie.posterUrl || '/placeholder.svg'}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    
                    {/* Rating badge */}
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm">
                      <span className="text-yellow-400 text-[10px] font-medium">
                        ★ {movie.rating?.toFixed(1) || 'N/A'}
                      </span>
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <a 
                          href={`https://www.themoviedb.org/movie/${movie.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1 text-white text-xs font-medium py-1.5 px-2 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-xs font-medium line-clamp-1">{movie.title}</p>
                    <p className="text-[10px] text-muted-foreground">{movie.year}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-6 text-sm">
              No recommendations available.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};
