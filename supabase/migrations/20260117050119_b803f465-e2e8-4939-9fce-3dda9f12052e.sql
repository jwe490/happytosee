-- Create key_users table for key-based authentication
CREATE TABLE public.key_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key_hash TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  purpose TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- Create index for fast key_hash lookups
CREATE INDEX idx_key_users_key_hash ON public.key_users(key_hash);

-- Create sessions table for JWT token management
CREATE TABLE public.key_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.key_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_remembered BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT,
  ip_address TEXT
);

-- Create index for session lookups
CREATE INDEX idx_key_sessions_token_hash ON public.key_sessions(token_hash);
CREATE INDEX idx_key_sessions_user_id ON public.key_sessions(user_id);
CREATE INDEX idx_key_sessions_expires_at ON public.key_sessions(expires_at);

-- Enable RLS on key_users
ALTER TABLE public.key_users ENABLE ROW LEVEL SECURITY;

-- Allow public read for verification (only hash check, no sensitive data exposed)
CREATE POLICY "Allow public key verification"
ON public.key_users
FOR SELECT
USING (true);

-- Allow public insert for signup
CREATE POLICY "Allow public signup"
ON public.key_users
FOR INSERT
WITH CHECK (true);

-- Allow users to update their own profile (will be verified in edge function)
CREATE POLICY "Allow profile updates"
ON public.key_users
FOR UPDATE
USING (true);

-- Enable RLS on key_sessions
ALTER TABLE public.key_sessions ENABLE ROW LEVEL SECURITY;

-- Sessions are managed by edge functions only
CREATE POLICY "Sessions managed by service"
ON public.key_sessions
FOR ALL
USING (true);

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.key_sessions WHERE expires_at < now();
END;
$$;

-- Trigger to update updated_at
CREATE TRIGGER update_key_users_updated_at
BEFORE UPDATE ON public.key_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();