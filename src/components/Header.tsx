import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Bookmark, LogOut, User, Home, Search, UserCircle, Sparkles } from "lucide-react";
import { AccentColorPicker } from "@/components/AccentColorPicker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [user, setUser] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 pt-4"
    >
      <motion.div
        animate={{
          width: isScrolled ? "auto" : "100%",
          maxWidth: isScrolled ? "800px" : "100%",
          borderRadius: isScrolled ? "9999px" : "16px",
          backgroundColor: isScrolled
            ? "hsl(var(--background) / 0.7)"
            : "hsl(var(--background) / 0.95)",
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut"
        }}
        className="mx-auto backdrop-blur-xl border border-border/50 shadow-2xl"
        style={{
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: isScrolled
            ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(var(--primary) / 0.1)"
            : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div className={`flex items-center justify-between transition-all duration-300 ${
          isScrolled ? "px-6 py-3" : "px-6 py-4"
        }`}>
          <motion.button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              animate={{ rotate: isScrolled ? 0 : 0 }}
              className="relative"
            >
              <Sparkles className={`transition-all duration-300 ${
                isScrolled ? "w-5 h-5" : "w-6 h-6"
              } text-primary`} />
            </motion.div>
            <h1 className={`font-display font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent group-hover:from-primary group-hover:via-foreground group-hover:to-primary tracking-tight transition-all duration-300 ${
              isScrolled ? "text-lg" : "text-xl md:text-2xl"
            }`}>
              MoodFlix
            </h1>
          </motion.button>

          <nav className="hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className={`gap-2 transition-all ${
                location.pathname === "/" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Home className="w-4 h-4" />
              <span className={isScrolled ? "hidden lg:inline" : ""}>Home</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (location.pathname !== "/") {
                  navigate("/");
                  setTimeout(() => {
                    document.getElementById('mood-selector')?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }, 100);
                } else {
                  document.getElementById('mood-selector')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                  });
                }
              }}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <Search className="w-4 h-4" />
              <span className={isScrolled ? "hidden lg:inline" : ""}>Discover</span>
            </Button>

            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/watchlist")}
                className={`gap-2 transition-all ${
                  location.pathname === "/watchlist" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span className={isScrolled ? "hidden lg:inline" : ""}>Watchlist</span>
              </Button>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <AnimatePresence mode="wait">
              {!isScrolled && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="hidden lg:flex items-center gap-1"
                >
                  <AccentColorPicker />
                  <ThemeToggle />
                </motion.div>
              )}
            </AnimatePresence>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-primary/10 transition-all"
                  >
                    <User className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-background/95 backdrop-blur-xl border-border/50"
                  style={{
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                  }}
                >
                  <div className="px-2 py-2">
                    <p className="text-sm font-medium truncate">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Signed in</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                    <UserCircle className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/watchlist")} className="cursor-pointer md:hidden">
                    <Bookmark className="w-4 h-4 mr-2" />
                    Watchlist
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="md:hidden" />
                  <DropdownMenuItem className="cursor-pointer md:hidden" onClick={(e) => e.preventDefault()}>
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm">Theme</span>
                      <div className="flex items-center gap-1">
                        <AccentColorPicker />
                        <ThemeToggle />
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/auth")}
                  className="text-muted-foreground hover:text-foreground transition-colors hidden sm:flex"
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/auth")}
                  className="rounded-full px-4 font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isScrolled && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 md:hidden"
          >
            <div
              className="flex items-center gap-2 bg-background/80 backdrop-blur-xl border border-border/50 rounded-full px-4 py-2 shadow-2xl"
              style={{
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className={`rounded-full ${location.pathname === "/" ? "text-primary bg-primary/10" : ""}`}
              >
                <Home className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (location.pathname !== "/") {
                    navigate("/");
                    setTimeout(() => {
                      document.getElementById('mood-selector')?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                      });
                    }, 100);
                  } else {
                    document.getElementById('mood-selector')?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }
                }}
                className="rounded-full"
              >
                <Search className="w-5 h-5" />
              </Button>
              {user && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/watchlist")}
                  className={`rounded-full ${location.pathname === "/watchlist" ? "text-primary bg-primary/10" : ""}`}
                >
                  <Bookmark className="w-5 h-5" />
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
