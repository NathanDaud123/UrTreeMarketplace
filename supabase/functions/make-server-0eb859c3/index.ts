import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

// Initialize Supabase client for database operations
const getSupabaseClient = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
};

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// ==================== HEALTH CHECK ====================
app.get("/make-server-0eb859c3/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== USER ROUTES ====================

// Register new user
app.post("/make-server-0eb859c3/users/register", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    const supabase = getSupabaseClient();
    
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    
    if (existingUser) {
      return c.json({ error: "User already exists" }, 400);
    }

    // Check if admin email
    const adminEmails = ['admin@urtree.id', 'admin@urtree.com', 'admin@admin.com'];
    const isAdmin = adminEmails.includes(email.toLowerCase());

    // Hash password (simple hash for now, in production use bcrypt)
    // For now, we'll store it as-is but mark it for hashing later
    const password_hash = password; // TODO: Hash with bcrypt in production

    // Insert new user
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        email,
        name,
        password_hash,
        role: isAdmin ? 'admin' : 'buyer',
        login_method: 'email',
        is_email_verified: false,
        is_active: true
      })
      .select()
      .single();

    if (insertError) {
      console.log("Error inserting user:", insertError);
      return c.json({ error: "Failed to register user: " + insertError.message }, 500);
    }
    
    // Remove password_hash from response
    const { password_hash: _, ...userWithoutPassword } = newUser;
    return c.json({ user: userWithoutPassword }, 201);
  } catch (error: any) {
    console.log("Error registering user:", error);
    return c.json({ error: "Failed to register user: " + (error.message || "Unknown error") }, 500);
  }
});

// Login user
app.post("/make-server-0eb859c3/users/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    const supabase = getSupabaseClient();
    
    // Get user from database
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    
    if (error || !user) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    // Check password (simple comparison for now, in production use bcrypt)
    if (user.password_hash !== password) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    // Update last_login_at
    await supabase
      .from("users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("email", email);

    // Remove password_hash from response
    const { password_hash: _, ...userWithoutPassword } = user;
    return c.json({ user: userWithoutPassword });
  } catch (error: any) {
    console.log("Error logging in:", error);
    return c.json({ error: "Failed to login: " + (error.message || "Unknown error") }, 500);
  }
});

// Google OAuth Login (Mock/Demo Implementation)
app.post("/make-server-0eb859c3/users/google-login", async (c) => {
  try {
    // DEMO/MOCK IMPLEMENTATION
    // This simulates Google OAuth login without requiring actual Google OAuth setup
    // For production, replace this with actual OAuth verification
    
    // Simulate getting Google user info
    // In real implementation, this would come from Google OAuth callback
    const mockGoogleUsers = [
      {
        email: 'google.user@gmail.com',
        name: 'Google User',
        picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
        googleId: 'google-' + Date.now()
      }
    ];
    
    // Use first mock user (or you can make this random)
    const googleUserInfo = mockGoogleUsers[0];
    const supabase = getSupabaseClient();
    
    // Check if user already exists in database
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", googleUserInfo.email)
      .maybeSingle();
    
    let user;
    if (!existingUser) {
      // Create new user from Google data
      const adminEmails = ['admin@urtree.id', 'admin@urtree.com', 'admin@admin.com'];
      const isAdmin = adminEmails.includes(googleUserInfo.email.toLowerCase());
      
      // Insert new user
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          email: googleUserInfo.email,
          name: googleUserInfo.name,
          password_hash: 'google-oauth-' + Date.now(), // Auto-generated, user won't use this
          role: isAdmin ? 'admin' : 'buyer',
          google_id: googleUserInfo.googleId,
          avatar_url: googleUserInfo.picture,
          login_method: 'google',
          is_email_verified: true, // Google users are verified
          is_active: true
        })
        .select()
        .single();
      
      if (insertError) {
        console.log("Error creating Google user:", insertError);
        return c.json({ error: "Failed to create user: " + insertError.message }, 500);
      }
      
      user = newUser;
      console.log(`New Google user created: ${googleUserInfo.email}`);
    } else {
      // Update last login for existing user
      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({ 
          last_login_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("email", googleUserInfo.email)
        .select()
        .single();
      
      if (updateError) {
        console.log("Error updating Google user:", updateError);
        user = existingUser; // Use existing user data
      } else {
        user = updatedUser;
      }
      console.log(`Existing Google user logged in: ${googleUserInfo.email}`);
    }
    
    // Remove password_hash from response
    const { password_hash: _, ...userWithoutPassword } = user;
    return c.json({ 
      user: userWithoutPassword,
      message: 'Demo: Google Sign-In successful! (Using mock implementation)'
    });
    
    /* 
    ============================================================
    PRODUCTION IMPLEMENTATION (when Google OAuth is configured):
    ============================================================
    
    const { idToken } = await c.req.json();
    
    // Verify token with Google
    const googleUser = await verifyGoogleIdToken(idToken);
    
    if (!googleUser) {
      return c.json({ error: "Invalid Google token" }, 401);
    }
    
    // Check if user exists
    const supabase = getSupabaseClient();
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", googleUser.email)
      .maybeSingle();
    
    let user;
    if (!existingUser) {
      // Create new user from Google data
      const adminEmails = ['admin@urtree.id', 'admin@urtree.com'];
      const isAdmin = adminEmails.includes(googleUser.email.toLowerCase());
      
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          email: googleUser.email,
          name: googleUser.name,
          password_hash: 'google-oauth-' + Date.now(),
          role: isAdmin ? 'admin' : 'buyer',
          google_id: googleUser.sub,
          avatar_url: googleUser.picture,
          login_method: 'google',
          is_email_verified: true,
          is_active: true
        })
        .select()
        .single();
      
      if (insertError) {
        return c.json({ error: "Failed to create user: " + insertError.message }, 500);
      }
      user = newUser;
    } else {
      user = existingUser;
    }
    
    const { password_hash: _, ...userWithoutPassword } = user;
    return c.json({ user: userWithoutPassword });
    */
  } catch (error) {
    console.log("Error with Google login:", error);
    return c.json({ error: "Failed to login with Google" }, 500);
  }
});

