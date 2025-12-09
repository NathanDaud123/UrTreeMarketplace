# ⚡ Quick Deploy Edge Function - Fix NetworkError

Edge function belum di-deploy, itu sebabnya muncul error "NetworkError".

## 🚀 Deploy Sekarang (5 Menit)

### Step 1: Install Supabase CLI

```powershell
npm install -g supabase
```

### Step 2: Login

```powershell
supabase login
```

Akan buka browser untuk login.

### Step 3: Link Project

```powershell
supabase link --project-ref rbyeyyqkghxdixgpktuo
```

### Step 4: Deploy

**Catatan**: `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` sudah tersedia otomatis di edge functions, tidak perlu di-set sebagai secret.

```powershell
supabase functions deploy make-server-0eb859c3 --no-verify-jwt
```

**Note**: `--no-verify-jwt` untuk bypass JWT verification (untuk development).

### Step 5: Test

Buka di browser:
```
https://rbyeyyqkghxdixgpktuo.supabase.co/functions/v1/make-server-0eb859c3/health
```

Harus muncul: `{"status":"ok"}`

---

## ✅ Setelah Deploy

1. **Refresh aplikasi**
2. **Test Google Sign-In lagi**
3. **Error NetworkError akan hilang!**

---

**Deploy sekarang dan error akan hilang! 🎉**

