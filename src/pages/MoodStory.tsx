import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Share2, ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getArchetypeColors } from "@/lib/designSystem";
import { ArchetypeIcon } from "@/components/assessment/ArchetypeIcon";
import { useToast } from "@/hooks/use-toast";
import { ShareSlideModal } from "@/components/assessment/ShareSlideModal";

const MoodStory = () => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<{ element: React.ReactNode; name: string } | null>(null);
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: assessment, isLoading } = useQuery({
    queryKey: ["assessment", assessmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_assessments")
        .select(`
          *,
          personality_archetypes (
            name,
            description,
            traits,
            random_thoughts
          )
        `)
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

  const handleShareSlide = (slideElement: React.ReactNode, slideName: string) => {
    setSelectedSlide({ element: slideElement, name: slideName });
    setShareModalOpen(true);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `I'm a ${archetype.name}!`,
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

  const archetypeData = assessment?.personality_archetypes as any;
  const archetype = {
    name: archetypeData?.name || "Movie Lover",
    description: archetypeData?.description || "Your unique cinematic personality",
  };

  const colors = getArchetypeColors(archetype.name);
  const stats = (assessment?.stats as any) || [];
  const traits = (archetypeData?.traits as string[]) || [];
  const badges = (assessment?.badges as any[]) || [];

  const randomThoughts = archetypeData?.random_thoughts as string[] | undefined;
  const selectedThought = assessment?.random_thought ||
    (randomThoughts && randomThoughts.length > 0 ? randomThoughts[0] : "Cinema is the universal language of emotion");

  const slideContents = [
    { component: <ArchetypeRevealScreen archetype={archetype} gradient={colors.gradient} />, name: "archetype" },
    { component: <StatScreen number={stats?.[0]?.value || 85} label={stats?.[0]?.label || "Movies Watched"} gradient={colors.gradient} />, name: "stat-1" },
    { component: <StatScreen number={stats?.[1]?.value || 92} label={stats?.[1]?.label || "Genre Diversity"} gradient={colors.gradient} isComparative />, name: "stat-2" },
    { component: <BadgeScreen badge={badges?.[0] || { name: "Movie Buff", description: "Your love for cinema shines through" }} gradient={colors.gradient} />, name: "badge" },
    { component: <ThoughtScreen thought={selectedThought} />, name: "thought" },
  ];

  const screens = [
    ...slideContents.map((slide, index) => (
      <div key={`slide-${index}`} className="relative w-full h-full">
        {slide.component}
        <ShareButton onClick={() => handleShareSlide(slide.component, slide.name)} />
      </div>
    )),
    <ShareScreen
      key="share"
      archetype={archetype}
      topStat={`${stats?.[0]?.value || 85}`}
      gradient={colors.gradient}
      slides={slideContents}
      onShareSlide={handleShareSlide}
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

      {shareModalOpen && selectedSlide && (
        <ShareSlideModal
          slideElement={selectedSlide.element}
          slideName={selectedSlide.name}
          onClose={() => setShareModalOpen(false)}
        />
      )}
    </div>
  );
};

const ShareButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-gradient-to-r from-[#007BFF] to-[#0056D9] flex items-center justify-center shadow-lg z-50"
    >
      <Share2 className="w-5 h-5 text-white" />
    </motion.button>
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
  slides,
  onShareSlide,
  onViewFull,
}: {
  archetype: any;
  topStat: string;
  gradient: string;
  slides: Array<{ component: React.ReactNode; name: string }>;
  onShareSlide: (component: React.ReactNode, name: string) => void;
  onViewFull: () => void;
}) => {
  const [selectedSlides, setSelectedSlides] = useState<number[]>([]);

  const toggleSlide = (index: number) => {
    setSelectedSlides((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const selectAll = () => {
    if (selectedSlides.length === slides.length) {
      setSelectedSlides([]);
    } else {
      setSelectedSlides(slides.map((_, i) => i));
    }
  };

  return (
    <div className="w-full max-w-4xl h-[85vh] flex flex-col items-center justify-center gap-6 px-4" onClick={(e) => e.stopPropagation()}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h2 className="text-4xl font-bold">Share Your Results</h2>
        <p className="text-lg text-[#6C757D]">Select slides to share</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-4 w-full max-w-3xl"
      >
        {slides.map((slide, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => toggleSlide(index)}
            className={`relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer border-4 transition-all ${
              selectedSlides.includes(index) ? "border-[#007BFF] shadow-lg" : "border-transparent"
            }`}
          >
            <div className="absolute inset-0 scale-[0.3] origin-top-left">
              {slide.component}
            </div>
            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
            <div
              className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                selectedSlides.includes(index)
                  ? "bg-[#007BFF] border-[#007BFF]"
                  : "bg-white border-gray-300"
              }`}
            >
              {selectedSlides.includes(index) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-3 h-3 bg-white rounded-full"
                />
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap gap-3 justify-center"
      >
        <Button
          size="sm"
          variant="outline"
          onClick={selectAll}
          className="rounded-full"
        >
          {selectedSlides.length === slides.length ? "Deselect All" : "Select All"}
        </Button>

        <Button
          size="lg"
          disabled={selectedSlides.length === 0}
          onClick={() => {
            if (selectedSlides.length === 1) {
              const slide = slides[selectedSlides[0]];
              onShareSlide(slide.component, slide.name);
            } else {
              alert("Multi-slide download coming soon!");
            }
          }}
          className="rounded-full h-12 px-8 gap-2"
        >
          <Download className="w-4 h-4" />
          Download ({selectedSlides.length})
        </Button>

        <Button
          size="lg"
          variant="outline"
          onClick={onViewFull}
          className="rounded-full h-12 px-8 gap-2"
        >
          Full Report
          <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </div>
  );
};

export default MoodStory;
