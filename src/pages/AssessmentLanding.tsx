import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Zap, Heart, Users } from "lucide-react";

const AssessmentLanding = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const features = [
    {
      icon: Sparkles,
      title: "In 2 Minutes",
      description: "Quick, fun questions",
      color: "from-violet-500 to-purple-600",
    },
    {
      icon: Heart,
      title: "Deeply Personal",
      description: "Discover your archetype",
      color: "from-pink-500 to-rose-600",
    },
    {
      icon: Users,
      title: "Share & Compare",
      description: "Beautiful mood board",
      color: "from-cyan-500 to-blue-600",
    },
  ];

  const archetypes = [
    { name: "The Escapist", emoji: "🚀", gradient: "from-[#FF6B9D] via-[#C86DD7] to-[#A855F7]" },
    { name: "The Analyzer", emoji: "🎬", gradient: "from-[#3B82F6] via-[#06B6D4] to-[#14B8A6]" },
    { name: "The Heart Seeker", emoji: "💖", gradient: "from-[#F43F5E] via-[#FB7185] to-[#FDA4AF]" },
    { name: "The Thrill Junkie", emoji: "⚡", gradient: "from-[#F59E0B] via-[#EF4444] to-[#DC2626]" },
    { name: "The Social Butterfly", emoji: "🦋", gradient: "from-[#FBBF24] via-[#34D399] to-[#10B981]" },
    { name: "The Comfort Curator", emoji: "🏡", gradient: "from-[#60A5FA] via-[#2DD4BF] to-[#5EEAD4]" },
    { name: "The Genre Nomad", emoji: "🎭", gradient: "from-[#FB923C] via-[#F472B6] to-[#C084FC]" },
    { name: "The Philosopher", emoji: "🧠", gradient: "from-[#6366F1] via-[#8B5CF6] to-[#A78BFA]" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="relative overflow-hidden">
        {/* Hero Section */}
        <motion.section style={{ y, opacity }} className="relative min-h-[90vh] flex items-center justify-center px-4 pt-20">
          <div className="max-w-5xl mx-auto text-center space-y-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-6"
            >
              <motion.h1
                className="font-display text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                What's your
                <motion.span
                  className="block bg-gradient-to-r from-[#FF6B9D] via-[#C86DD7] to-[#06B6D4] bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  style={{ backgroundSize: "200% auto" }}
                >
                  movie mood?
                </motion.span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto"
              >
                12 questions. 2 minutes. Your unique cinematic personality.
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Button
                size="lg"
                onClick={() => navigate("/assessment/quiz")}
                className="group relative h-16 px-12 rounded-full text-lg font-semibold overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#FF6B9D] via-[#C86DD7] to-[#06B6D4]"
                  animate={{
                    x: ["0%", "100%", "0%"],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <span className="relative z-10 flex items-center gap-3">
                  Start Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </span>
              </Button>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group relative p-6 rounded-3xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all"
                >
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  <div className="relative space-y-3">
                    <feature.icon className={`w-8 h-8 bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`} />
                    <h3 className="font-display text-xl font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Archetypes Grid */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16 space-y-4"
            >
              <h2 className="font-display text-4xl md:text-6xl font-bold">
                8 Cinematic Souls
              </h2>
              <p className="text-lg text-muted-foreground">
                Which one are you?
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {archetypes.map((archetype, index) => (
                <motion.div
                  key={archetype.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  whileHover={{ scale: 1.1, rotate: [0, -2, 2, 0] }}
                  className="group relative cursor-pointer"
                >
                  <div className={`aspect-square rounded-3xl bg-gradient-to-br ${archetype.gradient} p-6 flex flex-col items-center justify-center text-center shadow-lg group-hover:shadow-2xl transition-all`}>
                    <motion.div
                      className="text-5xl mb-3"
                      animate={{
                        y: [0, -10, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.2,
                      }}
                    >
                      {archetype.emoji}
                    </motion.div>
                    <h3 className="font-display font-bold text-white text-sm md:text-base drop-shadow-lg">
                      {archetype.name}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl mx-auto text-center space-y-8"
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-6xl"
            >
              ✨
            </motion.div>

            <h2 className="font-display text-4xl md:text-5xl font-bold">
              Ready when you are
            </h2>

            <p className="text-lg text-muted-foreground">
              No sign-up. No email. Just you and 12 questions.
            </p>

            <Button
              size="lg"
              onClick={() => navigate("/assessment/quiz")}
              variant="outline"
              className="h-14 px-10 rounded-full text-lg font-semibold border-2 hover:scale-105 transition-transform"
            >
              <Zap className="w-5 h-5 mr-2" />
              Begin Assessment
            </Button>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default AssessmentLanding;
