import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/hooks/useAuth";
import {
  FolderHeart, Bookmark, Edit3, Sparkles, Film, LogOut, LogIn, User,
  Palette, Check, Camera, X, Save
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const PROFILE_STORAGE_KEY = "moodflix_profile";

interface LocalProfile {
  display_name: string;
  favorite_genres: string[];
  selected_moods: string[];
  avatar_emoji: string;
  avatar_image: string | null;
  accent_color: string;
  bio: string;
}

const AVATAR_OPTIONS = [
  "🎬", "🍿", "🎭", "🌟", "🦊", "🐱", "🎵", "🌈", "🔥", "💎",
  "🎯", "🎨", "🌙", "⚡", "🎸", "🎪", "🌻", "🦋", "🐼", "🎮"
];

const ACCENT_COLORS = [
  "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6",
  "#EF4444", "#06B6D4", "#F97316", "#84CC16", "#A855F7",
];

const Profile = () => {
  const { watchlist } = useWatchlist();
  const { user, displayName, username, isAuthenticated, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<LocalProfile>({
    display_name: "",
    favorite_genres: [],
    selected_moods: [],
    avatar_emoji: "🎬",
    avatar_image: null,
    accent_color: "#8B5CF6",
    bio: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedBio, setEditedBio] = useState("");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const profileStorageKey = user?.id ? `${PROFILE_STORAGE_KEY}_${user.id}` : PROFILE_STORAGE_KEY;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(profileStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile(prev => ({ ...prev, ...parsed }));
        setEditedName(parsed.display_name || displayName || "");
        setEditedBio(parsed.bio || "");
      } else if (displayName) {
        setEditedName(displayName);
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
    saveProfile({ display_name: editedName, bio: editedBio });
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      saveProfile({ avatar_image: dataUrl });
      setShowAvatarPicker(false);
    };
    reader.readAsDataURL(file);
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
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-muted" />
              <div className="h-5 w-32 bg-muted rounded" />
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
                <LogIn className="w-4 h-4" /> Sign In
              </Button>
              <Button variant="outline" onClick={() => navigate("/")}>Continue Browsing</Button>
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
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      <main className="max-w-md mx-auto px-4 py-8 space-y-8">
        {/* Profile Hero - Centered, inspired by reference */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center"
        >
          {/* Avatar */}
          <div className="relative mb-4">
            <button
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className="relative group"
            >
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center ring-4 ring-border hover:ring-primary/40 transition-all overflow-hidden"
                style={{ backgroundColor: `${profile.accent_color}15` }}
              >
                {profile.avatar_image ? (
                  <img src={profile.avatar_image} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl">{profile.avatar_emoji}</span>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-card border-2 border-border flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Camera className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Avatar Picker */}
            <AnimatePresence>
              {showAvatarPicker && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowAvatarPicker(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -8 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50 bg-card border border-border rounded-2xl shadow-2xl p-4 w-[280px]"
                  >
                    {/* Upload photo option */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors mb-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Camera className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium">Upload Photo</p>
                        <p className="text-xs text-muted-foreground">JPG, PNG under 2MB</p>
                      </div>
                    </button>

                    {profile.avatar_image && (
                      <button
                        onClick={() => {
                          saveProfile({ avatar_image: null });
                          setShowAvatarPicker(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-destructive/10 text-destructive transition-colors mb-3"
                      >
                        <X className="w-4 h-4" />
                        <span className="text-sm">Remove Photo</span>
                      </button>
                    )}

                    <div className="border-t border-border pt-3 mb-2">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Choose Emoji</p>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5 mb-4">
                      {AVATAR_OPTIONS.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => {
                            saveProfile({ avatar_emoji: emoji, avatar_image: null });
                            setShowAvatarPicker(false);
                          }}
                          className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl hover:bg-secondary transition-colors ${
                            !profile.avatar_image && profile.avatar_emoji === emoji
                              ? "bg-primary/10 ring-2 ring-primary"
                              : ""
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-border pt-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                        <Palette className="w-3 h-3" /> Accent Color
                      </p>
                      <div className="flex gap-2 flex-wrap">
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
            </AnimatePresence>
          </div>

          {/* Name & Bio */}
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full space-y-3 max-w-xs"
            >
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="text-center text-lg font-semibold h-11 rounded-xl"
                placeholder="Your name"
                autoFocus
              />
              <Textarea
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                className="text-center text-sm resize-none rounded-xl"
                placeholder="Write a short bio..."
                rows={2}
              />
              <div className="flex gap-2 justify-center">
                <Button size="sm" onClick={handleSaveEdit} className="gap-1.5 rounded-full">
                  <Save className="w-3.5 h-3.5" /> Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="rounded-full">
                  Cancel
                </Button>
              </div>
            </motion.div>
          ) : (
            <div>
              <div className="flex items-center justify-center gap-2">
                <h1 className="font-display text-xl font-bold">
                  {profile.display_name || displayName}
                </h1>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 hover:bg-muted rounded-full transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground">@{username || "user"}</p>
              {profile.bio && (
                <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">{profile.bio}</p>
              )}
            </div>
          )}
        </motion.div>

        {/* Quick Action Buttons - Like reference */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-3 gap-3"
        >
          <button
            onClick={() => setShowAvatarPicker(true)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border hover:bg-muted/50 transition-colors"
          >
            <Camera className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Set Photo</span>
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border hover:bg-muted/50 transition-colors"
          >
            <Edit3 className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Edit Info</span>
          </button>
          <Link
            to="/watchlist"
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border hover:bg-muted/50 transition-colors"
          >
            <Bookmark className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Watchlist</span>
          </Link>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border p-5 space-y-4"
        >
          <div className="space-y-1">
            <p className="text-lg font-semibold">{watchlist.length} Movies</p>
            <p className="text-xs text-muted-foreground">In your watchlist</p>
          </div>

          {profile.bio && (
            <div className="pt-3 border-t border-border">
              <p className="text-sm text-foreground leading-relaxed">{profile.bio}</p>
              <p className="text-xs text-muted-foreground mt-1">Bio</p>
            </div>
          )}
        </motion.div>

        {/* Watchlist Preview */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
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
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Actions */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="pt-4 border-t border-border space-y-3"
        >
          <Link to="/assessment">
            <Button variant="outline" className="w-full justify-start gap-3 rounded-xl">
              <Sparkles className="w-4 h-4" /> Take Mood Assessment
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" className="w-full justify-start gap-3 rounded-xl">
              <Film className="w-4 h-4" /> Browse Movies
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full justify-start gap-3 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
