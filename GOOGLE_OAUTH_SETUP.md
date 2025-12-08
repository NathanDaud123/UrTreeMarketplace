# 🔐 Setup Google Sign-In dengan Supabase (GRATIS!)

Panduan lengkap untuk mengaktifkan Google Sign-In di UrTree Marketplace menggunakan Supabase Auth.

## ✅ Gratis!

Google OAuth **100% GRATIS** untuk penggunaan standar. Tidak ada biaya apapun!

---

## 🎯 Step 1: Setup Google Cloud Console

### 1.1. Buat Project di Google Cloud

1. **Buka Google Cloud Console**
   - https://console.cloud.google.com/
   - Login dengan Google account

2. **Buat Project Baru**
   - Klik dropdown project (di atas) → **"New Project"**
   - **Name**: `UrTree Marketplace` (atau nama lain)
   - Klik **"Create"**
   - Tunggu beberapa detik

3. **Pilih Project**
   - Pastikan project yang baru dibuat sudah terpilih

---

### 1.2. Enable Google+ API

1. **Buka API Library**
   - Di sidebar, klik **"APIs & Services"** → **"Library"**
   - Atau langsung: https://console.cloud.google.com/apis/library

2. **Cari "Google+ API"**
   - Ketik "Google+ API" di search box
   - Klik **"Google+ API"**

3. **Enable API**
   - Klik tombol **"Enable"**
   - Tunggu beberapa detik

---

### 1.3. Create OAuth 2.0 Credentials

1. **Buka Credentials**
   - Klik **"APIs & Services"** → **"Credentials"**
   - Atau langsung: https://console.cloud.google.com/apis/credentials

2. **Create OAuth Client ID**
   - Klik **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
   - Jika diminta setup OAuth consent screen dulu, ikuti langkah berikut:

#### Setup OAuth Consent Screen (jika diminta):

1. **User Type**: Pilih **"External"** → **"Create"**
2. **App Information**:
   - **App name**: `UrTree Marketplace`
   - **User support email**: Pilih email Anda
   - **Developer contact**: Email Anda
   - Klik **"Save and Continue"**
3. **Scopes**: Skip (klik **"Save and Continue"**)
4. **Test users**: Skip (klik **"Save and Continue"**)
5. **Summary**: Klik **"Back to Dashboard"**

3. **Kembali ke Create OAuth Client ID**
   - **Application type**: Pilih **"Web application"**
   - **Name**: `UrTree Marketplace Web Client`

4. **Authorized JavaScript origins**
   - Klik **"+ ADD URI"**
   - Tambahkan:
     ```
     http://localhost:3002
     https://nathandaud123.github.io
     https://rbyeyyqkghxdixgpktuo.supabase.co
     ```

5. **Authorized redirect URIs**
   - Klik **"+ ADD URI"**
   - Tambahkan:
     ```
     http://localhost:3002/auth/callback
     https://nathandaud123.github.io/UrTreeMarketplace/auth/callback
     https://rbyeyyqkghxdixgpktuo.supabase.co/auth/v1/callback
     ```

6. **Create**
   - Klik **"Create"**
   - **Copy Client ID dan Client Secret** (akan muncul di popup)
   - ⚠️ **SIMPAN DENGAN AMAN!**

---

## 🎯 Step 2: Setup di Supabase

### 2.1. Enable Google Provider

1. **Buka Supabase Dashboard**
   - https://app.supabase.com
   - Pilih project Anda

2. **Buka Authentication Settings**
   - Klik **"Authentication"** di sidebar
   - Klik **"Providers"**

3. **Enable Google**
   - Scroll ke **"Google"**
   - Toggle **"Enable Google provider"** ke **ON**

4. **Isi Credentials**
   - **Client ID (for OAuth)**: Paste Client ID dari Google Cloud
   - **Client Secret (for OAuth)**: Paste Client Secret dari Google Cloud
   - Klik **"Save"**

---

### 2.2. Configure Redirect URLs

1. **Buka URL Configuration**
   - Di Authentication → **"URL Configuration"**

