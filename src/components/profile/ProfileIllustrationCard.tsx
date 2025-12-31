import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface ProfileIllustrationCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient?: string;
  children?: React.ReactNode;
}

export const ProfileIllustrationCard = ({
  icon: Icon,
  title,
  description,
  gradient = "from-accent/10 to-primary/10",
  children,
}: ProfileIllustrationCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        relative overflow-hidden rounded-2xl p-6
        bg-gradient-to-br ${gradient}
        border border-border
      `}
    >
      {/* Decorative background element */}
      <div className="absolute -right-8 -top-8 opacity-5">
        <Icon className="w-32 h-32" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-background/50 backdrop-blur-sm">
            <Icon className="w-5 h-5 text-accent" />
          </div>
          <h3 className="font-display font-semibold text-foreground">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        {children}
      </div>
    </motion.div>
  );
};
