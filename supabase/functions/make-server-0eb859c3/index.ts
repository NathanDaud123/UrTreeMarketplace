import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const app = new Hono();

// Enable CORS
app.use("*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

// Health check
app.get("/make-server-0eb859c3/health", (c) => {
  return c.json({ status: "ok" });
});

// Initialize Supabase client
const getSupabaseClient = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
};

// Login endpoint (simplified)
app.post("/make-server-0eb859c3/users/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    const supabase = getSupabaseClient();
    
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    
    if (error || !user) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    if (!user.is_active) {
      return c.json({ error: "Account is inactive" }, 401);
    }
    
    // Allow login if password matches OR if user has Google login (password_hash starts with 'google-oauth-')
    // This allows users to login with email/password even if they previously logged in with Google
    const isGoogleOAuthUser = user.password_hash?.startsWith('google-oauth-');
    const passwordMatches = user.password_hash === password;
    
    if (!passwordMatches && !isGoogleOAuthUser) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    await supabase
      .from("users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("email", email);

    // Check if user has seller profile (to set hasSellerAccount)
    // hasSellerAccount should only be true if KYC is approved
    const { data: sellerProfile } = await supabase
      .from("seller_profiles")
      .select("id, kyc_status")
      .eq("user_id", user.id)
      .maybeSingle();

    // Get default address if exists
    const { data: defaultAddress } = await supabase
      .from("user_addresses")
      .select("address, city")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .maybeSingle();

    const { password_hash: _, ...userWithoutPassword } = user;
    const userResponse = {
      ...userWithoutPassword,
      // Only set hasSellerAccount to true if KYC is approved
      hasSellerAccount: sellerProfile?.kyc_status === 'approved' || false,
      isPendingSeller: sellerProfile?.kyc_status === 'pending' || false,
      address: defaultAddress?.address || null,
      city: defaultAddress?.city || null,
      hasPin: !!(user.has_pin || user.pin_hash)
    };
    
    return c.json({ user: userResponse });
  } catch (error: any) {
    console.log("Error logging in:", error);
    return c.json({ error: "Failed to login: " + (error.message || "Unknown error") }, 500);
  }
});

// Register endpoint
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

    // Insert new user
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        email,
        name,
        password_hash: password, // Store as plain text for now (matching login comparison)
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
    
    // Add address, city, hasSellerAccount, isPendingSeller, and hasPin to response (all null/false for new user)
    const userResponse = {
      ...userWithoutPassword,
      address: null,
      city: null,
      hasSellerAccount: false,
      isPendingSeller: false,
      hasPin: false
    };
    
    return c.json({ user: userResponse }, 201);
  } catch (error: any) {
    console.log("Error registering user:", error);
    return c.json({ error: "Failed to register user: " + (error.message || "Unknown error") }, 500);
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
    const { data: defaultAddress, error: addressError } = await supabase
      .from("user_addresses")
      .select("address, city")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .maybeSingle();
    
    if (addressError && addressError.code !== 'PGRST116') {
      console.log(`[Get User] Error fetching address:`, addressError);
    }
    
    // Check if user has seller profile (to set hasSellerAccount)
    // hasSellerAccount should only be true if KYC is approved
    const { data: sellerProfile, error: sellerProfileError } = await supabase
      .from("seller_profiles")
      .select("id, kyc_status")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (sellerProfileError && sellerProfileError.code !== 'PGRST116') {
      console.log(`[Get User] Error fetching seller profile:`, sellerProfileError);
    }
    
    // Remove password_hash from response
    const { password_hash: _, ...userWithoutPassword } = user;
    
    // Add address, city, hasSellerAccount, and hasPin to response
    const userResponse = {
      ...userWithoutPassword,
      address: defaultAddress?.address || null,
      city: defaultAddress?.city || null,
      // Only set hasSellerAccount to true if KYC is approved
      hasSellerAccount: sellerProfile?.kyc_status === 'approved' || false,
      isPendingSeller: sellerProfile?.kyc_status === 'pending' || false,
      hasPin: !!(user.has_pin || user.pin_hash)
    };
    
    console.log(`[Get User] Returning user with:`, {
      email: userResponse.email,
      address: userResponse.address,
      city: userResponse.city,
      hasSellerAccount: userResponse.hasSellerAccount,
      isPendingSeller: userResponse.isPendingSeller,
      hasPin: userResponse.hasPin
    });
    
    return c.json({ user: userResponse });
  } catch (error: any) {
    console.log("Error fetching user:", error);
    return c.json({ error: "Failed to fetch user: " + (error.message || "Unknown error") }, 500);
  }
});

// Update user
app.put("/make-server-0eb859c3/users/:email", async (c) => {
  try {
    const email = decodeURIComponent(c.req.param("email"));
    const updates = await c.req.json();
    const supabase = getSupabaseClient();
    
    // Map updates to database schema
    const dbUpdates: any = {
      updated_at: new Date().toISOString()
    };
    
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
    
    // Handle address and city - save to user_addresses as default address
    if (updates.address !== undefined || updates.city !== undefined) {
      console.log(`[Update User] Saving address/city for ${email}:`, {
        address: updates.address,
        city: updates.city
      });
      
      // Get current user to get user_id
      const { data: currentUser, error: currentUserError } = await supabase
        .from("users")
        .select("id, name, phone")
        .eq("email", email)
        .single();
      
      if (currentUserError || !currentUser) {
        console.log(`[Update User] Error getting current user:`, currentUserError);
      } else {
        // Check if default address exists
        const { data: existingAddress, error: addressCheckError } = await supabase
          .from("user_addresses")
          .select("id, address, city")
          .eq("user_id", currentUser.id)
          .eq("is_default", true)
          .maybeSingle();
        
        if (addressCheckError && addressCheckError.code !== 'PGRST116') {
          console.log(`[Update User] Error checking existing address:`, addressCheckError);
        }
        
        const addressData: any = {
          user_id: currentUser.id,
          label: 'Alamat Utama',
          recipient_name: updatedUser.name || currentUser.name,
          phone: updatedUser.phone || currentUser.phone || '',
          is_default: true,
          updated_at: new Date().toISOString()
        };
        
        // Only update fields that are provided, keep existing values for others
        if (updates.address !== undefined) {
          addressData.address = updates.address;
        } else if (existingAddress?.address) {
          addressData.address = existingAddress.address;
        }
        
        if (updates.city !== undefined) {
          addressData.city = updates.city;
        } else if (existingAddress?.city) {
          addressData.city = existingAddress.city;
        }
        
        // Save address even if only one field is provided (for partial updates)
        if (existingAddress) {
          // Update existing default address
          console.log(`[Update User] Updating existing address:`, existingAddress.id);
          const { error: updateAddressError } = await supabase
            .from("user_addresses")
            .update(addressData)
            .eq("id", existingAddress.id);
          
          if (updateAddressError) {
            console.log(`[Update User] Error updating address:`, updateAddressError);
            console.log(`[Update User] Error details:`, JSON.stringify(updateAddressError, null, 2));
          } else {
            console.log(`[Update User] Address updated successfully`);
          }
        } else {
          // Create new default address (only if at least one field is provided)
          if (addressData.address || addressData.city) {
            // Set default values if missing
            if (!addressData.address) addressData.address = '';
            if (!addressData.city) addressData.city = '';
            
            addressData.created_at = new Date().toISOString();
            console.log(`[Update User] Creating new address:`, addressData);
            const { error: insertAddressError } = await supabase
              .from("user_addresses")
              .insert(addressData);
            
            if (insertAddressError) {
              console.log(`[Update User] Error inserting address:`, insertAddressError);
              console.log(`[Update User] Error details:`, JSON.stringify(insertAddressError, null, 2));
            } else {
              console.log(`[Update User] Address created successfully`);
            }
          } else {
            console.log(`[Update User] No address or city provided, skipping save`);
          }
        }
      }
    }
    
    // Get updated user with address info for response
    const { data: defaultAddress, error: addressFetchError } = await supabase
      .from("user_addresses")
      .select("address, city")
      .eq("user_id", updatedUser.id)
      .eq("is_default", true)
      .maybeSingle();
    
    if (addressFetchError && addressFetchError.code !== 'PGRST116') {
      console.log(`[Update User] Error fetching address for response:`, addressFetchError);
    }
    
    // Check if user has seller profile (to set hasSellerAccount)
    const { data: sellerProfile } = await supabase
      .from("seller_profiles")
      .select("id, kyc_status")
      .eq("user_id", updatedUser.id)
      .maybeSingle();
    
    // Remove password_hash from response
    const { password_hash: _, ...userWithoutPassword } = updatedUser;
    
    // Add address, city, hasSellerAccount, isPendingSeller, and hasPin to response
    // hasSellerAccount should only be true if KYC is approved
    const userResponse = {
      ...userWithoutPassword,
      address: defaultAddress?.address || null,
      city: defaultAddress?.city || null,
      // Only set hasSellerAccount to true if KYC is approved
      hasSellerAccount: sellerProfile?.kyc_status === 'approved' || false,
      isPendingSeller: sellerProfile?.kyc_status === 'pending' || false,
      hasPin: !!(updatedUser.has_pin || updatedUser.pin_hash)
    };
    
    console.log(`[Update User] Returning user with:`, {
      email: userResponse.email,
      address: userResponse.address,
      city: userResponse.city,
      hasSellerAccount: userResponse.hasSellerAccount,
      isPendingSeller: userResponse.isPendingSeller,
      hasPin: userResponse.hasPin
    });
    
    return c.json({ user: userResponse });
  } catch (error: any) {
    console.log("Error updating user:", error);
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
      e_wallet_types: sellerData.eWalletTypes || [], // Array of e-wallet types
      e_wallet_phone: sellerData.eWalletPhone || sellerData.phone || user.phone, // Phone number for e-wallet
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
    const email = decodeURIComponent(c.req.param("email"));
    const { newRole } = await c.req.json();
    const supabase = getSupabaseClient();
    
    console.log(`Switching role for ${email} to ${newRole}`);
    
    // Validate newRole
    if (newRole !== 'buyer' && newRole !== 'seller') {
      return c.json({ error: "Invalid role. Must be 'buyer' or 'seller'" }, 400);
    }
    
    // Get current user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();
    
    if (userError || !user) {
      return c.json({ error: "User not found" }, 404);
    }
    
    // Check if user wants to switch to seller and has seller account
    if (newRole === 'seller') {
      // Check if user has seller profile (any status)
      const { data: sellerProfile } = await supabase
        .from("seller_profiles")
        .select("id, kyc_status")
        .eq("user_id", user.id)
        .single();
      
      if (!sellerProfile) {
        return c.json({ error: "User does not have seller account. Please apply as seller first." }, 400);
      }
      
      // Allow switch to seller if:
      // - KYC is approved (full access)
      // - KYC is pending (can manage products, but may have limitations)
      // Only block if KYC is rejected
      if (sellerProfile.kyc_status === 'rejected') {
        return c.json({ error: "Seller account application was rejected. Please contact admin." }, 400);
      }
      
      // If KYC is pending, allow switch but log it
      if (sellerProfile.kyc_status === 'pending') {
        console.log(`User ${email} switching to seller with pending KYC status`);
      }
    }
    
    // For buyer role, no validation needed - anyone can be a buyer
    
    // Update user role
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq("email", email)
      .select()
      .single();
    
    if (updateError) {
      console.log("Error updating user role:", updateError);
      return c.json({ error: "Failed to switch role: " + updateError.message }, 500);
    }
    
    // Get default address if exists
    const { data: defaultAddress, error: addressError } = await supabase
      .from("user_addresses")
      .select("address, city")
      .eq("user_id", updatedUser.id)
      .eq("is_default", true)
      .maybeSingle();
    
    if (addressError && addressError.code !== 'PGRST116') {
      console.log(`[Switch Role] Error fetching address:`, addressError);
    }
    
    // Check if user has seller profile (to set hasSellerAccount)
    // hasSellerAccount should only be true if KYC is approved
    const { data: sellerProfile, error: sellerProfileError } = await supabase
      .from("seller_profiles")
      .select("id, kyc_status")
      .eq("user_id", updatedUser.id)
      .maybeSingle();
    
    if (sellerProfileError && sellerProfileError.code !== 'PGRST116') {
      console.log(`[Switch Role] Error fetching seller profile:`, sellerProfileError);
    }
    
    // Remove password_hash from response
    const { password_hash: _, ...userWithoutPassword } = updatedUser;
    
    // Add address, city, hasSellerAccount, isPendingSeller, and hasPin to response
    const userResponse = {
      ...userWithoutPassword,
      address: defaultAddress?.address || null,
      city: defaultAddress?.city || null,
      // Only set hasSellerAccount to true if KYC is approved
      hasSellerAccount: sellerProfile?.kyc_status === 'approved' || false,
      isPendingSeller: sellerProfile?.kyc_status === 'pending' || false,
      hasPin: !!(updatedUser.has_pin || updatedUser.pin_hash)
    };
    
    console.log(`[Switch Role] Returning user with:`, {
      email: userResponse.email,
      role: userResponse.role,
      address: userResponse.address,
      city: userResponse.city,
      hasSellerAccount: userResponse.hasSellerAccount,
      isPendingSeller: userResponse.isPendingSeller,
      hasPin: userResponse.hasPin
    });
    
    return c.json({ user: userResponse });
  } catch (error: any) {
    console.log("Error switching role:", error);
    return c.json({ error: "Failed to switch role: " + (error.message || "Unknown error") }, 500);
  }
});

