# 🔧 Fix: Google OAuth Error "missing OAuth secret"

Error `Unsupported provider: missing OAuth secret` berarti Google OAuth belum dikonfigurasi dengan benar di Supabase.

## 🔍 Penyebab Error

Error ini muncul karena:
- ❌ Google provider belum di-enable di Supabase
- ❌ Client ID atau Client Secret belum diisi
- ❌ Client ID/Secret salah atau tidak valid

---

## ✅ Solusi: Setup Google OAuth di Supabase

### Step 1: Pastikan Google Cloud Console Sudah Setup

1. **Buka Google Cloud Console**
   - https://console.cloud.google.com/
   - Pastikan OAuth 2.0 credentials sudah dibuat
   - Copy **Client ID** dan **Client Secret**

### Step 2: Enable Google Provider di Supabase

1. **Buka Supabase Dashboard**
   - https://app.supabase.com
   - Pilih project Anda: `rbyeyyqkghxdixgpktuo`

2. **Buka Authentication Settings**
   - Klik **"Authentication"** di sidebar kiri
   - Klik **"Providers"**

3. **Enable Google Provider**
   - Scroll ke **"Google"**
   - Toggle **"Enable Google provider"** ke **ON** (hijau)

4. **Isi Credentials**
   - **Client ID (for OAuth)**: 
     - Paste Client ID dari Google Cloud Console
     - Format: `xxxxx.apps.googleusercontent.com`
   
   - **Client Secret (for OAuth)**: 
     - Paste Client Secret dari Google Cloud Console
     - Format: `GOCSPX-xxxxx`

5. **Klik "Save"**
   - Tunggu beberapa detik hingga tersimpan

### Step 3: Verifikasi Configuration

1. **Cek Status**
   - Pastikan toggle **"Enable Google provider"** masih **ON**
   - Pastikan Client ID dan Secret sudah terisi (tidak kosong)

2. **Test di Aplikasi**
   - Refresh aplikasi
   - Klik "Sign in with Google"
   - Seharusnya redirect ke Google login page

---

## 🐛 Troubleshooting

### Error masih muncul setelah setup?

1. **Refresh Supabase Dashboard**
   - Pastikan settings sudah tersimpan

2. **Cek Client ID & Secret**
   - Pastikan tidak ada spasi di awal/akhir
   - Pastikan format benar:
     - Client ID: `xxxxx.apps.googleusercontent.com`
     - Client Secret: `GOCSPX-xxxxx`

3. **Cek Redirect URLs di Google Cloud**
   - Pastikan redirect URL sudah ditambahkan:
     ```
     https://rbyeyyqkghxdixgpktuo.supabase.co/auth/v1/callback
     ```

4. **Clear Browser Cache**
   - Clear cache browser
   - Atau buka di incognito mode

### Masih error?

1. **Cek Supabase Logs**
   - Supabase Dashboard → Logs → Auth Logs
   - Lihat error detail

2. **Cek Google Cloud Console**
   - Pastikan OAuth consent screen sudah dikonfigurasi
   - Pastikan credentials masih aktif

---

## 📝 Checklist

- [ ] Google Cloud project dibuat
- [ ] OAuth 2.0 credentials dibuat
- [ ] Client ID & Secret di-copy
- [ ] Google provider di-enable di Supabase
- [ ] Client ID diisi di Supabase
- [ ] Client Secret diisi di Supabase
- [ ] Settings di-save
- [ ] Redirect URLs dikonfigurasi di Google Cloud
- [ ] Test login berhasil

---

## 🎯 Quick Fix

Jika sudah setup tapi masih error:

1. **Disable lalu Enable lagi Google provider**
   - Toggle OFF → Save
   - Toggle ON → Isi credentials → Save

2. **Copy ulang Client ID & Secret**
   - Pastikan tidak ada typo
   - Paste ulang di Supabase

3. **Test lagi**

---

**Setelah setup, error akan hilang dan Google Sign-In akan berfungsi! 🎉**

