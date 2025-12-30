import { ThemeProvider as NextThemesProvider } from "next-themes";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  storageKey?: string;
};

type AccentColorContextType = {
  accentColor: string;
  setAccentColor: (color: string) => void;
};

const AccentColorContext = createContext<AccentColorContextType>({
  accentColor: "#8B5CF6",
  setAccentColor: () => {},
});

export const useAccentColor = () => useContext(AccentColorContext);

const accentPresets = {
  purple: { hue: 262, sat: 83, light: 58 },
  blue: { hue: 217, sat: 91, light: 60 },
  green: { hue: 145, sat: 60, light: 45 },
  orange: { hue: 24, sat: 95, light: 53 },
  pink: { hue: 330, sat: 81, light: 60 },
  red: { hue: 0, sat: 84, light: 60 },
  cyan: { hue: 186, sat: 94, light: 41 },
  yellow: { hue: 45, sat: 93, light: 47 },
};

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 262, s: 83, l: 58 };
  
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [accentColor, setAccentColorState] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accent-color") || "#8B5CF6";
    }
    return "#8B5CF6";
  });

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
    localStorage.setItem("accent-color", color);
    applyAccentColor(color);
  };

  const applyAccentColor = (color: string) => {
    const hsl = hexToHsl(color);
    document.documentElement.style.setProperty("--accent", `${hsl.h} ${hsl.s}% ${hsl.l}%`);
    document.documentElement.style.setProperty("--accent-hue", String(hsl.h));
    document.documentElement.style.setProperty("--accent-sat", `${hsl.s}%`);
    document.documentElement.style.setProperty("--accent-light", `${hsl.l}%`);
  };

  useEffect(() => {
    applyAccentColor(accentColor);
  }, [accentColor]);

  return (
    <AccentColorContext.Provider value={{ accentColor, setAccentColor }}>
      <NextThemesProvider {...props}>
        <div className="theme-transition">
          {children}
        </div>
      </NextThemesProvider>
    </AccentColorContext.Provider>
  );
}

export { accentPresets };
