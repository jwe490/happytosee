import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Activity, Bookmark, Star, Film, TrendingUp, Clock, Smile } from "lucide-react";

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

const moodEmojis: Record<string, string> = {
  happy: "😊",
  sad: "😢",
  romantic: "💕",
  action: "💪",
  scary: "😱",
  thoughtful: "🤔",
  adventurous: "🌟",
  nostalgic: "🎞️",
  relaxed: "😌",
  excited: "🎉",
  mysterious: "🔮",
  inspiring: "✨",
};

export function OverviewSection({
  stats,
  moodData,
  topWatchlisted,
  topRecommended,
  isLoading,
}: OverviewSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  const engagementRate = stats?.total_users
    ? ((stats.active_users_7d / stats.total_users) * 100).toFixed(1)
    : "0";

  const topMood = moodData[0];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Dashboard Overview</h2>
        <p className="text-sm text-muted-foreground">Key metrics about your users and their activity</p>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Users</p>
                <p className="text-2xl font-semibold">{stats?.total_users || 0}</p>
              </div>
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +{stats?.new_users_7d || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active (7d)</p>
                <p className="text-2xl font-semibold">{stats?.active_users_7d || 0}</p>
              </div>
              <Activity className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {engagementRate}% engagement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Watchlist Items</p>
                <p className="text-2xl font-semibold">{stats?.total_watchlist_items || 0}</p>
              </div>
              <Bookmark className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Movies saved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Reviews</p>
                <p className="text-2xl font-semibold">{stats?.total_reviews || 0}</p>
              </div>
              <Star className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              User ratings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Mood Selections</p>
                <p className="text-2xl font-semibold">{stats?.total_mood_selections || 0}</p>
              </div>
              <Smile className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Recommendations</p>
                <p className="text-2xl font-semibold">{stats?.total_recommendations || 0}</p>
              </div>
              <Film className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active (30d)</p>
                <p className="text-2xl font-semibold">{stats?.active_users_30d || 0}</p>
              </div>
              <Clock className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Trending Mood</p>
                <p className="text-lg font-semibold capitalize flex items-center gap-1">
                  {moodEmojis[stats?.trending_mood?.toLowerCase() || topMood?.mood || ""] || "🎬"}
                  {stats?.trending_mood || topMood?.mood || "N/A"}
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Watchlisted */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Watchlisted</CardTitle>
            <CardDescription className="text-xs">Most saved movies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topWatchlisted.slice(0, 5).map((movie, index) => (
                <div key={movie.movie_id} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded bg-muted flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-sm truncate">{movie.title}</span>
                  <span className="text-xs text-muted-foreground">{movie.count} saves</span>
                </div>
              ))}
              {topWatchlisted.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Recommended */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Recommended</CardTitle>
            <CardDescription className="text-xs">Most recommended movies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topRecommended.slice(0, 5).map((movie, index) => (
                <div key={movie.movie_id} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded bg-muted flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-sm truncate">{movie.title}</span>
                  <span className="text-xs text-muted-foreground">{movie.count}</span>
                </div>
              ))}
              {topRecommended.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
