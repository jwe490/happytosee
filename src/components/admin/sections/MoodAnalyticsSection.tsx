import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, Smile, Calendar, BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface MoodAnalyticsSectionProps {
  moodAnalytics: {
    mood_frequency: Array<{ mood: string; count: number; percentage: number }>;
    mood_by_day: Array<{ date: string; mood: string; count: number }>;
    total_selections: number;
  } | null;
  isLoading: boolean;
  onTimeRangeChange: (range: string) => void;
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

export function MoodAnalyticsSection({
  moodAnalytics,
  isLoading,
  onTimeRangeChange,
}: MoodAnalyticsSectionProps) {
  const [timeRange, setTimeRange] = useState("weekly");

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    onTimeRangeChange(value);
  };

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

  const moodFrequency = moodAnalytics?.mood_frequency || [];
  const maxCount = Math.max(...moodFrequency.map((m) => m.count), 1);

  // Process mood by day for line chart
  const moodByDayData = moodAnalytics?.mood_by_day || [];
  const uniqueDates = [...new Set(moodByDayData.map((d) => d.date))].sort();
  const lineChartData = uniqueDates.map((date) => {
    const dayData: any = { date: new Date(date).toLocaleDateString("en-US", { weekday: "short" }) };
    moodByDayData
      .filter((d) => d.date === date)
      .forEach((d) => {
        dayData[d.mood] = d.count;
      });
    return dayData;
  });

  // Pie chart data
  const pieData = moodFrequency.slice(0, 6).map((m) => ({
    name: m.mood,
    value: m.count,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Smile className="w-6 h-6 text-accent" />
            Mood Analytics
          </h2>
          <p className="text-muted-foreground">
            Track mood trends and user preferences over time
          </p>
        </div>
        <Select value={timeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Last 24 Hours</SelectItem>
            <SelectItem value="weekly">Last 7 Days</SelectItem>
            <SelectItem value="monthly">Last 30 Days</SelectItem>
            <SelectItem value="yearly">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Selections</p>
                <p className="text-3xl font-bold">{moodAnalytics?.total_selections || 0}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Mood</p>
                <p className="text-3xl font-bold capitalize">
                  {moodEmojis[moodFrequency[0]?.mood] || "🎬"} {moodFrequency[0]?.mood || "N/A"}
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
                <p className="text-sm text-muted-foreground">Unique Moods</p>
                <p className="text-3xl font-bold">{moodFrequency.length}</p>
              </div>
              <Smile className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="frequency" className="space-y-4">
        <TabsList>
          <TabsTrigger value="frequency">Frequency</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="frequency">
          <Card>
            <CardHeader>
              <CardTitle>Mood Frequency</CardTitle>
              <CardDescription>Number of times each mood was selected</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {moodFrequency.map((mood, index) => (
                  <div key={mood.mood} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{moodEmojis[mood.mood] || "🎬"}</span>
                        <span className="font-medium capitalize">{mood.mood}</span>
                        {index === 0 && (
                          <Badge variant="secondary" className="bg-accent/20 text-accent">
                            Top
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {mood.percentage?.toFixed(1) || 0}%
                        </span>
                        <span className="font-bold">{mood.count}</span>
                      </div>
                    </div>
                    <Progress value={(mood.count / maxCount) * 100} className="h-2" />
                  </div>
                ))}
                {moodFrequency.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No mood data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Mood Trends Over Time</CardTitle>
              <CardDescription>How mood preferences change day by day</CardDescription>
            </CardHeader>
            <CardContent>
              {lineChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    {moodFrequency.slice(0, 5).map((mood, index) => (
                      <Line
                        key={mood.mood}
                        type="monotone"
                        dataKey={mood.mood}
                        stroke={COLORS[index % COLORS.length]}
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-16">
                  Not enough data for trend analysis
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Mood Distribution</CardTitle>
              <CardDescription>Visual breakdown of mood preferences</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={150}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${moodEmojis[name] || "🎬"} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-16">No distribution data</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
