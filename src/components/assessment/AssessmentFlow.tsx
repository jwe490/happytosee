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
}

interface Answer {
  question_id: string;
  selected_option: string;
  response_time: number;
}

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
      const { data, error } = await supabase
        .from("assessment_questions")
        .select("*")
        .eq("is_active", true)
        .order("order_index");

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast({
        title: "Error",
        description: "Failed to load assessment questions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (option: string) => {
    const responseTime = Date.now() - startTime;

    setAnswers([
      ...answers,
      {
        question_id: questions[currentQuestionIndex].id,
        selected_option: option,
        response_time: responseTime,
      },
    ]);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setStartTime(Date.now());
    } else {
      submitAssessment([
        ...answers,
        {
          question_id: questions[currentQuestionIndex].id,
          selected_option: option,
          response_time: responseTime,
        },
      ]);
    }
  };

  const submitAssessment = async (allAnswers: Answer[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Sign in required",
          description: "Please sign in to save your results",
          variant: "destructive",
        });
        return;
      }

      const dimensionScores = calculateDimensionScores(allAnswers);
      const archetype = await determineArchetype(dimensionScores);

      const { data: assessment, error: assessmentError } = await supabase
        .from("user_assessments")
        .insert({
          user_id: user.id,
          archetype_id: archetype.id,
          dimension_scores: dimensionScores,
          stats: generateStats(dimensionScores),
          random_thought: selectRandomThought(archetype.random_thoughts),
          badges: generateBadges(dimensionScores),
        })
        .select()
        .single();

      if (assessmentError) throw assessmentError;

      const { error: responsesError } = await supabase
        .from("assessment_responses")
        .insert(
          allAnswers.map((answer) => ({
            assessment_id: assessment.id,
            question_id: answer.question_id,
            selected_option: answer.selected_option,
            response_time: answer.response_time,
          }))
        );

      if (responsesError) throw responsesError;

      setAssessmentId(assessment.id);
      setShowResults(true);
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast({
        title: "Error",
        description: "Failed to submit assessment",
        variant: "destructive",
      });
    }
  };

  const calculateDimensionScores = (allAnswers: Answer[]) => {
    const scores: Record<string, number> = {
      escapism: 0,
      fantasy: 0,
      emotion: 0,
      education: 0,
      complexity: 0,
      excitement: 0,
      pacing: 0,
      social: 0,
      rewatch: 0,
      comfort: 0,
      variety: 0,
      curiosity: 0,
    };

    allAnswers.forEach((answer) => {
      const question = questions.find((q) => q.id === answer.question_id);
      if (question && question.dimension_weights[answer.selected_option]) {
        const weights = question.dimension_weights[answer.selected_option];
        Object.entries(weights).forEach(([dimension, weight]) => {
          scores[dimension] = (scores[dimension] || 0) + (weight as number);
        });
      }
    });

    Object.keys(scores).forEach((key) => {
      scores[key] = Math.min(10, Math.round((scores[key] / 5) * 10));
    });

    return scores;
  };

  const determineArchetype = async (scores: Record<string, number>) => {
    const { data: archetypes } = await supabase
      .from("personality_archetypes")
      .select("*");

    if (!archetypes || archetypes.length === 0) {
      throw new Error("No archetypes found");
    }

    let bestMatch = archetypes[0];
    let bestScore = 0;

    archetypes.forEach((archetype) => {
      let matchScore = 0;
      const ranges = archetype.dimension_ranges as Record<
        string,
        [number, number]
      >;

      Object.entries(ranges).forEach(([dimension, [min, max]]) => {
        const score = scores[dimension] || 0;
        if (score >= min && score <= max) {
          matchScore += score;
        }
      });

      if (matchScore > bestScore) {
        bestScore = matchScore;
        bestMatch = archetype;
      }
    });

    return bestMatch;
  };

  const generateStats = (scores: Record<string, number>) => {
    const sortedScores = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 7);

    return sortedScores.map(([key, value]) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      value: value,
      max: 10,
    }));
  };

  const selectRandomThought = (thoughts: any) => {
    const thoughtsArray = Array.isArray(thoughts) ? thoughts : [];
    return thoughtsArray[Math.floor(Math.random() * thoughtsArray.length)];
  };

  const generateBadges = (scores: Record<string, number>) => {
    const badges = [];

    if (scores.rewatch >= 8)
      badges.push({ name: "Comfort Curator", icon: "🏡" });
    if (scores.social >= 8)
      badges.push({ name: "Social Butterfly", icon: "🦋" });
    if (scores.variety >= 8) badges.push({ name: "Genre Nomad", icon: "🎭" });

    return badges.slice(0, 3);
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
    return <MoodBoardResults assessmentId={assessmentId} />;
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
            />
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};
