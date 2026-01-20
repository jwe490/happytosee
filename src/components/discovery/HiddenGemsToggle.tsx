import { motion } from "framer-motion";
import { Gem, Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HiddenGemsToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function HiddenGemsToggle({ enabled, onToggle }: HiddenGemsToggleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
        enabled
          ? "bg-amber-500/10 border-amber-500/30 shadow-lg shadow-amber-500/10"
          : "bg-card border-border"
      }`}
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={{
            scale: enabled ? [1, 1.1, 1] : 1,
            rotate: enabled ? [0, 10, -10, 0] : 0,
          }}
          transition={{ duration: 0.5 }}
          className={`p-2 rounded-lg ${
            enabled ? "bg-amber-500/20" : "bg-muted"
          }`}
        >
          <Gem
            className={`w-5 h-5 transition-colors ${
              enabled ? "text-amber-500" : "text-muted-foreground"
            }`}
          />
        </motion.div>
        <div className="flex items-center gap-2">
          <Label
            htmlFor="hidden-gems"
            className={`font-medium cursor-pointer transition-colors ${
              enabled ? "text-amber-500" : ""
            }`}
          >
            💎 Hidden Gems Mode
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">
                Discover highly-rated movies that aren't mainstream blockbusters.
                Perfect for finding underrated masterpieces!
              </p>
              <ul className="text-xs mt-2 space-y-1 text-muted-foreground">
                <li>• Rating ≥ 7.0</li>
                <li>• 200-5000 votes (quality verified)</li>
                <li>• Excludes major franchises</li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <Switch
        id="hidden-gems"
        checked={enabled}
        onCheckedChange={onToggle}
        className={enabled ? "data-[state=checked]:bg-amber-500" : ""}
      />
    </motion.div>
  );
}
