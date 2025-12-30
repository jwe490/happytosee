import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface PreferencesFormProps {
  preferences: {
    language: string;
    genres: string[];
    duration: string;
    movieType: string;
  };
  onUpdatePreferences: (key: string, value: string | string[]) => void;
}

const languages = [
  { value: "english", label: "English" },
  { value: "hindi", label: "Hindi" },
  { value: "spanish", label: "Spanish" },
  { value: "korean", label: "Korean" },
  { value: "japanese", label: "Japanese" },
  { value: "french", label: "French" },
  { value: "any", label: "Any Language" },
];

const genres = [
  "Action", "Comedy", "Drama", "Horror", "Romance", 
  "Sci-Fi", "Thriller", "Animation", "Documentary", "Fantasy"
];

const durations = [
  { value: "short", label: "Short (< 90 min)" },
  { value: "medium", label: "Medium (90-120 min)" },
  { value: "long", label: "Long (> 120 min)" },
  { value: "any", label: "Any Duration" },
];

const movieTypes = [
  { value: "hollywood", label: "Hollywood" },
  { value: "bollywood", label: "Bollywood" },
  { value: "korean", label: "Korean" },
  { value: "international", label: "International" },
  { value: "any", label: "Any Type" },
];

const PreferencesForm = ({ preferences, onUpdatePreferences }: PreferencesFormProps) => {
  const toggleGenre = (genre: string) => {
    const newGenres = preferences.genres.includes(genre)
      ? preferences.genres.filter(g => g !== genre)
      : [...preferences.genres, genre];
    onUpdatePreferences("genres", newGenres);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Language & Movie Type Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label className="text-foreground font-medium">Preferred Language</Label>
          <Select
            value={preferences.language}
            onValueChange={(value) => onUpdatePreferences("language", value)}
          >
            <SelectTrigger className="glass border-border hover:border-primary/50 transition-colors">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value} className="hover:bg-muted">
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-foreground font-medium">Movie Type</Label>
          <Select
            value={preferences.movieType}
            onValueChange={(value) => onUpdatePreferences("movieType", value)}
          >
            <SelectTrigger className="glass border-border hover:border-primary/50 transition-colors">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {movieTypes.map((type) => (
                <SelectItem key={type.value} value={type.value} className="hover:bg-muted">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Duration */}
      <div className="space-y-3">
        <Label className="text-foreground font-medium">Time Available</Label>
        <Select
          value={preferences.duration}
          onValueChange={(value) => onUpdatePreferences("duration", value)}
        >
          <SelectTrigger className="glass border-border hover:border-primary/50 transition-colors">
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {durations.map((dur) => (
              <SelectItem key={dur.value} value={dur.value} className="hover:bg-muted">
                {dur.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Genres */}
      <div className="space-y-4">
        <Label className="text-foreground font-medium">Preferred Genres (Optional)</Label>
        <div className="flex flex-wrap gap-3">
          {genres.map((genre) => {
            const isSelected = preferences.genres.includes(genre);
            return (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                  ${isSelected 
                    ? "bg-primary text-primary-foreground shadow-glow" 
                    : "glass border border-border text-foreground hover:border-primary/50"
                  }
                `}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default PreferencesForm;
