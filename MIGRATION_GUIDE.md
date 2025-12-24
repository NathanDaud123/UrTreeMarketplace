# Panduan Migrasi Supabase

Panduan lengkap untuk migrasi data dan struktur database dari Supabase project lama ke project baru.

## 📋 Persiapan

### 1. Informasi yang Dibutuhkan

**Dari Supabase Project LAMA:**
- Project URL: `https://xxxxx.supabase.co`
- Service Role Key (untuk export data)
- Database password (jika menggunakan direct connection)

**Dari Supabase Project BARU:**
- Project URL: `https://yyyyy.supabase.co`
- Anon Key (public)
- Service Role Key (untuk import data)

## 🔄 Langkah-langkah Migrasi

### Step 1: Export Schema (Struktur Tabel)

Schema sudah tersedia di file `database_schema.sql`. File ini berisi:
- Semua definisi tabel
- Index
- Triggers
- Constraints
- Foreign keys

**Cara Import Schema ke Project Baru:**

1. Buka Supabase Dashboard project baru
2. Pergi ke **SQL Editor**
3. Copy seluruh isi file `database_schema.sql`
4. Paste dan jalankan di SQL Editor
5. Pastikan semua tabel berhasil dibuat (cek di **Table Editor**)

### Step 2: Export Data dari Project Lama

Gunakan script SQL berikut untuk export data. Jalankan di **SQL Editor** project lama:

```sql
-- Export Users
SELECT * FROM users;

-- Export User Addresses
SELECT * FROM user_addresses;

-- Export Seller Profiles
SELECT * FROM seller_profiles;

-- Export Products
SELECT * FROM products;

-- Export Product Images
SELECT * FROM product_images;

-- Export Product Categories
SELECT * FROM product_categories;

-- Export Orders
SELECT * FROM orders;

-- Export Order Items
SELECT * FROM order_items;

-- Export Cart Items
SELECT * FROM cart_items;

-- Export Chat Conversations
SELECT * FROM chat_conversations;

-- Export Chat Messages
SELECT * FROM chat_messages;

-- Export Product Reviews
SELECT * FROM product_reviews;
```

**Cara Export:**
1. Jalankan setiap query di SQL Editor
2. Klik tombol **Download** (ikon download di hasil query)
3. Simpan sebagai CSV atau JSON
4. Atau copy hasil query dan simpan di file

### Step 3: Import Data ke Project Baru

**Opsi A: Menggunakan Supabase Dashboard (Recommended)**

1. Buka **Table Editor** di project baru
2. Untuk setiap tabel:
   - Klik tabel yang ingin diisi
   - Klik **Insert** → **Import data from CSV**
   - Upload file CSV yang sudah di-export
   - Pastikan kolom sesuai

**Opsi B: Menggunakan SQL INSERT**

Buat file SQL dengan format:
```sql
-- Import Users
INSERT INTO users (id, email, password_hash, name, phone, role, ...)
VALUES 
  ('uuid-1', 'email1@example.com', 'hash1', 'Name 1', '081234567890', 'buyer', ...),
  ('uuid-2', 'email2@example.com', 'hash2', 'Name 2', '081234567891', 'seller', ...);
-- ... dan seterusnya
```

**Catatan Penting:**
- Pastikan UUID tetap sama untuk menjaga referensi foreign key
- Atau gunakan `ON CONFLICT DO NOTHING` jika ada duplicate
- Import tabel yang tidak punya foreign key dulu (users, product_categories)
- Baru import tabel yang punya foreign key (products, orders, dll)

### Step 4: Deploy Edge Functions ke Project Baru

1. Install Supabase CLI (jika belum):
   ```bash
   npm install -g supabase
   ```

2. Login ke Supabase:
   ```bash
   supabase login
   ```

3. Link ke project baru:
   ```bash
   supabase link --project-ref yyyyy
   ```
   (ganti `yyyyy` dengan project ID baru)

4. Deploy edge function:
   ```bash
   supabase functions deploy make-server-0eb859c3
   ```

5. Set environment variables di Supabase Dashboard:
   - Pergi ke **Edge Functions** → **make-server-0eb859c3** → **Settings**
   - Tambahkan secrets:
     - `SUPABASE_URL`: URL project baru
     - `SUPABASE_SERVICE_ROLE_KEY`: Service Role Key project baru

### Step 5: Update Konfigurasi Aplikasi

**A. Update Environment Variables (untuk development):**

Buat file `.env.local` di root project:
```env
VITE_SUPABASE_URL=https://yyyyy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**B. Update GitHub Secrets (untuk production):**

1. Buka GitHub Repository → **Settings** → **Secrets and variables** → **Actions**
2. Update secrets:
   - `VITE_SUPABASE_URL`: URL project baru
   - `VITE_SUPABASE_ANON_KEY`: Anon Key project baru

**C. Update Supabase Edge Function Secrets:**

1. Buka Supabase Dashboard project baru
2. Pergi ke **Edge Functions** → **make-server-0eb859c3** → **Settings**
3. Update secrets:
   - `SUPABASE_URL`: URL project baru
   - `SUPABASE_SERVICE_ROLE_KEY`: Service Role Key project baru

## ✅ Verifikasi Migrasi

Setelah migrasi, verifikasi:

1. **Cek Tabel:**
   - Pastikan semua tabel ada dan strukturnya sama
   - Cek jumlah row di setiap tabel

2. **Cek Data:**
   - Login dengan user yang sudah ada
   - Cek produk, order, chat, dll

3. **Cek Edge Functions:**
   - Test API endpoints
   - Pastikan semua fungsi berjalan

4. **Cek Aplikasi:**
   - Test login/register
   - Test CRUD operations
   - Test payment flow

## 🔧 Troubleshooting

### Error: Foreign Key Constraint
- Pastikan import data sesuai urutan (tabel parent dulu, baru child)
- Atau disable foreign key check sementara:
  ```sql
  SET session_replication_role = 'replica';
  -- Import data
  SET session_replication_role = 'origin';
  ```

### Error: UUID Mismatch
- Pastikan UUID tetap sama saat import
- Atau update foreign key references setelah import

### Error: Edge Function Not Found
- Pastikan function sudah di-deploy
- Cek environment variables di Supabase Dashboard

## 📝 Checklist Migrasi

- [ ] Export schema dari project lama (sudah ada di `database_schema.sql`)
- [ ] Import schema ke project baru
- [ ] Export data dari project lama
- [ ] Import data ke project baru
- [ ] Deploy edge functions ke project baru
- [ ] Update environment variables di aplikasi
- [ ] Update GitHub secrets
- [ ] Update Supabase edge function secrets
- [ ] Verifikasi semua fitur berjalan
- [ ] Test aplikasi end-to-end

## 🚀 Setelah Migrasi

1. Update dokumentasi dengan URL project baru
2. Update konfigurasi di semua environment (dev, staging, production)
3. Test aplikasi secara menyeluruh
4. Monitor error logs di Supabase Dashboard

