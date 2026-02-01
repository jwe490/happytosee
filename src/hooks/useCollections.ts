import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface CollectionMovie {
  id: string;
  collection_id: string;
  movie_id: number;
  title: string;
  poster_path: string | null;
  added_at: string;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean | null;
  mood: string | null;
  created_at: string;
  updated_at: string;
  movies?: CollectionMovie[];
}

export function useCollections() {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCollections = useCallback(async () => {
    if (!user) {
      setCollections([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setCollections(data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
      toast.error('Failed to load collections');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const createCollection = async (collection: {
    name: string;
    description?: string;
    is_public?: boolean;
  }) => {
    if (!user) {
      toast.error('Please sign in to create a collection');
      return null;
    }

    console.log('[Collections] Creating collection for user:', user.id);

    try {
      const { data, error } = await supabase
        .from('collections')
        .insert({
          user_id: user.id,
          name: collection.name,
          description: collection.description || null,
          is_public: collection.is_public || false,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchCollections();
      toast.success(`Collection "${collection.name}" created`);
      return data;
    } catch (error: any) {
      toast.error('Failed to create collection');
      console.error(error);
      return null;
    }
  };

  const updateCollection = async (
    collectionId: string,
    updates: Partial<Collection>
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('collections')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', collectionId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchCollections();
      toast.success('Collection updated');
    } catch (error: any) {
      toast.error('Failed to update collection');
      console.error(error);
    }
  };

  const deleteCollection = async (collectionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', collectionId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchCollections();
      toast.success('Collection deleted');
    } catch (error: any) {
      toast.error('Failed to delete collection');
      console.error(error);
    }
  };

  const addMovieToCollection = async (
    collectionId: string,
    movie: {
      id: number;
      title: string;
      poster_path?: string;
    }
  ) => {
    if (!user) {
      toast.error('Please sign in to add movies');
      return false;
    }

    try {
      const { data: existingMovie } = await supabase
        .from('collection_movies')
        .select('id')
        .eq('collection_id', collectionId)
        .eq('movie_id', movie.id)
        .maybeSingle();

      if (existingMovie) {
        toast.info('Movie already in this collection');
        return false;
      }

      const { error } = await supabase.from('collection_movies').insert({
        collection_id: collectionId,
        movie_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path || null,
      });

      if (error) throw error;

      await fetchCollections();
      toast.success(`Added "${movie.title}" to collection`);
      return true;
    } catch (error: any) {
      toast.error('Failed to add movie');
      console.error(error);
      return false;
    }
  };

  const removeMovieFromCollection = async (
    collectionId: string,
    movieId: number
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('collection_movies')
        .delete()
        .eq('collection_id', collectionId)
        .eq('movie_id', movieId);

      if (error) throw error;

      await fetchCollections();
      toast.success('Movie removed from collection');
    } catch (error: any) {
      toast.error('Failed to remove movie');
      console.error(error);
    }
  };

  const getCollectionMovies = async (collectionId: string) => {
    try {
      const { data, error } = await supabase
        .from('collection_movies')
        .select('*')
        .eq('collection_id', collectionId)
        .order('added_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching collection movies:', error);
      return [];
    }
  };

  const toggleCollectionVisibility = async (collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) return;

    await updateCollection(collectionId, { is_public: !collection.is_public });
  };

  return {
    collections,
    user: !!user,
    isLoading,
    createCollection,
    updateCollection,
    deleteCollection,
    addMovieToCollection,
    removeMovieFromCollection,
    getCollectionMovies,
    toggleCollectionVisibility,
    refetch: fetchCollections,
  };
}
