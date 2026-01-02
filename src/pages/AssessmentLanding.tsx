import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const AssessmentLanding = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="relative">
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-6 py-32">
          <div className="max-w-4xl mx-auto space-y-16 text-center">
            {/* Illustration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center"
            >
              <img
                src="/img_20260103_035320.jpg"
                alt="Assessment illustration"
                className="w-full max-w-md h-auto"
              />
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight">
                Discover Your
                <span className="block mt-2">Movie Personality</span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Take our 2-minute assessment and uncover your unique cinematic archetype
              </p>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col items-center gap-4"
            >
              <Button
                size="lg"
                onClick={() => navigate("/assessment/quiz")}
                className="h-14 px-10 rounded-full text-lg font-semibold group"
              >
                Start Assessment
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-sm text-muted-foreground">
                12 questions • No sign-up required
              </p>
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 px-6 border-t border-border/40">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-20"
            >
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                How it works
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A simple process to understand your movie-watching identity
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-4 text-center"
              >
                <div className="w-20 h-20 mx-auto rounded-2xl bg-foreground/5 flex items-center justify-center">
                  <span className="font-display text-3xl font-bold text-foreground/60">1</span>
                </div>
                <h3 className="font-display text-xl font-bold">Answer Questions</h3>
                <p className="text-muted-foreground">
                  12 thoughtfully designed questions about your viewing preferences
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-4 text-center"
              >
                <div className="w-20 h-20 mx-auto rounded-2xl bg-foreground/5 flex items-center justify-center">
                  <span className="font-display text-3xl font-bold text-foreground/60">2</span>
                </div>
                <h3 className="font-display text-xl font-bold">Get Your Archetype</h3>
                <p className="text-muted-foreground">
                  Discover which of 8 unique movie personalities matches you
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="space-y-4 text-center"
              >
                <div className="w-20 h-20 mx-auto rounded-2xl bg-foreground/5 flex items-center justify-center">
                  <span className="font-display text-3xl font-bold text-foreground/60">3</span>
                </div>
                <h3 className="font-display text-xl font-bold">Share Your Results</h3>
                <p className="text-muted-foreground">
                  Create a beautiful mood board to share with friends
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Visual Section */}
        <section className="py-24 px-6 bg-muted/30">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h2 className="font-display text-4xl md:text-5xl font-bold">
                8 Unique Archetypes
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                From The Escapist who seeks fantasy worlds to The Philosopher who craves deep meaning—each archetype reveals something unique about how you experience cinema.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-4">
                {[
                  "The Escapist",
                  "The Analyzer",
                  "The Heart Seeker",
                  "The Thrill Junkie",
                  "The Social Butterfly",
                  "The Comfort Curator",
                  "The Genre Nomad",
                  "The Philosopher",
                ].map((name, i) => (
                  <div
                    key={name}
                    className="p-3 rounded-xl bg-background border border-border/40 text-sm font-medium"
                  >
                    {name}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex justify-center"
            >
              <img
                src="/img_20260103_035356.jpg"
                alt="Archetypes illustration"
                className="w-full max-w-md h-auto rounded-3xl"
              />
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center space-y-8"
          >
            <h2 className="font-display text-4xl md:text-6xl font-bold">
              Ready to begin?
            </h2>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands discovering their movie personality
            </p>

            <Button
              size="lg"
              onClick={() => navigate("/assessment/quiz")}
              className="h-14 px-10 rounded-full text-lg font-semibold group"
            >
              Start Assessment
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default AssessmentLanding;
