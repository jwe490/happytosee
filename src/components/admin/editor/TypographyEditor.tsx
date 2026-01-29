import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Type, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface TypographyEditorProps {
  headingFont: string;
  bodyFont: string;
  headingWeight: number;
  bodyWeight: number;
  onHeadingFontChange: (font: string) => void;
  onBodyFontChange: (font: string) => void;
  onHeadingWeightChange: (weight: number) => void;
  onBodyWeightChange: (weight: number) => void;
}

// Google Fonts options
const fontOptions = [
  { value: "Space Grotesk", label: "Space Grotesk", category: "display" },
  { value: "Plus Jakarta Sans", label: "Plus Jakarta Sans", category: "body" },
  { value: "Inter", label: "Inter", category: "body" },
  { value: "Satoshi", label: "Satoshi", category: "display" },
  { value: "Cabinet Grotesk", label: "Cabinet Grotesk", category: "display" },
  { value: "DM Sans", label: "DM Sans", category: "body" },
  { value: "Manrope", label: "Manrope", category: "body" },
  { value: "Outfit", label: "Outfit", category: "display" },
  { value: "Sora", label: "Sora", category: "display" },
  { value: "Work Sans", label: "Work Sans", category: "body" },
  { value: "Poppins", label: "Poppins", category: "body" },
  { value: "Montserrat", label: "Montserrat", category: "display" },
];

const fontWeights = [
  { value: 300, label: "Light" },
  { value: 400, label: "Regular" },
  { value: 500, label: "Medium" },
  { value: 600, label: "Semibold" },
  { value: 700, label: "Bold" },
  { value: 800, label: "Extra Bold" },
];

// Font pairing suggestions
const fontPairings = [
  { heading: "Space Grotesk", body: "Plus Jakarta Sans", name: "Modern Minimal" },
  { heading: "Cabinet Grotesk", body: "Inter", name: "Editorial" },
  { heading: "Sora", body: "DM Sans", name: "Tech Clean" },
  { heading: "Outfit", body: "Work Sans", name: "Friendly" },
  { heading: "Montserrat", body: "Manrope", name: "Professional" },
];

export function TypographyEditor({
  headingFont,
  bodyFont,
  headingWeight,
  bodyWeight,
  onHeadingFontChange,
  onBodyFontChange,
  onHeadingWeightChange,
  onBodyWeightChange,
}: TypographyEditorProps) {
  const [selectedPairing, setSelectedPairing] = useState<number | null>(null);

  // Load Google Fonts dynamically
  useEffect(() => {
    const fonts = [headingFont, bodyFont].filter(Boolean);
    if (fonts.length === 0) return;

    const link = document.createElement("link");
    link.href = `https://fonts.googleapis.com/css2?${fonts
      .map(f => `family=${f.replace(/\s+/g, "+")}:wght@300;400;500;600;700;800`)
      .join("&")}&display=swap`;
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [headingFont, bodyFont]);

  const applyPairing = (index: number) => {
    const pairing = fontPairings[index];
    setSelectedPairing(index);
    onHeadingFontChange(pairing.heading);
    onBodyFontChange(pairing.body);
  };

  return (
    <div className="space-y-6">
      {/* Font Pairings */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Type className="w-4 h-4" />
          Quick Font Pairings
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {fontPairings.map((pairing, index) => (
            <motion.button
              key={pairing.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => applyPairing(index)}
              className={cn(
                "relative p-3 rounded-lg border-2 text-left transition-colors",
                selectedPairing === index 
                  ? "border-foreground bg-muted/50" 
                  : "border-border hover:border-muted-foreground"
              )}
            >
              <p 
                className="text-sm font-semibold truncate"
                style={{ fontFamily: pairing.heading }}
              >
                {pairing.name}
              </p>
              <p 
                className="text-xs text-muted-foreground truncate mt-0.5"
                style={{ fontFamily: pairing.body }}
              >
                {pairing.heading} + {pairing.body}
              </p>
              
              {selectedPairing === index && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-foreground flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-background" />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Heading Font */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Heading Font</Label>
        <Select value={headingFont} onValueChange={onHeadingFontChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent>
            {fontOptions.filter(f => f.category === "display").map((font) => (
              <SelectItem 
                key={font.value} 
                value={font.value}
                style={{ fontFamily: font.value }}
              >
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Preview */}
        <div className="p-3 rounded-lg bg-muted">
          <p 
            className="text-lg"
            style={{ fontFamily: headingFont, fontWeight: headingWeight }}
          >
            The quick brown fox jumps
          </p>
        </div>

        {/* Weight */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Weight</Label>
            <span className="text-xs text-muted-foreground">
              {fontWeights.find(w => w.value === headingWeight)?.label || headingWeight}
            </span>
          </div>
          <Slider
            value={[headingWeight]}
            onValueChange={([v]) => onHeadingWeightChange(v)}
            min={300}
            max={800}
            step={100}
            className="w-full"
          />
        </div>
      </div>

      {/* Body Font */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Body Font</Label>
        <Select value={bodyFont} onValueChange={onBodyFontChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent>
            {fontOptions.filter(f => f.category === "body").map((font) => (
              <SelectItem 
                key={font.value} 
                value={font.value}
                style={{ fontFamily: font.value }}
              >
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Preview */}
        <div className="p-3 rounded-lg bg-muted">
          <p 
            className="text-sm"
            style={{ fontFamily: bodyFont, fontWeight: bodyWeight }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
          </p>
        </div>

        {/* Weight */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Weight</Label>
            <span className="text-xs text-muted-foreground">
              {fontWeights.find(w => w.value === bodyWeight)?.label || bodyWeight}
            </span>
          </div>
          <Slider
            value={[bodyWeight]}
            onValueChange={([v]) => onBodyWeightChange(v)}
            min={300}
            max={600}
            step={100}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