// ==================== ADMIN ROUTES ====================

// Get all users (admin only)
app.get("/make-server-0eb859c3/admin/users", async (c) => {
  try {
    const supabase = getSupabaseClient();
    
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.log("Error fetching users:", error);
      return c.json({ error: "Failed to fetch users: " + error.message }, 500);
    }
    
    const usersWithoutPassword = (users || []).map((user: any) => {
      const { password_hash: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    return c.json({ users: usersWithoutPassword });
  } catch (error: any) {
    console.log("Error fetching all users:", error);
    return c.json({ error: "Failed to fetch users: " + (error.message || "Unknown error") }, 500);
  }
});

// Get statistics (admin only)
app.get("/make-server-0eb859c3/admin/stats", async (c) => {
  try {
    const supabase = getSupabaseClient();
    
    const { count: totalUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });
    
    const { count: totalBuyers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "buyer");
    
    const { count: totalSellers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "seller");
    
    const { count: pendingApplications } = await supabase
      .from("seller_profiles")
      .select("*", { count: "exact", head: true })
      .eq("kyc_status", "pending");
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const { count: newUsersThisMonth } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString());
    
    const { count: newSellersThisMonth } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "seller")
      .gte("created_at", startOfMonth.toISOString());
    
    // Get total products
    const { count: totalProducts } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });
    
    // Get active products (status = 'active' and is_active = true)
    const { count: activeProducts } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .eq("is_active", true);
    
    // Get total orders
    const { count: totalOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });
    
    // Get total revenue (sum of total_amount from completed orders)
    const { data: completedOrders } = await supabase
      .from("orders")
      .select("total_amount")
      .eq("status", "completed")
      .eq("payment_status", "paid");
    
    const totalRevenue = (completedOrders || []).reduce((sum: number, order: any) => {
      return sum + parseFloat(order.total_amount || 0);
    }, 0);
    
    return c.json({
      stats: {
        totalUsers: totalUsers || 0,
        totalBuyers: totalBuyers || 0,
        totalSellers: totalSellers || 0,
        pendingApplications: pendingApplications || 0,
        totalProducts: totalProducts || 0,
        activeProducts: activeProducts || 0,
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

// Get seller applications (admin only)
app.get("/make-server-0eb859c3/admin/seller-applications", async (c) => {
  try {
    const supabase = getSupabaseClient();
    
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

// Get user detail (admin only)
app.get("/make-server-0eb859c3/admin/users/:email", async (c) => {
  try {
    const email = decodeURIComponent(c.req.param("email"));
    const supabase = getSupabaseClient();
    
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();
    
    if (userError || !user) {
      return c.json({ error: "User not found" }, 404);
    }
    
    const { password_hash: _, ...userWithoutPassword } = user;
    
    return c.json({
      user: userWithoutPassword,
      stats: {
        totalOrders: 0,
        totalSpent: 0,
        isSeller: user.role === 'seller',
        sellerProfile: null,
        address: null
      }
    });
  } catch (error: any) {
    console.log("Error fetching user detail:", error);
    return c.json({ error: "Failed to fetch user detail: " + (error.message || "Unknown error") }, 500);
  }
});

// ==================== PRODUCT ROUTES ====================

// Get all products or filter by category/search
app.get("/make-server-0eb859c3/products", async (c) => {
  try {
    const category = c.req.query("category");
    const search = c.req.query("search");
    const includeInactive = c.req.query("includeInactive") === "true"; // For admin dashboard
    const supabase = getSupabaseClient();
    
    // First, get products without join (simpler, more reliable)
    let query = supabase
      .from("products")
      .select(`
        *,
        product_images:product_images(image_url, alt_text, sort_order, is_primary)
      `);
    
    // Only filter by status if not including inactive (for admin)
    if (!includeInactive) {
      query = query.eq("status", "active").eq("is_active", true);
    }
    
    console.log(`Querying products with includeInactive=${includeInactive}`);
    
    if (category) {
      // Get category_id from product_categories
      const { data: categoryData } = await supabase
        .from("product_categories")
        .select("id")
        .eq("slug", category)
        .single();
      
      if (categoryData) {
        query = query.eq("category_id", categoryData.id);
      }
    }
    
    const { data: products, error } = await query.order("created_at", { ascending: false });
    
    if (error) {
      console.log("Error fetching products:", error);
      console.log("Error details:", JSON.stringify(error, null, 2));
      return c.json({ error: "Failed to fetch products: " + error.message }, 500);
    }
    
    console.log(`Fetched ${products?.length || 0} products from database (includeInactive: ${includeInactive})`);
    
    // Now get seller info separately for each product
    const productsWithSellers = await Promise.all((products || []).map(async (product: any) => {
      // Get seller info by seller_id (which is UUID)
      // First try to get from seller_profiles (which has shop_name and shop_city)
      let sellerInfo = null;
      try {
        console.log(`[Get Products] Fetching seller for product ${product.id}, seller_id: ${product.seller_id}`);
        
        // Get seller profile first (has shop_name and shop_city)
        const { data: sellerProfile, error: profileError } = await supabase
          .from("seller_profiles")
          .select("shop_name, shop_city, shop_province, users:user_id(id, email, name, avatar_url)")
          .eq("user_id", product.seller_id)
          .maybeSingle();
        
        if (sellerProfile) {
          console.log(`[Get Products] Seller profile found for product ${product.id}:`, {
            shop_name: sellerProfile.shop_name,
            shop_city: sellerProfile.shop_city
          });
          sellerInfo = {
            email: (sellerProfile.users as any)?.email || null,
            name: (sellerProfile.users as any)?.name || null,
            shop_name: sellerProfile.shop_name || null,
            shop_city: sellerProfile.shop_city || sellerProfile.shop_province || null,
            avatar_url: (sellerProfile.users as any)?.avatar_url || null
          };
        } else {
          // Fallback: get from users table if no seller profile
          console.log(`[Get Products] No seller profile found, trying users table for product ${product.id}`);
          const { data: seller, error: sellerError } = await supabase
            .from("users")
            .select("id, email, name, avatar_url")
            .eq("id", product.seller_id)
            .maybeSingle();
          
          if (seller) {
            // Try to get city from user_addresses
            const { data: defaultAddress } = await supabase
              .from("user_addresses")
              .select("city")
              .eq("user_id", product.seller_id)
              .eq("is_default", true)
              .maybeSingle();
            
            sellerInfo = {
              email: seller.email || null,
              name: seller.name || null,
              shop_name: seller.name || null, // Use name as fallback
              shop_city: defaultAddress?.city || null,
              avatar_url: seller.avatar_url || null
            };
            
            console.log(`[Get Products] Seller from users table for product ${product.id}:`, sellerInfo);
          } else {
            console.log(`[Get Products] No seller found for product ${product.id}, seller_id: ${product.seller_id}`);
          }
        }
      } catch (err) {
        console.log(`[Get Products] Exception fetching seller for product ${product.id}:`, err);
      }
      
      return {
        ...product,
        seller: sellerInfo
      };
    }));
    
    if (productsWithSellers && productsWithSellers.length > 0) {
      console.log("Sample product with seller:", JSON.stringify(productsWithSellers[0], null, 2));
    }
    
    // Transform products to match frontend format
    const transformedProducts = (productsWithSellers || []).map((product: any) => {
      // Get primary image or first image
      const images = (product.product_images || [])
        .sort((a: any, b: any) => {
          if (a.is_primary) return -1;
          if (b.is_primary) return 1;
          return a.sort_order - b.sort_order;
        })
        .map((img: any) => img.image_url);
      
      // Apply search filter if provided
      let matchesSearch = true;
      if (search) {
        const searchLower = search.toLowerCase();
        matchesSearch = 
          product.name.toLowerCase().includes(searchLower) ||
          (product.description && product.description.toLowerCase().includes(searchLower));
      }
      
      if (!matchesSearch) return null;
      
      // Get seller info from joined seller object
      let sellerEmail = product.seller_id; // Default to UUID
      let sellerName = 'Unknown';
      let sellerLocation = 'Unknown';
      
      if (product.seller) {
        // If seller join worked, use joined data
        sellerEmail = product.seller.email || product.seller_id;
        sellerName = product.seller.shop_name || product.seller.name || 'Unknown';
        // Use shop_city, fallback to shop_province, then to city from address, then 'Unknown'
        sellerLocation = product.seller.shop_city || product.seller.shop_province || product.seller.city || 'Unknown';
        
        console.log(`[Get Products] Mapped seller for product ${product.id}:`, {
          sellerEmail,
          sellerName,
          sellerLocation,
          hasShopName: !!product.seller.shop_name,
          hasShopCity: !!product.seller.shop_city
        });
      } else {
        console.log(`[Get Products] No seller info for product ${product.id}, seller_id: ${product.seller_id}`);
      }
      
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        stock: product.stock,
        sold: product.sold || 0,
        category: category || product.category_id, // Use category slug if available
        images: images.length > 0 ? images : ['https://via.placeholder.com/400'],
        rating: parseFloat(product.rating || 0),
        reviews: product.total_reviews || 0,
        sellerId: sellerEmail,
        sellerName: sellerName,
        sellerLocation: sellerLocation,
        sellerRating: 5.0,
        plantAge: product.plant_age,
        maxDeliveryRadius: product.max_delivery_radius,
        createdAt: product.created_at
      };
    }).filter((p: any) => p !== null);
    
    console.log(`Returning ${transformedProducts.length} transformed products`);
    
    return c.json({ products: transformedProducts });
  } catch (error: any) {
    console.log("Error fetching products:", error);
    return c.json({ error: "Failed to fetch products: " + (error.message || "Unknown error") }, 500);
  }
});

// Get product by ID
app.get("/make-server-0eb859c3/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const supabase = getSupabaseClient();
    
    // Get product without join first
    const { data: product, error } = await supabase
      .from("products")
      .select(`
        *,
        product_images:product_images(image_url, alt_text, sort_order, is_primary)
      `)
      .eq("id", id)
      .single();
    
    if (error || !product) {
      return c.json({ error: "Product not found" }, 404);
    }
    
    // Get seller info separately - try seller_profiles first (has shop_name and shop_city)
    let sellerInfo = null;
    try {
      console.log(`[Get Product By ID] Fetching seller info for product ${product.id}`);
      console.log(`[Get Product By ID] seller_id (UUID): ${product.seller_id}`);
      
      // First try to get from seller_profiles (which has shop_name and shop_city)
      const { data: sellerProfile, error: profileError } = await supabase
        .from("seller_profiles")
        .select("shop_name, shop_city, shop_province, users:user_id(id, email, name, avatar_url)")
        .eq("user_id", product.seller_id)
        .maybeSingle();
      
      if (sellerProfile) {
        console.log(`[Get Product By ID] Seller profile found:`, {
          shop_name: sellerProfile.shop_name,
          shop_city: sellerProfile.shop_city
        });
        sellerInfo = {
          email: (sellerProfile.users as any)?.email || null,
          name: (sellerProfile.users as any)?.name || null,
          shop_name: sellerProfile.shop_name || null,
          shop_city: sellerProfile.shop_city || sellerProfile.shop_province || null,
          avatar_url: (sellerProfile.users as any)?.avatar_url || null
        };
      } else {
        // Fallback: get from users table if no seller profile
        console.log(`[Get Product By ID] No seller profile found, trying users table`);
        const { data: seller, error: sellerError } = await supabase
          .from("users")
          .select("id, email, name, avatar_url")
          .eq("id", product.seller_id)
          .maybeSingle();
        
        if (seller) {
          // Try to get city from user_addresses
          const { data: defaultAddress } = await supabase
            .from("user_addresses")
            .select("city")
            .eq("user_id", product.seller_id)
            .eq("is_default", true)
            .maybeSingle();
          
          sellerInfo = {
            email: seller.email || null,
            name: seller.name || null,
            shop_name: seller.name || null, // Use name as fallback
            shop_city: defaultAddress?.city || null,
            avatar_url: seller.avatar_url || null
          };
          
          console.log(`[Get Product By ID] Seller from users table:`, sellerInfo);
        } else {
          console.log(`[Get Product By ID] No seller found for seller_id: ${product.seller_id}`);
        }
      }
    } catch (err) {
      console.log(`[Get Product By ID] Exception fetching seller:`, err);
    }
    
    // Transform to match frontend format
    const images = (product.product_images || [])
      .sort((a: any, b: any) => {
        if (a.is_primary) return -1;
        if (b.is_primary) return 1;
        return a.sort_order - b.sort_order;
      })
      .map((img: any) => img.image_url);
    
    // Get seller info - try to get from seller profile if available
    let sellerEmail = product.seller_id; // Default to UUID
    let sellerName = 'Unknown';
    let sellerLocation = 'Unknown';
    
    if (sellerInfo) {
      // Use seller info (from seller_profiles or users table)
      sellerEmail = sellerInfo.email || product.seller_id;
      sellerName = sellerInfo.shop_name || sellerInfo.name || 'Unknown';
      // Use shop_city, fallback to shop_province, then to city from address, then 'Unknown'
      sellerLocation = sellerInfo.shop_city || sellerInfo.shop_province || sellerInfo.city || 'Unknown';
    }
    
    console.log(`[Get Product By ID] Final seller info:`, {
      sellerEmail,
      sellerName,
      sellerLocation,
      hasSellerInfo: !!sellerInfo
    });
    
    const transformedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      stock: product.stock,
      sold: product.sold || 0,
      category: product.category_id, // Will need to resolve to slug
      images: images.length > 0 ? images : ['https://via.placeholder.com/400'],
      rating: parseFloat(product.rating || 0),
      reviews: product.total_reviews || 0,
      sellerId: sellerEmail, // Keep for backward compatibility (email)
      sellerIdUuid: product.seller_id, // Add UUID for chat functionality
      sellerName: sellerName,
      sellerLocation: sellerLocation,
      sellerRating: 5.0,
      plantAge: product.plant_age,
      maxDeliveryRadius: product.max_delivery_radius,
      createdAt: product.created_at
    };
    
    return c.json({ product: transformedProduct });
  } catch (error: any) {
    console.log("Error fetching product:", error);
    return c.json({ error: "Failed to fetch product: " + (error.message || "Unknown error") }, 500);
  }
});

// Get products by seller
app.get("/make-server-0eb859c3/products/seller/:sellerId", async (c) => {
  try {
    const sellerId = decodeURIComponent(c.req.param("sellerId"));
    const supabase = getSupabaseClient();
    
    // Get user by email (sellerId is email)
    const { data: seller, error: sellerError } = await supabase
      .from("users")
      .select("id")
      .eq("email", sellerId)
      .single();
    
    if (sellerError || !seller) {
      return c.json({ products: [] }); // Return empty if seller not found
    }
    
    const { data: products, error } = await supabase
      .from("products")
      .select(`
        *,
        product_images:product_images(image_url, alt_text, sort_order, is_primary)
      `)
      .eq("seller_id", seller.id)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.log("Error fetching seller products:", error);
      return c.json({ error: "Failed to fetch seller products: " + error.message }, 500);
    }
    
    // Transform products
    const transformedProducts = (products || []).map((product: any) => {
      const images = (product.product_images || [])
        .sort((a: any, b: any) => {
          if (a.is_primary) return -1;
          if (b.is_primary) return 1;
          return a.sort_order - b.sort_order;
        })
        .map((img: any) => img.image_url);
      
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        stock: product.stock,
        sold: product.sold || 0,
        category: product.category_id, // Will need category slug
        images: images.length > 0 ? images : ['https://via.placeholder.com/400'],
        rating: parseFloat(product.rating || 0),
        reviews: product.total_reviews || 0,
        sellerId: sellerId,
        sellerName: product.seller_name || 'Unknown',
        sellerLocation: product.seller_location || 'Unknown',
        sellerRating: 5.0,
        plantAge: product.plant_age,
        maxDeliveryRadius: product.max_delivery_radius,
        createdAt: product.created_at
      };
    });
    
    return c.json({ products: transformedProducts });
  } catch (error: any) {
    console.log("Error fetching seller products:", error);
    return c.json({ error: "Failed to fetch seller products: " + (error.message || "Unknown error") }, 500);
  }
});

