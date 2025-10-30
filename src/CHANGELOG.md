# Changelog

All notable changes to UrTree Marketplace will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-01-29

### 🚀 Major Release - Database Expansion

**Comprehensive Database Development**
- ✅ Expanded product catalog dari 12 menjadi **55 products**
  - 20 Tanaman Hidup (indoor plants)
  - 15 Benih (organic seeds)
  - 20 Peralatan & Media Tanam
- ✅ Enhanced user system: **11 users** (1 Admin, 7 Sellers, 3 Buyers)
- ✅ Sample transactions: **3 realistic orders** dengan berbagai status
- ✅ Chat conversations: **3 complete chat threads** dengan message history
- ✅ Sales tracking: Setiap produk dilengkapi dengan `sold` count
- ✅ Realistic pricing: Rp 12.000 - Rp 350.000

**New Product Features**
- Detailed descriptions untuk setiap produk
- Stock management yang realistis
- Multiple seller shops dengan unique identities
- Location data untuk radius validation
- Product images dari Unsplash

**Enhanced Seller Profiles**
- 7 toko unik dengan nama, deskripsi, dan lokasi
- Shop ratings (4.6 - 4.9)
- Complete contact information
- Seller coordinates untuk delivery radius validation

**Sample Data**
- Complete buyer journey data (orders from cart to delivery)
- Multi-status orders (pending, confirmed, in_delivery, delivered)
- Multiple payment methods (COD, Transfer, E-Wallet)
- Realistic shipping addresses and costs
- Customer notes and feedback

**New Documentation**
- 📖 DATABASE_EXPANSION.md - Complete database structure overview
- 📖 DATA_USAGE_GUIDE.md - How to use and test sample data
- 📖 Updated PROJECT_SUMMARY.md with new statistics
- 📖 Updated README.md with sample data information

**Auto-Seeding Improvements**
- Enhanced seed functions for users, products, orders, and chats
- Better error handling during seeding
- Automatic detection of empty database
- Seeding only when needed (< 10 products)

### 🎯 Breaking Changes
- Database now requires 55+ products for full experience
- New test accounts available (see DATA_USAGE_GUIDE.md)
- Seed data structure updated

### 🐛 Fixed
- Fixed typo in category name
- Improved seed data consistency
- Better error messages during seeding

---

## [1.2.0] - 2025-01-29

### 🔐 Added - PIN Security & Payment Methods

**Security Enhancement**
- ✅ PIN 6 digit keamanan transaksi
- ✅ PIN setup dialog dengan validasi lengkap
- ✅ PIN verification dengan max 3 percobaan
- ✅ Ubah PIN dengan verifikasi PIN lama
- ✅ Tombol toggle show/hide PIN
- ✅ Visual indicator status PIN di Settings
- 📖 Complete documentation (PIN_SECURITY_GUIDE.md)

**Checkout Improvements**
- ✅ 4 metode pembayaran: COD, Transfer Bank, E-Wallet, Kartu Kredit
- ✅ Beautiful payment method selection UI
- ✅ Mandatory PIN verification before checkout
- ✅ Warning jika user belum set PIN
- ✅ Integrated dengan database real-time
- ✅ **Auto-fill data pengiriman dari profil user**
- ✅ Visual indicator untuk data yang sudah terisi otomatis
- ✅ Alert untuk profil yang belum lengkap

### 🐛 Fixed - Order Creation Bug
- ✅ Fixed server endpoint untuk create order (data structure mismatch)
- ✅ Fixed filter orders by seller endpoint
- ✅ Improved error handling untuk product stock update

**Database & API**
- New endpoints: set-pin, verify-pin, change-pin
- User model updated dengan field `hasPin` dan `pin`
- Server-side PIN validation
- Error handling dan security checks

---

## [1.1.0] - 2025-01-29

### ✨ Added - Google Sign-In

