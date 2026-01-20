import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// Mood to TMDb genre ID mapping
const MOOD_TO_GENRE: Record<string, number> = {
  romantic: 10749,
  comedy: 35,
  action: 28,
  drama: 18,
  thriller: 53,
  horror: 27,
  scifi: 878,
  animation: 16,
  adventure: 12,
  fantasy: 14,
  mystery: 9648,
  documentary: 99,
};

const MOODS = [
  { value: "romantic", label: "💕 Romantic" },
  { value: "comedy", label: "😂 Comedy" },
  { value: "action", label: "💥 Action" },
  { value: "drama", label: "🎭 Drama" },
  { value: "thriller", label: "😱 Thriller" },
  { value: "horror", label: "👻 Horror" },
  { value: "scifi", label: "🚀 Sci-Fi" },
  { value: "animation", label: "🎨 Animation" },
  { value: "adventure", label: "🗺️ Adventure" },
  { value: "fantasy", label: "✨ Fantasy" },
  { value: "mystery", label: "🔍 Mystery" },
  { value: "documentary", label: "📹 Documentary" },
];

interface DateNightMixerProps {
  onSearch: (genreIds: number[], usedFallback: boolean) => Promise<void>;
  isLoading?: boolean;
}

export function DateNightMixer({ onSearch, isLoading }: DateNightMixerProps) {
  const [mood1, setMood1] = useState<string>("");
  const [mood2, setMood2] = useState<string>("");

  const handleSearch = async () => {
    if (!mood1 || !mood2) {
      toast.error("Please select two moods for the perfect mix!");
      return;
    }

    if (mood1 === mood2) {
      toast.error("Pick two different moods for a fun mix!");
      return;
    }

    const genre1 = MOOD_TO_GENRE[mood1];
    const genre2 = MOOD_TO_GENRE[mood2];

    if (genre1 && genre2) {
      await onSearch([genre1, genre2], false);
    }
  };

  const availableMoods1 = MOODS;
  const availableMoods2 = MOODS.filter((m) => m.value !== mood1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10 border border-primary/20"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-full bg-primary/10">
          <Heart className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Date Night Mixer</h3>
          <p className="text-sm text-muted-foreground">
            Combine two moods for the perfect movie night
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">First Mood</Label>
          <Select value={mood1} onValueChange={setMood1}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select first mood" />
            </SelectTrigger>
            <SelectContent>
              {availableMoods1.map((mood) => (
                <SelectItem key={mood.value} value={mood.value}>
                  {mood.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Second Mood</Label>
          <Select value={mood2} onValueChange={setMood2} disabled={!mood1}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select second mood" />
            </SelectTrigger>
            <SelectContent>
              {availableMoods2.map((mood) => (
                <SelectItem key={mood.value} value={mood.value}>
                  {mood.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <AnimatePresence>
        {mood1 && mood2 && mood1 !== mood2 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 rounded-lg bg-accent/10 border border-accent/20"
          >
            <p className="text-sm text-center">
              <Sparkles className="w-4 h-4 inline mr-1 text-accent" />
              Finding movies that are both{" "}
              <span className="font-semibold capitalize">{mood1}</span> and{" "}
              <span className="font-semibold capitalize">{mood2}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={handleSearch}
        disabled={!mood1 || !mood2 || mood1 === mood2 || isLoading}
        className="w-full h-12 gap-2"
      >
        {isLoading ? (
          "Finding Perfect Match..."
        ) : (
          <>
            <Heart className="w-4 h-4" />
            Mix It Up!
          </>
        )}
      </Button>

      <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          We'll find movies matching both genres. If no perfect matches exist,
          we'll show you similar options.
        </span>
      </div>
    </motion.div>
  );
}
