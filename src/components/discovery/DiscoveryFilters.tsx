import { useState } from "react";
import { motion } from "framer-motion";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateNightMixer } from "./DateNightMixer";
import { HiddenGemsToggle } from "./HiddenGemsToggle";
import { RuntimeSlider } from "./RuntimeSlider";

interface DiscoveryFiltersProps {
  hiddenGemsEnabled: boolean;
  onHiddenGemsToggle: (enabled: boolean) => void;
  maxRuntime: number;
  onRuntimeChange: (value: number) => void;
  onDateNightSearch: (genreIds: number[], usedFallback: boolean) => Promise<void>;
  isLoading?: boolean;
}

export function DiscoveryFilters({
  hiddenGemsEnabled,
  onHiddenGemsToggle,
  maxRuntime,
  onRuntimeChange,
  onDateNightSearch,
  isLoading,
}: DiscoveryFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-4">
      {/* Toggle Button */}
      <Button
        variant="outline"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between h-12"
      >
        <span className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Advanced Discovery
        </span>
        {isExpanded ? <X className="w-4 h-4" /> : null}
      </Button>

      {/* Filters Panel */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-6"
        >
          {/* Date Night Mixer */}
          <DateNightMixer onSearch={onDateNightSearch} isLoading={isLoading} />

          {/* Hidden Gems & Runtime */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HiddenGemsToggle
              enabled={hiddenGemsEnabled}
              onToggle={onHiddenGemsToggle}
            />
            <RuntimeSlider value={maxRuntime} onChange={onRuntimeChange} />
          </div>
        </motion.div>
      )}
    </div>
  );
}
