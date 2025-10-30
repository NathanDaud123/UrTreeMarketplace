# 📚 Data Usage Guide - UrTree Marketplace

## 🎯 Overview
Panduan lengkap untuk menggunakan dan memanfaatkan data yang sudah tersedia di database UrTree Marketplace.

---

## 🔐 Test Accounts

### Admin Account
```
Email: admin@urtree.com
Password: admin123
Role: Admin
```
**Capabilities:**
- View all users
- Monitor all orders
- Access platform statistics
- Manage system settings

### Seller Accounts

#### 1. Toko Tanaman Hijau (Jakarta Selatan)
```
Email: seller1@example.com
Password: seller123
Shop: Toko Tanaman Hijau
Products: Tanaman hias indoor premium
Location: Jakarta Selatan
```

#### 2. Green Paradise (Bandung)
```
Email: seller2@example.com
Password: seller123
Shop: Green Paradise
Products: Tanaman hias indoor & outdoor
Location: Bandung
```

#### 3. Benih Nusantara (Surabaya)
```
Email: seller3@example.com
Password: seller123
Shop: Benih Nusantara
Products: Benih sayuran organik
Location: Surabaya
```

#### 4. Tani Makmur (Yogyakarta)
```
Email: seller4@example.com
Password: seller123
Shop: Tani Makmur
Products: Peralatan berkebun
Location: Yogyakarta
```

#### 5. Kebun Organik (Bogor)
```
Email: seller5@example.com
Password: seller123
Shop: Kebun Organik
Products: Pupuk & media tanam organik
Location: Bogor
```

#### 6. Flora Cantik (Semarang)
```
Email: seller6@example.com
Password: seller123
Shop: Flora Cantik
Products: Tanaman bunga & tanaman langka
Location: Semarang
```

#### 7. Sukses Tani (Malang)
```
Email: seller7@example.com
Password: seller123
Shop: Sukses Tani
Products: Benih & bibit unggul
Location: Malang
```

### Buyer Accounts

#### 1. Andi Kurniawan
```
Email: buyer1@example.com
Password: buyer123
Location: Jakarta Pusat
Has Order: Yes (Delivered)
```

#### 2. Maya Sari
```
Email: buyer2@example.com
Password: buyer123
Location: Jakarta Selatan
Has Order: Yes (In Delivery)
```

#### 3. Rizky Pratama
```
Email: buyer3@example.com
Password: buyer123
Location: Bandung
Has Order: Yes (Confirmed)
```

---

## 📦 Product Categories

### 1. Tanaman Hidup (20 Products)

**Price Range:** Rp 45.000 - Rp 350.000

**Popular Products:**
- **Sirih Gading** (Rp 45.000) - 92 sold ⭐
- **Sansevieria Trifasciata** (Rp 85.000) - 78 sold
- **Monstera Deliciosa** (Rp 150.000) - 45 sold

**Premium Products:**
- **Anthurium Jari** (Rp 350.000) - Tanaman langka
- **Ficus Lyrata** (Rp 280.000) - Trendy plant
- **Philodendron Birkin** (Rp 250.000) - Limited stock

**Features:**
- All have `plantAge` attribute
- All have `maxDeliveryRadius` for shipping validation
- Seller coordinates for distance calculation

### 2. Benih (15 Products)

**Price Range:** Rp 12.000 - Rp 45.000

**Best Sellers:**
- **Benih Bayam Hijau** (Rp 15.000) - 212 sold 🔥
- **Benih Cabai Rawit** (Rp 30.000) - 178 sold
- **Benih Selada Keriting** (Rp 16.000) - 167 sold

**Premium Seeds:**
- **Benih Melon Golden** (Rp 45.000)
- **Benih Paprika Merah** (Rp 42.000)
- **Benih Bawang Merah** (Rp 38.000)

**Features:**
- Fast growing varieties
- Organic certified
- Detailed planting instructions in description

### 3. Peralatan & Media Tanam (20 Products)

**Price Range:** Rp 20.000 - Rp 125.000

**Essential Tools:**
- **Sekop Tangan Premium** (Rp 45.000) - 89 sold
- **Gunting Tanaman Profesional** (Rp 75.000)
- **Sarung Tangan Berkebun** (Rp 25.000) - 145 sold

