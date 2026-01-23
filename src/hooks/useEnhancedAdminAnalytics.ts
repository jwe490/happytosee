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

export function useEnhancedAdminAnalytics() {
  const [stats, setStats] = useState<EnhancedStats | null>(null);
  const [moodAnalytics, setMoodAnalytics] = useState<MoodAnalytics | null>(null);
  const [contentPerformance, setContentPerformance] = useState<ContentPerformance | null>(null);
  const [userDemographics, setUserDemographics] = useState<UserDemographics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (timeRange: string = "weekly") => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all analytics in parallel
      const [statsRes, moodRes, contentRes, demoRes] = await Promise.all([
        supabase.rpc("get_enhanced_admin_stats"),
        supabase.rpc("get_mood_analytics", { time_range: timeRange }),
        supabase.rpc("get_content_performance_stats"),
        supabase.rpc("get_user_demographics_stats"),
      ]);

      if (statsRes.error) throw statsRes.error;
      if (moodRes.error) throw moodRes.error;
      if (contentRes.error) throw contentRes.error;
      if (demoRes.error) throw demoRes.error;

      setStats(statsRes.data as unknown as EnhancedStats);
      setMoodAnalytics(moodRes.data as unknown as MoodAnalytics);
      setContentPerformance(contentRes.data as unknown as ContentPerformance);
      setUserDemographics(demoRes.data as unknown as UserDemographics);
    } catch (err: any) {
      console.error("Error fetching enhanced analytics:", err);
      setError(err.message || "Failed to fetch analytics");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    stats,
    moodAnalytics,
    contentPerformance,
    userDemographics,
    isLoading,
    error,
    refetch: fetchAnalytics,
  };
}
