# 🔄 Git Workflow Guide

Panduan untuk workflow git yang aman: **Pull → Commit → Push**

## 📋 Workflow yang Benar

### Urutan yang Harus Dilakukan:

1. **Pull** - Ambil perubahan terbaru dari remote
2. **Commit** - Commit perubahan lokal
3. **Push** - Kirim perubahan ke remote

**Mengapa urutan ini penting?**
- ✅ Menghindari conflict
- ✅ Memastikan code selalu up-to-date
- ✅ Mencegah push yang gagal karena remote sudah berubah

---

## 🚀 Cara Menggunakan

### Opsi 1: Menggunakan Script (Recommended) ⭐

#### Windows (PowerShell):

```powershell
# Berikan commit message
.\git-workflow.ps1 "feat: update Google OAuth implementation"
```

#### Linux/Mac (Bash):

```bash
# Berikan commit message
chmod +x git-workflow.sh
./git-workflow.sh "feat: update Google OAuth implementation"
```

---

### Opsi 2: Manual (Step by Step)

#### 1. Pull Latest Changes

```bash
git pull origin main
```

**Jika ada conflict:**
- Resolve conflict dulu
- Commit hasil resolve
- Lanjut ke step berikutnya

#### 2. Check Status

```bash
git status
```

Lihat apa yang akan di-commit.

#### 3. Add Changes

```bash
# Add semua perubahan
git add -A

# Atau add file spesifik
git add src/utils/api.ts
```

#### 4. Commit

```bash
git commit -m "feat: update Google OAuth implementation"
```

**Commit message yang baik:**
- `feat:` - Fitur baru
- `fix:` - Bug fix
- `docs:` - Dokumentasi
- `style:` - Formatting
- `refactor:` - Refactoring
- `test:` - Testing
- `chore:` - Maintenance

#### 5. Push

```bash
git push origin main
```

---

## 📝 Contoh Workflow Lengkap

```bash
# 1. Pull dulu
git pull origin main

# 2. Cek status
git status

# 3. Add changes
git add -A

# 4. Commit
git commit -m "feat: implement Google Sign-In with Supabase Auth"

# 5. Push
git push origin main
```

---

## ⚠️ Jika Ada Conflict

### Saat Pull:

```bash
git pull origin main
# Conflict detected!

# 1. Buka file yang conflict
# 2. Resolve conflict (pilih perubahan yang benar)
# 3. Add file yang sudah di-resolve
git add conflicted-file.ts

# 4. Commit resolve
git commit -m "fix: resolve merge conflict"

# 5. Push
git push origin main
```

---

## 🎯 Best Practices

### ✅ DO (Lakukan):

- ✅ **Selalu pull dulu** sebelum commit & push
- ✅ **Commit message yang jelas** dan deskriptif
- ✅ **Commit sering** dengan perubahan kecil
- ✅ **Test sebelum push** (jika memungkinkan)

### ❌ DON'T (Jangan):

- ❌ Jangan push tanpa pull dulu
- ❌ Jangan commit file `.env` atau secrets
- ❌ Jangan commit dengan message kosong
- ❌ Jangan force push ke main branch

---

## 🔧 Git Aliases (Optional)

Tambahkan alias untuk mempermudah:

```bash
# Setup alias
git config --global alias.sync '!git pull origin main && git add -A && git commit -m "$1" && git push origin main'

# Usage
git sync "feat: update features"
```

**Atau untuk Windows PowerShell:**

Tambahkan ke `$PROFILE`:

```powershell
function Git-Sync {
    param([string]$Message)
    git pull origin main
    git add -A
    git commit -m $Message
    git push origin main
}
```

---

## 📚 Quick Reference

### Pull Only:
```bash
git pull origin main
```

### Commit Only:
```bash
git add -A
git commit -m "message"
```

### Push Only:
```bash
git push origin main
```

### Full Workflow:
```bash
git pull origin main && git add -A && git commit -m "message" && git push origin main
```

---

## 🆘 Troubleshooting

### Error: "Your branch is behind"
**Solusi:**
```bash
git pull origin main
```

### Error: "Merge conflict"
**Solusi:**
1. Buka file yang conflict
2. Resolve conflict
3. `git add conflicted-file`
4. `git commit -m "fix: resolve conflict"`
5. `git push origin main`

### Error: "Push rejected"
**Solusi:**
```bash
# Pull dulu
git pull origin main

# Resolve conflict jika ada
# Lalu push lagi
git push origin main
```

---

## ✅ Checklist

Sebelum push, pastikan:
- [ ] Sudah pull dari remote
- [ ] Tidak ada conflict
- [ ] Semua perubahan sudah di-add
- [ ] Commit message jelas
- [ ] Tidak ada file `.env` atau secrets yang ter-commit
- [ ] Code sudah di-test (jika memungkinkan)

---

**Happy Coding! 🚀**

