# 🚀 GitHub Setup Guide - UrTree Marketplace

Panduan lengkap untuk meng-upload project UrTree ke GitHub repository Anda.

## 📋 Prerequisites

- ✅ GitHub account
- ✅ Git installed di komputer Anda
- ✅ Project files sudah di local directory

## 🎯 Step-by-Step Setup

### Option A: Upload via GitHub Web Interface (Termudah)

#### 1. Create New Repository

1. Login ke [GitHub](https://github.com)
2. Click tombol **"+"** di kanan atas → **"New repository"**
3. Isi form:
   - Repository name: `UrTreeMarketplace`
   - Description: `Marketplace terpercaya untuk tanaman hidup, benih, dan peralatan berkebun`
   - Visibility: **Public** (atau Private jika Anda mau)
   - ❌ **JANGAN** centang "Initialize this repository with a README"
4. Click **"Create repository"**

#### 2. Download Project dari Figma Make

1. Download semua files dari Figma Make
2. Extract ke folder local
3. Folder structure harus seperti ini:
   ```
   UrTreeMarketplace/
   ├── README.md
   ├── package.json
   ├── App.tsx
   ├── components/
   ├── supabase/
   └── ... (semua files)
   ```

#### 3. Upload via Command Line

Buka Terminal/Command Prompt di folder project, lalu:

```bash
# 1. Initialize git repository
git init

# 2. Add all files
git add .

# 3. Create first commit
git commit -m "🎉 Initial commit: UrTree Marketplace v1.0.0"

# 4. Rename branch to main (jika perlu)
git branch -M main

# 5. Add remote repository (ganti YOUR_USERNAME dengan username GitHub Anda)
git remote add origin https://github.com/YOUR_USERNAME/UrTreeMarketplace.git

# 6. Push to GitHub
git push -u origin main
```

**Selesai!** 🎉 Repository Anda sekarang live di GitHub!

---

### Option B: Upload via GitHub Desktop (User-Friendly)

#### 1. Install GitHub Desktop
- Download dari [desktop.github.com](https://desktop.github.com)
- Install dan login dengan GitHub account Anda

#### 2. Create New Repository

1. Open GitHub Desktop
2. Click **"File"** → **"New Repository"**
3. Isi form:
   - Name: `UrTreeMarketplace`
   - Local path: Pilih folder tempat project Anda
   - Git ignore: `Node`
   - License: `MIT License`
4. Click **"Create Repository"**

#### 3. Copy Project Files

1. Copy semua files dari Figma Make
2. Paste ke folder repository yang baru dibuat
3. GitHub Desktop akan otomatis detect changes

#### 4. Commit and Push

1. Di GitHub Desktop, Anda akan lihat semua files di "Changes" tab
2. Tulis commit message: `🎉 Initial commit: UrTree Marketplace v1.0.0`
3. Click **"Commit to main"**
4. Click **"Publish repository"**
5. Pilih visibility (Public/Private)
6. Click **"Publish Repository"**

**Selesai!** 🎉

---

## ✅ Verify Upload

1. Buka browser dan go to:
   ```
   https://github.com/YOUR_USERNAME/UrTreeMarketplace
   ```

2. Pastikan semua files ada:
   - ✅ README.md terlihat di homepage
   - ✅ Folder structure lengkap
   - ✅ All documentation files ada

---

## 🎨 Customize Repository

### 1. Add Repository Topics

Di GitHub repository page:
1. Click **"Settings"** (gear icon)
2. Scroll ke **"Topics"**
3. Add topics:
   ```
   react, typescript, marketplace, ecommerce, supabase, 
   tailwindcss, plants, gardening, indonesia
   ```

### 2. Update Repository Details

Di **"About"** section (kanan atas):
1. Click gear icon
2. Add:
   - Website: `https://urtree.vercel.app` (setelah deploy)
   - Description: `Marketplace terpercaya untuk tanaman hidup, benih, dan peralatan berkebun di Indonesia 🌱`
   - Topics: (sudah ditambah di step 1)

### 3. Enable Features

Di **Settings** → **General**:
- ✅ Issues
- ✅ Projects (optional)
- ✅ Wiki (optional)
- ✅ Discussions (untuk community)

### 4. Setup Branch Protection (Optional)

Di **Settings** → **Branches** → **Add rule**:
- Branch name pattern: `main`
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging

---

## 🔐 Setup Secrets (untuk CI/CD)

Jika Anda menggunakan GitHub Actions:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Add secrets:
   ```
   Name: SUPABASE_URL
   Value: your_supabase_url
   
   Name: SUPABASE_ANON_KEY
   Value: your_anon_key
   
   Name: SUPABASE_SERVICE_ROLE_KEY
   Value: your_service_role_key
   ```

---

## 📝 Update README.md

Edit `README.md` dan ganti:

```markdown
# Di bagian Installation, ganti:
git clone https://github.com/yourusername/UrTreeMarketplace.git

# Menjadi:
git clone https://github.com/YOUR_ACTUAL_USERNAME/UrTreeMarketplace.git

# Update author section dengan info Anda
```

Commit perubahan:
```bash
git add README.md
git commit -m "docs: update repository URLs"
git push
```

---

## 🚀 Next Steps After Upload

### 1. Deploy to Vercel

Setelah code di GitHub:
1. Go to [vercel.com](https://vercel.com)
2. Click **"Import Project"**
3. Select your GitHub repository
4. Configure dan deploy!

### 2. Setup Repository

- [ ] Add repository description
- [ ] Add topics/tags
- [ ] Enable Issues
- [ ] Create first release tag
- [ ] Invite collaborators (jika ada)

### 3. Documentation

- [ ] Review README.md
- [ ] Check all links work
- [ ] Update screenshots (jika ada)
- [ ] Verify documentation complete

### 4. Community

- [ ] Add Code of Conduct
- [ ] Setup Discussions
- [ ] Create first issue/task
- [ ] Share with community!

---

## 🆘 Troubleshooting

### Issue: "Permission denied"
```bash
# Setup SSH key atau use HTTPS dengan personal access token
# https://docs.github.com/en/authentication
```

### Issue: "Repository already exists"
```bash
# Hapus remote dan add ulang dengan nama berbeda
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/UrTree-Marketplace.git
```

### Issue: Large files error
```bash
# GitHub limit adalah 100MB per file
# Untuk files besar, gunakan Git LFS atau host di tempat lain
```

### Issue: Files not showing
```bash
# Make sure .gitignore tidak exclude files penting
# Check apakah push berhasil:
git status
git log
```

---

## 📞 Need Help?

- 📖 [GitHub Docs](https://docs.github.com)
- 💬 [GitHub Community](https://github.community)
- 📧 Email: support@urtree.com

---

## ✅ Checklist

Sebelum share repository:

- [ ] All files uploaded successfully
- [ ] README.md displays correctly
- [ ] Links in documentation work
- [ ] Repository description added
- [ ] Topics/tags added
- [ ] License file included
- [ ] .gitignore properly configured
- [ ] No sensitive data in commits
- [ ] Repository visibility set correctly
- [ ] Branch protection enabled (if needed)

---

**Congratulations!** 🎉

Your UrTree Marketplace is now on GitHub!

Share your repository:
```
https://github.com/YOUR_USERNAME/UrTreeMarketplace
```

---

**Happy Coding!** 🌱💚