// Create product
app.post("/make-server-0eb859c3/products", async (c) => {
  try {
    const productData = await c.req.json();
    const supabase = getSupabaseClient();
    
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
    
    // Get seller user by email
    const { data: seller, error: sellerError } = await supabase
      .from("users")
      .select("id")
      .eq("email", productData.sellerId)
      .single();
    
    if (sellerError || !seller) {
      return c.json({ error: "Seller not found" }, 404);
    }
    
    // Get category_id from category slug
    const { data: category, error: categoryError } = await supabase
      .from("product_categories")
      .select("id")
      .eq("slug", productData.category)
      .single();
    
    if (categoryError || !category) {
      return c.json({ error: "Category not found" }, 404);
    }
    
    // Generate slug from name
    const slug = productData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Insert product
    const { data: newProduct, error: insertError } = await supabase
      .from("products")
      .insert({
        seller_id: seller.id,
        category_id: category.id,
        name: productData.name,
        slug: slug,
        description: productData.description || '',
        price: productData.price,
        stock: productData.stock,
        sold: 0,
        rating: 0,
        total_reviews: 0,
        plant_age: productData.plantAge || null,
        max_delivery_radius: productData.maxDeliveryRadius || null,
        status: 'active',
        is_active: true,
        published_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (insertError) {
      console.log("Error inserting product:", insertError);
      return c.json({ error: "Failed to create product: " + insertError.message }, 500);
    }
    
    // Insert product images
    if (productData.images && productData.images.length > 0) {
      const imageInserts = productData.images.map((imageUrl: string, index: number) => ({
        product_id: newProduct.id,
        image_url: imageUrl,
        alt_text: `${productData.name} - Image ${index + 1}`,
        sort_order: index,
        is_primary: index === 0
      }));
      
      const { error: imagesError } = await supabase
        .from("product_images")
        .insert(imageInserts);
      
      if (imagesError) {
        console.log("Error inserting product images:", imagesError);
        // Continue even if images fail
      }
    }
    
    // Fetch complete product with images
    const { data: completeProduct, error: fetchError } = await supabase
      .from("products")
      .select(`
        *,
        product_images:product_images(image_url, alt_text, sort_order, is_primary)
      `)
      .eq("id", newProduct.id)
      .single();
    
    if (fetchError || !completeProduct) {
      return c.json({ product: newProduct }, 201);
    }
    
    // Transform to match frontend format
    const images = (completeProduct.product_images || [])
      .sort((a: any, b: any) => {
        if (a.is_primary) return -1;
        if (b.is_primary) return 1;
        return a.sort_order - b.sort_order;
      })
      .map((img: any) => img.image_url);
    
    const transformedProduct = {
      id: completeProduct.id,
      name: completeProduct.name,
      description: completeProduct.description,
      price: parseFloat(completeProduct.price),
      stock: completeProduct.stock,
      sold: completeProduct.sold || 0,
      category: productData.category,
      images: images.length > 0 ? images : ['https://via.placeholder.com/400'],
      rating: parseFloat(completeProduct.rating || 0),
      reviews: completeProduct.total_reviews || 0,
      sellerId: productData.sellerId,
      sellerName: productData.sellerName || 'Unknown',
      sellerLocation: productData.sellerLocation || 'Unknown',
      sellerRating: 5.0,
      plantAge: completeProduct.plant_age,
      maxDeliveryRadius: completeProduct.max_delivery_radius,
      createdAt: completeProduct.created_at
    };
    
    console.log("Product created successfully:", transformedProduct.id);
    return c.json({ product: transformedProduct }, 201);
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
    const supabase = getSupabaseClient();
    
    // Check if product exists
    const { data: existingProduct, error: fetchError } = await supabase
      .from("products")
      .select("id")
      .eq("id", id)
      .single();
    
    if (fetchError || !existingProduct) {
      return c.json({ error: "Product not found" }, 404);
    }
    
    // Prepare update data
    const dbUpdates: any = {
      updated_at: new Date().toISOString()
    };
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
    if (updates.plantAge !== undefined) dbUpdates.plant_age = updates.plantAge;
    if (updates.maxDeliveryRadius !== undefined) dbUpdates.max_delivery_radius = updates.maxDeliveryRadius;
    
    // Update category if provided
    if (updates.category) {
      const { data: category } = await supabase
        .from("product_categories")
        .select("id")
        .eq("slug", updates.category)
        .single();
      
      if (category) {
        dbUpdates.category_id = category.id;
      }
    }
    
    // Update product
    const { data: updatedProduct, error: updateError } = await supabase
      .from("products")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();
    
    if (updateError) {
      console.log("Error updating product:", updateError);
      return c.json({ error: "Failed to update product: " + updateError.message }, 500);
    }
    
    // Update images if provided
    if (updates.images && updates.images.length > 0) {
      // Delete existing images
      await supabase
        .from("product_images")
        .delete()
        .eq("product_id", id);
      
      // Insert new images
      const imageInserts = updates.images.map((imageUrl: string, index: number) => ({
        product_id: id,
        image_url: imageUrl,
        alt_text: `${updatedProduct.name} - Image ${index + 1}`,
        sort_order: index,
        is_primary: index === 0
      }));
      
      await supabase
        .from("product_images")
        .insert(imageInserts);
    }
    
    // Fetch complete product
    const { data: completeProduct } = await supabase
      .from("products")
      .select(`
        *,
        product_images:product_images(image_url, alt_text, sort_order, is_primary)
      `)
      .eq("id", id)
      .single();
    
    if (!completeProduct) {
      return c.json({ product: updatedProduct });
    }
    
    // Transform to match frontend format
    const images = (completeProduct.product_images || [])
      .sort((a: any, b: any) => {
        if (a.is_primary) return -1;
        if (b.is_primary) return 1;
        return a.sort_order - b.sort_order;
      })
      .map((img: any) => img.image_url);
    
    const transformedProduct = {
      id: completeProduct.id,
      name: completeProduct.name,
      description: completeProduct.description,
      price: parseFloat(completeProduct.price),
      stock: completeProduct.stock,
      sold: completeProduct.sold || 0,
      category: updates.category || completeProduct.category_id,
      images: images.length > 0 ? images : ['https://via.placeholder.com/400'],
      rating: parseFloat(completeProduct.rating || 0),
      reviews: completeProduct.total_reviews || 0,
      sellerId: updates.sellerId || completeProduct.seller_id,
      sellerName: updates.sellerName || 'Unknown',
      sellerLocation: updates.sellerLocation || 'Unknown',
      sellerRating: 5.0,
      plantAge: completeProduct.plant_age,
      maxDeliveryRadius: completeProduct.max_delivery_radius,
      createdAt: completeProduct.created_at
    };
    
    return c.json({ product: transformedProduct });
  } catch (error: any) {
    console.log("Error updating product:", error);
    return c.json({ error: "Failed to update product: " + (error.message || "Unknown error") }, 500);
  }
});

// Delete product
app.delete("/make-server-0eb859c3/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const supabase = getSupabaseClient();
    
    // Check if product exists
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("id")
      .eq("id", id)
      .single();
    
    if (fetchError || !product) {
      return c.json({ error: "Product not found" }, 404);
    }
    
    // Delete product (cascade will delete images)
    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", id);
    
    if (deleteError) {
      console.log("Error deleting product:", deleteError);
      return c.json({ error: "Failed to delete product: " + deleteError.message }, 500);
    }
    
    return c.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    console.log("Error deleting product:", error);
    return c.json({ error: "Failed to delete product: " + (error.message || "Unknown error") }, 500);
  }
});

