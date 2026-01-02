import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Header from "@/components/Header";
import {
  PhoneMockupIllustration,
  ChecklistIcon,
  SparkleIcon,
  StackedCardsIcon,
  ShareArrowIcon,
  HourglassIcon,
  SampleCard1,
  SampleCard2,
  SampleCard3,
} from "@/components/moodboard/InfoIllustrations";

const MoodBoardInfo = () => {
  const navigate = useNavigate();

  const fadeUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-20%" },
    transition: { duration: 0.6 },
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Header />

      <div className="pt-20">
        <section className="py-20 px-6 md:px-12">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <h1 className="text-4xl md:text-5xl font-bold text-[#495057] leading-tight">
                  Discover Your Movie Mood
                </h1>

                <p className="text-lg md:text-xl text-[#6C757D] leading-relaxed">
                  A 2-minute quiz that turns your movie taste into shareable mood board cards
                </p>

                <div className="space-y-4">
                  <Button
                    size="lg"
                    onClick={() => navigate("/assessment/landing")}
                    className="h-14 px-10 rounded-full bg-gradient-to-r from-[#007BFF] to-[#0056b3] hover:from-[#0056b3] hover:to-[#004494] text-white text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Start Mood Board
                  </Button>

                  <p className="text-sm text-[#6C757D] opacity-70">
                    No signup needed • Takes 2 minutes
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex justify-center"
              >
                <PhoneMockupIllustration className="w-full max-w-md h-auto" />
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 md:px-12">
          <div className="max-w-[1200px] mx-auto">
            <motion.div {...fadeUp} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#495057] mb-4">
                How it works
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <ChecklistIcon className="w-20 h-20" />,
                  title: "Answer 10 Questions",
                  description: "Visual questions about your movie habits and preferences",
                },
                {
                  icon: <SparkleIcon className="w-20 h-20" />,
                  title: "Get Your Archetype",
                  description: "We calculate your unique movie personality type",
                },
                {
                  icon: <StackedCardsIcon className="w-20 h-20" />,
                  title: "See Your Mood Board",
                  description: "View personalized stats, badges, and insights",
                },
                {
                  icon: <ShareArrowIcon className="w-20 h-20" />,
                  title: "Share What You Love",
                  description: "Download individual cards as PNG images",
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -8, boxShadow: "0 12px 24px rgba(0,0,0,0.1)" }}
                  className="bg-white rounded-2xl p-8 border border-[#E0E0E0] transition-all duration-300"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="mb-2">{step.icon}</div>
                    <h3 className="text-xl font-bold text-[#495057]">{step.title}</h3>
                    <p className="text-base text-[#6C757D] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6 md:px-12">
          <div className="max-w-[800px] mx-auto">
            <motion.div {...fadeUp} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#495057] mb-4">
                Your Movie Mood Board
              </h2>
              <p className="text-lg text-[#6C757D] max-w-[560px] mx-auto">
                Clean, shareable image cards based on your answers. Pick favorites and post anywhere.
              </p>
            </motion.div>

            <div className="flex justify-center items-center gap-6 mb-12 flex-wrap px-4">
              <SampleCard1 className="flex-shrink-0" />
              <SampleCard2 className="flex-shrink-0" />
              <SampleCard3 className="flex-shrink-0" />
            </div>

            <motion.div
              {...fadeUp}
              className="space-y-4 max-w-[500px] mx-auto"
            >
              {[
                "Your unique archetype + tagline",
                "Top viewing stats in visual cards",
                "Playful random thought about your mood",
                "Downloadable PNG images (1080x1400px)",
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <Check className="w-5 h-5 text-[#007BFF] flex-shrink-0" />
                  <span className="text-base text-[#495057]">{item}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-16 px-6 md:px-12">
          <div className="max-w-[600px] mx-auto">
            <motion.div
              {...fadeUp}
              className="bg-[#F0F7FF] rounded-3xl p-12 relative overflow-hidden"
            >
              <div className="text-center space-y-6">
                <h2 className="text-3xl font-bold text-[#495057]">
                  What it takes from you
                </h2>

                <div className="space-y-4 text-left max-w-md mx-auto">
                  {[
                    "~2 minutes to complete",
                    "10 visual questions, no typing required",
                    "Only movie preferences—no personal data",
                    "Skip or retake anytime you want",
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-2 h-2 rounded-full bg-[#007BFF] mt-2 flex-shrink-0" />
                      <span className="text-lg text-[#495057]">{item}</span>
                    </motion.div>
                  ))}
                </div>

                <p className="text-sm italic text-[#6C757D] opacity-60 pt-4">
                  Designed to feel playful, not like a test.
                </p>
              </div>

              <div className="absolute bottom-8 right-8 opacity-20">
                <HourglassIcon className="w-10 h-10" />
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-24 px-6 md:px-12 bg-gradient-to-b from-[#FAFBFC] to-[#F8F9FA]">
          <div className="max-w-[800px] mx-auto text-center">
            <motion.div {...fadeUp} className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-[#495057]">
                Ready to see your movie mood?
              </h2>

              <div className="flex flex-col items-center gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate("/assessment/landing")}
                  className="h-16 px-12 rounded-full bg-gradient-to-r from-[#007BFF] to-[#0056b3] hover:from-[#0056b3] hover:to-[#004494] text-white text-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  Start Mood Board
                </Button>

                <p className="text-base text-[#6C757D] opacity-60">
                  You can update it anytime
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MoodBoardInfo;