// Get user by email
app.get("/make-server-0eb859c3/users/:email", async (c) => {
  try {
    const email = decodeURIComponent(c.req.param("email"));
    const supabase = getSupabaseClient();
    
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    
    if (error || !user) {
      return c.json({ error: "User not found" }, 404);
    }
    
    // Get default address if exists
    const { data: defaultAddress } = await supabase
      .from("user_addresses")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .maybeSingle();
    
    // Add address data to response if exists
    let responseUser: any = { ...user };
    if (defaultAddress) {
      responseUser.address = defaultAddress.address;
      responseUser.city = defaultAddress.city;
    }
    
    // Remove password_hash from response
    const { password_hash: _, ...userWithoutPassword } = responseUser;
    return c.json({ user: userWithoutPassword });
  } catch (error: any) {
    console.log("Error fetching user:", error);
    return c.json({ error: "Failed to fetch user: " + (error.message || "Unknown error") }, 500);
  }
});

// Update user profile
app.put("/make-server-0eb859c3/users/:email", async (c) => {
  try {
    const email = decodeURIComponent(c.req.param("email"));
    const updates = await c.req.json();
    const supabase = getSupabaseClient();
    
    console.log(`Updating user: ${email}`, { updates });
    
    // Check if user exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    
    if (!existingUser) {
      console.log(`User not found: ${email}`);
      return c.json({ error: "User not found" }, 404);
    }

    console.log(`User found, updating...`, { existingUser: { email: existingUser.email, name: existingUser.name } });
    
    // Map updates to database schema
    const dbUpdates: any = {
      updated_at: new Date().toISOString()
    };
    
    // Map common fields
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.avatar !== undefined || updates.avatar_url !== undefined) {
      dbUpdates.avatar_url = updates.avatar || updates.avatar_url;
    }
    if (updates.googleId !== undefined) dbUpdates.google_id = updates.googleId;
    if (updates.loginMethod !== undefined) dbUpdates.login_method = updates.loginMethod;
    if (updates.role !== undefined) dbUpdates.role = updates.role;
    
    // Update user in database
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update(dbUpdates)
      .eq("email", email)
      .select()
      .single();
    
    if (updateError) {
      console.log("Error updating user:", updateError);
      return c.json({ error: "Failed to update user: " + updateError.message }, 500);
    }
    
    // Handle address and city - save to user_addresses table
    if (updates.address !== undefined || updates.city !== undefined) {
      const userId = updatedUser.id;
      
      // Check if default address already exists
      const { data: existingAddress } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", userId)
        .eq("is_default", true)
        .maybeSingle();
      
      const addressData: any = {
        user_id: userId,
        label: 'Alamat Utama',
        recipient_name: updatedUser.name,
        phone: updatedUser.phone || '',
        address: updates.address !== undefined ? updates.address : (existingAddress?.address || ''),
        city: updates.city !== undefined ? updates.city : (existingAddress?.city || ''),
        is_default: true,
        updated_at: new Date().toISOString()
      };
      
      if (existingAddress) {
        // Update existing default address
        const { error: addressError } = await supabase
          .from("user_addresses")
          .update(addressData)
          .eq("id", existingAddress.id);
        
        if (addressError) {
          console.log("Error updating address:", addressError);
          // Don't fail the whole request if address update fails
        } else {
          console.log(`Address updated for user: ${email}`);
        }
      } else {
        // Create new default address
        addressData.created_at = new Date().toISOString();
        const { error: addressError } = await supabase
          .from("user_addresses")
          .insert(addressData);
        
        if (addressError) {
          console.log("Error creating address:", addressError);
          // Don't fail the whole request if address creation fails
        } else {
          console.log(`Address created for user: ${email}`);
        }
      }
    }
    
    console.log(`User updated successfully: ${email}`);
    
    // Get default address for response
    const { data: defaultAddress } = await supabase
      .from("user_addresses")
      .select("*")
      .eq("user_id", updatedUser.id)
      .eq("is_default", true)
      .maybeSingle();
    
    // Add address data to response if exists
    let responseUser: any = { ...updatedUser };
    if (defaultAddress) {
      responseUser.address = defaultAddress.address;
      responseUser.city = defaultAddress.city;
    }
    
    // Remove password_hash from response
    const { password_hash: _, ...userWithoutPassword } = responseUser;
    return c.json({ user: userWithoutPassword });
  } catch (error: any) {
    console.log("Error updating user:", error);
    console.log("Error details:", { message: error.message, stack: error.stack });
    return c.json({ error: "Failed to update user: " + (error.message || "Unknown error") }, 500);
  }
});

