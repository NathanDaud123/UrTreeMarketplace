# 🚀 Panduan Deployment UrTree Marketplace

Panduan lengkap untuk deploy aplikasi UrTree Marketplace ke GitHub Pages dengan auto build & deploy.

## 📋 Daftar Isi

1. [Persiapan](#1-persiapan)
2. [Setup GitHub Repository](#2-setup-github-repository)
3. [Konfigurasi GitHub Secrets](#3-konfigurasi-github-secrets)
4. [Enable GitHub Pages](#4-enable-github-pages)
5. [Deploy Manual](#5-deploy-manual)
6. [Auto Deploy dengan GitHub Actions](#6-auto-deploy-dengan-github-actions)
7. [Verifikasi Deployment](#7-verifikasi-deployment)

---

## 1. Persiapan

### Pastikan Anda sudah:

- ✅ Project sudah di-push ke GitHub
- ✅ Supabase project sudah dibuat (lihat [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
- ✅ Environment variables sudah dikonfigurasi
- ✅ Supabase Edge Functions sudah di-deploy

---

## 2. Setup GitHub Repository

### 2.1. Push Code ke GitHub

```bash
# Jika belum ada remote
git remote add origin https://github.com/USERNAME/REPO_NAME.git

# Push code
git add .
git commit -m "Setup deployment"
git push -u origin main
```

### 2.2. Pastikan Branch Utama

- Default branch biasanya `main` atau `master`
- Workflow akan auto-deploy saat push ke branch utama

---

## 3. Konfigurasi GitHub Secrets

GitHub Secrets digunakan untuk menyimpan environment variables secara aman.

### Langkah-langkah:

1. **Buka Repository Settings**
   - Buka repository di GitHub
   - Klik **"Settings"** tab
   - Di sidebar kiri, klik **"Secrets and variables"** → **"Actions"**

2. **Tambahkan Secrets**

   Klik **"New repository secret"** dan tambahkan:

   #### a. `VITE_SUPABASE_URL`
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: `https://xxxxx.supabase.co`
   - Klik **"Add secret"**

   #### b. `VITE_SUPABASE_ANON_KEY`
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: Anon key dari Supabase (lihat [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
   - Klik **"Add secret"**

   #### c. (Optional) `SUPABASE_SERVICE_ROLE_KEY`
   - **Name**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: Service role key (hanya jika deploy edge functions via GitHub Actions)
   - Klik **"Add secret"**

3. **Verifikasi Secrets**
   - Pastikan semua secrets sudah ditambahkan
   - Secrets tidak akan terlihat lagi setelah dibuat (untuk keamanan)

---

## 4. Enable GitHub Pages

### Langkah-langkah:

1. **Buka Pages Settings**
   - Di repository Settings, klik **"Pages"** di sidebar kiri

2. **Konfigurasi Source**
   - **Source**: Pilih **"GitHub Actions"**
   - Jangan pilih branch sebagai source (kita pakai Actions)

3. **Save Settings**
   - Settings akan tersimpan otomatis

---

## 5. Deploy Manual

Jika ingin deploy manual tanpa menunggu push:

### Via GitHub Actions:

1. **Buka Actions Tab**
   - Di repository, klik tab **"Actions"**

2. **Pilih Workflow**
   - Klik workflow **"Build and Deploy"**

3. **Run Workflow**
   - Klik **"Run workflow"** button
   - Pilih branch (biasanya `main`)
   - Klik **"Run workflow"**

4. **Monitor Progress**
   - Klik run yang baru dibuat
   - Monitor progress di real-time
   - Tunggu hingga selesai (sekitar 2-5 menit)

---

## 6. Auto Deploy dengan GitHub Actions

### Workflow sudah dikonfigurasi!

File `.github/workflows/deploy.yml` sudah dibuat dan akan:

- ✅ Auto build saat push ke `main` atau `master`
- ✅ Deploy ke GitHub Pages otomatis
- ✅ Menggunakan environment variables dari Secrets

### Cara Kerja:

1. **Push ke GitHub**
   ```bash
   git add .
   git commit -m "Update features"
   git push origin main
   ```

2. **GitHub Actions Otomatis Berjalan**
   - Workflow akan trigger otomatis
   - Build aplikasi
   - Deploy ke GitHub Pages

3. **Cek Status**
   - Buka tab **"Actions"** di GitHub
   - Lihat progress deployment

---

## 7. Verifikasi Deployment

### 7.1. Cek Deployment Status

1. **Buka Actions Tab**
   - Di repository, klik **"Actions"**
   - Cari workflow run terbaru
   - Pastikan status **"green checkmark"** (berhasil)

2. **Cek Pages**
   - Buka **"Settings"** → **"Pages"**
   - Lihat URL deployment:
     ```
     https://USERNAME.github.io/REPO_NAME/
     ```

### 7.2. Test Aplikasi

1. **Buka URL Deployment**
   - Klik URL di Pages settings
   - Atau buka: `https://USERNAME.github.io/REPO_NAME/`

2. **Test Fitur**
   - ✅ Halaman load dengan benar
   - ✅ Login/Register berfungsi
   - ✅ Products bisa di-load
   - ✅ Tidak ada error di console

### 7.3. Cek Environment Variables

Jika ada error terkait API:

1. **Cek Browser Console**
   - Buka Developer Tools (F12)
   - Lihat tab **"Console"**
   - Cek apakah ada error terkait API

2. **Verifikasi Secrets**
   - Pastikan secrets sudah di-set dengan benar
   - Pastikan format URL benar (dengan `https://`)

---

## 🔧 Troubleshooting

### Error: "Build failed"

**Penyebab**: Environment variables tidak ter-set atau salah

**Solusi**:
1. Cek GitHub Secrets sudah di-set dengan benar
2. Pastikan format values benar (tidak ada spasi di awal/akhir)
3. Re-run workflow setelah fix secrets

### Error: "Deployment failed"

**Penyebab**: Build artifact tidak ditemukan atau path salah

**Solusi**:
1. Pastikan `vite.config.ts` output ke `docs` folder
2. Cek workflow file path: `./docs`
3. Pastikan build berhasil sebelum deploy

### Aplikasi tidak load

**Penyebab**: Base path tidak sesuai atau assets tidak ditemukan

**Solusi**:
1. Cek `vite.config.ts`:
   ```typescript
   base: '/REPO_NAME/',  // Pastikan sesuai nama repo
   ```
2. Pastikan semua assets di-build dengan benar
3. Clear browser cache dan reload

### API calls failed

**Penyebab**: CORS atau API URL salah

**Solusi**:
1. Cek `VITE_SUPABASE_URL` di secrets
2. Pastikan Supabase CORS sudah dikonfigurasi
3. Cek edge function sudah di-deploy

---

## 📝 Custom Domain (Optional)

Jika ingin menggunakan custom domain:

1. **Buka Pages Settings**
   - Settings → Pages → Custom domain

2. **Tambahkan Domain**
   - Masukkan domain Anda (misalnya: `marketplace.example.com`)

3. **Setup DNS**
   - Tambahkan CNAME record di DNS provider
   - Point ke: `USERNAME.github.io`

4. **Enable HTTPS**
   - GitHub akan otomatis setup SSL certificate

---

## 🔄 Update Deployment

Setiap kali Anda push perubahan:

```bash
git add .
git commit -m "Update: description"
git push origin main
```

GitHub Actions akan otomatis:
1. Build aplikasi baru
2. Deploy ke GitHub Pages
3. Update live site (biasanya 1-2 menit)

---

## 📊 Monitoring

### Cek Deployment History

1. **Buka Actions Tab**
   - Lihat semua deployment history
   - Cek status setiap deployment

2. **View Logs**
   - Klik deployment run
   - Lihat detailed logs untuk debugging

### Performance

- GitHub Pages menggunakan CDN global
- Load time biasanya < 2 detik
- Free tier: 100GB bandwidth/month

---

## ✅ Checklist Deployment

- [ ] Code sudah di-push ke GitHub
- [ ] GitHub Secrets sudah dikonfigurasi
- [ ] GitHub Pages enabled dengan source "GitHub Actions"
- [ ] Workflow file sudah ada (`.github/workflows/deploy.yml`)
- [ ] Build berhasil tanpa error
- [ ] Deployment berhasil
- [ ] Aplikasi bisa diakses di URL GitHub Pages
- [ ] Fitur utama (login, products) berfungsi
- [ ] Tidak ada error di console

---

## 🎉 Selamat!

Aplikasi Anda sudah ter-deploy dan akan auto-update setiap kali push ke GitHub!

**URL Aplikasi**: `https://USERNAME.github.io/REPO_NAME/`

---

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

---

**Need Help?** Cek [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) untuk setup database.

