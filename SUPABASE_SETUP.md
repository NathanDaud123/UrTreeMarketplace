# 🗄️ Panduan Setup Supabase untuk UrTree Marketplace

Panduan lengkap untuk menghubungkan aplikasi UrTree Marketplace ke database Supabase Anda sendiri.

## 📋 Daftar Isi

1. [Membuat Project Supabase](#1-membuat-project-supabase)
2. [Membuat Database Table](#2-membuat-database-table)
3. [Mendapatkan API Keys](#3-mendapatkan-api-keys)
4. [Konfigurasi Environment Variables](#4-konfigurasi-environment-variables)
5. [Deploy Supabase Edge Functions](#5-deploy-supabase-edge-functions)
6. [Testing Koneksi](#6-testing-koneksi)

---

## 1. Membuat Project Supabase

### Langkah-langkah:

1. **Kunjungi Supabase**
   - Buka: https://supabase.com
   - Klik **"Start your project"** atau **"Sign in"** jika sudah punya akun

2. **Buat Project Baru**
   - Klik **"New Project"**
   - Isi informasi:
     - **Name**: `UrTree Marketplace` (atau nama lain)
     - **Database Password**: Buat password yang kuat (simpan dengan aman!)
     - **Region**: Pilih region terdekat (misalnya: `Southeast Asia (Singapore)`)
   - Klik **"Create new project"**
   - Tunggu hingga project selesai dibuat (sekitar 2-3 menit)

---

## 2. Membuat Database Tables

UrTree menggunakan **Relational Database** dengan 17 tabel lengkap untuk marketplace yang kompleks.

### Opsi 1: Relational Database (Recommended) ⭐

**Schema lengkap dengan 17 tables** untuk production-ready marketplace.

1. **Buka SQL Editor**
   - Di Supabase Dashboard, klik **"SQL Editor"** di sidebar kiri
   - Klik **"New query"**

2. **Jalankan SQL Schema**
   - Buka file `database_schema.sql` di project Anda
   - Copy seluruh isi file
   - Paste ke SQL Editor
   - Klik **"Run"** untuk menjalankan

3. **Verifikasi Tables**
   - Klik **"Table Editor"** di sidebar
   - Pastikan semua 17 tables muncul:
     - ✅ users
     - ✅ user_addresses
     - ✅ seller_profiles
     - ✅ product_categories
     - ✅ products
     - ✅ product_images
     - ✅ cart_items
     - ✅ orders
     - ✅ order_items
     - ✅ payment_transactions
     - ✅ chat_conversations
     - ✅ chat_messages
     - ✅ product_reviews
     - ✅ notifications
     - ✅ coupons
     - ✅ wishlists

**📚 Detail schema:** Lihat [DATABASE_SCHEMA_GUIDE.md](./DATABASE_SCHEMA_GUIDE.md)

### Opsi 2: KV Store (Simple - untuk development/testing)

Jika ingin menggunakan KV Store yang lebih sederhana:

```sql
-- Buat table untuk KV Store
CREATE TABLE IF NOT EXISTS kv_store_0eb859c3 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

-- Buat index untuk performa query
CREATE INDEX IF NOT EXISTS idx_kv_store_key_prefix ON kv_store_0eb859c3 (key text_pattern_ops);

-- Berikan akses untuk service role (untuk edge functions)
ALTER TABLE kv_store_0eb859c3 ENABLE ROW LEVEL SECURITY;

-- Policy untuk service role (full access)
CREATE POLICY "Service role can do everything" ON kv_store_0eb859c3
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

**⚠️ Note:** KV Store lebih sederhana tapi kurang optimal untuk production. Disarankan menggunakan Relational Database.

---

## 3. Mendapatkan API Keys

### Langkah-langkah:

1. **Buka Project Settings**
   - Di Supabase Dashboard, klik **"Settings"** (ikon gear) di sidebar
   - Klik **"API"** di menu settings

2. **Copy API Keys yang Diperlukan:**

   Anda akan melihat beberapa keys:

   - **Project URL**
     ```
     Format: https://xxxxx.supabase.co
     ```
     - Copy URL ini → ini adalah `VITE_SUPABASE_URL`

   - **anon public** key
     ```
     Format: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```
     - Copy key ini → ini adalah `VITE_SUPABASE_ANON_KEY`

   - **service_role** key (⚠️ **RAHASIA!**)
     ```
     Format: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```
     - Copy key ini → ini adalah `SUPABASE_SERVICE_ROLE_KEY`
     - **PENTING**: Jangan pernah expose key ini di frontend!

3. **Catat Project Reference ID**
   - Di halaman API settings, Anda akan melihat **"Reference ID"**
   - Format: `xxxxx` (tanpa `.supabase.co`)
   - Ini adalah Project ID Anda

---

## 4. Konfigurasi Environment Variables

### Untuk Development Lokal:

1. **Buat file `.env` di root project**
   ```bash
   # Di terminal, jalankan:
   cp .env.example .env
   ```

2. **Edit file `.env`** dan isi dengan values dari Supabase:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Midtrans Payment Gateway
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
```

3. **Restart Development Server**
   ```bash
   # Stop server (Ctrl+C) lalu jalankan lagi:
   npm run dev
   ```

### Untuk Production (GitHub Pages):

1. **Buka GitHub Repository Settings**
   - Buka repository Anda di GitHub
   - Klik **"Settings"** → **"Secrets and variables"** → **"Actions"**

2. **Tambahkan Secrets:**
   - Klik **"New repository secret"**
   - Tambahkan secrets berikut:
     - **Name**: `VITE_SUPABASE_URL`
       **Value**: `https://xxxxx.supabase.co`
     
     - **Name**: `VITE_SUPABASE_ANON_KEY`
       **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
     
     - **Name**: `SUPABASE_SERVICE_ROLE_KEY` (opsional, jika deploy edge functions)
       **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 5. Deploy Supabase Edge Functions

Edge Functions adalah serverless functions yang berjalan di Supabase. UrTree menggunakan function `make-server-0eb859c3` untuk API backend.

### Langkah-langkah:

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login ke Supabase**
   ```bash
   supabase login
   ```
   - Akan membuka browser untuk autentikasi

3. **Link ke Project**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   - Ganti `YOUR_PROJECT_REF` dengan Project Reference ID Anda
   - Contoh: `supabase link --project-ref xxxxx`

4. **Set Environment Variables untuk Functions**
   ```bash
   supabase secrets set SUPABASE_URL=https://xxxxx.supabase.co
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   supabase secrets set MIDTRANS_SERVER_KEY=your_midtrans_key  # Optional
   ```

5. **Deploy Function**
   ```bash
   supabase functions deploy make-server-0eb859c3
   ```

6. **Verifikasi Deployment**
   - Buka: `https://xxxxx.supabase.co/functions/v1/make-server-0eb859c3/health`
   - Harus return: `{"status":"ok"}`

---

## 6. Testing Koneksi

### Test dari Browser:

1. **Test API Health Check**
   ```
   https://YOUR_PROJECT.supabase.co/functions/v1/make-server-0eb859c3/health
   ```
   - Harus return: `{"status":"ok"}`

2. **Test dari Aplikasi**
   - Jalankan `npm run dev`
   - Buka aplikasi di browser
   - Coba login atau register
   - Jika berhasil, data akan tersimpan di Supabase!

### Test dari Supabase Dashboard:

1. **Buka Table Editor**
   - Di Supabase Dashboard → **"Table Editor"**
   - Pilih table `kv_store_0eb859c3`

2. **Cek Data**
   - Setelah register/login, refresh table
   - Anda akan melihat data user tersimpan dengan key `user:email@example.com`

---

## 🔒 Security Best Practices

1. **Jangan Commit `.env` File**
   - File `.env` sudah ada di `.gitignore`
   - Jangan pernah commit file ini ke GitHub!

2. **Service Role Key**
   - Hanya gunakan di server/backend
   - Jangan pernah expose di frontend code
   - Hanya set sebagai secret di GitHub Actions

3. **Row Level Security (RLS)**
   - Table sudah dikonfigurasi dengan RLS
   - Service role memiliki full access (untuk edge functions)
   - Anon key hanya bisa read (jika diperlukan)

---

## 🐛 Troubleshooting

### Error: "Failed to fetch"
- **Penyebab**: API URL salah atau function belum di-deploy
- **Solusi**: 
  - Pastikan `VITE_SUPABASE_URL` benar
  - Pastikan edge function sudah di-deploy
  - Cek CORS settings di Supabase

### Error: "Invalid API key"
- **Penyebab**: API key salah atau expired
- **Solusi**: 
  - Copy ulang API key dari Supabase Dashboard
  - Pastikan menggunakan key yang benar (anon untuk frontend, service_role untuk backend)

### Error: "Table does not exist"
- **Penyebab**: Table belum dibuat
- **Solusi**: 
  - Jalankan SQL query di section 2 untuk membuat table

### Data tidak muncul di table
- **Penyebab**: RLS policy terlalu ketat atau function error
- **Solusi**: 
  - Cek logs di Supabase Dashboard → Edge Functions → Logs
  - Pastikan RLS policy sudah benar

---

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✅ Checklist Setup

- [ ] Project Supabase dibuat
- [ ] Table `kv_store_0eb859c3` dibuat
- [ ] API keys di-copy dan disimpan dengan aman
- [ ] File `.env` dibuat dan diisi dengan benar
- [ ] Development server berjalan tanpa error
- [ ] Edge function di-deploy
- [ ] Health check endpoint berfungsi
- [ ] Test register/login berhasil
- [ ] Data muncul di Supabase table

---

**Selamat! 🎉 Database Supabase Anda sudah terhubung!**

