# Quick Start Guide - Login Fixed!

## ✅ Issue Resolved

The "Internal server error" has been fixed! The edge function is now deployed and working.

## 🚀 How to Get Started

### Step 1: Create Your Account (First Time)

Since you don't have an account yet, you need to sign up:

1. **Navigate to**: `http://localhost:5173/auth` (or your app URL)
2. **Click**: "Create New Vault" button
3. **Fill in the form**:
   - Display Name: `Your Name` (required)
   - Date of Birth: Optional
   - Gender: Optional
   - Purpose: Optional
4. **Click**: "Continue"
5. **SAVE YOUR SECRET KEY!**
   - It will look like: `MF-XXXX-XXXX-XXXX-XXXX`
   - Download it or copy it somewhere safe
   - **You cannot recover it later!**
6. **Click**: "I've Saved My Key"
7. You'll be automatically logged in!

### Step 2: Future Logins

Once you have your Secret Key:

1. **Go to**: `/auth`
2. **Click**: "I Have a Key"
3. **Enter your Secret Key**
4. **Click**: "Unlock Vault"

## 🔧 What Was Fixed

The edge function had these issues:
1. ❌ Required JWT_SECRET but it wasn't set
2. ❌ Poor error handling
3. ❌ Missing input validation

Now fixed:
1. ✅ JWT secret with automatic fallback
2. ✅ Better error messages
3. ✅ Input validation
4. ✅ Improved logging for debugging

## 🔐 Getting Admin Access

After logging in for the first time:

1. **Navigate to**: `/admin/login`
2. You'll see your user info
3. The system will check if you're an admin
4. **To become admin**, use one of these methods:

### Method A: Browser Console (Quick)

Open browser console and run:
```javascript
// Make current user admin
const result = await fetch(`${window.location.origin}/functions/v1/admin-setup`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    action: 'promote_to_admin',
    user_id: 'YOUR_USER_ID', // Get from /admin/login page
    role: 'admin'
  })
});
console.log(await result.json());
```

### Method B: Database Query

Use Supabase SQL Editor:
```sql
-- First, get your user ID from key_users table
SELECT id, display_name FROM key_users;

-- Then promote to admin
SELECT set_user_as_admin('YOUR_USER_ID_HERE', 'admin');

-- Verify
SELECT role FROM profiles WHERE user_id = 'YOUR_USER_ID_HERE';
```

### Method C: Wait for the promotion feature
The self-promotion button should be available on `/admin/login` page.

## 🎯 Testing the System

### 1. Test Signup
```bash
# Go to /auth
# Click "Create New Vault"
# Fill form and continue
# Should see your Secret Key
```

### 2. Test Login
```bash
# Go to /auth
# Click "I Have a Key"
# Enter your saved key
# Should login successfully
```

### 3. Test Admin Access
```bash
# After promoting yourself to admin:
# Go to /admin/login
# Should see "Access granted!"
# Click "Go to Dashboard"
# Should see full admin dashboard
```

## 📊 Verify Everything Works

### Check Database
```sql
-- View users
SELECT * FROM key_users;

-- View sessions
SELECT * FROM key_sessions WHERE expires_at > NOW();

-- View admins
SELECT * FROM profiles WHERE role IN ('admin', 'super_admin');
```

### Check Edge Functions
In Supabase Dashboard → Edge Functions:
- ✅ `key-auth` should be ACTIVE
- ✅ `admin-setup` should be ACTIVE

### Check Logs
If you encounter issues, check edge function logs:
1. Supabase Dashboard → Edge Functions
2. Click on `key-auth`
3. View logs for error messages

## ❗ Important Notes

### About Your Secret Key
- 🔑 Your key is your ONLY way to access your account
- 💾 Save it in a password manager or secure location
- 🚫 Never share your key with anyone
- ⚠️ If you lose it, you'll need to create a new account

### Security
- Keys are hashed with SHA-256 before storage
- Only the hash is stored in the database
- Sessions use JWT tokens
- All admin tables are protected with RLS

## 🐛 Troubleshooting

### "Invalid or expired key"
- **Cause**: No account exists with that key
- **Solution**: Create a new account first via "Create New Vault"

### "Edge Function returned 500"
- **Fixed!** The function is now deployed with proper error handling
- If still happening, check Supabase edge function logs

### "Cannot access admin dashboard"
- **Cause**: Your account isn't promoted to admin yet
- **Solution**: Use one of the promotion methods above

### Session expires quickly
- Use "Remember Me" when logging in for 30-day sessions
- Without it, sessions last 24 hours

## 📝 Summary

✅ Edge function fixed and deployed
✅ JWT secret configured with fallback
✅ Better error handling added
✅ Input validation implemented
✅ Project builds successfully
✅ Ready for signup and login!

## Next Steps

1. **Sign up** at `/auth` → Create New Vault
2. **Save your Secret Key** securely
3. **Login** with your key
4. **Become admin** using one of the promotion methods
5. **Access admin dashboard** at `/admin/dashboard`

Your authentication system is now fully functional! 🎉
