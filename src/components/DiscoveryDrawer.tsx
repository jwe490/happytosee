import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gem, Clock, Heart, Filter, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mood to Genre ID mapping for TMDb
const MOOD_TO_GENRE: Record<string, number> = {
  romantic: 10749,
  comedy: 35,
  action: 28,
  drama: 18,
  horror: 27,
  thriller: 53,
  adventure: 12,
  animation: 16,
  documentary: 99,
  scifi: 878,
  mystery: 9648,
  fantasy: 14,
  family: 10751,
  war: 10752,
  crime: 80,
  music: 10402,
  history: 36,
  western: 37,
};

const MOOD_OPTIONS = [
  { value: "romantic", label: "💕 Romantic" },
  { value: "comedy", label: "😂 Comedy" },
  { value: "action", label: "💥 Action" },
  { value: "drama", label: "🎭 Drama" },
  { value: "horror", label: "👻 Horror" },
  { value: "thriller", label: "😰 Thriller" },
  { value: "adventure", label: "🗺️ Adventure" },
  { value: "scifi", label: "🚀 Sci-Fi" },
  { value: "fantasy", label: "🧙 Fantasy" },
  { value: "mystery", label: "🔍 Mystery" },
];

export interface DiscoveryFilters {
  hiddenGems: boolean;
  maxRuntime: number;
  dateNightMoods: [string, string] | null;
}

interface DiscoveryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: DiscoveryFilters;
  onFiltersChange: (filters: DiscoveryFilters) => void;
}

export function DiscoveryDrawer({ isOpen, onClose, filters, onFiltersChange }: DiscoveryDrawerProps) {
  const [localFilters, setLocalFilters] = useState<DiscoveryFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const defaultFilters: DiscoveryFilters = {
      hiddenGems: false,
      maxRuntime: 240,
      dateNightMoods: null,
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-background border-l border-border shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Discovery Filters</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Hidden Gems Toggle */}
              <div className="p-4 rounded-xl bg-card border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gem className={`w-5 h-5 ${localFilters.hiddenGems ? "text-yellow-500" : "text-muted-foreground"}`} />
                    <Label htmlFor="hidden-gems" className="font-medium">Hidden Gems Mode</Label>
                  </div>
                  <Switch
                    id="hidden-gems"
                    checked={localFilters.hiddenGems}
                    onCheckedChange={(checked) => setLocalFilters(prev => ({ ...prev, hiddenGems: checked }))}
                    className="data-[state=checked]:bg-yellow-500"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Find highly-rated movies (7.0+) that aren't mainstream blockbusters
                </p>
              </div>

              {/* Runtime Slider */}
              <div className="p-4 rounded-xl bg-card border border-border space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <Label className="font-medium">Max Runtime</Label>
                </div>
                <Slider
                  value={[localFilters.maxRuntime]}
                  onValueChange={([value]) => setLocalFilters(prev => ({ ...prev, maxRuntime: value }))}
                  min={60}
                  max={240}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1h</span>
                  <span className="font-medium text-foreground">{Math.floor(localFilters.maxRuntime / 60)}h {localFilters.maxRuntime % 60}m</span>
                  <span>4h</span>
                </div>
              </div>

              {/* Date Night Mixer */}
              <div className="p-4 rounded-xl bg-card border border-border space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-500" />
                    <Label className="font-medium">Date Night Mixer</Label>
                  </div>
                  <Switch
                    checked={localFilters.dateNightMoods !== null}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setLocalFilters(prev => ({ ...prev, dateNightMoods: ["romantic", "comedy"] }));
                      } else {
                        setLocalFilters(prev => ({ ...prev, dateNightMoods: null }));
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Mix two moods to find the perfect movie for date night
                </p>

                {localFilters.dateNightMoods && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Mood 1</Label>
                      <Select
                        value={localFilters.dateNightMoods[0]}
                        onValueChange={(value) => setLocalFilters(prev => ({
                          ...prev,
                          dateNightMoods: [value, prev.dateNightMoods?.[1] || "comedy"]
                        }))}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MOOD_OPTIONS.map((mood) => (
                            <SelectItem key={mood.value} value={mood.value}>
                              {mood.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Mood 2</Label>
                      <Select
                        value={localFilters.dateNightMoods[1]}
                        onValueChange={(value) => setLocalFilters(prev => ({
                          ...prev,
                          dateNightMoods: [prev.dateNightMoods?.[0] || "romantic", value]
                        }))}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MOOD_OPTIONS.map((mood) => (
                            <SelectItem key={mood.value} value={mood.value}>
                              {mood.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={handleReset} className="flex-1">
                  Reset
                </Button>
                <Button onClick={handleApply} className="flex-1 gap-2">
                  <Sparkles className="w-4 h-4" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export { MOOD_TO_GENRE };
