import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Download, RotateCw, Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";

interface MoodBoardResultsProps {
  assessmentId: string;
}

export const MoodBoardResults = ({
  assessmentId,
}: MoodBoardResultsProps) => {
  const [assessment, setAssessment] = useState<any>(null);
  const [archetype, setArchetype] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchResults();
  }, [assessmentId]);

  const fetchResults = async () => {
    try {
      const { data: assessmentData, error: assessmentError } = await supabase
        .from("user_assessments")
        .select("*, personality_archetypes(*)")
        .eq("id", assessmentId)
        .single();

      if (assessmentError) throw assessmentError;

      setAssessment(assessmentData);
      setArchetype(assessmentData.personality_archetypes);
    } catch (error) {
      console.error("Error fetching results:", error);
      toast({
        title: "Error",
        description: "Failed to load results",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

        const uniqueShareId = crypto.randomUUID();

        const { error } = await supabase
          .from("mood_board_shares")
          .insert({
            assessment_id: assessmentId,
            platform: "native",
            unique_share_id: uniqueShareId,
          });

        if (error) throw error;

        const file = new File([blob], "my-movie-mood.png", {
          type: "image/png",
        });

        if (navigator.share) {
          await navigator.share({
            title: "My Movie Mood Board",
            text: `I'm ${archetype.name}! Discover your movie personality on MoodFlix.`,
            files: [file],
          });

          await supabase
            .from("user_assessments")
            .update({ share_count: (assessment.share_count || 0) + 1 })
            .eq("id", assessmentId);

          toast({
            title: "Shared!",
            description: "Your mood board has been shared",
          });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "my-movie-mood.png";
          a.click();
          URL.revokeObjectURL(url);

          toast({
            title: "Downloaded!",
            description: "Your mood board image has been saved",
          });
        }
      }, "image/png");
    } catch (error) {
      console.error("Error sharing:", error);
      toast({
        title: "Error",
        description: "Failed to share mood board",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleRetake = () => {
    window.location.reload();
  };

  if (isLoading || !assessment || !archetype) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">Calculating your results...</p>
        </div>
      </div>
    );
  }

  const traits = Array.isArray(archetype.traits) ? archetype.traits : [];
  const badges = Array.isArray(assessment.badges) ? assessment.badges : [];
  const stats = Array.isArray(assessment.stats) ? assessment.stats : [];

  const archetypeGradients: Record<string, string> = {
    "The Escapist": "from-[#FF6B9D] via-[#C86DD7] to-[#A855F7]",
    "The Analyzer": "from-[#3B82F6] via-[#06B6D4] to-[#14B8A6]",
    "The Heart Seeker": "from-[#F43F5E] via-[#FB7185] to-[#FDA4AF]",
    "The Thrill Junkie": "from-[#F59E0B] via-[#EF4444] to-[#DC2626]",
    "The Social Butterfly": "from-[#FBBF24] via-[#34D399] to-[#10B981]",
    "The Comfort Curator": "from-[#60A5FA] via-[#2DD4BF] to-[#5EEAD4]",
    "The Genre Nomad": "from-[#FB923C] via-[#F472B6] to-[#C084FC]",
    "The Philosopher": "from-[#6366F1] via-[#8B5CF6] to-[#A78BFA]",
  };

  const gradient = archetypeGradients[archetype.name] || "from-[#FF6B9D] via-[#C86DD7] to-[#06B6D4]";

  return (
    <div className="min-h-screen py-8 px-4 overflow-hidden">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Animated Background Orbs */}
        <motion.div
          className="fixed inset-0 pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className={`absolute top-20 left-10 w-96 h-96 rounded-full bg-gradient-to-br ${gradient} blur-3xl opacity-30`}
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className={`absolute bottom-20 right-10 w-80 h-80 rounded-full bg-gradient-to-br ${gradient} blur-3xl opacity-20`}
            animate={{
              scale: [1.2, 1, 1.2],
              x: [0, -40, 0],
              y: [0, -20, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div
            ref={resultRef}
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-1`}
          >
            <div className="relative bg-background/95 backdrop-blur-xl rounded-3xl overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10`} />

              <div className="relative z-10 p-8 md:p-12 space-y-10">
                {/* Header with Icon */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="text-center space-y-6"
                >
                  <motion.div
                    className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-2xl`}
                    animate={{
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <span className="text-7xl">{archetype.icon}</span>
                  </motion.div>

                  <div className="space-y-2">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30"
                    >
                      <span className="text-sm font-medium">Your Movie Archetype</span>
                    </motion.div>

                    <h1 className={`font-display text-5xl md:text-6xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                      {archetype.name}
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
                      {archetype.description}
                    </p>
                  </div>
                </motion.div>

                {/* Traits */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-4"
                >
                  <h3 className="font-display text-xl font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Your Cinematic Traits
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {traits.map((trait: string, index: number) => (
                      <motion.span
                        key={trait}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 + index * 0.05 }}
                        whileHover={{ scale: 1.1, rotate: [-2, 2, -2, 0] }}
                        className={`px-4 py-2 rounded-full bg-gradient-to-br ${gradient} text-white text-sm font-medium shadow-lg`}
                      >
                        {trait}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="space-y-4"
                >
                  <h3 className="font-display text-xl font-bold">Personality Breakdown</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {stats.slice(0, 6).map((stat: any, index: number) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1 + index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        className="p-4 rounded-2xl bg-card border border-border/50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm">{stat.label}</span>
                          <span className="text-lg font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent">
                            {stat.value}
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(stat.value / stat.max) * 100}%` }}
                            transition={{ delay: 1.1 + index * 0.05, duration: 0.6 }}
                            className={`h-full bg-gradient-to-r ${gradient} rounded-full`}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Badges */}
                {badges.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3 }}
                    className="space-y-4"
                  >
                    <h3 className="font-display text-xl font-bold flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Achievements Unlocked
                    </h3>
                    <div className="flex gap-3 justify-center">
                      {badges.map((badge: any, index: number) => (
                        <motion.div
                          key={badge.name}
                          initial={{ opacity: 0, scale: 0, rotate: -180 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          transition={{
                            delay: 1.4 + index * 0.1,
                            type: "spring",
                            stiffness: 200,
                          }}
                          whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                          className={`flex flex-col items-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-xl`}
                        >
                          <span className="text-4xl">{badge.icon}</span>
                          <span className="text-xs font-bold text-center">
                            {badge.name}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Quote */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6 }}
                  className="pt-6 border-t border-border"
                >
                  <div className="text-center space-y-2">
                    <div className="text-4xl">✨</div>
                    <p className="text-lg italic text-muted-foreground max-w-lg mx-auto">
                      "{assessment.random_thought}"
                    </p>
                  </div>
                </motion.div>

                {/* Footer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8 }}
                  className="text-center pt-4"
                >
                  <div className={`inline-block px-6 py-2 rounded-full bg-gradient-to-r ${gradient} text-white font-semibold text-sm shadow-lg`}>
                    MoodFlix • Your Movie Mood
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              onClick={handleShare}
              disabled={isSharing}
              className={`gap-2 rounded-full px-8 py-6 text-lg font-semibold bg-gradient-to-r ${gradient} hover:opacity-90 transition-opacity border-0`}
            >
              <Share2 className="w-5 h-5" />
              {isSharing ? "Creating Image..." : "Share My Mood"}
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              variant="outline"
              onClick={handleRetake}
              className="gap-2 rounded-full px-8 py-6 text-lg font-semibold border-2"
            >
              <RotateCw className="w-5 h-5" />
              Retake Quiz
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
