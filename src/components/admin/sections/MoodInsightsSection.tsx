import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Smile, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

interface MoodInsightsSectionProps {
  moodAnalytics: {
    mood_frequency: Array<{ mood: string; count: number; percentage: number }>;
    total_selections: number;
  } | null;
  moodData: Array<{ mood: string; count: number }>;
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

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
];

export function MoodInsightsSection({ moodAnalytics, moodData, isLoading }: MoodInsightsSectionProps) {
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

  const moodFrequency = moodAnalytics?.mood_frequency || moodData.map((m, i) => ({
    mood: m.mood,
    count: m.count,
    percentage: 0,
  }));
  
  const totalSelections = moodAnalytics?.total_selections || moodData.reduce((acc, m) => acc + m.count, 0);
  const maxCount = Math.max(...moodFrequency.map((m) => m.count), 1);
  const topMood = moodFrequency[0];

  // Prepare pie chart data
  const pieData = moodFrequency.slice(0, 6).map((m) => ({
    name: m.mood,
    value: m.count,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Smile className="w-5 h-5" />
          Mood Insights
        </h2>
        <p className="text-sm text-muted-foreground">What moods are users selecting for movie recommendations</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Selections</p>
                <p className="text-2xl font-semibold">{totalSelections}</p>
              </div>
              <Smile className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Top Mood</p>
                <p className="text-xl font-semibold capitalize flex items-center gap-1">
                  {moodEmojis[topMood?.mood] || "🎬"}
                  {topMood?.mood || "N/A"}
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Unique Moods</p>
                <p className="text-2xl font-semibold">{moodFrequency.length}</p>
              </div>
              <Smile className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Top Mood %</p>
                <p className="text-2xl font-semibold">
                  {totalSelections > 0 ? ((topMood?.count || 0) / totalSelections * 100).toFixed(0) : 0}%
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Mood Distribution Chart */}
        {pieData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Mood Distribution</CardTitle>
              <CardDescription className="text-xs">Most selected moods by users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-36 h-36 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {pieData.slice(0, 4).map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div 
                        className="w-2.5 h-2.5 rounded-full shrink-0" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                      />
                      <span className="text-sm capitalize truncate">{item.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mood Frequency List */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">All Moods</CardTitle>
            <CardDescription className="text-xs">Complete breakdown of user mood selections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {moodFrequency.slice(0, 6).map((mood) => (
              <div key={mood.mood} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{moodEmojis[mood.mood] || "🎬"}</span>
                    <span className="text-sm capitalize">{mood.mood}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{mood.count}</span>
                </div>
                <Progress value={(mood.count / maxCount) * 100} className="h-1.5" />
              </div>
            ))}
            {moodFrequency.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No mood data yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
