import { Mail, Youtube, Instagram, Heart, Film } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.svg";

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const handleExploreClick = () => {
    const moodSection = document.getElementById("mood-selector");
    if (moodSection) {
      moodSection.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById("mood-selector");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  };

  return (
    <footer className="relative border-t border-border bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        {/* CTA Section — side by side layout matching reference */}
        <section className="rounded-3xl overflow-hidden relative" style={{
          background: `linear-gradient(135deg, hsl(175 35% 72%) 0%, hsl(185 30% 75%) 30%, hsl(195 28% 78%) 60%, hsl(180 32% 74%) 100%)`,
        }}>
          <div className="flex flex-col md:flex-row items-center gap-8 p-8 sm:p-10 md:p-14">
            {/* Left — Text */}
            <div className="flex-1 space-y-4 text-center md:text-left">
              <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal text-foreground/90 leading-[1.05] tracking-tight">
                Ready to<br />dive in?
              </h2>
              <p className="text-sm sm:text-base text-foreground/60 max-w-sm">
                Access now, and tell us about it!<br />Have more than 10+ Moods
              </p>
              <button
                type="button"
                onClick={handleExploreClick}
                className="inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-semibold tracking-wider uppercase shadow-lg active:scale-95 transition-all duration-200"
                style={{ backgroundColor: 'hsl(14 90% 62%)', color: 'white' }}
              >
                EXPLORE NOW
              </button>
            </div>

            {/* Right — Holographic animated box */}
            <div className="relative w-64 h-44 sm:w-80 sm:h-56 md:w-96 md:h-64 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0">
              {/* Animated holographic gradient */}
              <div 
                className="absolute inset-0 animate-gradient-flow"
                style={{
                  background: `linear-gradient(
                    -45deg,
                    hsl(340 60% 85%),
                    hsl(280 50% 88%),
                    hsl(200 60% 85%),
                    hsl(160 40% 88%),
                    hsl(45 50% 90%),
                    hsl(320 55% 87%),
                    hsl(200 60% 85%),
                    hsl(340 60% 85%)
                  )`,
                  backgroundSize: '400% 400%',
                }}
              />
              {/* Second layer for depth */}
              <div 
                className="absolute inset-0 animate-gradient-flow-reverse opacity-60"
                style={{
                  background: `linear-gradient(
                    45deg,
                    hsl(45 80% 92% / 0.6),
                    hsl(280 40% 90% / 0.4),
                    hsl(180 50% 88% / 0.6),
                    hsl(320 50% 90% / 0.4),
                    hsl(45 80% 92% / 0.6)
                  )`,
                  backgroundSize: '300% 300%',
                }}
              />
              {/* Shimmer highlight */}
              <div 
                className="absolute inset-0 animate-gradient-shift"
                style={{
                  background: `radial-gradient(ellipse 50% 60% at 30% 40%, hsl(0 0% 100% / 0.45), transparent 60%),
                               radial-gradient(ellipse 40% 50% at 70% 30%, hsl(0 0% 100% / 0.3), transparent 50%)`,
                }}
              />
              {/* Glass border effect */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/30" />
            </div>
          </div>
        </section>

        {/* Contact + socials + brand */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 items-start">
          <div className="space-y-3 text-center sm:text-left">
            <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity mx-auto sm:mx-0">
              <img src={logo} alt="MoodFlix" className="h-8 w-auto dark:invert" />
            </button>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto sm:mx-0">
              Discover your perfect movie match based on how you feel.
            </p>
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <p className="text-sm font-semibold text-foreground">Email</p>
            <a href="mailto:hello@moodflix.com" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Mail className="w-4 h-4" /> hello@moodflix.com
            </a>
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <p className="text-sm font-semibold text-foreground">Social media</p>
            <div className="flex flex-col gap-1.5 items-center sm:items-start">
              <a href="https://youtube.com/@moodflix-x3x?si=ZVxBKhqsNMLm2zlr" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Youtube className="w-4 h-4" /> @moodflix-x3x
              </a>
              <a href="https://www.instagram.com/mood_flix0/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="w-4 h-4" /> @mood_flix0
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
            <span className="inline-flex items-center gap-1"><Film className="w-3 h-3" /> Data from TMDb</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