**Media Tanam:**
- **Pupuk Organik Kompos 5kg** (Rp 35.000) - 156 sold ⭐
- **Media Tanam Cocopeat 5kg** (Rp 40.000) - 134 sold
- **Sekam Bakar 5kg** (Rp 20.000) - 167 sold

**Pots & Containers:**
- **Pot Keramik Minimalis 20cm** (Rp 65.000)
- **Pot Plastik Set 10pcs** (Rp 35.000)
- **Pot Taman Gantung Set 3pcs** (Rp 95.000)

---

## 💬 Chat Conversations

### Active Chats

#### Chat 1: Monstera Inquiry
- **Buyer:** buyer1@example.com (Andi Kurniawan)
- **Seller:** seller1@example.com (Toko Tanaman Hijau)
- **Product:** Monstera Deliciosa
- **Status:** Order completed ✅
- **Messages:** 4 messages

#### Chat 2: Sansevieria Question
- **Buyer:** buyer2@example.com (Maya Sari)
- **Seller:** seller2@example.com (Green Paradise)
- **Product:** Sansevieria Trifasciata
- **Status:** Order in delivery 🚚
- **Messages:** 3 messages

#### Chat 3: Seeds Consultation
- **Buyer:** buyer3@example.com (Rizky Pratama)
- **Seller:** seller3@example.com (Benih Nusantara)
- **Product:** Benih Tomat Cherry
- **Status:** Order confirmed ⏳
- **Messages:** 4 messages

---

## 🛍️ Sample Orders

### Order 1: Completed Purchase
```json
{
  "buyer": "Andi Kurniawan",
  "products": ["1x Monstera Deliciosa"],
  "total": "Rp 165.000",
  "payment": "COD",
  "status": "Delivered",
  "review": "Pesanan pertama saya, puas dengan pelayanan!"
}
```

### Order 2: In Transit
```json
{
  "buyer": "Maya Sari",
  "products": ["2x Sansevieria Trifasciata"],
  "total": "Rp 185.000",
  "payment": "Transfer (Paid)",
  "status": "In Delivery",
  "note": "Tolong packing yang rapi ya"
}
```

### Order 3: Multi-Seller Order
```json
{
  "buyer": "Rizky Pratama",
  "products": [
    "3x Benih Tomat Cherry",
    "2x Pupuk Organik Kompos"
  ],
  "total": "Rp 155.000",
  "payment": "E-Wallet (Paid)",
  "status": "Confirmed"
}
```

---

## 🎯 Testing Scenarios

### Scenario 1: Complete Buyer Journey
1. **Login** sebagai `buyer1@example.com`
2. **Browse** produk di kategori Tanaman Hidup
3. **Search** "monstera" atau filter by category
4. **View** product detail dengan semua informasi
5. **Add to cart** produk pilihan
6. **Checkout** dengan validasi alamat & radius
7. **View order** di transaction history
8. **Chat** dengan seller untuk pertanyaan

### Scenario 2: Seller Management
1. **Login** sebagai `seller1@example.com`
2. **View** seller dashboard dengan statistik
3. **Manage** product inventory (stock updates)
4. **Process** orders dari buyers
5. **Update** order status (confirmed → in delivery → delivered)
6. **Reply** chat messages dari buyers
7. **View** sales analytics

### Scenario 3: Admin Monitoring
1. **Login** sebagai `admin@urtree.com`
2. **Monitor** platform statistics
3. **View** all users (buyers & sellers)
4. **Track** all orders across platform
5. **Analyze** revenue & performance metrics

---

## 🔍 Search & Filter Examples

### Search Queries to Test
- "monstera" → Returns Monstera Deliciosa
- "tomat" → Returns Benih Tomat Cherry
- "pupuk" → Returns various pupuk products
- "pot" → Returns pot keramik, plastik, gantung
- "sansevieria" → Returns Lidah Mertua products

### Filter Combinations
1. **Category: Tanaman Hidup** → 20 results
2. **Category: Benih** → 15 results
3. **Category: Peralatan** → 20 results
4. **Search "benih" + Category: Benih** → Refined results
5. **Price sort** (low to high / high to low)

---

## 📊 Data Analytics

