import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu, X, Bookmark, LogOut, User, Home, UserCircle } from "lucide-react";
import { AccentColorPicker } from "@/components/AccentColorPicker";

const Header = () => {
  const [user, setUser] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <motion.button
            onClick={() => handleNavigation("/")}
            className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity"
            whileTap={{ scale: 0.95 }}
          >
            MoodFlix
          </motion.button>

          <nav className="hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation("/")}
              className={location.pathname === "/" ? "text-primary" : ""}
            >
              Home
            </Button>

            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation("/watchlist")}
                className={location.pathname === "/watchlist" ? "text-primary" : ""}
              >
                Watchlist
              </Button>
            )}

            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation("/profile")}
                className={location.pathname === "/profile" ? "text-primary" : ""}
              >
                Profile
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation("/assessment")}
              className={location.pathname === "/assessment" ? "text-primary bg-accent/10" : ""}
            >
              ✨ Movie Mood
            </Button>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <AccentColorPicker />
              <ThemeToggle />

              {user ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Sign Out
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleNavigation("/auth")}
                  className="font-medium"
                >
                  Sign In
                </Button>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-16 right-0 bottom-0 w-72 bg-background border-l border-border shadow-2xl z-50 md:hidden overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                {user && (
                  <div className="pb-4 border-b border-border">
                    <p className="text-sm font-medium truncate">{user.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">Signed in</p>
                  </div>
                )}

                <nav className="space-y-1">
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigation("/")}
                    className={`w-full justify-start gap-3 ${
                      location.pathname === "/" ? "text-primary bg-primary/10" : ""
                    }`}
                  >
                    <Home className="w-5 h-5" />
                    Home
                  </Button>

                  {user && (
                    <>
                      <Button
                        variant="ghost"
                        onClick={() => handleNavigation("/watchlist")}
                        className={`w-full justify-start gap-3 ${
                          location.pathname === "/watchlist" ? "text-primary bg-primary/10" : ""
                        }`}
                      >
                        <Bookmark className="w-5 h-5" />
                        Watchlist
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={() => handleNavigation("/profile")}
                        className={`w-full justify-start gap-3 ${
                          location.pathname === "/profile" ? "text-primary bg-primary/10" : ""
                        }`}
                      >
                        <UserCircle className="w-5 h-5" />
                        Profile
                      </Button>
                    </>
                  )}
                </nav>

                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Theme</span>
                    <div className="flex items-center gap-2">
                      <AccentColorPicker />
                      <ThemeToggle />
                    </div>
                  </div>
                </div>

                {user ? (
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="w-full justify-start gap-3 text-destructive border-destructive/50 hover:bg-destructive/10"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleNavigation("/auth")}
                    className="w-full font-medium"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
