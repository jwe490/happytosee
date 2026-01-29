import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Trophy, Flame, BookOpen, Swords, Share2, X } from "lucide-react";
import { useGamification } from "@/hooks/useGamification";
import { StreakDisplay } from "./StreakDisplay";
import { BadgeGrid } from "./BadgeGrid";
import { BadgeToast } from "./BadgeToast";
import { MoodJournal } from "./MoodJournal";
import { ThisOrThat } from "./ThisOrThat";
import { ShareableMoodCard } from "./ShareableMoodCard";
import { useKeyAuth } from "@/hooks/useKeyAuth";

interface EngagementHubProps {
  currentMood?: string;
  currentMoodEmoji?: string;
  currentMovie?: { id: number; title: string; poster?: string };
}

export function EngagementHub({ currentMood, currentMoodEmoji, currentMovie }: EngagementHubProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useKeyAuth();
  const {
    streakData,
    badges,
    journalEntries,
    newBadge,
    clearNewBadge,
  } = useGamification();

  return (
    <>
      {/* Badge Toast */}
      <BadgeToast badge={newBadge} onClose={clearNewBadge} />

      {/* Floating Hub Trigger */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-20 right-4 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow"
          >
            <Trophy className="w-5 h-5" />
            <span className="font-display font-semibold text-sm hidden sm:inline">My Journey</span>
            {streakData && streakData.current_streak > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/20 text-xs font-bold">
                🔥 {streakData.current_streak}
              </span>
            )}
          </motion.button>
        </SheetTrigger>

        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2 font-display">
              <Trophy className="w-5 h-5 text-primary" />
              Your MoodFlix Journey
            </SheetTitle>
          </SheetHeader>

          {/* Streak display at top */}
          <div className="mb-6">
            <StreakDisplay streakData={streakData} />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="badges" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="badges" className="gap-1.5 text-xs">
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Badges</span>
              </TabsTrigger>
              <TabsTrigger value="journal" className="gap-1.5 text-xs">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Journal</span>
              </TabsTrigger>
              <TabsTrigger value="battle" className="gap-1.5 text-xs">
                <Swords className="w-4 h-4" />
                <span className="hidden sm:inline">Battle</span>
              </TabsTrigger>
              <TabsTrigger value="share" className="gap-1.5 text-xs">
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="badges" className="mt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-foreground">
                    Achievement Badges
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {badges.length} / {10} unlocked
                  </span>
                </div>
                <BadgeGrid earnedBadges={badges} showLocked />
              </div>
            </TabsContent>

            <TabsContent value="journal" className="mt-0">
              <div className="space-y-4">
                <h3 className="font-display font-semibold text-foreground">
                  Mood Timeline
                </h3>
                <MoodJournal entries={journalEntries} maxEntries={20} />
              </div>
            </TabsContent>

            <TabsContent value="battle" className="mt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="font-display font-semibold text-foreground">
                    This or That?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Pick your favorite and discover your taste
                  </p>
                </div>
                <ThisOrThat />
              </div>
            </TabsContent>

            <TabsContent value="share" className="mt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="font-display font-semibold text-foreground">
                    Share Your Mood
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Create a beautiful card to share with friends
                  </p>
                </div>
                <ShareableMoodCard
                  data={{
                    mood: currentMood || journalEntries[0]?.mood || "happy",
                    moodEmoji: currentMoodEmoji || "😊",
                    movieTitle: currentMovie?.title || journalEntries[0]?.movie_title,
                    moviePoster: currentMovie?.poster || journalEntries[0]?.movie_poster,
                    streak: streakData?.current_streak,
                    date: new Date(),
                  }}
                  userName={user?.display_name}
                />
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </>
  );
}
