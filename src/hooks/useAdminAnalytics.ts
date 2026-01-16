import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminStats {
  total_users: number;
  active_users_7d: number;
  total_watchlist_items: number;
  total_mood_selections: number;
  total_reviews: number;
}

interface MoodData {
  mood: string;
  count: number;
}

interface MovieData {
  movie_id: number;
  movie_title?: string;
  title?: string;
  poster_path?: string;
  recommendation_count?: number;
  watchlist_count?: number;
}

export function useAdminAnalytics() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [trendingMoods, setTrendingMoods] = useState<MoodData[]>([]);
  const [topRecommended, setTopRecommended] = useState<MovieData[]>([]);
  const [topWatchlisted, setTopWatchlisted] = useState<MovieData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch admin stats
      const { data: statsData, error: statsError } = await supabase.rpc("get_admin_stats");
      if (statsError) throw statsError;
      setStats(statsData as unknown as AdminStats);

      // Fetch trending moods
      const { data: moodsData, error: moodsError } = await supabase.rpc("get_trending_moods", {
        time_range: "weekly",
      });
      if (moodsError) throw moodsError;
      setTrendingMoods((moodsData as unknown as MoodData[]) || []);

      // Fetch top recommended movies
      const { data: recommendedData, error: recommendedError } = await supabase.rpc(
        "get_top_recommended_movies"
      );
      if (recommendedError) throw recommendedError;
      setTopRecommended((recommendedData as unknown as MovieData[]) || []);

      // Fetch most watchlisted movies
      const { data: watchlistedData, error: watchlistedError } = await supabase.rpc(
        "get_most_watchlisted_movies"
      );
      if (watchlistedError) throw watchlistedError;
      setTopWatchlisted((watchlistedData as unknown as MovieData[]) || []);
    } catch (err: any) {
      console.error("Error fetching analytics:", err);
      setError(err.message || "Failed to fetch analytics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    stats,
    trendingMoods,
    topRecommended,
    topWatchlisted,
    isLoading,
    error,
    refetch: fetchAnalytics,
  };
}
