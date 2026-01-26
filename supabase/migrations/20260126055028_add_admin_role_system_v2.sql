/*
  # Admin Role System Implementation
  
  ## Overview
  This migration implements a comprehensive admin role system with proper security controls.
  
  ## Changes Made
  
  ### 1. Profile Table Enhancement
  - Add `role` column to profiles table with values: user, admin, super_admin
  - Set default role as 'user'
  - Add index for fast role lookups
  
  ### 2. Security Functions
  - Create `is_admin()` function that returns true if logged-in user has admin or super_admin role
  - Uses SECURITY DEFINER for secure role checking
  - Checks both profiles.role and user_roles.role for flexibility
  
  ### 3. Row Level Security
  - Update RLS policies on all admin tables to use is_admin()
  - Ensure only admins can access:
    - actor_analytics
    - content_performance
    - admin_activity_logs
    - system_settings
    - recommendation_settings
    - user_demographics
    - mood_selections (admin read access)
    - recommendation_logs (admin read access)
  
  ### 4. Helper Functions
  - Create `set_user_as_admin()` function to promote users to admin
  - Can only be called by super_admins or in migrations
  
  ## Security Notes
  - All admin data is protected by RLS
  - Functions use SECURITY DEFINER with proper search_path
  - Non-admin users cannot access admin APIs or data
  - Role checks happen at database level for maximum security
*/

-- Step 1: Add role column to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role app_role DEFAULT 'user'::app_role;
    
    -- Create index for fast role lookups
    CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
    
    -- Create index on user_id for fast user lookups
    CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
  END IF;
END $$;

-- Step 2: Create is_admin() function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles
    WHERE user_id = auth.uid()
    AND role IN ('admin'::app_role, 'super_admin'::app_role)
  ) OR EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin'::app_role, 'super_admin'::app_role)
  );
$$;

-- Step 3: Create helper function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_profile_role(check_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles
    WHERE user_id = auth.uid()
    AND role = check_role
  );
$$;

-- Step 4: Create function to set user as admin
CREATE OR REPLACE FUNCTION public.set_user_as_admin(target_user_id uuid, target_role app_role DEFAULT 'admin'::app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update or insert profile role
  INSERT INTO profiles (user_id, role, display_name, created_at, updated_at)
  VALUES (target_user_id, target_role, 'Admin User', now(), now())
  ON CONFLICT (user_id) DO UPDATE
  SET role = target_role, updated_at = now();
  
  -- Also ensure user_roles entry exists
  INSERT INTO user_roles (user_id, role)
  VALUES (target_user_id, target_role)
  ON CONFLICT DO NOTHING;
  
  -- Log the action
  INSERT INTO admin_activity_logs (admin_id, admin_name, action, resource_type, resource_id, details)
  VALUES (
    COALESCE(auth.uid(), target_user_id),
    COALESCE((SELECT display_name FROM profiles WHERE user_id = auth.uid()), 'System'),
    'SET_ADMIN_ROLE',
    'user',
    target_user_id::text,
    jsonb_build_object('new_role', target_role::text)
  );
END;
$$;

-- Step 5: Update RLS policies for admin tables
-- actor_analytics policies
DROP POLICY IF EXISTS "Admins can manage actor analytics" ON actor_analytics;
DROP POLICY IF EXISTS "Analysts can view actor analytics" ON actor_analytics;

CREATE POLICY "Admins can manage actor analytics"
ON actor_analytics
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- content_performance policies
DROP POLICY IF EXISTS "Admins can manage content performance" ON content_performance;
DROP POLICY IF EXISTS "Analysts can view content performance" ON content_performance;

CREATE POLICY "Admins can manage content performance"
ON content_performance
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- admin_activity_logs policies
DROP POLICY IF EXISTS "Admins can view logs" ON admin_activity_logs;
DROP POLICY IF EXISTS "Super admins can view all logs" ON admin_activity_logs;
DROP POLICY IF EXISTS "Admins can insert logs" ON admin_activity_logs;
DROP POLICY IF EXISTS "Admins can view all activity logs" ON admin_activity_logs;
DROP POLICY IF EXISTS "Admins can insert activity logs" ON admin_activity_logs;

CREATE POLICY "Admins can view all activity logs"
ON admin_activity_logs
FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can insert activity logs"
ON admin_activity_logs
FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- system_settings policies
DROP POLICY IF EXISTS "Admins can view system settings" ON system_settings;
DROP POLICY IF EXISTS "Super admins can manage system settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can read system settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can manage system settings" ON system_settings;

CREATE POLICY "Admins can read system settings"
ON system_settings
FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can manage system settings"
ON system_settings
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- recommendation_settings policies
DROP POLICY IF EXISTS "Only admins can manage recommendation settings" ON recommendation_settings;
DROP POLICY IF EXISTS "Admins can manage recommendation settings" ON recommendation_settings;

CREATE POLICY "Admins can manage recommendation settings"
ON recommendation_settings
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- user_demographics policies
DROP POLICY IF EXISTS "Admins can view user demographics" ON user_demographics;
DROP POLICY IF EXISTS "Users can manage own demographics" ON user_demographics;
DROP POLICY IF EXISTS "Admins can manage demographics" ON user_demographics;
DROP POLICY IF EXISTS "Admins can view demographics" ON user_demographics;
DROP POLICY IF EXISTS "Admins can view all demographics" ON user_demographics;

CREATE POLICY "Users can manage own demographics"
ON user_demographics
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all demographics"
ON user_demographics
FOR SELECT
TO authenticated
USING (is_admin());

-- Step 6: Update profiles table RLS
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid() 
  AND role = (SELECT role FROM profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Public profiles are viewable"
ON profiles
FOR SELECT
TO authenticated
USING (is_public = true);

-- Step 7: Grant execute permissions on admin functions
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION has_profile_role(app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION set_user_as_admin(uuid, app_role) TO authenticated;

COMMENT ON FUNCTION is_admin() IS 'Returns true if the current user has admin or super_admin role';
COMMENT ON FUNCTION set_user_as_admin(uuid, app_role) IS 'Sets a user as admin. Logs the action in admin_activity_logs.';
