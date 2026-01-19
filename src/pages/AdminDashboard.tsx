import { useNavigate } from "react-router-dom";
import { useKeyAuth } from "@/hooks/useKeyAuth";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/admin/StatCard";
import { MoodTrendsChart } from "@/components/admin/MoodTrendsChart";
import { TopMoviesCard } from "@/components/admin/TopMoviesCard";
import {
  Users,
  UserCheck,
  Bookmark,
  Smile,
  Star,
  LogOut,
  RefreshCw,
  Shield,
  Home,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { signOut, user } = useKeyAuth();
  const { stats, trendingMoods, topRecommended, topWatchlisted, isLoading, refetch } =
    useAdminAnalytics();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
    toast.success("Signed out successfully");
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Analytics refreshed");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">MoodFlix Admin</h1>
                <p className="text-sm text-muted-foreground">Analytics Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </a>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
          <h2 className="text-2xl font-bold mb-2">Welcome back, Admin!</h2>
          <p className="text-muted-foreground">
            Here's an overview of your platform's performance and user engagement.
          </p>
          <p className="text-sm text-muted-foreground mt-1">Logged in as: {user?.display_name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard title="Total Users" value={stats?.total_users || 0} icon={Users} description="Registered accounts" />
          <StatCard title="Active Users" value={stats?.active_users_7d || 0} icon={UserCheck} description="Last 7 days" />
          <StatCard title="Watchlist Items" value={stats?.total_watchlist_items || 0} icon={Bookmark} description="Movies saved" />
          <StatCard title="Mood Selections" value={stats?.total_mood_selections || 0} icon={Smile} description="Total selections" />
          <StatCard title="Total Reviews" value={stats?.total_reviews || 0} icon={Star} description="User reviews" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <MoodTrendsChart data={trendingMoods} isLoading={isLoading} />
          <TopMoviesCard title="Most Watchlisted Movies" data={topWatchlisted} type="watchlisted" isLoading={isLoading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopMoviesCard title="Top Recommended Movies" data={topRecommended} type="recommended" isLoading={isLoading} />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Insights</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                <p className="text-sm text-muted-foreground">Avg Watchlist Size</p>
                <p className="text-2xl font-bold">
                  {stats?.total_users ? (stats.total_watchlist_items / stats.total_users).toFixed(1) : "0"}
                </p>
                <p className="text-xs text-muted-foreground">movies per user</p>
              </div>
              <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                <p className="text-sm text-muted-foreground">Review Rate</p>
                <p className="text-2xl font-bold">
                  {stats?.total_users ? ((stats.total_reviews / stats.total_users) * 100).toFixed(0) : "0"}%
                </p>
                <p className="text-xs text-muted-foreground">users reviewed</p>
              </div>
              <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                <p className="text-sm text-muted-foreground">Engagement</p>
                <p className="text-2xl font-bold">
                  {stats?.total_users && stats?.active_users_7d
                    ? ((stats.active_users_7d / stats.total_users) * 100).toFixed(0)
                    : "0"}%
                </p>
                <p className="text-xs text-muted-foreground">weekly active</p>
              </div>
              <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                <p className="text-sm text-muted-foreground">Top Mood</p>
                <p className="text-2xl font-bold capitalize">{trendingMoods[0]?.mood || "N/A"}</p>
                <p className="text-xs text-muted-foreground">this week</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
