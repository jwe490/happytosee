import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Share2, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import { ArchetypeIcon } from "./ArchetypeIcon";

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
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div
            ref={resultRef}
            className="relative overflow-hidden rounded-3xl bg-background border border-border p-8 md:p-12 space-y-12"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-center space-y-8"
            >
              <div className="w-32 h-32 mx-auto">
                <ArchetypeIcon archetypeName={archetype.name} gradient={gradient} />
              </div>

              <div className="space-y-4">
                <div className="inline-block px-4 py-1.5 rounded-full bg-muted text-sm font-medium text-muted-foreground">
                  Your Movie Archetype
                </div>

                <h1 className="font-display text-4xl md:text-6xl font-bold">
                  {archetype.name}
                </h1>

                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  {archetype.description}
                </p>
              </div>
            </motion.div>

            {/* Traits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <h3 className="font-display text-2xl font-bold text-center">Your Traits</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {traits.map((trait: string, index: number) => (
                  <motion.span
                    key={trait}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.03 }}
                    className="px-4 py-2 rounded-full bg-muted text-sm font-medium"
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
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              <h3 className="font-display text-2xl font-bold text-center">Personality Breakdown</h3>
              <div className="space-y-3 max-w-2xl mx-auto">
                {stats.slice(0, 6).map((stat: any, index: number) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{stat.label}</span>
                      <span className="font-bold">{stat.value}/{stat.max}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(stat.value / stat.max) * 100}%` }}
                        transition={{ delay: 0.7 + index * 0.05, duration: 0.5 }}
                        className="h-full bg-foreground rounded-full"
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
                transition={{ delay: 0.9 }}
                className="space-y-4"
              >
                <h3 className="font-display text-2xl font-bold text-center">Achievements</h3>
                <div className="flex gap-4 justify-center flex-wrap">
                  {badges.map((badge: any, index: number) => (
                    <motion.div
                      key={badge.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 + index * 0.05 }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted"
                    >
                      <span className="text-sm font-medium">
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
              transition={{ delay: 1.1 }}
              className="pt-8 border-t border-border"
            >
              <p className="text-center text-lg italic text-muted-foreground max-w-2xl mx-auto">
                "{assessment.random_thought}"
              </p>
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="text-center pt-4"
            >
              <div className="inline-block px-6 py-2 rounded-full bg-muted text-sm font-medium">
                MoodFlix • Movie Personality Assessment
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center items-center"
        >
          <Button
            size="lg"
            onClick={handleShare}
            disabled={isSharing}
            className="gap-2 rounded-full px-8 h-12 font-semibold"
          >
            <Share2 className="w-4 h-4" />
            {isSharing ? "Creating..." : "Share Results"}
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={handleRetake}
            className="gap-2 rounded-full px-8 h-12 font-semibold"
          >
            <RotateCw className="w-4 h-4" />
            Retake
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
