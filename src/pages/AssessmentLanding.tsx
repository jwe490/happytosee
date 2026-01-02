import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Share2, Trophy, Film, CheckCircle2 } from "lucide-react";

const AssessmentLanding = () => {
  const navigate = useNavigate();

  const steps = [
    {
      number: "01",
      title: "Answer Questions",
      description: "12 fun questions about your viewing habits, preferences, and movie personality",
      icon: Film,
      color: "from-blue-500 to-cyan-500",
    },
    {
      number: "02",
      title: "Discover Your Type",
      description: "Get matched with one of 8 unique movie personality archetypes",
      icon: Sparkles,
      color: "from-purple-500 to-pink-500",
    },
    {
      number: "03",
      title: "Share Your Results",
      description: "Create a beautiful mood board and share it with friends on social media",
      icon: Share2,
      color: "from-orange-500 to-red-500",
    },
  ];

  const archetypes = [
    { name: "The Escapist", icon: "🚀", color: "bg-gradient-to-br from-pink-500 to-purple-600" },
    { name: "The Analyzer", icon: "🎬", color: "bg-gradient-to-br from-blue-500 to-cyan-600" },
    { name: "The Heart Seeker", icon: "💖", color: "bg-gradient-to-br from-rose-400 to-pink-500" },
    { name: "The Thrill Junkie", icon: "⚡", color: "bg-gradient-to-br from-red-500 to-orange-500" },
    { name: "The Social Butterfly", icon: "🦋", color: "bg-gradient-to-br from-yellow-400 to-green-500" },
    { name: "The Comfort Curator", icon: "🏡", color: "bg-gradient-to-br from-blue-300 to-teal-400" },
    { name: "The Genre Nomad", icon: "🎭", color: "bg-gradient-to-br from-orange-400 to-purple-500" },
    { name: "The Cinematic Philosopher", icon: "🧠", color: "bg-gradient-to-br from-slate-600 to-purple-700" },
  ];

  const features = [
    "Personalized movie archetype",
    "Detailed personality stats",
    "Custom achievement badges",
    "Shareable mood board",
    "Track your evolution",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="relative overflow-hidden">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-background to-primary/5" />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-10 w-96 h-96 rounded-full bg-accent/20 blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-primary/10 blur-3xl"
          />

          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20"
            >
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Movie Personality Assessment</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-5xl md:text-7xl font-bold text-foreground leading-tight"
            >
              Discover Your
              <span className="block bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">
                Movie Mood
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto"
            >
              Take a quick quiz to uncover your unique movie personality archetype and get a shareable mood board
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                size="xl"
                onClick={() => navigate("/assessment/quiz")}
                className="group rounded-full px-8 py-6 text-lg gap-3"
              >
                Start Assessment
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <span className="text-sm text-muted-foreground">
                Takes only 2-3 minutes
              </span>
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground">
                Three simple steps to discover your movie personality
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="relative"
                >
                  <div className="relative p-8 rounded-3xl bg-card border border-border hover:border-primary/50 transition-all duration-300 h-full">
                    <div
                      className={`absolute top-6 right-6 text-6xl font-display font-bold bg-gradient-to-br ${step.color} bg-clip-text text-transparent opacity-20`}
                    >
                      {step.number}
                    </div>

                    <div className="relative z-10 space-y-4">
                      <div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center`}
                      >
                        <step.icon className="w-8 h-8 text-white" />
                      </div>

                      <h3 className="font-display text-2xl font-bold">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>

                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Personality Archetypes */}
        <section className="py-20 px-4 bg-secondary/30">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                8 Unique Archetypes
              </h2>
              <p className="text-lg text-muted-foreground">
                Which one matches your movie-watching personality?
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {archetypes.map((archetype, index) => (
                <motion.div
                  key={archetype.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative group cursor-pointer"
                >
                  <div className={`aspect-square rounded-2xl ${archetype.color} p-6 flex flex-col items-center justify-center text-center shadow-lg`}>
                    <div className="text-5xl mb-3">{archetype.icon}</div>
                    <h3 className="font-semibold text-white text-sm md:text-base">
                      {archetype.name}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* What You'll Get */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                What You'll Get
              </h2>
              <p className="text-lg text-muted-foreground">
                Your personalized movie mood board includes
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-lg font-medium">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center space-y-8 p-12 rounded-3xl bg-gradient-to-br from-accent/10 via-primary/10 to-background border border-border"
          >
            <Trophy className="w-16 h-16 mx-auto text-accent" />

            <h2 className="font-display text-3xl md:text-5xl font-bold">
              Ready to Discover Your Movie Personality?
            </h2>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of movie lovers who have already discovered their archetype
            </p>

            <Button
              size="xl"
              onClick={() => navigate("/assessment/quiz")}
              className="group rounded-full px-10 py-6 text-lg gap-3"
            >
              <Sparkles className="w-5 h-5" />
              Take the Assessment
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <p className="text-sm text-muted-foreground">
              Free • No registration required • Takes 2-3 minutes
            </p>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default AssessmentLanding;
