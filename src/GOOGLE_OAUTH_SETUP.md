# 🔐 Google OAuth Setup Guide - UrTree Marketplace

Panduan lengkap untuk mengaktifkan **"Sign in with Google"** di UrTree Marketplace.

## 📋 Overview

UrTree sudah memiliki UI untuk Google Sign-In yang **berfungsi dalam DEMO MODE**!

### Current Status: 🟢 WORKING (Demo Mode)

**You can use Google Sign-In RIGHT NOW!** 

- Click "Sign in with Google" button
- It will create a demo Google user automatically
- Perfect for testing and development
- No configuration needed for demo!

### ✅ What's Already Implemented

- ✅ Google Sign-In button di Login page
- ✅ Google Sign-In button di Register page
- ✅ Frontend integration (database-provider)
- ✅ **Mock/Demo implementation (working now!)**
- ✅ Beautiful Google logo & styling
- ⚙️ Production OAuth setup (optional - see below)

## 🎮 Demo Mode (Current Implementation)

**Status: ✅ FULLY FUNCTIONAL**

Saat ini Google Sign-In menggunakan **mock implementation** yang:
- ✅ Membuat user dengan email `google.user@gmail.com`
- ✅ Auto-generate password untuk user
- ✅ Menyimpan user ke database
- ✅ User bisa langsung belanja
- ✅ Cocok untuk demo & development

**Cara pakai:**
1. Klik "Sign in with Google"
2. User otomatis dibuat dan logged in
3. Selesai! ✨

---

## 🚀 Production Setup (Optional)

Jika Anda ingin menggunakan **real Google OAuth** untuk production, ikuti langkah berikut:

## 🚀 Setup Steps

### Step 1: Configure Google Cloud Console

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create New Project** (or select existing)
   - Click "Select a project" → "New Project"
   - Name: `UrTree Marketplace`
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: `UrTree OAuth Client`
   
5. **Configure Authorized Redirect URIs**
   
   Add these URLs:
   ```
   # For Supabase
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   
   # For local development
   http://localhost:54321/auth/v1/callback
   ```

6. **Save Client ID and Client Secret**
   - Copy your `Client ID`
   - Copy your `Client Secret`
   - Keep these safe!

---

### Step 2: Configure Supabase

1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Select your project

2. **Navigate to Authentication Settings**
   - Click "Authentication" in sidebar
   - Click "Providers"
   - Find "Google" in the list

3. **Enable Google Provider**
   - Toggle "Enable" to ON
   - Enter your Google OAuth credentials:
     - **Client ID**: (from Google Console)
     - **Client Secret**: (from Google Console)
   - Click "Save"

4. **Configure Redirect URL** (optional)
   - Site URL: `https://yourdomain.com`
   - Redirect URLs: Add your production URL

---

### Step 3: Update Frontend Code

The frontend code is already prepared! But you need to update the implementation:

#### Update `/utils/api.ts`

```typescript
export const userAPI = {
  // ... existing methods ...
  
  loginWithGoogle: async () => {
    // Use Supabase client directly for OAuth
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) throw error;
    return data;
  },
};
```

#### Update `/utils/database-provider.tsx`

```typescript
const loginWithGoogle = async () => {
  setIsLoading(true);
  try {
    // Initiate Google OAuth flow
    await userAPI.loginWithGoogle();
    
    // After redirect back, get session
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // Check if user exists in our database
      let user = await kv.get(`user:${session.user.email}`);
      
      if (!user) {
        // Create new user from Google data
        user = {
          email: session.user.email,
          name: session.user.user_metadata.full_name || session.user.email.split('@')[0],
          role: 'buyer',
          isPendingSeller: false,
          hasSellerAccount: false,
          createdAt: new Date().toISOString(),
          googleId: session.user.id,
          avatar: session.user.user_metadata.avatar_url,
        };
        
        await kv.set(`user:${session.user.email}`, user);
      }
      
      setCurrentUser(user);
      
      if (user.role === 'buyer') {
        await loadCart();
      }
    }
  } catch (error) {
    console.error('Google login failed:', error);
    throw error;
  } finally {
    setIsLoading(false);
  }
};
```

---

### Step 4: Install Supabase Client (if needed)