// Apply as seller / Seller registration
app.post("/make-server-0eb859c3/users/:email/apply-seller", async (c) => {
  try {
    const email = decodeURIComponent(c.req.param("email"));
    const sellerData = await c.req.json();
    const supabase = getSupabaseClient();
    
    // Get user from database
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    
    if (userError || !user) {
      return c.json({ error: "User not found" }, 404);
    }

    // Check if seller profile already exists
    const { data: existingProfile } = await supabase
      .from("seller_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const profileData: any = {
      user_id: user.id,
      shop_name: sellerData.shopName,
      shop_description: sellerData.shopDescription,
      shop_address: sellerData.shopAddress || sellerData.address,
      shop_city: sellerData.shopCity || sellerData.city,
      shop_phone: sellerData.phone || user.phone,
      identity_type: sellerData.identityType || 'KTP',
      identity_number: sellerData.identityNumber || sellerData.kycKtpNumber,
      identity_photo_url: sellerData.identityPhoto || sellerData.kycKtpPhoto,
      bank_name: sellerData.bankName || sellerData.kycBankName,
      bank_account_number: sellerData.bankAccountNumber || sellerData.kycAccountNumber,
      bank_account_name: sellerData.bankAccountName || sellerData.kycAccountName,
      kyc_status: 'pending', // Status pending, menunggu approval admin
      updated_at: new Date().toISOString()
    };

    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from("seller_profiles")
        .update(profileData)
        .eq("user_id", user.id);
      
      if (updateError) {
        console.log("Error updating seller profile:", updateError);
        return c.json({ error: "Failed to update seller profile: " + updateError.message }, 500);
      }
    } else {
      // Create new seller profile
      profileData.created_at = new Date().toISOString();
      const { error: insertError } = await supabase
        .from("seller_profiles")
        .insert(profileData);
      
      if (insertError) {
        console.log("Error creating seller profile:", insertError);
        return c.json({ error: "Failed to create seller profile: " + insertError.message }, 500);
      }
    }

    // Update user to mark as pending seller (but keep role as buyer until approved)
    const { error: updateUserError } = await supabase
      .from("users")
      .update({ 
        updated_at: new Date().toISOString()
      })
      .eq("email", email);

    if (updateUserError) {
      console.log("Error updating user:", updateUserError);
      // Don't fail the whole request if user update fails
    }

    // Get updated user
    const { data: updatedUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    // Get default address for response
    const { data: defaultAddress } = await supabase
      .from("user_addresses")
      .select("*")
      .eq("user_id", updatedUser.id)
      .eq("is_default", true)
      .maybeSingle();

    let responseUser: any = { ...updatedUser, isPendingSeller: true };
    if (defaultAddress) {
      responseUser.address = defaultAddress.address;
      responseUser.city = defaultAddress.city;
    }
    
    // Remove password_hash from response
    const { password_hash: _, ...userWithoutPassword } = responseUser;
    return c.json({ user: userWithoutPassword });
  } catch (error: any) {
    console.log("Error applying as seller:", error);
    return c.json({ error: "Failed to apply as seller: " + (error.message || "Unknown error") }, 500);
  }
});

// Switch role (buyer <-> seller)
app.post("/make-server-0eb859c3/users/:email/switch-role", async (c) => {
  try {
    const email = c.req.param("email");
    const { newRole } = await c.req.json();
    
    const user = await kv.get(`user:${email}`);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    if (newRole === 'seller' && !user.hasSellerAccount) {
      return c.json({ error: "User does not have seller account" }, 400);
    }

    const updatedUser = { ...user, role: newRole };
    await kv.set(`user:${email}`, updatedUser);
    
    const { password: _, ...userWithoutPassword } = updatedUser;
    return c.json({ user: userWithoutPassword });
  } catch (error) {
    console.log("Error switching role:", error);
    return c.json({ error: "Failed to switch role" }, 500);
  }
});

// Set PIN for user
app.post("/make-server-0eb859c3/users/:email/set-pin", async (c) => {
  try {
    const email = c.req.param("email");
    const { pin } = await c.req.json();
    
    // Validate PIN
    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      return c.json({ error: "PIN must be 6 digits" }, 400);
    }
    
    const user = await kv.get(`user:${email}`);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // In production, hash the PIN!
    const updatedUser = { ...user, pin, hasPin: true };
    await kv.set(`user:${email}`, updatedUser);
    
    return c.json({ success: true });
  } catch (error) {
    console.log("Error setting PIN:", error);
    return c.json({ error: "Failed to set PIN" }, 500);
  }
});

