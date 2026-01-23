import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "../StatCard";
import { MoodTrendsChart } from "../MoodTrendsChart";
import { TopMoviesCard } from "../TopMoviesCard";
import {
  Users,
  UserCheck,
  Bookmark,
  Smile,
  Star,
  TrendingUp,
  Film,
  Activity,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface OverviewSectionProps {
  stats: {
    total_users: number;
    active_users_7d: number;
    active_users_30d?: number;
    total_watchlist_items: number;
    total_mood_selections: number;
    total_reviews: number;
    new_users_7d?: number;
    total_recommendations?: number;
    trending_mood?: string | null;
  } | null;
  moodData: Array<{ mood: string; count: number }>;
  topWatchlisted: any[];
  topRecommended: any[];
  isLoading: boolean;
}

export function OverviewSection({
  stats,
  moodData,
  topWatchlisted,
  topRecommended,
  isLoading,
}: OverviewSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const engagementRate = stats?.total_users
    ? ((stats.active_users_7d / stats.total_users) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-primary/10 via-accent/5 to-transparent border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl">Dashboard Overview</CardTitle>
          <CardDescription>
            Real-time analytics and platform performance metrics
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.total_users || 0}
          icon={Users}
          description="Registered accounts"
        />
        <StatCard
          title="Active Users (7d)"
          value={stats?.active_users_7d || 0}
          icon={UserCheck}
          description="Weekly active users"
        />
        <StatCard
          title="New Users (7d)"
          value={stats?.new_users_7d || 0}
          icon={TrendingUp}
          description="New registrations"
        />
        <StatCard
          title="Engagement Rate"
          value={`${engagementRate}%`}
          icon={Activity}
          description="Weekly engagement"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Watchlist Items"
          value={stats?.total_watchlist_items || 0}
          icon={Bookmark}
          description="Movies saved"
        />
        <StatCard
          title="Mood Selections"
          value={stats?.total_mood_selections || 0}
          icon={Smile}
          description="Total selections"
        />
        <StatCard
          title="Reviews"
          value={stats?.total_reviews || 0}
          icon={Star}
          description="User reviews"
        />
        <StatCard
          title="Recommendations"
          value={stats?.total_recommendations || 0}
          icon={Film}
          description="Total served"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MoodTrendsChart data={moodData} isLoading={isLoading} />
        <TopMoviesCard
          title="Most Watchlisted"
          data={topWatchlisted}
          type="watchlisted"
          isLoading={isLoading}
        />
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopMoviesCard
          title="Top Recommended"
          data={topRecommended}
          type="recommended"
          isLoading={isLoading}
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Avg Watchlist Size</p>
                <p className="text-2xl font-bold">
                  {stats?.total_users
                    ? (stats.total_watchlist_items / stats.total_users).toFixed(1)
                    : "0"}
                </p>
                <p className="text-xs text-muted-foreground">per user</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Review Rate</p>
                <p className="text-2xl font-bold">
                  {stats?.total_users
                    ? ((stats.total_reviews / stats.total_users) * 100).toFixed(0)
                    : "0"}%
                </p>
                <p className="text-xs text-muted-foreground">users reviewed</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Trending Mood</p>
                <p className="text-2xl font-bold capitalize">
                  {stats?.trending_mood || "N/A"}
                </p>
                <p className="text-xs text-muted-foreground">this week</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">30-Day Active</p>
                <p className="text-2xl font-bold">{stats?.active_users_30d || 0}</p>
                <p className="text-xs text-muted-foreground">monthly users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
