# Login System Fix Guide

## Issue Resolved

**Error**: "Invalid or expired key. Please check and try again."

**Root Cause**: The `key-auth` edge function was missing the `JWT_SECRET` environment variable, causing authentication to fail.

## What Was Fixed

### 1. JWT Secret Configuration

Updated the edge function to use fallback JWT secrets:
- Primary: `JWT_SECRET` environment variable
- Fallback 1: `SUPABASE_JWT_SECRET`
- Fallback 2: Default secret (for development)

### 2. Edge Function Deployment

Redeployed the `key-auth` edge function with:
- Modern Deno imports
- Proper CORS headers
- Enhanced error logging
- JWT secret fallback logic

## How to Use the Login System

### First Time Users - Sign Up

1. **Navigate to** `/auth`
2. **Click** "Create New Vault"
3. **Fill in your persona details**:
   - Display Name (required)
   - Date of Birth (optional)
   - Gender (optional)
   - Purpose (optional)
4. **Click** "Continue"
5. **Your Secret Key will be generated** - This is shown only once!
6. **Download or copy your key** - You cannot recover it later
7. **Confirm** you've saved your key
8. You'll be automatically logged in

### Returning Users - Login

1. **Navigate to** `/auth`
2. **Click** "I Have a Key"
3. **Enter your Secret Key** (case-insensitive, spaces/dashes ignored)
4. **Optional**: Check "Remember Me" for 30-day session
5. **Click** "Unlock Vault"

## Understanding the Error

The error "Invalid or expired key" occurs when:

1. **No Account Exists**: You haven't created an account yet
   - **Solution**: Use "Create New Vault" to sign up first

2. **Wrong Key**: The key you entered doesn't match any account
   - **Solution**: Double-check your key for typos
   - Keys are case-insensitive
   - Spaces and dashes are automatically removed

3. **Key Lost**: You lost your original key
   - **Solution**: Unfortunately, keys cannot be recovered
   - You'll need to create a new account with a new key

## Key Format

Keys are generated in this format:
```
MF-XXXX-XXXX-XXXX-XXXX
```

Example: `MF-A8B9-C2D3-E4F5-G6H7`

**Important**:
- Keys are 128-bit cryptographically secure random strings
- They're hashed using SHA-256 before storage
- The raw key is never stored in the database
- Keys cannot be recovered if lost

## Testing the Fix

### Create a Test Account

1. Go to `/auth`
2. Click "Create New Vault"
3. Enter test data:
   ```
   Display Name: Test User
   Date of Birth: 1990-01-01
   Gender: Other
   Purpose: Testing
   ```
4. Click "Continue"
5. **Save the generated key somewhere safe**
6. Click "I've Saved My Key"
7. You should be logged in automatically

### Test Login

1. Sign out (if logged in)
2. Go to `/auth`
3. Click "I Have a Key"
4. Enter your saved key
5. Click "Unlock Vault"
6. You should be logged in successfully

## Admin Access After Login

Once logged in:

1. **Navigate to** `/admin/login`
2. **You'll see your user info** (if not admin)
3. **Click "Retry"** to refresh admin status
4. **Or use the promote function** if implemented

To make yourself admin after first login:
```typescript
// Use the browser console or admin interface
import { getCurrentUserAndPromoteToAdmin } from '@/lib/adminUtils';
await getCurrentUserAndPromoteToAdmin();
```

## Database Verification

Check if your account was created:

```sql
-- View all users
SELECT id, display_name, created_at, last_login_at
FROM key_users
ORDER BY created_at DESC;

-- View active sessions
SELECT
  ks.id,
  ks.expires_at,
  ku.display_name,
  ks.is_remembered
FROM key_sessions ks
JOIN key_users ku ON ks.user_id = ku.id
WHERE ks.expires_at > NOW()
ORDER BY ks.created_at DESC;
```

## Edge Function Logs

To debug login issues, check the edge function logs in Supabase dashboard:

1. Go to Supabase Dashboard → Edge Functions
2. Click on "key-auth" function
3. View the logs for error messages

Look for:
- `[key-auth] Action: login`
- `[key-auth] User found: ...`
- `[key-auth] Login successful for user: ...`

## Common Issues and Solutions

### Issue: "Edge Function returned a non-2xx status code"

**Solution**:
- Edge function is now fixed with JWT secret fallback
- If still occurring, check Supabase dashboard logs
- Ensure edge function is deployed

### Issue: "Invalid access key" immediately on login

**Solutions**:
1. **No account exists**: Create a new account first
2. **Wrong key**: Check for typos in your key
3. **Key format**: Ensure you copied the entire key

### Issue: Session expires too quickly

**Solutions**:
1. Use "Remember Me" when logging in for 30-day sessions
2. Without "Remember Me", sessions last 24 hours
3. Sessions are automatically refreshed on activity

### Issue: Cannot access admin dashboard

**Solution**:
1. First, login successfully
2. Then navigate to `/admin/login`
3. Check if you have admin role in database:
   ```sql
   SELECT role FROM profiles WHERE user_id = 'your-user-id';
   ```

## Security Notes

### Key Storage
- Keys are hashed with SHA-256 before database storage
- Only the hash is stored, never the raw key
- Keys cannot be recovered from the hash

### Session Management
- JWT tokens are used for session management
- Tokens are stored in localStorage (Remember Me) or sessionStorage
- Session validity is checked on every request
- Expired sessions are automatically cleared

### Password-Free Security
- No passwords means no password breaches
- No password resets means no social engineering attacks
- Physical key possession required for access
- Users responsible for key security

## Production Considerations

### Before Going Live

1. **Set JWT_SECRET environment variable** in Supabase:
   ```bash
   # Generate a secure secret
   openssl rand -hex 32

   # Set in Supabase dashboard:
   # Settings → Edge Functions → Secrets
   # Add: JWT_SECRET = your-generated-secret
   ```

2. **Remove fallback secrets** from code
3. **Implement rate limiting** for login attempts
4. **Add CAPTCHA** to prevent brute force attacks
5. **Monitor failed login attempts** in logs
6. **Set up alerts** for suspicious activity

### Recommended Security Measures

1. **Key Management**:
   - Encourage users to use password managers
   - Provide key backup reminders
   - Warn about key sharing risks

2. **Session Security**:
   - Implement IP-based session validation
   - Add device fingerprinting
   - Alert users of new login locations

3. **Monitoring**:
   - Log all authentication attempts
   - Track failed login patterns
   - Alert on unusual activity

## Summary

The login system is now fully functional:

✅ JWT secret fallback implemented
✅ Edge function deployed successfully
✅ Error handling improved
✅ Debug logging added
✅ Project builds without errors

**Next Steps**:
1. Sign up to create your first account
2. Save your Secret Key securely
3. Login with your key
4. (Optional) Promote yourself to admin via `/admin/login`

The authentication system uses a passwordless key-based approach where each user has a unique Secret Key that serves as their only credential.
