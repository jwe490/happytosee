import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Edit, User, MessageCircle, AlertTriangle, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEnhancedReviews } from "@/hooks/useEnhancedReviews";
import { formatDistanceToNow } from "date-fns";
import { ReviewReactionButtons } from "./ReviewReactionButtons";
import { ReviewReplyThread } from "./ReviewReplyThread";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EnhancedReviewSectionProps {
  movieId: number;
  movieTitle: string;
  moviePoster?: string;
}

export function EnhancedReviewSection({
  movieId,
  movieTitle,
  moviePoster,
}: EnhancedReviewSectionProps) {
  const {
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
  } = useEnhancedReviews(movieId);

  const [isWriting, setIsWriting] = useState(false);
  const [rating, setRating] = useState(userReview?.rating || 7);
  const [reviewText, setReviewText] = useState(userReview?.review_text || "");
  const [isSpoiler, setIsSpoiler] = useState(userReview?.is_spoiler || false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"helpful" | "recent">("helpful");
  const [replyingToReview, setReplyingToReview] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleSubmit = async () => {
    await addReview({
      movie_id: movieId,
      movie_title: movieTitle,
      movie_poster: moviePoster,
      rating,
      review_text: reviewText,
      is_spoiler: isSpoiler,
    });
    setIsWriting(false);
  };

  const handleSubmitReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    addReply(reviewId, replyText);
    setReplyText("");
    setReplyingToReview(null);
  };

  const displayRating = hoveredStar !== null ? hoveredStar : rating;

  const sortedReviews = [...reviews]
    .filter((r) => r.user_id !== user?.id)
    .sort((a, b) => {
      if (sortBy === "helpful") {
        return b.helpful_count - a.helpful_count;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h3 className="font-display text-xl font-bold">Reviews & Discussion</h3>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-lg">
              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              <span className="font-bold">{averageRating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {reviews.length > 1 && (
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as "helpful" | "recent")}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="helpful">Most Helpful</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
              </SelectContent>
            </Select>
          )}

          {user && !userReview && !isWriting && (
            <Button variant="default" size="sm" onClick={() => setIsWriting(true)} className="gap-2">
              <Edit className="w-4 h-4" />
              Write Review
            </Button>
          )}
        </div>
      </div>

      {/* Write Review Form */}
      <AnimatePresence>
        {isWriting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card rounded-xl p-5 border border-border space-y-4"
          >
            <div>
              <label className="text-sm font-semibold mb-3 block">Your Rating</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(null)}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        star <= displayRating
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-3 text-2xl font-bold">{displayRating}/10</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Your Thoughts (optional)</label>
              <Textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="What did you think about this movie? Share your insights, favorite scenes, or what made it special..."
                rows={5}
                className="resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="spoiler-toggle"
                checked={isSpoiler}
                onCheckedChange={setIsSpoiler}
              />
              <Label htmlFor="spoiler-toggle" className="text-sm flex items-center gap-2 cursor-pointer">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Contains spoilers
              </Label>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="ghost" onClick={() => setIsWriting(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Submit Review</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User's Review */}
      {userReview && !isWriting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-accent/10 rounded-xl p-4 border border-accent/20 space-y-3"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9">
                <AvatarImage src={userReview.profiles?.avatar_url || ""} />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">Your Review</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-bold text-sm">{userReview.rating}/10</span>
                  </div>
                  {userReview.is_spoiler && (
                    <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-500 rounded">
                      Spoiler
                    </span>
                  )}
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setRating(userReview.rating);
                    setReviewText(userReview.review_text || "");
                    setIsSpoiler(userReview.is_spoiler);
                    setIsWriting(true);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={deleteReview} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {userReview.review_text && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {userReview.review_text}
            </p>
          )}
        </motion.div>
      )}

      {/* Other Reviews */}
      <div className="space-y-5">
        {sortedReviews.map((review) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl p-4 border border-border space-y-3"
          >
            <div className="flex items-start gap-3">
              <Avatar className="w-9 h-9">
                <AvatarImage src={review.profiles?.avatar_url || ""} />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-semibold text-sm truncate">
                    {review.profiles?.display_name || "Anonymous"}
                  </p>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-bold text-sm">{review.rating}/10</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                  </span>
                  {review.is_edited && (
                    <span className="text-xs text-muted-foreground italic">(edited)</span>
                  )}
                  {review.is_spoiler && (
                    <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-500 rounded">
                      Spoiler
                    </span>
                  )}
                </div>

                {review.review_text && (
                  <p className="text-sm text-foreground leading-relaxed mt-2 break-words">
                    {review.review_text}
                  </p>
                )}

                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <ReviewReactionButtons
                    helpfulCount={review.helpful_count}
                    userReaction={review.user_reaction}
                    onToggleReaction={(type) => toggleReaction(review.id, type)}
                  />

                  {user && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingToReview(review.id)}
                      className="gap-1.5 h-7 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Reply
                      {review.reply_count > 0 && (
                        <span className="font-semibold">({review.reply_count})</span>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {replyingToReview === review.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-12 space-y-2"
                >
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Share your thoughts on this review..."
                    className="min-h-[80px] text-sm"
                    rows={3}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setReplyingToReview(null);
                        setReplyText("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSubmitReply(review.id)}
                      disabled={!replyText.trim()}
                    >
                      Post Reply
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {review.replies && review.replies.length > 0 && (
              <div className="ml-12">
                <ReviewReplyThread
                  replies={review.replies}
                  reviewId={review.id}
                  currentUserId={user?.id}
                  onAddReply={addReply}
                  onDeleteReply={deleteReply}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {reviews.length === 0 && !isWriting && (
        <div className="text-center py-12 space-y-3">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
            <MessageCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            No reviews yet. {user ? "Be the first to share your thoughts!" : "Sign in to write a review."}
          </p>
        </div>
      )}
    </div>
  );
}
