import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AssessmentQuestion } from "./AssessmentQuestion";
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
  const [startTime, setStartTime] = useState(Date.now());
  const { toast } = useToast();
  const navigate = useNavigate();

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

      navigate(`/mood/processing?assessmentId=${assessment.id}`);
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
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-6xl"
          >
            🎬
          </motion.div>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-lg text-muted-foreground"
          >
            Preparing your journey...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">
              {currentQuestionIndex + 1} / {questions.length}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#FF6B9D] via-[#C86DD7] to-[#06B6D4]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <AssessmentQuestion
            key={currentQuestion.id}
            question={currentQuestion}
            onAnswer={handleAnswer}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
          />
        </AnimatePresence>
      </div>
    </div>
  );
};
