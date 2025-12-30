import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Film, X } from "lucide-react";

interface Preferences {
  language: string;
  genres: string[];
  duration: string;
  movieType: string;
}

interface StickyFilterBarProps {
  preferences: Preferences;
  onUpdatePreferences: (key: string, value: string | string[]) => void;
  onGetRecommendations: () => void;
  isLoading: boolean;
  selectedMood: string | null;
}

const languages = [
  { value: "any", label: "Any Language" },
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "ko", label: "Korean" },
  { value: "ja", label: "Japanese" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
];

const movieTypes = [
  { value: "any", label: "Any Type" },
  { value: "hollywood", label: "Hollywood" },
  { value: "bollywood", label: "Bollywood" },
  { value: "tollywood", label: "Tollywood" },
  { value: "kollywood", label: "Kollywood" },
  { value: "korean", label: "Korean Cinema" },
  { value: "anime", label: "Anime" },
];

const genres = [
  "Action", "Comedy", "Drama", "Horror", "Romance", 
  "Thriller", "Sci-Fi", "Adventure", "Animation", "Documentary"
];

const StickyFilterBar = ({ 
  preferences, 
  onUpdatePreferences, 
  onGetRecommendations,
  isLoading,
  selectedMood 
}: StickyFilterBarProps) => {
  const toggleGenre = (genre: string) => {
    const newGenres = preferences.genres.includes(genre)
      ? preferences.genres.filter(g => g !== genre)
      : [...preferences.genres, genre];
    onUpdatePreferences("genres", newGenres);
  };

  const clearGenre = (genre: string) => {
    onUpdatePreferences("genres", preferences.genres.filter(g => g !== genre));
  };

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-3">
        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {/* Language Select */}
          <Select
            value={preferences.language}
            onValueChange={(value) => onUpdatePreferences("language", value)}
          >
            <SelectTrigger className="w-[100px] md:w-[130px] h-8 md:h-9 text-xs md:text-sm bg-card border-border">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-[60]">
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value} className="hover:bg-muted">
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Movie Type Select */}
          <Select
            value={preferences.movieType}
            onValueChange={(value) => onUpdatePreferences("movieType", value)}
          >
            <SelectTrigger className="w-[110px] md:w-[140px] h-8 md:h-9 text-xs md:text-sm bg-card border-border">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-[60]">
              {movieTypes.map((type) => (
                <SelectItem key={type.value} value={type.value} className="hover:bg-muted">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Genre Pills - Hidden on mobile */}
          <div className="hidden sm:flex flex-wrap items-center gap-2 flex-1">
            {preferences.genres.map((genre) => (
              <span
                key={genre}
                className="inline-flex items-center gap-1 px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-medium bg-primary text-primary-foreground"
              >
                {genre}
                <button
                  onClick={() => clearGenre(genre)}
                  className="hover:bg-primary-foreground/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            
            {/* Add Genre Dropdown */}
            {preferences.genres.length < 3 && (
              <Select
                value=""
                onValueChange={(value) => {
                  if (value && !preferences.genres.includes(value)) {
                    toggleGenre(value);
                  }
                }}
              >
                <SelectTrigger className="w-[80px] md:w-[100px] h-6 md:h-7 text-[10px] md:text-xs bg-muted/50 border-dashed border-border">
                  <span className="text-muted-foreground">+ Genre</span>
                </SelectTrigger>
                <SelectContent className="bg-card border-border z-[60]">
                  {genres
                    .filter(g => !preferences.genres.includes(g))
                    .map((genre) => (
                      <SelectItem key={genre} value={genre} className="hover:bg-muted text-sm">
                        {genre}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Desktop Update Button */}
          <Button
            size="sm"
            variant="default"
            onClick={onGetRecommendations}
            disabled={isLoading || !selectedMood}
            className="hidden sm:flex h-9 gap-2 rounded-full text-sm ml-auto"
          >
            <Film className="w-4 h-4" />
            {isLoading ? "Loading..." : "Update"}
          </Button>
        </div>

        {/* Mobile Primary CTA - Full Width */}
        <div className="sm:hidden mt-3">
          <Button
            size="lg"
            variant="default"
            onClick={onGetRecommendations}
            disabled={isLoading || !selectedMood}
            className="w-full h-12 gap-2 rounded-full text-base font-semibold shadow-lg active:scale-[0.98] transition-transform"
          >
            <Film className="w-5 h-5" />
            {isLoading ? "Finding Movies..." : "Get My Recommendations ✨"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default StickyFilterBar;
