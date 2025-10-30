# 🌱 UrTree Marketplace

> Marketplace terpercaya untuk tanaman hidup, benih, dan peralatan berkebun di Indonesia

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase)](https://supabase.com/)

## 📖 Tentang Proyek

**UrTree** adalah marketplace e-commerce modern yang dikhususkan untuk produk tanaman dan berkebun dengan 3 kategori utama:

- 🌿 **Tanaman Hidup** - Tanaman hias dan produktif dengan sistem validasi radius pengiriman
- 🌱 **Benih** - Benih berkualitas untuk berbagai jenis tanaman
- 🛠️ **Peralatan & Media Tanam** - Perlengkapan berkebun lengkap

### ✨ Fitur Utama

#### 👥 Multi-Role System
- **Pembeli** - Browse, search, cart, checkout dengan validasi lokasi
- **Penjual** - Dashboard, manajemen produk, order management
- **Admin** - User management, statistik, oversight

#### 🛒 Shopping Experience
- **Google Sign-In** - One-click authentication ⚡ (✅ Working in demo mode!)
- Advanced product filtering & search
- Real-time cart management
- Validasi radius pengiriman untuk tanaman hidup
- Multiple payment methods (Midtrans integration ready)
- Order tracking & history

#### 💼 Seller Features
- Seller registration dengan KYC
- Product management (CRUD operations)
- Upload multiple product images
- Order management dashboard
- Chat dengan pembeli

#### 💬 Communication
- Real-time chat system antara buyer dan seller
- Chat history & conversation management

#### 📊 Admin Dashboard
- User management
- Order monitoring
- Platform statistics
- Revenue tracking

## 🚀 Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS 4.0** - Styling dengan modern design system
- **shadcn/ui** - Component library
- **Lucide React** - Icon system
- **Sonner** - Toast notifications

### Backend
- **Supabase** - Database & Backend services
- **Hono** - Web framework untuk edge functions
- **KV Store** - NoSQL data storage

### Integration Ready
- **Midtrans** - Payment gateway
- **Unsplash API** - Product images

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (untuk production)

### Setup

1. **Clone repository**
```bash
git clone https://github.com/yourusername/UrTreeMarketplace.git
cd UrTreeMarketplace
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**

File environment sudah dikonfigurasi di Figma Make environment. Untuk local development, Anda perlu:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. **Run development server**
```bash
npm run dev
```

5. **Deploy Supabase Functions**
```bash
supabase functions deploy make-server-0eb859c3
```

6. **[Optional] Setup Google Sign-In for Production**

✅ **Google Sign-In works NOW in demo mode!** Just click the button.

For **production** Google OAuth (real Google accounts), follow:

📖 See [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) for detailed instructions.

Quick summary:
- ✅ Demo mode: Working now, no setup needed
- ⚙️ Production mode: Configure Google Cloud Console (~25 min)
- Enable Google provider in Supabase
- Connect real Google accounts

## 🗄️ Database

UrTree menggunakan **Supabase KV Store** untuk data persistence. Database otomatis ter-seed dengan sample data saat pertama kali dijalankan.

### 📊 Sample Data Included

Database sudah dilengkapi dengan data realistis:
- ✅ **55 Products** (20 Tanaman Hidup, 15 Benih, 20 Peralatan)
- ✅ **11 Users** (1 Admin, 7 Sellers, 3 Buyers)
- ✅ **3 Sample Orders** (berbagai status & payment methods)
- ✅ **3 Chat Conversations** (dengan message history)
- ✅ **Sales Data** (sold count per product)

### Test Accounts
```
Admin:
Email: admin@urtree.com
Password: admin123

Seller:
Email: seller1@example.com
Password: seller123

Buyer:
Email: buyer1@example.com
Password: buyer123
```

⚠️ **Penting**: Ubah credentials admin sebelum production!

### Database Structure
```
user:{email}                    → User data
product:{productId}             → Product data (55 sample products)
cart:{userId}                   → User's cart items
order:{orderId}                 → Order data (3 sample orders)
chat:{chatId}                   → Chat conversation (3 samples)
chatMessages:{chatId}           → Chat messages
review:{productId}:{reviewId}   → Product review
```

📚 Dokumentasi Lengkap:
- [DATABASE_GUIDE.md](./DATABASE_GUIDE.md) - API documentation
- [DATABASE_EXPANSION.md](./DATABASE_EXPANSION.md) - Detail data structure
- [DATA_USAGE_GUIDE.md](./DATA_USAGE_GUIDE.md) - How to use sample data

## 📱 User Flows

### Quick Test: Google Sign-In ⚡

Want to test the fastest login ever?

1. Go to homepage
2. Click **"Sign in with Google"** button
3. Done! You're logged in as `google.user@gmail.com`
4. Start shopping! 🛒

**Note**: This uses demo mode. See [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) for production setup.

### Buyer Flow
1. Browse/Search products → Filter by category
2. Product detail → Add to cart / Buy now
3. Cart review → Checkout
4. Order placement → Payment
5. Order tracking → Review

### Seller Flow
1. Register sebagai seller (KYC)
2. Dashboard → Add product
3. Manage products (Edit/Delete)
4. Manage orders
5. Chat dengan buyers

### Admin Flow
1. Login dengan admin account
2. View platform statistics
3. Manage users & sellers
4. Monitor all orders

## 🎨 Design System

UrTree menggunakan design system yang konsisten dengan:

- **Primary Color**: Green (Hijau alam)
- **Typography**: Inter font family
- **Components**: shadcn/ui dengan customization
- **Responsive**: Mobile-first approach

## 📁 Project Structure

```
UrTreeMarketplace/
├── App.tsx                      # Main application component
├── components/
│   ├── home-page.tsx           # Landing page
│   ├── product-listing-page.tsx # Product catalog
│   ├── product-detail-page.tsx # Product detail
│   ├── cart-page.tsx           # Shopping cart
│   ├── checkout-page.tsx       # Checkout flow
│   ├── seller-dashboard.tsx    # Seller dashboard
│   ├── admin-dashboard.tsx     # Admin panel
│   ├── chat-page.tsx           # Chat system
│   └── ui/                     # shadcn/ui components
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx       # API routes
│           └── kv_store.tsx    # Database utilities
├── utils/
│   ├── api.ts                  # API client
│   ├── database-provider.tsx   # Database context
│   └── seed-data.ts            # Sample data seeder
└── styles/
    └── globals.css             # Global styles & tokens
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Build for production

# Lint
npm run lint         # Run ESLint

# Deploy
npm run deploy       # Deploy to production
```

### Code Style

- TypeScript strict mode
- ESLint + Prettier
- Component-based architecture
- Custom hooks untuk reusable logic

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push to GitHub
2. Import di Vercel
3. Set environment variables
4. Deploy!

### Deploy Supabase Functions

```bash
supabase link --project-ref your-project-ref
supabase functions deploy make-server-0eb859c3
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**UrTree Team**

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: contact@urtree.com

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - Amazing component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Supabase](https://supabase.com/) - Backend infrastructure
- [Lucide](https://lucide.dev/) - Beautiful icons

## 📸 Screenshots

### Homepage
> Clean, modern landing page dengan kategori produk utama

### Product Listing
> Advanced filtering dan search untuk menemukan tanaman yang tepat

### Seller Dashboard
> Comprehensive dashboard untuk mengelola produk dan pesanan

### Chat System
> Real-time communication antara pembeli dan penjual

## 📚 Complete Documentation

### Getting Started
- 📖 [README.md](./README.md) - This file (overview)
- 📖 [QUICK_START.md](./QUICK_START.md) - 5-minute setup guide
- 📖 [WHATS_NEW.md](./WHATS_NEW.md) - ⭐ New in v2.0!

### Database & API
- 📖 [DATABASE_GUIDE.md](./DATABASE_GUIDE.md) - Complete API documentation
- 📖 [DATABASE_EXPANSION.md](./DATABASE_EXPANSION.md) - ⭐ Database structure v2.0
- 📖 [DATA_USAGE_GUIDE.md](./DATA_USAGE_GUIDE.md) - ⭐ How to use sample data

### Testing & Accounts
- 📖 [TEST_ACCOUNTS.md](./TEST_ACCOUNTS.md) - ⭐ All test credentials

### Features
- 📖 [GOOGLE_SIGNIN_SUMMARY.md](./GOOGLE_SIGNIN_SUMMARY.md) - Google OAuth guide
- 📖 [PIN_SECURITY_GUIDE.md](./PIN_SECURITY_GUIDE.md) - PIN security feature

### Development
- 📖 [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Complete project overview
- 📖 [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment instructions
- 📖 [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- 📖 [CHANGELOG.md](./CHANGELOG.md) - Version history
- 📖 [SECURITY.md](./SECURITY.md) - Security policy

---

<div align="center">

**[Website](https://urtree.com)** • **[Documentation](./DATABASE_GUIDE.md)** • **[Report Bug](https://github.com/yourusername/UrTreeMarketplace/issues)** • **[Request Feature](https://github.com/yourusername/UrTreeMarketplace/issues)**

Made with 💚 by UrTree Team

</div>
