import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, TrendingUp, TrendingDown, Users, Film, Flame, Award } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
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
  "#06b6d4",
  "#84cc16",
];

// Mock actor trend data for line chart
const mockActorTrendData = [
  { day: "Mon", "Shah Rukh Khan": 450, "Allu Arjun": 380, "Vijay": 320, "Prabhas": 290, "Mahesh Babu": 260 },
  { day: "Tue", "Shah Rukh Khan": 480, "Allu Arjun": 420, "Vijay": 350, "Prabhas": 310, "Mahesh Babu": 280 },
  { day: "Wed", "Shah Rukh Khan": 520, "Allu Arjun": 450, "Vijay": 380, "Prabhas": 340, "Mahesh Babu": 300 },
  { day: "Thu", "Shah Rukh Khan": 490, "Allu Arjun": 410, "Vijay": 360, "Prabhas": 320, "Mahesh Babu": 290 },
  { day: "Fri", "Shah Rukh Khan": 580, "Allu Arjun": 520, "Vijay": 420, "Prabhas": 380, "Mahesh Babu": 340 },
  { day: "Sat", "Shah Rukh Khan": 650, "Allu Arjun": 580, "Vijay": 480, "Prabhas": 420, "Mahesh Babu": 380 },
  { day: "Sun", "Shah Rukh Khan": 620, "Allu Arjun": 550, "Vijay": 450, "Prabhas": 400, "Mahesh Babu": 360 },
];

// Mock data for demonstration
const mockActorData = [
  { actor_id: 1, actor_name: "Shah Rukh Khan", watch_count: 12500, popularity_score: 98.5, avg_rating: 4.7, trend: 15, region: "Bollywood" },
  { actor_id: 2, actor_name: "Allu Arjun", watch_count: 11800, popularity_score: 96.3, avg_rating: 4.6, trend: 28, region: "Tollywood" },
  { actor_id: 3, actor_name: "Vijay", watch_count: 10500, popularity_score: 94.7, avg_rating: 4.5, trend: 22, region: "Kollywood" },
  { actor_id: 4, actor_name: "Prabhas", watch_count: 9800, popularity_score: 92.2, avg_rating: 4.6, trend: 18, region: "Tollywood" },
  { actor_id: 5, actor_name: "Mahesh Babu", watch_count: 9200, popularity_score: 90.5, avg_rating: 4.5, trend: 12, region: "Tollywood" },
  { actor_id: 6, actor_name: "Hrithik Roshan", watch_count: 8500, popularity_score: 88.3, avg_rating: 4.4, trend: 8, region: "Bollywood" },
  { actor_id: 7, actor_name: "Dhanush", watch_count: 7800, popularity_score: 86.1, avg_rating: 4.5, trend: 20, region: "Kollywood" },
  { actor_id: 8, actor_name: "Ram Charan", watch_count: 7200, popularity_score: 84.5, avg_rating: 4.4, trend: 25, region: "Tollywood" },
];

export function ActorAnalyticsSection({ actorData, isLoading }: ActorAnalyticsSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const displayData = actorData.length > 0 
    ? actorData.map((a, i) => ({ ...a, trend: mockActorData[i]?.trend || 0, region: mockActorData[i]?.region || "Unknown" }))
    : mockActorData;
  
  const topActor = displayData[0];
  const fastestRising = [...displayData].sort((a, b) => b.trend - a.trend)[0];
  const totalViews = displayData.reduce((acc, a) => acc + a.watch_count, 0);
  const avgRating = displayData.reduce((acc, a) => acc + a.avg_rating, 0) / displayData.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Star className="w-6 h-6 text-accent" />
          Actor Analytics
        </h2>
        <p className="text-muted-foreground">
          Track actor popularity, trends, and performance metrics across regions
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-transparent border-yellow-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Actor</p>
                <p className="text-xl font-bold">{topActor?.actor_name || "N/A"}</p>
                <p className="text-xs text-yellow-500 flex items-center gap-1 mt-1">
                  <Award className="w-3 h-3" />
                  {topActor?.watch_count?.toLocaleString()} views
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fastest Rising</p>
                <p className="text-xl font-bold">{fastestRising?.actor_name || "N/A"}</p>
                <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                  <Flame className="w-3 h-3" />
                  +{fastestRising?.trend}% this week
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
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
                <p className="text-2xl font-bold flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  {avgRating.toFixed(1)}
                </p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Weekly Trends</TabsTrigger>
          <TabsTrigger value="popularity">Popularity</TabsTrigger>
          <TabsTrigger value="ratings">Ratings</TabsTrigger>
          <TabsTrigger value="regional">By Region</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Actor Popularity Trends</CardTitle>
              <CardDescription>How actor search/watch counts change over the week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={mockActorTrendData}>
                  <defs>
                    {displayData.slice(0, 5).map((actor, index) => (
                      <linearGradient key={actor.actor_name} id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0}/>
                      </linearGradient>
                    ))}
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
                  {displayData.slice(0, 5).map((actor, index) => (
                    <Area
                      key={actor.actor_name}
                      type="monotone"
                      dataKey={actor.actor_name}
                      stroke={COLORS[index % COLORS.length]}
                      fill={`url(#color${index})`}
                      strokeWidth={2}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-4 mt-4 justify-center">
                {displayData.slice(0, 5).map((actor, index) => (
                  <div key={actor.actor_name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-sm text-muted-foreground">{actor.actor_name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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

        <TabsContent value="regional">
          <Card>
            <CardHeader>
              <CardTitle>Actors by Region</CardTitle>
              <CardDescription>Popular actors segmented by film industry</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {["Bollywood", "Tollywood", "Kollywood"].map((region) => {
                  const regionActors = displayData.filter(a => a.region === region);
                  return (
                    <Card key={region} className="bg-muted/30 border-border/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Film className="w-4 h-4" />
                          {region}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {regionActors.slice(0, 3).map((actor, index) => (
                          <div 
                            key={actor.actor_id} 
                            className="flex items-center justify-between p-2 rounded-lg bg-background/50"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </span>
                              <span className="font-medium text-sm">{actor.actor_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs flex items-center gap-0.5 ${
                                actor.trend > 0 ? "text-green-500" : "text-red-500"
                              }`}>
                                {actor.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {actor.trend}%
                              </span>
                            </div>
                          </div>
                        ))}
                        {regionActors.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">No actors tracked</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actor List */}
      <Card>
        <CardHeader>
          <CardTitle>Trending Actors</CardTitle>
          <CardDescription>Actors ranked by popularity score with weekly trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {displayData.map((actor, index) => (
              <div
                key={actor.actor_id}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? "bg-yellow-500/20 text-yellow-500" :
                    index === 1 ? "bg-gray-400/20 text-gray-400" :
                    index === 2 ? "bg-orange-500/20 text-orange-500" :
                    "bg-primary/10 text-primary"
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{actor.actor_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {actor.watch_count.toLocaleString()} views · {actor.region}
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
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    actor.trend > 15 ? "bg-green-500/20 text-green-500" :
                    actor.trend > 0 ? "bg-blue-500/20 text-blue-500" :
                    "bg-red-500/20 text-red-500"
                  }`}>
                    {actor.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {actor.trend > 0 ? "+" : ""}{actor.trend}%
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
