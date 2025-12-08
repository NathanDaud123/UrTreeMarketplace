# 🌳 UrTree Marketplace

Marketplace e-commerce untuk produk tanaman dan berkebun di Indonesia.

## 🚀 Live Demo

**Aplikasi sudah ter-deploy di:**
- 🌐 GitHub Pages: `https://nathandaud123.github.io/UrTreeMarketplace/`

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Deployment**: GitHub Pages + GitHub Actions (CI/CD)

## 📦 Setup Development

### Prerequisites
- Node.js 18+
- Supabase account

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
# Buat file .env di root project:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Run development server
npm run dev
```

## 🗄️ Database Setup

1. Buat project di [Supabase](https://supabase.com)
2. Jalankan SQL schema dari `database_schema.sql`
3. Setup environment variables (lihat `.env.example`)

Detail lengkap: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

## 🚀 Deployment

Deployment otomatis via GitHub Actions:
- Push ke `main` branch → Auto build & deploy
- Setup secrets di GitHub: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

Detail lengkap: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 📚 Documentation

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Setup Supabase database
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deployment guide
- [database_schema.sql](./database_schema.sql) - Database schema

## 🎯 Features

- ✅ User Management (Buyer, Seller, Admin)
- ✅ Product Catalog dengan kategori
- ✅ Shopping Cart
- ✅ Order Management
- ✅ Chat System
- ✅ Review & Rating
- ✅ Payment Integration (Midtrans)
- ✅ Auto Deploy (GitHub Actions)

## 📝 License

This is a code bundle for UrTree Marketplace. Original design: [Figma](https://www.figma.com/design/YnrpnGlv9EGLORXjfrWNKT/UrTree-Marketplace)
