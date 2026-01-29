import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useKeyAuth } from "./useKeyAuth";

export interface Badge {
  id: string;
  badge_id: string;
  badge_name: string;
  badge_description: string;
  badge_icon: string;
  earned_at: string;
}

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  total_days_active: number;
  last_active_date: string | null;
}

export interface MoodJournalEntry {
  id: string;
  mood: string;
  movie_id?: number;
  movie_title?: string;
  movie_poster?: string;
  note?: string;
  created_at: string;
}

// Badge definitions
export const BADGE_DEFINITIONS = [
  { id: "first_mood", name: "Mood Explorer", description: "Selected your first mood", icon: "🎭", requirement: 1 },
  { id: "streak_3", name: "Consistent", description: "3-day streak", icon: "🔥", requirement: 3 },
  { id: "streak_7", name: "Week Warrior", description: "7-day streak", icon: "⚡", requirement: 7 },
  { id: "streak_30", name: "Mood Master", description: "30-day streak", icon: "👑", requirement: 30 },
  { id: "moods_5", name: "Mood Variety", description: "Explored 5 different moods", icon: "🌈", requirement: 5 },
  { id: "moods_all", name: "Mood Connoisseur", description: "Explored all moods", icon: "🏆", requirement: 12 },
  { id: "movies_10", name: "Movie Buff", description: "Discovered 10 movies", icon: "🎬", requirement: 10 },
  { id: "movies_50", name: "Cinephile", description: "Discovered 50 movies", icon: "🎥", requirement: 50 },
  { id: "battles_5", name: "Battle Ready", description: "Won 5 movie battles", icon: "⚔️", requirement: 5 },
  { id: "battles_25", name: "Champion", description: "Won 25 movie battles", icon: "🏅", requirement: 25 },
];

export function useGamification() {
  const { user, isAuthenticated } = useKeyAuth();
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [journalEntries, setJournalEntries] = useState<MoodJournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);

  const userId = user?.id || "anonymous";

  // Fetch user data
  const fetchData = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const [streakRes, badgesRes, journalRes] = await Promise.all([
        supabase
          .from("mood_streaks")
          .select("*")
          .eq("user_id", userId)
          .single(),
        supabase
          .from("user_badges")
          .select("*")
          .eq("user_id", userId)
          .order("earned_at", { ascending: false }),
        supabase
          .from("mood_journal")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      if (streakRes.data) {
        setStreakData({
          current_streak: streakRes.data.current_streak,
          longest_streak: streakRes.data.longest_streak,
          total_days_active: streakRes.data.total_days_active,
          last_active_date: streakRes.data.last_active_date,
        });
      }

      if (badgesRes.data) {
        setBadges(badgesRes.data as Badge[]);
      }

      if (journalRes.data) {
        setJournalEntries(journalRes.data as MoodJournalEntry[]);
      }
    } catch (error) {
      console.error("[Gamification] Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update streak on activity
  const updateStreak = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    
    try {
      // Check if streak record exists
      const { data: existing } = await supabase
        .from("mood_streaks")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (!existing) {
        // Create new streak record
        const { data } = await supabase
          .from("mood_streaks")
          .insert({
            user_id: userId,
            current_streak: 1,
            longest_streak: 1,
            total_days_active: 1,
            last_active_date: today,
          })
          .select()
          .single();

        if (data) {
          setStreakData({
            current_streak: data.current_streak,
            longest_streak: data.longest_streak,
            total_days_active: data.total_days_active,
            last_active_date: data.last_active_date,
          });
          // Award first mood badge
          await awardBadge("first_mood");
        }
        return;
      }

      // Already active today
      if (existing.last_active_date === today) {
        return;
      }

      const lastDate = new Date(existing.last_active_date);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      let newStreak = existing.current_streak;
      if (diffDays === 1) {
        // Consecutive day
        newStreak = existing.current_streak + 1;
      } else {
        // Streak broken
        newStreak = 1;
      }

      const newLongest = Math.max(newStreak, existing.longest_streak);
      const newTotal = existing.total_days_active + 1;

      const { data } = await supabase
        .from("mood_streaks")
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          total_days_active: newTotal,
          last_active_date: today,
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (data) {
        setStreakData({
          current_streak: data.current_streak,
          longest_streak: data.longest_streak,
          total_days_active: data.total_days_active,
          last_active_date: data.last_active_date,
        });

        // Check streak badges
        if (newStreak >= 3) await awardBadge("streak_3");
        if (newStreak >= 7) await awardBadge("streak_7");
        if (newStreak >= 30) await awardBadge("streak_30");
      }
    } catch (error) {
      console.error("[Gamification] Error updating streak:", error);
    }
  }, [userId]);

  // Award a badge
  const awardBadge = useCallback(async (badgeId: string) => {
    const badgeDef = BADGE_DEFINITIONS.find((b) => b.id === badgeId);
    if (!badgeDef) return;

    // Check if already earned
    const hasIt = badges.some((b) => b.badge_id === badgeId);
    if (hasIt) return;

    try {
      const { data, error } = await supabase
        .from("user_badges")
        .insert({
          user_id: userId,
          badge_id: badgeId,
          badge_name: badgeDef.name,
          badge_description: badgeDef.description,
          badge_icon: badgeDef.icon,
        })
        .select()
        .single();

      if (!error && data) {
        const badge = data as Badge;
        setBadges((prev) => [badge, ...prev]);
        setNewBadge(badge);
        
        // Clear the new badge notification after 4 seconds
        setTimeout(() => setNewBadge(null), 4000);
      }
    } catch (error) {
      console.error("[Gamification] Error awarding badge:", error);
    }
  }, [userId, badges]);

  // Log mood to journal
  const logMood = useCallback(async (
    mood: string,
    movie?: { id: number; title: string; poster?: string },
    note?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from("mood_journal")
        .insert({
          user_id: userId,
          mood,
          movie_id: movie?.id,
          movie_title: movie?.title,
          movie_poster: movie?.poster,
          note,
        })
        .select()
        .single();

      if (!error && data) {
        setJournalEntries((prev) => [data as MoodJournalEntry, ...prev]);
        await updateStreak();

        // Check mood variety badge
        const uniqueMoods = new Set([...journalEntries.map((e) => e.mood), mood]);
        if (uniqueMoods.size >= 5) await awardBadge("moods_5");
        if (uniqueMoods.size >= 12) await awardBadge("moods_all");
      }
    } catch (error) {
      console.error("[Gamification] Error logging mood:", error);
    }
  }, [userId, journalEntries, updateStreak, awardBadge]);

  // Clear new badge notification
  const clearNewBadge = useCallback(() => {
    setNewBadge(null);
  }, []);

  return {
    streakData,
    badges,
    journalEntries,
    isLoading,
    newBadge,
    updateStreak,
    awardBadge,
    logMood,
    clearNewBadge,
    refetch: fetchData,
  };
}
