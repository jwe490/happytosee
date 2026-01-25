import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Languages, Film, Clock, Sparkles } from "lucide-react";

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
  { value: "any", label: "Any Language" },
  { value: "english", label: "English" },
  { value: "hindi", label: "Hindi" },
  { value: "tamil", label: "Tamil" },
  { value: "telugu", label: "Telugu" },
  { value: "korean", label: "Korean" },
  { value: "japanese", label: "Japanese" },
  { value: "spanish", label: "Spanish" },
  { value: "french", label: "French" },
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
  { value: "any", label: "Any Type" },
  { value: "hollywood", label: "Hollywood" },
  { value: "bollywood", label: "Bollywood" },
  { value: "tollywood", label: "Tollywood (Telugu)" },
  { value: "kollywood", label: "Kollywood (Tamil)" },
  { value: "korean", label: "Korean Cinema" },
  { value: "international", label: "International" },
];

const PreferencesForm = ({ preferences, onUpdatePreferences }: PreferencesFormProps) => {
  const toggleGenre = (genre: string) => {
    const newGenres = preferences.genres.includes(genre)
      ? preferences.genres.filter(g => g !== genre)
      : [...preferences.genres, genre];
    onUpdatePreferences("genres", newGenres);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Language & Movie Type Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div variants={itemVariants} className="space-y-2.5">
          <Label className="text-foreground/80 font-normal text-sm flex items-center gap-2">
            <Languages className="w-4 h-4 text-primary" />
            Preferred Language
          </Label>
          <Select
            value={preferences.language}
            onValueChange={(value) => onUpdatePreferences("language", value)}
          >
            <SelectTrigger className="h-11 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/40 hover:bg-background/80 transition-all duration-300">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {languages.map((lang) => (
                <SelectItem
                  key={lang.value}
                  value={lang.value}
                  className="rounded-lg"
                >
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2.5">
          <Label className="text-foreground/80 font-normal text-sm flex items-center gap-2">
            <Film className="w-4 h-4 text-primary" />
            Movie Type
          </Label>
          <Select
            value={preferences.movieType}
            onValueChange={(value) => onUpdatePreferences("movieType", value)}
          >
            <SelectTrigger className="h-11 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/40 hover:bg-background/80 transition-all duration-300">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {movieTypes.map((type) => (
                <SelectItem
                  key={type.value}
                  value={type.value}
                  className="rounded-lg"
                >
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
      </div>

      {/* Duration */}
      <motion.div variants={itemVariants} className="space-y-2.5">
        <Label className="text-foreground/80 font-normal text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Time Available
        </Label>
        <Select
          value={preferences.duration}
          onValueChange={(value) => onUpdatePreferences("duration", value)}
        >
          <SelectTrigger className="h-11 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/40 hover:bg-background/80 transition-all duration-300">
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {durations.map((dur) => (
              <SelectItem
                key={dur.value}
                value={dur.value}
                className="rounded-lg"
              >
                {dur.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Genres */}
      <motion.div variants={itemVariants} className="space-y-3">
        <Label className="text-foreground/80 font-normal text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Preferred Genres <span className="text-muted-foreground text-xs">(Optional)</span>
        </Label>
        <motion.div
          className="flex flex-wrap gap-2"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.03
              }
            }
          }}
        >
          {genres.map((genre, index) => {
            const isSelected = preferences.genres.includes(genre);
            return (
              <motion.button
                key={genre}
                onClick={() => toggleGenre(genre)}
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  visible: {
                    opacity: 1,
                    scale: 1,
                    transition: {
                      type: "spring" as const,
                      stiffness: 200,
                      damping: 18
                    }
                  }
                }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                  ${isSelected
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-secondary/50 backdrop-blur-sm text-foreground hover:bg-secondary/80"
                  }
                `}
              >
                <AnimatePresence>
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -right-1 -top-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.span>
                  )}
                </AnimatePresence>
                {genre}
              </motion.button>
            );
          })}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default PreferencesForm;