// Verify PIN
app.post("/make-server-0eb859c3/users/:email/verify-pin", async (c) => {
  try {
    const email = c.req.param("email");
    const { pin } = await c.req.json();
    
    const user = await kv.get(`user:${email}`);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    if (!user.hasPin || !user.pin) {
      return c.json({ valid: false, error: "No PIN set" }, 400);
    }

    // In production, use secure PIN comparison
    const valid = user.pin === pin;
    return c.json({ valid });
  } catch (error) {
    console.log("Error verifying PIN:", error);
    return c.json({ error: "Failed to verify PIN" }, 500);
  }
});

// Change PIN
app.post("/make-server-0eb859c3/users/:email/change-pin", async (c) => {
  try {
    const email = c.req.param("email");
    const { newPin } = await c.req.json();
    
    // Validate PIN
    if (!newPin || newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      return c.json({ error: "PIN must be 6 digits" }, 400);
    }
    
    const user = await kv.get(`user:${email}`);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // In production, hash the PIN!
    const updatedUser = { ...user, pin: newPin };
    await kv.set(`user:${email}`, updatedUser);
    
    return c.json({ success: true });
  } catch (error) {
    console.log("Error changing PIN:", error);
    return c.json({ error: "Failed to change PIN" }, 500);
  }
});

// ==================== PRODUCT ROUTES ====================

// Get all products or filter by category/search
app.get("/make-server-0eb859c3/products", async (c) => {
  try {
    const category = c.req.query("category");
    const search = c.req.query("search");
    
    const productKeys = await kv.getByPrefix("product:");
    const products = productKeys || [];
    
    let filteredProducts = products;
    
    if (category) {
      filteredProducts = filteredProducts.filter((p: any) => p.category === category);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter((p: any) => 
        p.name.toLowerCase().includes(searchLower) || 
        p.description.toLowerCase().includes(searchLower)
      );
    }
    
    return c.json({ products: filteredProducts });
  } catch (error) {
    console.log("Error fetching products:", error);
    return c.json({ error: "Failed to fetch products" }, 500);
  }
});

// Get product by ID
app.get("/make-server-0eb859c3/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const product = await kv.get(`product:${id}`);
    
    if (!product) {
      return c.json({ error: "Product not found" }, 404);
    }
    
    return c.json({ product });
  } catch (error) {
    console.log("Error fetching product:", error);
    return c.json({ error: "Failed to fetch product" }, 500);
  }
});

// Get products by seller
app.get("/make-server-0eb859c3/products/seller/:sellerId", async (c) => {
  try {
    const sellerId = c.req.param("sellerId");
    const productKeys = await kv.getByPrefix("product:");
    const products = (productKeys || []).filter((p: any) => p.sellerId === sellerId);
    
    return c.json({ products });
  } catch (error) {
    console.log("Error fetching seller products:", error);
    return c.json({ error: "Failed to fetch seller products" }, 500);
  }
});

// Create product
app.post("/make-server-0eb859c3/products", async (c) => {
  try {
    const productData = await c.req.json();
    
    console.log("Creating product with data:", {
      name: productData.name,
      category: productData.category,
      price: productData.price,
      stock: productData.stock,
      sellerId: productData.sellerId,
      imagesCount: productData.images?.length || 0
    });
    
    // Validate required fields
    if (!productData.name || !productData.price || !productData.stock || !productData.category) {
      console.log("Validation failed: Missing required fields");
      return c.json({ error: "Missing required fields" }, 400);
    }
    
    if (!productData.sellerId) {
      console.log("Validation failed: Missing sellerId");
      return c.json({ error: "Seller ID is required" }, 400);
    }
    
    const productId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const product = {
      id: productId,
      ...productData,
      sold: 0,
      rating: 0,
      reviews: 0,
      createdAt: new Date().toISOString(),
    };
    
    console.log("Saving product to KV store with ID:", productId);
    await kv.set(`product:${productId}`, product);
    console.log("Product saved successfully:", productId);
    
    return c.json({ product }, 201);
  } catch (error: any) {
    console.log("Error creating product:", error);
    console.log("Error details:", {
      message: error.message,
      stack: error.stack
    });
    return c.json({ error: error.message || "Failed to create product" }, 500);
  }
});

// Update product
app.put("/make-server-0eb859c3/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    const product = await kv.get(`product:${id}`);
    if (!product) {
      return c.json({ error: "Product not found" }, 404);
    }
    
    const updatedProduct = { 
      ...product, 
      ...updates, 
      id, // Keep ID unchanged
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`product:${id}`, updatedProduct);
    
    return c.json({ product: updatedProduct });
  } catch (error) {
    console.log("Error updating product:", error);
    return c.json({ error: "Failed to update product" }, 500);
  }
});

