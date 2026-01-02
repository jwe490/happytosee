import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Share2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getArchetypeColors } from "@/lib/designSystem";
import { ArchetypeIcon } from "@/components/assessment/ArchetypeIcon";
import { useToast } from "@/hooks/use-toast";

const MoodStory = () => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: assessment, isLoading } = useQuery({
    queryKey: ["assessment", assessmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mood_assessments")
        .select("*")
        .eq("id", assessmentId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (currentScreen < 5) {
      const timer = setTimeout(() => {
        setCurrentScreen((prev) => prev + 1);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  const handleNext = () => {
    if (currentScreen < 5) {
      setCurrentScreen((prev) => prev + 1);
    } else {
      navigate(`/mood/report/${assessmentId}`);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `I'm a ${assessment?.archetype_name}!`,
          text: `Discover your movie mood personality!`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "Share your movie mood with friends",
        });
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  if (isLoading || !assessment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
      </div>
    );
  }

  const archetype = {
    name: assessment.archetype_name || "Movie Lover",
    description: assessment.archetype_description || "",
  };

  const colors = getArchetypeColors(archetype.name);
  const stats = assessment.personality_stats as any;
  const traits = assessment.traits as string[];
  const badges = assessment.badges_earned as any[];

  const screens = [
    <ArchetypeRevealScreen key="archetype" archetype={archetype} gradient={colors.gradient} />,
    <StatScreen
      key="stat1"
      number={stats?.[0]?.value || 85}
      label={stats?.[0]?.label || "Movies Watched"}
      gradient={colors.gradient}
    />,
    <StatScreen
      key="stat2"
      number={stats?.[1]?.value || 92}
      label={stats?.[1]?.label || "Genre Diversity"}
      gradient={colors.gradient}
      isComparative
    />,
    <BadgeScreen
      key="badge"
      badge={badges?.[0] || { name: "Movie Buff", icon: "🎬" }}
      gradient={colors.gradient}
    />,
    <ThoughtScreen key="thought" thought={assessment.random_thought || "Cinema is life"} />,
    <ShareScreen
      key="share"
      archetype={archetype}
      topStat={`${stats?.[0]?.value || 85}`}
      gradient={colors.gradient}
      onShare={handleShare}
      onViewFull={() => navigate(`/mood/report/${assessmentId}`)}
    />,
  ];

  return (
    <div
      className="min-h-screen bg-background relative overflow-hidden"
      onClick={handleNext}
    >
      <div className="absolute top-4 left-0 right-0 flex gap-1 px-4 z-50">
        {screens.map((_, index) => (
          <div
            key={index}
            className="flex-1 h-1 rounded-full bg-white/20 overflow-hidden"
          >
            <motion.div
              className="h-full bg-white"
              initial={{ width: 0 }}
              animate={{
                width: index < currentScreen ? "100%" : index === currentScreen ? "100%" : 0,
              }}
              transition={{ duration: index === currentScreen ? 3 : 0.3 }}
            />
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.6 }}
          className="min-h-screen flex items-center justify-center p-6"
        >
          {screens[currentScreen]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const ArchetypeRevealScreen = ({ archetype, gradient }: { archetype: any; gradient: string }) => {
  return (
    <div className={`w-full max-w-2xl h-[80vh] rounded-3xl bg-gradient-to-br ${gradient} p-12 flex flex-col items-center justify-center relative overflow-hidden`}>
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white rounded-full"
          initial={{ y: "100%", opacity: 0.6 }}
          animate={{ y: "-100%", opacity: 0 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "linear",
          }}
          style={{
            left: `${Math.random() * 100}%`,
          }}
        />
      ))}

      <motion.div
        className="w-48 h-48 mb-8"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, type: "spring" }}
      >
        <ArchetypeIcon archetypeName={archetype.name} gradient={gradient} />
      </motion.div>

      <motion.h1
        className="text-5xl font-bold text-white text-center mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        {archetype.name}
      </motion.h1>

      <motion.p
        className="text-2xl italic text-white/70 text-center max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        Your cinematic soul revealed
      </motion.p>
    </div>
  );
};

const StatScreen = ({
  number,
  label,
  gradient,
  isComparative = false,
}: {
  number: number;
  label: string;
  gradient: string;
  isComparative?: boolean;
}) => {
  const [displayNumber, setDisplayNumber] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = number / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= number) {
        setDisplayNumber(number);
        clearInterval(timer);
      } else {
        setDisplayNumber(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [number]);

  return (
    <div className="w-full max-w-2xl h-[80vh] rounded-3xl bg-white p-12 flex flex-col items-center justify-center relative border-l-8" style={{ borderColor: gradient }}>
      <motion.div
        className="text-[96px] font-bold bg-gradient-to-r bg-clip-text text-transparent"
        style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
          {displayNumber}
          {isComparative && "%"}
        </span>
      </motion.div>

      <motion.p
        className="text-2xl text-[#495057] text-center mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {label}
      </motion.p>

      {isComparative && (
        <motion.p
          className="text-lg text-[#6C757D] mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          Top 10% of movie lovers
        </motion.p>
      )}
    </div>
  );
};

const BadgeScreen = ({ badge, gradient }: { badge: any; gradient: string }) => {
  return (
    <div className={`w-full max-w-2xl h-[80vh] rounded-3xl bg-gradient-to-br ${gradient} bg-opacity-5 p-12 flex flex-col items-center justify-center relative`}>
      <motion.div
        className="w-44 h-44 rounded-full bg-white shadow-2xl flex items-center justify-center mb-8"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <span className="text-7xl">{badge.icon || "🏆"}</span>
      </motion.div>

      <motion.h2
        className="text-4xl font-bold text-[#212529] text-center mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {badge.name || "Achievement Unlocked"}
      </motion.h2>

      <motion.p
        className="text-lg text-[#6C757D] text-center max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {badge.description || "You've earned this badge for your unique taste"}
      </motion.p>
    </div>
  );
};

const ThoughtScreen = ({ thought }: { thought: string }) => {
  return (
    <div className="w-full max-w-2xl h-[80vh] rounded-3xl bg-[#FAFBFC] p-12 flex flex-col items-center justify-center relative">
      <div className="text-[60px] text-black/10 absolute top-20 left-20">"</div>
      <div className="text-[60px] text-black/10 absolute bottom-20 right-20">"</div>

      <motion.p
        className="text-3xl italic font-medium text-[#212529] text-center max-w-xl leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        {thought}
      </motion.p>

      <motion.p
        className="text-base text-[#6C757D] mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        — Your Movie Personality
      </motion.p>
    </div>
  );
};

const ShareScreen = ({
  archetype,
  topStat,
  gradient,
  onShare,
  onViewFull,
}: {
  archetype: any;
  topStat: string;
  gradient: string;
  onShare: () => void;
  onViewFull: () => void;
}) => {
  return (
    <div className="w-full max-w-2xl h-[80vh] flex flex-col items-center justify-center gap-8">
      <motion.div
        className="w-full h-32 rounded-2xl bg-white shadow-lg p-6 flex items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-20 h-20">
          <ArchetypeIcon archetypeName={archetype.name} gradient={gradient} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold">{archetype.name}</h3>
          <p className="text-sm text-[#6C757D]">Score: {topStat}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center space-y-4"
      >
        <h2 className="text-4xl font-bold">Share Your Movie Mood</h2>

        <div className="flex gap-3 justify-center pt-4" onClick={(e) => e.stopPropagation()}>
          <Button
            size="lg"
            onClick={onShare}
            className="rounded-full h-14 px-8 gap-2"
          >
            <Share2 className="w-5 h-5" />
            Share
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={onViewFull}
            className="rounded-full h-14 px-8 gap-2"
          >
            Full Report
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default MoodStory;
