# 🚀 Deploy Supabase Edge Function

Edge function perlu di-deploy agar API endpoints bisa diakses. Ini yang menyebabkan error "NetworkError".

## 🎯 Quick Deploy

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

### Step 2: Login ke Supabase

```bash
supabase login
```

Akan membuka browser untuk autentikasi.

### Step 3: Link ke Project

```bash
supabase link --project-ref rbyeyyqkghxdixgpktuo
```

**Project ref**: `rbyeyyqkghxdixgpktuo` (dari URL Supabase Anda)

### Step 4: Set Secrets (Environment Variables)

```bash
supabase secrets set SUPABASE_URL=https://rbyeyyqkghxdixgpktuo.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJieWV5eXFrZ2h4ZGl4Z3BrdHVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTE2NDc5MywiZXhwIjoyMDgwNzQwNzkzfQ.FND00NTS6XgT3Um_YPENvE5Bn_eupQIfB4DtmlJ1jwc
```

### Step 5: Deploy Function

```bash
supabase functions deploy make-server-0eb859c3
```

Tunggu hingga deploy selesai (1-2 menit).

### Step 6: Verify

Test endpoint:
```
https://rbyeyyqkghxdixgpktuo.supabase.co/functions/v1/make-server-0eb859c3/health
```

Harus return: `{"status":"ok"}`

---

## ✅ Setelah Deploy

1. **Refresh aplikasi**
2. **Test Google Sign-In lagi**
3. **Error NetworkError seharusnya hilang**

---

## 🐛 Jika Deploy Gagal

### Error: "Project not found"
- Pastikan project ref benar: `rbyeyyqkghxdixgpktuo`
- Pastikan sudah login

### Error: "Function not found"
- Pastikan folder `src/supabase/functions/server/` ada
- Pastikan file `index.tsx` ada

### Error: "Permission denied"
- Pastikan sudah login dengan akun yang punya akses ke project

---

**Deploy edge function dan error akan hilang! 🎉**

