import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Trash2, Edit, User, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useReviews, Review } from "@/hooks/useReviews";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ReviewSectionProps {
  movieId: number;
  movieTitle: string;
  moviePoster?: string;
}

function StarRating({ 
  value, 
  onChange, 
  hoveredStar, 
  onHover, 
  onLeave,
  size = "md",
  interactive = true,
}: { 
  value: number; 
  onChange?: (rating: number) => void;
  hoveredStar?: number | null;
  onHover?: (star: number) => void;
  onLeave?: () => void;
  size?: "sm" | "md";
  interactive?: boolean;
}) {
  const displayValue = hoveredStar ?? value;
  const starSize = size === "sm" ? "w-4 h-4" : "w-6 h-6";
  
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
        <motion.button
          key={star}
          type="button"
          disabled={!interactive}
          onMouseEnter={() => onHover?.(star)}
          onMouseLeave={() => onLeave?.()}
          onClick={() => onChange?.(star)}
          whileHover={interactive ? { scale: 1.15 } : undefined}
          whileTap={interactive ? { scale: 0.95 } : undefined}
          className={cn(
            "transition-colors",
            interactive ? "cursor-pointer" : "cursor-default"
          )}
        >
          <Star
            className={cn(
              starSize,
              "transition-all duration-150",
              star <= displayValue 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-muted-foreground/40"
            )}
          />
        </motion.button>
      ))}
    </div>
  );
}

export function ReviewSection({ movieId, movieTitle, moviePoster }: ReviewSectionProps) {
  const { reviews, userReview, user, isLoading, addReview, deleteReview, averageRating } = useReviews(movieId);
  const [isWriting, setIsWriting] = useState(false);
  const [rating, setRating] = useState(7);
  const [reviewText, setReviewText] = useState("");
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when userReview changes
  useEffect(() => {
    if (userReview) {
      setRating(userReview.rating);
      setReviewText(userReview.review_text || "");
    } else {
      setRating(7);
      setReviewText("");
    }
  }, [userReview]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await addReview({
        movie_id: movieId,
        movie_title: movieTitle,
        movie_poster: moviePoster,
        rating,
        review_text: reviewText.trim() || undefined,
      });
      setIsWriting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    await deleteReview();
    setIsWriting(false);
  };

  const displayRating = hoveredStar ?? rating;
  const otherReviews = reviews.filter(r => r.user_id !== user?.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold">Reviews</h3>
            {reviews.length > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                <span className="font-semibold text-foreground">{averageRating.toFixed(1)}</span>
                <span>•</span>
                <span>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
        
        {user && !userReview && !isWriting && (
          <Button 
            variant="default" 
            size="sm"
            onClick={() => setIsWriting(true)}
            className="gap-2 rounded-full"
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
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-5">
              <div>
                <label className="text-sm font-medium mb-3 block">Your Rating</label>
                <div className="flex items-center gap-4">
                  <StarRating 
                    value={rating}
                    onChange={setRating}
                    hoveredStar={hoveredStar}
                    onHover={setHoveredStar}
                    onLeave={() => setHoveredStar(null)}
                  />
                  <motion.span 
                    key={displayRating}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-bold text-foreground"
                  >
                    {displayRating}<span className="text-muted-foreground text-base font-normal">/10</span>
                  </motion.span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Your thoughts (optional)</label>
                <Textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="What did you think about this movie?"
                  rows={4}
                  className="resize-none rounded-xl"
                />
              </div>
              
              <div className="flex gap-3 justify-end pt-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setIsWriting(false)}
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="gap-2 rounded-full"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User's Review */}
      <AnimatePresence>
        {userReview && !isWriting && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-primary/5 rounded-2xl p-5 border border-primary/20"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                  <AvatarImage src={userReview.profiles?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary/10">
                    <User className="w-5 h-5 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">Your Review</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex gap-0.5">
                      {[...Array(10)].map((_, i) => (
                        <Star 
                          key={i}
                          className={cn(
                            "w-3.5 h-3.5",
                            i < userReview.rating 
                              ? "fill-yellow-400 text-yellow-400" 
                              : "text-muted-foreground/30"
                          )}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-sm">{userReview.rating}/10</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsWriting(true)}
                  className="h-8 w-8 rounded-full"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleDelete}
                  className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {userReview.review_text && (
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                {userReview.review_text}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Other Reviews */}
      <div className="space-y-4">
        {otherReviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card rounded-2xl p-5 border border-border"
          >
            <div className="flex items-start gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={review.profiles?.avatar_url || ""} />
                <AvatarFallback className="bg-muted">
                  <User className="w-5 h-5 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm">
                    {review.profiles?.display_name || "Anonymous"}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-0.5">
                    {[...Array(10)].map((_, i) => (
                      <Star 
                        key={i}
                        className={cn(
                          "w-3 h-3",
                          i < review.rating 
                            ? "fill-yellow-400 text-yellow-400" 
                            : "text-muted-foreground/30"
                        )}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-xs">{review.rating}/10</span>
                </div>
                {review.review_text && (
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {review.review_text}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
      {reviews.length === 0 && !isWriting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 px-4"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            {user ? "Be the first to review this movie!" : "Sign in to write a review."}
          </p>
          {user && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsWriting(true)}
              className="mt-4 gap-2 rounded-full"
            >
              <Edit className="w-4 h-4" />
              Write Review
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
}
