# Database Expansion - UrTree Marketplace

## 📊 Overview
Database UrTree telah dikembangkan secara signifikan dengan data yang lebih komprehensif dan realistis untuk mendukung pengalaman marketplace yang lengkap.

## 🎯 What's New

### 1. **Expanded Product Catalog (55 Products)**

#### **Tanaman Hidup (20 Products)**
Kategori tanaman indoor yang lengkap dengan detail:
- Monstera Deliciosa
- Philodendron Birkin
- Aglaonema Red Anjamani
- Sansevieria Trifasciata (Lidah Mertua)
- Sirih Gading (Pothos)
- Calathea Ornata
- Alocasia Polly (African Mask)
- Anthurium Jari
- Pilea Peperomioides
- Ficus Lyrata
- Maranta Leuconeura
- Syngonium Podophyllum Pink
- Scindapsus Pictus
- ZZ Plant
- Hoya Carnosa
- Peperomia Obtusifolia
- Dieffenbachia
- Dracaena Marginata
- Aspidistra Elatior
- Begonia Maculata

**Fitur Khusus Tanaman Hidup:**
- `plantAge`: Usia tanaman (<1thn atau 1thn+)
- `maxDeliveryRadius`: Radius pengiriman maksimum dalam km
- `sellerLat` & `sellerLng`: Koordinat lokasi penjual untuk validasi radius
- `sold`: Track jumlah produk terjual

#### **Benih (15 Products)**
Benih sayuran dan buah organik:
- Tomat Cherry
- Cabai Rawit
- Bayam Hijau
- Kangkung Darat
- Sawi Hijau
- Timun Jepang
- Terong Ungu
- Buncis
- Jagung Manis
- Melon Golden
- Selada Keriting
- Bawang Merah
- Kacang Panjang
- Wortel Import
- Paprika Merah

#### **Peralatan & Media Tanam (20 Products)**
Perlengkapan berkebun lengkap:
- Sekop Tangan & Besar
- Pupuk berbagai jenis (Kompos, NPK, Kandang, Bokashi, Daun Cair)
- Pot berbagai ukuran & material (Keramik, Plastik, Terakota, Gantung)
- Media tanam (Cocopeat, Sekam Bakar)
- Tools (Gunting, Cangkul, Sprayer)
- Aksesoris (Sarung Tangan, Polybag, Ajir Bambu, Selang Air)

### 2. **Enhanced User System (11 Users)**

#### **Admin (1)**
- admin@urtree.com

#### **Sellers (7)**
Setiap seller memiliki:
- Toko dengan nama unik
- Deskripsi toko
- Alamat & kota lengkap
- Rating toko (4.6 - 4.9)
- Nomor telepon
- Koordinat lokasi (untuk seller tanaman hidup)

**Daftar Toko:**
1. **Toko Tanaman Hijau** - Jakarta Selatan (Budi Santoso)
2. **Green Paradise** - Bandung (Siti Rahayu)
3. **Benih Nusantara** - Surabaya (Ahmad Wijaya)
4. **Tani Makmur** - Yogyakarta (Dewi Lestari)
5. **Kebun Organik** - Bogor (Rudi Hermawan)
6. **Flora Cantik** - Semarang (Linda Kusuma)
7. **Sukses Tani** - Malang (Eko Prasetyo)

#### **Buyers (3)**
- Andi Kurniawan - Jakarta Pusat
- Maya Sari - Jakarta Selatan
- Rizky Pratama - Bandung

### 3. **Sample Transactions (3 Orders)**

#### **Order 1: Delivered**
- Buyer: Andi Kurniawan
- Product: Monstera Deliciosa
- Status: `delivered`
- Payment: COD
- Notes: "Pesanan pertama saya, puas dengan pelayanan!"

#### **Order 2: In Delivery**
- Buyer: Maya Sari
- Products: 2x Sansevieria Trifasciata
- Status: `in_delivery`
- Payment: Transfer (Paid)
- Notes: "Tolong packing yang rapi ya"

#### **Order 3: Confirmed**
- Buyer: Rizky Pratama
- Products: 
  - 3x Benih Tomat Cherry
  - 2x Pupuk Organik Kompos
- Status: `confirmed`
- Payment: E-Wallet (Paid)

### 4. **Chat Conversations (3 Chats)**

Setiap chat conversation memiliki message history yang realistis:

