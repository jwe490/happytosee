import { motion } from "framer-motion";
import { Eye, FolderHeart, Star, Palette } from "lucide-react";

interface ProfileStatCardsProps {
  watchedCount: number;
  collectionsCount: number;
  reviewsCount?: number;
  accentColor?: string;
}

export const ProfileStatCards = ({ 
  watchedCount, 
  collectionsCount, 
  reviewsCount = 0,
  accentColor = "#8B5CF6"
}: ProfileStatCardsProps) => {
  const stats = [
    {
      icon: Eye,
      label: "Movies Watched",
      value: watchedCount,
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-500",
    },
    {
      icon: FolderHeart,
      label: "Collections",
      value: collectionsCount,
      gradient: "from-pink-500/20 to-rose-500/20",
      iconColor: "text-pink-500",
    },
    {
      icon: Star,
      label: "Reviews",
      value: reviewsCount,
      gradient: "from-yellow-500/20 to-orange-500/20",
      iconColor: "text-yellow-500",
    },
    {
      icon: Palette,
      label: "Your Vibe",
      value: null,
      gradient: "from-purple-500/20 to-violet-500/20",
      iconColor: "text-purple-500",
      customContent: (
        <div 
          className="w-8 h-8 rounded-full border-2 border-white/20 shadow-lg"
          style={{ backgroundColor: accentColor }}
        />
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`
            relative overflow-hidden rounded-2xl p-4 
            bg-gradient-to-br ${stat.gradient}
            border border-border/50
            hover:border-border transition-colors
          `}
        >
          {/* Background decoration */}
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <stat.icon className="w-20 h-20" />
          </div>
          
          <div className="relative z-10">
            <stat.icon className={`w-6 h-6 ${stat.iconColor} mb-3`} />
            {stat.customContent ? (
              stat.customContent
            ) : (
              <div className="text-2xl font-display font-bold text-foreground">
                {stat.value}
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              {stat.label}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
