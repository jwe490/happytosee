import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import { supabase } from "@/integrations/supabase/client";
import { ShareDrawer, ShareableCard } from "@/components/sharing";
import {
  MoodIntroSlide,
  MoodArchetypeSlide,
  MoodTraitsSlide,
  MoodRecommendationsSlide,
} from "./results";

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
  genre?: string;
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

type SlideType = "intro" | "archetype" | "traits" | "recommendations";

export const MoodBoardResults = ({ assessmentId, answers = [] }: MoodBoardResultsProps) => {
  const [currentSlide, setCurrentSlide] = useState<SlideType>("intro");
  const [recommendedMovies, setRecommendedMovies] = useState<RecommendedMovie[]>([]);
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Extract preferences from answers
  const preferences = extractPreferences(answers);

  // Determine archetype based on answers
  const determineArchetype = () => {
    const moodArchetype = mockArchetypes.find(a => a.mood === preferences.mood);
    if (moodArchetype) return moodArchetype;
    
    const archetypeIndex = assessmentId ? 
      assessmentId.charCodeAt(0) % mockArchetypes.length : 
      Math.floor(Math.random() * mockArchetypes.length);
    return mockArchetypes[archetypeIndex];
  };

  const archetype = determineArchetype();

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoadingMovies(true);
      setFetchError(null);
      
      try {
        const genresToUse = preferences.genres.length > 0 
          ? preferences.genres 
          : archetype.genres;

        console.log("Fetching movies with params:", {
          mood: preferences.mood,
          genres: genresToUse,
          languages: preferences.languages,
          limit: 12
        });

        const { data, error } = await supabase.functions.invoke('recommend-movies', {
          body: { 
            mood: preferences.mood,
            genres: genresToUse,
            languages: preferences.languages,
            limit: 12
          }
        });

        if (error) {
          console.error("Edge function error:", error);
          throw error;
        }

        console.log("Received movie data:", data);

        if (data?.movies && Array.isArray(data.movies) && data.movies.length > 0) {
          // Shuffle movies for variety
          const shuffledMovies = [...data.movies].sort(() => Math.random() - 0.5);
          setRecommendedMovies(shuffledMovies);
        } else {
          // Fallback to trending movies
          console.log("No movies in response, falling back to trending...");
          const { data: trendingData, error: trendingError } = await supabase.functions.invoke('trending-movies', {
            body: { category: 'trending' }
          });
          
          if (trendingError) {
            throw trendingError;
          }
          
          if (trendingData?.movies && trendingData.movies.length > 0) {
            setRecommendedMovies(trendingData.movies.slice(0, 12));
          } else {
            setFetchError("No movies found. Please try again.");
          }
        }
      } catch (error: any) {
        console.error("Error fetching recommendations:", error);
        setFetchError(error.message || "Failed to load recommendations");
        
        // Try trending as final fallback
        try {
          const { data: trendingData } = await supabase.functions.invoke('trending-movies', {
            body: { category: 'trending' }
          });
          if (trendingData?.movies && trendingData.movies.length > 0) {
            setRecommendedMovies(trendingData.movies.slice(0, 12));
            setFetchError(null);
          }
        } catch {
          // Silent fail
        }
      } finally {
        setIsLoadingMovies(false);
      }
    };

    fetchMovies();
  }, [archetype.genres, preferences.genres, preferences.languages, preferences.mood]);

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

  const navigateToSlide = (slide: SlideType) => {
    setCurrentSlide(slide);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {currentSlide === "intro" && (
          <MoodIntroSlide
            key="intro"
            onContinue={() => navigateToSlide("archetype")}
          />
        )}
        
        {currentSlide === "archetype" && (
          <MoodArchetypeSlide
            key="archetype"
            archetype={archetype}
            onContinue={() => navigateToSlide("traits")}
          />
        )}
        
        {currentSlide === "traits" && (
          <MoodTraitsSlide
            key="traits"
            traits={archetype.traits}
            mood={preferences.mood}
            onContinue={() => navigateToSlide("recommendations")}
          />
        )}
        
        {currentSlide === "recommendations" && (
          <MoodRecommendationsSlide
            key="recommendations"
            movies={recommendedMovies}
            isLoading={isLoadingMovies}
            mood={preferences.mood}
            onShare={() => setIsShareOpen(true)}
            onRetake={handleRetake}
          />
        )}
      </AnimatePresence>

      {/* Hidden shareable card for image generation */}
      <div className="fixed -left-[9999px] -top-[9999px]">
        <ShareableCard
          ref={shareCardRef}
          archetype={archetype}
          mood={preferences.mood}
        />
      </div>

      {/* Share drawer */}
      <ShareDrawer
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title={`I'm ${archetype.name}!`}
        subtitle={archetype.description}
        shareText={`I'm ${archetype.name}! Discover your movie personality on MoodFlix 🎬`}
        onImageShare={generateShareImage}
      />
    </>
  );
};