#### **Chat 1: Buyer1 ↔ Seller1**
- Topic: Monstera Deliciosa
- Messages: 4 pesan (tanya stok, nego, konfirmasi)

#### **Chat 2: Buyer2 ↔ Seller2**
- Topic: Sansevieria
- Messages: 3 pesan (tanya cocok untuk ruang AC)

#### **Chat 3: Buyer3 ↔ Seller3**
- Topic: Benih Tomat
- Messages: 4 pesan (tanya cocok pot, minta rekomendasi pupuk)

## 📈 Data Statistics

### Products
- **Total Products**: 55
- **Tanaman Hidup**: 20 (36%)
- **Benih**: 15 (27%)
- **Peralatan**: 20 (36%)

### Sales Data
- Setiap produk memiliki field `sold` dengan data penjualan realistis
- Range penjualan: 12 - 212 unit
- Products dengan penjualan tertinggi:
  1. Benih Bayam Hijau - 212 sold
  2. Benih Cabai Rawit - 178 sold
  3. Sekam Bakar - 167 sold

### Price Range
- **Tanaman Hidup**: Rp 45.000 - Rp 350.000
- **Benih**: Rp 12.000 - Rp 45.000
- **Peralatan**: Rp 20.000 - Rp 125.000

## 🔑 Key Features

### 1. **Realistic Product Data**
- Deskripsi detail untuk setiap produk
- Harga yang realistis sesuai market Indonesia
- Stock yang bervariasi
- Data penjualan (sold count)

### 2. **Complete Seller Profiles**
- Shop name dan description
- Full address dengan city
- Phone numbers
- Seller ratings
- Location coordinates (untuk validasi radius)

### 3. **Transaction History**
- Multiple payment methods (COD, Transfer, E-Wallet)
- Various order statuses
- Realistic shipping costs
- Customer notes

### 4. **Chat System**
- Complete conversation threads
- Realistic customer inquiries
- Seller responses with helpful information

## 🚀 Auto-Seeding

Database akan otomatis di-seed ketika:
1. Aplikasi pertama kali dijalankan
2. Database kosong atau memiliki < 10 products
3. Seeding dilakukan melalui `DatabaseProvider` initialization

## 📝 Data Structure

### Product Schema
```typescript
{
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: 'tanaman-hidup' | 'benih' | 'peralatan'
  images: string[]
  sellerId: string
  sellerName: string
  sellerRating: number
  sellerLocation: string
  sold: number
  
  // Khusus tanaman hidup:
  plantAge?: '<1thn' | '1thn+'
  maxDeliveryRadius?: number
  sellerLat?: number
  sellerLng?: number
}
```

### User Schema (Seller)
```typescript
{
  email: string
  name: string
  role: 'seller'
  hasSellerAccount: true
  shopName: string
  shopDescription: string
  shopAddress: string
  shopCity: string
  phone: string
  sellerRating?: number
  sellerLat?: number  // Untuk validasi radius
  sellerLng?: number
}
```

### Order Schema
```typescript
{
  id: string
  buyerEmail: string
  buyerName: string
  items: OrderItem[]
  total: number
  shippingCost: number
  paymentMethod: 'cod' | 'transfer' | 'e-wallet' | 'credit-card'
  shippingAddress: Address
  status: 'pending_payment' | 'pending' | 'confirmed' | 'in_delivery' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'cod'
  notes?: string
  createdAt: string
}
```

### Chat Schema
```typescript
{
  id: string
  buyerId: string
  sellerId: string
  productId: string
  messages: Message[]
  createdAt: string
}

Message {
  id: string
  sender: string
  text: string
  timestamp: string
}
```

## 🔄 Next Steps

### Recommended Enhancements:
1. **Reviews System**: Tambahkan review/rating untuk produk
2. **Wishlist**: Fitur save produk favorit
3. **Product Images**: Upload multiple images per produk
4. **Seller Analytics**: Dashboard analytics untuk penjual
5. **Buyer History**: Track browsing history
6. **Notifications**: System notifikasi untuk order updates
7. **Product Variations**: Size, warna, dll untuk satu produk
8. **Promo Codes**: System voucher dan diskon

## 📞 Support

Untuk pertanyaan atau issue terkait database, silakan buka issue di repository atau hubungi tim development.

---

**Last Updated**: January 2025
**Version**: 2.0.0
