import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Film, TrendingUp, Star, Clock, Eye } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

interface ContentPerformanceSectionProps {
  contentPerformance: {
    most_watched: Array<{
      movie_id: number;
      title: string;
      poster_path: string;
      watch_count: number;
    }>;
    most_reviewed: Array<{
      movie_id: number;
      title: string;
      poster_path: string;
      review_count: number;
      avg_rating: number;
    }>;
  } | null;
  isLoading: boolean;
}

const COLORS = [
  "hsl(var(--accent))",
  "hsl(var(--primary))",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
];

export function ContentPerformanceSection({
  contentPerformance,
  isLoading,
}: ContentPerformanceSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  const mostWatched = contentPerformance?.most_watched || [];
  const mostReviewed = contentPerformance?.most_reviewed || [];

  // Mock completion data (in production, this would come from watch_history)
  const completionData = mostWatched.slice(0, 5).map((movie) => ({
    title: movie.title.length > 15 ? movie.title.slice(0, 15) + "..." : movie.title,
    completion_rate: Math.floor(Math.random() * 30 + 70),
    drop_off: Math.floor(Math.random() * 20 + 10),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Film className="w-6 h-6 text-accent" />
          Content Performance
        </h2>
        <p className="text-muted-foreground">
          Track movie and series performance metrics
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-3xl font-bold">
                  {mostWatched.reduce((acc, m) => acc + m.watch_count, 0).toLocaleString()}
                </p>
              </div>
              <Eye className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Movie</p>
                <p className="text-lg font-bold truncate max-w-[120px]">
                  {mostWatched[0]?.title || "N/A"}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-3xl font-bold">
                  {mostReviewed.length > 0
                    ? (
                        mostReviewed.reduce((acc, m) => acc + (m.avg_rating || 0), 0) /
                        mostReviewed.length
                      ).toFixed(1)
                    : "N/A"}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tracked Content</p>
                <p className="text-3xl font-bold">{mostWatched.length}</p>
              </div>
              <Film className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="watched" className="space-y-4">
        <TabsList>
          <TabsTrigger value="watched">Most Watched</TabsTrigger>
          <TabsTrigger value="reviewed">Most Reviewed</TabsTrigger>
          <TabsTrigger value="completion">Completion Rates</TabsTrigger>
        </TabsList>

        <TabsContent value="watched">
          <Card>
            <CardHeader>
              <CardTitle>Most Watched Movies</CardTitle>
              <CardDescription>Movies with highest view counts</CardDescription>
            </CardHeader>
            <CardContent>
              {mostWatched.length > 0 ? (
                <div className="space-y-4">
                  {mostWatched.slice(0, 10).map((movie, index) => (
                    <div
                      key={movie.movie_id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                        {index + 1}
                      </div>
                      <div className="w-12 h-16 rounded overflow-hidden bg-muted shrink-0">
                        {movie.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                            alt={movie.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{movie.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {movie.watch_count.toLocaleString()} views
                        </p>
                      </div>
                      <Badge variant="secondary">{movie.watch_count} views</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No watch data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviewed">
          <Card>
            <CardHeader>
              <CardTitle>Most Reviewed Movies</CardTitle>
              <CardDescription>Movies with highest review counts and ratings</CardDescription>
            </CardHeader>
            <CardContent>
              {mostReviewed.length > 0 ? (
                <div className="space-y-4">
                  {mostReviewed.slice(0, 10).map((movie, index) => (
                    <div
                      key={movie.movie_id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                        {index + 1}
                      </div>
                      <div className="w-12 h-16 rounded overflow-hidden bg-muted shrink-0">
                        {movie.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                            alt={movie.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{movie.title}</p>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span>{(movie.avg_rating || 0).toFixed(1)}</span>
                        </div>
                      </div>
                      <Badge variant="secondary">{movie.review_count} reviews</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No review data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completion">
          <Card>
            <CardHeader>
              <CardTitle>Completion Rates</CardTitle>
              <CardDescription>How much of each movie users typically watch</CardDescription>
            </CardHeader>
            <CardContent>
              {completionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={completionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="title" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="completion_rate" name="Completion %" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]}>
                      {completionData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-16">
                  No completion data available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
