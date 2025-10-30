# 🚀 UrTree Marketplace - Deployment Guide

Panduan lengkap untuk deploy UrTree Marketplace ke production.

## 📋 Pre-Deployment Checklist

- [ ] Database seeded dengan data production
- [ ] Environment variables configured
- [ ] Admin credentials updated
- [ ] Payment gateway tested (Midtrans)
- [ ] SSL certificate ready
- [ ] Domain name registered
- [ ] Error tracking setup (optional: Sentry)
- [ ] Analytics setup (optional: Google Analytics)

## 🎯 Deployment Options

### Option 1: Vercel (Recommended) ⭐

Vercel adalah platform yang paling mudah untuk deploy React apps.

#### Step 1: Prepare Repository

```bash
# Pastikan semua changes sudah di-commit
git add .
git commit -m "chore: prepare for deployment"
git push origin main
```

#### Step 2: Deploy to Vercel

1. **Via Vercel Dashboard:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import from GitHub: `UrTreeMarketplace`
   - Configure project:
     - Framework Preset: `Vite` atau `Create React App`
     - Build Command: `npm run build`
     - Output Directory: `dist` atau `build`

2. **Via Vercel CLI:**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Login
   vercel login
   
   # Deploy
   vercel
   
   # Deploy to production
   vercel --prod
   ```

#### Step 3: Configure Environment Variables

Di Vercel Dashboard → Settings → Environment Variables:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### Step 4: Configure Domain

1. Vercel Dashboard → Settings → Domains
2. Add custom domain: `www.urtree.com`
3. Configure DNS records di domain provider

---

### Option 2: Netlify

#### Deploy via Git

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import from Git"
3. Select GitHub repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist` atau `build`

#### Configure Environment Variables

Site settings → Environment variables → Add variables

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

### Option 3: AWS Amplify

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Configure Amplify
amplify configure

# Initialize
amplify init

# Add hosting
amplify add hosting

# Publish
amplify publish
```

---

## 🗄️ Supabase Deployment

### Setup Supabase Project

1. **Create Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note down:
     - Project URL
     - Anon (public) key
     - Service role key

2. **Deploy Edge Functions**

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy make-server-0eb859c3

# Set secrets
supabase secrets set SUPABASE_URL=your_url
supabase secrets set SUPABASE_ANON_KEY=your_key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

3. **Configure CORS**

Di Supabase Dashboard → API Settings → CORS:
```
https://your-domain.com
https://www.your-domain.com
```

### Database Initialization

```bash
# Seed database via API
curl -X POST https://your-project.supabase.co/functions/v1/make-server-0eb859c3/seed \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Atau akses aplikasi dan database akan otomatis ter-seed.

---

## 🔐 Security Configuration

### 1. Update Admin Credentials

```typescript
// File: /supabase/functions/server/index.tsx
// Ubah admin email di production
const adminEmails = ['admin@yourdomain.com']; // Ganti dari admin@urtree.com
```

### 2. Password Hashing (Recommended)

Untuk production, gunakan bcrypt:

```typescript
import bcrypt from 'bcrypt';

// Hash password saat register
const hashedPassword = await bcrypt.hash(password, 10);

// Verify password saat login
const isValid = await bcrypt.compare(password, user.password);
```

### 3. Rate Limiting

Tambahkan rate limiting di edge functions:

```typescript
import { rateLimiter } from 'hono-rate-limiter';

app.use('*', rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

### 4. Environment Variables Security

- ✅ NEVER commit `.env` files
- ✅ Use platform secret management (Vercel/Netlify)
- ✅ Rotate keys regularly
- ✅ Use different keys for staging/production

---

## 📊 Monitoring & Analytics

### Error Tracking with Sentry

```bash
npm install @sentry/react

# Initialize
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
});
```

### Google Analytics

```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🧪 Testing Before Production

### Staging Environment

1. Create staging branch:
```bash
git checkout -b staging
```

2. Deploy to staging:
```bash
vercel --env staging
```

3. Test checklist:
- [ ] User registration works
- [ ] Login/logout works
- [ ] Product browsing works
- [ ] Cart operations work
- [ ] Checkout flow completes
- [ ] Payment integration works
- [ ] Seller dashboard accessible
- [ ] Admin panel works
- [ ] Chat system functional
- [ ] Mobile responsive
- [ ] Performance acceptable

---

## 📈 Performance Optimization

### Build Optimization

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        }
      }
    }
  }
}
```

### Image Optimization

- Use WebP format
- Implement lazy loading
- Use CDN for images (Cloudflare, Cloudinary)

### Caching Strategy

```javascript
// Add caching headers
app.use('*', async (c, next) => {
  await next()
  c.header('Cache-Control', 'public, max-age=3600')
})
```

---

## 🌐 Domain Configuration

### DNS Records

Add these records to your domain provider:

```
Type    Name    Value
A       @       76.76.21.21 (Vercel IP)
CNAME   www     cname.vercel-dns.com
```

### SSL Certificate

- Vercel: Auto SSL via Let's Encrypt
- Netlify: Auto SSL enabled
- Custom: Use Cloudflare SSL

---

## 📱 Progressive Web App (PWA)

Optional: Make UrTree a PWA

```javascript
// manifest.json
{
  "name": "UrTree Marketplace",
  "short_name": "UrTree",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#16a34a",
  "icons": [...]
}
```

---

## 🆘 Troubleshooting

### Common Issues

**1. Environment variables not working**
- Solution: Rebuild after adding env vars

**2. Supabase functions timeout**
- Solution: Increase timeout in Supabase settings

**3. CORS errors**
- Solution: Check Supabase CORS settings

**4. Build fails**
- Solution: Check TypeScript errors
  ```bash
  npm run type-check
  ```

---

## 📞 Support

Deployment issues? Check:
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [GitHub Issues](https://github.com/yourusername/UrTreeMarketplace/issues)

---

## ✅ Post-Deployment

After successful deployment:

1. **Test all features** in production
2. **Monitor errors** via Sentry/logs
3. **Check analytics** setup
4. **Verify SSL** certificate
5. **Test payment** integration
6. **Update documentation** with production URLs
7. **Announce launch** 🎉

---

**Production URL**: `https://www.urtree.com`

**Admin Panel**: `https://www.urtree.com` (login dengan admin account)

**API**: `https://your-project.supabase.co/functions/v1/make-server-0eb859c3`

---

🌱 Happy Deploying! 💚
