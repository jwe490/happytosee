import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit, User, MessageCircle, AlertTriangle, Trash2, MoreVertical, Eye, EyeOff, Send, Reply, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEnhancedReviews } from "@/hooks/useEnhancedReviews";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface EnhancedReviewSectionProps {
  movieId: number;
  movieTitle: string;
  moviePoster?: string;
}

// Film-centric rating categories
const EMOTION_RATINGS = [
  { value: 10, label: "Masterpiece", sublabel: "An unforgettable cinematic experience", color: "hsl(var(--primary))" },
  { value: 8, label: "Must Watch", sublabel: "Highly recommended", color: "hsl(142 71% 45%)" },
  { value: 6, label: "Worth It", sublabel: "Enjoyable with great moments", color: "hsl(45 93% 47%)" },
  { value: 4, label: "Average", sublabel: "Has its moments", color: "hsl(25 95% 53%)" },
  { value: 2, label: "Skip It", sublabel: "Didn't live up", color: "hsl(0 84% 60%)" },
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
    reviews.forEach(r => { counts[getEmotionForRating(r.rating).label]++; });
    return EMOTION_RATINGS.map(e => ({
      ...e, count: counts[e.label],
      percentage: reviews.length > 0 ? (counts[e.label] / reviews.length) * 100 : 0,
    })).filter(s => s.count > 0);
  }, [reviews]);

  const summary = useMemo(() => {
    if (reviews.length === 0) return null;
    const total = reviews.length;
    const avgRating = reviews.reduce((a, r) => a + r.rating, 0) / total;
    const positive = reviews.filter(r => r.rating >= 7).length;
    const posPercent = Math.round((positive / total) * 100);

    if (avgRating >= 8.5) return `Overwhelmingly positive — ${posPercent}% of viewers call it a must-watch or masterpiece.`;
    if (avgRating >= 7) return `Well-received by most viewers. ${posPercent}% rated it positively.`;
    if (avgRating >= 5) return `Mixed reception — opinions vary. Worth forming your own take.`;
    return `Below average — most viewers were disappointed.`;
  }, [reviews]);

  if (reviews.length === 0) return null;

  const size = 100;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const avgRating = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-card border border-border">
      <h4 className="font-semibold text-sm mb-4 text-foreground">Viewer Sentiment</h4>
      <div className="flex items-start gap-5">
        <div className="relative flex-shrink-0">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} />
            {segments.map(seg => {
              const segLen = (seg.percentage / 100) * circumference;
              const gap = segments.length > 1 ? 2 : 0;
              const dash = `${Math.max(segLen - gap, 1)} ${circumference - segLen + gap}`;
              const cur = offset;
              offset += segLen;
              return (
                <motion.circle key={seg.label} cx={size/2} cy={size/2} r={radius} fill="none" stroke={seg.color} strokeWidth={strokeWidth} strokeDasharray={dash} strokeDashoffset={-cur} strokeLinecap="round" initial={{ strokeDasharray: `0 ${circumference}` }} animate={{ strokeDasharray: dash }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }} style={{ transform: "rotate(-90deg)", transformOrigin: "center" }} />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold leading-none">{avgRating.toFixed(1)}</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">{reviews.length} reviews</span>
          </div>
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          {segments.map(seg => (
            <div key={seg.label} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-xs font-medium flex-1">{seg.label}</span>
              <span className="text-xs font-bold tabular-nums">{Math.round(seg.percentage)}%</span>
            </div>
          ))}
        </div>
      </div>
      {summary && <p className="text-xs text-muted-foreground leading-relaxed mt-4 pt-3 border-t border-border">{summary}</p>}
    </motion.div>
  );
}

export function EnhancedReviewSection({ movieId, movieTitle, moviePoster }: EnhancedReviewSectionProps) {
  const {
    reviews, userReview, user, isLoading, addReview, deleteReview, toggleReaction, averageRating,
  } = useEnhancedReviews(movieId);

  const [isWriting, setIsWriting] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<typeof EMOTION_RATINGS[number] | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [sortBy, setSortBy] = useState<"helpful" | "recent">("recent");
  const [revealedSpoilers, setRevealedSpoilers] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useState(() => {
    if (userReview) {
      setSelectedEmotion(getEmotionForRating(userReview.rating));
      setReviewText(userReview.review_text || "");
    }
  });

  const handleSubmit = async (e?: React.MouseEvent) => {
    e?.preventDefault(); e?.stopPropagation();
    if (!selectedEmotion) return;
    await addReview({
      movie_id: movieId, movie_title: movieTitle, movie_poster: moviePoster,
      rating: selectedEmotion.value,
      review_text: isSpoiler ? `[SPOILER] ${reviewText}` : reviewText,
      is_spoiler: isSpoiler,
    });
    setIsWriting(false); setSelectedEmotion(null); setReviewText(""); setIsSpoiler(false);
  };

  const toggleSpoilerReveal = (e: React.MouseEvent, reviewId: string) => {
    e.preventDefault(); e.stopPropagation();
    setRevealedSpoilers(prev => {
      const next = new Set(prev);
      next.has(reviewId) ? next.delete(reviewId) : next.add(reviewId);
      return next;
    });
  };

  const isSpoilerReview = (review: { is_spoiler: boolean; review_text: string | null }) =>
    review.is_spoiler || (review.review_text?.startsWith("[SPOILER]") ?? false);

  const getCleanText = (text: string) => text.replace(/^\[SPOILER\]\s*/, "");

  const sortedReviews = [...reviews]
    .filter(r => r.user_id !== user?.id)
    .sort((a, b) => sortBy === "helpful" ? b.helpful_count - a.helpful_count : new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-5" onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h3 className="font-display text-xl font-bold">Reviews</h3>
          {reviews.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-secondary rounded-full">
              <span className="font-bold text-sm">{averageRating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({reviews.length})</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {reviews.length > 1 && (
            <Select value={sortBy} onValueChange={v => setSortBy(v as any)}>
              <SelectTrigger className="w-[110px] h-8 text-xs rounded-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="helpful">Helpful</SelectItem>
              </SelectContent>
            </Select>
          )}
          {user && !userReview && !isWriting && (
            <Button variant="default" size="sm" onClick={e => { e.preventDefault(); e.stopPropagation(); setIsWriting(true); }} className="gap-1.5 rounded-full text-xs" type="button">
              <Edit className="w-3.5 h-3.5" /> Write Review
            </Button>
          )}
        </div>
      </div>

      {/* Pie chart */}
      {reviews.length >= 2 && <SentimentPieChart reviews={reviews} />}

      {/* Write form */}
      <AnimatePresence>
        {isWriting && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.97 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="bg-card rounded-2xl p-5 border border-border shadow-lg space-y-4" onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()}>
            <div>
              <label className="text-sm font-semibold mb-2.5 block">How would you rate this film?</label>
              <div className="grid grid-cols-1 gap-1.5">
                {EMOTION_RATINGS.map(emotion => {
                  const isActive = selectedEmotion?.value === emotion.value;
                  return (
                    <motion.button key={emotion.value} type="button" whileTap={{ scale: 0.98 }} onClick={e => { e.preventDefault(); e.stopPropagation(); setSelectedEmotion(emotion); }}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-left transition-all duration-200 ${isActive ? "border-primary bg-primary/5" : "border-border/60 hover:border-border hover:bg-secondary/30"}`}>
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: isActive ? emotion.color : "hsl(var(--muted-foreground) / 0.3)" }} />
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{emotion.label}</span>
                        <span className="text-[11px] text-muted-foreground ml-2">{emotion.sublabel}</span>
                      </div>
                      {isActive && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-1.5 block">Your thoughts <span className="text-muted-foreground font-normal">(optional)</span></label>
              <Textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="What stood out? Would you recommend it?" rows={3} className="resize-none rounded-xl bg-secondary/30 border-border text-sm" onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()} />
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-orange-500/5 border border-orange-500/15">
              <Switch id="spoiler-toggle-write" checked={isSpoiler} onCheckedChange={setIsSpoiler} />
              <Label htmlFor="spoiler-toggle-write" className="text-xs flex items-center gap-1.5 cursor-pointer">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-foreground font-medium">Contains spoilers</span>
              </Label>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={e => { e.preventDefault(); e.stopPropagation(); setIsWriting(false); }} type="button" size="sm" className="rounded-full text-xs">Cancel</Button>
              <Button onClick={handleSubmit} type="button" disabled={!selectedEmotion} size="sm" className="rounded-full gap-1.5 text-xs"><Send className="w-3 h-3" />Submit</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User's review */}
      {userReview && !isWriting && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-primary/5 rounded-2xl p-4 border border-primary/15 space-y-2.5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <Avatar className="w-8 h-8"><AvatarImage src={userReview.profiles?.avatar_url || ""} /><AvatarFallback className="text-xs"><User className="w-3.5 h-3.5" /></AvatarFallback></Avatar>
              <div>
                <p className="font-semibold text-sm">Your Review</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getEmotionForRating(userReview.rating).color }} />
                  <span className="text-xs text-muted-foreground font-medium">{getEmotionForRating(userReview.rating).label}</span>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" type="button"><MoreVertical className="w-3.5 h-3.5" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={e => { e.stopPropagation(); setSelectedEmotion(getEmotionForRating(userReview.rating)); setReviewText(userReview.review_text ? getCleanText(userReview.review_text) : ""); setIsWriting(true); }}><Edit className="w-3.5 h-3.5 mr-2" />Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={e => { e.stopPropagation(); deleteReview(); }} className="text-destructive"><Trash2 className="w-3.5 h-3.5 mr-2" />Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {userReview.review_text && <p className="text-sm text-foreground leading-relaxed">{getCleanText(userReview.review_text)}</p>}
        </motion.div>
      )}

      {/* Other reviews */}
      <div className="space-y-3">
        {sortedReviews.map(review => {
          const hasSpoiler = isSpoilerReview(review);
          const isHidden = hasSpoiler && !revealedSpoilers.has(review.id);
          const cleanText = review.review_text ? getCleanText(review.review_text) : null;

          return (
            <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-4 border border-border space-y-2.5" onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()}>
              <div className="flex items-start gap-2.5">
                <Avatar className="w-8 h-8 mt-0.5"><AvatarImage src={review.profiles?.avatar_url || ""} /><AvatarFallback className="text-xs"><User className="w-3.5 h-3.5" /></AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{review.profiles?.display_name || "Anonymous"}</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getEmotionForRating(review.rating).color }} />
                      <span className="text-xs font-medium text-muted-foreground">{getEmotionForRating(review.rating).label}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}</span>
                  </div>

                  {/* Spoiler content */}
                  {hasSpoiler && cleanText && (
                    <div className="mt-2">
                      <AnimatePresence mode="wait">
                        {isHidden ? (
                          <motion.div key="hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="relative cursor-pointer rounded-xl overflow-hidden" onClick={e => toggleSpoilerReveal(e, review.id)}>
                            <div className="p-4 bg-orange-500/5 border border-orange-500/15 rounded-xl">
                              <div className="flex items-center justify-center gap-2">
                                <EyeOff className="w-4 h-4 text-orange-500" />
                                <span className="text-sm font-medium text-orange-600">Spoiler — tap to reveal</span>
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div key="visible" initial={{ opacity: 0, filter: "blur(8px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ duration: 0.4 }}>
                            <p className="text-sm text-foreground leading-relaxed break-words">{cleanText}</p>
                            <button onClick={e => toggleSpoilerReveal(e, review.id)} className="text-[11px] text-orange-500 hover:text-orange-600 mt-1.5 flex items-center gap-1">
                              <Eye className="w-3 h-3" /> Hide spoiler
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Normal text */}
                  {cleanText && !hasSpoiler && <p className="text-sm text-foreground leading-relaxed mt-2 break-words">{cleanText}</p>}

                  {/* Actions: Helpful + Reply */}
                  <div className="flex items-center gap-1 mt-3">
                    <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); toggleReaction(review.id, "helpful"); }} className="h-7 px-2.5 text-[11px] text-muted-foreground hover:text-foreground rounded-full gap-1" type="button">
                      <ThumbsUp className="w-3 h-3" /> Helpful
                    </Button>
                    <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setReplyingTo(replyingTo === review.id ? null : review.id); setReplyText(""); }} className="h-7 px-2.5 text-[11px] text-muted-foreground hover:text-foreground rounded-full gap-1" type="button">
                      <Reply className="w-3 h-3" /> Reply
                    </Button>
                  </div>

                  {/* Reply thread */}
                  <AnimatePresence>
                    {replyingTo === review.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-2 space-y-2 overflow-hidden">
                        <Textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder={`Reply to ${review.profiles?.display_name || "this review"}...`} className="min-h-[50px] text-sm resize-none rounded-xl" rows={2} onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()} />
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setReplyingTo(null); }} type="button" className="rounded-full text-xs h-7">Cancel</Button>
                          <Button size="sm" disabled={!replyText.trim()} onClick={e => { e.stopPropagation(); toggleReaction(review.id, "helpful"); setReplyingTo(null); setReplyText(""); }} type="button" className="rounded-full text-xs gap-1 h-7"><Send className="w-3 h-3" />Reply</Button>
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

      {/* Empty state */}
      {reviews.length === 0 && !isWriting && (
        <div className="text-center py-10 space-y-3">
          <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mx-auto">
            <MessageCircle className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{user ? "Be the first to share your thoughts" : "Sign in to write a review"}</p>
          {user && (
            <Button variant="outline" size="sm" onClick={e => { e.preventDefault(); e.stopPropagation(); setIsWriting(true); }} className="rounded-full gap-1.5 text-xs" type="button">
              <Edit className="w-3.5 h-3.5" /> Write Review
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
