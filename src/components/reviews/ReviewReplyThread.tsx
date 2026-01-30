import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, MoreVertical, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import type { ReviewReply } from "@/hooks/useEnhancedReviews";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReviewReplyThreadProps {
  replies: ReviewReply[];
  reviewId: string;
  currentUserId?: string;
  onAddReply: (reviewId: string, replyText: string, parentReplyId?: string) => void;
  onDeleteReply: (replyId: string) => void;
  depth?: number;
}

export function ReviewReplyThread({
  replies,
  reviewId,
  currentUserId,
  onAddReply,
  onDeleteReply,
  depth = 0,
}: ReviewReplyThreadProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleSubmitReply = (parentReplyId?: string) => {
    if (!replyText.trim()) return;
    onAddReply(reviewId, replyText, parentReplyId);
    setReplyText("");
    setReplyingTo(null);
  };

  const maxDepth = 3;

  return (
    <div className={depth > 0 ? "ml-6 mt-3 border-l-2 border-border pl-3" : "space-y-3"}>
      {replies.map((reply) => (
        <motion.div
          key={reply.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-start gap-2">
            <Avatar className="w-7 h-7 mt-0.5">
              <AvatarImage src={reply.profiles?.avatar_url || ""} />
              <AvatarFallback className="text-xs">
                {reply.profiles?.display_name?.[0] || "?"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium truncate">
                  {reply.profiles?.display_name || "Anonymous"}
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                </span>
                {reply.is_edited && (
                  <span className="text-xs text-muted-foreground italic">(edited)</span>
                )}
              </div>

              <p className="text-sm text-foreground break-words">{reply.reply_text}</p>

              <div className="flex items-center gap-2 mt-2">
                {depth < maxDepth && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(reply.id)}
                    className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Reply
                  </Button>
                )}

                {currentUserId === reply.user_id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        <MoreVertical className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onDeleteReply(reply.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-3 h-3 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {replyingTo === reply.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="ml-9 space-y-2"
              >
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${reply.profiles?.display_name || "this comment"}...`}
                  className="min-h-[60px] text-sm"
                  rows={2}
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSubmitReply(reply.id)}
                    disabled={!replyText.trim()}
                  >
                    Reply
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {reply.replies && reply.replies.length > 0 && (
            <ReviewReplyThread
              replies={reply.replies}
              reviewId={reviewId}
              currentUserId={currentUserId}
              onAddReply={onAddReply}
              onDeleteReply={onDeleteReply}
              depth={depth + 1}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}
