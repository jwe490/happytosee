import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { CinemaIllustration, EmotionWheelIllustration, SparklesIllustration, MovieReelIllustration, StarsIllustration } from "@/components/assessment/Illustrations";

const AssessmentLanding = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="relative overflow-hidden">
        <motion.div
          className="absolute top-40 right-20 w-32 h-32 opacity-10"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          <EmotionWheelIllustration />
        </motion.div>

        <motion.div
          className="absolute bottom-40 left-20 w-24 h-24 opacity-10"
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <SparklesIllustration />
        </motion.div>

        <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 py-24">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  className="inline-block mb-6"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <span className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-900 text-sm font-semibold tracking-wide">
                    ✨ Discover Your Cinematic Soul
                  </span>
                </motion.div>

                <h1 className="text-6xl md:text-7xl font-bold text-gray-900 leading-[1.1] mb-6">
                  What's Your
                  <br />
                  <span className="relative inline-block mt-2">
                    <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
                      Movie Mood
                    </span>
                    <motion.div
                      className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 rounded-full"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.8, duration: 0.8 }}
                    />
                  </span>
                  ?
                </h1>

                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  A beautifully crafted assessment that reveals your unique cinematic personality
                  through thoughtful questions and artistic visualization.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                {[
                  { label: "12 Thoughtful Questions", color: "from-blue-500 to-cyan-500" },
                  { label: "8 Unique Archetypes", color: "from-amber-500 to-orange-500" },
                  { label: "Beautiful Shareable Results", color: "from-emerald-500 to-teal-500" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${item.color}`} />
                    <span className="text-gray-700 font-medium text-lg">{item.label}</span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <Button
                  size="lg"
                  onClick={() => navigate("/assessment/quiz")}
                  className="group relative h-16 px-10 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-2xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 border-0"
                >
                  Begin Your Journey
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>

                <motion.div
                  className="flex flex-col sm:flex-row items-center gap-3 text-sm text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                >
                  <div className="flex -space-x-3">
                    {[
                      "from-blue-400 to-cyan-400",
                      "from-amber-400 to-orange-400",
                      "from-emerald-400 to-teal-400",
                    ].map((gradient, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.2 + i * 0.1, type: "spring" }}
                        className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} border-3 border-white shadow-sm`}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-gray-600">2,847 moods discovered today</span>
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative"
            >
              <motion.div
                className="relative z-10"
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <CinemaIllustration className="w-full h-auto drop-shadow-2xl" />
              </motion.div>

              <motion.div
                className="absolute -bottom-10 -right-10 w-72 h-72 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-20"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 6, repeat: Infinity }}
              />
              <motion.div
                className="absolute -top-10 -left-10 w-56 h-56 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full blur-3xl opacity-20"
                animate={{ scale: [1.3, 1, 1.3] }}
                transition={{ duration: 6, repeat: Infinity }}
              />
            </motion.div>
          </div>
        </section>

        <section className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-20"
            >
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                How it works
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                A simple, delightful process to understand your cinematic identity
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  num: "01",
                  title: "Answer Questions",
                  desc: "12 beautifully designed questions about your viewing preferences",
                  illustration: <MovieReelIllustration className="w-full h-40" />,
                  gradient: "from-blue-500 to-cyan-500",
                },
                {
                  num: "02",
                  title: "Get Your Archetype",
                  desc: "Discover which of 8 unique personalities matches your soul",
                  illustration: <StarsIllustration className="w-full h-40" />,
                  gradient: "from-amber-500 to-orange-500",
                },
                {
                  num: "03",
                  title: "Share Your Story",
                  desc: "Create stunning visuals to share your cinematic journey",
                  illustration: <SparklesIllustration className="w-full h-40" />,
                  gradient: "from-emerald-500 to-teal-500",
                },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className="relative group"
                >
                  <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 h-full border border-gray-100">
                    <div className={`inline-block px-4 py-1.5 rounded-full bg-gradient-to-r ${step.gradient} text-white text-sm font-bold mb-6`}>
                      {step.num}
                    </div>

                    <div className="mb-6">
                      {step.illustration}
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-32 px-6 relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          />

          <div className="absolute inset-0 opacity-10">
            <EmotionWheelIllustration className="absolute top-10 right-20 w-64 h-64" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            >
              <SparklesIllustration className="absolute bottom-20 left-20 w-48 h-48" />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center space-y-10 relative z-10"
          >
            <h2 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Ready to discover
              <br />
              your cinematic soul?
            </h2>

            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Join thousands discovering their movie personality and sharing
              their unique story with the world
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button
                size="lg"
                onClick={() => navigate("/assessment/quiz")}
                className="group h-16 px-10 bg-white hover:bg-gray-50 text-blue-600 rounded-2xl text-lg font-bold shadow-2xl hover:shadow-3xl transition-all duration-300"
              >
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16">
              {[
                { value: "2 min", label: "Quick & Fun" },
                { value: "12", label: "Questions" },
                { value: "8", label: "Archetypes" },
                { value: "Free", label: "Always" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="text-white"
                >
                  <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm md:text-base text-white/80 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default AssessmentLanding;
