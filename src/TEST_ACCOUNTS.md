# 🔐 Test Accounts - UrTree Marketplace

Quick reference untuk semua test accounts yang tersedia di database.

---

## 👨‍💼 Admin Account

### Full Access Admin
```
Email:    admin@urtree.com
Password: admin123
Role:     Admin
```

**Access:**
- ✅ View all users
- ✅ Monitor all orders
- ✅ Platform statistics
- ✅ System settings

---

## 🏪 Seller Accounts (7 Toko)

### 1. Toko Tanaman Hijau
```
Email:       seller1@example.com
Password:    seller123
Shop:        Toko Tanaman Hijau
Owner:       Budi Santoso
Location:    Jakarta Selatan
Rating:      4.8/5
Products:    4 tanaman indoor premium
Specialty:   Monstera, Philodendron, Pilea, Ficus
```

### 2. Green Paradise
```
Email:       seller2@example.com
Password:    seller123
Shop:        Green Paradise
Owner:       Siti Rahayu
Location:    Bandung
Rating:      4.9/5 ⭐
Products:    8 tanaman indoor & outdoor
Specialty:   Aglaonema, Sansevieria, Sirih Gading
```

### 3. Benih Nusantara
```
Email:       seller3@example.com
Password:    seller123
Shop:        Benih Nusantara
Owner:       Ahmad Wijaya
Location:    Surabaya
Rating:      4.7/5
Products:    9 benih sayuran & buah
Specialty:   Tomat, Cabai, Sawi, Timun
```

### 4. Tani Makmur
```
Email:       seller4@example.com
Password:    seller123
Shop:        Tani Makmur
Owner:       Dewi Lestari
Location:    Yogyakarta
Rating:      4.6/5
Products:    10 peralatan berkebun
Specialty:   Tools, Pots, Sekop
```

### 5. Kebun Organik
```
Email:       seller5@example.com
Password:    seller123
Shop:        Kebun Organik
Owner:       Rudi Hermawan
Location:    Bogor
Rating:      4.8/5
Products:    9 pupuk & media tanam
Specialty:   Pupuk Kompos, Cocopeat, Sekam
```

### 6. Flora Cantik
```
Email:       seller6@example.com
Password:    seller123
Shop:        Flora Cantik
Owner:       Linda Kusuma
Location:    Semarang
Rating:      4.9/5 ⭐
Products:    5 tanaman bunga & langka
Specialty:   Calathea, Alocasia, Anthurium, Hoya
```

### 7. Sukses Tani
```
Email:       seller7@example.com
Password:    seller123
Shop:        Sukses Tani
Owner:       Eko Prasetyo
Location:    Malang
Rating:      4.7/5
Products:    10 benih unggul
Specialty:   Bayam, Kangkung, Terong, Buncis
```

---

## 🛒 Buyer Accounts (3 Pembeli)

### 1. Andi Kurniawan
```
Email:       buyer1@example.com
Password:    buyer123
Name:        Andi Kurniawan
Location:    Jakarta Pusat
Address:     Jl. Sudirman No. 12
Phone:       081111222333

Order History:
✅ 1 Completed Order
   - Monstera Deliciosa (Rp 165.000)
   - Status: Delivered
   - Review: "Pesanan pertama saya, puas dengan pelayanan!"

Chat:
💬 1 Conversation with Toko Tanaman Hijau
```

### 2. Maya Sari
```
Email:       buyer2@example.com
Password:    buyer123
Name:        Maya Sari
Location:    Jakarta Selatan
Address:     Jl. Gatot Subroto No. 45
Phone:       082222333444

Order History:
🚚 1 Active Order
   - 2x Sansevieria Trifasciata (Rp 185.000)
   - Status: In Delivery
   - Note: "Tolong packing yang rapi ya"

Chat:
💬 1 Conversation with Green Paradise
```

### 3. Rizky Pratama
```
Email:       buyer3@example.com
Password:    buyer123
Name:        Rizky Pratama
Location:    Bandung
Address:     Jl. Dago No. 78
Phone:       083333444555

Order History:
⏳ 1 Confirmed Order
   - 3x Benih Tomat Cherry (Rp 75.000)
   - 2x Pupuk Organik Kompos (Rp 70.000)
   - Total: Rp 155.000
   - Status: Confirmed

Chat:
💬 1 Conversation with Benih Nusantara
```

---

## 🎯 Quick Login Guide

### As Admin
```bash
1. Go to /login
2. Enter: admin@urtree.com / admin123
3. Access admin dashboard
```

