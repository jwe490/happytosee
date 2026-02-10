import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit, User, MessageCircle, AlertTriangle, Trash2, MoreVertical, Eye, EyeOff, Send, Reply } from "lucide-react";
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

// Realistic movie-centric rating options (not emoji-based)
const EMOTION_RATINGS = [
  { value: 10, icon: "✦", label: "Masterpiece", sublabel: "An unforgettable cinematic experience", color: "hsl(var(--primary))" },
  { value: 8, icon: "◆", label: "Must Watch", sublabel: "Highly recommended for any viewer", color: "hsl(142 71% 45%)" },
  { value: 6, icon: "●", label: "Worth It", sublabel: "Enjoyable with some great moments", color: "hsl(45 93% 47%)" },
  { value: 4, icon: "◇", label: "Average", sublabel: "Has its moments but nothing special", color: "hsl(25 95% 53%)" },
  { value: 2, icon: "○", label: "Skip It", sublabel: "Didn't live up to expectations", color: "hsl(0 84% 60%)" },
] as const;

function getEmotionForRating(rating: number) {
  if (rating >= 9) return EMOTION_RATINGS[0];
  if (rating >= 7) return EMOTION_RATINGS[1];
  if (rating >= 5) return EMOTION_RATINGS[2];
  if (rating >= 3) return EMOTION_RATINGS[3];
  return EMOTION_RATINGS[4];
}

