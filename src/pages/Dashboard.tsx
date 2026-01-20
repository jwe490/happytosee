import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/hooks/useAuth";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { 
  Bookmark, 
  LogOut, 
  Download, 
  Trash2, 
  Clock, 
  Film, 
  Sparkles,
  TrendingUp,
  User,
  Calendar,
  Target
} from "lucide-react";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";

// Mood colors for the chart
const MOOD_COLORS: Record<string, string> = {
  happy: "#22c55e",
  sad: "#3b82f6",
  romantic: "#ec4899",
  excited: "#f59e0b",
  bored: "#8b5cf6",
  relaxed: "#14b8a6",
  nostalgic: "#f97316",
};

interface MoodStat {
  mood: string;
  count: number;
  percentage: number;
}

const Dashboard = () => {
  const { watchlist } = useWatchlist();
  const { history: watchHistory } = useWatchHistory();
  const { user, displayName, isAuthenticated, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [moodStats, setMoodStats] = useState<MoodStat[]>([]);
  const [totalWatchTime, setTotalWatchTime] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth", { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Fetch mood statistics
  useEffect(() => {
    const fetchMoodStats = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from("mood_selections")
          .select("mood")
          .eq("user_id", user.id);

        if (error) throw error;

        // Count moods
        const moodCounts: Record<string, number> = {};
        data?.forEach((item) => {
          moodCounts[item.mood] = (moodCounts[item.mood] || 0) + 1;
        });

        const total = Object.values(moodCounts).reduce((a, b) => a + b, 0);
        const stats = Object.entries(moodCounts).map(([mood, count]) => ({
          mood,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        }));

        // Sort by count descending
        stats.sort((a, b) => b.count - a.count);
        setMoodStats(stats.slice(0, 5)); // Top 5 moods
      } catch (error) {
        console.error("Error fetching mood stats:", error);
      }
    };

    fetchMoodStats();
  }, [user?.id]);

  // Calculate total watch time (estimate: 120 min per movie)
  useEffect(() => {
    const estimatedMinutesPerMovie = 120;
    setTotalWatchTime(watchHistory.length * estimatedMinutesPerMovie);
  }, [watchHistory]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const handleExportData = async () => {
    if (!user) return;
    setIsExporting(true);

    try {
      const exportData = {
        profile: {
          display_name: user.display_name,
          gender: user.gender,
          purpose: user.purpose,
          created_at: user.created_at,
        },
        watchlist: watchlist,
        watchHistory: watchHistory,
        moodStats: moodStats,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `moodflix-data-${user.display_name?.toLowerCase().replace(/\s+/g, "-")}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Data exported successfully!");
    } catch (error) {
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      // Delete user data from all tables
      await Promise.all([
        supabase.from("watchlist").delete().eq("user_id", user.id),
        supabase.from("watch_history").delete().eq("user_id", user.id),
        supabase.from("mood_selections").delete().eq("user_id", user.id),
        supabase.from("reviews").delete().eq("user_id", user.id),
        supabase.from("collections").delete().eq("user_id", user.id),
        supabase.from("key_sessions").delete().eq("user_id", user.id),
      ]);

      // Finally delete the user
      await supabase.from("key_users").delete().eq("id", user.id);

      await signOut();
      toast.success("Account deleted successfully");
      navigate("/");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = () => {
    const name = displayName || "";
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const formatWatchTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const getAvatarStyle = () => {
    const gender = user?.gender?.toLowerCase();
    if (gender === "male") return "bg-blue-500/20 text-blue-500";
    if (gender === "female") return "bg-pink-500/20 text-pink-500";
    return "bg-primary/10 text-primary";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-muted" />
              <div className="space-y-2">
                <div className="h-6 w-40 bg-muted rounded" />
                <div className="h-4 w-24 bg-muted rounded" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-20">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 rounded-2xl glass"
        >
          <Avatar className={`w-20 h-20 ring-4 ring-primary/20 ${getAvatarStyle()}`}>
            <AvatarFallback className="text-2xl font-bold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">{displayName}</h1>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
              {user?.purpose && (
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  {user.purpose}
                </span>
              )}
              {user?.created_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Member since {new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
              )}
            </div>
          </div>

          <Button variant="outline" onClick={handleSignOut} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mood Ring Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-card border border-border"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Your Mood Ring</h3>
            </div>

            {moodStats.length > 0 ? (
              <>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={moodStats}
                        dataKey="percentage"
                        nameKey="mood"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                      >
                        {moodStats.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={MOOD_COLORS[entry.mood] || "#6b7280"}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string) => [`${value}%`, name]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {moodStats.slice(0, 3).map((stat) => (
                    <span
                      key={stat.mood}
                      className="px-2 py-1 rounded-full text-xs font-medium capitalize"
                      style={{
                        backgroundColor: `${MOOD_COLORS[stat.mood] || "#6b7280"}20`,
                        color: MOOD_COLORS[stat.mood] || "#6b7280",
                      }}
                    >
                      {stat.mood} {stat.percentage}%
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                No mood data yet. Start exploring!
              </div>
            )}
          </motion.div>

          {/* Watch Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-6 rounded-2xl bg-card border border-border"
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Total Watch Time</h3>
            </div>
            <p className="text-4xl font-bold text-primary">
              {formatWatchTime(totalWatchTime)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Based on {watchHistory.length} movies watched
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span className="text-muted-foreground">Keep watching to grow!</span>
            </div>
          </motion.div>

          {/* Movies Discovered */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-card border border-border"
          >
            <div className="flex items-center gap-2 mb-4">
              <Film className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Movies Discovered</h3>
            </div>
            <p className="text-4xl font-bold text-primary">{watchlist.length}</p>
            <p className="text-sm text-muted-foreground mt-2">In your watchlist</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/watchlist")}
              className="mt-4 gap-2"
            >
              <Bookmark className="w-4 h-4" />
              View Watchlist
            </Button>
          </motion.div>
        </div>

        {/* Account Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-6 rounded-2xl bg-card border border-border"
        >
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">Account Settings</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Display Name</p>
                <p className="font-medium">{displayName}</p>
              </div>
              {user?.gender && (
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium capitalize">{user.gender}</p>
                </div>
              )}
              {user?.purpose && (
                <div>
                  <p className="text-sm text-muted-foreground">Purpose</p>
                  <p className="font-medium capitalize">{user.purpose}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                onClick={handleExportData}
                disabled={isExporting}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                {isExporting ? "Exporting..." : "Export My Data"}
              </Button>
              <Button
                variant="outline"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "Deleting..." : "Delete Account"}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Watchlist Preview */}
        {watchlist.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-primary" />
                Recent Watchlist
              </h3>
              <Button variant="ghost" size="sm" onClick={() => navigate("/watchlist")}>
                View All
              </Button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {watchlist.slice(0, 6).map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="aspect-[2/3] rounded-lg overflow-hidden bg-muted shadow-sm hover:shadow-md transition-shadow"
                >
                  {movie.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground p-2 text-center">
                      {movie.title}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
