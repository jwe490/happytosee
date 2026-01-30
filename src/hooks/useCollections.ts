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
  added_by: string | null;
  notes: string | null;
  priority: number;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  cover_image: string | null;
  color_theme: string;
  movie_count: number;
  share_count: number;
  is_collaborative: boolean;
  created_at: string;
  updated_at: string;
  movies?: CollectionMovie[];
}

export interface CollectionShare {
  id: string;
  collection_id: string;
  share_token: string;
  shared_by: string;
  shared_with: string | null;
  permission_level: 'view' | 'copy' | 'collaborate';
  expires_at: string | null;
  view_count: number;
  copy_count: number;
  created_at: string;
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
    color_theme?: string;
  }) => {
    if (!user) {
      toast.error('Please sign in to create a collection');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('collections')
        .insert({
          user_id: user.id,
          name: collection.name,
          description: collection.description || null,
          is_public: collection.is_public || false,
          color_theme: collection.color_theme || '#8B5CF6',
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
    },
    notes?: string
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
        added_by: user.id,
        notes: notes || null,
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

  const createShare = async (
    collectionId: string,
    options: {
      permission_level: 'view' | 'copy' | 'collaborate';
      shared_with?: string;
      expires_at?: string;
    }
  ) => {
    if (!user) {
      toast.error('Please sign in to share');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('collection_shares')
        .insert({
          collection_id: collectionId,
          shared_by: user.id,
          shared_with: options.shared_with || null,
          permission_level: options.permission_level,
          expires_at: options.expires_at || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Share link created');
      return data;
    } catch (error: any) {
      toast.error('Failed to create share link');
      console.error(error);
      return null;
    }
  };

  const getShareLink = (shareToken: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/collection/shared/${shareToken}`;
  };

  const deleteShare = async (shareId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('collection_shares')
        .delete()
        .eq('id', shareId)
        .eq('shared_by', user.id);

      if (error) throw error;

      toast.success('Share link deleted');
    } catch (error: any) {
      toast.error('Failed to delete share link');
      console.error(error);
    }
  };

  const getCollectionShares = async (collectionId: string) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('collection_shares')
        .select('*')
        .eq('collection_id', collectionId)
        .eq('shared_by', user.id);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching shares:', error);
      return [];
    }
  };

  const copyCollection = async (sourceCollectionId: string, newName: string) => {
    if (!user) {
      toast.error('Please sign in to copy collections');
      return null;
    }

    try {
      const { data: sourceCollection, error: sourceError } = await supabase
        .from('collections')
        .select('*')
        .eq('id', sourceCollectionId)
        .single();

      if (sourceError) throw sourceError;

      const { data: movies, error: moviesError } = await supabase
        .from('collection_movies')
        .select('*')
        .eq('collection_id', sourceCollectionId);

      if (moviesError) throw moviesError;

      const { data: newCollection, error: createError } = await supabase
        .from('collections')
        .insert({
          user_id: user.id,
          name: newName,
          description: `Copied from ${sourceCollection.name}`,
          is_public: false,
          color_theme: sourceCollection.color_theme,
        })
        .select()
        .single();

      if (createError) throw createError;

      if (movies && movies.length > 0) {
        const movieInserts = movies.map(m => ({
          collection_id: newCollection.id,
          movie_id: m.movie_id,
          title: m.title,
          poster_path: m.poster_path,
          added_by: user.id,
        }));

        const { error: insertError } = await supabase
          .from('collection_movies')
          .insert(movieInserts);

        if (insertError) throw insertError;
      }

      await fetchCollections();
      toast.success(`Collection copied as "${newName}"`);
      return newCollection;
    } catch (error: any) {
      toast.error('Failed to copy collection');
      console.error(error);
      return null;
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
    createShare,
    getShareLink,
    deleteShare,
    getCollectionShares,
    copyCollection,
    toggleCollectionVisibility,
    refetch: fetchCollections,
  };
}
