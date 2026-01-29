import { motion } from "framer-motion";
import { MoodJournalEntry } from "@/hooks/useGamification";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { Film, Calendar } from "lucide-react";

interface MoodJournalProps {
  entries: MoodJournalEntry[];
  maxEntries?: number;
}

const moodEmojis: Record<string, string> = {
  happy: "😊",
  sad: "😢",
  romantic: "🥰",
  excited: "🤩",
  chill: "😌",
  adventurous: "🤠",
  nostalgic: "🥹",
  thrilled: "😱",
  stressed: "😤",
  motivated: "💪",
  bored: "😑",
  inspired: "✨",
};

function formatDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d");
}

export function MoodJournal({ entries, maxEntries = 10 }: MoodJournalProps) {
  const displayEntries = entries.slice(0, maxEntries);

  if (displayEntries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Your mood journey starts here!</p>
        <p className="text-xs mt-1">Select a mood to begin tracking</p>
      </div>
    );
  }

  // Group entries by date
  const grouped = displayEntries.reduce((acc, entry) => {
    const dateKey = formatDate(entry.created_at);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(entry);
    return acc;
  }, {} as Record<string, MoodJournalEntry[]>);

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([date, dateEntries], groupIndex) => (
        <motion.div
          key={date}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: groupIndex * 0.1 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {date}
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="space-y-2">
            {dateEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary/80 transition-colors"
              >
                {/* Mood emoji */}
                <span className="text-2xl">
                  {moodEmojis[entry.mood] || "🎭"}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground capitalize text-sm">
                    {entry.mood}
                  </p>
                  {entry.movie_title && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                      <Film className="w-3 h-3 flex-shrink-0" />
                      {entry.movie_title}
                    </p>
                  )}
                </div>

                {/* Time */}
                <span className="text-xs text-muted-foreground">
                  {format(parseISO(entry.created_at), "h:mm a")}
                </span>

                {/* Movie poster thumbnail */}
                {entry.movie_poster && (
                  <img
                    src={entry.movie_poster}
                    alt=""
                    className="w-8 h-12 rounded object-cover flex-shrink-0"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
