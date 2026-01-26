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
  Flame,
  Eye,
  Clock,
  Sparkles,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

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

// Mock engagement data for the chart
const mockEngagementData = [
  { day: "Mon", users: 120, views: 450, interactions: 280 },
  { day: "Tue", users: 145, views: 520, interactions: 320 },
  { day: "Wed", users: 160, views: 580, interactions: 380 },
  { day: "Thu", users: 138, views: 490, interactions: 300 },
  { day: "Fri", users: 185, views: 680, interactions: 450 },
  { day: "Sat", users: 220, views: 820, interactions: 560 },
  { day: "Sun", users: 195, views: 750, interactions: 480 },
];

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

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Gradient */}
      <Card className="relative overflow-hidden bg-gradient-to-r from-primary/20 via-accent/10 to-primary/5 border-primary/20">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.5))]" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-accent" />
                Dashboard Overview
              </CardTitle>
              <CardDescription className="mt-1">
                Real-time analytics and platform performance metrics
              </CardDescription>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Trending Mood</p>
                <p className="text-lg font-semibold flex items-center gap-2 capitalize">
                  {moodEmojis[stats?.trending_mood?.toLowerCase() || ""] || "🎬"}
                  {stats?.trending_mood || "N/A"}
                </p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Engagement</p>
                <p className="text-lg font-semibold text-accent">{engagementRate}%</p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Primary Metrics - Gradient Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20 hover:border-blue-500/40 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold mt-1">{stats?.total_users?.toLocaleString() || 0}</p>
                <p className="text-xs text-blue-500 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +{stats?.new_users_7d || 0} this week
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border-green-500/20 hover:border-green-500/40 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users (7d)</p>
                <p className="text-3xl font-bold mt-1">{stats?.active_users_7d?.toLocaleString() || 0}</p>
                <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  {engagementRate}% engagement
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10">
                <UserCheck className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border-purple-500/20 hover:border-purple-500/40 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recommendations</p>
                <p className="text-3xl font-bold mt-1">{stats?.total_recommendations?.toLocaleString() || 0}</p>
                <p className="text-xs text-purple-500 mt-2 flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  AI-powered
                </p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10">
                <Film className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent border-orange-500/20 hover:border-orange-500/40 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mood Selections</p>
                <p className="text-3xl font-bold mt-1">{stats?.total_mood_selections?.toLocaleString() || 0}</p>
                <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
                  <Smile className="w-3 h-3" />
                  Personalization data
                </p>
              </div>
              <div className="p-3 rounded-xl bg-orange-500/10">
                <Smile className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Watchlist Items"
          value={stats?.total_watchlist_items || 0}
          icon={Bookmark}
          description="Movies saved"
        />
        <StatCard
          title="Reviews"
          value={stats?.total_reviews || 0}
          icon={Star}
          description="User reviews"
        />
        <StatCard
          title="30-Day Active"
          value={stats?.active_users_30d || 0}
          icon={Clock}
          description="Monthly users"
        />
        <StatCard
          title="Avg Watchlist"
          value={stats?.total_users ? (stats.total_watchlist_items / stats.total_users).toFixed(1) : "0"}
          icon={Eye}
          description="Per user"
        />
      </div>

      {/* Engagement Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent" />
            Weekly Engagement Overview
          </CardTitle>
          <CardDescription>User activity, views, and interactions over the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mockEngagementData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Area 
                type="monotone" 
                dataKey="views" 
                stroke="hsl(var(--accent))" 
                fillOpacity={1} 
                fill="url(#colorViews)" 
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="users" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorUsers)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-sm text-muted-foreground">Page Views</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">Active Users</span>
            </div>
          </div>
        </CardContent>
      </Card>

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
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Quick Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/50">
                <p className="text-sm text-muted-foreground">Avg Watchlist Size</p>
                <p className="text-2xl font-bold mt-1">
                  {stats?.total_users
                    ? (stats.total_watchlist_items / stats.total_users).toFixed(1)
                    : "0"}
                </p>
                <p className="text-xs text-muted-foreground">per user</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/50">
                <p className="text-sm text-muted-foreground">Review Rate</p>
                <p className="text-2xl font-bold mt-1">
                  {stats?.total_users
                    ? ((stats.total_reviews / stats.total_users) * 100).toFixed(0)
                    : "0"}%
                </p>
                <p className="text-xs text-muted-foreground">users reviewed</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-accent/10 to-transparent border border-accent/20">
                <p className="text-sm text-muted-foreground">Trending Mood</p>
                <p className="text-2xl font-bold capitalize mt-1 flex items-center gap-2">
                  {moodEmojis[stats?.trending_mood?.toLowerCase() || ""] || "🎬"}
                  {stats?.trending_mood || "N/A"}
                </p>
                <p className="text-xs text-muted-foreground">this week</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/50">
                <p className="text-sm text-muted-foreground">Recommendation CTR</p>
                <p className="text-2xl font-bold mt-1">67%</p>
                <p className="text-xs text-muted-foreground">click-through</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
