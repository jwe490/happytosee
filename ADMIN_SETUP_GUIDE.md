# Admin Role System Setup Guide

## Overview

A comprehensive admin role system has been implemented with multiple layers of security:

1. **Database-level security** using Row Level Security (RLS)
2. **Function-level security** with `is_admin()` checks
3. **Frontend route protection** with `AdminProtectedRoute`
4. **Edge function** for secure role management

## Security Features

### Database Layer

- **RLS Enabled**: All admin tables are protected with Row Level Security
- **Role Column**: Added to `profiles` table with values: `user`, `admin`, `super_admin`
- **Security Function**: `is_admin()` returns true only for admin/super_admin roles
- **Helper Function**: `set_user_as_admin()` for promoting users (logs all actions)

### Protected Tables

The following tables are restricted to admins only:

- `actor_analytics` - Actor performance data
- `content_performance` - Movie engagement metrics
- `admin_activity_logs` - Admin action audit trail
- `system_settings` - System configuration
- `recommendation_settings` - Recommendation algorithm settings
- `user_demographics` - User demographic data (read-only for admins)
- `mood_selections` - User mood history (read-only for admins)
- `recommendation_logs` - Recommendation history (read-only for admins)

### Frontend Protection

- **Route Protection**: `/admin/*` routes are protected by `AdminProtectedRoute`
- **Hook Validation**: `useAdminAuth()` checks both `profiles.role` and `user_roles.role`
- **Unauthorized Access**: Non-admin users are redirected to access denied page

## How to Make a User Admin

### Method 1: Using the Admin Login Page (Recommended)

1. Log in to your account
2. Navigate to `/admin/login`
3. Click the "Make Me Admin" button
4. The page will refresh and grant you admin access

### Method 2: Using the Admin Setup Edge Function

```typescript
import { promoteUserToAdmin } from '@/lib/adminUtils';

// Promote current user
await promoteUserToAdmin(userId, 'admin'); // or 'super_admin'
```

### Method 3: Direct Database Call (For Development)

```sql
-- Using SQL directly
SELECT set_user_as_admin('user-uuid-here', 'admin');
```

## Admin Dashboard Features

Once promoted to admin, you can access:

### Analytics & Insights

- **User Insights**: View user demographics, activity patterns, and engagement metrics
- **Content Performance**: Track movie views, ratings, and completion rates
- **Actor Analytics**: Monitor popular actors and their performance
- **Genre Analytics**: Analyze genre preferences and trends
- **Mood Analytics**: View mood-based recommendation patterns

### Management Tools

- **User Management**: View and manage user accounts
- **System Settings**: Configure application settings
- **Recommendation Settings**: Tune recommendation algorithms
- **Activity Logs**: Audit trail of all admin actions

### Trending Data

- View trending movies
- Track trending actors
- Monitor trending genres
- Analyze trending moods

## Security Best Practices

### Database Security

1. **All admin data is protected by RLS**
   - Non-admin users cannot query admin tables
   - Database-level enforcement prevents API bypass

2. **Functions use SECURITY DEFINER**
   - `is_admin()` runs with elevated privileges
   - Prevents role escalation attacks

3. **Action Logging**
   - All admin role changes are logged
   - Audit trail includes admin ID, action, and timestamp

### Frontend Security

1. **Route Protection**
   - `AdminProtectedRoute` guards all admin routes
   - Shows loading state during verification
   - Redirects unauthorized users

2. **Role Checking**
   - `useAdminAuth()` hook validates role on every render
   - Checks both `profiles` and `user_roles` tables
   - Returns loading state to prevent flashing

### API Security

1. **Edge Function Protection**
   - Uses service role key for admin operations
   - Validates user existence before promotion
   - Returns detailed error messages

2. **No Direct RPC Access**
   - Users cannot call `set_user_as_admin()` directly via client
   - Must go through protected edge function

## Testing Admin Access

### Verify Admin Role

```typescript
import { checkAdminStatus } from '@/lib/adminUtils';

const result = await checkAdminStatus(userId);
console.log(result.data.is_admin); // true or false
console.log(result.data.role); // 'user', 'admin', or 'super_admin'
```

### List All Admins

```typescript
import { listAdmins } from '@/lib/adminUtils';

const result = await listAdmins();
console.log(result.data.admins); // Array of admin users
```

## Role Hierarchy

- **user**: Standard user with no admin privileges
- **admin**: Full admin access to dashboard and analytics
- **super_admin**: Same as admin (can be extended for additional privileges)

## Troubleshooting

### "Access Denied" Error

1. Verify your role in the database:
   ```sql
   SELECT role FROM profiles WHERE user_id = 'your-user-id';
   ```

2. Check if RLS policies are active:
   ```sql
   SELECT tablename, policyname FROM pg_policies WHERE tablename LIKE 'admin%';
   ```

3. Clear browser cache and re-login

### Admin Button Not Working

1. Check browser console for errors
2. Verify edge function is deployed
3. Check that you're logged in with a valid session

### Cannot Access Admin Dashboard

1. Wait for role check to complete (loading spinner)
2. Refresh the page after promotion
3. Verify the `is_admin()` function exists in database

## Migration Details

The admin role system was implemented in migration: `add_admin_role_system_v2`

Key changes:
- Added `role` column to `profiles` table
- Created `is_admin()` security function
- Updated RLS policies on all admin tables
- Created `set_user_as_admin()` helper function
- Added indexes for performance

## Production Considerations

### Before Going Live

1. **Remove Self-Promotion Feature**: Consider disabling the "Make Me Admin" button in production
2. **Secure Admin Setup**: Use database access or secure admin panel for role promotion
3. **Monitor Admin Logs**: Regularly review `admin_activity_logs` for suspicious activity
4. **Backup Data**: Always backup before making role changes
5. **Rate Limiting**: Consider adding rate limits to admin promotion endpoints

### Recommended Production Flow

1. Admin promotion should require super admin approval
2. Use multi-factor authentication for admin accounts
3. Implement IP whitelisting for admin routes
4. Set up alerts for admin role changes
5. Regular security audits of RLS policies

## Support

For questions or issues:
1. Check the `admin_activity_logs` table for audit trail
2. Review RLS policies using `pg_policies` view
3. Test database functions with `SELECT is_admin()`
4. Verify edge function logs in Supabase dashboard
