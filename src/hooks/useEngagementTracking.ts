import { useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useKeyAuth } from "./useKeyAuth";
import type { Json } from "@/integrations/supabase/types";

// Generate a session ID that persists for the browser session
const getSessionId = (): string => {
  const key = "engagement_session_id";
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
};

interface TrackEventOptions {
  movieId?: number;
  movieTitle?: string;
  metadata?: Json;
}

export function useEngagementTracking() {
  const location = useLocation();
  const { user } = useKeyAuth();
  const pageStartTime = useRef<number>(Date.now());
  const sessionId = useRef<string>(getSessionId());

  // Track page view on mount and route change
  useEffect(() => {
    pageStartTime.current = Date.now();
    
    // Track page view
    trackEvent("page_view", { metadata: { referrer: document.referrer } as Json });

    // Track page duration on unmount or route change
    return () => {
      const duration = Date.now() - pageStartTime.current;
      if (duration > 1000) { // Only track if > 1 second
        trackEvent("page_leave", { metadata: { duration_ms: duration } as Json });
      }
    };
  }, [location.pathname]);

  const trackEvent = useCallback(async (
    eventType: string,
    options: TrackEventOptions = {}
  ) => {
    try {
      const { movieId, movieTitle, metadata = {} } = options;
      
      const insertData: {
        user_id?: string;
        session_id: string;
        event_type: string;
        page_path: string;
        movie_id?: number;
        movie_title?: string;
        duration_ms?: number;
        metadata: Json;
      } = {
        session_id: sessionId.current,
        event_type: eventType,
        page_path: location.pathname,
        metadata: metadata as Json,
      };
      
      if (user?.id) insertData.user_id = user.id;
      if (movieId) insertData.movie_id = movieId;
      if (movieTitle) insertData.movie_title = movieTitle;
      if (typeof metadata === 'object' && metadata !== null && 'duration_ms' in metadata) {
        insertData.duration_ms = (metadata as { duration_ms?: number }).duration_ms;
      }
      
      await supabase.from("user_engagement").insert([insertData]);
    } catch (error) {
      // Silently fail - analytics shouldn't break the app
      console.debug("Failed to track engagement:", error);
    }
  }, [user?.id, location.pathname]);

  const trackMovieClick = useCallback((movieId: number, movieTitle: string) => {
    trackEvent("movie_click", { movieId, movieTitle });
  }, [trackEvent]);

  const trackMovieView = useCallback((movieId: number, movieTitle: string) => {
    trackEvent("movie_view", { movieId, movieTitle });
  }, [trackEvent]);

  const trackSimilarMovieClick = useCallback((movieId: number, movieTitle: string) => {
    trackEvent("similar_movie_click", { movieId, movieTitle });
  }, [trackEvent]);

  const trackWatchlistAdd = useCallback((movieId: number, movieTitle: string) => {
    trackEvent("watchlist_add", { movieId, movieTitle });
  }, [trackEvent]);

  const trackMoodSelection = useCallback((mood: string) => {
    trackEvent("mood_select", { metadata: { mood } as Json });
  }, [trackEvent]);

  const trackSearch = useCallback((query: string) => {
    trackEvent("search", { metadata: { query } as Json });
  }, [trackEvent]);

  const trackLoadMore = useCallback(() => {
    trackEvent("load_more");
  }, [trackEvent]);

  return {
    trackEvent,
    trackMovieClick,
    trackMovieView,
    trackSimilarMovieClick,
    trackWatchlistAdd,
    trackMoodSelection,
    trackSearch,
    trackLoadMore,
  };
}
