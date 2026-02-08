import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/hooks/useAuth";
import { FolderHeart, Bookmark, Edit3, Sparkles, Film, LogOut, LogIn, User, Palette, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const PROFILE_STORAGE_KEY = "moodflix_profile";

interface LocalProfile {
  display_name: string;
  favorite_genres: string[];
  selected_moods: string[];
  avatar_emoji: string;
  accent_color: string;
  bio: string;
}

const AVATAR_OPTIONS = [
  "🎬", "🍿", "🎭", "🌟", "🦊", "🐱", "🎵", "🌈", "🔥", "💎", "🎯", "🎨",
  "🌙", "⚡", "🎸", "🎪", "🌻", "🦋", "🐼", "🎮"
];

const ACCENT_COLORS = [
  "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6", "#EF4444",
  "#06B6D4", "#F97316", "#84CC16", "#A855F7",
];

const Profile = () => {
  const { watchlist } = useWatchlist();
  const { user, displayName, username, isAuthenticated, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<LocalProfile>({
    display_name: "",
    favorite_genres: [],
    selected_moods: [],
    avatar_emoji: "🎬",
    accent_color: "#8B5CF6",
    bio: "",
  });
  const [editedDisplayName, setEditedDisplayName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [editedBio, setEditedBio] = useState("");

  const profileStorageKey = user?.id ? `${PROFILE_STORAGE_KEY}_${user.id}` : PROFILE_STORAGE_KEY;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(profileStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile(prev => ({ ...prev, ...parsed }));
        setEditedDisplayName(parsed.display_name || displayName || "");
        setEditedBio(parsed.bio || "");
      } else if (displayName) {
        setEditedDisplayName(displayName);
        setProfile(prev => ({ ...prev, display_name: displayName }));
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  }, [profileStorageKey, displayName]);

  const saveProfile = (updates: Partial<LocalProfile>) => {
    const updatedProfile = { ...profile, ...updates };
    setProfile(updatedProfile);
    localStorage.setItem(profileStorageKey, JSON.stringify(updatedProfile));
    toast.success("Profile updated");
  };

  const handleSaveEdit = () => {
    saveProfile({ display_name: editedDisplayName, bio: editedBio });
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const getInitials = () => {
    const name = profile.display_name || displayName || "";
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.charAt(0).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <Header />
        <main className="max-w-md mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted" />
              <div className="space-y-2">
                <div className="h-5 w-32 bg-muted rounded" />
                <div className="h-3 w-20 bg-muted rounded" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <Header />
        <main className="max-w-md mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Welcome to MoodFlix</h1>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-sm">
              Sign in to save your watchlist, track moods, and personalize your experience.
            </p>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <Button onClick={() => navigate("/auth")} className="gap-2">
                <LogIn className="w-4 h-4" />
                Sign In
              </Button>
              <Button variant="outline" onClick={() => navigate("/")}>
                Continue Browsing
              </Button>
            </div>
          </motion.div>
          <Footer />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <Header />
      
      <main className="max-w-md mx-auto px-4 py-8 space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          {/* Avatar with emoji picker */}
          <div className="relative">
            <button
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className="relative group"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl ring-2 ring-border hover:ring-primary/50 transition-all"
                style={{ backgroundColor: `${profile.accent_color}20` }}
              >
                {profile.avatar_emoji}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit3 className="w-3 h-3 text-muted-foreground" />
              </div>
            </button>

            {/* Avatar Picker Dropdown */}
            {showAvatarPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowAvatarPicker(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute top-full left-0 mt-2 z-50 bg-card border border-border rounded-xl shadow-xl p-3 w-[240px]"
                >
                  <p className="text-xs font-medium text-muted-foreground mb-2">Choose Avatar</p>
                  <div className="grid grid-cols-5 gap-1.5 mb-3">
                    {AVATAR_OPTIONS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => {
                          saveProfile({ avatar_emoji: emoji });
                          setShowAvatarPicker(false);
                        }}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl hover:bg-secondary transition-colors ${
                          profile.avatar_emoji === emoji ? "bg-primary/10 ring-2 ring-primary" : ""
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-border pt-2">
                    <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <Palette className="w-3 h-3" /> Accent Color
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      {ACCENT_COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => saveProfile({ accent_color: color })}
                          className="w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center"
                          style={{
                            backgroundColor: color,
                            borderColor: profile.accent_color === color ? "white" : "transparent",
                          }}
                        >
                          {profile.accent_color === color && <Check className="w-3 h-3 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={editedDisplayName}
                  onChange={(e) => setEditedDisplayName(e.target.value)}
                  className="h-9 text-sm"
                  placeholder="Your name"
                  autoFocus
                />
                <Input
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  className="h-9 text-xs"
                  placeholder="Short bio (optional)"
                />
                <div className="flex gap-2">
                  <Button size="sm" className="h-7 text-xs" onClick={handleSaveEdit}>Save</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-lg font-semibold truncate">
                    {profile.display_name || displayName}
                  </h1>
                  <button onClick={() => setIsEditing(true)} className="p-1 hover:bg-muted rounded transition-colors">
                    <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">@{username || "user"}</p>
                {profile.bio && (
                  <p className="text-xs text-muted-foreground mt-1">{profile.bio}</p>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 gap-3"
        >
          <Link to="/watchlist" className="block">
            <div className="p-4 rounded-xl bg-card border border-border hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bookmark className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{watchlist.length}</p>
                  <p className="text-xs text-muted-foreground">Watchlist</p>
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
                  <p className="text-sm font-medium">Mood Quiz</p>
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
            <Link to="/watchlist" className="text-xs text-primary hover:underline">View All</Link>
          </div>

          {watchlist.length === 0 ? (
            <div className="py-10 text-center">
              <FolderHeart className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No movies saved yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
              {watchlist.slice(0, 6).map((movie, index) => (
                <motion.div
                  key={movie.id}
                  className="relative"
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
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
