-- Create mood_streaks table for tracking daily engagement
CREATE TABLE public.mood_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  total_days_active INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user_badges table for achievements
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  badge_id TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  badge_icon TEXT,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Create mood_journal table for tracking mood history
CREATE TABLE public.mood_journal (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  mood TEXT NOT NULL,
  movie_id INTEGER,
  movie_title TEXT,
  movie_poster TEXT,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create movie_battles table for "This or That" feature
CREATE TABLE public.movie_battles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  movie_a_id INTEGER NOT NULL,
  movie_a_title TEXT NOT NULL,
  movie_a_poster TEXT,
  movie_b_id INTEGER NOT NULL,
  movie_b_title TEXT NOT NULL,
  movie_b_poster TEXT,
  winner_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.mood_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movie_battles ENABLE ROW LEVEL SECURITY;

-- Create policies for mood_streaks
CREATE POLICY "Users can view their own streaks" ON public.mood_streaks FOR SELECT USING (true);
CREATE POLICY "Users can insert their own streaks" ON public.mood_streaks FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own streaks" ON public.mood_streaks FOR UPDATE USING (true);

-- Create policies for user_badges
CREATE POLICY "Users can view all badges" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "Users can insert their own badges" ON public.user_badges FOR INSERT WITH CHECK (true);

-- Create policies for mood_journal
CREATE POLICY "Users can view their own journal" ON public.mood_journal FOR SELECT USING (true);
CREATE POLICY "Users can insert their own entries" ON public.mood_journal FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete their own entries" ON public.mood_journal FOR DELETE USING (true);

-- Create policies for movie_battles
CREATE POLICY "Anyone can view battles" ON public.movie_battles FOR SELECT USING (true);
CREATE POLICY "Anyone can create battles" ON public.movie_battles FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update battles" ON public.movie_battles FOR UPDATE USING (true);

-- Create indexes for performance
CREATE INDEX idx_mood_streaks_user ON public.mood_streaks(user_id);
CREATE INDEX idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX idx_mood_journal_user_date ON public.mood_journal(user_id, created_at DESC);
CREATE INDEX idx_movie_battles_user ON public.movie_battles(user_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_mood_streaks_updated_at
BEFORE UPDATE ON public.mood_streaks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();