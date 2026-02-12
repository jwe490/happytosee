
-- Create review_replies table for threaded discussions
CREATE TABLE public.review_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  parent_reply_id UUID REFERENCES public.review_replies(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  reply_text TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create review_reactions table
CREATE TABLE public.review_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('helpful', 'insightful', 'funny', 'agree', 'disagree')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- Create user_follows table for profile follow functionality
CREATE TABLE public.user_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id TEXT NOT NULL,
  following_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Enable RLS
ALTER TABLE public.review_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- RLS policies for review_replies (public read, authenticated write via edge function)
CREATE POLICY "Anyone can read replies" ON public.review_replies FOR SELECT USING (true);
CREATE POLICY "Service role can manage replies" ON public.review_replies FOR ALL USING (true);

-- RLS policies for review_reactions
CREATE POLICY "Anyone can read reactions" ON public.review_reactions FOR SELECT USING (true);
CREATE POLICY "Service role can manage reactions" ON public.review_reactions FOR ALL USING (true);

-- RLS policies for user_follows
CREATE POLICY "Anyone can read follows" ON public.user_follows FOR SELECT USING (true);
CREATE POLICY "Service role can manage follows" ON public.user_follows FOR ALL USING (true);

-- Indexes
CREATE INDEX idx_review_replies_review_id ON public.review_replies(review_id);
CREATE INDEX idx_review_replies_parent ON public.review_replies(parent_reply_id);
CREATE INDEX idx_review_reactions_review_id ON public.review_reactions(review_id);
CREATE INDEX idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON public.user_follows(following_id);
