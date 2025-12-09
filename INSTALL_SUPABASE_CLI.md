# 📦 Install Supabase CLI untuk Windows

Supabase CLI tidak bisa diinstall via `npm install -g`. Gunakan cara berikut:

## 🎯 Cara Install (Windows)

### Opsi 1: Via Scoop (Recommended) ⭐

1. **Install Scoop** (jika belum ada):
   ```powershell
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   irm get.scoop.sh | iex
   ```

2. **Install Supabase CLI**:
   ```powershell
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   ```

3. **Verify**:
   ```powershell
   supabase --version
   ```

---

### Opsi 2: Via Chocolatey

1. **Install Chocolatey** (jika belum ada):
   - Buka: https://chocolatey.org/install
   - Atau jalankan di PowerShell (as Administrator):
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   ```

2. **Install Supabase CLI**:
   ```powershell
   choco install supabase
   ```

---

### Opsi 3: Manual Download (Jika Scoop/Choco tidak bisa)

1. **Download Binary**:
   - Buka: https://github.com/supabase/cli/releases
   - Download: `supabase_windows_amd64.zip` (atau sesuai architecture Anda)

2. **Extract & Add to PATH**:
   - Extract zip file
   - Copy `supabase.exe` ke folder (misalnya: `C:\tools\supabase\`)
   - Tambahkan ke PATH:
     - Windows Settings → System → Advanced → Environment Variables
     - Edit "Path" → Add → `C:\tools\supabase\`

3. **Verify**:
   ```powershell
   supabase --version
   ```

---

## ✅ Setelah Install

Lanjutkan dengan deploy edge function:

```powershell
# 1. Login
supabase login

# 2. Link project
supabase link --project-ref rbyeyyqkghxdixgpktuo

# 3. Set secrets (opsional - hanya jika menggunakan Midtrans)
# Catatan: SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY sudah tersedia otomatis
# Hanya set secret jika Anda menggunakan Midtrans untuk payment:
# supabase secrets set MIDTRANS_SERVER_KEY=your_midtrans_server_key
# supabase secrets set MIDTRANS_CLIENT_KEY=your_midtrans_client_key

# 4. Deploy
supabase functions deploy make-server-0eb859c3
```

---

## 🐛 Troubleshooting

### Error: "scoop: command not found"
- Install Scoop dulu (lihat Opsi 1)

### Error: "choco: command not found"
- Install Chocolatey dulu (lihat Opsi 2)

### Error: Permission denied
- Jalankan PowerShell sebagai Administrator

---

**Pilih salah satu cara di atas untuk install Supabase CLI! 🚀**

