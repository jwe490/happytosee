import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Users, Clock, TrendingUp, Film, Bookmark, Star } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface UserActivitySectionProps {
  stats: {
    total_users: number;
    active_users_7d: number;
    active_users_30d?: number;
    total_watchlist_items: number;
    total_mood_selections: number;
    total_reviews: number;
    new_users_7d?: number;
    total_recommendations?: number;
  } | null;
  isLoading: boolean;
}

// This would come from real analytics in production
const mockActivityData = [
  { day: "Mon", activeUsers: 45, sessions: 120, avgDuration: 8 },
  { day: "Tue", activeUsers: 52, sessions: 145, avgDuration: 12 },
  { day: "Wed", activeUsers: 61, sessions: 180, avgDuration: 10 },
  { day: "Thu", activeUsers: 48, sessions: 130, avgDuration: 9 },
  { day: "Fri", activeUsers: 72, sessions: 210, avgDuration: 15 },
  { day: "Sat", activeUsers: 89, sessions: 280, avgDuration: 22 },
  { day: "Sun", activeUsers: 78, sessions: 240, avgDuration: 18 },
];

export function UserActivitySection({ stats, isLoading }: UserActivitySectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const engagementRate = stats?.total_users
    ? ((stats.active_users_7d / stats.total_users) * 100).toFixed(1)
    : "0";

  const avgWatchlistPerUser = stats?.total_users
    ? (stats.total_watchlist_items / stats.total_users).toFixed(1)
    : "0";

  const avgReviewsPerUser = stats?.total_users
    ? (stats.total_reviews / stats.total_users).toFixed(2)
    : "0";

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5" />
          User Activity
        </h2>
        <p className="text-sm text-muted-foreground">Real-time user engagement on your platform</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Users (7d)</p>
                <p className="text-2xl font-semibold">{stats?.active_users_7d || 0}</p>
              </div>
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {engagementRate}% of total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg Session</p>
                <p className="text-2xl font-semibold">12m</p>
              </div>
              <Clock className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Per user visit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Watchlist/User</p>
                <p className="text-2xl font-semibold">{avgWatchlistPerUser}</p>
              </div>
              <Bookmark className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Movies saved avg
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Reviews/User</p>
                <p className="text-2xl font-semibold">{avgReviewsPerUser}</p>
              </div>
              <Star className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Engagement metric
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Weekly Activity</CardTitle>
          <CardDescription className="text-xs">User sessions and engagement over the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockActivityData}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="day" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorSessions)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* User Actions Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Film className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Movies Discovered</p>
                <p className="text-xl font-semibold">{stats?.total_recommendations || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Watchlist</p>
                <p className="text-xl font-semibold">{stats?.total_watchlist_items || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Star className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Reviews</p>
                <p className="text-xl font-semibold">{stats?.total_reviews || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