// Delete product
app.delete("/make-server-0eb859c3/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    const product = await kv.get(`product:${id}`);
    if (!product) {
      return c.json({ error: "Product not found" }, 404);
    }
    
    await kv.del(`product:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting product:", error);
    return c.json({ error: "Failed to delete product" }, 500);
  }
});

// ==================== CART ROUTES ====================

// Get cart for user
app.get("/make-server-0eb859c3/cart/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const cart = await kv.get(`cart:${userId}`) || [];
    
    return c.json({ cart });
  } catch (error) {
    console.log("Error fetching cart:", error);
    return c.json({ error: "Failed to fetch cart" }, 500);
  }
});

// Update cart
app.put("/make-server-0eb859c3/cart/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const { cart } = await c.req.json();
    
    await kv.set(`cart:${userId}`, cart);
    return c.json({ cart });
  } catch (error) {
    console.log("Error updating cart:", error);
    return c.json({ error: "Failed to update cart" }, 500);
  }
});

// Clear cart
app.delete("/make-server-0eb859c3/cart/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    await kv.set(`cart:${userId}`, []);
    
    return c.json({ success: true });
  } catch (error) {
    console.log("Error clearing cart:", error);
    return c.json({ error: "Failed to clear cart" }, 500);
  }
});

// ==================== ORDER ROUTES ====================

// Create order and get Midtrans Snap Token (checkout)
app.post("/make-server-0eb859c3/orders", async (c) => {
  try {
    const orderData = await c.req.json();
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const order = {
      id: orderId,
      ...orderData,
      status: 'pending_payment',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    // Save order to database
    await kv.set(`order:${orderId}`, order);
    
    // For COD, skip Midtrans and mark as confirmed
    if (orderData.paymentMethod === 'cod') {
      order.status = 'pending';
      order.paymentStatus = 'cod';
      await kv.set(`order:${orderId}`, order);
      
      // Update product sold count and stock
      for (const item of orderData.items) {
        const product = await kv.get(`product:${item.productId}`);
        if (product) {
          const updatedProduct = {
            ...product,
            sold: (product.sold || 0) + item.quantity,
            stock: (product.stock || 0) - item.quantity,
          };
          await kv.set(`product:${item.productId}`, updatedProduct);
        }
      }
      
      return c.json({ order, snapToken: null }, 201);
    }
    
    // For online payments, create Midtrans Snap Token
    try {
      const midtransServerKey = Deno.env.get('MIDTRANS_SERVER_KEY');
      
      if (!midtransServerKey) {
        console.log('Warning: MIDTRANS_SERVER_KEY not configured, skipping payment gateway');
        order.status = 'pending';
        order.paymentStatus = 'manual';
        await kv.set(`order:${orderId}`, order);
        return c.json({ order, snapToken: null, warning: 'Payment gateway not configured' }, 201);
      }
      
      const authString = btoa(midtransServerKey + ':');
      
      // Prepare transaction data for Midtrans
      const transaction = {
        transaction_details: {
          order_id: orderId,
          gross_amount: orderData.total,
        },
        customer_details: {
          first_name: orderData.shippingAddress.name,
          email: orderData.buyerEmail || 'buyer@urtree.com',
          phone: orderData.shippingAddress.phone,
          shipping_address: {
            first_name: orderData.shippingAddress.name,
            phone: orderData.shippingAddress.phone,
            address: orderData.shippingAddress.address,
            city: orderData.shippingAddress.city,
            country_code: 'IDN',
          },
        },
        item_details: orderData.items.map((item: any) => ({
          id: item.productId,
          price: item.price,
          quantity: item.quantity,
          name: item.productName,
        })),
        callbacks: {
          finish: `${Deno.env.get('SUPABASE_URL')}/functions/v1/make-server-0eb859c3/payment-finish`,
        },
      };
      
      // Add shipping cost as item
      if (orderData.shippingCost > 0) {
        transaction.item_details.push({
          id: 'SHIPPING',
          price: orderData.shippingCost,
          quantity: 1,
          name: 'Biaya Pengiriman',
        });
      }
      
      // Request Snap Token from Midtrans
      const midtransUrl = midtransServerKey.startsWith('SB-') 
        ? 'https://app.sandbox.midtrans.com/snap/v1/transactions'
        : 'https://app.midtrans.com/snap/v1/transactions';
        
      const midtransResponse = await fetch(midtransUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Basic ${authString}`,
        },
        body: JSON.stringify(transaction),
      });
      
      if (!midtransResponse.ok) {
        const errorText = await midtransResponse.text();
        console.log('Midtrans API error:', errorText);
        throw new Error('Failed to create Midtrans transaction');
      }
      
      const midtransData = await midtransResponse.json();
      const snapToken = midtransData.token;
      
      // Update order with snap token
      order.snapToken = snapToken;
      await kv.set(`order:${orderId}`, order);
      
      console.log(`Snap token created for order ${orderId}`);
      return c.json({ order, snapToken }, 201);
      
    } catch (midtransError) {
      console.log('Midtrans integration error:', midtransError);
      // If Midtrans fails, still create order but without snap token
      order.status = 'pending';
      order.paymentStatus = 'manual';
      await kv.set(`order:${orderId}`, order);
      return c.json({ 
        order, 
        snapToken: null, 
        warning: 'Payment gateway error, order created but payment must be manual' 
      }, 201);
    }
  } catch (error) {
    console.log("Error creating order:", error);
    return c.json({ error: "Failed to create order" }, 500);
  }
});

