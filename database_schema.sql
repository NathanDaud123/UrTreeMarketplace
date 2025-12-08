-- ============================================
-- UrTree Marketplace - Complete Database Schema
-- ============================================
-- Schema lengkap untuk marketplace tanaman dan berkebun
-- Support: Users, Products, Orders, Cart, Chat, Reviews, Payments, dll
-- ============================================

-- ============================================
-- 1. USERS & AUTHENTICATION
-- ============================================

-- Tabel utama untuk users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL, -- Hashed password (bcrypt)
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  has_pin BOOLEAN DEFAULT FALSE,
  pin_hash VARCHAR(255), -- Hashed PIN (bcrypt)
  google_id VARCHAR(255) UNIQUE, -- Untuk Google OAuth
  login_method VARCHAR(20) DEFAULT 'email' CHECK (login_method IN ('email', 'google')),
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- ============================================
-- 2. USER PROFILES & ADDRESSES
-- ============================================

-- Tabel untuk alamat user (bisa multiple addresses)
CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(50) NOT NULL, -- 'Rumah', 'Kantor', 'Alamat Utama', dll
  recipient_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  province VARCHAR(100),
  postal_code VARCHAR(10),
  is_default BOOLEAN DEFAULT FALSE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_default ON user_addresses(user_id, is_default) WHERE is_default = TRUE;

-- ============================================
-- 3. SELLER PROFILES & KYC
-- ============================================

-- Tabel untuk data seller (KYC & shop info)
CREATE TABLE IF NOT EXISTS seller_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  shop_name VARCHAR(255) NOT NULL,
  shop_description TEXT,
  shop_address TEXT,
  shop_city VARCHAR(100),
  shop_province VARCHAR(100),
  shop_postal_code VARCHAR(10),
  shop_phone VARCHAR(20),
  shop_email VARCHAR(255),
  shop_logo_url TEXT,
  shop_banner_url TEXT,
  seller_rating DECIMAL(3, 2) DEFAULT 0.0 CHECK (seller_rating >= 0 AND seller_rating <= 5),
  total_reviews INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  total_revenue DECIMAL(15, 2) DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- KYC Data
  identity_type VARCHAR(50), -- 'KTP', 'SIM', 'Passport'
  identity_number VARCHAR(50),
  identity_photo_url TEXT,
  bank_name VARCHAR(100),
  bank_account_number VARCHAR(50),
  bank_account_name VARCHAR(255),
  kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'rejected')),
  kyc_verified_at TIMESTAMPTZ,
  
  -- Location untuk delivery radius
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  max_delivery_radius INTEGER DEFAULT 50, -- dalam km
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seller_profiles_user_id ON seller_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_verified ON seller_profiles(is_verified, is_active);

-- ============================================
-- 4. PRODUCT CATEGORIES
-- ============================================

-- Tabel kategori produk
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL, -- 'tanaman-hidup', 'benih', 'peralatan'
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO product_categories (slug, name, description, sort_order) VALUES
  ('tanaman-hidup', 'Tanaman Hidup', 'Tanaman hias dan tanaman hidup lainnya', 1),
  ('benih', 'Benih', 'Benih sayuran, buah, dan tanaman', 2),
  ('peralatan', 'Peralatan & Media Tanam', 'Peralatan berkebun dan media tanam', 3)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 5. PRODUCTS
-- ============================================

-- Tabel produk utama
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES product_categories(id),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL, -- URL-friendly name
  description TEXT NOT NULL,
  short_description VARCHAR(500),
  price DECIMAL(12, 2) NOT NULL CHECK (price > 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sold INTEGER DEFAULT 0 CHECK (sold >= 0),
  rating DECIMAL(3, 2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  total_reviews INTEGER DEFAULT 0,
  weight_kg DECIMAL(8, 2), -- Untuk kalkulasi shipping
  dimensions_cm JSONB, -- {length, width, height}
  
  -- Khusus tanaman hidup
  plant_age VARCHAR(20), -- '<1thn', '1thn+', '3thn+'
  max_delivery_radius INTEGER, -- dalam km
  
  -- Status & visibility
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'inactive', 'out_of_stock', 'archived')),
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  tags TEXT[], -- Array of tags
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status, is_active);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING GIN(to_tsvector('indonesian', name || ' ' || COALESCE(description, '')));

