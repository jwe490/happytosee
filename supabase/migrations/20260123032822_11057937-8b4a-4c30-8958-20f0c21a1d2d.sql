-- Create actor_analytics table for trending actor tracking
CREATE TABLE public.actor_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id INTEGER NOT NULL,
  actor_name TEXT NOT NULL,
  profile_path TEXT,
  watch_count INTEGER DEFAULT 0,
  mood_associations JSONB DEFAULT '{}',
  avg_rating NUMERIC(3,2) DEFAULT 0,
  popularity_score NUMERIC(8,2) DEFAULT 0,
  age_group_stats JSONB DEFAULT '{}',
  gender_stats JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create content_performance table
CREATE TABLE public.content_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  poster_path TEXT,
  watch_count INTEGER DEFAULT 0,
  completion_rate NUMERIC(5,2) DEFAULT 0,
  drop_off_point NUMERIC(5,2) DEFAULT 0,
  mood_performance JSONB DEFAULT '{}',
  avg_rating NUMERIC(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create recommendation_settings table
CREATE TABLE public.recommendation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin_activity_logs table
CREATE TABLE public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  admin_name TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create system_settings table
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(category, setting_key)
);

-- Create user_demographics table
CREATE TABLE public.user_demographics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  age_group TEXT,
  gender TEXT,
  device_type TEXT,
  first_visit TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_visit TIMESTAMP WITH TIME ZONE DEFAULT now(),
  visit_count INTEGER DEFAULT 1,
  is_returning BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.actor_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_demographics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for actor_analytics
CREATE POLICY "Admins can manage actor analytics"
ON public.actor_analytics FOR ALL
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Analysts can view actor analytics"
ON public.actor_analytics FOR SELECT
USING (public.has_role(auth.uid(), 'analyst'));

-- RLS Policies for content_performance
CREATE POLICY "Admins can manage content performance"
ON public.content_performance FOR ALL
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Analysts can view content performance"
ON public.content_performance FOR SELECT
USING (public.has_role(auth.uid(), 'analyst'));

-- RLS Policies for recommendation_settings
CREATE POLICY "Only admins can manage recommendation settings"
ON public.recommendation_settings FOR ALL
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for admin_activity_logs
CREATE POLICY "Super admins can view all logs"
ON public.admin_activity_logs FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can view logs"
ON public.admin_activity_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert logs"
ON public.admin_activity_logs FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'moderator'));

-- RLS Policies for system_settings
CREATE POLICY "Super admins can manage system settings"
ON public.system_settings FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can view system settings"
ON public.system_settings FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_demographics
CREATE POLICY "Admins can view demographics"
ON public.user_demographics FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'analyst'));

CREATE POLICY "Admins can manage demographics"
ON public.user_demographics FOR ALL
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Insert default recommendation settings
INSERT INTO public.recommendation_settings (setting_key, setting_value, description) VALUES
('mood_weights', '{"happy": 1.0, "sad": 1.0, "romantic": 1.0, "action": 1.0, "scary": 1.0, "thoughtful": 1.0}', 'Weight multipliers for mood-based recommendations'),
('mood_recommendations_enabled', 'true', 'Enable/disable mood-based recommendations'),
('actor_recommendations_enabled', 'true', 'Enable/disable actor-based recommendations'),
('trending_override', '{"enabled": false, "movies": []}', 'Manual trending override settings');

-- Insert default system settings
INSERT INTO public.system_settings (category, setting_key, setting_value, description) VALUES
('security', 'session_timeout', '"24"', 'Session timeout in hours'),
('security', 'max_login_attempts', '"5"', 'Maximum login attempts before lockout'),
('api', 'rate_limit', '"100"', 'API rate limit per minute'),
('backup', 'auto_backup_enabled', 'true', 'Enable automatic backups');

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_mood_selections_selected_at ON mood_selections(selected_at);
CREATE INDEX IF NOT EXISTS idx_recommendation_logs_recommended_at ON recommendation_logs(recommended_at);
CREATE INDEX IF NOT EXISTS idx_watchlist_created_at ON watchlist(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON admin_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_actor_analytics_actor_id ON actor_analytics(actor_id);
CREATE INDEX IF NOT EXISTS idx_content_performance_movie_id ON content_performance(movie_id);