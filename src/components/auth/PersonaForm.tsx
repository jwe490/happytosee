import { useState } from "react";
import { motion } from "framer-motion";
import { User, Calendar, Smile, Target, Loader2, Sparkles, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VaultIllustration } from "./VaultIllustration";

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
  { value: "hollywood", label: "Hollywood" },
  { value: "bollywood", label: "Bollywood" },
  { value: "tollywood", label: "Tollywood (Telugu)" },
  { value: "kollywood", label: "Kollywood (Tamil)" },
  { value: "korean", label: "Korean Cinema" },
  { value: "international", label: "International" },
];

const purposeOptions = [
  { value: "discover", label: "Discover new movies" },
  { value: "mood", label: "Find movies for my mood" },
  { value: "social", label: "Share with friends" },
  { value: "track", label: "Track what I watch" },
  { value: "explore", label: "Explore genres" },
];

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
  { value: "prefer-not", label: "Prefer not to say" },
];

export function PersonaForm({ onSubmit, isLoading }: PersonaFormProps) {
  const [displayName, setDisplayName] = useState("");
  const [movieType, setMovieType] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [purpose, setPurpose] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!displayName.trim()) {
      setError("Please enter a display name");
      return;
    }

    if (displayName.trim().length < 2) {
      setError("Display name must be at least 2 characters");
      return;
    }

    if (displayName.trim().length > 30) {
      setError("Display name must be less than 30 characters");
      return;
    }

    if (!movieType) {
      setError("Please select a movie type preference");
      return;
    }

    onSubmit({
      displayName: displayName.trim(),
      movieType,
      dateOfBirth: dateOfBirth || undefined,
      gender: gender || undefined,
      purpose: purpose || undefined,
    });
  };

  // Styled input classes using design tokens
  const inputClasses = "h-11 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground focus:border-foreground/30 focus:ring-foreground/20";
  const labelClasses = "flex items-center gap-2 text-muted-foreground";
  const selectContentClasses = "bg-popover border-border";
  const selectItemClasses = "text-foreground focus:bg-accent focus:text-accent-foreground";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      {/* Header */}
      <div className="text-center mb-8 px-6 pt-6">
        <VaultIllustration isUnlocked={false} />
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-semibold mt-4 text-foreground tracking-tight"
        >
          Create Your Persona
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground mt-2 text-sm"
        >
          Tell us a bit about yourself to unlock your vault
        </motion.p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="displayName" className={labelClasses}>
            <User className="w-4 h-4" />
            Display Name *
          </Label>
          <Input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How should we call you?"
            className={inputClasses}
            maxLength={30}
          />
        </div>

        {/* Movie Type - Required */}
        <div className="space-y-2">
          <Label className={labelClasses}>
            <Film className="w-4 h-4" />
            Movie Type *
          </Label>
          <Select value={movieType} onValueChange={setMovieType}>
            <SelectTrigger className={inputClasses}>
              <SelectValue placeholder="Select movie type" />
            </SelectTrigger>
            <SelectContent className={selectContentClasses}>
              {movieTypeOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className={selectItemClasses}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth" className={labelClasses}>
            <Calendar className="w-4 h-4" />
            Date of Birth
            <span className="text-xs text-muted-foreground/60">(optional)</span>
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className={inputClasses}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label className={labelClasses}>
            <Smile className="w-4 h-4" />
            Gender
            <span className="text-xs text-muted-foreground/60">(optional)</span>
          </Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className={inputClasses}>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent className={selectContentClasses}>
              {genderOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className={selectItemClasses}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Purpose */}
        <div className="space-y-2">
          <Label className={labelClasses}>
            <Target className="w-4 h-4" />
            What brings you here?
            <span className="text-xs text-muted-foreground/60">(optional)</span>
          </Label>
          <Select value={purpose} onValueChange={setPurpose}>
            <SelectTrigger className={inputClasses}>
              <SelectValue placeholder="Select purpose" />
            </SelectTrigger>
            <SelectContent className={selectContentClasses}>
              {purposeOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className={selectItemClasses}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={isLoading || !displayName.trim() || !movieType}
          className="w-full h-12 gap-2 text-base font-medium bg-foreground text-background hover:bg-foreground/90 transition-all duration-200"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Vault...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate My Vault
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
}
