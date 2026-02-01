import { supabase } from "@/integrations/supabase/client";
import { getStoredSession } from "@/lib/keyAuth";

interface UserDataResponse<T = unknown> {
  success?: boolean;
  error?: string;
  data?: T;
}

async function callUserDataApi<T = unknown>(
  action: string,
  data: Record<string, unknown>
): Promise<UserDataResponse<T>> {
  const session = getStoredSession();
  
  if (!session?.token) {
    return { error: "Not authenticated" };
  }

  try {
    const { data: response, error } = await supabase.functions.invoke("user-data", {
      body: {
        action,
        token: session.token,
        data,
      },
    });

    if (error) {
      console.error(`[userDataApi] ${action} error:`, error);
      return { error: error.message || "Request failed" };
    }

    if (response?.error) {
      return { error: response.error };
    }

    return { success: true, data: response };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    console.error(`[userDataApi] ${action} exception:`, err);
    return { error: message };
  }
}

// ==================== REVIEWS ====================
export async function addReviewApi(review: {
  movie_id: number;
  movie_title: string;
  movie_poster?: string;
  rating: number;
  review_text?: string;
}) {
  return callUserDataApi("add_review", review);
}

export async function deleteReviewApi(reviewId: string) {
  return callUserDataApi("delete_review", { review_id: reviewId });
}

// ==================== COLLECTIONS ====================
export async function createCollectionApi(collection: {
  name: string;
  description?: string;
  is_public?: boolean;
}) {
  return callUserDataApi<{ collection: { id: string; name: string } }>("create_collection", collection);
}

export async function addToCollectionApi(
  collectionId: string,
  movie: { id: number; title: string; poster_path?: string }
) {
  return callUserDataApi("add_to_collection", {
    collection_id: collectionId,
    movie_id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
  });
}

export async function removeFromCollectionApi(collectionId: string, movieId: number) {
  return callUserDataApi("remove_from_collection", {
    collection_id: collectionId,
    movie_id: movieId,
  });
}

export async function deleteCollectionApi(collectionId: string) {
  return callUserDataApi("delete_collection", { collection_id: collectionId });
}

// ==================== WATCHLIST ====================
export async function addToWatchlistApi(movie: {
  movie_id: number;
  title: string;
  poster_path?: string;
  rating?: number;
  release_year?: string;
  overview?: string;
}) {
  return callUserDataApi("add_to_watchlist", movie);
}

export async function removeFromWatchlistApi(movieId: number) {
  return callUserDataApi("remove_from_watchlist", { movie_id: movieId });
}
