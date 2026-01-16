
-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create mood_selections table to track mood analytics
CREATE TABLE public.mood_selections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    mood TEXT NOT NULL,
    selected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mood_selections ENABLE ROW LEVEL SECURITY;

-- Users can insert their own mood selections
CREATE POLICY "Users can insert mood selections"
ON public.mood_selections
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own mood selections
CREATE POLICY "Users can view own mood selections"
ON public.mood_selections
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all mood selections
CREATE POLICY "Admins can view all mood selections"
ON public.mood_selections
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create recommendation_logs table for tracking recommendations
CREATE TABLE public.recommendation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    mood TEXT,
    movie_id INTEGER NOT NULL,
    movie_title TEXT NOT NULL,
    recommended_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recommendation_logs ENABLE ROW LEVEL SECURITY;

-- Users can insert their own recommendation logs
CREATE POLICY "Users can insert recommendation logs"
ON public.recommendation_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all recommendation logs
CREATE POLICY "Admins can view all recommendation logs"
ON public.recommendation_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create analytics views for admin dashboard
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  -- Only allow admins
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  SELECT json_build_object(
    'total_users', (SELECT COUNT(DISTINCT user_id) FROM profiles),
    'active_users_7d', (SELECT COUNT(DISTINCT user_id) FROM watchlist WHERE created_at > NOW() - INTERVAL '7 days'),
    'total_watchlist_items', (SELECT COUNT(*) FROM watchlist),
    'total_mood_selections', (SELECT COUNT(*) FROM mood_selections),
    'total_reviews', (SELECT COUNT(*) FROM reviews)
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Function to get trending moods
CREATE OR REPLACE FUNCTION public.get_trending_moods(time_range TEXT DEFAULT 'all')
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  date_filter TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Only allow admins
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  IF time_range = 'daily' THEN
    date_filter := NOW() - INTERVAL '1 day';
  ELSIF time_range = 'weekly' THEN
    date_filter := NOW() - INTERVAL '7 days';
  ELSE
    date_filter := NOW() - INTERVAL '100 years';
  END IF;
  
  SELECT json_agg(mood_data)
  FROM (
    SELECT mood, COUNT(*) as count
    FROM mood_selections
    WHERE selected_at > date_filter
    GROUP BY mood
    ORDER BY count DESC
    LIMIT 10
  ) mood_data INTO result;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Function to get top recommended movies
CREATE OR REPLACE FUNCTION public.get_top_recommended_movies()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  -- Only allow admins
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  SELECT json_agg(movie_data)
  FROM (
    SELECT movie_id, movie_title, COUNT(*) as recommendation_count
    FROM recommendation_logs
    GROUP BY movie_id, movie_title
    ORDER BY recommendation_count DESC
    LIMIT 10
  ) movie_data INTO result;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Function to get most watchlisted movies
CREATE OR REPLACE FUNCTION public.get_most_watchlisted_movies()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  -- Only allow admins
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  SELECT json_agg(movie_data)
  FROM (
    SELECT movie_id, title, poster_path, COUNT(*) as watchlist_count
    FROM watchlist
    GROUP BY movie_id, title, poster_path
    ORDER BY watchlist_count DESC
    LIMIT 10
  ) movie_data INTO result;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;