-- ============================================
-- 6. PRODUCT IMAGES
-- ============================================

-- Tabel untuk gambar produk (multiple images per product)
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_primary ON product_images(product_id, is_primary) WHERE is_primary = TRUE;

-- ============================================
-- 7. SHOPPING CART
-- ============================================

-- Tabel shopping cart
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id) -- Satu user hanya bisa punya satu entry per product
);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- ============================================
-- 8. ORDERS
-- ============================================

-- Tabel orders utama
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL, -- Format: ORD-YYYYMMDD-XXXXX
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  
  -- Shipping address (snapshot saat checkout)
  shipping_name VARCHAR(255) NOT NULL,
  shipping_phone VARCHAR(20) NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city VARCHAR(100) NOT NULL,
  shipping_province VARCHAR(100),
  shipping_postal_code VARCHAR(10),
  shipping_latitude DECIMAL(10, 8),
  shipping_longitude DECIMAL(11, 8),
  
  -- Pricing
  subtotal DECIMAL(12, 2) NOT NULL,
  shipping_cost DECIMAL(12, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL,
  
  -- Payment
  payment_method VARCHAR(50) NOT NULL, -- 'cod', 'transfer', 'e-wallet', 'credit_card'
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'cod')),
  payment_provider VARCHAR(50), -- 'midtrans', 'manual', dll
  payment_transaction_id VARCHAR(255),
  payment_snap_token TEXT, -- Untuk Midtrans
  paid_at TIMESTAMPTZ,
  
  -- Order status
  status VARCHAR(20) DEFAULT 'pending_payment' CHECK (status IN (
    'pending_payment', 
    'pending', 
    'confirmed', 
    'processing', 
    'in_delivery', 
    'delivered', 
    'completed', 
    'cancelled', 
    'refunded'
  )),
  
  -- Delivery
  courier_name VARCHAR(100), -- 'JNE', 'J&T', 'Gojek', dll
  tracking_number VARCHAR(100),
  estimated_delivery_date DATE,
  delivered_at TIMESTAMPTZ,
  
  -- Notes
  buyer_notes TEXT,
  seller_notes TEXT,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ============================================
-- 9. ORDER ITEMS
-- ============================================

-- Tabel untuk items dalam order (bisa multiple products per order)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  
  -- Product snapshot (harga bisa berubah, jadi simpan snapshot)
  product_name VARCHAR(255) NOT NULL,
  product_image_url TEXT,
  product_price DECIMAL(12, 2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal DECIMAL(12, 2) NOT NULL, -- price * quantity
  
  -- Status per item (untuk multi-seller orders)
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_seller_id ON order_items(seller_id);

-- ============================================
-- 10. PAYMENTS & TRANSACTIONS
-- ============================================

-- Tabel untuk payment transactions (tracking payment history)
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  transaction_id VARCHAR(255) UNIQUE, -- ID dari payment gateway
  payment_method VARCHAR(50) NOT NULL,
  payment_provider VARCHAR(50), -- 'midtrans', 'manual', dll
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'IDR',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed', 'cancelled', 'refunded')),
  provider_response JSONB, -- Response dari payment gateway
  failure_reason TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);

-- ============================================
-- 11. CHAT CONVERSATIONS
-- ============================================

