import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, Plus, X } from "lucide-react";

const AVAILABLE_GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
  "Drama", "Family", "Fantasy", "History", "Horror", "Music",
  "Mystery", "Romance", "Science Fiction", "Thriller", "War", "Western"
];

const AVAILABLE_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "hi", label: "Hindi" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "zh", label: "Chinese" },
  { code: "it", label: "Italian" },
  { code: "pt", label: "Portuguese" },
];

interface ProfilePreferencesEditorProps {
  favoriteGenres: string[];
  preferredLanguages: string[];
  onSave: (genres: string[], languages: string[]) => Promise<void>;
  isSaving?: boolean;
}

export const ProfilePreferencesEditor = ({
  favoriteGenres,
  preferredLanguages,
  onSave,
  isSaving = false,
}: ProfilePreferencesEditorProps) => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>(favoriteGenres);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(preferredLanguages);
  const [hasChanges, setHasChanges] = useState(false);

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => {
      const updated = prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre];
      setHasChanges(true);
      return updated;
    });
  };

  const toggleLanguage = (code: string) => {
    setSelectedLanguages(prev => {
      const updated = prev.includes(code)
        ? prev.filter(l => l !== code)
        : [...prev, code];
      setHasChanges(true);
      return updated;
    });
  };

  const handleSave = async () => {
    await onSave(selectedGenres, selectedLanguages);
    setHasChanges(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Favorite Genres */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Favorite Genres</Label>
        <p className="text-sm text-muted-foreground">
          Select genres you enjoy to get better recommendations
        </p>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_GENRES.map((genre) => {
            const isSelected = selectedGenres.includes(genre);
            return (
              <Badge
                key={genre}
                variant={isSelected ? "default" : "outline"}
                className={`
                  cursor-pointer transition-all duration-200
                  ${isSelected 
                    ? "bg-accent text-accent-foreground hover:bg-accent/80" 
                    : "hover:bg-secondary"
                  }
                `}
                onClick={() => toggleGenre(genre)}
              >
                {isSelected ? (
                  <Check className="w-3 h-3 mr-1" />
                ) : (
                  <Plus className="w-3 h-3 mr-1" />
                )}
                {genre}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Preferred Languages */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Preferred Languages</Label>
        <p className="text-sm text-muted-foreground">
          Movies in these languages will be prioritized
        </p>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_LANGUAGES.map((lang) => {
            const isSelected = selectedLanguages.includes(lang.code);
            return (
              <Badge
                key={lang.code}
                variant={isSelected ? "default" : "outline"}
                className={`
                  cursor-pointer transition-all duration-200
                  ${isSelected 
                    ? "bg-accent text-accent-foreground hover:bg-accent/80" 
                    : "hover:bg-secondary"
                  }
                `}
                onClick={() => toggleLanguage(lang.code)}
              >
                {isSelected ? (
                  <Check className="w-3 h-3 mr-1" />
                ) : (
                  <Plus className="w-3 h-3 mr-1" />
                )}
                {lang.label}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end"
        >
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Preferences"}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};
