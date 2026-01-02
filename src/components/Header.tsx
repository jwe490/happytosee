import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Bookmark, LogOut, User, Menu, X, Home, Search, UserCircle, Users } from "lucide-react";
import { AccentColorPicker } from "@/components/AccentColorPicker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const Header = () => {
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
    navigate("/");
  };

  const handleNavigate = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full py-3 px-4 md:py-4 md:px-8 sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:gap-4">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button 
                className="flex items-center gap-1.5 md:gap-2 text-foreground hover:text-muted-foreground transition-colors p-2 -ml-2"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 md:w-6 md:h-6" />
                <span className="font-display text-xs md:text-sm font-semibold tracking-wide uppercase hidden sm:inline">Menu</span>
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[350px] bg-background border-border">
              <SheetHeader className="border-b border-border pb-4 mb-4">
                <SheetTitle className="font-display text-xl font-bold text-foreground">
                  MoodFlix
                </SheetTitle>
              </SheetHeader>
              
              <nav className="flex flex-col gap-2">
                <button
                  onClick={() => handleNavigate("/")}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors text-left"
                >
                  <Home className="w-5 h-5" />
                  <span className="font-medium">Home</span>
                </button>
                
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    document.getElementById('mood-selector')?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors text-left"
                >
                  <Search className="w-5 h-5" />
                  <span className="font-medium">Discover Movies</span>
                </button>

                <button
                  onClick={() => handleNavigate("/actors")}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors text-left"
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Popular Actors</span>
                </button>

                {user && (
                  <>
                    <button
                      onClick={() => handleNavigate("/watchlist")}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors text-left"
                    >
                      <Bookmark className="w-5 h-5" />
                      <span className="font-medium">My Watchlist</span>
                    </button>
                    
                    <button
                      onClick={() => handleNavigate("/profile")}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors text-left"
                    >
                      <UserCircle className="w-5 h-5" />
                      <span className="font-medium">My Profile</span>
                    </button>
                  </>
                )}

                <div className="border-t border-border my-4" />

                {user ? (
                  <>
                    <div className="px-4 py-2 text-sm text-muted-foreground truncate">
                      {user.email}
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleNavigate("/auth")}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors text-left"
                    >
                      <User className="w-5 h-5" />
                      <span className="font-medium">Log In</span>
                    </button>
                    <Button 
                      onClick={() => handleNavigate("/auth")}
                      className="mt-2 w-full font-display font-semibold"
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </nav>

              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Theme</span>
                  <div className="flex items-center gap-2">
                    <AccentColorPicker />
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <button 
          onClick={() => navigate("/")}
          className="absolute left-1/2 -translate-x-1/2"
        >
          <h1 className="font-display text-xl md:text-2xl lg:text-3xl font-bold text-foreground tracking-tight hover:text-foreground/80 transition-colors">
            MoodFlix
          </h1>
        </button>

        {/* Desktop Actions */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1">
            <AccentColorPicker />
            <ThemeToggle />
          </div>
          {user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/watchlist")}
                className="gap-2 hidden sm:flex"
              >
                <Bookmark className="w-4 h-4" />
                <span className="hidden md:inline">Watchlist</span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full hidden sm:flex">
                    <User className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
                  <div className="px-2 py-1.5 text-sm text-muted-foreground truncate">
                    {user.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <UserCircle className="w-4 h-4 mr-2" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/watchlist")}>
                    <Bookmark className="w-4 h-4 mr-2" />
                    My Watchlist
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <button 
                onClick={() => navigate("/auth")}
                className="font-display text-xs md:text-sm font-medium text-foreground hover:text-muted-foreground transition-colors tracking-wide uppercase hidden md:block"
              >
                Log-in
              </button>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => navigate("/auth")}
                className="font-display text-[10px] md:text-xs font-semibold tracking-wide uppercase rounded-full px-3 md:px-5 hidden sm:flex"
              >
                Sign-up
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;