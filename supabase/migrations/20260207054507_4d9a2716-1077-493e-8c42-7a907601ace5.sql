-- Drop the existing FK to auth.users (which doesn't contain key_users)
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;

-- Add FK to key_users instead
ALTER TABLE public.reviews 
ADD CONSTRAINT reviews_user_id_key_users_fkey 
FOREIGN KEY (user_id) REFERENCES public.key_users(id) ON DELETE CASCADE;