// ==================== PIN ROUTES ====================

// Set PIN for user
app.post("/make-server-0eb859c3/users/:email/set-pin", async (c) => {
  try {
    const email = decodeURIComponent(c.req.param("email"));
    const { pin } = await c.req.json();
    const supabase = getSupabaseClient();
    
    // Validate PIN
    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      return c.json({ error: "PIN must be 6 digits" }, 400);
    }
    
    // Get user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    
    if (userError || !user) {
      return c.json({ error: "User not found" }, 404);
    }
    
    // Hash PIN (simple hash for now, in production use bcrypt)
    // For now, we'll store it as-is but mark it for hashing later
    const pinHash = pin; // TODO: Hash with bcrypt in production
    
    // Update user with PIN
    const { error: updateError } = await supabase
      .from("users")
      .update({
        pin_hash: pinHash,
        has_pin: true,
        updated_at: new Date().toISOString()
      })
      .eq("email", email);
    
    if (updateError) {
      console.log("Error setting PIN:", updateError);
      return c.json({ error: "Failed to set PIN: " + updateError.message }, 500);
    }
    
    return c.json({ success: true });
  } catch (error: any) {
    console.log("Error setting PIN:", error);
    return c.json({ error: "Failed to set PIN: " + (error.message || "Unknown error") }, 500);
  }
});

// Verify PIN
app.post("/make-server-0eb859c3/users/:email/verify-pin", async (c) => {
  try {
    const email = decodeURIComponent(c.req.param("email"));
    const { pin } = await c.req.json();
    const supabase = getSupabaseClient();
    
    // Get user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("pin_hash")
      .eq("email", email)
      .maybeSingle();
    
    if (userError || !user) {
      return c.json({ error: "User not found" }, 404);
    }
    
    if (!user.pin_hash) {
      return c.json({ valid: false, error: "PIN not set" });
    }
    
    // Verify PIN (simple comparison for now, in production use bcrypt compare)
    const isValid = user.pin_hash === pin;
    
    return c.json({ valid: isValid });
  } catch (error: any) {
    console.log("Error verifying PIN:", error);
    return c.json({ error: "Failed to verify PIN: " + (error.message || "Unknown error") }, 500);
  }
});

