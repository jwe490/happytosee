-- Drop FK constraints pointing to auth.users (incompatible with key-based auth)
ALTER TABLE public.watchlist DROP CONSTRAINT IF EXISTS watchlist_user_id_fkey;
ALTER TABLE public.collections DROP CONSTRAINT IF EXISTS collections_user_id_fkey;
ALTER TABLE public.watch_history DROP CONSTRAINT IF EXISTS watch_history_user_id_fkey;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Add FK constraints pointing to key_users instead
ALTER TABLE public.watchlist ADD CONSTRAINT watchlist_user_id_key_users_fkey FOREIGN KEY (user_id) REFERENCES public.key_users(id) ON DELETE CASCADE;
ALTER TABLE public.collections ADD CONSTRAINT collections_user_id_key_users_fkey FOREIGN KEY (user_id) REFERENCES public.key_users(id) ON DELETE CASCADE;
ALTER TABLE public.watch_history ADD CONSTRAINT watch_history_user_id_key_users_fkey FOREIGN KEY (user_id) REFERENCES public.key_users(id) ON DELETE CASCADE;

-- Profiles may have auth.users entries from before - make FK optional
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_key_users_fkey FOREIGN KEY (user_id) REFERENCES public.key_users(id) ON DELETE CASCADE NOT VALID;