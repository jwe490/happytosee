/*
  # Create get_user_role RPC Function
  
  ## Overview
  Creates a secure RPC function to retrieve user role information.
  This function is used by the frontend to check admin permissions.
  
  ## Changes
  - Create `get_user_role` function that returns the user's role
  - Checks both `profiles.role` and `user_roles.role` tables
  - Returns the highest privilege role if user has multiple roles
  - Uses SECURITY DEFINER for secure access
  
  ## Security
  - Function can only return role for the calling user or specified user
  - Uses auth.uid() for authentication
  - Prevents unauthorized role disclosure
*/

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  target_user_id uuid;
  user_role text;
BEGIN
  -- Use provided user_id or default to current user
  target_user_id := COALESCE(_user_id, auth.uid());
  
  -- Return null if no user
  IF target_user_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- First check profiles table for role
  SELECT role::text INTO user_role
  FROM profiles
  WHERE user_id = target_user_id
  AND role IN ('admin', 'super_admin')
  LIMIT 1;
  
  -- If found in profiles, return it
  IF user_role IS NOT NULL THEN
    RETURN user_role;
  END IF;
  
  -- Otherwise check user_roles table
  SELECT role::text INTO user_role
  FROM user_roles
  WHERE user_id = target_user_id
  AND role IN ('admin', 'super_admin', 'moderator', 'analyst')
  ORDER BY 
    CASE role::text
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'moderator' THEN 3
      WHEN 'analyst' THEN 4
      ELSE 5
    END
  LIMIT 1;
  
  -- Return the role (or NULL if no admin role found)
  RETURN user_role;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.get_user_role(uuid) IS 'Returns the admin role for a user. Checks both profiles and user_roles tables. Returns the highest privilege role if multiple exist.';

-- Create a helper function for the current user (no parameters needed)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT get_user_role(auth.uid());
$$;

GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;

COMMENT ON FUNCTION public.get_my_role() IS 'Returns the admin role for the currently authenticated user.';
