import { supabase } from "@/integrations/supabase/client";

export async function promoteUserToAdmin(userId: string, role: "admin" | "super_admin" = "admin") {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-setup`;
    const headers = {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'promote_to_admin',
        user_id: userId,
        role
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to promote user to admin');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function checkAdminStatus(userId: string) {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-setup`;
    const headers = {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'check_admin',
        user_id: userId
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to check admin status');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error checking admin status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function listAdmins() {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-setup`;
    const headers = {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'list_admins'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to list admins');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error listing admins:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function getCurrentUserAndPromoteToAdmin() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        success: false,
        error: 'No authenticated user found. Please log in first.'
      };
    }

    const result = await promoteUserToAdmin(user.id, "admin");

    if (result.success) {
      return {
        success: true,
        message: 'Current user successfully promoted to admin',
        userId: user.id,
        data: result.data
      };
    }

    return result;
  } catch (error) {
    console.error('Error in getCurrentUserAndPromoteToAdmin:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
