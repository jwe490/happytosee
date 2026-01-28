import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark, TrendingUp, Film, Users } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface WatchlistStatsSectionProps {
  topWatchlisted: Array<{
    movie_id: number;
    title: string;
    poster_path?: string;
    count: number;
  }>;
  stats: {
    total_watchlist_items: number;
    total_users: number;
  } | null;
  isLoading: boolean;
}

export function WatchlistStatsSection({ topWatchlisted, stats, isLoading }: WatchlistStatsSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const avgPerUser = stats?.total_users 
    ? (stats.total_watchlist_items / stats.total_users).toFixed(1)
    : "0";

  const chartData = topWatchlisted.slice(0, 8).map((movie) => ({
    name: movie.title.length > 12 ? movie.title.slice(0, 12) + "..." : movie.title,
    count: movie.count,
    fullTitle: movie.title,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Bookmark className="w-5 h-5" />
          Watchlist Statistics
        </h2>
        <p className="text-sm text-muted-foreground">What movies are users saving to watch later</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Saves</p>
                <p className="text-2xl font-semibold">{stats?.total_watchlist_items || 0}</p>
              </div>
              <Bookmark className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg per User</p>
                <p className="text-2xl font-semibold">{avgPerUser}</p>
              </div>
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Unique Movies</p>
                <p className="text-2xl font-semibold">{topWatchlisted.length}</p>
              </div>
              <Film className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Top Movie Saves</p>
                <p className="text-2xl font-semibold">{topWatchlisted[0]?.count || 0}</p>
              </div>
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Most Saved Movies</CardTitle>
            <CardDescription className="text-xs">Movies users add to watchlist most often</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis 
                    type="number" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={11}
                    width={100}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number, name: string, props: any) => [
                      `${value} saves`,
                      props.payload.fullTitle,
                    ]}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(var(--primary))" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Movie List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Top Watchlisted Movies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topWatchlisted.slice(0, 10).map((movie, index) => (
              <div
                key={movie.movie_id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <span className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <div className="w-8 h-12 rounded overflow-hidden bg-muted shrink-0">
                  {movie.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <span className="flex-1 text-sm truncate">{movie.title}</span>
                <Badge variant="secondary" className="text-xs">{movie.count} saves</Badge>
              </div>
            ))}
            {topWatchlisted.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No watchlist data yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
