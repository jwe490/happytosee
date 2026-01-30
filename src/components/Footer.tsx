import { Film, Mail, Youtube, Instagram, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.svg";

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

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
                  onClick={() => navigate("/")}
                  className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold bg-primary text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 transition"
                >
                  EXPLORE NOW
                </button>
              </div>
            </div>

            {/* Decorative panel (no external assets; uses theme tokens) */}
            <div className="relative">
              <div className="h-48 sm:h-56 md:h-full rounded-2xl border border-border bg-background/40 overflow-hidden">
                <div className="absolute inset-0 opacity-70" style={{ background: "radial-gradient(60% 70% at 30% 30%, hsl(var(--primary)/0.25), transparent 60%), radial-gradient(60% 70% at 70% 60%, hsl(var(--accent)/0.22), transparent 60%)" }} />
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
              href="mailto:hello@reallygreatsite.com"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="w-4 h-4" />
              hello@reallygreatsite.com
            </a>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Social media</p>
            <div className="flex flex-col gap-2">
              <a
                href="#"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Youtube className="w-4 h-4" />
                YouTube
              </a>
              <a
                href="#"
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