### As Seller
```bash
1. Go to /login
2. Choose any seller account (seller1-7@example.com)
3. Password: seller123
4. View seller dashboard
5. Manage products & orders
```

### As Buyer
```bash
1. Go to /login
2. Choose buyer1-3@example.com
3. Password: buyer123
4. Browse products & shop
5. View order history
```

---

## 🔄 Account Features by Role

### Admin Capabilities
- ✅ View all users (11 total)
- ✅ View all orders (3 sample orders)
- ✅ View all products (55 products)
- ✅ Platform statistics
- ✅ User management
- ✅ Revenue tracking

### Seller Capabilities
- ✅ Product CRUD (Create, Read, Update, Delete)
- ✅ Upload product images
- ✅ Manage inventory & stock
- ✅ View & process orders
- ✅ Update order status
- ✅ Chat with buyers
- ✅ Sales dashboard

### Buyer Capabilities
- ✅ Browse & search products
- ✅ Filter by category
- ✅ Add to cart
- ✅ Checkout & payment
- ✅ Order tracking
- ✅ Transaction history
- ✅ Chat with sellers
- ✅ Profile management

---

## 📊 Account Statistics

### Total Users: 11
- 1 Admin
- 7 Sellers
- 3 Buyers

### Seller Distribution by City:
- Jakarta Selatan: 1 toko
- Bandung: 1 toko
- Surabaya: 1 toko
- Yogyakarta: 1 toko
- Bogor: 1 toko
- Semarang: 1 toko
- Malang: 1 toko

### Buyer Distribution:
- Jakarta: 2 buyers
- Bandung: 1 buyer

### Active Orders: 3
- Delivered: 1
- In Delivery: 1
- Confirmed: 1

### Active Chats: 3
- All with message history
- Real conversation examples

---

## 💡 Testing Tips

### Full Journey Test
```
1. Login as buyer1@example.com
2. Browse products
3. Add Monstera to cart
4. Checkout (already has order, test duplicate)
5. View order history
6. Check chat with seller

Total time: ~5 minutes
```

### Seller Experience Test
```
1. Login as seller1@example.com
2. View dashboard (4 products)
3. Try editing a product
4. View orders (if any)
5. Reply to chat messages

Total time: ~5 minutes
```

### Admin Overview Test
```
1. Login as admin@urtree.com
2. View all users table
3. Check platform statistics
4. Monitor orders
5. View revenue metrics

Total time: ~3 minutes
```

---

## 🔐 Security Notes

### For Development
- All passwords are simple (123 suffix)
- Not hashed (for demo purposes)
- Easy to remember

### For Production
⚠️ **MUST CHANGE:**
- [ ] Admin password
- [ ] Implement password hashing
- [ ] Add email verification
- [ ] Enable 2FA for admin
- [ ] Add rate limiting
- [ ] Implement session timeout

---

## 🎨 Account Personalities

### Best Rated Sellers
1. 🥇 Green Paradise (4.9/5) - Bandung
2. 🥇 Flora Cantik (4.9/5) - Semarang
3. 🥈 Toko Tanaman Hijau (4.8/5) - Jakarta
4. 🥈 Kebun Organik (4.8/5) - Bogor

### Most Products
1. 🏆 Tani Makmur - 10 products
2. 🏆 Sukses Tani - 10 products
3. 🥈 Benih Nusantara - 9 products
4. 🥈 Kebun Organik - 9 products

### Most Active Buyers
1. 💬 Andi Kurniawan - 1 delivered order + chat
2. 🚚 Maya Sari - 1 active delivery + chat
3. ⏳ Rizky Pratama - 1 confirmed order + chat

---

## 📞 Need More Accounts?

### To Add New Seller
```javascript
// Use seller registration flow
1. Create buyer account first
2. Fill KYC form in seller registration
3. Auto-approved (instant)
4. Switch to seller role
```

### To Add New Buyer
```javascript
// Use registration page
1. Go to /register
2. Fill form (email, password, name)
3. Auto-creates buyer account
4. Start shopping!
```

---

## 🎯 Recommended Test Path

### Day 1: Buyer Experience
- Login as all 3 buyers
- See their order histories
- Check chat conversations
- Try adding new products to cart

### Day 2: Seller Operations
- Login to all 7 seller shops
- View different product types
- Check inventory levels
- Test order processing

### Day 3: Admin Overview
- Login as admin
- Monitor platform health
- View all data
- Check statistics

---

**🔑 All Passwords: `123` suffix for easy testing**

**📝 Note:** Remember to change all credentials before production deployment!

---

*Last Updated: January 29, 2025*
*Version: 2.0.0*
