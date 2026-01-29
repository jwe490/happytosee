import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pipette, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  label: string;
  value: string; // HSL format: "h s% l%"
  onChange: (value: string) => void;
  defaultValue?: string;
}

// Convert HSL string to hex for color input
function hslToHex(hsl: string): string {
  const parts = hsl.match(/(\d+(?:\.\d+)?)/g);
  if (!parts || parts.length < 3) return "#000000";
  
  const h = parseFloat(parts[0]) / 360;
  const s = parseFloat(parts[1]) / 100;
  const l = parseFloat(parts[2]) / 100;

  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convert hex to HSL string
function hexToHsl(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0 0% 0%";

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// Preset color palettes
const presetPalettes = [
  { name: "Purple", primary: "263 70% 58%", accent: "339 90% 51%" },
  { name: "Blue", primary: "221 83% 53%", accent: "24 95% 53%" },
  { name: "Green", primary: "142 76% 36%", accent: "45 93% 47%" },
  { name: "Rose", primary: "346 77% 49%", accent: "263 70% 58%" },
  { name: "Amber", primary: "38 92% 50%", accent: "12 76% 61%" },
  { name: "Teal", primary: "173 80% 40%", accent: "339 90% 51%" },
];

export function ColorPicker({ label, value, onChange, defaultValue }: ColorPickerProps) {
  const [hexValue, setHexValue] = useState(() => hslToHex(value));
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setHexValue(hslToHex(value));
  }, [value]);

  const handleHexChange = useCallback((hex: string) => {
    setHexValue(hex);
    const hsl = hexToHsl(hex);
    onChange(hsl);
  }, [onChange]);

  const handleReset = useCallback(() => {
    if (defaultValue) {
      onChange(defaultValue);
      setHexValue(hslToHex(defaultValue));
    }
  }, [defaultValue, onChange]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        {defaultValue && value !== defaultValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-6 px-2 text-xs"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        )}
      </div>
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "w-full h-10 rounded-lg border border-border flex items-center gap-3 px-3",
              "hover:border-foreground/30 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            )}
          >
            <div
              className="w-6 h-6 rounded-md border border-border/50 shadow-sm"
              style={{ backgroundColor: hexValue }}
            />
            <span className="text-sm font-mono text-muted-foreground flex-1 text-left">
              {hexValue.toUpperCase()}
            </span>
            <Pipette className="w-4 h-4 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        
        <PopoverContent className="w-64 p-4 space-y-4" align="start">
          {/* Native color picker */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Pick a color</Label>
            <input
              type="color"
              value={hexValue}
              onChange={(e) => handleHexChange(e.target.value)}
              className="w-full h-24 rounded-lg cursor-pointer border-0"
            />
          </div>

          {/* Hex input */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Hex value</Label>
            <Input
              value={hexValue}
              onChange={(e) => handleHexChange(e.target.value)}
              placeholder="#000000"
              className="font-mono text-sm"
            />
          </div>

          {/* HSL display */}
          <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
            HSL: {value}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface ColorPalettePickerProps {
  onApply: (primary: string, accent: string) => void;
}

export function ColorPalettePicker({ onApply }: ColorPalettePickerProps) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Quick Palettes</Label>
      <div className="grid grid-cols-3 gap-2">
        {presetPalettes.map((palette, index) => (
          <motion.button
            key={palette.name}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSelected(index);
              onApply(palette.primary, palette.accent);
            }}
            className={cn(
              "relative p-3 rounded-lg border-2 transition-colors",
              selected === index ? "border-foreground" : "border-border hover:border-muted-foreground"
            )}
          >
            <div className="flex gap-1">
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: hslToHex(palette.primary) }}
              />
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: hslToHex(palette.accent) }}
              />
            </div>
            <p className="text-xs mt-1.5 font-medium">{palette.name}</p>
            
            <AnimatePresence>
              {selected === index && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute top-1 right-1 w-4 h-4 rounded-full bg-foreground flex items-center justify-center"
                >
                  <Check className="w-2.5 h-2.5 text-background" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
