import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

export interface WatchHistoryItem {
  id: string;
  user_id: string;
  movie_id: number;
  title: string;
  poster_path: string | null;
  watched_at: string;
  rating: number | null;
}

export function useWatchHistory() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchHistory = useCallback(async () => {
    if (!user) {
      setHistory([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('watch_history')
        .select('*')
        .eq('user_id', user.id)
        .order('watched_at', { ascending: false });

      if (error) throw error;

      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching watch history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const markAsWatched = async (movie: { id: number; title: string; poster_path?: string; rating?: number }) => {
    if (!user) {
      toast({ title: 'Please sign in to track watch history', variant: 'destructive' });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('watch_history')
        .upsert({
          user_id: user.id,
          movie_id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path || null,
          rating: movie.rating || null,
          watched_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,movie_id'
        })
        .select()
        .single();

      if (error) throw error;

      setHistory(prev => {
        const filtered = prev.filter(h => h.movie_id !== movie.id);
        return [data, ...filtered];
      });

      toast({ title: 'Marked as watched' });
    } catch (error: any) {
      toast({ title: 'Error updating watch history', description: error.message, variant: 'destructive' });
    }
  };

  const removeFromHistory = async (movieId: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('watch_history')
        .delete()
        .eq('user_id', user.id)
        .eq('movie_id', movieId);

      if (error) throw error;

      setHistory(prev => prev.filter(h => h.movie_id !== movieId));
      toast({ title: 'Removed from watch history' });
    } catch (error: any) {
      toast({ title: 'Error removing from history', description: error.message, variant: 'destructive' });
    }
  };

  const isWatched = (movieId: number) => {
    return history.some(h => h.movie_id === movieId);
  };

  return {
    history,
    user,
    isLoading,
    markAsWatched,
    removeFromHistory,
    isWatched,
    refetch: fetchHistory,
  };
}
