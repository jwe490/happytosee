import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { addReviewApi, deleteReviewApi } from '@/lib/userDataApi';

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

export function useEnhancedReviews(movieId?: number) {
  const [reviews, setReviews] = useState<EnhancedReview[]>([]);
  const [userReview, setUserReview] = useState<EnhancedReview | null>(null);
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchReviews = useCallback(async () => {
    if (!movieId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('movie_id', movieId)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      const userIds = [...new Set((reviewsData || []).map(r => r.user_id))];
      
      let profileMap = new Map<string, { display_name: string | null; avatar_url: string | null }>();
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url')
          .in('user_id', userIds);

        profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      }

      // Map reviews with profile data and default values for missing columns
      const reviewsWithData: EnhancedReview[] = (reviewsData || []).map(r => ({
        id: r.id,
        user_id: r.user_id,
        movie_id: r.movie_id,
        movie_title: r.movie_title,
        movie_poster: r.movie_poster,
        rating: r.rating,
        review_text: r.review_text,
        created_at: r.created_at,
        updated_at: r.updated_at,
        // Default values for columns that might not exist
        is_spoiler: false,
        helpful_count: 0,
        reply_count: 0,
        is_edited: false,
        profiles: profileMap.get(r.user_id),
        replies: [],
        user_reaction: null,
      }));

      setReviews(reviewsWithData);

      if (user) {
        const myReview = reviewsWithData.find(r => r.user_id === user.id);
        setUserReview(myReview || null);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  }, [movieId, user]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const addReview = async (review: {
    movie_id: number;
    movie_title: string;
    movie_poster?: string;
    rating: number;
    review_text?: string;
    is_spoiler?: boolean;
  }) => {
    if (!user) {
      toast({ title: 'Please sign in to write a review', variant: 'destructive' });
      return;
    }

    console.log('[Reviews] Adding review via API for user:', user.id, 'movie:', review.movie_id);

    try {
      const result = await addReviewApi({
        movie_id: review.movie_id,
        movie_title: review.movie_title,
        movie_poster: review.movie_poster,
        rating: review.rating,
        review_text: review.review_text,
      });

      if (result.error) {
        console.error('[Reviews] API error:', result.error);
        
        // If key-auth fails, try direct insert as fallback
        if (result.error === 'Not authenticated' || result.error === 'Session expired') {
          console.log('[Reviews] Trying direct insert fallback...');
          const { error: directError } = await supabase
            .from('reviews')
            .upsert({
              user_id: user.id,
              movie_id: review.movie_id,
              movie_title: review.movie_title,
              movie_poster: review.movie_poster || null,
              rating: review.rating,
              review_text: review.review_text || null,
            }, { onConflict: 'user_id,movie_id', ignoreDuplicates: false });

          if (directError) {
            // If upsert fails on conflict, try separate logic
            console.error('[Reviews] Direct upsert error:', directError);
            
            // Check if review exists
            const { data: existing } = await supabase
              .from('reviews')
              .select('id')
              .eq('user_id', user.id)
              .eq('movie_id', review.movie_id)
              .maybeSingle();

            if (existing) {
              const { error: updateError } = await supabase
                .from('reviews')
                .update({
                  rating: review.rating,
                  review_text: review.review_text || null,
                  movie_poster: review.movie_poster || null,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', existing.id);

              if (updateError) {
                toast({ title: 'Error updating review', description: updateError.message, variant: 'destructive' });
                return;
              }
            } else {
              const { error: insertError } = await supabase
                .from('reviews')
                .insert({
                  user_id: user.id,
                  movie_id: review.movie_id,
                  movie_title: review.movie_title,
                  movie_poster: review.movie_poster || null,
                  rating: review.rating,
                  review_text: review.review_text || null,
                });

              if (insertError) {
                toast({ title: 'Error submitting review', description: insertError.message, variant: 'destructive' });
                return;
              }
            }
          }
        } else {
          toast({
            title: 'Error submitting review',
            description: result.error,
            variant: 'destructive',
          });
          return;
        }
      }

      await fetchReviews();
      toast({ title: 'Review submitted successfully! 🎬' });
    } catch (err) {
      console.error('[Reviews] Unexpected error:', err);
      toast({ title: 'Error submitting review', description: 'Please try again', variant: 'destructive' });
    }
  };

  const deleteReview = async () => {
    if (!user || !userReview) return;

    const result = await deleteReviewApi(userReview.id);

    if (result.error) {
      toast({
        title: 'Error deleting review',
        description: result.error,
        variant: 'destructive',
      });
      return;
    }

    setUserReview(null);
    await fetchReviews();
    toast({ title: 'Review deleted' });
  };

  const addReply = async (reviewId: string, replyText: string, parentReplyId?: string) => {
    // Reply functionality requires review_replies table - show info message
    toast({ title: 'Reply feature coming soon!' });
  };

  const deleteReply = async (replyId: string) => {
    toast({ title: 'Reply feature coming soon!' });
  };

  const toggleReaction = async (
    reviewId: string,
    reactionType: 'helpful' | 'insightful' | 'funny' | 'agree' | 'disagree'
  ) => {
    // Reaction functionality requires review_reactions table - show info message
    toast({ title: 'Reaction feature coming soon!' });
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

  return {
    reviews,
    userReview,
    user,
    isLoading,
    addReview,
    deleteReview,
    addReply,
    deleteReply,
    toggleReaction,
    averageRating,
    refetch: fetchReviews,
  };
}
