import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu, X, Bookmark, Home, User, Sparkles, LogIn, LogOut, Filter, Shield, Search, Clapperboard, Users } from "lucide-react";
import { AccentColorPicker } from "@/components/AccentColorPicker";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import FullScreenSearch from "@/components/FullScreenSearch";
import logo from "@/assets/logo.svg";

interface HeaderProps {
  onOpenDiscovery?: () => void;
  discoveryActive?: boolean;
}

const Header = ({ onOpenDiscovery, discoveryActive }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { displayName, isAuthenticated, signOut, isLoading } = useAuth();
  const { isAdmin } = useAdminAuth();

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

  const getInitials = () => {
    if (!displayName) return "U";
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return displayName.charAt(0).toUpperCase();
  };

  const navLinks = [
    { path: "/", label: "Home", icon: Home },
    { path: "/watchlist", label: "Watchlist", icon: Bookmark },
    { path: "/community", label: "Community", icon: Users },
    { path: "/profile", label: "Profile", icon: User },
    { path: "/assessment", label: "Mood Match", icon: Sparkles },
  ];

  return (
    <>
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/90 backdrop-blur-md border-b border-border"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleNavigation("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity active:scale-95"
          >
            <img 
              src={logo} 
              alt="MoodFlix" 
              className="h-10 md:h-12 w-auto dark:invert transition-transform"
            />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Button
                key={link.path}
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation(link.path)}
                className={`h-8 px-3 text-sm gap-1.5 ${
                  location.pathname === link.path 
                    ? "text-foreground bg-muted" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Button>
            ))}

            {/* Discovery Filter - only on home */}
            {location.pathname === "/" && onOpenDiscovery && (
              <Button
                variant={discoveryActive ? "default" : "ghost"}
                size="sm"
                onClick={onOpenDiscovery}
                className={`h-8 px-3 text-sm gap-1.5 ${
                  !discoveryActive ? "text-muted-foreground hover:text-foreground" : ""
                }`}
              >
                <Filter className="w-4 h-4" />
                Discover
              </Button>
            )}

            {/* Admin link */}
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation("/admin/dashboard")}
                className={`h-8 px-3 text-sm gap-1.5 ${
                  location.pathname.startsWith("/admin") 
                    ? "text-foreground bg-muted" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </Button>
            )}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Trailer Reels button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleNavigation("/trailers")}
              className={`h-9 w-9 ${location.pathname === "/trailers" ? "text-foreground bg-muted" : "text-muted-foreground"}`}
              aria-label="Trailer Reels"
            >
              <Clapperboard className="w-5 h-5" />
            </Button>

            {/* Search button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
              className="h-9 w-9"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Button>

            <div className="hidden md:flex items-center gap-1">
              <AccentColorPicker />
              <ThemeToggle />
              
              {!isLoading && (
                isAuthenticated ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="h-8 px-3 text-sm gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleNavigation("/auth")}
                    className="h-8 px-3 text-sm gap-1.5"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Button>
                )
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden h-9 w-9"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-14 right-0 bottom-0 w-64 bg-background border-l border-border z-50 md:hidden overflow-y-auto"
            >
              <div className="p-4 space-y-4">
                {/* User info */}
                {isAuthenticated && (
                  <div className="flex items-center gap-3 pb-4 border-b border-border">
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-medium">{getInitials()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{displayName || "User"}</p>
                      <p className="text-xs text-muted-foreground">Signed in</p>
                    </div>
                  </div>
                )}

                {/* Nav Links */}
                <nav className="space-y-1">
                  {navLinks.map((link) => (
                    <Button
                      key={link.path}
                      variant="ghost"
                      onClick={() => handleNavigation(link.path)}
                      className={`w-full justify-start gap-3 h-10 ${
                        location.pathname === link.path 
                          ? "bg-muted text-foreground" 
                          : "text-muted-foreground"
                      }`}
                    >
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </Button>
                  ))}

                  {/* Discovery in mobile */}
                  {location.pathname === "/" && onOpenDiscovery && (
                    <Button
                      variant={discoveryActive ? "default" : "ghost"}
                      onClick={() => {
                        onOpenDiscovery();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full justify-start gap-3 h-10 ${
                        !discoveryActive ? "text-muted-foreground" : ""
                      }`}
                    >
                      <Filter className="w-4 h-4" />
                      Discover
                    </Button>
                  )}

                  {/* Admin in mobile */}
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      onClick={() => handleNavigation("/admin/dashboard")}
                      className={`w-full justify-start gap-3 h-10 ${
                        location.pathname.startsWith("/admin") 
                          ? "bg-muted text-foreground" 
                          : "text-muted-foreground"
                      }`}
                    >
                      <Shield className="w-4 h-4" />
                      Admin Panel
                    </Button>
                  )}
                </nav>

                {/* Settings */}
                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Theme</span>
                    <div className="flex items-center gap-1">
                      <AccentColorPicker />
                      <ThemeToggle />
                    </div>
                  </div>
                  
                  {!isLoading && (
                    isAuthenticated ? (
                      <Button
                        variant="ghost"
                        onClick={handleSignOut}
                        className="w-full justify-start gap-3 h-10 text-muted-foreground"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        onClick={() => handleNavigation("/auth")}
                        className="w-full justify-start gap-3 h-10"
                      >
                        <LogIn className="w-4 h-4" />
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

      {/* Full Screen Search Overlay */}
      <FullScreenSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Header;
