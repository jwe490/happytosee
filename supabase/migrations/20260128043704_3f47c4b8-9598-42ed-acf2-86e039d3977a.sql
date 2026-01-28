-- Create user_engagement table for tracking page views, clicks, and interactions
CREATE TABLE public.user_engagement (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.key_users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  page_path TEXT NOT NULL,
  movie_id INTEGER,
  movie_title TEXT,
  duration_ms INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_engagement ENABLE ROW LEVEL SECURITY;

-- Create index for faster queries
CREATE INDEX idx_user_engagement_session ON public.user_engagement(session_id);
CREATE INDEX idx_user_engagement_event_type ON public.user_engagement(event_type);
CREATE INDEX idx_user_engagement_created_at ON public.user_engagement(created_at DESC);
CREATE INDEX idx_user_engagement_user_id ON public.user_engagement(user_id);

-- Allow users to insert their own engagement data
CREATE POLICY "Users can insert their own engagement data" 
ON public.user_engagement 
FOR INSERT 
WITH CHECK (true);

-- Allow users to read their own engagement data
CREATE POLICY "Users can read their own engagement data" 
ON public.user_engagement 
FOR SELECT 
USING (true);

-- Create analytics function for admins to get engagement stats
CREATE OR REPLACE FUNCTION public.get_engagement_analytics(time_range text DEFAULT 'weekly')
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSON;
  date_filter TIMESTAMP WITH TIME ZONE;
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'analyst')) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  IF time_range = 'daily' THEN
    date_filter := NOW() - INTERVAL '1 day';
  ELSIF time_range = 'weekly' THEN
    date_filter := NOW() - INTERVAL '7 days';
  ELSIF time_range = 'monthly' THEN
    date_filter := NOW() - INTERVAL '30 days';
  ELSE
    date_filter := NOW() - INTERVAL '365 days';
  END IF;
  
  SELECT json_build_object(
    'total_events', (SELECT COUNT(*) FROM user_engagement WHERE created_at > date_filter),
    'unique_sessions', (SELECT COUNT(DISTINCT session_id) FROM user_engagement WHERE created_at > date_filter),
    'avg_session_duration_ms', (
      SELECT COALESCE(AVG(total_duration), 0)
      FROM (
        SELECT session_id, SUM(duration_ms) as total_duration
        FROM user_engagement
        WHERE created_at > date_filter AND duration_ms IS NOT NULL
        GROUP BY session_id
      ) sessions
    ),
    'events_by_type', (
      SELECT json_agg(event_data)
      FROM (
        SELECT event_type, COUNT(*) as count
        FROM user_engagement
        WHERE created_at > date_filter
        GROUP BY event_type
        ORDER BY count DESC
      ) event_data
    ),
    'top_pages', (
      SELECT json_agg(page_data)
      FROM (
        SELECT page_path, COUNT(*) as views, AVG(duration_ms) as avg_duration
        FROM user_engagement
        WHERE created_at > date_filter AND event_type = 'page_view'
        GROUP BY page_path
        ORDER BY views DESC
        LIMIT 10
      ) page_data
    ),
    'top_movies_clicked', (
      SELECT json_agg(movie_data)
      FROM (
        SELECT movie_id, movie_title, COUNT(*) as clicks
        FROM user_engagement
        WHERE created_at > date_filter AND event_type = 'movie_click' AND movie_id IS NOT NULL
        GROUP BY movie_id, movie_title
        ORDER BY clicks DESC
        LIMIT 10
      ) movie_data
    )
  ) INTO result;
  
  RETURN result;
END;
$$;