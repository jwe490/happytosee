import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

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

const COLLECTIONS_STORAGE_KEY = "moodflix_collections";

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load collections from localStorage on mount
  useEffect(() => {
    const loadCollections = () => {
      try {
        const stored = localStorage.getItem(COLLECTIONS_STORAGE_KEY);
        if (stored) {
          setCollections(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading collections:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCollections();
  }, []);

  // Save collections to localStorage whenever they change
  const saveCollections = useCallback((items: Collection[]) => {
    try {
      localStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving collections:', error);
    }
  }, []);

  const createCollection = useCallback((name: string, description?: string, isPublic = false) => {
    const newCollection: Collection = {
      id: `local_${Date.now()}`,
      user_id: 'local',
      name,
      description: description || null,
      is_public: isPublic,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      movies: [],
    };

    const updatedCollections = [newCollection, ...collections];
    setCollections(updatedCollections);
    saveCollections(updatedCollections);
    toast.success('Collection created');
    return newCollection;
  }, [collections, saveCollections]);

  const deleteCollection = useCallback((collectionId: string) => {
    const updatedCollections = collections.filter(c => c.id !== collectionId);
    setCollections(updatedCollections);
    saveCollections(updatedCollections);
    toast.success('Collection deleted');
  }, [collections, saveCollections]);

  const addMovieToCollection = useCallback((collectionId: string, movie: { id: number; title: string; poster_path?: string }) => {
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) return;

    // Check if movie already in collection
    if (collection.movies?.some(m => m.movie_id === movie.id)) {
      toast.info('Movie already in collection');
      return;
    }

    const newMovie: CollectionMovie = {
      id: `local_${movie.id}_${Date.now()}`,
      collection_id: collectionId,
      movie_id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path || null,
      added_at: new Date().toISOString(),
    };

    const updatedCollections = collections.map(c => {
      if (c.id === collectionId) {
        return { ...c, movies: [...(c.movies || []), newMovie] };
      }
      return c;
    });

    setCollections(updatedCollections);
    saveCollections(updatedCollections);
    toast.success('Added to collection');
  }, [collections, saveCollections]);

  const removeMovieFromCollection = useCallback((collectionId: string, movieId: number) => {
    const updatedCollections = collections.map(c => {
      if (c.id === collectionId) {
        return { ...c, movies: (c.movies || []).filter(m => m.movie_id !== movieId) };
      }
      return c;
    });

    setCollections(updatedCollections);
    saveCollections(updatedCollections);
    toast.success('Removed from collection');
  }, [collections, saveCollections]);

  const toggleCollectionVisibility = useCallback((collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) return;

    const updatedCollections = collections.map(c => {
      if (c.id === collectionId) {
        return { ...c, is_public: !c.is_public };
      }
      return c;
    });

    setCollections(updatedCollections);
    saveCollections(updatedCollections);
    toast.success(collection.is_public ? 'Collection is now private' : 'Collection is now public');
  }, [collections, saveCollections]);

  return {
    collections,
    user: true, // Always return true for guest mode
    isLoading,
    createCollection,
    deleteCollection,
    addMovieToCollection,
    removeMovieFromCollection,
    toggleCollectionVisibility,
    refetch: () => {},
  };
}
