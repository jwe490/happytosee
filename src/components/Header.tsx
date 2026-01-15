import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu, X, Bookmark, Home, UserCircle, Sparkles, LogIn, LogOut } from "lucide-react";
import { AccentColorPicker } from "@/components/AccentColorPicker";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, username, signOut, isLoading } = useAuth();

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

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
    navigate("/");
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

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation("/watchlist")}
              className={location.pathname === "/watchlist" ? "text-primary" : ""}
            >
              Watchlist
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation("/profile")}
              className={location.pathname === "/profile" ? "text-primary" : ""}
            >
              Profile
            </Button>

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
              
              {!isLoading && (
                user ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleNavigation("/auth")}
                    className="gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Button>
                )
              )}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden relative z-50 bg-background/80 backdrop-blur-sm border-border"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <motion.div
                animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.div>
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
                {/* User info */}
                {user && (
                  <div className="flex items-center gap-3 pb-4 border-b border-border">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {(username || "U").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{username}</p>
                      <p className="text-xs text-muted-foreground">Signed in</p>
                    </div>
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

                  <Button
                    variant="ghost"
                    onClick={() => handleNavigation("/assessment")}
                    className={`w-full justify-start gap-3 ${
                      location.pathname === "/assessment" ? "text-primary bg-primary/10" : ""
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                    ✨ Movie Mood
                  </Button>

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
                </nav>

                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Theme</span>
                    <div className="flex items-center gap-2">
                      <AccentColorPicker />
                      <ThemeToggle />
                    </div>
                  </div>
                  
                  {/* Auth button in mobile menu */}
                  {!isLoading && (
                    user ? (
                      <Button
                        variant="outline"
                        onClick={handleSignOut}
                        className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        onClick={() => handleNavigation("/auth")}
                        className="w-full justify-start gap-3"
                      >
                        <LogIn className="w-5 h-5" />
                        Sign In
                      </Button>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
