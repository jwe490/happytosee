import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

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
  reaction_count?: number;
  user_reaction?: string | null;
}

export interface ReviewReaction {
  id: string;
  review_id: string;
  user_id: string;
  reaction_type: 'helpful' | 'insightful' | 'funny' | 'agree' | 'disagree';
  created_at: string;
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
        .order('helpful_count', { ascending: false });

      if (reviewsError) throw reviewsError;

      const userIds = [...new Set((reviewsData || []).map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const reviewIds = (reviewsData || []).map(r => r.id);

      let userReactions: Map<string, string> = new Map();
      if (user) {
        const { data: reactionsData } = await supabase
          .from('review_reactions')
          .select('review_id, reaction_type')
          .in('review_id', reviewIds)
          .eq('user_id', user.id);

        userReactions = new Map(
          (reactionsData || []).map(r => [r.review_id, r.reaction_type])
        );
      }

      const { data: repliesData } = await supabase
        .from('review_replies')
        .select('*')
        .in('review_id', reviewIds)
        .order('created_at', { ascending: true });

      const replyUserIds = [...new Set((repliesData || []).map(r => r.user_id))];
      const { data: replyProfiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', replyUserIds);

      const replyProfileMap = new Map(
        replyProfiles?.map(p => [p.user_id, p]) || []
      );

      const repliesByReview = new Map<string, ReviewReply[]>();
      (repliesData || []).forEach(reply => {
        if (!repliesByReview.has(reply.review_id)) {
          repliesByReview.set(reply.review_id, []);
        }
        repliesByReview.get(reply.review_id)!.push({
          ...reply,
          profiles: replyProfileMap.get(reply.user_id),
          replies: [],
        });
      });

      repliesByReview.forEach((replies, reviewId) => {
        const buildTree = (parentId: string | null = null): ReviewReply[] => {
          return replies
            .filter(r => r.parent_reply_id === parentId)
            .map(r => ({
              ...r,
              replies: buildTree(r.id),
            }));
        };
        repliesByReview.set(reviewId, buildTree());
      });

      const reviewsWithData: EnhancedReview[] = (reviewsData || []).map(r => ({
        ...r,
        profiles: profileMap.get(r.user_id),
        replies: repliesByReview.get(r.id) || [],
        user_reaction: userReactions.get(r.id) || null,
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

    try {
      const { data, error } = await supabase
        .from('reviews')
        .upsert(
          {
            user_id: user.id,
            movie_id: review.movie_id,
            movie_title: review.movie_title,
            movie_poster: review.movie_poster || null,
            rating: review.rating,
            review_text: review.review_text || null,
            is_spoiler: review.is_spoiler || false,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,movie_id',
          }
        )
        .select()
        .single();

      if (error) throw error;

      await fetchReviews();
      toast({ title: 'Review submitted successfully' });
    } catch (error: any) {
      toast({
        title: 'Error submitting review',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteReview = async () => {
    if (!user || !userReview) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', userReview.id);

      if (error) throw error;

      setUserReview(null);
      await fetchReviews();
      toast({ title: 'Review deleted' });
    } catch (error: any) {
      toast({
        title: 'Error deleting review',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const addReply = async (reviewId: string, replyText: string, parentReplyId?: string) => {
    if (!user) {
      toast({ title: 'Please sign in to reply', variant: 'destructive' });
      return;
    }

    try {
      const { error } = await supabase.from('review_replies').insert({
        review_id: reviewId,
        parent_reply_id: parentReplyId || null,
        user_id: user.id,
        reply_text: replyText,
      });

      if (error) throw error;

      await fetchReviews();
      toast({ title: 'Reply added' });
    } catch (error: any) {
      toast({
        title: 'Error adding reply',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteReply = async (replyId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('review_replies')
        .delete()
        .eq('id', replyId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchReviews();
      toast({ title: 'Reply deleted' });
    } catch (error: any) {
      toast({
        title: 'Error deleting reply',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const toggleReaction = async (
    reviewId: string,
    reactionType: 'helpful' | 'insightful' | 'funny' | 'agree' | 'disagree'
  ) => {
    if (!user) {
      toast({ title: 'Please sign in to react', variant: 'destructive' });
      return;
    }

    try {
      const review = reviews.find(r => r.id === reviewId);
      if (!review) return;

      if (review.user_reaction === reactionType) {
        const { error } = await supabase
          .from('review_reactions')
          .delete()
          .eq('review_id', reviewId)
          .eq('user_id', user.id)
          .eq('reaction_type', reactionType);

        if (error) throw error;
      } else {
        if (review.user_reaction) {
          await supabase
            .from('review_reactions')
            .delete()
            .eq('review_id', reviewId)
            .eq('user_id', user.id);
        }

        const { error } = await supabase.from('review_reactions').insert({
          review_id: reviewId,
          user_id: user.id,
          reaction_type: reactionType,
        });

        if (error) throw error;
      }

      await fetchReviews();
    } catch (error: any) {
      toast({
        title: 'Error updating reaction',
        description: error.message,
        variant: 'destructive',
      });
    }
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
