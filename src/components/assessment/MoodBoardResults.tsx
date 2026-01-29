import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import { supabase } from "@/integrations/supabase/client";
import { ShareDrawer, EnhancedShareableCard } from "@/components/sharing";
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

// Mood genre mapping for instant recommendations
const moodGenreMap: Record<string, string[]> = {
  happy: ["Comedy", "Family", "Animation"],
  sad: ["Drama", "Romance"],
  excited: ["Action", "Thriller", "Sci-Fi"],
  relaxed: ["Drama", "Comedy", "Animation"],
  romantic: ["Romance", "Comedy", "Drama"],
  bored: ["Action", "Thriller", "Mystery"],
  dark: ["Crime", "Mystery", "Thriller"],
  nostalgic: ["Drama", "Family", "Romance"],
};

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
  if (preferences.genres.length === 0) {
    preferences.genres = moodGenreMap[preferences.mood] || ["Drama", "Comedy"];
  }

  return preferences;
};

// Movie cache to prevent repeated API calls
const movieCache = new Map<string, RecommendedMovie[]>();

type SlideType = "intro" | "archetype" | "traits" | "recommendations";

export const MoodBoardResults = ({ assessmentId, answers = [] }: MoodBoardResultsProps) => {
  const [currentSlide, setCurrentSlide] = useState<SlideType>("intro");
  const [recommendedMovies, setRecommendedMovies] = useState<RecommendedMovie[]>([]);
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const fetchedRef = useRef(false);
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

  // Start fetching movies IMMEDIATELY on mount (not waiting for slides)
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchMovies = async () => {
      setIsLoadingMovies(true);
      setFetchError(null);
      
      const cacheKey = `${preferences.mood}-${preferences.genres.join(",")}-${preferences.languages.join(",")}`;
      
      // Check cache first for instant display
      if (movieCache.has(cacheKey)) {
        const cachedMovies = movieCache.get(cacheKey)!;
        setRecommendedMovies(cachedMovies);
        setIsLoadingMovies(false);
        console.log("Using cached movies:", cachedMovies.length);
        return;
      }
      
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
          // Shuffle movies for variety and deduplicate
          const uniqueMovies = data.movies.filter((movie: RecommendedMovie, index: number, self: RecommendedMovie[]) =>
            index === self.findIndex(m => m.id === movie.id)
          );
          const shuffledMovies = [...uniqueMovies].sort(() => Math.random() - 0.5);
          
          // Cache the results
          movieCache.set(cacheKey, shuffledMovies);
          setRecommendedMovies(shuffledMovies);
        } else {
          // Fallback to trending movies
          console.log("No movies in response, falling back to trending...");
          await fetchTrendingFallback(cacheKey);
        }
      } catch (error: any) {
        console.error("Error fetching recommendations:", error);
        setFetchError(error.message || "Failed to load recommendations");
        await fetchTrendingFallback(cacheKey);
      } finally {
        setIsLoadingMovies(false);
      }
    };

    const fetchTrendingFallback = async (cacheKey: string) => {
      try {
        const { data: trendingData, error: trendingError } = await supabase.functions.invoke('trending-movies', {
          body: { category: 'trending' }
        });
        
        if (trendingError) throw trendingError;
        
        if (trendingData?.movies && trendingData.movies.length > 0) {
          const movies = trendingData.movies.slice(0, 12);
          movieCache.set(cacheKey, movies);
          setRecommendedMovies(movies);
          setFetchError(null);
        }
      } catch (fallbackError) {
        console.error("Fallback fetch failed:", fallbackError);
        // Use hardcoded fallback movies to prevent blank screen
        const fallbackMovies: RecommendedMovie[] = [
          { id: 299534, title: "Avengers: Endgame", year: 2019, rating: 8.4, posterUrl: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg", genre: "Action" },
          { id: 299536, title: "Avengers: Infinity War", year: 2018, rating: 8.3, posterUrl: "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg", genre: "Action" },
          { id: 284054, title: "Black Panther", year: 2018, rating: 7.4, posterUrl: "https://image.tmdb.org/t/p/w500/uxzzxijgPIY7slzFvMotPv8wjKA.jpg", genre: "Action" },
          { id: 324857, title: "Spider-Man: Into the Spider-Verse", year: 2018, rating: 8.4, posterUrl: "https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg", genre: "Animation" },
          { id: 447365, title: "Guardians of the Galaxy Vol. 3", year: 2023, rating: 8.0, posterUrl: "https://image.tmdb.org/t/p/w500/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg", genre: "Action" },
          { id: 502356, title: "The Super Mario Bros. Movie", year: 2023, rating: 7.7, posterUrl: "https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg", genre: "Animation" },
        ];
        setRecommendedMovies(fallbackMovies);
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
    // Clear cache for fresh recommendations
    movieCache.clear();
    // Navigate back to assessment page instead of reloading
    window.history.back();
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
        <EnhancedShareableCard
          ref={shareCardRef}
          archetype={archetype}
          mood={preferences.mood}
          movies={recommendedMovies.slice(0, 3)}
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
