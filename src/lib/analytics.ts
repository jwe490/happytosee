import { supabase } from "@/integrations/supabase/client";

/**
 * Track a mood selection for analytics
 */
export async function trackMoodSelection(mood: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Anonymous user - we could track these differently or skip
      return;
    }

    await supabase.from("mood_selections").insert({
      user_id: user.id,
      mood: mood,
    });
  } catch (error) {
    // Silently fail - analytics shouldn't break the app
    console.debug("Failed to track mood selection:", error);
  }
}

/**
 * Track a movie recommendation for analytics
 */
export async function trackRecommendation(
  mood: string,
  movieId: number,
  movieTitle: string
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    await supabase.from("recommendation_logs").insert({
      user_id: user.id,
      mood: mood,
      movie_id: movieId,
      movie_title: movieTitle,
    });
  } catch (error) {
    console.debug("Failed to track recommendation:", error);
  }
}
