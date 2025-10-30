# 🔐 Panduan Fitur PIN Keamanan Transaksi

## Overview
Fitur PIN Keamanan memberikan lapisan keamanan tambahan untuk setiap transaksi checkout di marketplace UrTree. User diwajibkan untuk membuat dan menggunakan PIN 6 digit untuk melindungi transaksi mereka.

## Fitur Utama

### 1. **Setup PIN**
- User dapat membuat PIN 6 digit di halaman **Pengaturan (Settings)**
- PIN harus berupa angka (0-9)
- PIN wajib dikonfirmasi saat pembuatan
- Validasi otomatis untuk memastikan:
  - PIN tepat 6 digit
  - PIN hanya berisi angka
  - Konfirmasi PIN sama dengan PIN utama

### 2. **Verifikasi PIN saat Checkout**
- Sebelum menyelesaikan pesanan, user harus memasukkan PIN
- Maksimal 3 kali percobaan salah
- Jika PIN salah 3 kali, dialog akan tertutup otomatis
- Tombol checkout disabled jika user belum membuat PIN

### 3. **Ubah PIN**
- User dapat mengubah PIN kapan saja di halaman Pengaturan
- Harus memasukkan PIN lama terlebih dahulu
- Kemudian membuat PIN baru dengan konfirmasi

## Komponen yang Dibuat

### `/components/pin-setup-dialog.tsx`
Dialog untuk membuat atau mengubah PIN dengan fitur:
- Input PIN dengan hide/show toggle
- Validasi real-time (hanya angka, max 6 digit)
- Konfirmasi PIN
- Loading state saat menyimpan

### `/components/pin-verification-dialog.tsx`
Dialog untuk verifikasi PIN dengan fitur:
- Input PIN dengan hide/show toggle
- Counter untuk percobaan yang tersisa
- Auto-close setelah 3 kali salah
- Loading state saat verifikasi

## Integrasi Database

### API Endpoints (`/utils/api.ts`)
```typescript
userAPI.setPin(email, pin)      // Buat PIN baru
userAPI.verifyPin(email, pin)   // Verifikasi PIN
userAPI.changePin(email, newPin) // Ubah PIN
```

### Server Routes (`/supabase/functions/server/index.tsx`)
- `POST /users/:email/set-pin` - Membuat PIN untuk user
- `POST /users/:email/verify-pin` - Memverifikasi PIN user
- `POST /users/:email/change-pin` - Mengubah PIN user

### Database Schema
User object di KV Store sekarang memiliki field tambahan:
```typescript
{
  email: string;
  name: string;
  pin?: string;        // PIN user (di production harus di-hash!)
  hasPin?: boolean;    // Flag untuk cek apakah user sudah punya PIN
  // ... field lainnya
}
```

## Flow Checkout dengan PIN

1. **User di Checkout Page**
   - Isi data pengiriman
   - Validasi alamat (untuk tanaman hidup)
   - **Pilih metode pembayaran** (COD, Transfer Bank, E-Wallet, Kartu Kredit)
   - Klik "Bayar Sekarang"

2. **Pengecekan PIN**
   - Jika user **belum** punya PIN: tampilkan warning, tidak bisa checkout
   - Jika user **sudah** punya PIN: tampilkan dialog verifikasi PIN

3. **Verifikasi PIN**
   - User memasukkan PIN 6 digit
   - Sistem verifikasi dengan database
   - Jika benar: proses pesanan
   - Jika salah: counter percobaan berkurang

4. **Proses Pesanan**
   - Buat order di database
   - Clear cart
   - Redirect ke halaman sukses/history

## Metode Pembayaran

Checkout page sekarang memiliki 4 pilihan metode pembayaran:

1. **Cash on Delivery (COD)** - Bayar tunai saat barang tiba
2. **Transfer Bank** - BCA, Mandiri, BNI, BRI
3. **E-Wallet** - GoPay, OVO, DANA, ShopeePay
4. **Kartu Kredit/Debit** - Visa, Mastercard, JCB

User harus memilih salah satu sebelum bisa checkout.

## Security Notes ⚠️

**PENTING untuk Production:**
1. **Hash PIN**: Saat ini PIN disimpan sebagai plain text. Di production WAJIB menggunakan hashing (bcrypt/argon2)
2. **Rate Limiting**: Tambahkan rate limiting untuk mencegah brute force attack
3. **PIN Timeout**: Pertimbangkan untuk menambahkan timeout setelah terlalu banyak percobaan gagal
4. **2FA**: Fitur 2FA via SMS sudah disiapkan di UI, tinggal implementasi
5. **Audit Log**: Log setiap percobaan PIN untuk keamanan

## User Interface

### Settings Page - PIN Section
- **Jika belum ada PIN**: Tombol "Buat PIN" dengan warning kuning
- **Jika sudah ada PIN**: Indikator hijau + Tombol "Ubah PIN"

### Checkout Page - PIN Warning
- Alert kuning muncul jika user belum punya PIN
- Tombol checkout disabled jika belum ada PIN

## Testing Checklist

- [ ] Buat PIN baru dari Settings
- [ ] Verifikasi PIN saat checkout
- [ ] Ubah PIN yang sudah ada
- [ ] Test PIN salah 3 kali (harus auto-close)
- [ ] Test checkout tanpa PIN (harus tampil warning)
- [ ] Test checkout dengan PIN benar (harus sukses)
- [ ] Test pilih metode pembayaran

## Future Enhancements

1. **Forgot PIN Flow** - Recovery PIN via email/SMS
2. **PIN Strength Indicator** - Saran untuk PIN yang kuat
3. **Biometric Authentication** - Fingerprint/Face ID untuk mobile
4. **Transaction History with PIN** - Tampilkan transaksi yang di-protect dengan PIN
5. **PIN Expiry** - Wajib ubah PIN setiap X bulan

---

**Created**: 2025-01-XX  
**Last Updated**: 2025-01-XX  
**Version**: 1.0.0
