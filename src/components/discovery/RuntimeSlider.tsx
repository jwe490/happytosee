import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface RuntimeSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function RuntimeSlider({
  value,
  onChange,
  min = 60,
  max = 240,
}: RuntimeSliderProps) {
  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const getTimeLabel = (minutes: number) => {
    if (minutes <= 90) return "Quick Watch";
    if (minutes <= 120) return "Standard";
    if (minutes <= 150) return "Epic";
    return "Marathon";
  };

  // Calculate percentage for gradient
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-xl bg-card border border-border"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <Label className="font-medium">Time to Kill</Label>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-primary">
            {formatRuntime(value)}
          </span>
          <p className="text-xs text-muted-foreground">{getTimeLabel(value)}</p>
        </div>
      </div>

      <div className="relative pt-1">
        <Slider
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          min={min}
          max={max}
          step={10}
          className="w-full"
        />

        {/* Time markers */}
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>1h</span>
          <span>1.5h</span>
          <span>2h</span>
          <span>3h</span>
          <span>4h</span>
        </div>
      </div>

      {/* Visual indicator */}
      <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-accent via-primary to-primary"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <p className="text-xs text-muted-foreground mt-3 text-center">
        Show movies up to {formatRuntime(value)} runtime
      </p>
    </motion.div>
  );
}

// Runtime indicator for movie cards
export function RuntimeBadge({
  runtime,
  maxRuntime,
}: {
  runtime: number;
  maxRuntime: number;
}) {
  const fitsWithin = runtime <= maxRuntime;
  const hours = Math.floor(runtime / 60);
  const mins = runtime % 60;
  const formatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        fitsWithin
          ? "bg-green-500/20 text-green-500"
          : "bg-muted text-muted-foreground"
      }`}
    >
      <Clock className="w-3 h-3" />
      {formatted}
    </span>
  );
}
