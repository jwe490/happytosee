import { Button } from "@/components/ui/button";
import { ThumbsUp, Lightbulb, Laugh, Check, X } from "lucide-react";
import { motion } from "framer-motion";

interface ReviewReactionButtonsProps {
  helpfulCount: number;
  userReaction: string | null;
  onToggleReaction: (type: 'helpful' | 'insightful' | 'funny' | 'agree' | 'disagree') => void;
  compact?: boolean;
}

const reactions = [
  { type: 'helpful' as const, icon: ThumbsUp, label: 'Helpful', color: 'text-blue-500' },
  { type: 'insightful' as const, icon: Lightbulb, label: 'Insightful', color: 'text-yellow-500' },
  { type: 'funny' as const, icon: Laugh, label: 'Funny', color: 'text-green-500' },
  { type: 'agree' as const, icon: Check, label: 'Agree', color: 'text-emerald-500' },
  { type: 'disagree' as const, icon: X, label: 'Disagree', color: 'text-red-500' },
];

export function ReviewReactionButtons({
  helpfulCount,
  userReaction,
  onToggleReaction,
  compact = false,
}: ReviewReactionButtonsProps) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {reactions.map((reaction) => {
        const Icon = reaction.icon;
        const isActive = userReaction === reaction.type;
        const count = reaction.type === 'helpful' ? helpfulCount : 0;

        return (
          <motion.div key={reaction.type} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => onToggleReaction(reaction.type)}
              className={`gap-1.5 h-7 text-xs ${
                isActive ? reaction.color : 'text-muted-foreground'
              } ${compact ? 'px-2' : 'px-3'}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {!compact && <span>{reaction.label}</span>}
              {count > 0 && reaction.type === 'helpful' && (
                <span className="font-semibold">{count}</span>
              )}
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
}
