-- Add is_public field to profiles for anonymous/public toggle
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- Update RLS to respect public profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Public profiles are viewable by everyone, private only by owner
CREATE POLICY "Public profiles are viewable" 
ON public.profiles 
FOR SELECT 
USING (is_public = true OR auth.uid() = user_id);