// Change PIN
app.post("/make-server-0eb859c3/users/:email/change-pin", async (c) => {
  try {
    const email = decodeURIComponent(c.req.param("email"));
    const { newPin } = await c.req.json();
    const supabase = getSupabaseClient();
    
    // Validate PIN
    if (!newPin || newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      return c.json({ error: "PIN must be 6 digits" }, 400);
    }
    
    // Get user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    
    if (userError || !user) {
      return c.json({ error: "User not found" }, 404);
    }
    
    // Hash PIN (simple hash for now, in production use bcrypt)
    const pinHash = newPin; // TODO: Hash with bcrypt in production
    
    // Update user with new PIN
    const { error: updateError } = await supabase
      .from("users")
      .update({
        pin_hash: pinHash,
        updated_at: new Date().toISOString()
      })
      .eq("email", email);
    
    if (updateError) {
      console.log("Error changing PIN:", updateError);
      return c.json({ error: "Failed to change PIN: " + updateError.message }, 500);
    }
    
    return c.json({ success: true });
  } catch (error: any) {
    console.log("Error changing PIN:", error);
    return c.json({ error: "Failed to change PIN: " + (error.message || "Unknown error") }, 500);
  }
});

// ==================== CART ROUTES ====================

// Get cart for user
app.get("/make-server-0eb859c3/cart/:userId", async (c) => {
  try {
    const userId = decodeURIComponent(c.req.param("userId"));
    const supabase = getSupabaseClient();
    
    // Get user by email to get user_id
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", userId)
      .maybeSingle();
    
    if (userError || !user) {
      return c.json({ cart: [] });
    }
    
    // Get cart items from cart_items table
    const { data: cartItems, error: cartError } = await supabase
      .from("cart_items")
      .select("product_id, quantity")
      .eq("user_id", user.id);
    
    if (cartError && cartError.code !== 'PGRST116') {
      console.log("Error fetching cart:", cartError);
      return c.json({ cart: [] });
    }
    
    // Fetch full product details for each cart item
    const cart = await Promise.all((cartItems || []).map(async (item: any) => {
      // Get product details
      const { data: product } = await supabase
        .from("products")
        .select(`
          *,
          product_images:product_images(image_url, alt_text, sort_order, is_primary)
        `)
        .eq("id", item.product_id)
        .single();
      
      if (!product) {
        return null; // Skip invalid products
      }
      
      // Get seller info
      let sellerInfo = null;
      try {
        const { data: seller } = await supabase
          .from("users")
          .select("id, email, name, shop_name, shop_city")
          .eq("id", product.seller_id)
          .maybeSingle();
        
        if (seller) {
          sellerInfo = seller;
        }
      } catch (err) {
        console.log(`Error fetching seller for cart item ${item.product_id}:`, err);
      }
      
      // Transform images
      const images = (product.product_images || [])
        .sort((a: any, b: any) => {
          if (a.is_primary) return -1;
          if (b.is_primary) return 1;
          return a.sort_order - b.sort_order;
        })
        .map((img: any) => img.image_url);
      
      // Transform to frontend format
      return {
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: parseFloat(product.price),
          stock: product.stock,
          sold: product.sold || 0,
          category: product.category_id,
          images: images.length > 0 ? images : ['https://via.placeholder.com/400'],
          rating: parseFloat(product.rating || 0),
          reviews: product.total_reviews || 0,
          sellerId: sellerInfo?.email || product.seller_id,
          sellerName: sellerInfo?.shop_name || sellerInfo?.name || 'Unknown',
          sellerLocation: sellerInfo?.shop_city || 'Unknown',
          sellerRating: 5.0,
          plantAge: product.plant_age,
          maxDeliveryRadius: product.max_delivery_radius,
          createdAt: product.created_at
        },
        quantity: item.quantity
      };
    }));
    
    // Filter out null values (invalid products)
    const validCart = cart.filter(item => item !== null);
    
    return c.json({ cart: validCart });
  } catch (error: any) {
    console.log("Error fetching cart:", error);
    return c.json({ cart: [] });
  }
});

// Update cart
app.put("/make-server-0eb859c3/cart/:userId", async (c) => {
  try {
    const userId = decodeURIComponent(c.req.param("userId"));
    const { cart } = await c.req.json();
    const supabase = getSupabaseClient();
    
    // Get user by email to get user_id
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", userId)
      .maybeSingle();
    
    if (userError || !user) {
      return c.json({ error: "User not found" }, 404);
    }
    
    // Delete all existing cart items
    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);
    
    if (deleteError) {
      console.log("Error deleting existing cart items:", deleteError);
      // Continue anyway - might be first time
    }
    
    // Insert new cart items
    if (cart && Array.isArray(cart) && cart.length > 0) {
      const cartItemsToInsert = cart.map((item: any) => ({
        user_id: user.id,
        product_id: item.product?.id || item.productId,
        quantity: item.quantity || 1
      })).filter((item: any) => item.product_id); // Filter out invalid items
      
      if (cartItemsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from("cart_items")
          .insert(cartItemsToInsert);
        
        if (insertError) {
          console.log("Error inserting cart items:", insertError);
          return c.json({ error: "Failed to update cart: " + insertError.message }, 500);
        }
      }
    }
    
    return c.json({ cart });
  } catch (error: any) {
    console.log("Error updating cart:", error);
    return c.json({ error: "Failed to update cart: " + (error.message || "Unknown error") }, 500);
  }
});

// Clear cart
app.delete("/make-server-0eb859c3/cart/:userId", async (c) => {
  try {
    const userId = decodeURIComponent(c.req.param("userId"));
    const supabase = getSupabaseClient();
    
    // Get user by email to get user_id
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", userId)
      .maybeSingle();
    
    if (userError || !user) {
      return c.json({ error: "User not found" }, 404);
    }
    
    // Delete all cart items
    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);
    
    if (deleteError) {
      console.log("Error clearing cart:", deleteError);
      return c.json({ error: "Failed to clear cart: " + deleteError.message }, 500);
    }
    
    return c.json({ success: true, cart: [] });
  } catch (error: any) {
    console.log("Error clearing cart:", error);
    return c.json({ error: "Failed to clear cart: " + (error.message || "Unknown error") }, 500);
  }
});

// ==================== ORDER ROUTES ====================

// Create order
app.post("/make-server-0eb859c3/orders", async (c) => {
  try {
    const orderData = await c.req.json();
    const supabase = getSupabaseClient();
    
    console.log("[Create Order] Received order data:", {
      buyerEmail: orderData.buyerEmail,
      itemsCount: orderData.items?.length,
      paymentMethod: orderData.paymentMethod,
      total: orderData.total
    });
    
    // Validate required fields
    if (!orderData.buyerEmail || !orderData.items || orderData.items.length === 0) {
      return c.json({ error: "Missing required fields: buyerEmail, items" }, 400);
    }
    
    // Get buyer user
    const { data: buyer, error: buyerError } = await supabase
      .from("users")
      .select("id, email, name")
      .eq("email", orderData.buyerEmail)
      .maybeSingle();
    
    if (buyerError || !buyer) {
      console.log("[Create Order] Buyer not found:", buyerError);
      return c.json({ error: "Buyer not found" }, 404);
    }
    
    // Generate order number
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderNumber = `ORD-${dateStr}-${randomStr}`;
    
    // Create order in database
    const orderRecord: any = {
      order_number: orderNumber,
      buyer_id: buyer.id,
      shipping_name: orderData.shippingAddress?.name || buyer.name,
      shipping_phone: orderData.shippingAddress?.phone || '',
      shipping_address: orderData.shippingAddress?.address || '',
      shipping_city: orderData.shippingAddress?.city || '',
      subtotal: parseFloat(orderData.subtotal || 0),
      shipping_cost: parseFloat(orderData.shippingCost || 0),
      discount_amount: 0,
      total_amount: parseFloat(orderData.total || 0),
      payment_method: orderData.paymentMethod || 'cod',
      payment_status: orderData.paymentMethod === 'cod' ? 'cod' : 'pending',
      status: orderData.paymentMethod === 'cod' ? 'confirmed' : 'pending_payment',
      payment_proof_url: orderData.paymentProofUrl || null,
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };
    
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert(orderRecord)
      .select()
      .single();
    
    if (orderError || !newOrder) {
      console.log("[Create Order] Error creating order:", orderError);
      return c.json({ error: "Failed to create order: " + (orderError?.message || "Unknown error") }, 500);
    }
    
    console.log("[Create Order] Order created:", newOrder.id);
    
    // Create order items and update product stock
    const orderItems = [];
    for (const item of orderData.items) {
      // Get product to get seller_id and update stock
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("id, seller_id, stock, sold, name")
        .eq("id", item.productId)
        .single();
      
      if (productError || !product) {
        console.log("[Create Order] Product not found:", item.productId, productError);
        continue; // Skip this item
      }
      
      // Get product image
      const { data: productImage } = await supabase
        .from("product_images")
        .select("image_url")
        .eq("product_id", product.id)
        .eq("is_primary", true)
        .maybeSingle();
      
      // Create order item
      const orderItem = {
        order_id: newOrder.id,
        product_id: product.id,
        seller_id: product.seller_id,
        product_name: item.productName || product.name,
        product_image_url: productImage?.image_url || null,
        product_price: parseFloat(item.price || 0),
        quantity: parseInt(item.quantity || 1),
        subtotal: parseFloat(item.price || 0) * parseInt(item.quantity || 1),
        status: 'pending',
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      };
      
      const { data: newOrderItem, error: itemError } = await supabase
        .from("order_items")
        .insert(orderItem)
        .select()
        .single();
      
      if (itemError || !newOrderItem) {
        console.log("[Create Order] Error creating order item:", itemError);
        continue;
      }
      
      orderItems.push(newOrderItem);
      
      // Update product stock and sold count
      const newStock = Math.max(0, (product.stock || 0) - parseInt(item.quantity || 1));
      const newSold = (product.sold || 0) + parseInt(item.quantity || 1);
      
      const { error: updateProductError } = await supabase
        .from("products")
        .update({
          stock: newStock,
          sold: newSold,
          updated_at: now.toISOString()
        })
        .eq("id", product.id);
      
      if (updateProductError) {
        console.log("[Create Order] Error updating product stock:", updateProductError);
      }
    }
    
    if (orderItems.length === 0) {
      // If no items were created, delete the order
      await supabase.from("orders").delete().eq("id", newOrder.id);
      return c.json({ error: "Failed to create order items" }, 500);
    }
    
    // For COD, return order immediately
    if (orderData.paymentMethod === 'cod') {
      return c.json({ 
        order: {
          ...newOrder,
          items: orderItems
        },
        snapToken: null
      }, 201);
    }
    
    // For online payments, create Midtrans Snap Token (if configured)
    // For now, just return order without snap token
    // TODO: Integrate Midtrans if needed
    return c.json({ 
      order: {
        ...newOrder,
        items: orderItems
      },
      snapToken: null,
      warning: 'Online payment integration not configured'
    }, 201);
    
  } catch (error: any) {
    console.log("[Create Order] Error:", error);
    return c.json({ error: "Failed to create order: " + (error.message || "Unknown error") }, 500);
  }
});

