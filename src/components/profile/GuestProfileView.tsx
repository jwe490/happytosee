import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, LogIn, Sparkles, FolderHeart, History, Star } from "lucide-react";

export const GuestProfileView = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        {/* Illustration */}
        <div className="relative inline-flex items-center justify-center">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute w-32 h-32 rounded-full bg-accent/20 blur-2xl"
          />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 border border-border flex items-center justify-center">
            <User className="w-12 h-12 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Your Profile Awaits
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Sign in to unlock personalized features and keep track of your movie journey.
          </p>
        </div>

        {/* Features preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-4 max-w-md mx-auto mt-8"
        >
          {[
            { icon: History, label: "Track your watch history", color: "text-blue-500" },
            { icon: FolderHeart, label: "Create movie collections", color: "text-pink-500" },
            { icon: Star, label: "Write reviews and ratings", color: "text-yellow-500" },
            { icon: Sparkles, label: "Get personalized recommendations", color: "text-purple-500" },
          ].map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border/50"
            >
              <feature.icon className={`w-5 h-5 ${feature.color}`} />
              <span className="text-sm text-foreground">{feature.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mt-8"
        >
          <Button asChild size="lg" className="gap-2">
            <Link to="/auth?redirect=/profile">
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/">
              Continue Browsing
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};
