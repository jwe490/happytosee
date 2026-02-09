import { useState } from "react";
import { motion } from "framer-motion";
import { User, Film, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PersonaFormProps {
  onSubmit: (data: PersonaData) => void;
  isLoading?: boolean;
}

export interface PersonaData {
  displayName: string;
  movieType: string;
  dateOfBirth?: string;
  gender?: string;
  purpose?: string;
}

const movieTypeOptions = [
  { value: "hollywood", label: "Hollywood", emoji: "🎬" },
  { value: "bollywood", label: "Bollywood", emoji: "🇮🇳" },
  { value: "tollywood", label: "Telugu", emoji: "🎭" },
  { value: "kollywood", label: "Tamil", emoji: "🌟" },
  { value: "korean", label: "Korean", emoji: "🇰🇷" },
  { value: "international", label: "International", emoji: "🌍" },
];

const purposeOptions = [
  { value: "discover", label: "Discover movies", emoji: "🔍" },
  { value: "mood", label: "Match my mood", emoji: "🎯" },
  { value: "track", label: "Track watchlist", emoji: "📋" },
  { value: "social", label: "Share with friends", emoji: "💬" },
];

export function PersonaForm({ onSubmit, isLoading }: PersonaFormProps) {
  const [displayName, setDisplayName] = useState("");
  const [movieType, setMovieType] = useState("");
  const [purpose, setPurpose] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!displayName.trim()) {
      setError("Enter a name to continue");
      return;
    }
    if (displayName.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    onSubmit({
      displayName: displayName.trim(),
      movieType: movieType || "hollywood",
      purpose: purpose || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name input - clean, prominent */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Your Name
        </label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="What should we call you?"
            className="h-12 pl-11 rounded-xl bg-secondary/50 border-border text-base"
            maxLength={30}
            autoFocus
          />
        </div>
      </div>

      {/* Movie preference - pill selection */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5" />
          I love watching
        </label>
        <div className="flex flex-wrap gap-2">
          {movieTypeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMovieType(opt.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                movieType === opt.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <span className="mr-1.5">{opt.emoji}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Purpose - pill selection */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          I'm here to
        </label>
        <div className="flex flex-wrap gap-2">
          {purposeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPurpose(opt.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                purpose === opt.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <span className="mr-1.5">{opt.emoji}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive"
        >
          {error}
        </motion.p>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={isLoading || !displayName.trim()}
        className="w-full h-12 rounded-xl gap-2 text-base font-medium"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            Continue
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </form>
  );
}
