-- Fix Admin User Password
-- Run this in Supabase SQL Editor to ensure admin user exists with correct password

-- Update or insert admin user
INSERT INTO users (email, password_hash, name, role, is_email_verified, is_active, login_method, created_at, updated_at)
VALUES (
  'admin@urtree.id',
  'admin123', -- Password: admin123 (plain text, matching login comparison)
  'Admin UrTree',
  'admin',
  true,
  true,
  'email',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET 
  password_hash = 'admin123', -- Ensure password is correct
  role = 'admin',
  is_active = true,
  is_email_verified = true,
  updated_at = NOW();

-- Verify admin user
SELECT 
  email, 
  name, 
  role, 
  is_active, 
  is_email_verified,
  password_hash, -- Check password (should be 'admin123')
  created_at,
  updated_at
FROM users 
WHERE email = 'admin@urtree.id';





