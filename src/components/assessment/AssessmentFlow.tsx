import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { AssessmentQuestion } from "./AssessmentQuestion";
import { MoodBoardResults } from "./MoodBoardResults";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: any[];
  dimension_weights: Record<string, Record<string, number>>;
  visual_content: any;
  order_index: number;
  multiSelect?: boolean;
}

interface Answer {
  question_id: string;
  selected_option: string | string[];
  response_time: number;
}

// Comprehensive assessment questions for movie personality profiling
const mockQuestions: Question[] = [
  {
    id: "1",
    question_text: "What's your ideal movie night setup?",
    question_type: "single",
    options: [
      { emoji: "🍿", label: "Cozy & Calm", description: "Blanket, lights off, peaceful vibes" },
      { emoji: "🎉", label: "Fun with Friends", description: "Laughs and entertainment" },
      { emoji: "💔", label: "Emotional Ride", description: "Deep stories, strong feelings" },
      { emoji: "⚡", label: "High Energy", description: "Action, thrill, excitement" }
    ],
    dimension_weights: { mood: { relaxed: 2, social: 2, emotional: 2, energetic: 2 } },
    visual_content: null,
    order_index: 1
  },
  {
    id: "2",
    question_text: "Which language movies do you prefer?",
    question_type: "multi",
    multiSelect: true,
    options: [
      { emoji: "🇺🇸", label: "English", description: "Hollywood & International English" },
      { emoji: "🇮🇳", label: "Hindi", description: "Bollywood blockbusters" },
      { emoji: "🇰🇷", label: "Korean", description: "K-dramas & Korean cinema" },
      { emoji: "🇯🇵", label: "Japanese", description: "Anime & Japanese films" },
      { emoji: "🇪🇸", label: "Spanish", description: "Latin American & Spanish cinema" },
      { emoji: "🌎", label: "Mixed / Any", description: "Open to all languages" }
    ],
    dimension_weights: { language: { en: 2, hi: 2, ko: 2, ja: 2, es: 2, any: 2 } },
    visual_content: null,
    order_index: 2
  },
  {
    id: "3",
    question_text: "What kind of movies do you enjoy?",
    question_type: "single",
    options: [
      { emoji: "🎬", label: "Commercial / Popular", description: "Mainstream blockbusters everyone talks about" },
      { emoji: "🎨", label: "Indie / Artistic", description: "Unique storytelling & visual artistry" },
      { emoji: "🧠", label: "Thought-Provoking", description: "Films that challenge your mind" },
      { emoji: "🔥", label: "Fast-Paced", description: "Non-stop action & entertainment" },
      { emoji: "🧸", label: "Comfort Movies", description: "Familiar, feel-good favorites" },
      { emoji: "🧪", label: "Experimental", description: "Unconventional & boundary-pushing" }
    ],
    dimension_weights: { style: { commercial: 2, indie: 2, intellectual: 2, action: 2, comfort: 2, experimental: 2 } },
    visual_content: null,
    order_index: 3
  },
  {
    id: "4",
    question_text: "How are you feeling right now?",
    question_type: "single",
    options: [
      { emoji: "😂", label: "Light & Funny", description: "I want to laugh!" },
      { emoji: "😢", label: "Deep & Emotional", description: "Ready for a moving story" },
      { emoji: "😱", label: "Thrilling", description: "Give me chills and suspense" },
      { emoji: "💖", label: "Romantic", description: "In the mood for love" },
      { emoji: "🤯", label: "Mind-Bending", description: "Blow my mind with twists" },
      { emoji: "😌", label: "Relaxed", description: "Something easy and chill" }
    ],
    dimension_weights: { emotional_style: { funny: 2, emotional: 2, thrilling: 2, romantic: 2, mindbending: 2, relaxed: 2 } },
    visual_content: null,
    order_index: 4
  },
  {
    id: "5", 
    question_text: "Pick your perfect movie snack:",
    question_type: "single",
    options: [
      { emoji: "🍿", label: "Classic Popcorn", description: "Can't beat the original" },
      { emoji: "🍫", label: "Chocolate & Candy", description: "Sweet tooth activated" },
      { emoji: "🍕", label: "Pizza Night", description: "Full meal experience" },
      { emoji: "🥂", label: "Wine & Cheese", description: "Sophisticated vibes" }
    ],
    dimension_weights: { style: { classic: 2, fun: 2, casual: 2, refined: 2 } },
    visual_content: null,
    order_index: 5
  },
  {
    id: "6",
    question_text: "What genre speaks to your soul?",
    question_type: "multi",
    multiSelect: true,
    options: [
      { emoji: "💥", label: "Action/Adventure", description: "Explosions and epic quests" },
      { emoji: "😂", label: "Comedy", description: "Belly laughs guaranteed" },
      { emoji: "🎭", label: "Drama", description: "Award-worthy performances" },
      { emoji: "🚀", label: "Sci-Fi/Fantasy", description: "Escape to other worlds" },
      { emoji: "👻", label: "Horror/Thriller", description: "Heart-pounding suspense" },
      { emoji: "💕", label: "Romance", description: "Love stories that warm the heart" }
    ],
    dimension_weights: { genre: { action: 2, comedy: 2, drama: 2, scifi: 2, horror: 2, romance: 2 } },
    visual_content: null,
    order_index: 6
  },
  {
    id: "7",
    question_text: "How do you prefer your endings?",
    question_type: "single",
    options: [
      { emoji: "🌈", label: "Happy Endings", description: "Everything works out perfectly" },
      { emoji: "🤯", label: "Plot Twists", description: "Blow my mind!" },
      { emoji: "💭", label: "Open Ended", description: "Leave me thinking" },
      { emoji: "😢", label: "Bittersweet", description: "Beautiful yet heartbreaking" }
    ],
    dimension_weights: { ending: { happy: 2, twist: 2, open: 2, sad: 2 } },
    visual_content: null,
    order_index: 7
  },
  {
    id: "8",
    question_text: "What era of movies do you love most?",
    question_type: "single",
    options: [
      { emoji: "📼", label: "Classic Cinema", description: "Golden age masterpieces" },
      { emoji: "🎞️", label: "80s & 90s", description: "Nostalgic favorites" },
      { emoji: "🎬", label: "2000s Blockbusters", description: "Modern spectacles" },
      { emoji: "✨", label: "Latest Releases", description: "Fresh off the screen" }
    ],
    dimension_weights: { era: { classic: 2, retro: 2, modern: 2, new: 2 } },
    visual_content: null,
    order_index: 8
  },
  {
    id: "9",
    question_text: "What draws you to a movie first?",
    question_type: "single",
    options: [
      { emoji: "⭐", label: "Star Power", description: "Favorite actors & directors" },
      { emoji: "📖", label: "Story & Script", description: "Compelling narratives" },
      { emoji: "🎨", label: "Visual Style", description: "Stunning cinematography" },
      { emoji: "📊", label: "Reviews & Ratings", description: "Critical acclaim" }
    ],
    dimension_weights: { priority: { cast: 2, story: 2, visual: 2, reviews: 2 } },
    visual_content: null,
    order_index: 9
  },
  {
    id: "10",
    question_text: "How long do you like your movies?",
    question_type: "single",
    options: [
      { emoji: "⚡", label: "Quick & Snappy", description: "Under 90 minutes" },
      { emoji: "⏱️", label: "Just Right", description: "90-120 minutes" },
      { emoji: "🎭", label: "Epic Length", description: "2+ hours of cinema" },
      { emoji: "📺", label: "Series Format", description: "Mini-series over movies" }
    ],
    dimension_weights: { duration: { short: 2, medium: 2, long: 2, series: 2 } },
    visual_content: null,
    order_index: 10
  },
  {
    id: "11",
    question_text: "What's your movie-watching mood today?",
    question_type: "single",
    options: [
      { emoji: "🧘", label: "Relaxed", description: "Something easy & light" },
      { emoji: "🎢", label: "Adventurous", description: "Take me on a journey" },
      { emoji: "🧠", label: "Thought-Provoking", description: "Challenge my mind" },
      { emoji: "❤️", label: "Romantic", description: "Feel the love" }
    ],
    dimension_weights: { current_mood: { relaxed: 2, adventurous: 2, intellectual: 2, romantic: 2 } },
    visual_content: null,
    order_index: 11
  },
  {
    id: "12",
    question_text: "Pick your cinema vibe:",
    question_type: "single",
    options: [
      { emoji: "🌃", label: "Late Night Thriller", description: "Dark, mysterious, suspenseful" },
      { emoji: "☀️", label: "Sunday Afternoon", description: "Light, fun, family-friendly" },
      { emoji: "🌧️", label: "Rainy Day Drama", description: "Deep, emotional, introspective" },
      { emoji: "🎊", label: "Party Mood", description: "Upbeat, energetic, fun" }
    ],
    dimension_weights: { vibe: { thriller: 2, family: 2, drama: 2, party: 2 } },
    visual_content: null,
    order_index: 12
  }
];

export const AssessmentFlow = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const { toast } = useToast();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      // Use mock questions since assessment tables don't exist yet
      setQuestions(mockQuestions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setQuestions(mockQuestions);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (option: string | string[]) => {
    const responseTime = Date.now() - startTime;

    const newAnswers = [
      ...answers,
      {
        question_id: questions[currentQuestionIndex].id,
        selected_option: option,
        response_time: responseTime,
      },
    ];
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setStartTime(Date.now());
    } else {
      // Generate mock results with answers for recommendations
      const mockId = crypto.randomUUID();
      setAssessmentId(mockId);
      setShowResults(true);
    }
  };

  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (showResults && assessmentId) {
    return <MoodBoardResults assessmentId={assessmentId} answers={answers} />;
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Assessment Coming Soon</h2>
          <p className="text-muted-foreground">We're preparing your movie personality quiz!</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">
                Movie Personality Assessment
              </span>
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold">
              Discover Your Movie Mood
            </h1>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>
          </div>

          <Progress value={progressPercentage} className="h-2" />

          <AnimatePresence mode="wait">
            <AssessmentQuestion
              key={currentQuestion.id}
              question={currentQuestion}
              onAnswer={handleAnswer}
              multiSelect={currentQuestion.multiSelect}
            />
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};
