import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Bookmark, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [user, setUser] = useState<any>(null);
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
    navigate("/");
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full py-4 px-6 md:px-8 sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-foreground hover:text-muted-foreground transition-colors"
          >
            <div className="w-0 h-0 border-l-[8px] border-l-accent border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent" />
            <span className="font-display text-sm font-semibold tracking-wide uppercase">Menu</span>
          </button>
        </div>

        <button 
          onClick={() => navigate("/")}
          className="absolute left-1/2 -translate-x-1/2"
        >
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tight hover:text-foreground/80 transition-colors">
            MoodFlix
          </h1>
        </button>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/watchlist")}
                className="gap-2"
              >
                <Bookmark className="w-4 h-4" />
                <span className="hidden sm:inline">Watchlist</span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <User className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm text-muted-foreground truncate">
                    {user.email}
                  </div>
                  <DropdownMenuSeparator />
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
                className="font-display text-sm font-medium text-foreground hover:text-muted-foreground transition-colors tracking-wide uppercase"
              >
                Log-in
              </button>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => navigate("/auth")}
                className="font-display text-xs font-semibold tracking-wide uppercase rounded-full px-5"
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
