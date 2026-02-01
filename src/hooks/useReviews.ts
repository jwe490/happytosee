import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Review {
  id: string;
  user_id: string;
  movie_id: number;
  movie_title: string;
  movie_poster: string | null;
  rating: number;
  review_text: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export function useReviews(movieId?: number) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Re-fetch reviews when user changes
    if (movieId) {
      fetchReviews();
    }
  }, [user?.id, movieId]);

  const fetchReviews = useCallback(async () => {
    if (!movieId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('movie_id', movieId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles separately
      const userIds = [...new Set((data || []).map(r => r.user_id))];
      
      let profileMap = new Map<string, { display_name: string | null; avatar_url: string | null }>();
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url')
          .in('user_id', userIds);

        profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      }

      const reviewsWithProfiles: Review[] = (data || []).map(r => ({
        ...r,
        profiles: profileMap.get(r.user_id) as { display_name: string | null; avatar_url: string | null } | undefined,
      }));

      setReviews(reviewsWithProfiles);
      
      if (user) {
        const myReview = reviewsWithProfiles.find(r => r.user_id === user.id);
        setUserReview(myReview || null);
      } else {
        setUserReview(null);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  }, [movieId, user?.id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const addReview = async (review: {
    movie_id: number;
    movie_title: string;
    movie_poster?: string;
    rating: number;
    review_text?: string;
  }) => {
    if (!user) {
      toast({ title: 'Please sign in to write a review', variant: 'destructive' });
      return;
    }

    try {
      // Check if user already has a review for this movie
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', user.id)
        .eq('movie_id', review.movie_id)
        .maybeSingle();

      if (existingReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({
            rating: review.rating,
            review_text: review.review_text || null,
            movie_poster: review.movie_poster || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingReview.id);

        if (error) throw error;
      } else {
        // Insert new review
        const { error } = await supabase
          .from('reviews')
          .insert({
            user_id: user.id,
            movie_id: review.movie_id,
            movie_title: review.movie_title,
            movie_poster: review.movie_poster || null,
            rating: review.rating,
            review_text: review.review_text || null,
          });

        if (error) throw error;
      }

      await fetchReviews();
      toast({ title: 'Review submitted successfully' });
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({ title: 'Error submitting review', description: error.message, variant: 'destructive' });
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
      toast({ title: 'Error deleting review', description: error.message, variant: 'destructive' });
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  return {
    reviews,
    userReview,
    user,
    isLoading,
    addReview,
    deleteReview,
    averageRating,
    refetch: fetchReviews,
  };
}