// Get orders by buyer
app.get("/make-server-0eb859c3/orders/buyer/:buyerId", async (c) => {
  try {
    const buyerId = c.req.param("buyerId");
    const orderKeys = await kv.getByPrefix("order:");
    const orders = (orderKeys || []).filter((o: any) => o.buyerEmail === buyerId);
    
    return c.json({ orders });
  } catch (error) {
    console.log("Error fetching buyer orders:", error);
    return c.json({ error: "Failed to fetch buyer orders" }, 500);
  }
});

// Get orders by seller
app.get("/make-server-0eb859c3/orders/seller/:sellerId", async (c) => {
  try {
    const sellerId = c.req.param("sellerId");
    const orderKeys = await kv.getByPrefix("order:");
    const orders = (orderKeys || []).filter((o: any) => 
      o.items.some((item: any) => item.sellerId === sellerId)
    );
    
    return c.json({ orders });
  } catch (error) {
    console.log("Error fetching seller orders:", error);
    return c.json({ error: "Failed to fetch seller orders" }, 500);
  }
});

// Get order by ID
app.get("/make-server-0eb859c3/orders/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const order = await kv.get(`order:${id}`);
    
    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }
    
    return c.json({ order });
  } catch (error) {
    console.log("Error fetching order:", error);
    return c.json({ error: "Failed to fetch order" }, 500);
  }
});

// Update order status
app.put("/make-server-0eb859c3/orders/:id/status", async (c) => {
  try {
    const id = c.req.param("id");
    const { status } = await c.req.json();
    
    const order = await kv.get(`order:${id}`);
    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }
    
    const updatedOrder = {
      ...order,
      status,
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`order:${id}`, updatedOrder);
    
    return c.json({ order: updatedOrder });
  } catch (error) {
    console.log("Error updating order status:", error);
    return c.json({ error: "Failed to update order status" }, 500);
  }
});

// ==================== CHAT ROUTES ====================

// Get chat conversations for user
app.get("/make-server-0eb859c3/chats/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const chatKeys = await kv.getByPrefix("chat:");
    const chats = (chatKeys || []).filter((chat: any) => 
      chat.buyerId === userId || chat.sellerId === userId
    );
    
    return c.json({ chats });
  } catch (error) {
    console.log("Error fetching chats:", error);
    return c.json({ error: "Failed to fetch chats" }, 500);
  }
});

// Get or create chat conversation
app.post("/make-server-0eb859c3/chats", async (c) => {
  try {
    const { buyerId, sellerId, productId } = await c.req.json();
    
    // Check if chat already exists
    const chatKeys = await kv.getByPrefix("chat:");
    const existingChat = (chatKeys || []).find((chat: any) => 
      chat.buyerId === buyerId && 
      chat.sellerId === sellerId && 
      chat.productId === productId
    );
    
    if (existingChat) {
      return c.json({ chat: existingChat });
    }
    
    // Create new chat
    const chatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const chat = {
      id: chatId,
      buyerId,
      sellerId,
      productId,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`chat:${chatId}`, chat);
    await kv.set(`chatMessages:${chatId}`, []);
    
    return c.json({ chat }, 201);
  } catch (error) {
    console.log("Error creating chat:", error);
    return c.json({ error: "Failed to create chat" }, 500);
  }
});

// Get messages for chat
app.get("/make-server-0eb859c3/chats/:chatId/messages", async (c) => {
  try {
    const chatId = c.req.param("chatId");
    const messages = await kv.get(`chatMessages:${chatId}`) || [];
    
    return c.json({ messages });
  } catch (error) {
    console.log("Error fetching messages:", error);
    return c.json({ error: "Failed to fetch messages" }, 500);
  }
});

// Send message
app.post("/make-server-0eb859c3/chats/:chatId/messages", async (c) => {
  try {
    const chatId = c.req.param("chatId");
    const messageData = await c.req.json();
    
    const messages = await kv.get(`chatMessages:${chatId}`) || [];
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newMessage = {
      id: messageId,
      ...messageData,
      timestamp: new Date().toISOString(),
    };
    
    messages.push(newMessage);
    await kv.set(`chatMessages:${chatId}`, messages);
    
    return c.json({ message: newMessage }, 201);
  } catch (error) {
    console.log("Error sending message:", error);
    return c.json({ error: "Failed to send message" }, 500);
  }
});

// ==================== MIDTRANS PAYMENT WEBHOOK ====================

// Get Midtrans client key (for frontend Snap integration)
app.get("/make-server-0eb859c3/payment-config", async (c) => {
  try {
    const serverKey = Deno.env.get('MIDTRANS_SERVER_KEY') || '';
    const clientKey = Deno.env.get('MIDTRANS_CLIENT_KEY') || '';
    
    // Determine if sandbox or production based on server key
    const isSandbox = serverKey.startsWith('SB-');
    
    return c.json({ 
      clientKey: clientKey || (isSandbox ? 'SB-Mid-client-sample' : ''),
      isSandbox,
      configured: !!serverKey && !!clientKey
    });
  } catch (error) {
    console.log("Error getting payment config:", error);
    return c.json({ error: "Failed to get payment config" }, 500);
  }
});