### Sales Performance

**Top Selling Products:**
1. Benih Bayam Hijau - 212 sold
2. Benih Cabai Rawit - 178 sold
3. Sekam Bakar - 167 sold
4. Selada Keriting - 167 sold
5. Pupuk Organik Kompos - 156 sold

**Top Sellers by Revenue:**
1. Green Paradise (Bandung) - Rating 4.9
2. Kebun Organik (Bogor) - Rating 4.8
3. Toko Tanaman Hijau (Jakarta) - Rating 4.8

### Customer Behavior

**Average Order Value:**
- COD orders: Rp 165.000
- Online payment: Rp 170.000

**Popular Categories:**
- Peralatan: 36% of products
- Tanaman Hidup: 36% of products
- Benih: 27% of products

---

## 🛠️ Advanced Features

### Radius Validation (Tanaman Hidup Only)
```javascript
// Example: Check if buyer is within delivery radius
const product = {
  maxDeliveryRadius: 50, // km
  sellerLat: -6.2615,
  sellerLng: 106.8106
};

const buyer = {
  lat: -6.2088, // Jakarta Pusat
  lng: 106.8456
};

// Distance calculation will determine if order is allowed
```

### Stock Management
```javascript
// When order is placed:
1. Check if stock >= order quantity
2. Reduce stock by order quantity
3. Increment sold count
4. Update product in database

// Example:
Before: { stock: 25, sold: 45 }
After order of 1: { stock: 24, sold: 46 }
```

### Payment Methods
- **COD (Cash on Delivery)** - No payment gateway needed
- **Bank Transfer** - Manual verification
- **E-Wallet** - OVO, GoPay, Dana
- **Credit Card** - Via Midtrans (configured)

---

## 🎨 UI/UX Features to Test

### Responsive Design
- ✅ Mobile view (< 768px)
- ✅ Tablet view (768px - 1024px)
- ✅ Desktop view (> 1024px)

### Loading States
- ✅ Product loading skeletons
- ✅ Button loading spinners
- ✅ Page transition loaders

### Error Handling
- ✅ Out of stock alerts
- ✅ Delivery radius validation
- ✅ Form validation messages
- ✅ Network error toasts

### Interactive Elements
- ✅ Image galleries with zoom
- ✅ Quantity selectors
- ✅ Filter chips
- ✅ Sort dropdowns
- ✅ Toast notifications

---

## 📝 Best Practices

### For Sellers
1. Keep product descriptions detailed and accurate
2. Update stock regularly
3. Respond to chat messages promptly
4. Process orders within 24 hours
5. Update delivery status in real-time

### For Buyers
1. Complete profile before checkout
2. Check delivery radius for Tanaman Hidup
3. Use chat for product inquiries
4. Provide detailed shipping address
5. Leave reviews after delivery

### For Admin
1. Monitor suspicious activities
2. Review seller applications
3. Track platform metrics
4. Handle disputes fairly
5. Maintain system health

---

## 🔄 Data Refresh

### Auto-Seeding
Database akan otomatis di-seed pada kondisi berikut:
- Aplikasi pertama kali dijalankan
- Database kosong atau < 10 products
- Manual trigger via `seedInitialData()`

### Manual Seeding
```javascript
import { seedInitialData } from './utils/seed-data';

// Call manually
await seedInitialData();
```

---

## 📞 Support

### Common Issues

**Q: Data tidak muncul setelah login?**
A: Refresh halaman atau clear browser cache

**Q: Produk tidak bisa ditambahkan ke cart?**
A: Pastikan login sebagai buyer, bukan seller

**Q: Chat tidak berfungsi?**
A: Pastikan kedua user (buyer & seller) sudah ada di database

**Q: Order tidak ter-create?**
A: Check profile lengkap (address, phone, city)

---

## 🎓 Learning Resources

### Understand the Flow
1. **User Flow:** [README.md](./README.md)
2. **API Docs:** [DATABASE_GUIDE.md](./DATABASE_GUIDE.md)
3. **Database Structure:** [DATABASE_EXPANSION.md](./DATABASE_EXPANSION.md)
4. **Deployment:** [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**Last Updated:** January 2025

**Version:** 2.0.0

---

**🌱 Happy Testing! 💚**
