-- Create function for enhanced admin stats with role permissions
CREATE OR REPLACE FUNCTION public.get_enhanced_admin_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'analyst')) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  SELECT json_build_object(
    'total_users', (SELECT COUNT(DISTINCT id) FROM key_users),
    'active_users_7d', (SELECT COUNT(DISTINCT user_id) FROM watchlist WHERE created_at > NOW() - INTERVAL '7 days'),
    'active_users_30d', (SELECT COUNT(DISTINCT user_id) FROM watchlist WHERE created_at > NOW() - INTERVAL '30 days'),
    'total_watchlist_items', (SELECT COUNT(*) FROM watchlist),
    'total_mood_selections', (SELECT COUNT(*) FROM mood_selections),
    'total_reviews', (SELECT COUNT(*) FROM reviews),
    'new_users_7d', (SELECT COUNT(*) FROM key_users WHERE created_at > NOW() - INTERVAL '7 days'),
    'total_recommendations', (SELECT COUNT(*) FROM recommendation_logs),
    'trending_mood', (SELECT mood FROM mood_selections WHERE selected_at > NOW() - INTERVAL '7 days' GROUP BY mood ORDER BY COUNT(*) DESC LIMIT 1)
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role::text INTO user_role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role 
      WHEN 'super_admin' THEN 1 
      WHEN 'admin' THEN 2 
      WHEN 'moderator' THEN 3 
      WHEN 'analyst' THEN 4 
      ELSE 5 
    END
  LIMIT 1;
  
  RETURN COALESCE(user_role, 'user');
END;
$$;

-- Create function to get mood analytics over time
CREATE OR REPLACE FUNCTION public.get_mood_analytics(time_range text DEFAULT 'weekly')
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    'mood_frequency', (
      SELECT json_agg(mood_data)
      FROM (
        SELECT mood, COUNT(*) as count, 
               ROUND((COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM mood_selections WHERE selected_at > date_filter), 0)), 2) as percentage
        FROM mood_selections
        WHERE selected_at > date_filter
        GROUP BY mood
        ORDER BY count DESC
      ) mood_data
    ),
    'mood_by_day', (
      SELECT json_agg(day_data)
      FROM (
        SELECT DATE(selected_at) as date, mood, COUNT(*) as count
        FROM mood_selections
        WHERE selected_at > date_filter
        GROUP BY DATE(selected_at), mood
        ORDER BY date
      ) day_data
    ),
    'total_selections', (SELECT COUNT(*) FROM mood_selections WHERE selected_at > date_filter)
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Create function to get all admin users
CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Access denied - super admin only';
  END IF;
  
  SELECT json_agg(admin_data)
  FROM (
    SELECT 
      ur.user_id,
      ur.role::text,
      ur.created_at,
      ku.display_name,
      ku.last_login_at
    FROM user_roles ur
    LEFT JOIN key_users ku ON ku.id = ur.user_id
    WHERE ur.role IN ('admin', 'super_admin', 'moderator', 'analyst')
    ORDER BY ur.created_at DESC
  ) admin_data INTO result;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Create function to get content performance stats
CREATE OR REPLACE FUNCTION public.get_content_performance_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'analyst')) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  SELECT json_build_object(
    'most_watched', (
      SELECT json_agg(movie_data)
      FROM (
        SELECT movie_id, title, poster_path, COUNT(*) as watch_count
        FROM watch_history
        GROUP BY movie_id, title, poster_path
        ORDER BY watch_count DESC
        LIMIT 10
      ) movie_data
    ),
    'most_reviewed', (
      SELECT json_agg(review_data)
      FROM (
        SELECT movie_id, movie_title as title, movie_poster as poster_path, COUNT(*) as review_count, AVG(rating) as avg_rating
        FROM reviews
        GROUP BY movie_id, movie_title, movie_poster
        ORDER BY review_count DESC
        LIMIT 10
      ) review_data
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Create function to get user demographics
CREATE OR REPLACE FUNCTION public.get_user_demographics_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'analyst')) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  SELECT json_build_object(
    'by_gender', (
      SELECT json_agg(gender_data)
      FROM (
        SELECT gender, COUNT(*) as count
        FROM key_users
        WHERE gender IS NOT NULL
        GROUP BY gender
      ) gender_data
    ),
    'new_vs_returning', (
      SELECT json_build_object(
        'new_users', (SELECT COUNT(*) FROM key_users WHERE created_at > NOW() - INTERVAL '30 days'),
        'returning_users', (SELECT COUNT(*) FROM key_users WHERE last_login_at > NOW() - INTERVAL '7 days' AND created_at < NOW() - INTERVAL '7 days')
      )
    ),
    'total_users', (SELECT COUNT(*) FROM key_users)
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Create function to update recommendation settings
CREATE OR REPLACE FUNCTION public.update_recommendation_setting(
  p_setting_key text,
  p_setting_value jsonb,
  p_updated_by uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  UPDATE recommendation_settings
  SET setting_value = p_setting_value, updated_by = p_updated_by, updated_at = NOW()
  WHERE setting_key = p_setting_key
  RETURNING json_build_object('setting_key', setting_key, 'setting_value', setting_value) INTO result;
  
  RETURN result;
END;
$$;

-- Create function to log admin activity
CREATE OR REPLACE FUNCTION public.log_admin_activity(
  p_admin_id uuid,
  p_admin_name text,
  p_action text,
  p_resource_type text DEFAULT NULL,
  p_resource_id text DEFAULT NULL,
  p_details jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO admin_activity_logs (admin_id, admin_name, action, resource_type, resource_id, details)
  VALUES (p_admin_id, p_admin_name, p_action, p_resource_type, p_resource_id, p_details)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Create function to add admin role
CREATE OR REPLACE FUNCTION public.add_admin_role(
  p_user_id uuid,
  p_role app_role
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Access denied - super admin only';
  END IF;
  
  INSERT INTO user_roles (user_id, role)
  VALUES (p_user_id, p_role)
  ON CONFLICT (user_id, role) DO NOTHING
  RETURNING json_build_object('user_id', user_id, 'role', role::text) INTO result;
  
  RETURN COALESCE(result, json_build_object('message', 'Role already exists'));
END;
$$;

-- Create function to remove admin role
CREATE OR REPLACE FUNCTION public.remove_admin_role(
  p_user_id uuid,
  p_role app_role
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Access denied - super admin only';
  END IF;
  
  DELETE FROM user_roles WHERE user_id = p_user_id AND role = p_role;
  
  RETURN json_build_object('success', true, 'message', 'Role removed');
END;
$$;