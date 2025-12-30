import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full py-4 px-6 md:px-8 sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-foreground hover:text-muted-foreground transition-colors">
            <div className="w-0 h-0 border-l-[8px] border-l-accent border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent" />
            <span className="font-display text-sm font-semibold tracking-wide uppercase">Menu</span>
          </button>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            MoodFlix
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="font-display text-sm font-medium text-foreground hover:text-muted-foreground transition-colors tracking-wide uppercase">
            Log-in
          </button>
          <Button 
            variant="default" 
            size="sm"
            className="font-display text-xs font-semibold tracking-wide uppercase rounded-full px-5"
          >
            Sign-up
          </Button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