// Midtrans notification webhook
app.post("/make-server-0eb859c3/payment-notification", async (c) => {
  try {
    const notification = await c.req.json();
    console.log('Midtrans notification received:', notification);
    
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;
    const paymentType = notification.payment_type;
    
    // Get order from database
    const order = await kv.get(`order:${orderId}`);
    if (!order) {
      console.log(`Order not found: ${orderId}`);
      return c.json({ error: "Order not found" }, 404);
    }
    
    // Determine order status based on transaction status
    let newStatus = order.status;
    let paymentStatus = order.paymentStatus;
    
    if (transactionStatus === 'capture') {
      if (fraudStatus === 'accept') {
        newStatus = 'pending';
        paymentStatus = 'paid';
      }
    } else if (transactionStatus === 'settlement') {
      newStatus = 'pending';
      paymentStatus = 'paid';
    } else if (transactionStatus === 'pending') {
      newStatus = 'pending_payment';
      paymentStatus = 'pending';
    } else if (transactionStatus === 'deny' || transactionStatus === 'cancel' || transactionStatus === 'expire') {
      newStatus = 'cancelled';
      paymentStatus = 'failed';
    }
    
    // Update order
    const updatedOrder = {
      ...order,
      status: newStatus,
      paymentStatus,
      paymentType,
      transactionId: notification.transaction_id,
      paymentTime: notification.transaction_time,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`order:${orderId}`, updatedOrder);
    
    // If payment is successful, update product stock
    if (paymentStatus === 'paid' && order.paymentStatus !== 'paid') {
      for (const item of order.items) {
        const product = await kv.get(`product:${item.productId}`);
        if (product) {
          const updatedProduct = {
            ...product,
            sold: (product.sold || 0) + item.quantity,
            stock: (product.stock || 0) - item.quantity,
          };
          await kv.set(`product:${item.productId}`, updatedProduct);
        }
      }
      console.log(`Payment successful for order ${orderId}, stock updated`);
    }
    
    console.log(`Order ${orderId} updated - Status: ${newStatus}, Payment: ${paymentStatus}`);
    return c.json({ status: 'success' });
  } catch (error) {
    console.log("Error handling payment notification:", error);
    return c.json({ error: "Failed to process notification" }, 500);
  }
});

// Payment finish callback (redirected from Midtrans)
app.get("/make-server-0eb859c3/payment-finish", async (c) => {
  try {
    const orderId = c.req.query('order_id');
    const statusCode = c.req.query('status_code');
    const transactionStatus = c.req.query('transaction_status');
    
    console.log(`Payment finish callback - Order: ${orderId}, Status: ${transactionStatus}`);
    
    // Redirect to frontend with payment result
    const frontendUrl = Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '') || '';
    const redirectUrl = `${frontendUrl}?payment=success&order_id=${orderId}`;
    
    return c.redirect(redirectUrl);
  } catch (error) {
    console.log("Error handling payment finish:", error);
    return c.json({ error: "Failed to handle payment finish" }, 500);
  }
});

// Check payment status
app.get("/make-server-0eb859c3/payment-status/:orderId", async (c) => {
  try {
    const orderId = c.req.param("orderId");
    const order = await kv.get(`order:${orderId}`);
    
    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }
    
    return c.json({ 
      orderId: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentType: order.paymentType,
    });
  } catch (error) {
    console.log("Error checking payment status:", error);
    return c.json({ error: "Failed to check payment status" }, 500);
  }
});

// ==================== REVIEW ROUTES ====================

// Get reviews for product
app.get("/make-server-0eb859c3/reviews/product/:productId", async (c) => {
  try {
    const productId = c.req.param("productId");
    const reviewKeys = await kv.getByPrefix(`review:${productId}:`);
    
    return c.json({ reviews: reviewKeys || [] });
  } catch (error) {
    console.log("Error fetching reviews:", error);
    return c.json({ error: "Failed to fetch reviews" }, 500);
  }
});

// Create review
app.post("/make-server-0eb859c3/reviews", async (c) => {
  try {
    const reviewData = await c.req.json();
    const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const review = {
      id: reviewId,
      ...reviewData,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`review:${reviewData.productId}:${reviewId}`, review);
    
    // Update product rating
    const product = await kv.get(`product:${reviewData.productId}`);
    if (product) {
      const reviews = await kv.getByPrefix(`review:${reviewData.productId}:`);
      const totalRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0);
      const avgRating = totalRating / reviews.length;
      
      const updatedProduct = {
        ...product,
        rating: avgRating,
        reviews: reviews.length,
      };
      await kv.set(`product:${reviewData.productId}`, updatedProduct);
    }
    
    return c.json({ review }, 201);
  } catch (error) {
    console.log("Error creating review:", error);
    return c.json({ error: "Failed to create review" }, 500);
  }
});

// ==================== ADMIN ROUTES ====================

