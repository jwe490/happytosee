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
    <footer className="relative border-t border-border overflow-hidden">
      {/* Infinite animated gradient background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 animate-gradient-flow" style={{
          background: `linear-gradient(
            -45deg,
            hsl(280 70% 50% / 0.12),
            hsl(200 80% 50% / 0.1),
            hsl(340 75% 55% / 0.12),
            hsl(160 70% 45% / 0.1),
            hsl(45 85% 55% / 0.12),
            hsl(280 70% 50% / 0.12)
          )`,
          backgroundSize: '400% 400%',
        }} />
        <div className="absolute inset-0 animate-gradient-flow-reverse" style={{
          background: `linear-gradient(
            45deg,
            hsl(45 80% 55% / 0.08),
            hsl(320 70% 55% / 0.06),
            hsl(180 60% 45% / 0.08),
            hsl(280 65% 50% / 0.06),
            hsl(45 80% 55% / 0.08)
          )`,
          backgroundSize: '300% 300%',
        }} />
        {/* Grain */}
        <div className="absolute inset-0" style={{
          opacity: 0.2,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          mixBlendMode: "overlay",
        }} />
        <div className="absolute inset-0 bg-background/80" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* CTA block */}
        <section className="rounded-3xl border border-border bg-card/40 backdrop-blur-sm overflow-hidden">
          <div className="p-6 sm:p-8 md:p-10 text-center space-y-5">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Ready to dive in?
            </h2>
            <p className="text-base text-muted-foreground max-w-md mx-auto">
              Access now, and tell us about it! Have more than 10+ moods.
            </p>
            <button
              type="button"
              onClick={handleExploreClick}
              className="inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-semibold bg-primary text-primary-foreground shadow-lg hover:opacity-90 active:scale-95 transition-all duration-200"
            >
              EXPLORE NOW
            </button>
          </div>
        </section>

        {/* Contact + socials + brand */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 items-start">
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
            <div className="flex flex-col gap-2 items-center sm:items-start">
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