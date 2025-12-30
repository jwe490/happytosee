import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Trash2, Edit, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useReviews, Review } from "@/hooks/useReviews";
import { formatDistanceToNow } from "date-fns";

interface ReviewSectionProps {
  movieId: number;
  movieTitle: string;
  moviePoster?: string;
}

export function ReviewSection({ movieId, movieTitle, moviePoster }: ReviewSectionProps) {
  const { reviews, userReview, user, isLoading, addReview, deleteReview, averageRating } = useReviews(movieId);
  const [isWriting, setIsWriting] = useState(false);
  const [rating, setRating] = useState(userReview?.rating || 7);
  const [reviewText, setReviewText] = useState(userReview?.review_text || "");
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const handleSubmit = async () => {
    await addReview({
      movie_id: movieId,
      movie_title: movieTitle,
      movie_poster: moviePoster,
      rating,
      review_text: reviewText,
    });
    setIsWriting(false);
  };

  const displayRating = hoveredStar !== null ? hoveredStar : rating;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="font-display text-xl font-bold">Reviews</h3>
          {reviews.length > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              <span className="font-medium">{averageRating.toFixed(1)}</span>
              <span className="text-sm">({reviews.length})</span>
            </div>
          )}
        </div>
        
        {user && !userReview && !isWriting && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsWriting(true)}
            className="gap-2"
          >
            <Edit className="w-4 h-4" />
            Write Review
          </Button>
        )}
      </div>

      {/* Write Review Form */}
      <AnimatePresence>
        {isWriting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card rounded-xl p-4 border border-border space-y-4"
          >
            <div>
              <label className="text-sm font-medium mb-2 block">Your Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(null)}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`w-6 h-6 transition-colors ${
                        star <= displayRating 
                          ? "fill-yellow-500 text-yellow-500" 
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-lg font-bold">{displayRating}/10</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Your Review (optional)</label>
              <Textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts about this movie..."
                rows={4}
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setIsWriting(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                Submit Review
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User's Review */}
      {userReview && !isWriting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-accent/10 rounded-xl p-4 border border-accent/20"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={userReview.profiles?.avatar_url || ""} />
                <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">Your Review</p>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <span className="font-bold">{userReview.rating}/10</span>
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setRating(userReview.rating);
                  setReviewText(userReview.review_text || "");
                  setIsWriting(true);
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={deleteReview}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
          {userReview.review_text && (
            <p className="mt-3 text-sm text-muted-foreground">
              {userReview.review_text}
            </p>
          )}
        </motion.div>
      )}

      {/* Other Reviews */}
      <div className="space-y-4">
        {reviews
          .filter(r => r.user_id !== user?.id)
          .map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl p-4 border border-border"
            >
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={review.profiles?.avatar_url || ""} />
                  <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">
                      {review.profiles?.display_name || "Anonymous"}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-bold text-sm">{review.rating}/10</span>
                  </div>
                  {review.review_text && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {review.review_text}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
      </div>

      {reviews.length === 0 && !isWriting && (
        <p className="text-center text-muted-foreground py-8">
          No reviews yet. {user ? "Be the first to review!" : "Sign in to write a review."}
        </p>
      )}
    </div>
  );
}
