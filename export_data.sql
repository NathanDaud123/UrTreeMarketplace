-- ============================================
-- Script untuk Export Data dari Supabase
-- ============================================
-- Jalankan query ini di SQL Editor Supabase project LAMA
-- Copy hasil query dan simpan untuk import ke project baru
-- ============================================

-- 1. Export Users
-- Copy hasil query ini dan simpan sebagai users.csv atau users.json
SELECT 
  id,
  email,
  password_hash,
  name,
  phone,
  avatar_url,
  role,
  is_email_verified,
  is_active,
  has_pin,
  pin_hash,
  google_id,
  login_method,
  last_login_at,
  created_at,
  updated_at
FROM users
ORDER BY created_at;

-- 2. Export User Addresses
SELECT 
  id,
  user_id,
  label,
  recipient_name,
  phone,
  address,
  city,
  province,
  postal_code,
  is_default,
  created_at,
  updated_at
FROM user_addresses
ORDER BY user_id, created_at;

-- 3. Export Seller Profiles
SELECT 
  id,
  user_id,
  shop_name,
  shop_description,
  shop_address,
  shop_city,
  shop_province,
  shop_postal_code,
  shop_phone,
  shop_email,
  shop_logo_url,
  shop_banner_url,
  seller_rating,
  total_reviews,
  total_sales,
  total_revenue,
  is_verified,
  is_active,
  identity_type,
  identity_number,
  identity_photo_url,
  bank_name,
  bank_account_number,
  bank_account_name,
  e_wallet_types,
  e_wallet_phone,
  kyc_status,
  kyc_verified_at,
  latitude,
  longitude,
  max_delivery_radius,
  created_at,
  updated_at
FROM seller_profiles
ORDER BY created_at;

-- 4. Export Product Categories
SELECT 
  id,
  name,
  slug,
  description,
  image_url,
  parent_id,
  sort_order,
  is_active,
  created_at,
  updated_at
FROM product_categories
ORDER BY sort_order, name;

-- 5. Export Products
SELECT 
  id,
  seller_id,
  category_id,
  name,
  slug,
  description,
  price,
  stock,
  sold,
  rating,
  total_reviews,
  plant_age,
  max_delivery_radius,
  status,
  is_active,
  published_at,
  created_at,
  updated_at
FROM products
ORDER BY created_at;

-- 6. Export Product Images
SELECT 
  id,
  product_id,
  image_url,
  alt_text,
  sort_order,
  is_primary,
  created_at
FROM product_images
ORDER BY product_id, sort_order;

-- 7. Export Orders
SELECT 
  id,
  order_number,
  buyer_id,
  total_amount,
  shipping_cost,
  payment_method,
  payment_status,
  payment_snap_token,
  payment_proof_url,
  status,
  shipping_address,
  shipping_city,
  shipping_province,
  shipping_postal_code,
  tracking_number,
  estimated_delivery_date,
  paid_at,
  delivered_at,
  cancelled_at,
  created_at,
  updated_at
FROM orders
ORDER BY created_at;

-- 8. Export Order Items
SELECT 
  id,
  order_id,
  product_id,
  seller_id,
  product_name,
  product_image_url,
  quantity,
  product_price,
  created_at
FROM order_items
ORDER BY order_id, created_at;

-- 9. Export Cart Items
SELECT 
  id,
  user_id,
  product_id,
  quantity,
  created_at,
  updated_at
FROM cart_items
ORDER BY user_id, created_at;

-- 10. Export Chat Conversations
SELECT 
  id,
  buyer_id,
  seller_id,
  product_id,
  order_id,
  last_message_at,
  unread_count_buyer,
  unread_count_seller,
  is_active,
  created_at,
  updated_at
FROM chat_conversations
ORDER BY last_message_at DESC;

-- 11. Export Chat Messages
SELECT 
  id,
  conversation_id,
  sender_id,
  message_text,
  is_read,
  created_at
FROM chat_messages
ORDER BY conversation_id, created_at;

-- 12. Export Product Reviews
SELECT 
  id,
  product_id,
  order_id,
  user_id,
  rating,
  title,
  review_text,
  is_verified_purchase,
  created_at,
  updated_at
FROM product_reviews
ORDER BY created_at DESC;

-- ============================================
-- CATATAN PENTING:
-- ============================================
-- 1. Export data sesuai urutan di atas (users dulu, baru tabel lain)
-- 2. Simpan hasil query sebagai CSV atau JSON
-- 3. Pastikan UUID tetap sama saat import (untuk menjaga foreign key)
-- 4. Import ke project baru sesuai urutan yang sama
-- ============================================

