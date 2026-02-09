import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit, User, MessageCircle, AlertTriangle, Trash2, MoreVertical, Eye, EyeOff, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEnhancedReviews } from "@/hooks/useEnhancedReviews";
import { formatDistanceToNow } from "date-fns";
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

// Emotion-based rating options
const EMOTION_RATINGS = [
  { value: 10, emoji: "🤯", label: "Mind-blowing", color: "hsl(var(--primary))" },
  { value: 8, emoji: "❤️", label: "Loved it", color: "hsl(340 82% 52%)" },
  { value: 6, emoji: "😊", label: "Enjoyed it", color: "hsl(142 71% 45%)" },
  { value: 4, emoji: "😐", label: "It was okay", color: "hsl(45 93% 47%)" },
  { value: 2, emoji: "😞", label: "Disappointed", color: "hsl(0 84% 60%)" },
] as const;

function getEmotionForRating(rating: number) {
  if (rating >= 9) return EMOTION_RATINGS[0];
  if (rating >= 7) return EMOTION_RATINGS[1];
  if (rating >= 5) return EMOTION_RATINGS[2];
  if (rating >= 3) return EMOTION_RATINGS[3];
  return EMOTION_RATINGS[4];
}

// Sentiment Pie Chart
function SentimentPieChart({ reviews }: { reviews: { rating: number; review_text: string | null }[] }) {
  const segments = useMemo(() => {
    const counts: Record<string, number> = {};
    EMOTION_RATINGS.forEach(e => { counts[e.label] = 0; });
    reviews.forEach(r => {
      const emotion = getEmotionForRating(r.rating);
      counts[emotion.label]++;
    });
    return EMOTION_RATINGS.map(e => ({
      ...e,
      count: counts[e.label],
      percentage: reviews.length > 0 ? (counts[e.label] / reviews.length) * 100 : 0,
    })).filter(s => s.count > 0);
  }, [reviews]);

  const summary = useMemo(() => {
    if (reviews.length === 0) return null;
    const total = reviews.length;
    const positive = reviews.filter(r => r.rating >= 7).length;
    const pct = Math.round((positive / total) * 100);
    
    // Extract key phrases from review texts
    const texts = reviews.filter(r => r.review_text).map(r => r.review_text!);
    const hasTexts = texts.length > 0;
    
    if (pct >= 80) return `${pct}% of viewers loved this movie.${hasTexts ? " Highly recommended by the community." : " A crowd favorite."}`;
    if (pct >= 60) return `${pct}% positive. ${hasTexts ? "Most viewers found it worth watching." : "Generally well-received."}`;
    if (pct >= 40) return `Mixed reception — opinions are divided.${hasTexts ? " Worth a watch to form your own opinion." : ""}`;
    return `Only ${pct}% positive. ${hasTexts ? "Might not be for everyone." : "Proceed with caution."}`;
  }, [reviews]);

  if (reviews.length === 0) return null;

  const size = 100;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl bg-card border border-border"
    >
      <div className="flex items-center gap-2 mb-4">
        <PieChart className="w-4 h-4 text-primary" />
        <h4 className="font-semibold text-sm">What viewers felt</h4>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative flex-shrink-0">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {segments.map((seg) => {
              const segLength = (seg.percentage / 100) * circumference;
              const dashArray = `${segLength} ${circumference - segLength}`;
              const currentOffset = offset;
              offset += segLength;
              return (
                <circle
                  key={seg.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={dashArray}
                  strokeDashoffset={-currentOffset}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                  style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-base font-bold">{reviews.length}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          {segments.map(seg => (
            <div key={seg.label} className="flex items-center gap-2 text-xs">
              <span className="text-sm">{seg.emoji}</span>
              <span className="flex-1 text-muted-foreground truncate">{seg.label}</span>
              <span className="font-semibold tabular-nums">{Math.round(seg.percentage)}%</span>
            </div>
          ))}
        </div>
      </div>

      {summary && (
        <p className="text-xs text-muted-foreground mt-4 leading-relaxed border-t border-border pt-3">
          {summary}
        </p>
      )}
    </motion.div>
  );
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
    toggleReaction,
    averageRating,
  } = useEnhancedReviews(movieId);

  const [isWriting, setIsWriting] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<typeof EMOTION_RATINGS[number] | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [sortBy, setSortBy] = useState<"helpful" | "recent">("recent");
  const [revealedSpoilers, setRevealedSpoilers] = useState<Set<string>>(new Set());

  // Initialize from existing review
  useState(() => {
    if (userReview) {
      setSelectedEmotion(getEmotionForRating(userReview.rating));
      setReviewText(userReview.review_text || "");
    }
  });

  const handleSubmit = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!selectedEmotion) return;
    await addReview({
      movie_id: movieId,
      movie_title: movieTitle,
      movie_poster: moviePoster,
      rating: selectedEmotion.value,
      review_text: reviewText,
      is_spoiler: isSpoiler,
    });
    setIsWriting(false);
    setSelectedEmotion(null);
    setReviewText("");
    setIsSpoiler(false);
  };

  const handleWriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWriting(true);
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWriting(false);
  };

  const toggleSpoilerReveal = (e: React.MouseEvent, reviewId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setRevealedSpoilers(prev => {
      const next = new Set(prev);
      if (next.has(reviewId)) next.delete(reviewId);
      else next.add(reviewId);
      return next;
    });
  };

  const sortedReviews = [...reviews]
    .filter((r) => r.user_id !== user?.id)
    .sort((a, b) => {
      if (sortBy === "helpful") return b.helpful_count - a.helpful_count;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div 
      className="space-y-6" 
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h3 className="font-display text-xl font-bold">Reviews</h3>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-lg">
              <span className="text-base">{getEmotionForRating(averageRating).emoji}</span>
              <span className="font-bold text-sm">{averageRating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({reviews.length})</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {reviews.length > 1 && (
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as "helpful" | "recent")}>
              <SelectTrigger className="w-[120px] h-8 text-xs rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="helpful">Most Helpful</SelectItem>
              </SelectContent>
            </Select>
          )}

          {user && !userReview && !isWriting && (
            <Button
              variant="default"
              size="sm"
              onClick={handleWriteClick}
              className="gap-2 rounded-full"
              type="button"
            >
              <Edit className="w-4 h-4" />
              Write Review
            </Button>
          )}
        </div>
      </div>

      {/* Sentiment Pie Chart */}
      {reviews.length >= 2 && <SentimentPieChart reviews={reviews} />}

      {/* Write Review Form */}
      <AnimatePresence>
        {isWriting && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-card rounded-2xl p-6 border border-border shadow-lg space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Emotion Selection */}
            <div>
              <label className="text-sm font-semibold mb-3 block">How did this movie make you feel?</label>
              <div className="flex gap-2 flex-wrap">
                {EMOTION_RATINGS.map((emotion) => {
                  const isActive = selectedEmotion?.value === emotion.value;
                  return (
                    <motion.button
                      key={emotion.value}
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedEmotion(emotion);
                      }}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
                        isActive
                          ? "bg-primary/10 border-primary shadow-sm"
                          : "bg-secondary/50 border-border hover:bg-secondary"
                      }`}
                    >
                      <span className="text-lg">{emotion.emoji}</span>
                      <span className={`text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                        {emotion.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Review Text */}
            <div>
              <label className="text-sm font-semibold mb-2 block">
                Your thoughts <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <Textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="What made it special? Share your insights..."
                rows={3}
                className="resize-none rounded-xl bg-secondary/30 border-border focus:border-primary/50"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Spoiler Toggle */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
              <Switch
                id="spoiler-toggle-write"
                checked={isSpoiler}
                onCheckedChange={(checked) => {
                  setIsSpoiler(checked);
                }}
              />
              <Label htmlFor="spoiler-toggle-write" className="text-sm flex items-center gap-2 cursor-pointer text-muted-foreground">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Contains spoilers
              </Label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={handleCancelClick} type="button" size="sm" className="rounded-full">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                type="button"
                disabled={!selectedEmotion}
                size="sm"
                className="rounded-full"
              >
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
          className="bg-accent/10 rounded-2xl p-4 border border-accent/20 space-y-3"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9">
                <AvatarImage src={userReview.profiles?.avatar_url || ""} />
                <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">Your Review</p>
                <div className="flex items-center gap-2">
                  <span className="text-base">{getEmotionForRating(userReview.rating).emoji}</span>
                  <span className="font-medium text-xs text-muted-foreground">
                    {getEmotionForRating(userReview.rating).label}
                  </span>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" type="button">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEmotion(getEmotionForRating(userReview.rating));
                  setReviewText(userReview.review_text || "");
                  setIsWriting(true);
                }}>
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); deleteReview(); }}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
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
      <div className="space-y-3">
        {sortedReviews.map((review) => {
          const isSpoilerHidden = review.is_spoiler && !revealedSpoilers.has(review.id);

          return (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl p-4 border border-border space-y-2"
            >
              <div className="flex items-start gap-3">
                <Avatar className="w-9 h-9">
                  <AvatarImage src={review.profiles?.avatar_url || ""} />
                  <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm truncate">
                      {review.profiles?.display_name || "Anonymous"}
                    </p>
                    <span className="text-sm">{getEmotionForRating(review.rating).emoji}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                    </span>
                    {review.is_spoiler && (
                      <button
                        onClick={(e) => toggleSpoilerReveal(e, review.id)}
                        type="button"
                        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-orange-500/15 text-orange-500 rounded-full hover:bg-orange-500/25 transition-colors"
                      >
                        {isSpoilerHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {isSpoilerHidden ? "Show Spoiler" : "Hide Spoiler"}
                      </button>
                    )}
                  </div>

                  {review.review_text && (
                    <div className="relative mt-2">
                      <AnimatePresence mode="wait">
                        {isSpoilerHidden ? (
                          <motion.div
                            key="hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="relative cursor-pointer"
                            onClick={(e) => toggleSpoilerReveal(e, review.id)}
                          >
                            <p className="text-sm text-muted-foreground/30 select-none blur-[6px] leading-relaxed pointer-events-none">
                              {review.review_text}
                            </p>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs text-orange-500 font-medium bg-orange-500/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                <EyeOff className="w-3.5 h-3.5" />
                                Tap to reveal spoiler
                              </span>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.p
                            key="visible"
                            initial={{ opacity: 0, filter: "blur(8px)" }}
                            animate={{ opacity: 1, filter: "blur(0px)" }}
                            transition={{ duration: 0.4 }}
                            className="text-sm text-foreground leading-relaxed break-words"
                          >
                            {review.review_text}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty */}
      {reviews.length === 0 && !isWriting && (
        <div className="text-center py-12 space-y-3">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
            <MessageCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            {user ? "Be the first to share your thoughts!" : "Sign in to write a review."}
          </p>
          {user && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleWriteClick}
              className="rounded-full gap-2"
              type="button"
            >
              <Edit className="w-4 h-4" /> Write Review
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
