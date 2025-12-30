import { motion } from "framer-motion";
import { Film, Sparkles } from "lucide-react";

const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full py-6 px-6 md:px-8"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2.5 rounded-xl bg-secondary border border-border">
              <Film className="w-6 h-6 text-foreground" />
            </div>
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-foreground/60 animate-pulse" />
          </div>
          <div>
            <h1 className="font-display text-xl md:text-2xl font-bold text-foreground">
              MoodFlix
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              AI-Powered Movie Recommendations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="hidden md:inline">Powered by</span>
          <span className="text-foreground font-medium">AI</span>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
