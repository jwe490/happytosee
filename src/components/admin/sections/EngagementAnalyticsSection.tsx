import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, MousePointer, Clock, TrendingUp, Eye, Film, Search, Smile } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";

interface EngagementData {
  pageViews: number;
  uniqueVisitors: number;
  avgSessionDuration: number;
  movieClicks: number;
  moodSelections: number;
  searches: number;
  dailyData: Array<{ date: string; views: number; visitors: number }>;
  topPages: Array<{ path: string; views: number }>;
  eventBreakdown: Array<{ type: string; count: number }>;
}

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];

export function EngagementAnalyticsSection() {
  const [data, setData] = useState<EngagementData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d">("7d");

  useEffect(() => {
    fetchEngagementData();
  }, [timeRange]);

  const fetchEngagementData = async () => {
    setIsLoading(true);
    
    try {
      const days = timeRange === "7d" ? 7 : 30;
      const startDate = startOfDay(subDays(new Date(), days));

      // Fetch all engagement data for the period
      const { data: events, error } = await supabase
        .from("user_engagement")
        .select("*")
        .gte("created_at", startDate.toISOString());

      if (error) throw error;

      // Process the data
      const uniqueSessions = new Set(events?.map(e => e.session_id) || []);
      const pageViews = events?.filter(e => e.event_type === "page_view").length || 0;
      const movieClicks = events?.filter(e => ["movie_click", "movie_view"].includes(e.event_type)).length || 0;
      const moodSelections = events?.filter(e => e.event_type === "mood_select").length || 0;
      const searches = events?.filter(e => e.event_type === "search").length || 0;

      // Calculate average session duration
      const durations = events?.filter(e => e.duration_ms).map(e => e.duration_ms!) || [];
      const avgDuration = durations.length > 0 
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length / 1000) 
        : 0;

      // Daily breakdown
      const dailyMap: Record<string, { views: number; sessions: Set<string> }> = {};
      for (let i = 0; i < days; i++) {
        const date = format(subDays(new Date(), i), "MMM dd");
        dailyMap[date] = { views: 0, sessions: new Set() };
      }
      
      events?.forEach(event => {
        const date = format(new Date(event.created_at), "MMM dd");
        if (dailyMap[date]) {
          if (event.event_type === "page_view") {
            dailyMap[date].views++;
          }
          dailyMap[date].sessions.add(event.session_id);
        }
      });

      const dailyData = Object.entries(dailyMap)
        .map(([date, d]) => ({
          date,
          views: d.views,
          visitors: d.sessions.size,
        }))
        .reverse();

      // Top pages
      const pageMap: Record<string, number> = {};
      events?.filter(e => e.event_type === "page_view").forEach(e => {
        pageMap[e.page_path] = (pageMap[e.page_path] || 0) + 1;
      });
      const topPages = Object.entries(pageMap)
        .map(([path, views]) => ({ path, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      // Event type breakdown
      const eventMap: Record<string, number> = {};
      events?.forEach(e => {
        eventMap[e.event_type] = (eventMap[e.event_type] || 0) + 1;
      });
      const eventBreakdown = Object.entries(eventMap)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);

      setData({
        pageViews,
        uniqueVisitors: uniqueSessions.size,
        avgSessionDuration: avgDuration,
        movieClicks,
        moodSelections,
        searches,
        dailyData,
        topPages,
        eventBreakdown,
      });
    } catch (error) {
      console.error("Error fetching engagement data:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const formatEventType = (type: string) => {
    return type
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Engagement Analytics
          </h2>
          <p className="text-sm text-muted-foreground">User interaction tracking and behavior insights</p>
        </div>
        
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as "7d" | "30d")}>
          <TabsList className="h-8">
            <TabsTrigger value="7d" className="text-xs">7 Days</TabsTrigger>
            <TabsTrigger value="30d" className="text-xs">30 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Page Views</p>
                <p className="text-2xl font-semibold">{data?.pageViews.toLocaleString() || 0}</p>
              </div>
              <Eye className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Unique Visitors</p>
                <p className="text-2xl font-semibold">{data?.uniqueVisitors.toLocaleString() || 0}</p>
              </div>
              <MousePointer className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Movie Clicks</p>
                <p className="text-2xl font-semibold">{data?.movieClicks.toLocaleString() || 0}</p>
              </div>
              <Film className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Mood Selections</p>
                <p className="text-2xl font-semibold">{data?.moodSelections.toLocaleString() || 0}</p>
              </div>
              <Smile className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Traffic Over Time */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Traffic Over Time</CardTitle>
            <CardDescription className="text-xs">Daily page views and unique visitors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.dailyData || []}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={10}
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
                    dataKey="views" 
                    stroke="#6366f1" 
                    fill="url(#colorViews)" 
                    strokeWidth={2}
                    name="Page Views"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="#22c55e" 
                    fill="url(#colorVisitors)" 
                    strokeWidth={2}
                    name="Visitors"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Event Type Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Event Distribution</CardTitle>
            <CardDescription className="text-xs">Breakdown by event type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center">
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.eventBreakdown.slice(0, 6) || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={65}
                    dataKey="count"
                    nameKey="type"
                  >
                    {data?.eventBreakdown.slice(0, 6).map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                    formatter={(value, name) => [value, formatEventType(name as string)]}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="flex-1 space-y-1.5">
                {data?.eventBreakdown.slice(0, 6).map((event, index) => (
                  <div key={event.type} className="flex items-center gap-2 text-xs">
                    <div 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="flex-1 truncate text-muted-foreground">
                      {formatEventType(event.type)}
                    </span>
                    <span className="font-medium">{event.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Pages */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Top Pages</CardTitle>
          <CardDescription className="text-xs">Most visited pages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data?.topPages.map((page, index) => {
              const maxViews = data.topPages[0]?.views || 1;
              const percentage = (page.views / maxViews) * 100;
              
              return (
                <div key={page.path} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate text-muted-foreground">{page.path}</span>
                    <span className="font-medium">{page.views}</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
            
            {(!data?.topPages || data.topPages.length === 0) && (
              <p className="text-center text-muted-foreground text-sm py-4">
                No page view data yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
