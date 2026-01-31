import { useState, useEffect, useRef } from "react";
import { Mail, Youtube, Instagram, Heart, Film } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.svg";

// Color palette presets for the animated gradient
const colorPresets = [
  {
    primary: "hsl(280 80% 55%)",
    secondary: "hsl(200 90% 50%)",
    accent: "hsl(340 85% 55%)",
  },
  {
    primary: "hsl(160 80% 45%)",
    secondary: "hsl(280 75% 60%)",
    accent: "hsl(45 95% 55%)",
  },
  {
    primary: "hsl(200 85% 50%)",
    secondary: "hsl(340 80% 55%)",
    accent: "hsl(60 90% 50%)",
  },
  {
    primary: "hsl(320 80% 55%)",
    secondary: "hsl(180 75% 45%)",
    accent: "hsl(25 95% 55%)",
  },
  {
    primary: "hsl(45 90% 50%)",
    secondary: "hsl(280 80% 55%)",
    accent: "hsl(170 80% 45%)",
  },
];

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [currentPresetIndex, setCurrentPresetIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAutoAnimating, setIsAutoAnimating] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-animate colors on loop
  useEffect(() => {
    if (isAutoAnimating) {
      intervalRef.current = setInterval(() => {
        setCurrentPresetIndex((prev) => (prev + 1) % colorPresets.length);
      }, 3500);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAutoAnimating]);

  const handlePanelClick = () => {
    // Pause auto-animation briefly for user interaction
    setIsAutoAnimating(false);
    setIsAnimating(true);
    
    // Randomize to a different preset
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * colorPresets.length);
    } while (newIndex === currentPresetIndex && colorPresets.length > 1);
    
    setCurrentPresetIndex(newIndex);
    
    setTimeout(() => setIsAnimating(false), 800);
    setTimeout(() => setIsAutoAnimating(true), 4000);
  };

  const handleExploreClick = () => {
    handlePanelClick();
    
    // Scroll to mood selector section
    const moodSection = document.getElementById("mood-selector");
    if (moodSection) {
      moodSection.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById("mood-selector");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);
    }
  };

  const currentColors = colorPresets[currentPresetIndex];

  return (
    <footer className="border-t border-border bg-card/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* CTA block */}
        <section className="rounded-3xl border border-border bg-secondary/30 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 p-6 sm:p-8 md:p-10">
            <div className="space-y-5 text-center md:text-left">
              <div className="space-y-2">
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                  Ready to dive in?
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto md:mx-0">
                  Access now, and tell us about it! Have more than 10+ moods.
                </p>
              </div>
              <div className="flex justify-center md:justify-start">
                <button
                  type="button"
                  onClick={handleExploreClick}
                  className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold bg-primary text-primary-foreground shadow-lg hover:opacity-90 active:scale-95 transition-all duration-200"
                >
                  EXPLORE NOW
                </button>
              </div>
            </div>

            {/* Animated gradient panel with looping colors */}
            <div className="relative">
              <button 
                type="button"
                onClick={handlePanelClick}
                className={`w-full h-48 sm:h-56 md:h-full min-h-[200px] rounded-2xl border border-border overflow-hidden transition-transform duration-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  isAnimating ? "scale-[1.02]" : "hover:scale-[1.01]"
                }`}
                aria-label="Click to change colors"
              >
                {/* Base gradient layer with smooth color transition */}
                <div 
                  className="absolute inset-0 transition-all duration-1000 ease-in-out"
                  style={{ 
                    background: `
                      radial-gradient(65% 75% at 25% 25%, ${currentColors.primary}40, transparent 60%),
                      radial-gradient(60% 70% at 75% 65%, ${currentColors.secondary}35, transparent 55%),
                      radial-gradient(50% 60% at 50% 45%, ${currentColors.accent}30, transparent 50%),
                      linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--card)) 100%)
                    `
                  }} 
                />

                {/* Animated swirl layer */}
                <div 
                  className="absolute inset-0 transition-all duration-700"
                  style={{
                    background: `
                      conic-gradient(from ${isAnimating ? 180 : 0}deg at 30% 70%, ${currentColors.accent}20, transparent 25%),
                      conic-gradient(from ${isAnimating ? 270 : 90}deg at 70% 30%, ${currentColors.primary}20, transparent 25%)
                    `,
                    transform: isAnimating ? 'rotate(15deg) scale(1.1)' : 'rotate(0deg) scale(1)',
                  }}
                />

                {/* Moving gradient blobs */}
                <div 
                  className="absolute inset-0 transition-all duration-1500"
                  style={{
                    background: `
                      radial-gradient(circle at ${isAnimating ? '30% 30%' : '20% 80%'}, ${currentColors.secondary}35, transparent 40%),
                      radial-gradient(circle at ${isAnimating ? '80% 70%' : '70% 20%'}, ${currentColors.accent}30, transparent 40%)
                    `
                  }}
                />
                
                {/* Enhanced grain texture overlay */}
                <div 
                  className="absolute inset-0 transition-opacity duration-500"
                  style={{
                    opacity: isAnimating ? 0.45 : 0.25,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "repeat",
                    mixBlendMode: "overlay",
                  }}
                />

                {/* Shimmer effect */}
                <div 
                  className={`absolute inset-0 transition-opacity duration-300 ${isAnimating ? 'opacity-60' : 'opacity-0'}`}
                  style={{
                    background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                    backgroundSize: '200% 200%',
                    animation: isAnimating ? 'shimmer 0.8s ease-out' : 'none',
                  }}
                />

                {/* Subtle vignette */}
                <div className="absolute inset-0 bg-gradient-to-br from-background/20 via-transparent to-background/40" />
                
                {/* Inner border glow */}
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />

                {/* Click hint */}
                <div className="absolute bottom-3 right-3 text-[10px] text-muted-foreground/50 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to mix
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Contact + socials + brand */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 items-start">
          <div className="space-y-3 text-center sm:text-left">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity mx-auto sm:mx-0"
            >
              <img src={logo} alt="MoodFlix" className="h-8 w-auto dark:invert" />
            </button>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto sm:mx-0">
              Discover your perfect movie match based on how you feel.
            </p>
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <p className="text-sm font-semibold text-foreground">Email</p>
            <a
              href="mailto:hello@moodflix.com"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="w-4 h-4" />
              hello@moodflix.com
            </a>
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <p className="text-sm font-semibold text-foreground">Social media</p>
            <div className="flex flex-col gap-2 items-center sm:items-start">
              <a
                href="https://youtube.com/@moodflix-x3x?si=ZVxBKhqsNMLm2zlr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Youtube className="w-4 h-4" />
                @moodflix-x3x
              </a>
              <a
                href="https://www.instagram.com/mood_flix0/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Instagram className="w-4 h-4" />
                @mood_flix0
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
            <span>MADE WITH</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>FOR OUR USERS • MOOD FLIX</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>© {currentYear} MoodFlix</span>
            <span aria-hidden="true">•</span>
            <span className="inline-flex items-center gap-1">
              <Film className="w-3 h-3" />
              Data from TMDb
            </span>
          </div>
        </div>
      </div>

      {/* CSS for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 200%; }
          100% { background-position: -200% -200%; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
