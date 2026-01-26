import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Film, TrendingUp, TrendingDown, Minus, Flame, Clapperboard } from "lucide-react";
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
  PieChart,
  Pie,
  AreaChart,
  Area,
} from "recharts";

interface GenreAnalyticsSectionProps {
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
  "#f97316",
];

const genreIcons: Record<string, string> = {
  action: "💥",
  comedy: "😂",
  drama: "🎭",
  horror: "👻",
  romance: "💕",
  thriller: "🔪",
  scifi: "🚀",
  fantasy: "🧙",
  animation: "🎨",
  documentary: "📹",
  mystery: "🔍",
  adventure: "🏔️",
};

// Mock genre data - in production, this would come from the database
const mockGenreData = [
  { genre: "Action", count: 2450, percentage: 18.5, trend: 12, emoji: "💥" },
  { genre: "Drama", count: 2120, percentage: 16.0, trend: 5, emoji: "🎭" },
  { genre: "Comedy", count: 1890, percentage: 14.3, trend: -3, emoji: "😂" },
  { genre: "Thriller", count: 1650, percentage: 12.5, trend: 8, emoji: "🔪" },
  { genre: "Romance", count: 1420, percentage: 10.7, trend: -2, emoji: "💕" },
  { genre: "Sci-Fi", count: 1180, percentage: 8.9, trend: 15, emoji: "🚀" },
  { genre: "Horror", count: 980, percentage: 7.4, trend: 20, emoji: "👻" },
  { genre: "Fantasy", count: 850, percentage: 6.4, trend: 10, emoji: "🧙" },
  { genre: "Animation", count: 420, percentage: 3.2, trend: 25, emoji: "🎨" },
  { genre: "Documentary", count: 280, percentage: 2.1, trend: 7, emoji: "📹" },
];

const mockGenreTrendData = [
  { day: "Mon", Action: 350, Drama: 280, Comedy: 220, Thriller: 180, Horror: 120 },
  { day: "Tue", Action: 380, Drama: 320, Comedy: 250, Thriller: 200, Horror: 140 },
  { day: "Wed", Action: 420, Drama: 350, Comedy: 280, Thriller: 220, Horror: 160 },
  { day: "Thu", Action: 390, Drama: 310, Comedy: 260, Thriller: 240, Horror: 180 },
  { day: "Fri", Action: 480, Drama: 380, Comedy: 320, Thriller: 280, Horror: 220 },
  { day: "Sat", Action: 550, Drama: 420, Comedy: 380, Thriller: 320, Horror: 280 },
  { day: "Sun", Action: 520, Drama: 400, Comedy: 350, Thriller: 300, Horror: 250 },
];

const mockRegionalGenreData = [
  { region: "Hollywood", topGenre: "Action", count: 4500 },
  { region: "Bollywood", topGenre: "Drama", count: 3200 },
  { region: "Tollywood", topGenre: "Action", count: 2100 },
  { region: "Kollywood", topGenre: "Thriller", count: 1800 },
  { region: "Korean", topGenre: "Romance", count: 1500 },
];

