import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Share2, RotateCw, Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";

interface MoodBoardResultsProps {
  assessmentId: string;
}

// Mock archetypes for when database doesn't have the tables
const mockArchetypes = [
  {
    name: "The Explorer",
    icon: "🎬",
    description: "You love discovering new films and hidden gems. Your watchlist is always growing!",
    traits: ["Curious", "Open-minded", "Adventurous", "Eclectic"],
    color_scheme: ["#667eea", "#764ba2", "#f093fb"]
  },
  {
    name: "The Comfort Seeker",
    icon: "🏡",
    description: "You have your favorites and love rewatching them. Familiar stories bring you joy.",
    traits: ["Nostalgic", "Cozy", "Loyal", "Sentimental"],
    color_scheme: ["#f093fb", "#f5576c", "#feca57"]
  },
  {
    name: "The Cinephile",
    icon: "🎥",
    description: "You appreciate cinema as an art form and seek out critically acclaimed films.",
    traits: ["Analytical", "Cultured", "Discerning", "Thoughtful"],
    color_scheme: ["#4facfe", "#00f2fe", "#43e97b"]
  }
];

export const MoodBoardResults = ({ assessmentId }: MoodBoardResultsProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Generate mock results
  const archetype = mockArchetypes[Math.floor(Math.random() * mockArchetypes.length)];
  const stats = [
    { label: "Escapism", value: Math.floor(Math.random() * 4) + 6, max: 10 },
    { label: "Emotion", value: Math.floor(Math.random() * 4) + 6, max: 10 },
    { label: "Adventure", value: Math.floor(Math.random() * 4) + 6, max: 10 },
    { label: "Comfort", value: Math.floor(Math.random() * 4) + 6, max: 10 },
    { label: "Variety", value: Math.floor(Math.random() * 4) + 6, max: 10 },
  ];
  const badges = [
    { name: "Movie Buff", icon: "🎬" },
    { name: "Night Owl", icon: "🦉" },
  ];
  const randomThought = "Every movie is a chance to live another life for a few hours.";

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleShare = async () => {
    if (!resultRef.current) return;
    setIsSharing(true);

    try {
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], "my-movie-mood.png", { type: "image/png" });

        if (navigator.share) {
          await navigator.share({
            title: "My Movie Mood Board",
            text: `I'm ${archetype.name}! Discover your movie personality.`,
            files: [file],
          });
          toast({ title: "Shared!", description: "Your mood board has been shared" });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "my-movie-mood.png";
          a.click();
          URL.revokeObjectURL(url);
          toast({ title: "Downloaded!", description: "Your mood board image has been saved" });
        }
      }, "image/png");
    } catch (error) {
      console.error("Error sharing:", error);
      toast({ title: "Error", description: "Failed to share mood board", variant: "destructive" });
    } finally {
      setIsSharing(false);
    }
  };

  const handleRetake = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">Calculating your results...</p>
        </div>
      </div>
    );
  }

  const colorScheme = archetype.color_scheme;
  const traits = archetype.traits;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div
            ref={resultRef}
            className="relative overflow-hidden rounded-3xl"
            style={{
              background: `linear-gradient(135deg, ${colorScheme[0]} 0%, ${colorScheme[1]} 50%, ${colorScheme[2]} 100%)`,
            }}
          >
            <div className="absolute inset-0 bg-black/20" />

            <div className="relative z-10 p-8 md:p-12 space-y-8 text-white">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center space-y-4"
              >
                <div className="text-6xl">{archetype.icon}</div>
                <h1 className="font-display text-4xl md:text-5xl font-bold">{archetype.name}</h1>
                <p className="text-lg md:text-xl text-white/90 max-w-xl mx-auto">{archetype.description}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Your Movie Traits
                </h3>
                <div className="flex flex-wrap gap-2">
                  {traits.map((trait: string, index: number) => (
                    <motion.span
                      key={trait}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium"
                    >
                      {trait}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-4"
              >
                <h3 className="font-semibold text-lg">Your Stats</h3>
                <div className="space-y-3">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{stat.label}</span>
                        <span className="text-white/80">{stat.value}/{stat.max}</span>
                      </div>
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(stat.value / stat.max) * 100}%` }}
                          transition={{ delay: 0.8 + index * 0.1, duration: 0.8 }}
                          className="h-full bg-white rounded-full"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {badges.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="space-y-3"
                >
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Achievements Unlocked
                  </h3>
                  <div className="flex gap-4">
                    {badges.map((badge, index) => (
                      <motion.div
                        key={badge.name}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.3 + index * 0.1, type: "spring" as const, stiffness: 200 }}
                        className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm"
                      >
                        <span className="text-3xl">{badge.icon}</span>
                        <span className="text-xs font-medium text-center">{badge.name}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="pt-6 border-t border-white/20"
              >
                <p className="text-center italic text-white/90">"{randomThought}"</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.7 }}
                className="text-center text-sm text-white/60"
              >
                MoodFlix • Discover Your Movie Mood
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.9 }}
          className="flex gap-3 justify-center"
        >
          <Button size="lg" onClick={handleShare} disabled={isSharing} className="gap-2 rounded-full">
            <Share2 className="w-4 h-4" />
            {isSharing ? "Preparing..." : "Share Results"}
          </Button>

          <Button size="lg" variant="outline" onClick={handleRetake} className="gap-2 rounded-full">
            <RotateCw className="w-4 h-4" />
            Retake
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