// Get all users (admin only)
app.get("/make-server-0eb859c3/admin/users", async (c) => {
  try {
    const userKeys = await kv.getByPrefix("user:");
    const users = (userKeys || []).map((user: any) => {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    return c.json({ users });
  } catch (error) {
    console.log("Error fetching all users:", error);
    return c.json({ error: "Failed to fetch users" }, 500);
  }
});

// Get all orders (admin only)
app.get("/make-server-0eb859c3/admin/orders", async (c) => {
  try {
    const orderKeys = await kv.getByPrefix("order:");
    return c.json({ orders: orderKeys || [] });
  } catch (error) {
    console.log("Error fetching all orders:", error);
    return c.json({ error: "Failed to fetch orders" }, 500);
  }
});

// Get statistics (admin only)
app.get("/make-server-0eb859c3/admin/stats", async (c) => {
  try {
    const supabase = getSupabaseClient();
    
    // Get total users
    const { count: totalUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });
    
    // Get total buyers
    const { count: totalBuyers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "buyer");
    
    // Get total sellers (users with role seller)
    const { count: totalSellers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "seller");
    
    // Get pending seller applications
    const { count: pendingApplications } = await supabase
      .from("seller_profiles")
      .select("*", { count: "exact", head: true })
      .eq("kyc_status", "pending");
    
    // Get total products (if products table exists)
    let totalProducts = 0;
    try {
      const { count } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });
      totalProducts = count || 0;
    } catch (e) {
      // Products table might not exist yet
      console.log("Products table not found, skipping");
    }
    
    // Get total orders (if orders table exists)
    let totalOrders = 0;
    let totalRevenue = 0;
    try {
      const { count } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });
      totalOrders = count || 0;
      
      // Get total revenue
      const { data: orders } = await supabase
        .from("orders")
        .select("total_amount");
      if (orders) {
        totalRevenue = orders.reduce((sum: number, o: any) => sum + (parseFloat(o.total_amount) || 0), 0);
      }
    } catch (e) {
      // Orders table might not exist yet
      console.log("Orders table not found, skipping");
    }
    
    // Get new users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const { count: newUsersThisMonth } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString());
    
    // Get new sellers this month
    const { count: newSellersThisMonth } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "seller")
      .gte("created_at", startOfMonth.toISOString());
    
    return c.json({
      stats: {
        totalUsers: totalUsers || 0,
        totalBuyers: totalBuyers || 0,
        totalSellers: totalSellers || 0,
        pendingApplications: pendingApplications || 0,
        totalProducts: totalProducts || 0,
        totalOrders: totalOrders || 0,
        totalRevenue: totalRevenue || 0,
        newUsersThisMonth: newUsersThisMonth || 0,
        newSellersThisMonth: newSellersThisMonth || 0,
      }
    });
  } catch (error: any) {
    console.log("Error fetching stats:", error);
    return c.json({ error: "Failed to fetch stats: " + (error.message || "Unknown error") }, 500);
  }
});

// Get pending seller applications (admin only)
app.get("/make-server-0eb859c3/admin/seller-applications", async (c) => {
  try {
    const supabase = getSupabaseClient();
    
    // Get all pending seller applications with user info
    const { data: applications, error } = await supabase
      .from("seller_profiles")
      .select(`
        *,
        users:user_id (
          id,
          email,
          name,
          phone,
          created_at
        )
      `)
      .eq("kyc_status", "pending")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.log("Error fetching applications:", error);
      return c.json({ error: "Failed to fetch applications: " + error.message }, 500);
    }
    
    return c.json({ applications: applications || [] });
  } catch (error: any) {
    console.log("Error fetching seller applications:", error);
    return c.json({ error: "Failed to fetch applications: " + (error.message || "Unknown error") }, 500);
  }
});

// Approve or reject seller application (admin only)
app.post("/make-server-0eb859c3/admin/seller-applications/:id/:action", async (c) => {
  try {
    const applicationId = c.req.param("id");
    const action = c.req.param("action"); // 'approve' or 'reject'
    const supabase = getSupabaseClient();
    
    if (action !== "approve" && action !== "reject") {
      return c.json({ error: "Invalid action. Use 'approve' or 'reject'" }, 400);
    }
    
    // Get seller profile
    const { data: profile, error: profileError } = await supabase
      .from("seller_profiles")
      .select("*")
      .eq("id", applicationId)
      .single();
    
    if (profileError || !profile) {
      return c.json({ error: "Seller application not found" }, 404);
    }
    
    // Update seller profile status
    const newStatus = action === "approve" ? "approved" : "rejected";
    const { error: updateError } = await supabase
      .from("seller_profiles")
      .update({
        kyc_status: newStatus,
        kyc_verified_at: action === "approve" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq("id", applicationId);
    
    if (updateError) {
      console.log("Error updating application:", updateError);
      return c.json({ error: "Failed to update application: " + updateError.message }, 500);
    }
    
    // If approved, update user role to seller
    if (action === "approve") {
      const { error: userUpdateError } = await supabase
        .from("users")
        .update({
          role: "seller",
          updated_at: new Date().toISOString()
        })
        .eq("id", profile.user_id);
      
      if (userUpdateError) {
        console.log("Error updating user role:", userUpdateError);
        // Don't fail the whole request, just log the error
      }
    }
    
    return c.json({ 
      success: true, 
      message: `Seller application ${action === "approve" ? "approved" : "rejected"} successfully` 
    });
  } catch (error: any) {
    console.log("Error processing application:", error);
    return c.json({ error: "Failed to process application: " + (error.message || "Unknown error") }, 500);
  }
});

Deno.serve(app.fetch);

