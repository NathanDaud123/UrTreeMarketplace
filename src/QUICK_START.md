# ⚡ Quick Start Guide - UrTree Marketplace

Get UrTree up and running in **5 minutes**! 🚀

## 🎯 Prerequisites

Make sure you have:
- ✅ Node.js 18+ installed ([Download](https://nodejs.org/))
- ✅ Git installed
- ✅ Code editor (VS Code recommended)
- ✅ Supabase account ([Sign up free](https://supabase.com))

## 🚀 Installation (5 Steps)

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/UrTreeMarketplace.git
cd UrTreeMarketplace
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Setup Supabase (Already configured in Figma Make!)

If running locally, create a Supabase project:

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy your credentials:
   - Project URL
   - Anon (public) key
   - Service role key

### Step 4: Configure Environment

Create `.env` file in root (if needed for local dev):
```env
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 5: Run Development Server
```bash
npm run dev
```

🎉 **That's it!** Open [http://localhost:5173](http://localhost:5173)

---

## 🧪 Test the App

### 🚀 Fastest Way: Google Sign-In (NEW!)

**Try the one-click login:**

1. Go to login page
2. Click **"Sign in with Google"** 🎯
3. ✨ Instantly logged in!
4. Email: `google.user@gmail.com`

**That's it!** No forms, no passwords. Just one click!

### 1. Login as Admin
```
Email: admin@urtree.com
Password: admin123
```

### 2. Browse Products
- Go to homepage
- Click on product categories
- Search for products

### 3. Test Buyer Flow
1. Register new account (or use Google Sign-In!)
2. Browse products
3. Add to cart
4. Checkout

### 4. Test Seller Flow
1. Login as buyer
2. Go to Profile → Apply as Seller
3. Fill seller registration form
4. Access Seller Dashboard
5. Add new product

---

## 📂 Project Structure Overview

```
UrTreeMarketplace/
├── App.tsx                  # Main app component
├── components/              # React components
│   ├── home-page.tsx       # Landing page
│   ├── seller-dashboard.tsx # Seller panel
│   └── ui/                 # shadcn components
├── supabase/               # Backend
│   └── functions/
│       └── server/
│           └── index.tsx   # API routes
├── utils/
│   ├── api.ts              # API client
│   └── database-provider.tsx # DB context
└── styles/
    └── globals.css         # Global styles
```

---

## 🎨 Key Features to Try

### For Buyers 🛒
- [x] Browse products by category
- [x] Search products
- [x] Add to cart
- [x] Checkout
- [x] View order history
- [x] Chat with sellers

### For Sellers 📦
- [x] Register as seller
- [x] Add products
- [x] Manage inventory
- [x] Process orders
- [x] Chat with buyers

### For Admins 👑
- [x] View all users
- [x] Monitor orders
- [x] Platform statistics
- [x] System oversight

---

## 🛠️ Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Code Quality
npm run lint            # Run linter
npm run type-check      # TypeScript check

# Supabase
supabase login          # Login to Supabase
supabase link           # Link to project
supabase functions deploy # Deploy functions
```

---

## 🐛 Troubleshooting

### Issue: Port already in use
```bash
# Kill process on port 5173
npx kill-port 5173

# Or use different port
npm run dev -- --port 3000
```

### Issue: Module not found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Database not seeding
- Refresh the page
- Database auto-seeds on first product fetch
- Check browser console for errors

### Issue: API errors
- Verify Supabase credentials
- Check if functions are deployed
- Look at Network tab in DevTools

---

## 📚 Next Steps

1. **Read Full Documentation**
   - [README.md](./README.md) - Project overview
   - [DATABASE_GUIDE.md](./DATABASE_GUIDE.md) - API docs
   - [DEPLOYMENT.md](./DEPLOYMENT.md) - Deploy guide

2. **Explore Code**
   - Check out component structure
   - Review database implementation
   - Understand state management

3. **Customize**
   - Update branding
   - Add new features
   - Modify design

4. **Deploy**
   - Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
   - Deploy to Vercel
   - Configure domain

---

## 💡 Pro Tips

### VS Code Extensions (Recommended)
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

### Keyboard Shortcuts
- `Ctrl/Cmd + Shift + P` - Command Palette
- `Ctrl/Cmd + B` - Toggle Sidebar
- `F12` - Go to Definition

### Development Workflow
1. Create feature branch
2. Make changes
3. Test thoroughly
4. Commit with meaningful messages
5. Push and create PR

---

## 🆘 Need Help?

- 📖 Check [Documentation](./README.md)
- 🐛 Report [Issues](https://github.com/yourusername/UrTreeMarketplace/issues)
- 💬 Join [Discussions](https://github.com/yourusername/UrTreeMarketplace/discussions)
- 📧 Email: support@urtree.com

---

## 🎉 You're Ready!

Start building amazing features for UrTree Marketplace! 🌱💚

**Happy Coding!** 👨‍💻👩‍💻