**Authentication Enhancement**
- ✅ Google Sign-In button added to Login page
- ✅ Google Sign-In button added to Register page
- ✅ Mock/Demo implementation (fully functional)
- ✅ Beautiful Google logo with official colors
- ✅ Auto-create user from Google data
- ✅ Seamless integration with existing auth flow
- 📖 Complete production setup guide (GOOGLE_OAUTH_SETUP.md)

**User Experience**
- One-click authentication option
- Demo mode works without configuration
- Toast notifications for better feedback
- Helpful tips about demo vs production mode

---

## [1.0.0] - 2025-01-29

### 🎉 Initial Release

#### Added - Core Features

**User Management**
- User registration and authentication system
- Multi-role support (Buyer, Seller, Admin)
- Profile management with complete user data
- Role switching capability for users with seller accounts
- Seller registration with KYC verification

**Product Management**
- Complete CRUD operations for products
- Three main categories: Tanaman Hidup, Benih, Peralatan & Media Tanam
- Category-specific attributes:
  - Tanaman Hidup: Plant age, delivery radius validation
  - Benih: Standard product attributes
  - Peralatan: Standard product attributes
- Multiple image upload support
- Stock management system
- Product filtering by category
- Advanced search functionality

**Shopping Experience**
- Add to cart functionality
- Cart quantity management
- Persistent cart storage per user
- Buy now quick checkout
- Delivery radius validation for live plants
- Profile completion validation before checkout

**Order System**
- Complete checkout flow
- Order creation and management
- Order history for buyers
- Order management for sellers
- Order status tracking
- Automatic stock update on purchase
- Transaction history views

**Communication**
- Real-time chat system between buyers and sellers
- Chat conversations per product
- Chat history persistence
- Message threading

**Seller Features**
- Dedicated seller dashboard
- Product management (create, edit, delete)
- Order management interface
- Sales overview
- Chat with buyers

**Admin Panel**
- User management interface
- Platform statistics dashboard
- Order monitoring
- Revenue tracking
- System oversight

**UI/UX**
- Modern, responsive design
- Mobile-first approach
- Clean navigation system
- Toast notifications for user feedback
- Loading states and error handling
- Profile completion alerts
- Beautiful product cards and listings

#### Added - Technical Implementation

**Frontend**
- React 18 with TypeScript
- Tailwind CSS 4.0 design system
- shadcn/ui component library
- Lucide React icons
- Sonner toast notifications
- Custom typography system (Inter font)
- Responsive layouts

**Backend**
- Supabase integration
- KV Store database implementation
- Hono web framework for Edge Functions
- RESTful API architecture
- 40+ API endpoints
- Database context provider
- Auto-seeding functionality

**Database Structure**
- User data storage
- Product catalog
- Shopping cart persistence
- Order management
- Chat system
- Review and rating system

**Developer Experience**
- TypeScript strict mode
- Component-based architecture
- Custom hooks
- Context API for state management
- Comprehensive error handling
- API abstraction layer

#### Documentation
- Comprehensive README.md
- DATABASE_GUIDE.md with complete API documentation
- DEPLOYMENT.md with deployment instructions
- CONTRIBUTING.md for contributors
- Code comments and JSDoc

#### Security
- Environment variable management
- Secure API endpoints
- Role-based access control
- Input validation

---

## [Unreleased]

### Planned Features
- [ ] Payment gateway integration (Midtrans)
- [ ] Email notifications
- [ ] Order invoice generation
- [ ] Product review system activation
- [ ] Wishlist functionality
- [ ] Product recommendations
- [ ] Advanced analytics for sellers
- [ ] Multi-language support
- [ ] Mobile app version
- [ ] Social media integration
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] Seller verification badges
- [ ] Product comparison feature
- [ ] Advanced filtering options
- [ ] Image optimization and CDN integration

### Known Issues
- None reported yet

---

## Version History

### Version Format
- **Major.Minor.Patch** (e.g., 1.0.0)
- **Major**: Breaking changes
- **Minor**: New features (backwards compatible)
- **Patch**: Bug fixes (backwards compatible)

---

[1.0.0]: https://github.com/yourusername/UrTreeMarketplace/releases/tag/v1.0.0
