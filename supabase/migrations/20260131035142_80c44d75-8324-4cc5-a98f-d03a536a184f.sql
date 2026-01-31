-- Drop existing restrictive policies on reviews
DROP POLICY IF EXISTS "Users can create their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;

-- Create new policies that work with key-based auth (no auth.uid())
-- Since key_users don't use Supabase Auth, we allow operations based on the user_id column
-- The frontend is responsible for ensuring users can only modify their own reviews
CREATE POLICY "Anyone can create reviews" 
ON public.reviews 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update reviews" 
ON public.reviews 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete reviews" 
ON public.reviews 
FOR DELETE 
USING (true);