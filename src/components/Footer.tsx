import { Heart, Github, Twitter, Film } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.svg";

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: "Home", path: "/" },
    { label: "Watchlist", path: "/watchlist" },
    { label: "Profile", path: "/profile" },
    { label: "Mood Match", path: "/assessment" },
  ];

  return (
    <footer className="border-t border-border bg-card/50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Main footer content */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Brand section */}
          <div className="space-y-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img 
                src={logo} 
                alt="MoodFlix" 
                className="h-8 w-auto dark:invert"
              />
            </button>
            <p className="text-sm text-muted-foreground max-w-xs">
              Discover your perfect movie match based on how you feel. Powered by mood-based AI recommendations.
            </p>
          </div>

          {/* Navigation links */}
          <nav className="flex flex-wrap gap-x-8 gap-y-2">
            {footerLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-border" />

        {/* Bottom section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>for movie lovers</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">
              © {currentYear} MoodFlix
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
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