// Get orders by buyer
app.get("/make-server-0eb859c3/orders/buyer/:buyerEmail", async (c) => {
  try {
    const buyerEmail = decodeURIComponent(c.req.param("buyerEmail"));
    const supabase = getSupabaseClient();
    
    // Get buyer user
    const { data: buyer, error: buyerError } = await supabase
      .from("users")
      .select("id")
      .eq("email", buyerEmail)
      .maybeSingle();
    
    if (buyerError || !buyer) {
      return c.json({ error: "Buyer not found" }, 404);
    }
    
    // Get orders
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .eq("buyer_id", buyer.id)
      .order("created_at", { ascending: false });
    
    if (ordersError) {
      return c.json({ error: "Failed to fetch orders: " + ordersError.message }, 500);
    }
    
    // Get order items for each order and map to Transaction format
    const ordersWithItems = await Promise.all((orders || []).map(async (order) => {
      const { data: items } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order.id);
      
      // Get seller info for each item
      const itemsWithSeller = await Promise.all((items || []).map(async (item: any) => {
        const { data: seller } = await supabase
          .from("users")
          .select("id, email, name, shop_name")
          .eq("id", item.seller_id)
          .maybeSingle();
        
        return {
          productId: item.product_id,
          productName: item.product_name,
          productImage: item.product_image_url || '',
          quantity: item.quantity,
          price: parseFloat(item.product_price || 0),
          sellerId: item.seller_id,
          sellerName: seller?.shop_name || seller?.name || 'Unknown'
        };
      }));
      
      // Map order status from database to frontend format
      // For COD orders, skip "pending_payment" status since payment is on delivery
      let status: string = order.status;
      if (order.payment_method === 'cod') {
        // COD orders: confirmed -> processing, processing -> processing, in_delivery -> shipped, etc.
        if (order.status === 'pending' || order.status === 'confirmed') {
          status = 'processing';
        } else if (order.status === 'processing') {
          status = 'processing';
        } else if (order.status === 'in_delivery') {
          status = 'shipped';
        } else if (order.status === 'delivered' || order.status === 'completed') {
          status = 'completed';
        } else if (order.status === 'cancelled' || order.status === 'refunded') {
          status = 'cancelled';
        } else {
          status = 'processing'; // Default for COD
        }
      } else {
        // Online payment orders: can have pending_payment status
        if (order.status === 'pending_payment') {
          status = 'pending';
        } else if (order.status === 'pending') {
          status = 'pending';
        } else if (order.status === 'confirmed' || order.status === 'processing') {
          status = 'processing';
        } else if (order.status === 'in_delivery') {
          status = 'shipped';
        } else if (order.status === 'delivered' || order.status === 'completed') {
          status = 'completed';
        } else if (order.status === 'cancelled' || order.status === 'refunded') {
          status = 'cancelled';
        }
      }
      
      // Format shipping address
      const shippingAddress = [
        order.shipping_address,
        order.shipping_city,
        order.shipping_province
      ].filter(Boolean).join(', ');
      
      return {
        id: order.id,
        orderNumber: order.order_number,
        date: order.created_at,
        status: status as 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled',
        items: itemsWithSeller,
        subtotal: parseFloat(order.subtotal || 0),
        shippingCost: parseFloat(order.shipping_cost || 0),
        total: parseFloat(order.total_amount || 0),
        shippingAddress: shippingAddress,
        trackingNumber: order.tracking_number || undefined,
        estimatedDelivery: order.estimated_delivery_date || undefined,
        paymentMethod: order.payment_method || 'cod'
      };
    }));
    
    return c.json({ orders: ordersWithItems });
  } catch (error: any) {
    console.log("Error fetching buyer orders:", error);
    return c.json({ error: "Failed to fetch orders: " + (error.message || "Unknown error") }, 500);
  }
});

// Get orders by seller
app.get("/make-server-0eb859c3/orders/seller/:sellerEmail", async (c) => {
  try {
    const sellerEmail = decodeURIComponent(c.req.param("sellerEmail"));
    const supabase = getSupabaseClient();
    
    // Get seller user
    const { data: seller, error: sellerError } = await supabase
      .from("users")
      .select("id")
      .eq("email", sellerEmail)
      .maybeSingle();
    
    if (sellerError || !seller) {
      return c.json({ error: "Seller not found" }, 404);
    }
    
    // Get order items for this seller
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("*, orders(*)")
      .eq("seller_id", seller.id)
      .order("created_at", { ascending: false });
    
    if (itemsError) {
      return c.json({ error: "Failed to fetch orders: " + itemsError.message }, 500);
    }
    
    // Group items by order
    const ordersMap = new Map();
    (orderItems || []).forEach((item: any) => {
      const order = item.orders;
      if (!order || !order.id) return; // Skip if order is null or missing id
      
      if (!ordersMap.has(order.id)) {
        ordersMap.set(order.id, {
          ...order,
          items: []
        });
      }
      if (item && item.id) {
        ordersMap.get(order.id).items.push(item);
      }
    });
    
    const rawOrders = Array.from(ordersMap.values());
    
    // Transform to SellerTransaction format
    const ordersWithItems = await Promise.all((rawOrders || []).map(async (order: any) => {
      // Get buyer info
      const { data: buyer } = await supabase
        .from("users")
        .select("id, name, phone")
        .eq("id", order.buyer_id)
        .maybeSingle();
      
      // Transform order items
      const transformedItems = (order.items || [])
        .filter((item: any) => item && item.id) // Filter out null/undefined items
        .map((item: any) => ({
          productId: item.product_id || '',
          productName: item.product_name || 'Unknown Product',
          productImage: item.product_image_url || '',
          quantity: parseInt(item.quantity || 0),
          price: parseFloat(item.product_price || 0)
        }));
      
      // Calculate totals
      const subtotal = transformedItems.reduce((sum: number, item: any) => 
        sum + (item.price * item.quantity), 0
      );
      const commission = Math.round(subtotal * 0.1); // 10% platform fee
      const netIncome = subtotal - commission;
      
      // Map order status from database to frontend format
      let status: string = order.status;
      if (order.payment_method === 'cod') {
        if (order.status === 'pending' || order.status === 'confirmed') {
          status = 'processing';
        } else if (order.status === 'processing') {
          status = 'processing';
        } else if (order.status === 'in_delivery') {
          status = 'shipped';
        } else if (order.status === 'delivered' || order.status === 'completed') {
          status = 'completed';
        } else if (order.status === 'cancelled' || order.status === 'refunded') {
          status = 'cancelled';
        } else {
          status = 'processing';
        }
      } else {
        if (order.status === 'pending_payment') {
          status = 'pending';
        } else if (order.status === 'pending') {
          status = 'pending';
        } else if (order.status === 'confirmed' || order.status === 'processing') {
          status = 'processing';
        } else if (order.status === 'in_delivery') {
          status = 'shipped';
        } else if (order.status === 'delivered' || order.status === 'completed') {
          status = 'completed';
        } else if (order.status === 'cancelled' || order.status === 'refunded') {
          status = 'cancelled';
        }
      }
      
      // Format shipping address
      const shippingAddress = [
        order.shipping_address,
        order.shipping_city,
        order.shipping_province
      ].filter(Boolean).join(', ');
      
      return {
        id: order.id || '',
        orderNumber: order.order_number || `ORD-${order.id?.substring(0, 8) || 'UNKNOWN'}`,
        date: order.created_at || new Date().toISOString(),
        status: status as 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled',
        items: transformedItems,
        subtotal: subtotal || 0,
        commission: commission || 0,
        netIncome: netIncome || 0,
        buyerName: buyer?.name || 'Unknown',
        buyerPhone: buyer?.phone || '',
        buyerId: order.buyer_id || '', // Add buyerId for chat functionality
        shippingAddress: shippingAddress || 'Alamat tidak tersedia',
        trackingNumber: order.tracking_number || undefined,
        estimatedDelivery: order.estimated_delivery_date || undefined,
        paymentMethod: order.payment_method || 'cod',
        paymentProofUrl: order.payment_proof_url || undefined
      };
    }));
    
    return c.json({ orders: ordersWithItems });
  } catch (error: any) {
    console.log("Error fetching seller orders:", error);
    return c.json({ error: "Failed to fetch orders: " + (error.message || "Unknown error") }, 500);
  }
});

// Get order by ID
app.get("/make-server-0eb859c3/orders/:id", async (c) => {
  try {
    const orderId = c.req.param("id");
    const supabase = getSupabaseClient();
    
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();
    
    if (orderError || !order) {
      return c.json({ error: "Order not found" }, 404);
    }
    
    // Get order items
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);
    
    return c.json({ 
      order: {
        ...order,
        items: items || []
      }
    });
  } catch (error: any) {
    console.log("Error fetching order:", error);
    return c.json({ error: "Failed to fetch order: " + (error.message || "Unknown error") }, 500);
  }
});

