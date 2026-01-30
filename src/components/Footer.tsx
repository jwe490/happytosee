import { useState } from "react";
import { Mail, Youtube, Instagram, Heart, Film } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.svg";

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [isGradientAnimating, setIsGradientAnimating] = useState(false);

  const handleExploreClick = () => {
    // Trigger animation on the decorative panel
    setIsGradientAnimating(true);
    setTimeout(() => setIsGradientAnimating(false), 800);

    // Scroll to mood selector section
    const moodSection = document.getElementById("mood-selector");
    if (moodSection) {
      moodSection.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      // Fallback: navigate home and try scrolling after a short delay
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById("mood-selector");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);
    }
  };

  return (
    <footer className="border-t border-border bg-card/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* CTA block */}
        <section className="rounded-3xl border border-border bg-secondary/30 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-10">
            <div className="space-y-5 text-center md:text-left">
              <div className="space-y-2">
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
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
                  className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold bg-primary text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 transition"
                >
                  EXPLORE NOW
                </button>
              </div>
            </div>

            {/* Decorative panel with animated grainy gradient on click */}
            <div className="relative">
              <div 
                className={`h-48 sm:h-56 md:h-full rounded-2xl border border-border bg-background/40 overflow-hidden transition-all duration-500 ${
                  isGradientAnimating ? "scale-[1.02]" : ""
                }`}
              >
                {/* Animated gradient layers */}
                <div 
                  className={`absolute inset-0 transition-all duration-700 ${
                    isGradientAnimating ? "opacity-100" : "opacity-70"
                  }`}
                  style={{ 
                    background: isGradientAnimating
                      ? "radial-gradient(60% 70% at 30% 30%, hsl(var(--primary)/0.4), transparent 60%), radial-gradient(60% 70% at 70% 60%, hsl(var(--accent)/0.35), transparent 60%), radial-gradient(40% 50% at 50% 50%, hsl(280 80% 60%/0.25), transparent 50%)"
                      : "radial-gradient(60% 70% at 30% 30%, hsl(var(--primary)/0.25), transparent 60%), radial-gradient(60% 70% at 70% 60%, hsl(var(--accent)/0.22), transparent 60%)"
                  }} 
                />
                
                {/* Animated color shift overlay */}
                <div 
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    isGradientAnimating ? "opacity-100 animate-pulse" : "opacity-0"
                  }`}
                  style={{
                    background: "radial-gradient(circle at 20% 80%, hsl(200 90% 60%/0.3), transparent 50%), radial-gradient(circle at 80% 20%, hsl(340 80% 60%/0.3), transparent 50%)"
                  }}
                />
                
                {/* Grain texture overlay */}
                <div 
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    isGradientAnimating ? "opacity-40" : "opacity-20"
                  }`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "repeat",
                  }}
                />
                
                <div className="absolute inset-0 bg-gradient-to-br from-background/20 via-background/0 to-background/30" />
                <div className="absolute inset-0 ring-1 ring-inset ring-border/40" />
              </div>
            </div>
          </div>
        </section>

        {/* Contact + socials + brand */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="space-y-3">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img src={logo} alt="MoodFlix" className="h-8 w-auto dark:invert" />
            </button>
            <p className="text-sm text-muted-foreground max-w-sm">
              Discover your perfect movie match based on how you feel.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Email</p>
            <a
              href="mailto:hello@moodflix.com"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="w-4 h-4" />
              hello@moodflix.com
            </a>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Social media</p>
            <div className="flex flex-col gap-2">
              <a
                href="https://youtube.com/@moodflix-x3x?si=ZVxBKhqsNMLm2zlr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Youtube className="w-4 h-4" />
                YouTube
              </a>
              <a
                href="https://www.instagram.com/mood_flix0/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Instagram className="w-4 h-4" />
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
            <span>MADE WITH</span>
            <Heart className="w-3.5 h-3.5" />
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
    </footer>
  );
};

export default Footer;
