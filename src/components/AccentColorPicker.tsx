import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAccentColor, accentPresets } from "@/components/ThemeProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const presetColors = [
  { name: "Purple", hex: "#8B5CF6" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Green", hex: "#22C55E" },
  { name: "Orange", hex: "#F97316" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Red", hex: "#EF4444" },
  { name: "Cyan", hex: "#06B6D4" },
  { name: "Yellow", hex: "#EAB308" },
];

export function AccentColorPicker() {
  const { accentColor, setAccentColor } = useAccentColor();
  const [customColor, setCustomColor] = useState(accentColor);
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetClick = (hex: string) => {
    setAccentColor(hex);
    setCustomColor(hex);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomColor(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      setAccentColor(value);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full relative overflow-hidden"
        >
          <div
            className="absolute inset-2 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
          <Palette className="w-4 h-4 relative z-10 text-white mix-blend-difference" />
          <span className="sr-only">Change accent color</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="end">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Accent Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {presetColors.map((color) => (
                <motion.button
                  key={color.name}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePresetClick(color.hex)}
                  className="relative w-10 h-10 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: color.hex,
                    borderColor: accentColor === color.hex ? "white" : "transparent",
                    boxShadow: accentColor === color.hex ? `0 0 0 2px ${color.hex}` : "none",
                  }}
                  title={color.name}
                >
                  <AnimatePresence>
                    {accentColor === color.hex && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}
            </div>
          </div>
          
          <div>
            <Label htmlFor="custom-color" className="text-sm font-medium mb-2 block">
              Custom Color
            </Label>
            <div className="flex gap-2">
              <div
                className="w-10 h-10 rounded-lg border border-border shrink-0"
                style={{ backgroundColor: customColor }}
              />
              <Input
                id="custom-color"
                type="text"
                value={customColor}
                onChange={handleCustomChange}
                placeholder="#8B5CF6"
                className="font-mono text-sm"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
