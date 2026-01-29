import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface RealTimeStats {
  activeUsers: number;
  hourlyActiveUsers: number;
  dailyActiveUsers: number;
  pageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
  topPages: Array<{ path: string; views: number }>;
  topMovies: Array<{ id: number; title: string; clicks: number }>;
  recentEvents: Array<{
    id: string;
    event_type: string;
    page_path: string;
    created_at: string;
    movie_title?: string;
  }>;
  moodSelections: Record<string, number>;
  searchQueries: Array<{ query: string; count: number }>;
  // Comparison data
  comparison: {
    usersChange: number;
    viewsChange: number;
    durationChange: number;
  };
}

const defaultStats: RealTimeStats = {
  activeUsers: 0,
  hourlyActiveUsers: 0,
  dailyActiveUsers: 0,
  pageViews: 0,
  avgSessionDuration: 0,
  bounceRate: 0,
  topPages: [],
  topMovies: [],
  recentEvents: [],
  moodSelections: {},
  searchQueries: [],
  comparison: {
    usersChange: 0,
    viewsChange: 0,
    durationChange: 0,
  },
};

export function useRealTimeAnalytics(refreshInterval = 5000) {
  const [stats, setStats] = useState<RealTimeStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

      // Fetch multiple queries in parallel
      const [
        recentEventsRes,
        hourlyUsersRes,
        dailyUsersRes,
        pageViewsRes,
        moodSelectionsRes,
        topMoviesRes,
        yesterdayRes,
      ] = await Promise.all([
        // Recent events (last 50)
        supabase
          .from("user_engagement")
          .select("id, event_type, page_path, created_at, movie_title")
          .order("created_at", { ascending: false })
          .limit(50),
        
        // Active users in last hour (unique sessions)
        supabase
          .from("user_engagement")
          .select("session_id")
          .gte("created_at", oneHourAgo.toISOString()),
        
        // Active users in last 24 hours
        supabase
          .from("user_engagement")
          .select("session_id")
          .gte("created_at", oneDayAgo.toISOString()),
        
        // Page views today
        supabase
          .from("user_engagement")
          .select("page_path, id")
          .eq("event_type", "page_view")
          .gte("created_at", oneDayAgo.toISOString()),
        
        // Mood selections today
        supabase
          .from("user_engagement")
          .select("metadata")
          .eq("event_type", "mood_select")
          .gte("created_at", oneDayAgo.toISOString()),
        
        // Top clicked movies
        supabase
          .from("user_engagement")
          .select("movie_id, movie_title")
          .in("event_type", ["movie_click", "movie_view"])
          .gte("created_at", oneDayAgo.toISOString())
          .not("movie_id", "is", null),
        
        // Yesterday's stats for comparison
        supabase
          .from("user_engagement")
          .select("session_id, event_type")
          .gte("created_at", twoDaysAgo.toISOString())
          .lt("created_at", oneDayAgo.toISOString()),
      ]);

      // Process hourly users (unique sessions)
      const hourlyUniqueSessions = new Set(
        hourlyUsersRes.data?.map(e => e.session_id) || []
      );
      
      // Process daily users
      const dailyUniqueSessions = new Set(
        dailyUsersRes.data?.map(e => e.session_id) || []
      );

      // Process page views
      const pageViewCount = pageViewsRes.data?.length || 0;
      const pagePathCounts: Record<string, number> = {};
      pageViewsRes.data?.forEach(e => {
        pagePathCounts[e.page_path] = (pagePathCounts[e.page_path] || 0) + 1;
      });
      const topPages = Object.entries(pagePathCounts)
        .map(([path, views]) => ({ path, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      // Process mood selections
      const moodCounts: Record<string, number> = {};
      moodSelectionsRes.data?.forEach(e => {
        const metadata = e.metadata as { mood?: string } | null;
        if (metadata?.mood) {
          moodCounts[metadata.mood] = (moodCounts[metadata.mood] || 0) + 1;
        }
      });

      // Process top movies
      const movieCounts: Record<number, { title: string; clicks: number }> = {};
      topMoviesRes.data?.forEach(e => {
        if (e.movie_id) {
          if (!movieCounts[e.movie_id]) {
            movieCounts[e.movie_id] = { title: e.movie_title || "Unknown", clicks: 0 };
          }
          movieCounts[e.movie_id].clicks++;
        }
      });
      const topMovies = Object.entries(movieCounts)
        .map(([id, data]) => ({ id: parseInt(id), ...data }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 10);

      // Calculate comparison with yesterday
      const yesterdayUniqueSessions = new Set(
        yesterdayRes.data?.map(e => e.session_id) || []
      );
      const yesterdayPageViews = yesterdayRes.data?.filter(
        e => e.event_type === "page_view"
      ).length || 0;

      const usersChange = yesterdayUniqueSessions.size > 0
        ? ((dailyUniqueSessions.size - yesterdayUniqueSessions.size) / yesterdayUniqueSessions.size) * 100
        : 0;
      const viewsChange = yesterdayPageViews > 0
        ? ((pageViewCount - yesterdayPageViews) / yesterdayPageViews) * 100
        : 0;

      // Calculate session duration and bounce rate
      const sessionEvents: Record<string, { first: Date; last: Date; pageCount: number }> = {};
      dailyUsersRes.data?.forEach(() => {
        // This would need full event data to calculate properly
      });

      // Estimate active users currently online (sessions active in last 5 min)
      const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const activeNowRes = await supabase
        .from("user_engagement")
        .select("session_id")
        .gte("created_at", fiveMinAgo.toISOString());
      
      const activeNowSessions = new Set(
        activeNowRes.data?.map(e => e.session_id) || []
      );

      setStats({
        activeUsers: activeNowSessions.size,
        hourlyActiveUsers: hourlyUniqueSessions.size,
        dailyActiveUsers: dailyUniqueSessions.size,
        pageViews: pageViewCount,
        avgSessionDuration: 0, // Would need duration_ms tracking
        bounceRate: 0, // Would need proper session tracking
        topPages,
        topMovies,
        recentEvents: recentEventsRes.data || [],
        moodSelections: moodCounts,
        searchQueries: [],
        comparison: {
          usersChange: Math.round(usersChange),
          viewsChange: Math.round(viewsChange),
          durationChange: 0,
        },
      });

      setLastUpdate(new Date());
      setError(null);
    } catch (err: any) {
      console.error("Error fetching real-time stats:", err);
      setError(err.message || "Failed to fetch analytics");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Polling interval
  useEffect(() => {
    const interval = setInterval(fetchStats, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchStats, refreshInterval]);

  // Real-time subscription for instant updates
  useEffect(() => {
    const channel = supabase
      .channel("analytics-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_engagement",
        },
        (payload) => {
          // Optimistically update on new events
          setStats(prev => ({
            ...prev,
            recentEvents: [payload.new as any, ...prev.recentEvents].slice(0, 50),
            pageViews: payload.new.event_type === "page_view" 
              ? prev.pageViews + 1 
              : prev.pageViews,
          }));
          setLastUpdate(new Date());
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  return {
    stats,
    isLoading,
    error,
    lastUpdate,
    refresh: fetchStats,
  };
}
