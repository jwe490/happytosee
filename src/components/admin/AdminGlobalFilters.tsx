import { useState } from "react";
import { Filter, Globe, Languages, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface AdminFilters {
  language: string;
  region: string;
  timeRange: string;
}

interface AdminGlobalFiltersProps {
  filters: AdminFilters;
  onFiltersChange: (filters: AdminFilters) => void;
}

const languages = [
  { value: "all", label: "All Languages" },
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "te", label: "Telugu" },
  { value: "ta", label: "Tamil" },
  { value: "ml", label: "Malayalam" },
  { value: "kn", label: "Kannada" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "ko", label: "Korean" },
  { value: "ja", label: "Japanese" },
];

const regions = [
  { value: "all", label: "All Regions" },
  { value: "hollywood", label: "Hollywood" },
  { value: "bollywood", label: "Bollywood" },
  { value: "tollywood", label: "Tollywood (Telugu)" },
  { value: "kollywood", label: "Kollywood (Tamil)" },
  { value: "mollywood", label: "Mollywood (Malayalam)" },
  { value: "korean", label: "Korean Cinema" },
  { value: "anime", label: "Anime/Japanese" },
];

const timeRanges = [
  { value: "daily", label: "Last 24 Hours" },
  { value: "weekly", label: "Last 7 Days" },
  { value: "monthly", label: "Last 30 Days" },
  { value: "yearly", label: "Last Year" },
];

export function AdminGlobalFilters({ filters, onFiltersChange }: AdminGlobalFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFilterCount = [
    filters.language !== "all",
    filters.region !== "all",
  ].filter(Boolean).length;

  const handleReset = () => {
    onFiltersChange({
      language: "all",
      region: "all",
      timeRange: filters.timeRange,
    });
  };

  const getLanguageLabel = () => languages.find(l => l.value === filters.language)?.label || "All Languages";
  const getRegionLabel = () => regions.find(r => r.value === filters.region)?.label || "All Regions";
  const getTimeRangeLabel = () => timeRanges.find(t => t.value === filters.timeRange)?.label || "Last 7 Days";

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Time Range - Always Visible */}
      <Select
        value={filters.timeRange}
        onValueChange={(value) => onFiltersChange({ ...filters, timeRange: value })}
      >
        <SelectTrigger className="w-[160px] bg-card border-border/50">
          <SelectValue placeholder="Time Range" />
        </SelectTrigger>
        <SelectContent>
          {timeRanges.map((range) => (
            <SelectItem key={range.value} value={range.value}>
              {range.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filter Popover */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 border-border/50 bg-card"
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-accent text-accent-foreground">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Filter Analytics</h4>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 px-2 text-xs">
                  <X className="w-3 h-3 mr-1" />
                  Reset
                </Button>
              )}
            </div>

            {/* Language Filter */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground flex items-center gap-2">
                <Languages className="w-4 h-4" />
                Language
              </label>
              <Select
                value={filters.language}
                onValueChange={(value) => onFiltersChange({ ...filters, language: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Region Filter */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Region / Industry
              </label>
              <Select
                value={filters.region}
                onValueChange={(value) => onFiltersChange({ ...filters, region: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.value} value={region.value}>
                      {region.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filter Badges */}
      {filters.language !== "all" && (
        <Badge variant="secondary" className="gap-1 bg-accent/20 text-accent border-accent/30">
          <Globe className="w-3 h-3" />
          {getLanguageLabel()}
          <button
            onClick={() => onFiltersChange({ ...filters, language: "all" })}
            className="ml-1 hover:text-destructive"
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      )}
      {filters.region !== "all" && (
        <Badge variant="secondary" className="gap-1 bg-primary/20 text-primary border-primary/30">
          <MapPin className="w-3 h-3" />
          {getRegionLabel()}
          <button
            onClick={() => onFiltersChange({ ...filters, region: "all" })}
            className="ml-1 hover:text-destructive"
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      )}
    </div>
  );
}
