import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { HeroIllustration } from "@/components/moodboard/PremiumIllustrations";

const MoodBoardInfo = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="pt-32 pb-24">
        <section className="px-6 md:px-12 min-h-[calc(100vh-8rem)] flex items-center">
          <div className="max-w-[1200px] mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-14">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-block bg-[#F5F3FF] px-6 py-3 rounded-[20px]"
                >
                  <span className="text-[#8B5CF6] text-sm font-medium">✨ Discover Your Cinematic Soul</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-4"
                >
                  <h1 className="text-[56px] md:text-[64px] font-[700] text-[#1F2937] leading-[1.1]">
                    What's Your
                  </h1>
                  <div className="space-y-2">
                    <h1 className="text-[56px] md:text-[64px] font-[900] leading-[1.1] bg-gradient-to-r from-[#007AFF] to-[#00D4FF] bg-clip-text text-transparent">
                      Movie
                    </h1>
                    <div>
                      <h1 className="text-[56px] md:text-[64px] font-[900] leading-[1.1] bg-gradient-to-r from-[#00D4FF] to-[#5AC8FA] bg-clip-text text-transparent">
                        Mood
                      </h1>
                      <div className="mt-2 h-1 w-3/4 bg-gradient-to-r from-[#00D4FF] to-[#5AC8FA] rounded-full" />
                    </div>
                  </div>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  className="text-xl text-[#6B7280] leading-[1.6] max-w-[580px]"
                >
                  A beautifully crafted assessment that reveals your unique cinematic personality through thoughtful questions and artistic visualization.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.36, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-4"
                >
                  <Button
                    onClick={() => navigate("/assessment/landing")}
                    className="h-14 w-[220px] rounded-full bg-gradient-to-r from-[#667EEA] to-[#764BA2] hover:from-[#5568D3] to-[#6A4391] text-white text-[17px] font-semibold shadow-[0_12px_32px_rgba(102,126,234,0.35)] hover:shadow-[0_16px_40px_rgba(102,126,234,0.45)] hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300"
                  >
                    Start Your Journey →
                  </Button>

                  <p className="text-[15px] text-[#9CA3AF]">
                    2 minutes • No signup required
                  </p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.48, ease: [0.16, 1, 0.3, 1] }}
                className="flex justify-center"
              >
                <div className="w-full max-w-[480px] h-[560px]">
                  <HeroIllustration />
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MoodBoardInfo;
