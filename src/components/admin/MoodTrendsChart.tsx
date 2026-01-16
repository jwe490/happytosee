import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Smile } from "lucide-react";

interface MoodData {
  mood: string;
  count: number;
}

interface MoodTrendsChartProps {
  data: MoodData[];
  isLoading?: boolean;
}

const moodEmojis: Record<string, string> = {
  happy: "😊",
  sad: "😢",
  excited: "🤩",
  relaxed: "😌",
  romantic: "💕",
  adventurous: "🚀",
  nostalgic: "🥹",
  thrilling: "😱",
  thoughtful: "🤔",
  funny: "😂",
  dark: "🌑",
  inspiring: "✨",
};

export function MoodTrendsChart({ data, isLoading }: MoodTrendsChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Trending Moods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-10 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Trending Moods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Smile className="w-12 h-12 mb-2 opacity-50" />
            <p>No mood data yet</p>
            <p className="text-sm">Mood selections will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Trending Moods
          <Badge variant="secondary" className="ml-auto">
            This Week
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage = (item.count / maxCount) * 100;
            const emoji = moodEmojis[item.mood.toLowerCase()] || "🎬";

            return (
              <div key={item.mood} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{emoji}</span>
                    <span className="font-medium capitalize">{item.mood}</span>
                    {index === 0 && (
                      <Badge className="bg-primary/20 text-primary text-xs">
                        Top Mood
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {item.count} selections
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
