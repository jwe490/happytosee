import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { designSystem } from "@/lib/designSystem";

const MoodStart = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center px-8">
      <div className="max-w-[480px] w-full space-y-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full max-w-[300px] mx-auto"
        >
          <img
            src="/img_20260103_035329.jpg"
            alt="Movie mood illustration"
            className="w-full h-auto"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: designSystem.animations.easing.easeOut }}
          className="space-y-3"
        >
          <h1
            className="font-bold text-[#212529]"
            style={{
              fontSize: '40px',
              lineHeight: designSystem.typography.lineHeights.heading,
            }}
          >
            What's Your Movie Mood?
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15, ease: designSystem.animations.easing.easeOut }}
            className="text-[18px] text-[#6C757D]"
            style={{ lineHeight: designSystem.typography.lineHeights.body }}
          >
            Answer 10 questions to discover your unique cinematic personality and get a shareable mood board
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Button
            size="lg"
            onClick={() => navigate("/assessment/quiz")}
            className="h-14 w-full max-w-[360px] rounded-full text-[18px] font-semibold bg-gradient-to-r from-[#007BFF] to-[#0056D9] hover:shadow-lg hover:translate-y-[-4px] transition-all duration-200 active:scale-[0.97]"
          >
            Start Quiz
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="flex items-center justify-center gap-2 pt-4"
        >
          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-[#007BFF] to-[#00D4FF] border-2 border-white"
              />
            ))}
          </div>
          <p className="text-sm text-[#6C757D]">Recently joined</p>
        </motion.div>
      </div>
    </div>
  );
};

export default MoodStart;