// Update order status
app.put("/make-server-0eb859c3/orders/:id/status", async (c) => {
  try {
    const orderId = c.req.param("id");
    const { status, trackingNumber } = await c.req.json();
    const supabase = getSupabaseClient();
    
    console.log(`[Update Order Status] Order ID: ${orderId}, Status: ${status}, Tracking: ${trackingNumber || 'N/A'}`);
    
    // Build update object
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };
    
    // Add tracking number if provided
    if (trackingNumber) {
      updateData.tracking_number = trackingNumber;
    }
    
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId)
      .select()
      .single();
    
    if (updateError || !updatedOrder) {
      console.log("Error updating order:", updateError);
      return c.json({ error: "Failed to update order: " + (updateError?.message || "Unknown error") }, 500);
    }
    
    console.log(`[Update Order Status] Successfully updated order ${orderId} to status ${status}`);
    
    return c.json({ order: updatedOrder });
  } catch (error: any) {
    console.log("Error updating order status:", error);
    return c.json({ error: "Failed to update order: " + (error.message || "Unknown error") }, 500);
  }
});

// ==================== CHAT ROUTES ====================

// Get chat conversations for user
app.get("/make-server-0eb859c3/chats/:email", async (c) => {
  try {
    const email = decodeURIComponent(c.req.param("email"));
    const supabase = getSupabaseClient();
    
    // Get user by email
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, name, email, role")
      .eq("email", email)
      .single();
    
    if (userError || !user) {
      return c.json({ error: "User not found" }, 404);
    }
    
    // Get conversations where user is buyer or seller
    // Use separate queries to avoid .or() issues
    // Note: We don't filter by is_active to show all conversations, including newly created ones
    const { data: conversationsAsBuyer, error: buyerError } = await supabase
      .from("chat_conversations")
      .select(`
        id,
        buyer_id,
        seller_id,
        product_id,
        last_message_text,
        last_message_at,
        unread_count_buyer,
        unread_count_seller,
        created_at,
        updated_at,
        is_active,
        buyer:users!chat_conversations_buyer_id_fkey(id, name, email, avatar_url),
        seller:users!chat_conversations_seller_id_fkey(id, name, email, avatar_url),
        product:products(id, name, image_url)
      `)
      .eq("buyer_id", user.id);
    
    const { data: conversationsAsSeller, error: sellerError } = await supabase
      .from("chat_conversations")
      .select(`
        id,
        buyer_id,
        seller_id,
        product_id,
        last_message_text,
        last_message_at,
        unread_count_buyer,
        unread_count_seller,
        created_at,
        updated_at,
        is_active,
        buyer:users!chat_conversations_buyer_id_fkey(id, name, email, avatar_url),
        seller:users!chat_conversations_seller_id_fkey(id, name, email, avatar_url),
        product:products(id, name, image_url)
      `)
      .eq("seller_id", user.id);
    
    console.log(`[Get Conversations] Found ${conversationsAsBuyer?.length || 0} as buyer, ${conversationsAsSeller?.length || 0} as seller for user ${user.email}`);
    
    if (buyerError) {
      console.log("Error fetching conversations as buyer:", buyerError);
    }
    if (sellerError) {
      console.log("Error fetching conversations as seller:", sellerError);
    }
    
    if (buyerError || sellerError) {
      return c.json({ error: "Failed to fetch conversations" }, 500);
    }
    
    // Combine and deduplicate conversations
    const allConversations = [...(conversationsAsBuyer || []), ...(conversationsAsSeller || [])];
    const uniqueConversations = Array.from(
      new Map(allConversations.map(conv => [conv.id, conv])).values()
    );
    
    // Sort by last_message_at
    const conversations = uniqueConversations.sort((a, b) => {
      const aTime = a.last_message_at || a.created_at;
      const bTime = b.last_message_at || b.created_at;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
    
    console.log(`[Get Conversations] Found ${conversations.length} conversations for user ${user.email} (${user.role})`);
    
    // Format conversations for frontend
    const formattedConversations = (conversations || []).map((conv: any) => {
      const isBuyer = conv.buyer_id === user.id;
      const participant = isBuyer ? conv.seller : conv.buyer;
      const unreadCount = isBuyer ? (conv.unread_count_buyer || 0) : (conv.unread_count_seller || 0);
      
      console.log(`[Format Conversation] User ${user.email} (${user.role}) - isBuyer: ${isBuyer}, participant:`, participant?.name);
      
      return {
        id: conv.id,
        participantName: participant?.name || "Unknown",
        participantRole: isBuyer ? "seller" : "buyer",
        orderId: null, // Can be linked to order if needed
        orderNumber: null,
        lastMessage: conv.last_message_text || "",
        lastMessageTime: conv.last_message_at || conv.created_at,
        unreadCount: unreadCount,
        isOnline: false, // Can be implemented with presence system
        avatar: participant?.avatar_url || null,
        productId: conv.product_id,
        productName: conv.product?.name || null,
        productImage: conv.product?.image_url || null,
      };
    });
    
    console.log(`[Get Conversations] Formatted ${formattedConversations.length} conversations for ${user.email}`);
    
    return c.json({ chats: formattedConversations });
  } catch (error: any) {
    console.log("Error fetching conversations:", error);
    return c.json({ error: "Failed to fetch conversations" }, 500);
  }
});

// Get or create chat conversation
app.post("/make-server-0eb859c3/chats", async (c) => {
  try {
    const { buyerId, sellerId, productId, orderId } = await c.req.json();
    const supabase = getSupabaseClient();
    
    console.log("[Create Chat] Request:", { buyerId, sellerId, productId, orderId });
    
    if (!buyerId || !sellerId) {
      console.log("[Create Chat] Missing buyerId or sellerId");
      return c.json({ error: "buyerId and sellerId are required" }, 400);
    }
    
    // Validate UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(buyerId)) {
      console.log("[Create Chat] Invalid buyerId format:", buyerId);
      return c.json({ error: "Invalid buyerId format (must be UUID)" }, 400);
    }
    if (!uuidRegex.test(sellerId)) {
      console.log("[Create Chat] Invalid sellerId format:", sellerId);
      return c.json({ error: "Invalid sellerId format (must be UUID)" }, 400);
    }
    
    // Check if conversation already exists
    // Build query conditionally
    let queryBuilder = supabase
      .from("chat_conversations")
      .select("*")
      .eq("buyer_id", buyerId)
      .eq("seller_id", sellerId);
    
    if (productId) {
      queryBuilder = queryBuilder.eq("product_id", productId);
    } else {
      queryBuilder = queryBuilder.is("product_id", null);
    }
    
    const { data: existingConv, error: checkError } = await queryBuilder.maybeSingle();
    
    console.log("[Create Chat] Existing conversation check:", { 
      found: !!existingConv, 
      error: checkError?.message 
    });
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.log("Error checking conversation:", checkError);
      return c.json({ error: "Failed to check conversation" }, 500);
    }
    
    if (existingConv) {
      // Return existing conversation
      const { data: buyer } = await supabase.from("users").select("id, name, email, avatar_url").eq("id", buyerId).single();
      const { data: seller } = await supabase.from("users").select("id, name, email, avatar_url").eq("id", sellerId).single();
      
      // Get product info if productId exists
      let productName = null;
      let productImage = null;
      if (existingConv.product_id) {
        const { data: product } = await supabase
          .from("products")
          .select("name, image_url")
          .eq("id", existingConv.product_id)
          .maybeSingle();
        productName = product?.name || null;
        productImage = product?.image_url || null;
      }
      
      console.log("[Create Chat] Returning existing conversation:", existingConv.id);
      
      return c.json({
        chat: {
          id: existingConv.id,
          participantName: seller?.name || "Penjual",
          participantRole: "seller",
          orderId: orderId || null,
          orderNumber: null,
          lastMessage: existingConv.last_message_text || "",
          lastMessageTime: existingConv.last_message_at || existingConv.created_at,
          unreadCount: existingConv.unread_count_buyer || 0,
          isOnline: false,
          avatar: seller?.avatar_url || null,
          productId: existingConv.product_id,
          productName: productName,
          productImage: productImage,
        }
      });
    }
    
    // Create new conversation
    const { data: newConv, error: createError } = await supabase
      .from("chat_conversations")
      .insert({
        buyer_id: buyerId,
        seller_id: sellerId,
        product_id: productId || null,
        last_message_text: null,
        last_message_at: null,
        unread_count_buyer: 0,
        unread_count_seller: 0,
        is_active: true,
      })
      .select()
      .single();
    
    if (createError || !newConv) {
      console.log("Error creating conversation:", createError);
      console.log("Create error details:", JSON.stringify(createError, null, 2));
      return c.json({ 
        error: "Failed to create conversation: " + (createError?.message || "Unknown error"),
        details: createError 
      }, 500);
    }
    
    console.log("[Create Chat] New conversation created:", newConv.id);
    
    // Get participant info
    const { data: buyer } = await supabase.from("users").select("id, name, email, avatar_url").eq("id", buyerId).single();
    const { data: seller } = await supabase.from("users").select("id, name, email, avatar_url").eq("id", sellerId).single();
    
    // Get product info if productId exists
    let productName = null;
    let productImage = null;
    if (productId) {
      const { data: product } = await supabase
        .from("products")
        .select("name, image_url")
        .eq("id", productId)
        .maybeSingle();
      productName = product?.name || null;
      productImage = product?.image_url || null;
    }
    
    console.log("[Create Chat] New conversation created:", newConv.id);
    
    return c.json({
      chat: {
        id: newConv.id,
        participantName: seller?.name || "Penjual",
        participantRole: "seller",
        orderId: orderId || null,
        orderNumber: null,
        lastMessage: "",
        lastMessageTime: newConv.created_at,
        unreadCount: 0,
        isOnline: false,
        avatar: seller?.avatar_url || null,
        productId: productId || null,
        productName: productName,
        productImage: productImage,
      }
    }, 201);
  } catch (error: any) {
    console.log("Error creating conversation:", error);
    return c.json({ error: "Failed to create conversation" }, 500);
  }
});

