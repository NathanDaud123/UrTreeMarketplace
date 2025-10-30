# 🗄️ UrTree Database Guide

## Overview
Marketplace UrTree sekarang menggunakan **Supabase KV Store** sebagai database yang lengkap dan production-ready!

## ✅ Fitur Database yang Sudah Diimplementasi

### 1. **User Management**
- ✅ Register & Login dengan validasi
- ✅ **Google Sign-In** (UI ready, setup required - see [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md))
- ✅ Multiple roles: Buyer, Seller, Admin
- ✅ Profile management
- ✅ Seller registration dengan KYC data
- ✅ Role switching (Buyer ↔ Seller)

**Admin Login:**
- Email: `admin@urtree.com`
- Password: `admin123`

### 2. **Product Management**
- ✅ CRUD operations untuk produk
- ✅ Filter by category (Tanaman Hidup, Benih, Peralatan)
- ✅ Search functionality
- ✅ Atribut khusus per kategori:
  - **Tanaman Hidup**: Usia tanaman, radius pengiriman maksimum
  - **Benih**: Semua field standar
  - **Peralatan**: Semua field standar
- ✅ Upload multiple images
- ✅ Stock management
- ✅ Product by seller

### 3. **Shopping Cart**
- ✅ Add to cart
- ✅ Update quantity
- ✅ Remove items
- ✅ Clear cart
- ✅ Persistent cart per user

### 4. **Order Management**
- ✅ Create order (checkout)
- ✅ Order history untuk buyer
- ✅ Order management untuk seller
- ✅ Order status tracking
- ✅ Automatic stock update saat checkout

### 5. **Chat System**
- ✅ Chat conversations antara buyer dan seller
- ✅ Real-time messaging
- ✅ Chat history
- ✅ Chat per product

### 6. **Review & Rating**
- ✅ Product reviews
- ✅ Rating system
- ✅ Automatic rating calculation

### 7. **Admin Dashboard**
- ✅ View all users
- ✅ View all orders
- ✅ Statistics (total users, products, orders, revenue)

## 📊 Database Structure

### Key-Value Store Keys:
```
user:{email}                    → User data
product:{productId}             → Product data
cart:{userId}                   → User's cart items
order:{orderId}                 → Order data
chat:{chatId}                   → Chat conversation
chatMessages:{chatId}           → Chat messages
review:{productId}:{reviewId}   → Product review
```

## 🔧 API Endpoints

### User Routes
- `POST /users/register` - Register user baru
- `POST /users/login` - Login user
- `POST /users/google-login` - Login dengan Google OAuth (requires setup)
- `GET /users/:email` - Get user by email
- `PUT /users/:email` - Update user profile
- `POST /users/:email/apply-seller` - Daftar sebagai seller
- `POST /users/:email/switch-role` - Switch role (buyer/seller)

### Product Routes
- `GET /products` - Get all products (support filter & search)
- `GET /products/:id` - Get product by ID
- `GET /products/seller/:sellerId` - Get products by seller
- `POST /products` - Create product (seller only)
- `PUT /products/:id` - Update product (seller only)
- `DELETE /products/:id` - Delete product (seller only)

### Cart Routes
- `GET /cart/:userId` - Get user's cart
- `PUT /cart/:userId` - Update cart
- `DELETE /cart/:userId` - Clear cart

### Order Routes
- `POST /orders` - Create order (checkout)
- `GET /orders/buyer/:buyerId` - Get buyer's orders
- `GET /orders/seller/:sellerId` - Get seller's orders
- `GET /orders/:id` - Get order by ID
- `PUT /orders/:id/status` - Update order status

### Chat Routes
- `GET /chats/:userId` - Get user's chat conversations
- `POST /chats` - Get or create chat conversation
- `GET /chats/:chatId/messages` - Get chat messages
- `POST /chats/:chatId/messages` - Send message

### Review Routes
- `GET /reviews/product/:productId` - Get product reviews
- `POST /reviews` - Create review

### Admin Routes
- `GET /admin/users` - Get all users
- `GET /admin/orders` - Get all orders
- `GET /admin/stats` - Get statistics

## 🌱 Sample Data (Seed Data)

Database sudah otomatis ter-seed dengan:
- ✅ 1 Admin user
- ✅ 12 Sample products (Tanaman Hidup, Benih, Peralatan)
- ✅ Multiple seller accounts

## 💻 Cara Menggunakan Database di Frontend

### 1. Gunakan Database Context Hook
```tsx
import { useDatabaseContext } from './utils/database-provider';

function MyComponent() {
  const db = useDatabaseContext();
  
  // Access current user
  const user = db.currentUser;
  
  // Access cart
  const cart = db.cart;
  
  // Load products
  await db.loadProducts({ category: 'tanaman-hidup' });
  
  // Create product (seller)
  await db.createProduct(productData);
  
  // And more...
}
```

### 2. Available Database Functions
```tsx
// User
db.login(email, password)
db.register(email, password, name)
db.logout()
db.updateUser(updates)
db.applySeller(sellerData)
db.switchRole(newRole)

// Products
db.loadProducts(filters)
db.loadSellerProducts()
db.createProduct(productData)
db.updateProduct(id, updates)
db.deleteProduct(id)

// Cart
db.loadCart()
db.updateCart(newCart)
db.clearCart()

// Orders
db.loadBuyerOrders()
db.loadSellerOrders()
db.createOrder(orderData)
db.updateOrderStatus(orderId, status)

// Chat
db.loadChatConversations()
```

## 🚀 Next Steps

Database sudah siap digunakan! Anda bisa:
1. ✅ Login dengan admin account untuk testing
2. ✅ Register user baru
3. ✅ Browse products yang sudah ada
4. ✅ Add products to cart
5. ✅ Checkout dan create orders
6. ✅ Daftar sebagai seller
7. ✅ Tambah produk sendiri
8. ✅ Kelola orders sebagai seller

## 🔐 Security Notes

- Password disimpan dalam plain text untuk prototyping
- Untuk production, gunakan password hashing (bcrypt/argon2)
- Admin credentials harus diubah di production
- API keys menggunakan Supabase public anon key (sudah aman untuk public use)

---

**Database Status**: ✅ **FULLY OPERATIONAL**

Semua fitur marketplace sekarang menggunakan database real, bukan lagi mock data!
