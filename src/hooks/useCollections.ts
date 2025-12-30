import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  movies?: CollectionMovie[];
}

export interface CollectionMovie {
  id: string;
  collection_id: string;
  movie_id: number;
  title: string;
  poster_path: string | null;
  added_at: string;
}

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
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

  const fetchCollections = useCallback(async () => {
    if (!user) {
      setCollections([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('collections')
        .select(`
          *,
          movies:collection_movies (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCollections(data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const createCollection = async (name: string, description?: string, isPublic = false) => {
    if (!user) {
      toast({ title: 'Please sign in to create collections', variant: 'destructive' });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('collections')
        .insert({
          user_id: user.id,
          name,
          description: description || null,
          is_public: isPublic,
        })
        .select()
        .single();

      if (error) throw error;

      setCollections(prev => [{ ...data, movies: [] }, ...prev]);
      toast({ title: 'Collection created' });
      return data;
    } catch (error: any) {
      toast({ title: 'Error creating collection', description: error.message, variant: 'destructive' });
      return null;
    }
  };

  const deleteCollection = async (collectionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', collectionId);

      if (error) throw error;

      setCollections(prev => prev.filter(c => c.id !== collectionId));
      toast({ title: 'Collection deleted' });
    } catch (error: any) {
      toast({ title: 'Error deleting collection', description: error.message, variant: 'destructive' });
    }
  };

  const addMovieToCollection = async (collectionId: string, movie: { id: number; title: string; poster_path?: string }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('collection_movies')
        .insert({
          collection_id: collectionId,
          movie_id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path || null,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast({ title: 'Movie already in collection' });
          return;
        }
        throw error;
      }

      setCollections(prev => prev.map(c => {
        if (c.id === collectionId) {
          return { ...c, movies: [...(c.movies || []), data] };
        }
        return c;
      }));

      toast({ title: 'Added to collection' });
    } catch (error: any) {
      toast({ title: 'Error adding to collection', description: error.message, variant: 'destructive' });
    }
  };

  const removeMovieFromCollection = async (collectionId: string, movieId: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('collection_movies')
        .delete()
        .eq('collection_id', collectionId)
        .eq('movie_id', movieId);

      if (error) throw error;

      setCollections(prev => prev.map(c => {
        if (c.id === collectionId) {
          return { ...c, movies: (c.movies || []).filter(m => m.movie_id !== movieId) };
        }
        return c;
      }));

      toast({ title: 'Removed from collection' });
    } catch (error: any) {
      toast({ title: 'Error removing from collection', description: error.message, variant: 'destructive' });
    }
  };

  const toggleCollectionVisibility = async (collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) return;

    try {
      const { error } = await supabase
        .from('collections')
        .update({ is_public: !collection.is_public })
        .eq('id', collectionId);

      if (error) throw error;

      setCollections(prev => prev.map(c => {
        if (c.id === collectionId) {
          return { ...c, is_public: !c.is_public };
        }
        return c;
      }));

      toast({ title: collection.is_public ? 'Collection is now private' : 'Collection is now public' });
    } catch (error: any) {
      toast({ title: 'Error updating collection', description: error.message, variant: 'destructive' });
    }
  };

  return {
    collections,
    user,
    isLoading,
    createCollection,
    deleteCollection,
    addMovieToCollection,
    removeMovieFromCollection,
    toggleCollectionVisibility,
    refetch: fetchCollections,
  };
}