// Enhanced Sentiment Pie Chart with infographic
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
    const masterpiece = reviews.filter(r => r.rating >= 9).length;
    const mustWatch = reviews.filter(r => r.rating >= 7 && r.rating < 9).length;
    const worthIt = reviews.filter(r => r.rating >= 5 && r.rating < 7).length;
    const negative = reviews.filter(r => r.rating < 5).length;
    const avgRating = reviews.reduce((a, r) => a + r.rating, 0) / total;
    
    // Extract key themes from reviews
    const texts = reviews.filter(r => r.review_text && r.review_text.length > 10).map(r => r.review_text!);
    const wordCount = texts.join(" ").split(/\s+/).length;
    
    let verdict = "";
    if (avgRating >= 8.5) verdict = `Overwhelmingly positive — ${Math.round(((masterpiece + mustWatch) / total) * 100)}% of viewers call it a must-watch or masterpiece. ${texts.length > 0 ? `Viewers praised it in ${texts.length} detailed reviews.` : "The audience has spoken."}`;
    else if (avgRating >= 7) verdict = `Well-received — most viewers found it worth their time. ${mustWatch > 0 ? `${mustWatch} viewer${mustWatch > 1 ? 's' : ''} recommend${mustWatch === 1 ? 's' : ''} it as a must-watch.` : ""} ${negative > 0 ? `However, ${negative} had reservations.` : ""}`;
    else if (avgRating >= 5) verdict = `Mixed reception — opinions vary. ${worthIt} found it worth watching while ${negative} were less impressed. Worth forming your own opinion.`;
    else verdict = `Below average — most viewers were disappointed. Only ${Math.round(((total - negative) / total) * 100)}% had a positive experience.`;
    
    return verdict;
  }, [reviews]);

  if (reviews.length === 0) return null;

  const size = 120;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const avgRating = (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-card border border-border"
    >
      <h4 className="font-semibold text-base mb-5">What viewers are saying</h4>

      <div className="flex items-start gap-6">
        {/* Donut chart */}
        <div className="relative flex-shrink-0">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} />
            {segments.map((seg) => {
              const segLength = (seg.percentage / 100) * circumference;
              const gap = segments.length > 1 ? 3 : 0;
              const dashArray = `${Math.max(segLength - gap, 1)} ${circumference - segLength + gap}`;
              const currentOffset = offset;
              offset += segLength;
              return (
                <motion.circle
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
                  initial={{ strokeDasharray: `0 ${circumference}` }}
                  animate={{ strokeDasharray: dashArray }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                  style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold leading-none">{avgRating.toFixed(1)}</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">{reviews.length} reviews</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 min-w-0 space-y-2">
          {segments.map(seg => (
            <div key={seg.label} className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{seg.label}</span>
                  <span className="text-sm font-bold tabular-nums">{Math.round(seg.percentage)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: seg.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${seg.percentage}%` }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {summary && (
        <div className="mt-5 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {summary}
          </p>
        </div>
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
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

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
      review_text: isSpoiler ? `[SPOILER] ${reviewText}` : reviewText,
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

  // Detect spoiler from review text or is_spoiler flag
  const isSpoilerReview = (review: { is_spoiler: boolean; review_text: string | null }) => {
    return review.is_spoiler || (review.review_text?.startsWith("[SPOILER]") ?? false);
  };

  const getCleanReviewText = (text: string) => {
    return text.replace(/^\[SPOILER\]\s*/, "");
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
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h3 className="font-display text-xl font-bold">Reviews</h3>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full">
              <span className="text-xs font-bold" style={{ color: getEmotionForRating(averageRating).color }}>
                {getEmotionForRating(averageRating).icon}
              </span>
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
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Rating Selection - realistic buttons */}
            <div>
              <label className="text-sm font-semibold mb-3 block">Rate this film</label>
              <div className="space-y-2">
                {EMOTION_RATINGS.map((emotion) => {
                  const isActive = selectedEmotion?.value === emotion.value;
                  return (
                    <motion.button
                      key={emotion.value}
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedEmotion(emotion);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200 ${
                        isActive
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border bg-secondary/30 hover:bg-secondary/60"
                      }`}
                    >
                      <span 
                        className="text-lg font-bold w-6 text-center"
                        style={{ color: isActive ? emotion.color : "hsl(var(--muted-foreground))" }}
                      >
                        {emotion.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-semibold block ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                          {emotion.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{emotion.sublabel}</span>
                      </div>
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </motion.div>
                      )}
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
                placeholder="What stood out? Would you recommend it? Share your take..."
                rows={4}
                className="resize-none rounded-xl bg-secondary/30 border-border focus:border-primary/50"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              />
            </div>

            {/* Spoiler Toggle */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-500/5 border border-orange-500/20">
              <Switch
                id="spoiler-toggle-write"
                checked={isSpoiler}
                onCheckedChange={(checked) => setIsSpoiler(checked)}
              />
              <Label htmlFor="spoiler-toggle-write" className="text-sm flex items-center gap-2 cursor-pointer">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-foreground font-medium">Contains spoilers</span>
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
                className="rounded-full gap-2"
              >
                <Send className="w-3.5 h-3.5" />
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
          className="bg-primary/5 rounded-2xl p-5 border border-primary/20 space-y-3"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9">
                <AvatarImage src={userReview.profiles?.avatar_url || ""} />
                <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">Your Review</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-bold text-xs" style={{ color: getEmotionForRating(userReview.rating).color }}>
                    {getEmotionForRating(userReview.rating).icon}
                  </span>
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
                  setReviewText(userReview.review_text ? getCleanReviewText(userReview.review_text) : "");
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
            <p className="text-sm text-foreground leading-relaxed">
              {getCleanReviewText(userReview.review_text)}
            </p>
          )}
        </motion.div>
      )}

      {/* Other Reviews */}
      <div className="space-y-3">
        {sortedReviews.map((review) => {
          const hasSpoiler = isSpoilerReview(review);
          const isSpoilerHidden = hasSpoiler && !revealedSpoilers.has(review.id);
          const cleanText = review.review_text ? getCleanReviewText(review.review_text) : null;

          return (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl p-5 border border-border space-y-3"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
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
                    <span className="font-bold text-xs" style={{ color: getEmotionForRating(review.rating).color }}>
                      {getEmotionForRating(review.rating).icon} {getEmotionForRating(review.rating).label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  {/* Spoiler badge */}
                  {hasSpoiler && (
                    <button
                      onClick={(e) => toggleSpoilerReveal(e, review.id)}
                      type="button"
                      className="mt-1.5 inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-orange-500/10 text-orange-500 rounded-full hover:bg-orange-500/20 transition-colors"
                    >
                      {isSpoilerHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {isSpoilerHidden ? "Contains spoiler — tap to reveal" : "Hide spoiler"}
                    </button>
                  )}

                  {/* Review text with spoiler blur */}
                  {cleanText && hasSpoiler && (
                    <div className="relative mt-2">
                      <AnimatePresence mode="wait">
                        {isSpoilerHidden ? (
                          <motion.div
                            key="hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="relative cursor-pointer rounded-lg overflow-hidden"
                            onClick={(e) => toggleSpoilerReveal(e, review.id)}
                          >
                            <p className="text-sm text-muted-foreground/20 select-none leading-relaxed pointer-events-none" style={{ filter: "blur(6px)" }}>
                              {cleanText}
                            </p>
                            <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-[2px] rounded-lg">
                              <span className="text-xs font-medium bg-orange-500/10 text-orange-500 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
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
                            {cleanText}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Non-spoiler text */}
                  {cleanText && !hasSpoiler && (
                    <p className="text-sm text-foreground leading-relaxed mt-2 break-words">
                      {cleanText}
                    </p>
                  )}

                  {/* Reply button */}
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReplyingTo(replyingTo === review.id ? null : review.id);
                        setReplyText("");
                      }}
                      className="h-7 px-3 text-xs text-muted-foreground hover:text-foreground rounded-full gap-1.5"
                      type="button"
                    >
                      <Reply className="w-3 h-3" />
                      Reply
                    </Button>
                  </div>

                  {/* Reply input */}
                  <AnimatePresence>
                    {replyingTo === review.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 space-y-2 overflow-hidden"
                      >
                        <Textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Reply to ${review.profiles?.display_name || "this review"}...`}
                          className="min-h-[60px] text-sm resize-none rounded-xl"
                          rows={2}
                          onClick={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); setReplyingTo(null); }}
                            type="button"
                            className="rounded-full text-xs"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            disabled={!replyText.trim()}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleReaction(review.id, "helpful");
                              setReplyingTo(null);
                              setReplyText("");
                            }}
                            type="button"
                            className="rounded-full text-xs gap-1.5"
                          >
                            <Send className="w-3 h-3" />
                            Reply
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
