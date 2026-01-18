-- First, drop the existing foreign key constraint
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

-- The user_roles table now accepts UUIDs from either auth.users or key_users
-- We don't add a new foreign key since users can come from either table

-- Now insert the admin role for the key_user
INSERT INTO public.user_roles (user_id, role) 
VALUES ('3c4edc6f-deec-4cef-b36c-794cc6e90cd9', 'admin');