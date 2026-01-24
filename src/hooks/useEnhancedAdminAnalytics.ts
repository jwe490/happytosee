import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface EnhancedStats {
  total_users: number;
  active_users_7d: number;
  active_users_30d: number;
  total_watchlist_items: number;
  total_mood_selections: number;
  total_reviews: number;
  new_users_7d: number;
  total_recommendations: number;
  trending_mood: string | null;
}

interface MoodAnalytics {
  mood_frequency: Array<{ mood: string; count: number; percentage: number }>;
  mood_by_day: Array<{ date: string; mood: string; count: number }>;
  total_selections: number;
}

interface ContentPerformance {
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
}

interface UserDemographics {
  by_gender: Array<{ gender: string; count: number }>;
  new_vs_returning: { new_users: number; returning_users: number };
  total_users: number;
}

interface ActorAnalytics {
  actor_id: number;
  actor_name: string;
  profile_path?: string;
  watch_count: number;
  popularity_score: number;
  avg_rating: number;
}

export function useEnhancedAdminAnalytics() {
  const [stats, setStats] = useState<EnhancedStats | null>(null);
  const [moodAnalytics, setMoodAnalytics] = useState<MoodAnalytics | null>(null);
  const [contentPerformance, setContentPerformance] = useState<ContentPerformance | null>(null);
  const [userDemographics, setUserDemographics] = useState<UserDemographics | null>(null);
  const [actorAnalytics, setActorAnalytics] = useState<ActorAnalytics[]>([]);
  const [moodData, setMoodData] = useState<Array<{ mood: string; count: number }>>([]);
  const [topWatchlisted, setTopWatchlisted] = useState<any[]>([]);
  const [topRecommended, setTopRecommended] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("weekly");

  const fetchAnalytics = useCallback(async (range: string = timeRange) => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all analytics in parallel
      const [statsRes, moodRes, contentRes, demoRes, trendingMoodsRes, watchlistedRes, recommendedRes] = await Promise.all([
        supabase.rpc("get_enhanced_admin_stats"),
        supabase.rpc("get_mood_analytics", { time_range: range }),
        supabase.rpc("get_content_performance_stats"),
        supabase.rpc("get_user_demographics_stats"),
        supabase.rpc("get_trending_moods", { time_range: range }),
        supabase.rpc("get_most_watchlisted_movies"),
        supabase.rpc("get_top_recommended_movies"),
      ]);

      if (statsRes.error) throw statsRes.error;
      if (moodRes.error) throw moodRes.error;
      if (contentRes.error) throw contentRes.error;
      if (demoRes.error) throw demoRes.error;

      setStats(statsRes.data as unknown as EnhancedStats);
      setMoodAnalytics(moodRes.data as unknown as MoodAnalytics);
      setContentPerformance(contentRes.data as unknown as ContentPerformance);
      setUserDemographics(demoRes.data as unknown as UserDemographics);
      setMoodData((trendingMoodsRes.data as any) || []);
      setTopWatchlisted((watchlistedRes.data as any) || []);
      setTopRecommended((recommendedRes.data as any) || []);

      // Fetch actor analytics from the table
      const { data: actorData } = await supabase
        .from("actor_analytics")
        .select("*")
        .order("popularity_score", { ascending: false })
        .limit(10);
      
      setActorAnalytics(actorData || []);
    } catch (err: any) {
      console.error("Error fetching enhanced analytics:", err);
      setError(err.message || "Failed to fetch analytics");
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
    fetchAnalytics(range);
  };

  return {
    stats,
    moodAnalytics,
    contentPerformance,
    demographics: userDemographics,
    actorAnalytics,
    moodData,
    topWatchlisted,
    topRecommended,
    isLoading,
    error,
    timeRange,
    setTimeRange: handleTimeRangeChange,
    refetch: fetchAnalytics,
  };
}
