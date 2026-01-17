import { useState } from "react";
import { motion } from "framer-motion";
import { User, Calendar, Smile, Target, Loader2, Sparkles } from "lucide-react";
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
  dateOfBirth?: string;
  gender?: string;
  purpose?: string;
}

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

    onSubmit({
      displayName: displayName.trim(),
      dateOfBirth: dateOfBirth || undefined,
      gender: gender || undefined,
      purpose: purpose || undefined,
    });
  };

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
          className="text-2xl font-bold mt-4"
        >
          Create Your Persona
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground mt-2"
        >
          Tell us a bit about yourself to unlock your vault
        </motion.p>
      </div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onSubmit={handleSubmit}
        className="glass rounded-2xl p-6 space-y-5"
      >
        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="displayName" className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            Display Name *
          </Label>
          <Input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How should we call you?"
            className="h-11"
            maxLength={30}
          />
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            Date of Birth
            <span className="text-xs text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="h-11"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Smile className="w-4 h-4 text-muted-foreground" />
            Gender
            <span className="text-xs text-muted-foreground">(optional)</span>
          </Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {genderOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Purpose */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            What brings you here?
            <span className="text-xs text-muted-foreground">(optional)</span>
          </Label>
          <Select value={purpose} onValueChange={setPurpose}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select purpose" />
            </SelectTrigger>
            <SelectContent>
              {purposeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
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
          disabled={isLoading || !displayName.trim()}
          className="w-full h-12 gap-2 text-base"
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
      </motion.form>
    </motion.div>
  );
}
