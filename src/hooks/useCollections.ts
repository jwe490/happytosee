import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  createCollectionApi, 
  addToCollectionApi, 
  deleteCollectionApi, 
  removeFromCollectionApi 
} from '@/lib/userDataApi';
import { getStoredSession } from '@/lib/keyAuth';

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

  // Fetch collections via edge function (bypasses RLS issues)
  const fetchCollections = useCallback(async () => {
    if (!user) {
      setCollections([]);
      setIsLoading(false);
      return;
    }

    const session = getStoredSession();
    if (!session?.token) {
      setCollections([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke("user-data", {
        body: {
          action: "get_collections",
          token: session.token,
          data: {},
        },
      });

      if (error) {
        console.error('[Collections] Fetch error:', error);
        setCollections([]);
      } else if (data?.collections) {
        setCollections(data.collections);
      } else {
        setCollections([]);
      }
    } catch (err) {
      console.error('[Collections] Exception:', err);
      setCollections([]);
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

    console.log('[Collections] Creating collection via API for user:', user.id);

    const result = await createCollectionApi({
      name: collection.name,
      description: collection.description,
      is_public: collection.is_public,
    });

    if (result.error) {
      toast.error('Failed to create collection');
      console.error(result.error);
      return null;
    }

    await fetchCollections();
    toast.success(`Collection "${collection.name}" created`);
    return (result.data as { collection: Collection })?.collection || null;
  };

  const updateCollection = async (
    collectionId: string,
    updates: Partial<Collection>
  ) => {
    if (!user) return;

    const session = getStoredSession();
    if (!session?.token) return;

    try {
      const { data, error } = await supabase.functions.invoke("user-data", {
        body: {
          action: "update_collection",
          token: session.token,
          data: {
            collection_id: collectionId,
            ...updates,
          },
        },
      });

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

    const result = await deleteCollectionApi(collectionId);

    if (result.error) {
      toast.error('Failed to delete collection');
      console.error(result.error);
      return;
    }

    await fetchCollections();
    toast.success('Collection deleted');
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

    const result = await addToCollectionApi(collectionId, {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
    });

    if (result.error) {
      toast.error('Failed to add movie');
      console.error(result.error);
      return false;
    }

    const data = result.data as { alreadyExists?: boolean } | undefined;
    if (data?.alreadyExists) {
      toast.info('Movie already in this collection');
      return false;
    }

    await fetchCollections();
    toast.success(`Added "${movie.title}" to collection`);
    return true;
  };

  const removeMovieFromCollection = async (
    collectionId: string,
    movieId: number
  ) => {
    if (!user) return;

    const result = await removeFromCollectionApi(collectionId, movieId);

    if (result.error) {
      toast.error('Failed to remove movie');
      console.error(result.error);
      return;
    }

    await fetchCollections();
    toast.success('Movie removed from collection');
  };

  const getCollectionMovies = async (collectionId: string): Promise<CollectionMovie[]> => {
    const session = getStoredSession();
    if (!session?.token) return [];

    try {
      const { data, error } = await supabase.functions.invoke("user-data", {
        body: {
          action: "get_collection_movies",
          token: session.token,
          data: { collection_id: collectionId },
        },
      });

      if (error) throw error;
      return data?.movies || [];
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
