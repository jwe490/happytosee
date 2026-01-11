import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface WatchHistoryItem {
  id: string;
  user_id: string;
  movie_id: number;
  title: string;
  poster_path: string | null;
  watched_at: string;
  rating: number | null;
}

const WATCH_HISTORY_STORAGE_KEY = "moodflix_watch_history";

export function useWatchHistory() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load history from localStorage on mount
  useEffect(() => {
    const loadHistory = () => {
      try {
        const stored = localStorage.getItem(WATCH_HISTORY_STORAGE_KEY);
        if (stored) {
          setHistory(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading watch history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  // Save history to localStorage whenever it changes
  const saveHistory = useCallback((items: WatchHistoryItem[]) => {
    try {
      localStorage.setItem(WATCH_HISTORY_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving watch history:', error);
    }
  }, []);

  const markAsWatched = useCallback((movie: { id: number; title: string; poster_path?: string; rating?: number }) => {
    // Check if already watched
    if (history.some(h => h.movie_id === movie.id)) {
      toast.info('Already marked as watched');
      return;
    }

    const newItem: WatchHistoryItem = {
      id: `local_${movie.id}_${Date.now()}`,
      user_id: 'local',
      movie_id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path || null,
      watched_at: new Date().toISOString(),
      rating: movie.rating || null,
    };

    const updatedHistory = [newItem, ...history];
    setHistory(updatedHistory);
    saveHistory(updatedHistory);
    toast.success('Marked as watched');
  }, [history, saveHistory]);

  const removeFromHistory = useCallback((movieId: number) => {
    const updatedHistory = history.filter(h => h.movie_id !== movieId);
    setHistory(updatedHistory);
    saveHistory(updatedHistory);
    toast.success('Removed from watch history');
  }, [history, saveHistory]);

  const isWatched = useCallback((movieId: number) => {
    return history.some(h => h.movie_id === movieId);
  }, [history]);

  return {
    history,
    user: true, // Always return true for guest mode
    isLoading,
    markAsWatched,
    removeFromHistory,
    isWatched,
    refetch: () => {},
  };
}
