import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { addReviewApi, deleteReviewApi } from '@/lib/userDataApi';
import { getStoredSession } from '@/lib/keyAuth';

export interface ReviewReply {
  id: string;
  review_id: string;
  parent_reply_id: string | null;
  user_id: string;
  reply_text: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  replies?: ReviewReply[];
}

export interface EnhancedReview {
  id: string;
  user_id: string;
  movie_id: number;
  movie_title: string;
  movie_poster: string | null;
  rating: number;
  review_text: string | null;
  is_spoiler: boolean;
  helpful_count: number;
  reply_count: number;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  replies?: ReviewReply[];
  user_reaction?: string | null;
}

async function callUserData(action: string, data: Record<string, unknown>) {
  const session = getStoredSession();
  if (!session?.token) return { error: "Not authenticated" };
  try {
    const { data: response, error } = await supabase.functions.invoke("user-data", {
      body: { action, token: session.token, data },
    });
    if (error) return { error: error.message };
    if (response?.error) return { error: response.error };
    return { success: true, data: response };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Network error" };
  }
}

export function useEnhancedReviews(movieId?: number) {
  const [reviews, setReviews] = useState<EnhancedReview[]>([]);
  const [userReview, setUserReview] = useState<EnhancedReview | null>(null);
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    if (!movieId) { setIsLoading(false); return; }

    try {
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews').select('*').eq('movie_id', movieId)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      const userIds = [...new Set((reviewsData || []).map(r => r.user_id))];
      let profileMap = new Map<string, { display_name: string | null; avatar_url: string | null }>();

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles').select('user_id, display_name, avatar_url').in('user_id', userIds);
        profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

        const missingIds = userIds.filter(id => !profileMap.has(id));
        if (missingIds.length > 0) {
          const { data: keyUsers } = await supabase
            .from('key_users').select('id, display_name').in('id', missingIds);
          keyUsers?.forEach(ku => {
            if (!profileMap.has(ku.id)) {
              profileMap.set(ku.id, { display_name: ku.display_name, avatar_url: null });
            }
          });
        }
      }

      // Fetch reactions counts
      const reviewIds = (reviewsData || []).map(r => r.id);
      let reactionCounts = new Map<string, { helpful: number; total: number }>();
      let userReactions = new Map<string, string>();

      if (reviewIds.length > 0) {
        const { data: reactions } = await supabase
          .from('review_reactions').select('review_id, reaction_type, user_id')
          .in('review_id', reviewIds);

        reactions?.forEach(r => {
          const existing = reactionCounts.get(r.review_id) || { helpful: 0, total: 0 };
          existing.total++;
          if (r.reaction_type === 'helpful') existing.helpful++;
          reactionCounts.set(r.review_id, existing);
          if (user && r.user_id === user.id) {
            userReactions.set(r.review_id, r.reaction_type);
          }
        });
      }

      // Fetch reply counts
      let replyCounts = new Map<string, number>();
      if (reviewIds.length > 0) {
        const { data: replies } = await supabase
          .from('review_replies').select('review_id')
          .in('review_id', reviewIds);
        replies?.forEach(r => {
          replyCounts.set(r.review_id, (replyCounts.get(r.review_id) || 0) + 1);
        });
      }

      const reviewsWithData: EnhancedReview[] = (reviewsData || []).map(r => {
        const isSpoiler = r.review_text?.startsWith("[SPOILER]") ?? false;
        const counts = reactionCounts.get(r.id) || { helpful: 0, total: 0 };
        return {
          id: r.id, user_id: r.user_id, movie_id: r.movie_id,
          movie_title: r.movie_title, movie_poster: r.movie_poster,
          rating: r.rating, review_text: r.review_text,
          created_at: r.created_at, updated_at: r.updated_at,
          is_spoiler: isSpoiler,
          helpful_count: counts.helpful,
          reply_count: replyCounts.get(r.id) || 0,
          is_edited: false,
          profiles: profileMap.get(r.user_id),
          replies: [],
          user_reaction: userReactions.get(r.id) || null,
        };
      });

      setReviews(reviewsWithData);
      if (user) {
        setUserReview(reviewsWithData.find(r => r.user_id === user.id) || null);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  }, [movieId, user]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const addReview = async (review: {
    movie_id: number; movie_title: string; movie_poster?: string;
    rating: number; review_text?: string; is_spoiler?: boolean;
  }) => {
    if (!user) { toast.error('Please sign in to write a review'); return; }
    try {
      const result = await addReviewApi({
        movie_id: review.movie_id, movie_title: review.movie_title,
        movie_poster: review.movie_poster, rating: review.rating,
        review_text: review.review_text,
      });

      if (result.error) {
        if (result.error === 'Not authenticated' || result.error === 'Session expired') {
          // Fallback to direct insert
          const { data: existing } = await supabase.from('reviews').select('id')
            .eq('user_id', user.id).eq('movie_id', review.movie_id).maybeSingle();
          if (existing) {
            const { error } = await supabase.from('reviews').update({
              rating: review.rating, review_text: review.review_text || null,
              movie_poster: review.movie_poster || null, updated_at: new Date().toISOString(),
            }).eq('id', existing.id);
            if (error) { toast.error('Error updating review'); return; }
          } else {
            const { error } = await supabase.from('reviews').insert({
              user_id: user.id, movie_id: review.movie_id, movie_title: review.movie_title,
              movie_poster: review.movie_poster || null, rating: review.rating,
              review_text: review.review_text || null,
            });
            if (error) { toast.error('Error submitting review'); return; }
          }
        } else {
          toast.error(result.error);
          return;
        }
      }
      await fetchReviews();
      toast.success('Review submitted! ✦');
    } catch (err) {
      console.error('[Reviews] Unexpected error:', err);
      toast.error('Please try again');
    }
  };

  const deleteReview = async () => {
    if (!user || !userReview) return;
    const result = await deleteReviewApi(userReview.id);
    if (result.error) {
      const { error } = await supabase.from('reviews').delete().eq('id', userReview.id);
      if (error) { toast.error('Error deleting review'); return; }
    }
    setUserReview(null);
    await fetchReviews();
    toast.success('Review deleted');
  };

  const addReply = async (reviewId: string, replyText: string, parentReplyId?: string) => {
    if (!user) { toast.error('Sign in to reply'); return; }
    const result = await callUserData("add_reply", {
      review_id: reviewId, reply_text: replyText,
      parent_reply_id: parentReplyId,
    });
    if (result.error) { toast.error('Failed to post reply'); return; }
    await fetchReviews();
    toast.success('Reply posted');
  };

  const deleteReply = async (replyId: string) => {
    const result = await callUserData("delete_reply", { reply_id: replyId });
    if (result.error) { toast.error('Failed to delete reply'); return; }
    await fetchReviews();
    toast.success('Reply deleted');
  };

  const getReplies = async (reviewId: string): Promise<ReviewReply[]> => {
    const result = await callUserData("get_replies", { review_id: reviewId });
    if (result.error) return [];
    return (result.data as any)?.replies || [];
  };

  const toggleReaction = async (
    reviewId: string,
    reactionType: 'helpful' | 'insightful' | 'funny' | 'agree' | 'disagree'
  ) => {
    if (!user) { toast.error('Sign in to react'); return; }
    const result = await callUserData("toggle_reaction", {
      review_id: reviewId, reaction_type: reactionType,
    });
    if (result.error) { toast.error('Failed to react'); return; }
    await fetchReviews();
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;

  return {
    reviews, userReview, user, isLoading,
    addReview, deleteReview, addReply, deleteReply,
    getReplies, toggleReaction, averageRating, refetch: fetchReviews,
  };
}
