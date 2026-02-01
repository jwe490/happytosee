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

  // Noir-styled input classes
  const inputClasses = "h-11 bg-neutral-900/50 border-neutral-700 text-neutral-100 placeholder:text-neutral-600 focus:border-neutral-500 focus:ring-neutral-500";
  const labelClasses = "flex items-center gap-2 text-neutral-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <VaultIllustration isUnlocked={false} />
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-semibold mt-4 text-neutral-100 tracking-tight"
        >
          Create Your Persona
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-neutral-500 mt-2 text-sm"
        >
          Tell us a bit about yourself to unlock your vault
        </motion.p>
      </div>

      {/* Form - noir glass style */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onSubmit={handleSubmit}
        className="relative rounded-2xl p-6 space-y-5 border border-neutral-800/60"
        style={{
          background: "linear-gradient(180deg, rgba(20,20,20,0.9) 0%, rgba(10,10,10,0.95) 100%)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Subtle inner glow */}
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at top, hsl(var(--primary) / 0.04) 0%, transparent 50%)",
          }}
        />
        
        <div className="relative z-10 space-y-5">
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
              <SelectContent className="bg-neutral-900 border-neutral-700">
                {movieTypeOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="text-neutral-200 focus:bg-neutral-800 focus:text-neutral-100"
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
              <span className="text-xs text-neutral-600">(optional)</span>
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
              <span className="text-xs text-neutral-600">(optional)</span>
            </Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className={inputClasses}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-700">
                {genderOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="text-neutral-200 focus:bg-neutral-800 focus:text-neutral-100"
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
              <span className="text-xs text-neutral-600">(optional)</span>
            </Label>
            <Select value={purpose} onValueChange={setPurpose}>
              <SelectTrigger className={inputClasses}>
                <SelectValue placeholder="Select purpose" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-700">
                {purposeOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="text-neutral-200 focus:bg-neutral-800 focus:text-neutral-100"
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
              className="p-3 rounded-lg bg-red-950/30 border border-red-900/40 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading || !displayName.trim() || !movieType}
            className="w-full h-12 gap-2 text-base font-medium bg-neutral-100 text-neutral-900 hover:bg-white transition-all duration-200 disabled:bg-neutral-700 disabled:text-neutral-400"
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
        </div>
      </motion.form>
    </motion.div>
  );
}
