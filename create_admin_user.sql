-- Create admin user for UrTree Marketplace
-- This script creates an admin user if it doesn't exist

-- Insert admin user (if not exists)
-- Password: admin123 (stored as plain text for now, will be hashed in production)
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
  password_hash = 'admin123', -- Update password to ensure it's correct
  role = 'admin',
  is_active = true,
  updated_at = NOW();

-- Verify admin user was created
SELECT email, name, role, is_active, created_at 
FROM users 
WHERE email = 'admin@urtree.id';

