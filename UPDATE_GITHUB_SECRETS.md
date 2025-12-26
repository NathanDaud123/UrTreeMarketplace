# Update GitHub Secrets untuk Database Baru

Panduan untuk mengupdate GitHub Secrets agar website yang di-deploy menggunakan database Supabase yang baru.

## 📋 Informasi Database Baru

- **Project ID**: `drrczqfikcyyqwqsncpk`
- **Supabase URL**: `https://drrczqfikcyyqwqsncpk.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRycmN6cWZpa2N5eXF3cXNuY3BrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MzI2ODQsImV4cCI6MjA4MjIwODY4NH0.KtiRJKaOcFooSscE3huy5NOXo_hFnUkZZqJMVxMLR0s`

## 🔧 Langkah-langkah Update GitHub Secrets

### 1. Buka GitHub Repository Settings

1. Buka repository GitHub Anda: `https://github.com/nathandaud123/UrTreeMarketplace`
2. Klik tab **Settings** (di bagian atas repository)
3. Di sidebar kiri, scroll ke bawah dan klik **Secrets and variables** → **Actions**

### 2. Update Secret `VITE_SUPABASE_URL`

1. Cari secret dengan nama `VITE_SUPABASE_URL`
2. Klik **Update** (atau jika belum ada, klik **New repository secret**)
3. Masukkan nilai berikut:
   ```
   https://drrczqfikcyyqwqsncpk.supabase.co
   ```
4. Klik **Update secret**

### 3. Update Secret `VITE_SUPABASE_ANON_KEY`

1. Cari secret dengan nama `VITE_SUPABASE_ANON_KEY`
2. Klik **Update** (atau jika belum ada, klik **New repository secret**)
3. Masukkan nilai berikut:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRycmN6cWZpa2N5eXF3cXNuY3BrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MzI2ODQsImV4cCI6MjA4MjIwODY4NH0.KtiRJKaOcFooSscE3huy5NOXo_hFnUkZZqJMVxMLR0s
   ```
4. Klik **Update secret**

### 4. Trigger Rebuild (Opsional)

Setelah update secrets, Anda bisa trigger rebuild dengan salah satu cara:

**Cara 1: Push commit baru**
```bash
git commit --allow-empty -m "Update: Trigger rebuild with new database config"
git push origin main
```

**Cara 2: Manual trigger via GitHub Actions**
1. Buka tab **Actions** di repository GitHub
2. Pilih workflow **Build and Deploy**
3. Klik **Run workflow** → **Run workflow** (untuk branch `main`)

## ✅ Verifikasi

Setelah deployment selesai:

1. Buka website: https://nathandaud123.github.io/UrTreeMarketplace/
2. Buka **Developer Tools** (F12) → **Console**
3. Cek apakah ada error terkait Supabase
4. Coba login atau akses fitur yang menggunakan database
5. Pastikan data yang muncul adalah dari database baru

## 🚨 Troubleshooting

### Website masih menggunakan database lama
- **Solusi**: Pastikan secrets sudah di-update dengan benar, lalu trigger rebuild dengan push commit baru

### Error: "Invalid API key"
- **Solusi**: Pastikan `VITE_SUPABASE_ANON_KEY` sudah di-copy dengan lengkap (termasuk semua karakter)

### Error: "Failed to fetch"
- **Solusi**: Pastikan `VITE_SUPABASE_URL` sudah benar dan tidak ada spasi di awal/akhir

### Deployment tidak ter-trigger
- **Solusi**: Pastikan Anda push ke branch `main` atau `master`, atau trigger manual via GitHub Actions

## 📝 Catatan

- GitHub Secrets hanya bisa dilihat oleh pemilik repository atau user dengan akses admin
- Setelah update secrets, deployment otomatis akan ter-trigger jika ada push ke branch `main`
- Jika tidak ada perubahan code, gunakan empty commit untuk trigger rebuild