export function GenreAnalyticsSection({ isLoading }: GenreAnalyticsSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const topGenre = mockGenreData[0];
  const fastestGrowing = [...mockGenreData].sort((a, b) => b.trend - a.trend)[0];
  const totalViews = mockGenreData.reduce((acc, g) => acc + g.count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Clapperboard className="w-6 h-6 text-accent" />
          Genre Analytics
        </h2>
        <p className="text-muted-foreground">
          Track genre popularity and discover trending categories
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-accent/10 to-transparent border-accent/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Genre</p>
                <p className="text-2xl font-bold flex items-center gap-2">
                  {topGenre.emoji} {topGenre.genre}
                </p>
                <p className="text-xs text-accent flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +{topGenre.trend}% this week
                </p>
              </div>
              <Film className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fastest Growing</p>
                <p className="text-2xl font-bold flex items-center gap-2">
                  {fastestGrowing.emoji} {fastestGrowing.genre}
                </p>
                <p className="text-xs text-primary flex items-center gap-1 mt-1">
                  <Flame className="w-3 h-3" />
                  +{fastestGrowing.trend}% growth
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Genre Views</p>
                <p className="text-3xl font-bold">{totalViews.toLocaleString()}</p>
              </div>
              <Film className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Genres</p>
                <p className="text-3xl font-bold">{mockGenreData.length}</p>
              </div>
              <Clapperboard className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="popularity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="popularity">Popularity</TabsTrigger>
          <TabsTrigger value="trends">Weekly Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="regional">Regional</TabsTrigger>
        </TabsList>

        <TabsContent value="popularity">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Genre Popularity Ranking</CardTitle>
                <CardDescription>Based on user watch counts and selections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockGenreData.map((genre, index) => (
                    <div key={genre.genre} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{genre.emoji}</span>
                          <span className="font-medium">{genre.genre}</span>
                          {index === 0 && (
                            <Badge variant="secondary" className="bg-accent/20 text-accent">
                              #1
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm flex items-center gap-1 ${
                            genre.trend > 0 ? "text-green-500" : genre.trend < 0 ? "text-red-500" : "text-muted-foreground"
                          }`}>
                            {genre.trend > 0 ? <TrendingUp className="w-3 h-3" /> : 
                             genre.trend < 0 ? <TrendingDown className="w-3 h-3" /> : 
                             <Minus className="w-3 h-3" />}
                            {genre.trend > 0 ? "+" : ""}{genre.trend}%
                          </span>
                          <span className="font-bold">{genre.count.toLocaleString()}</span>
                        </div>
                      </div>
                      <Progress 
                        value={(genre.count / mockGenreData[0].count) * 100} 
                        className="h-2" 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Genre Distribution</CardTitle>
                <CardDescription>Visual breakdown of genre preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={mockGenreData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                    <YAxis
                      type="category"
                      dataKey="genre"
                      stroke="hsl(var(--muted-foreground))"
                      width={80}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [value.toLocaleString(), "Views"]}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {mockGenreData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Genre Trends</CardTitle>
              <CardDescription>How genre preferences change throughout the week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={mockGenreTrendData}>
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
                  <Area type="monotone" dataKey="Action" stackId="1" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.6} />
                  <Area type="monotone" dataKey="Drama" stackId="1" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.6} />
                  <Area type="monotone" dataKey="Comedy" stackId="1" stroke={COLORS[2]} fill={COLORS[2]} fillOpacity={0.6} />
                  <Area type="monotone" dataKey="Thriller" stackId="1" stroke={COLORS[3]} fill={COLORS[3]} fillOpacity={0.6} />
                  <Area type="monotone" dataKey="Horror" stackId="1" stroke={COLORS[4]} fill={COLORS[4]} fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-4 mt-4 justify-center">
                {["Action", "Drama", "Comedy", "Thriller", "Horror"].map((genre, i) => (
                  <div key={genre} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-sm text-muted-foreground">{genre}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Genre Share Distribution</CardTitle>
              <CardDescription>Percentage breakdown of genre preferences</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={mockGenreData.slice(0, 8)}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={150}
                    paddingAngle={2}
                    dataKey="count"
                    label={({ genre, percentage }) => `${genre}: ${percentage}%`}
                  >
                    {mockGenreData.slice(0, 8).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [value.toLocaleString(), "Views"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional">
          <Card>
            <CardHeader>
              <CardTitle>Genre Popularity by Region</CardTitle>
              <CardDescription>Top genre preferences across different film industries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {mockRegionalGenreData.map((region, index) => (
                  <Card key={region.region} className="bg-muted/30 border-border/50">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-3">
                        <div 
                          className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl"
                          style={{ backgroundColor: `${COLORS[index % COLORS.length]}20` }}
                        >
                          {mockGenreData.find(g => g.genre === region.topGenre)?.emoji || "🎬"}
                        </div>
                        <div>
                          <p className="font-semibold">{region.region}</p>
                          <p className="text-sm text-muted-foreground">Top: {region.topGenre}</p>
                          <p className="text-lg font-bold mt-1">{region.count.toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