-- Tabel untuk chat conversations
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  -- Last message info untuk preview
  last_message_text TEXT,
  last_message_at TIMESTAMPTZ,
  unread_count_buyer INTEGER DEFAULT 0,
  unread_count_seller INTEGER DEFAULT 0,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(buyer_id, seller_id, product_id) -- Satu conversation per buyer-seller-product
);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_buyer_id ON chat_conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_seller_id ON chat_conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_product_id ON chat_conversations(product_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_last_message ON chat_conversations(last_message_at DESC);

-- ============================================
-- 12. CHAT MESSAGES
-- ============================================

-- Tabel untuk chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  attachment_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- ============================================
-- 13. PRODUCT REVIEWS
-- ============================================

-- Tabel untuk product reviews
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL, -- Link ke order (verified purchase)
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  review_text TEXT NOT NULL,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_helpful_count INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  
  -- Review images
  images TEXT[], -- Array of image URLs
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(order_id, user_id) -- Satu review per order per user
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_order_id ON product_reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(product_id, rating);

-- ============================================
-- 14. NOTIFICATIONS
-- ============================================

-- Tabel untuk notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'order_placed', 'order_status', 'message', 'review', dll
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT, -- URL untuk redirect
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  metadata JSONB, -- Additional data
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================
-- 15. COUPONS & DISCOUNTS (Optional)
-- ============================================

-- Tabel untuk coupons/discount codes
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_purchase_amount DECIMAL(12, 2) DEFAULT 0,
  max_discount_amount DECIMAL(12, 2),
  usage_limit INTEGER, -- Total usage limit
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active, valid_from, valid_until);

-- ============================================
-- 16. WISHLIST (Optional)
-- ============================================

-- Tabel untuk wishlist
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON wishlists(product_id);

-- ============================================
-- 17. FUNCTIONS & TRIGGERS
-- ============================================

-- Function untuk update updated_at otomatis
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers untuk auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seller_profiles_updated_at BEFORE UPDATE ON seller_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function untuk generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
      LPAD(NEXTVAL('order_number_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sequence untuk order number
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Trigger untuk auto-generate order number
CREATE TRIGGER generate_order_number_trigger BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Function untuk update product rating setelah review
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET 
    rating = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM product_reviews
      WHERE product_id = NEW.product_id AND is_visible = TRUE
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM product_reviews
      WHERE product_id = NEW.product_id AND is_visible = TRUE
    )
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk update rating
CREATE TRIGGER update_product_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- ============================================
-- 18. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS untuk semua tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Policy untuk service role (full access untuk backend)
CREATE POLICY "Service role full access" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON user_addresses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON seller_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON product_images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON cart_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON payment_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON chat_conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON chat_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON product_reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON wishlists FOR ALL USING (true) WITH CHECK (true);

-- Policy untuk anon/public (read-only untuk products yang active)
CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (status = 'active' AND is_active = TRUE);

CREATE POLICY "Public can view product images" ON product_images
  FOR SELECT USING (true);

CREATE POLICY "Public can view product categories" ON product_categories
  FOR SELECT USING (is_active = TRUE);

-- ============================================
-- 19. VIEWS (Optional - untuk reporting)
-- ============================================

-- View untuk order summary
CREATE OR REPLACE VIEW order_summary AS
SELECT 
  o.id,
  o.order_number,
  o.buyer_id,
  u.name as buyer_name,
  o.status,
  o.payment_status,
  o.total_amount,
  o.created_at,
  COUNT(oi.id) as item_count,
  STRING_AGG(p.name, ', ') as product_names
FROM orders o
JOIN users u ON o.buyer_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id
GROUP BY o.id, o.order_number, o.buyer_id, u.name, o.status, o.payment_status, o.total_amount, o.created_at;

-- View untuk seller statistics
CREATE OR REPLACE VIEW seller_stats AS
SELECT 
  sp.user_id,
  sp.shop_name,
  COUNT(DISTINCT p.id) as total_products,
  COUNT(DISTINCT oi.order_id) as total_orders,
  SUM(oi.subtotal) as total_revenue,
  AVG(pr.rating) as avg_rating,
  COUNT(DISTINCT pr.id) as total_reviews
FROM seller_profiles sp
LEFT JOIN products p ON sp.user_id = p.seller_id
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN product_reviews pr ON p.id = pr.product_id
GROUP BY sp.user_id, sp.shop_name;

-- ============================================
-- END OF SCHEMA
-- ============================================

-- Notes:
-- 1. Semua tables menggunakan UUID sebagai primary key untuk security
-- 2. Timestamps menggunakan TIMESTAMPTZ untuk timezone support
-- 3. Indexes sudah dibuat untuk performa query
-- 4. RLS enabled untuk security (service role punya full access)
-- 5. Triggers untuk auto-update timestamps dan calculate ratings
-- 6. Foreign keys dengan ON DELETE CASCADE/SET NULL untuk data integrity

