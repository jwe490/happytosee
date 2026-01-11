import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useWatchlist } from "@/hooks/useWatchlist";
import { User, FolderHeart, Bookmark, Edit3, Sparkles, Film } from "lucide-react";
import { Link } from "react-router-dom";

const PROFILE_STORAGE_KEY = "moodflix_profile";

interface LocalProfile {
  display_name: string;
  favorite_genres: string[];
}

const Profile = () => {
  const { watchlist } = useWatchlist();
  const [profile, setProfile] = useState<LocalProfile>({ display_name: "", favorite_genres: [] });
  const [displayName, setDisplayName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Load profile from localStorage
    try {
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile(parsed);
        setDisplayName(parsed.display_name || "");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  }, []);

  const handleSaveProfile = () => {
    const updatedProfile = { ...profile, display_name: displayName };
    setProfile(updatedProfile);
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Avatar className="w-14 h-14 ring-2 ring-border">
            <AvatarFallback className="bg-muted">
              <User className="w-5 h-5 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-8 max-w-[180px] text-sm"
                  placeholder="Your name"
                  autoFocus
                />
                <Button size="sm" className="h-8" onClick={handleSaveProfile}>Save</Button>
                <Button size="sm" variant="ghost" className="h-8" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg font-semibold truncate">
                  {profile.display_name || "Guest User"}
                </h1>
                <button onClick={() => setIsEditing(true)} className="p-1 hover:bg-muted rounded transition-colors">
                  <Edit3 className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">Local Profile</p>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 gap-4"
        >
          <Link to="/watchlist" className="block">
            <div className="p-4 rounded-xl bg-card border border-border hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bookmark className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{watchlist.length}</p>
                  <p className="text-xs text-muted-foreground">In Watchlist</p>
                </div>
              </div>
            </div>
          </Link>
          
          <Link to="/assessment" className="block">
            <div className="p-4 rounded-xl bg-card border border-border hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Movie Mood</p>
                  <p className="text-xs text-muted-foreground">Find your vibe</p>
                </div>
              </div>
            </div>
          </Link>
        </motion.section>

        {/* Watchlist Preview */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-primary" />
              <h2 className="font-medium text-sm">My Watchlist</h2>
            </div>
            <Link to="/watchlist" className="text-xs text-primary hover:underline">
              View All
            </Link>
          </div>

          {watchlist.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-10 text-center"
            >
              <FolderHeart className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No movies saved yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Add movies to your watchlist while browsing</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
              {watchlist.slice(0, 6).map((movie, index) => (
                <motion.div 
                  key={movie.id} 
                  className="relative group"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted shadow-sm">
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-1 line-clamp-1">{movie.title}</p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Quick Actions */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="pt-4 border-t border-border"
        >
          <div className="grid gap-3">
            <Link to="/assessment">
              <Button variant="outline" className="w-full justify-start gap-3">
                <Sparkles className="w-4 h-4" />
                Take Movie Mood Assessment
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="w-full justify-start gap-3">
                <Film className="w-4 h-4" />
                Browse Movies
              </Button>
            </Link>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default Profile;