2. **Site URL**
   - **Production**: `https://nathandaud123.github.io/UrTreeMarketplace`
   - **Development**: `http://localhost:3002`

3. **Redirect URLs**
   - Tambahkan:
     ```
     https://nathandaud123.github.io/UrTreeMarketplace/**
     http://localhost:3002/**
     ```

---

## 🎯 Step 3: Update Frontend Code

Kode sudah siap! Hanya perlu update untuk menggunakan Supabase Auth langsung.

### Update `src/utils/api.ts`

```typescript
// Import Supabase client
import { createClient } from '@jsr/supabase__supabase-js@2.49.8';
import { supabaseUrl, publicAnonKey } from './supabase/info';

// Create Supabase client
const supabase = createClient(supabaseUrl, publicAnonKey);

export const userAPI = {
  // ... existing methods ...

  loginWithGoogle: async () => {
    try {
      // Redirect to Supabase Google OAuth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${window.location.pathname}auth/callback`
        }
      });
      
      if (error) throw error;
      
      // This will redirect, so we won't reach here
      return data;
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw error;
    }
  },
};
```

### Update `src/utils/database-provider.tsx`

Tambahkan handler untuk OAuth callback:

```typescript
// Check for OAuth callback on mount
useEffect(() => {
  const handleAuthCallback = async () => {
    // Check if we're in OAuth callback
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const error = hashParams.get('error');
    
    if (error) {
      console.error('OAuth error:', error);
      toast.error('Login dengan Google gagal');
      return;
    }
    
    if (accessToken) {
      // Get user from Supabase
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast.error('Gagal mendapatkan data user');
        return;
      }
      
      // Create or get user in our database
      try {
        // Check if user exists
        let dbUser = await kv.get(`user:${user.email}`);
        
        if (!dbUser) {
          // Create new user
          dbUser = {
            email: user.email,
            name: user.user_metadata?.full_name || user.email?.split('@')[0],
            role: 'buyer',
            isPendingSeller: false,
            hasSellerAccount: false,
            createdAt: new Date().toISOString(),
            googleId: user.id,
            avatar: user.user_metadata?.avatar_url,
            loginMethod: 'google'
          };
          
          await kv.set(`user:${user.email}`, dbUser);
        }
        
        setCurrentUser(dbUser);
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        toast.success('Login dengan Google berhasil!');
      } catch (error) {
        console.error('Error creating user:', error);
        toast.error('Gagal membuat user');
      }
    }
  };
  
  handleAuthCallback();
}, []);
```

---

## 🧪 Step 4: Test

1. **Jalankan Development Server**
   ```bash
   npm run dev
   ```

2. **Test Google Sign-In**
   - Buka aplikasi
   - Klik **"Sign in with Google"**
   - Akan redirect ke Google login
   - Login dengan Google account
   - Akan redirect kembali ke aplikasi
   - User sudah login!

---

## ✅ Checklist

- [ ] Google Cloud project dibuat
- [ ] Google+ API enabled
- [ ] OAuth 2.0 credentials dibuat
- [ ] Authorized redirect URIs dikonfigurasi
- [ ] Google provider enabled di Supabase
- [ ] Client ID & Secret diisi di Supabase
- [ ] Redirect URLs dikonfigurasi di Supabase
- [ ] Frontend code di-update
- [ ] Test login berhasil

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
- **Penyebab**: Redirect URI tidak match
- **Solusi**: 
  - Pastikan redirect URI di Google Cloud Console sama dengan di Supabase
  - Format harus exact match (termasuk trailing slash)

### Error: "invalid_client"
- **Penyebab**: Client ID atau Secret salah
- **Solusi**: 
  - Copy ulang dari Google Cloud Console
  - Pastikan tidak ada spasi di awal/akhir

### Error: "access_denied"
- **Penyebab**: User membatalkan login
- **Solusi**: Normal, user bisa coba lagi

---

## 📚 Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Google Provider](https://supabase.com/docs/guides/auth/social-login/auth-google)

---

**Selamat! 🎉 Google Sign-In sudah aktif dan GRATIS!**

