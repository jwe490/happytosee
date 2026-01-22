import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu, X, Bookmark, Home, UserCircle, Sparkles, LogIn, LogOut, Gem, Shield, LayoutDashboard } from "lucide-react";
import { AccentColorPicker } from "@/components/AccentColorPicker";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onOpenDiscovery?: () => void;
  discoveryActive?: boolean;
}

const Header = ({ onOpenDiscovery, discoveryActive }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const isActive = (path: string) => location.pathname === path;

  // NavLink with pill background for active state
  const NavLink = ({
    path,
    children,
    icon: Icon,
  }: {
    path: string;
    children: React.ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleNavigation(path)}
      className={cn(
        "relative font-display font-medium text-sm transition-all duration-200",
        "flex items-center gap-2",
        isActive(path)
          ? "text-primary-foreground"
          : "text-foreground/70 hover:text-foreground"
      )}
    >
      {/* Active pill background */}
      {isActive(path) && (
        <motion.div
          layoutId="nav-pill"
          className="absolute inset-0 rounded-md bg-primary"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <span className="relative flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {children}
      </span>
    </Button>
  );

  return (
    <>
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo - vertically centered */}
          <motion.button
            onClick={() => handleNavigation("/")}
            className="font-display text-xl font-bold tracking-tight hover:opacity-80 transition-opacity flex items-center"
            whileTap={{ scale: 0.95 }}
          >
            MoodFlix
          </motion.button>

          {/* Desktop Navigation - vertically centered */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink path="/">Home</NavLink>
            <NavLink path="/watchlist">Watchlist</NavLink>
            <NavLink path="/profile">Profile</NavLink>
            <NavLink path="/assessment">Movie Mood</NavLink>

            {/* Discovery Filter Button - only on home page */}
            {location.pathname === "/" && onOpenDiscovery && (
              <Button
                variant={discoveryActive ? "default" : "outline"}
                size="sm"
                onClick={onOpenDiscovery}
                className={cn(
                  "gap-1.5 font-display font-medium ml-2",
                  discoveryActive && "bg-yellow-500/90 text-yellow-950 hover:bg-yellow-500"
                )}
              >
                <Gem className="w-4 h-4" />
                <span className="hidden lg:inline">Discover</span>
              </Button>
            )}

            {/* Admin link for admin users */}
            {isAdmin && (
              <NavLink path="/admin/dashboard" icon={Shield}>
                <span className="hidden lg:inline">Admin</span>
              </NavLink>
            )}
          </nav>

          {/* Right side controls - vertically centered */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <AccentColorPicker />
              <ThemeToggle />

              {!isLoading && (
                isAuthenticated ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="gap-2 font-display font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleNavigation("/auth")}
                    className="gap-2 font-display font-medium"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Button>
                )
              )}
            </div>

            {/* Mobile menu toggle */}
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

      {/* Mobile Menu */}
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
                {isAuthenticated && (
                  <div className="flex items-center gap-3 pb-4 border-b border-border">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-display font-semibold">
                        {getInitials()}
                      </span>
                    </div>
                    <div>
                      <p className="font-display font-medium text-sm">{displayName || "User"}</p>
                      <p className="text-xs text-muted-foreground">Signed in</p>
                    </div>
                  </div>
                )}

                <nav className="space-y-1">
                  {/* Mobile nav items - no emojis, pill background for active */}
                  {[
                    { path: "/", label: "Home", icon: Home },
                    { path: "/assessment", label: "Movie Mood", icon: Sparkles },
                    { path: "/watchlist", label: "Watchlist", icon: Bookmark },
                    { path: "/profile", label: "Profile", icon: UserCircle },
                  ].map((item) => (
                    <Button
                      key={item.path}
                      variant="ghost"
                      onClick={() => handleNavigation(item.path)}
                      className={cn(
                        "w-full justify-start gap-3 font-display font-medium",
                        isActive(item.path) && "bg-primary text-primary-foreground"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Button>
                  ))}

                  {isAuthenticated && (
                    <Button
                      variant="ghost"
                      onClick={() => handleNavigation("/dashboard")}
                      className={cn(
                        "w-full justify-start gap-3 font-display font-medium",
                        isActive("/dashboard") && "bg-primary text-primary-foreground"
                      )}
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Dashboard
                    </Button>
                  )}

                  {/* Discovery filter in mobile menu */}
                  {location.pathname === "/" && onOpenDiscovery && (
                    <Button
                      variant={discoveryActive ? "default" : "ghost"}
                      onClick={() => {
                        onOpenDiscovery();
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                        "w-full justify-start gap-3 font-display font-medium",
                        discoveryActive && "bg-yellow-500/90 text-yellow-950"
                      )}
                    >
                      <Gem className="w-5 h-5" />
                      Discovery Filters
                    </Button>
                  )}

                  {/* Admin link in mobile menu */}
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      onClick={() => handleNavigation("/admin/dashboard")}
                      className={cn(
                        "w-full justify-start gap-3 font-display font-medium",
                        location.pathname.startsWith("/admin") && "bg-primary text-primary-foreground"
                      )}
                    >
                      <Shield className="w-5 h-5" />
                      Admin Panel
                    </Button>
                  )}
                </nav>

                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground font-display">Theme</span>
                    <div className="flex items-center gap-2">
                      <AccentColorPicker />
                      <ThemeToggle />
                    </div>
                  </div>

                  {/* Auth button in mobile menu */}
                  {!isLoading && (
                    isAuthenticated ? (
                      <Button
                        variant="outline"
                        onClick={handleSignOut}
                        className="w-full justify-start gap-3 font-display font-medium text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        onClick={() => handleNavigation("/auth")}
                        className="w-full justify-start gap-3 font-display font-medium"
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
