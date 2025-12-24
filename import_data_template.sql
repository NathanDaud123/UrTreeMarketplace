-- ============================================
-- Template untuk Import Data ke Supabase Baru
-- ============================================
-- Ganti data di bawah dengan data yang sudah di-export
-- Pastikan UUID tetap sama untuk menjaga foreign key
-- ============================================

-- IMPORT PENTING: Import sesuai urutan untuk menjaga foreign key constraints

-- 1. Import Users (harus pertama karena banyak tabel reference ke users)
INSERT INTO users (
  id, email, password_hash, name, phone, avatar_url, role,
  is_email_verified, is_active, has_pin, pin_hash, google_id,
  login_method, last_login_at, created_at, updated_at
)
VALUES
  -- Ganti dengan data yang sudah di-export
  ('uuid-here', 'email@example.com', 'password_hash', 'Name', '081234567890', NULL, 'buyer', 
   true, true, false, NULL, NULL, 'email', NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Import User Addresses
INSERT INTO user_addresses (
  id, user_id, label, recipient_name, phone, address,
  city, province, postal_code, is_default, created_at, updated_at
)
VALUES
  -- Ganti dengan data yang sudah di-export
  ('uuid-here', 'user-uuid', 'Rumah', 'Name', '081234567890', 
   'Address', 'City', 'Province', '12345', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. Import Product Categories (harus sebelum products)
INSERT INTO product_categories (
  id, name, slug, description, image_url, parent_id,
  sort_order, is_active, created_at, updated_at
)
VALUES
  -- Ganti dengan data yang sudah di-export
  ('uuid-here', 'Category Name', 'category-slug', 'Description', NULL, NULL,
   1, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. Import Seller Profiles
INSERT INTO seller_profiles (
  id, user_id, shop_name, shop_description, shop_address, shop_city,
  shop_province, shop_postal_code, shop_phone, shop_email,
  bank_name, bank_account_number, bank_account_name,
  e_wallet_types, e_wallet_phone, kyc_status, created_at, updated_at
)
VALUES
  -- Ganti dengan data yang sudah di-export
  ('uuid-here', 'user-uuid', 'Shop Name', 'Description', 'Address', 'City',
   'Province', '12345', '081234567890', 'shop@example.com',
   'Bank Name', '12345678', 'Account Name',
   ARRAY['dana', 'ovo'], '081234567890', 'approved', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 5. Import Products
INSERT INTO products (
  id, seller_id, category_id, name, slug, description, price,
  stock, sold, rating, total_reviews, plant_age, max_delivery_radius,
  status, is_active, published_at, created_at, updated_at
)
VALUES
  -- Ganti dengan data yang sudah di-export
  ('uuid-here', 'seller-user-uuid', 'category-uuid', 'Product Name', 'product-slug',
   'Description', 100000, 10, 0, 0, 0, NULL, NULL, 'active', true, NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 6. Import Product Images
INSERT INTO product_images (
  id, product_id, image_url, alt_text, sort_order, is_primary, created_at
)
VALUES
  -- Ganti dengan data yang sudah di-export
  ('uuid-here', 'product-uuid', 'https://example.com/image.jpg', 'Alt text', 0, true, NOW())
ON CONFLICT (id) DO NOTHING;

-- 7. Import Orders
INSERT INTO orders (
  id, order_number, buyer_id, total_amount, shipping_cost,
  payment_method, payment_status, payment_proof_url, status,
  shipping_address, shipping_city, shipping_province, shipping_postal_code,
  tracking_number, estimated_delivery_date, created_at, updated_at
)
VALUES
  -- Ganti dengan data yang sudah di-export
  ('uuid-here', 'ORD-123456', 'buyer-uuid', 150000, 15000,
   'cod', 'cod', NULL, 'confirmed',
   'Address', 'City', 'Province', '12345',
   NULL, NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 8. Import Order Items
INSERT INTO order_items (
  id, order_id, product_id, seller_id, product_name,
  product_image_url, quantity, product_price, created_at
)
VALUES
  -- Ganti dengan data yang sudah di-export
  ('uuid-here', 'order-uuid', 'product-uuid', 'seller-uuid', 'Product Name',
   'https://example.com/image.jpg', 1, 100000, NOW())
ON CONFLICT (id) DO NOTHING;

-- 9. Import Cart Items
INSERT INTO cart_items (
  id, user_id, product_id, quantity, created_at, updated_at
)
VALUES
  -- Ganti dengan data yang sudah di-export
  ('uuid-here', 'user-uuid', 'product-uuid', 1, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 10. Import Chat Conversations
INSERT INTO chat_conversations (
  id, buyer_id, seller_id, product_id, order_id,
  last_message_at, unread_count_buyer, unread_count_seller,
  is_active, created_at, updated_at
)
VALUES
  -- Ganti dengan data yang sudah di-export
  ('uuid-here', 'buyer-uuid', 'seller-uuid', 'product-uuid', NULL,
   NOW(), 0, 0, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 11. Import Chat Messages
INSERT INTO chat_messages (
  id, conversation_id, sender_id, message_text, is_read, created_at
)
VALUES
  -- Ganti dengan data yang sudah di-export
  ('uuid-here', 'conversation-uuid', 'sender-uuid', 'Message text', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 12. Import Product Reviews
INSERT INTO product_reviews (
  id, product_id, order_id, user_id, rating,
  title, review_text, is_verified_purchase, created_at, updated_at
)
VALUES
  -- Ganti dengan data yang sudah di-export
  ('uuid-here', 'product-uuid', 'order-uuid', 'user-uuid', 5,
   'Review Title', 'Review text', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- CATATAN PENTING:
-- ============================================
-- 1. Ganti semua 'uuid-here' dengan UUID yang sebenarnya dari export
-- 2. Pastikan UUID tetap sama untuk menjaga foreign key
-- 3. Import sesuai urutan (users → categories → sellers → products → orders → dll)
-- 4. Gunakan ON CONFLICT DO NOTHING untuk menghindari duplicate
-- 5. Atau gunakan ON CONFLICT DO UPDATE jika ingin update data yang sudah ada
-- ============================================