// Get messages for conversation
app.get("/make-server-0eb859c3/chats/:chatId/messages", async (c) => {
  try {
    const chatId = c.req.param("chatId");
    const supabase = getSupabaseClient();
    
    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from("chat_messages")
      .select(`
        id,
        sender_id,
        message_text,
        message_type,
        attachment_url,
        is_read,
        read_at,
        created_at,
        sender:users!chat_messages_sender_id_fkey(id, name, email, avatar_url)
      `)
      .eq("conversation_id", chatId)
      .order("created_at", { ascending: true });
    
    if (messagesError) {
      console.log("Error fetching messages:", messagesError);
      return c.json({ error: "Failed to fetch messages" }, 500);
    }
    
    // Format messages for frontend
    const formattedMessages = (messages || []).map((msg: any) => ({
      id: msg.id,
      senderId: msg.sender_id,
      senderName: msg.sender?.name || "Unknown",
      message: msg.message_text,
      timestamp: msg.created_at,
      type: msg.message_type || "text",
      imageUrl: msg.attachment_url || null,
      isRead: msg.is_read || false,
    }));
    
    return c.json({ messages: formattedMessages });
  } catch (error: any) {
    console.log("Error fetching messages:", error);
    return c.json({ error: "Failed to fetch messages" }, 500);
  }
});

// Send message
app.post("/make-server-0eb859c3/chats/:chatId/messages", async (c) => {
  try {
    const chatId = c.req.param("chatId");
    const { senderId, message, messageType, attachmentUrl } = await c.req.json();
    const supabase = getSupabaseClient();
    
    if (!senderId || !message) {
      return c.json({ error: "senderId and message are required" }, 400);
    }
    
    // Create message
    const { data: newMessage, error: messageError } = await supabase
      .from("chat_messages")
      .insert({
        conversation_id: chatId,
        sender_id: senderId,
        message_text: message,
        message_type: messageType || "text",
        attachment_url: attachmentUrl || null,
        is_read: false,
      })
      .select(`
        id,
        sender_id,
        message_text,
        message_type,
        attachment_url,
        is_read,
        created_at,
        sender:users!chat_messages_sender_id_fkey(id, name, email, avatar_url)
      `)
      .single();
    
    if (messageError || !newMessage) {
      console.log("Error sending message:", messageError);
      return c.json({ error: "Failed to send message" }, 500);
    }
    
    // Update conversation last message
    const { error: updateConvError } = await supabase
      .from("chat_conversations")
      .update({
        last_message_text: message,
        last_message_at: newMessage.created_at,
        updated_at: new Date().toISOString(),
      })
      .eq("id", chatId);
    
    if (updateConvError) {
      console.log("Error updating conversation:", updateConvError);
    }
    
    // Get conversation to determine who should get unread count
    const { data: conversation, error: convError } = await supabase
      .from("chat_conversations")
      .select("buyer_id, seller_id, unread_count_buyer, unread_count_seller")
      .eq("id", chatId)
      .single();
    
    if (convError) {
      console.log("Error fetching conversation for unread count:", convError);
    }
    
    if (conversation) {
      const isBuyer = conversation.buyer_id === senderId;
      
      // Get current unread count and increment
      const currentUnread = isBuyer 
        ? (conversation.unread_count_seller || 0)
        : (conversation.unread_count_buyer || 0);
      
      const updateData = isBuyer 
        ? { unread_count_seller: currentUnread + 1 }
        : { unread_count_buyer: currentUnread + 1 };
      
      const { error: updateUnreadError } = await supabase
        .from("chat_conversations")
        .update(updateData)
        .eq("id", chatId);
      
      if (updateUnreadError) {
        console.log("Error updating unread count:", updateUnreadError);
      } else {
        console.log(`[Send Message] Updated unread count for ${isBuyer ? 'seller' : 'buyer'}: ${currentUnread + 1}`);
      }
    }
    
    // Format message for frontend
    const formattedMessage = {
      id: newMessage.id,
      senderId: newMessage.sender_id,
      senderName: newMessage.sender?.name || "Unknown",
      message: newMessage.message_text,
      timestamp: newMessage.created_at,
      type: newMessage.message_type || "text",
      imageUrl: newMessage.attachment_url || null,
      isRead: newMessage.is_read || false,
    };
    
    return c.json({ message: formattedMessage }, 201);
  } catch (error: any) {
    console.log("Error sending message:", error);
    return c.json({ error: "Failed to send message" }, 500);
  }
});

// Mark messages as read
app.put("/make-server-0eb859c3/chats/:chatId/read", async (c) => {
  try {
    const chatId = c.req.param("chatId");
    const { userId } = await c.req.json();
    const supabase = getSupabaseClient();
    
    // Get conversation
    const { data: conversation } = await supabase
      .from("chat_conversations")
      .select("buyer_id, seller_id")
      .eq("id", chatId)
      .single();
    
    if (!conversation) {
      return c.json({ error: "Conversation not found" }, 404);
    }
    
    // Mark messages as read
    const { error: readError } = await supabase
      .from("chat_messages")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("conversation_id", chatId)
      .neq("sender_id", userId)
      .eq("is_read", false);
    
    if (readError) {
      console.log("Error marking messages as read:", readError);
    }
    
    // Reset unread count
    const isBuyer = conversation.buyer_id === userId;
    const updateField = isBuyer ? "unread_count_buyer" : "unread_count_seller";
    
    const { error: updateError } = await supabase
      .from("chat_conversations")
      .update({
        [updateField]: 0,
      })
      .eq("id", chatId);
    
    if (updateError) {
      console.log("Error updating unread count:", updateError);
    }
    
    return c.json({ success: true });
  } catch (error: any) {
    console.log("Error marking messages as read:", error);
    return c.json({ error: "Failed to mark messages as read" }, 500);
  }
});

// ==================== REVIEW ROUTES ====================

// Get reviews for a product
app.get("/make-server-0eb859c3/reviews/product/:productId", async (c) => {
  try {
    const productId = c.req.param("productId");
    const supabase = getSupabaseClient();
    
    const { data: reviews, error } = await supabase
      .from("product_reviews")
      .select(`
        *,
        user:users(id, name, avatar_url)
      `)
      .eq("product_id", productId)
      .eq("is_visible", true)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.log("Error fetching reviews:", error);
      return c.json({ error: "Failed to fetch reviews: " + error.message }, 500);
    }
    
    return c.json({ reviews: reviews || [] });
  } catch (error: any) {
    console.log("Error fetching reviews:", error);
    return c.json({ error: "Failed to fetch reviews: " + (error.message || "Unknown error") }, 500);
  }
});

// Create a review
app.post("/make-server-0eb859c3/reviews", async (c) => {
  try {
    const { productId, orderId, userId, rating, reviewText, title } = await c.req.json();
    const supabase = getSupabaseClient();
    
    if (!productId || !userId || !rating || !reviewText) {
      return c.json({ error: "Missing required fields: productId, userId, rating, reviewText" }, 400);
    }
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return c.json({ error: "Rating must be between 1 and 5" }, 400);
    }
    
    // Check if user already reviewed this product for this order (if orderId provided)
    if (orderId) {
      const { data: existingReview } = await supabase
        .from("product_reviews")
        .select("id")
        .eq("order_id", orderId)
        .eq("user_id", userId)
        .maybeSingle();
      
      if (existingReview) {
        return c.json({ error: "You have already reviewed this product for this order" }, 400);
      }
    }
    
    // Create review
    const { data: review, error: reviewError } = await supabase
      .from("product_reviews")
      .insert({
        product_id: productId,
        order_id: orderId || null,
        user_id: userId,
        rating: rating,
        title: title || null,
        review_text: reviewText,
        is_verified_purchase: !!orderId, // Verified if orderId is provided
        is_visible: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (reviewError) {
      console.log("Error creating review:", reviewError);
      return c.json({ error: "Failed to create review: " + reviewError.message }, 500);
    }
    
    // The database trigger will automatically update product rating and total_reviews
    // But let's verify it worked by fetching the updated product
    const { data: updatedProduct } = await supabase
      .from("products")
      .select("rating, total_reviews")
      .eq("id", productId)
      .single();
    
    console.log(`[Create Review] Review created for product ${productId}. Updated rating: ${updatedProduct?.rating}, total reviews: ${updatedProduct?.total_reviews}`);
    
    return c.json({ review }, 201);
  } catch (error: any) {
    console.log("Error creating review:", error);
    return c.json({ error: "Failed to create review: " + (error.message || "Unknown error") }, 500);
  }
});

// Get seller payment info
app.get("/make-server-0eb859c3/sellers/:sellerId/payment-info", async (c) => {
  try {
    const sellerId = decodeURIComponent(c.req.param("sellerId"));
    const supabase = getSupabaseClient();
    
    // sellerId can be email or UUID
    // First try to get user by email
    let userId: string | null = null;
    const { data: userByEmail } = await supabase
      .from("users")
      .select("id")
      .eq("email", sellerId)
      .maybeSingle();
    
    if (userByEmail) {
      userId = userByEmail.id;
    } else {
      // If not found by email, assume sellerId is UUID
      userId = sellerId;
    }
    
    // Get seller profile with payment info
    const { data: sellerProfile, error } = await supabase
      .from("seller_profiles")
      .select("bank_name, bank_account_number, bank_account_name, e_wallet_types, e_wallet_phone")
      .eq("user_id", userId)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      console.log("Error fetching seller payment info:", error);
      return c.json({ error: "Failed to fetch payment info: " + error.message }, 500);
    }
    
    if (!sellerProfile) {
      return c.json({ 
        bankName: null,
        bankAccountNumber: null,
        bankAccountName: null,
        eWalletTypes: [],
        eWalletPhone: null
      });
    }
    
    return c.json({
      bankName: sellerProfile.bank_name || null,
      bankAccountNumber: sellerProfile.bank_account_number || null,
      bankAccountName: sellerProfile.bank_account_name || null,
      eWalletTypes: sellerProfile.e_wallet_types || [],
      eWalletPhone: sellerProfile.e_wallet_phone || null
    });
  } catch (error: any) {
    console.log("Error fetching seller payment info:", error);
    return c.json({ error: "Failed to fetch payment info: " + (error.message || "Unknown error") }, 500);
  }
});

Deno.serve(app.fetch);

