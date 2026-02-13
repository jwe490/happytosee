import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFollows } from "@/hooks/useFollows";
import { UserPlus, UserCheck, Film, Bookmark, Share2, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PublicProfileData {
  id: string;
  display_name: string;
  avatar_emoji?: string;
  bio?: string;
  favorite_genres?: string[];
  movie_personality?: string;
  accent_color?: string;
}

const PublicProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [publicWatchlist, setPublicWatchlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isFollowing, followersCount, followingCount, toggleFollow, isLoading: followLoading } = useFollows(userId);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    if (!userId) return;
    const fetchProfile = async () => {
      setLoading(true);
      // Fetch from key_users
      const { data: userData } = await supabase
        .from("key_users")
        .select("id, display_name, created_at")
        .eq("id", userId)
        .maybeSingle();

      if (!userData) {
        setLoading(false);
        return;
      }

      // Try to get local profile info from profiles table
      const { data: profileData } = await supabase
        .from("profiles")
        .select("bio, favorite_genres, accent_color, avatar_url")
        .eq("user_id", userId)
        .maybeSingle();

      setProfile({
        id: userData.id,
        display_name: userData.display_name,
        bio: profileData?.bio || undefined,
        favorite_genres: profileData?.favorite_genres || undefined,
        accent_color: profileData?.accent_color || "#8B5CF6",
      });

      // Fetch public watchlist
      const { data: wl } = await supabase
        .from("watchlist")
        .select("*")
        .eq("user_id", userId)
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(20);

      setPublicWatchlist(wl || []);
      setLoading(false);
    };
    fetchProfile();
  }, [userId]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: `${profile?.display_name}'s Profile`, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Profile link copied!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <Header />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <Header />
        <div className="text-center py-32">
          <h1 className="text-2xl font-bold text-foreground mb-2">User not found</h1>
          <p className="text-muted-foreground">This profile doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center ring-4 ring-border" style={{ backgroundColor: `${profile.accent_color}20` }}>
            <span className="text-5xl">🎬</span>
          </div>

          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">{profile.display_name}</h1>
            {profile.bio && <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">{profile.bio}</p>}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="text-center">
              <p className="font-bold text-foreground">{followersCount}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-foreground">{followingCount}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-foreground">{publicWatchlist.length}</p>
              <p className="text-xs text-muted-foreground">Public Movies</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3">
            {!isOwnProfile && user && (
              <Button
                onClick={toggleFollow}
                disabled={followLoading}
                variant={isFollowing ? "secondary" : "default"}
                className="gap-2 rounded-full"
              >
                {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {isFollowing ? "Following" : "Follow"}
              </Button>
            )}
            <Button variant="outline" size="icon" className="rounded-full" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Genres */}
        {profile.favorite_genres && profile.favorite_genres.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h3 className="font-display text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Favorite Genres</h3>
            <div className="flex flex-wrap gap-2">
              {profile.favorite_genres.map(g => (
                <span key={g} className="px-3 py-1.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">{g}</span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Public Watchlist */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="font-display text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
            <Bookmark className="w-4 h-4" /> Public Watchlist
          </h3>
          {publicWatchlist.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Film className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No public movies yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {publicWatchlist.map((movie, i) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="aspect-[2/3] rounded-xl overflow-hidden bg-muted shadow-sm"
                >
                  {movie.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Film className="w-8 h-8" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default PublicProfile;
