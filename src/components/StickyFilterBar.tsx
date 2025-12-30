import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Sparkles, X, ChevronDown } from "lucide-react";

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
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-soft"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
        {/* Desktop & Tablet Layout */}
        <div className="hidden sm:flex flex-wrap items-center gap-2 md:gap-3">
          {/* Language Select */}
          <Select
            value={preferences.language}
            onValueChange={(value) => onUpdatePreferences("language", value)}
          >
            <SelectTrigger className="w-[120px] md:w-[140px] h-9 text-xs md:text-sm bg-card border-border rounded-xl">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-[60] rounded-xl">
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value} className="hover:bg-muted rounded-lg">
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
            <SelectTrigger className="w-[130px] md:w-[150px] h-9 text-xs md:text-sm bg-card border-border rounded-xl">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-[60] rounded-xl">
              {movieTypes.map((type) => (
                <SelectItem key={type.value} value={type.value} className="hover:bg-muted rounded-lg">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Genre Pills */}
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {preferences.genres.map((genre) => (
              <motion.span
                key={genre}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-primary text-primary-foreground"
              >
                {genre}
                <button
                  onClick={() => clearGenre(genre)}
                  className="hover:bg-primary-foreground/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
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
                <SelectTrigger className="w-[90px] md:w-[100px] h-7 text-[10px] md:text-xs bg-muted/50 border-dashed border-border rounded-full">
                  <span className="text-muted-foreground">+ Genre</span>
                </SelectTrigger>
                <SelectContent className="bg-card border-border z-[60] rounded-xl">
                  {genres
                    .filter(g => !preferences.genres.includes(g))
                    .map((genre) => (
                      <SelectItem key={genre} value={genre} className="hover:bg-muted text-sm rounded-lg">
                        {genre}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Desktop Update Button */}
          <Button
            size="default"
            variant="default"
            onClick={onGetRecommendations}
            disabled={isLoading || !selectedMood}
            className="h-10 gap-2 rounded-full px-6 ml-auto font-semibold"
          >
            <Sparkles className="w-4 h-4" />
            {isLoading ? "Finding..." : "Update"}
          </Button>
        </div>

        {/* Mobile Layout - Filters */}
        <div className="sm:hidden flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Select
            value={preferences.language}
            onValueChange={(value) => onUpdatePreferences("language", value)}
          >
            <SelectTrigger className="min-w-[100px] h-8 text-xs bg-card border-border rounded-xl flex-shrink-0">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-[60] rounded-xl">
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value} className="hover:bg-muted rounded-lg">
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={preferences.movieType}
            onValueChange={(value) => onUpdatePreferences("movieType", value)}
          >
            <SelectTrigger className="min-w-[110px] h-8 text-xs bg-card border-border rounded-xl flex-shrink-0">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-[60] rounded-xl">
              {movieTypes.map((type) => (
                <SelectItem key={type.value} value={type.value} className="hover:bg-muted rounded-lg">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {preferences.genres.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-primary text-primary-foreground flex-shrink-0"
            >
              {genre}
              <button onClick={() => clearGenre(genre)} className="p-0.5">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>

        {/* Mobile Primary CTA - Properly Responsive */}
        <div className="sm:hidden pt-2">
          <motion.div
            whileTap={{ scale: 0.98 }}
          >
            <Button
              size="lg"
              variant="default"
              onClick={onGetRecommendations}
              disabled={isLoading || !selectedMood}
              className="w-full h-12 gap-2.5 rounded-2xl text-base font-semibold shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="inline-block"
                  >
                    🎬
                  </motion.span>
                  Finding Movies...
                </span>
              ) : (
                "Get My Recommendations"
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default StickyFilterBar;
