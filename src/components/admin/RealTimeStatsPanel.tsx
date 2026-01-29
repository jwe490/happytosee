import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Eye, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Film,
  Activity,
  RefreshCw,
  Wifi
} from "lucide-react";
import { useRealTimeAnalytics } from "@/hooks/useRealTimeAnalytics";
import { formatDistanceToNow } from "date-fns";

interface StatCardProps {
  label: string;
  value: number | string;
  change?: number;
  icon: React.ReactNode;
  isLive?: boolean;
}

const StatCard = ({ label, value, change, icon, isLive }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="relative bg-card border border-border rounded-xl p-4 overflow-hidden"
  >
    {isLive && (
      <span className="absolute top-2 right-2 flex items-center gap-1">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
      </span>
    )}
    
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-secondary text-muted-foreground">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-2xl font-bold font-display">{value}</p>
        {change !== undefined && change !== 0 && (
          <div className={`flex items-center gap-1 text-xs ${
            change > 0 ? "text-green-500" : "text-red-500"
          }`}>
            {change > 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{Math.abs(change)}% vs yesterday</span>
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

const LiveEventFeed = ({ 
  events 
}: { 
  events: Array<{ 
    id: string; 
    event_type: string; 
    page_path: string; 
    created_at: string;
    movie_title?: string;
  }> 
}) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case "page_view": return "👁️";
      case "movie_click": return "🎬";
      case "movie_view": return "▶️";
      case "mood_select": return "😊";
      case "search": return "🔍";
      case "watchlist_add": return "📌";
      default: return "📍";
    }
  };

  const getEventLabel = (event: typeof events[0]) => {
    switch (event.event_type) {
      case "page_view":
        return `Viewed ${event.page_path}`;
      case "movie_click":
      case "movie_view":
        return event.movie_title || "Viewed movie";
      case "mood_select":
        return "Selected mood";
      case "search":
        return "Performed search";
      case "watchlist_add":
        return event.movie_title ? `Added "${event.movie_title}"` : "Added to watchlist";
      default:
        return event.event_type;
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Live Activity Feed
        </h3>
        <span className="flex items-center gap-1 text-xs text-green-500">
          <Wifi className="w-3 h-3" />
          Live
        </span>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {events.slice(0, 15).map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.02 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 text-sm"
            >
              <span>{getEventIcon(event.event_type)}</span>
              <span className="flex-1 truncate text-muted-foreground">
                {getEventLabel(event)}
              </span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {events.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">
            No recent activity
          </p>
        )}
      </div>
    </div>
  );
};

const TopMoviesPanel = ({ movies }: { movies: Array<{ id: number; title: string; clicks: number }> }) => (
  <div className="bg-card border border-border rounded-xl p-4">
    <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
      <Film className="w-4 h-4" />
      Trending Movies (24h)
    </h3>
    
    <div className="space-y-2">
      {movies.slice(0, 5).map((movie, index) => (
        <div key={movie.id} className="flex items-center gap-3">
          <span className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            {index + 1}
          </span>
          <span className="flex-1 text-sm truncate">{movie.title}</span>
          <span className="text-xs text-muted-foreground">{movie.clicks} clicks</span>
        </div>
      ))}
      
      {movies.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-4">
          No movie activity yet
        </p>
      )}
    </div>
  </div>
);

const MoodDistribution = ({ moods }: { moods: Record<string, number> }) => {
  const total = Object.values(moods).reduce((a, b) => a + b, 0);
  const sorted = Object.entries(moods).sort((a, b) => b[1] - a[1]);
  
  const moodEmojis: Record<string, string> = {
    happy: "😀",
    sad: "😢",
    romantic: "❤️",
    excited: "⚡",
    nostalgic: "🥹",
    relaxed: "😌",
    bored: "😴",
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="font-semibold text-sm mb-3">Mood Distribution (24h)</h3>
      
      <div className="space-y-2">
        {sorted.slice(0, 5).map(([mood, count]) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={mood} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span>{moodEmojis[mood] || "🎬"}</span>
                  <span className="capitalize">{mood}</span>
                </span>
                <span className="text-muted-foreground">{count}</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </div>
          );
        })}
        
        {sorted.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-4">
            No mood data yet
          </p>
        )}
      </div>
    </div>
  );
};

export function RealTimeStatsPanel() {
  const { stats, isLoading, lastUpdate, refresh } = useRealTimeAnalytics(5000);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold font-display">Real-Time Analytics</h2>
          <p className="text-xs text-muted-foreground">
            Last updated {formatDistanceToNow(lastUpdate, { addSuffix: true })}
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Active Now"
          value={stats.activeUsers}
          icon={<Users className="w-4 h-4" />}
          isLive
        />
        <StatCard
          label="Hourly Users"
          value={stats.hourlyActiveUsers}
          icon={<Clock className="w-4 h-4" />}
        />
        <StatCard
          label="Daily Users"
          value={stats.dailyActiveUsers}
          change={stats.comparison.usersChange}
          icon={<Users className="w-4 h-4" />}
        />
        <StatCard
          label="Page Views (24h)"
          value={stats.pageViews}
          change={stats.comparison.viewsChange}
          icon={<Eye className="w-4 h-4" />}
        />
      </div>

      {/* Secondary Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LiveEventFeed events={stats.recentEvents} />
        <TopMoviesPanel movies={stats.topMovies} />
        <MoodDistribution moods={stats.moodSelections} />
      </div>
    </div>
  );
}
