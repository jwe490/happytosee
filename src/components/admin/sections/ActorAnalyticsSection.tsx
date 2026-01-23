import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, TrendingUp, Users, Film } from "lucide-react";
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

interface ActorAnalyticsSectionProps {
  actorData: Array<{
    actor_id: number;
    actor_name: string;
    profile_path?: string;
    watch_count: number;
    popularity_score: number;
    avg_rating: number;
  }>;
  isLoading: boolean;
}

const COLORS = [
  "hsl(var(--accent))",
  "hsl(var(--primary))",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
];

export function ActorAnalyticsSection({ actorData, isLoading }: ActorAnalyticsSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  // Mock data for demonstration (in production, this would come from the database)
  const mockActorData = [
    { actor_id: 1, actor_name: "Timothée Chalamet", watch_count: 1250, popularity_score: 95.5, avg_rating: 4.5 },
    { actor_id: 2, actor_name: "Margot Robbie", watch_count: 1180, popularity_score: 92.3, avg_rating: 4.3 },
    { actor_id: 3, actor_name: "Cillian Murphy", watch_count: 1050, popularity_score: 88.7, avg_rating: 4.6 },
    { actor_id: 4, actor_name: "Florence Pugh", watch_count: 980, popularity_score: 86.2, avg_rating: 4.4 },
    { actor_id: 5, actor_name: "Pedro Pascal", watch_count: 920, popularity_score: 84.5, avg_rating: 4.5 },
  ];

  const displayData = actorData.length > 0 ? actorData : mockActorData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Star className="w-6 h-6 text-accent" />
          Actor Analytics
        </h2>
        <p className="text-muted-foreground">
          Track actor popularity and performance metrics
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Actor</p>
                <p className="text-xl font-bold">{displayData[0]?.actor_name || "N/A"}</p>
              </div>
              <Star className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">
                  {displayData.reduce((acc, a) => acc + a.watch_count, 0).toLocaleString()}
                </p>
              </div>
              <Film className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">
                  {(displayData.reduce((acc, a) => acc + a.avg_rating, 0) / displayData.length).toFixed(1)}
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
                <p className="text-sm text-muted-foreground">Tracked Actors</p>
                <p className="text-2xl font-bold">{displayData.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="popularity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="popularity">Popularity</TabsTrigger>
          <TabsTrigger value="ratings">Ratings</TabsTrigger>
          <TabsTrigger value="watch-count">Watch Count</TabsTrigger>
        </TabsList>

        <TabsContent value="popularity">
          <Card>
            <CardHeader>
              <CardTitle>Actor Popularity Scores</CardTitle>
              <CardDescription>Based on watch counts, ratings, and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={displayData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis
                    type="category"
                    dataKey="actor_name"
                    stroke="hsl(var(--muted-foreground))"
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="popularity_score" radius={[0, 4, 4, 0]}>
                    {displayData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ratings">
          <Card>
            <CardHeader>
              <CardTitle>Average Ratings</CardTitle>
              <CardDescription>User ratings for movies featuring each actor</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={displayData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 5]} stroke="hsl(var(--muted-foreground))" />
                  <YAxis
                    type="category"
                    dataKey="actor_name"
                    stroke="hsl(var(--muted-foreground))"
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="avg_rating" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="watch-count">
          <Card>
            <CardHeader>
              <CardTitle>Watch Counts</CardTitle>
              <CardDescription>Total views for movies featuring each actor</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={displayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="actor_name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="watch_count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actor List */}
      <Card>
        <CardHeader>
          <CardTitle>Trending Actors</CardTitle>
          <CardDescription>Actors ranked by popularity score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayData.map((actor, index) => (
              <div
                key={actor.actor_id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{actor.actor_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {actor.watch_count.toLocaleString()} views
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{actor.avg_rating.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">avg rating</p>
                  </div>
                  <Badge variant="secondary">{actor.popularity_score.toFixed(0)} pts</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