```bash
npm install @supabase/supabase-js
```

---

### Step 5: Create Auth Callback Page

Create `/components/auth-callback.tsx`:

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabaseContext } from '../utils/database-provider';

export function AuthCallback() {
  const navigate = useNavigate();
  const { handleGoogleCallback } = useDatabaseContext();
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        await handleGoogleCallback();
        navigate('/');
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login');
      }
    };
    
    handleCallback();
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
```

---

## 🧪 Testing

### Demo Mode Testing (Current - Working Now!)

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to login page: `http://localhost:5173`

3. Click **"Sign in with Google"**

4. ✅ Demo user automatically created and logged in!

5. Email created: `google.user@gmail.com`

6. You can now browse and shop!

**Note**: Demo mode creates the same user each time. For multiple Google users, you'll need production OAuth setup.

### Production OAuth Testing (After Setup)

1. Deploy your app to production
2. Update Google OAuth redirect URLs
3. Click "Sign in with Google"
4. Redirected to real Google login
5. Select your Google account
6. Redirected back with real user data

---

## 🔧 Troubleshooting

### Issue: "Redirect URI mismatch"

**Solution**: Make sure the redirect URI in Google Console matches your Supabase callback URL exactly.

```
Supabase Callback URL format:
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

### Issue: "Provider not enabled"

**Solution**: 
1. Go to Supabase Dashboard
2. Authentication → Providers
3. Enable Google provider
4. Add Client ID and Secret

### Issue: "Invalid client"

**Solution**: Double-check your Client ID and Client Secret in Supabase settings.

### Issue: User data not saving

**Solution**: Check the server endpoint is creating users properly in KV store.

---

## 🔐 Security Best Practices

### Production Checklist

- [ ] Use HTTPS for all URLs
- [ ] Restrict OAuth redirect URIs to your domain only
- [ ] Store Client Secret securely (environment variables)
- [ ] Implement rate limiting on auth endpoints
- [ ] Log authentication attempts
- [ ] Add email verification flow
- [ ] Implement session management

### Environment Variables

```env
# .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_CLIENT_ID=your-client-id

# .env.local (never commit this!)
GOOGLE_CLIENT_SECRET=your-client-secret
```

---

## 📚 Additional Resources

### Official Documentation
- [Supabase Auth - Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/auth-signinwithoauth)

### Video Tutorials
- [Setting up Google OAuth with Supabase](https://www.youtube.com/results?search_query=supabase+google+oauth)

---

## ⚡ Quick Implementation (Current Status)

**Current Status**: 🟡 **UI Ready, Backend Configuration Needed**

The UI is fully implemented and ready to use! You just need to:

1. ✅ Setup Google Cloud Console (5 minutes)
2. ��� Configure Supabase Auth (2 minutes)
3. ✅ Update frontend code (10 minutes)
4. ✅ Test the flow (5 minutes)

**Total Setup Time**: ~25 minutes

---

## 💡 Alternative: Mock Implementation (For Demo)

If you want to demo the feature without full setup:

```typescript
// Quick mock for demo purposes
const loginWithGoogle = async () => {
  // Simulate Google login
  const mockGoogleUser = {
    email: 'demo@gmail.com',
    name: 'Demo User',
    role: 'buyer',
    isPendingSeller: false,
    hasSellerAccount: false,
    createdAt: new Date().toISOString(),
  };
  
  setCurrentUser(mockGoogleUser);
  toast.success('Demo: Google Login Successful!');
  onSuccess();
};
```

---

## 🎯 Benefits of Google Sign-In

- ✅ **Better UX**: One-click login
- ✅ **Higher Conversion**: Reduces friction
- ✅ **More Secure**: OAuth 2.0 protocol
- ✅ **Verified Emails**: Google-verified accounts
- ✅ **Mobile Friendly**: Works great on mobile
- ✅ **User Trust**: Familiar Google branding

---

## 📞 Need Help?

Having issues with setup?

- 📖 Check [Supabase Discord](https://discord.supabase.com)
- 💬 Open an issue on GitHub
- 📧 Email: support@urtree.com

---

**Status**: Google Sign-In UI is ready! Follow this guide to activate the full functionality. 🚀

**Last Updated**: January 2025
