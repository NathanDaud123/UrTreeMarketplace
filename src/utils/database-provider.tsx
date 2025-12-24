import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { userAPI, productAPI, cartAPI, orderAPI, chatAPI } from './api';
import { checkAndSeedData } from './seed-data';
import { createClient } from '@jsr/supabase__supabase-js@2.49.8';
import { supabaseUrl, publicAnonKey } from './supabase/info';
import { toast } from 'sonner@2.0.3';
import type { User, Product, CartItem } from '../App';
import type { Transaction } from '../components/transaction-history-buyer';
import type { SellerTransaction } from '../components/transaction-history-seller';
import type { ChatConversation } from '../components/chat-page';

// Create Supabase client for Auth
const supabase = createClient(supabaseUrl, publicAnonKey);

interface DatabaseContextType {
  // User
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<{ user: User; message?: string }>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  applySeller: (sellerData: any) => Promise<void>;
  switchRole: (newRole: 'buyer' | 'seller') => Promise<void>;
  
  // PIN Security
  setPin: (email: string, pin: string) => Promise<void>;
  verifyPin: (email: string, pin: string) => Promise<boolean>;
  changePin: (email: string, newPin: string) => Promise<void>;

  // Products
  products: Product[];
  loadProducts: (filters?: { category?: string; search?: string }) => Promise<void>;
  sellerProducts: Product[];
  loadSellerProducts: () => Promise<void>;
  createProduct: (productData: any) => Promise<void>;
  updateProduct: (id: string, updates: any) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Cart
  cart: CartItem[];
  loadCart: () => Promise<void>;
  updateCart: (newCart: CartItem[]) => Promise<void>;
  clearCart: () => Promise<void>;

  // Orders
  buyerOrders: Transaction[];
  sellerOrders: SellerTransaction[];
  loadBuyerOrders: () => Promise<void>;
  loadSellerOrders: () => Promise<void>;
  createOrder: (orderData: any) => Promise<any>;
  updateOrderStatus: (orderId: string, status: string, trackingNumber?: string) => Promise<void>;

  // Chat
  chatConversations: ChatConversation[];
  loadChatConversations: () => Promise<void>;

  // Loading states
  isLoading: boolean;
  isInitialized: boolean;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export function useDatabaseContext() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabaseContext must be used within DatabaseProvider');
  }
  return context;
}

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [buyerOrders, setBuyerOrders] = useState<Transaction[]>([]);
  const [sellerOrders, setSellerOrders] = useState<SellerTransaction[]>([]);
  const [chatConversations, setChatConversations] = useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load user from localStorage on mount (session persistence)
  // SECURITY: Only restore session if user exists and is valid, and not logged out
  useEffect(() => {
    const loadUserSession = async () => {
      try {
        // SECURITY: Check if user has explicitly logged out
        const logoutFlag = localStorage.getItem('urtree_logout_flag');
        if (logoutFlag) {
          console.log('⚠️ Logout flag detected, skipping session restore');
          // Clear logout flag and email
          localStorage.removeItem('urtree_logout_flag');
          localStorage.removeItem('urtree_user_email');
          return;
        }
        
        const savedUserEmail = localStorage.getItem('urtree_user_email');
        if (savedUserEmail) {
          console.log('Loading user session from localStorage:', savedUserEmail);
          const userResponse = await userAPI.getUser(savedUserEmail);
          if (userResponse?.user) {
            // SECURITY: Verify user is active before restoring session
            if (!userResponse.user.is_active) {
              console.warn('⚠️ User is inactive, clearing session');
              localStorage.removeItem('urtree_user_email');
              return;
            }
            
            setCurrentUser(userResponse.user);
            console.log('✅ User session restored:', userResponse.user.email, 'Role:', userResponse.user.role);
            
            // Load cart if user is buyer
            if (userResponse.user.role === 'buyer') {
              await loadCart(userResponse.user.email);
            }
          } else {
            // User not found, clear session
            console.warn('⚠️ User not found, clearing session');
            localStorage.removeItem('urtree_user_email');
          }
        }
      } catch (error) {
        console.error('Error loading user session:', error);
        // Clear invalid session
        localStorage.removeItem('urtree_user_email');
        localStorage.removeItem('urtree_logout_flag');
      }
    };
    
    loadUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cart functions (defined early so it can be used in OAuth callback)
  const loadCart = async (userEmail?: string) => {
    const email = userEmail || currentUser?.email;
    if (!email) return;
    
    // Check if user is buyer (we'll check after setting currentUser)
    try {
      const { cart: loadedCart } = await cartAPI.get(email);
      setCart(loadedCart);
    } catch (error) {
      console.error('Load cart failed:', error);
    }
  };

  // Helper function to sync Google user to our database
  const syncGoogleUserToDatabase = async (supabaseUser: any) => {
    try {
      const userEmail = supabaseUser.email;
      
      // IMPORTANT: Always use existing user if email matches (synchronize accounts)
      if (!userEmail) {
        console.error('No email in Supabase user');
        return;
      }
      
      // Check if user exists in our database (KV Store)
      let dbUser;
      try {
        const userResponse = await userAPI.getUser(userEmail);
        dbUser = userResponse?.user;
        console.log('✅ User found in database:', userEmail);
      } catch (error: any) {
        // User doesn't exist (404) or network error
        if (error.message?.includes('not found') || error.message?.includes('404')) {
          console.log('User not found, will create new user:', userEmail);
          dbUser = null;
        } else if (error.message?.includes('Tidak dapat terhubung') || 
                   error.message?.includes('NetworkError')) {
          console.warn('Network error checking user:', error.message);
          // For network errors, we'll try to create user but use fallback if it fails
          dbUser = null;
        } else {
          // Other errors - log but continue
          console.warn('Error checking user, will try to create:', error.message);
          dbUser = null;
        }
      }
      
      if (dbUser) {
        // User already exists - UPDATE with Google info to sync accounts
        console.log('✅ User exists, syncing Google info:', userEmail);
        try {
          await userAPI.updateUser(userEmail, {
            googleId: supabaseUser.id,
            avatar: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture,
            loginMethod: 'google'
          });
          console.log('✅ Google info synced to existing user:', userEmail);
          
          // Refresh user data to get updated info
          try {
            const userResponse = await userAPI.getUser(userEmail);
            dbUser = userResponse?.user || dbUser;
          } catch (getError) {
            console.warn('Can\'t refresh user, using existing data');
          }
        } catch (updateError) {
          console.warn('Failed to sync Google info, but user exists:', updateError);
        }
      } else {
        // Create new user in our database
        const userName = supabaseUser.user_metadata?.full_name || 
                        supabaseUser.user_metadata?.name || 
                        supabaseUser.email?.split('@')[0] || 
                        'User';
        
        const newUser = {
          email: userEmail,
          name: userName,
          password: 'google-oauth-' + Date.now(), // Auto-generated, user won't use this
          role: 'buyer',
          isPendingSeller: false,
          hasSellerAccount: false,
          createdAt: new Date().toISOString(),
          googleId: supabaseUser.id,
          avatar: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture,
          loginMethod: 'google'
        };
        
        // Try to register user in our system
        try {
          await userAPI.register(newUser.email, newUser.password, newUser.name);
          console.log('✅ New user registered:', userEmail);
          
          // Update with Google info
          try {
            await userAPI.updateUser(newUser.email, {
              googleId: newUser.googleId,
              avatar: newUser.avatar,
              loginMethod: 'google'
            });
            console.log('✅ Google info updated for user:', userEmail);
          } catch (updateError) {
            // If update fails, continue anyway (user is already created)
            console.warn('Failed to update Google info, but user is created:', updateError);
          }
          
          // Get the created user from database to ensure we have all fields
          try {
            const userResponse = await userAPI.getUser(userEmail);
            dbUser = userResponse?.user || newUser;
          } catch (getError) {
            // If we can't get user, use the newUser data we have
            console.warn('Can\'t fetch created user, using local data');
            dbUser = newUser;
          }
        } catch (registerError: any) {
          // If register fails, it might be because user already exists
          // Try to get the existing user
          console.log('Register failed, checking if user already exists:', registerError.message);
          
          try {
            const userResponse = await userAPI.getUser(userEmail);
            dbUser = userResponse?.user;
            console.log('✅ User already exists, syncing Google info:', userEmail);
            
            // Sync Google info to existing user
            try {
              await userAPI.updateUser(userEmail, {
                googleId: supabaseUser.id,
                avatar: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture,
                loginMethod: 'google'
              });
              console.log('✅ Google info synced to existing user');
              
              // Refresh user data
              const refreshedResponse = await userAPI.getUser(userEmail);
              dbUser = refreshedResponse?.user || dbUser;
            } catch (syncError) {
              console.warn('Failed to sync Google info:', syncError);
            }
          } catch (getError: any) {
            // If we can't get user either, check error type
            if (registerError.message?.includes('already exists') || 
                registerError.message?.includes('User already exists')) {
              // User exists but we can't fetch it - use local data
              console.warn('User exists but can\'t fetch, using local data');
              dbUser = newUser;
            } else if (registerError.message?.includes('Tidak dapat terhubung') || 
                       registerError.message?.includes('NetworkError') ||
                       getError.message?.includes('Tidak dapat terhubung') ||
                       getError.message?.includes('NetworkError')) {
              // Actual network error (no response from server)
              console.error('❌ Network error during registration - data NOT saved to database!');
              console.error('Error details:', { registerError, getError });
              toast.error('⚠️ Tidak dapat terhubung ke server. Pastikan edge function sudah di-deploy.', {
                duration: 10000,
                description: 'Deploy dengan: supabase functions deploy make-server-0eb859c3'
              });
              dbUser = newUser;
            } else {
              // Other error - show actual error message
              console.error('Registration error:', registerError);
              const errorMsg = registerError.message || 'Gagal menyimpan data user';
              toast.error(`⚠️ ${errorMsg}`, {
                duration: 8000,
                description: 'Coba lagi atau hubungi support'
              });
              dbUser = newUser;
            }
          }
        }
      }
      
      // Set current user and save to localStorage (SYNC ACCOUNTS)
      if (dbUser) {
        setCurrentUser(dbUser);
        localStorage.setItem('urtree_user_email', dbUser.email);
        localStorage.removeItem('urtree_logout_flag'); // Clear logout flag on successful login
        console.log('✅ Google user synced and logged in (account synchronized):', dbUser.email);
        console.log('✅ Email/password login and Google login now use the same account for:', dbUser.email);
        
        // Load cart if user is buyer
        if (dbUser.role === 'buyer') {
          await loadCart(dbUser.email);
        }
        
        toast.success('✅ Login dengan Google berhasil!');
      }
    } catch (error: any) {
      console.error('Error syncing Google user:', error);
      
      // Even if sync fails, try to set user from Supabase data so they can use the app
      if (supabaseUser?.email) {
        const fallbackUser = {
          email: supabaseUser.email,
          name: supabaseUser.user_metadata?.full_name || 
                supabaseUser.user_metadata?.name || 
                supabaseUser.email?.split('@')[0] || 
                'User',
          role: 'buyer' as const,
          isPendingSeller: false,
          hasSellerAccount: false,
          googleId: supabaseUser.id,
          avatar: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture,
          loginMethod: 'google' as const
        };
        
        setCurrentUser(fallbackUser);
        console.warn('Using fallback user data from Supabase Auth');
        
        // Load cart for fallback user
        try {
          await loadCart(supabaseUser.email);
        } catch (cartError) {
          console.warn('Could not load cart for fallback user');
        }
        
        // Show success message even with fallback (user can still use the app)
        toast.warning('⚠️ Login berhasil, tapi data tidak tersimpan ke database!', {
          duration: 10000,
          description: 'Edge function belum di-deploy. Deploy sekarang untuk menyimpan data user.'
        });
      } else {
        // Only show error if we can't even create fallback user
        let errorMessage = 'Gagal menyinkronkan data user';
        
        // Only show "edge not deployed" for actual network failures (no response)
        if ((error.message?.includes('Tidak dapat terhubung') || 
             error.message?.includes('NetworkError')) &&
            !(error as any).status) { // Only if no status code (actual network failure)
          errorMessage = 'Tidak dapat terhubung ke server. Pastikan edge function sudah di-deploy di Supabase.';
          toast.error('❌ Data user TIDAK tersimpan ke database!', {
            duration: 12000,
            description: 'Edge function belum di-deploy. Jalankan: supabase functions deploy make-server-0eb859c3'
          });
        } else {
          // Show actual error message for other errors
          errorMessage = error.message || 'Gagal menyinkronkan data user';
          toast.error(`❌ ${errorMessage}`, {
            duration: 8000,
            description: 'Cek console untuk detail error'
          });
        }
      }
    }
  };

  // Handle OAuth callback from Google and check for existing session
  useEffect(() => {
    const handleAuthSession = async () => {
      try {
        // Check for OAuth callback in URL hash (Supabase Auth uses hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');
        
        // Handle OAuth errors
        if (error) {
          console.error('OAuth error:', error, errorDescription);
          toast.error('Login dengan Google gagal: ' + (errorDescription || error));
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        }
        
        // If we have an access token in URL, handle the callback
        if (accessToken) {
          // Get session from Supabase (this will set the session)
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError || !session) {
            console.error('Failed to get session:', sessionError);
            toast.error('Gagal mendapatkan session');
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
          }
          
          // Get user from session
          const supabaseUser = session.user;
          
          if (!supabaseUser) {
            console.error('No user in session');
            toast.error('Gagal mendapatkan data user');
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
          }
          
          // Sync user to our database (KV Store)
          await syncGoogleUserToDatabase(supabaseUser);
          
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          // Check for existing session on page load
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // User already logged in via Google, sync to our database
            await syncGoogleUserToDatabase(session.user);
          }
        }
      } catch (error) {
        console.error('Auth session error:', error);
      }
    };
    
    handleAuthSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // User functions
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user } = await userAPI.login(email, password);
      setCurrentUser(user);
      
      // Save user email to localStorage for session persistence
      localStorage.setItem('urtree_user_email', user.email);
      localStorage.removeItem('urtree_logout_flag'); // Clear logout flag on successful login
      console.log('✅ User session saved to localStorage:', user.email);
      
      // Load user's cart
      if (user.role === 'buyer') {
        await loadCart();
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await userAPI.loginWithGoogle();
      
      // If we get a redirectUrl, it means we need to redirect to Google
      if (result.redirectUrl) {
        // Redirect to Google OAuth
        window.location.href = result.redirectUrl;
        // Return early - the OAuth callback will handle the rest
        return { user: null as any, message: 'Redirecting to Google...' };
      }
      
      // If we get user directly (shouldn't happen with OAuth, but handle it)
      const { user, message } = result;
      
      if (user) {
        setCurrentUser(user);
        // Save to localStorage for session persistence
        localStorage.setItem('urtree_user_email', user.email);
        
        // Load user's cart
        if (user.role === 'buyer') {
          await loadCart();
        }
        
        // Clear logout flag on successful login
        localStorage.removeItem('urtree_logout_flag');
      }
      
      // Return result with message for UI feedback
      return { user: user || null, message };
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const { user } = await userAPI.register(email, password, name);
      setCurrentUser(user);
      // Save to localStorage for session persistence
      localStorage.setItem('urtree_user_email', user.email);
      localStorage.removeItem('urtree_logout_flag'); // Clear logout flag on successful registration
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setCurrentUser(null);
    setCart([]);
    setProducts([]);
    setSellerProducts([]);
    
    // SECURITY: Set logout flag to prevent session restore
    localStorage.setItem('urtree_logout_flag', Date.now().toString());
    
    // Clear session from localStorage
    localStorage.removeItem('urtree_user_email');
    
    // Clear Supabase Auth session
    try {
      await supabase.auth.signOut();
      console.log('✅ Supabase Auth session cleared');
    } catch (error) {
      console.error('Error clearing Supabase Auth session:', error);
    }
    
    console.log('✅ User session cleared from localStorage');
    setBuyerOrders([]);
    setSellerOrders([]);
    setChatConversations([]);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!currentUser) {
      throw new Error('User not logged in');
    }
    
    setIsLoading(true);
    try {
      console.log('Updating user:', currentUser.email, 'with updates:', updates);
      const { user } = await userAPI.updateUser(currentUser.email, updates);
      console.log('User updated successfully:', user);
      setCurrentUser(user);
      // Update localStorage if email changed
      if (updates.email && updates.email !== currentUser.email) {
        localStorage.setItem('urtree_user_email', updates.email);
        localStorage.removeItem('urtree_logout_flag'); // Clear logout flag
      }
    } catch (error: any) {
      console.error('Update user failed:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        email: currentUser.email,
        updates
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const applySeller = async (sellerData: any) => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const { user } = await userAPI.applySeller(currentUser.email, sellerData);
      setCurrentUser(user);
      // Keep session in localStorage
      localStorage.setItem('urtree_user_email', user.email);
      localStorage.removeItem('urtree_logout_flag'); // Clear logout flag
    } catch (error) {
      console.error('Apply seller failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (newRole: 'buyer' | 'seller') => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const { user } = await userAPI.switchRole(currentUser.email, newRole);
      setCurrentUser(user);
      // Keep session in localStorage
      localStorage.setItem('urtree_user_email', user.email);
      localStorage.removeItem('urtree_logout_flag'); // Clear logout flag
      
      // Load appropriate data based on role
      if (newRole === 'seller') {
        await loadSellerProducts();
      } else {
        await loadCart();
      }
    } catch (error) {
      console.error('Switch role failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Product functions
  const loadProducts = async (filters?: { category?: string; search?: string }) => {
    setIsLoading(true);
    try {
      const { products: loadedProducts } = await productAPI.getAll(filters);
      setProducts(loadedProducts);
    } catch (error) {
      console.error('Load products failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loadSellerProducts = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const { products: loadedProducts } = await productAPI.getBySeller(currentUser.email);
      setSellerProducts(loadedProducts);
    } catch (error) {
      console.error('Load seller products failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createProduct = async (productData: any) => {
    if (!currentUser) {
      const error = new Error('User not logged in');
      console.error('Create product failed: No currentUser');
      throw error;
    }

    if (!currentUser.email) {
      const error = new Error('User email is missing');
      console.error('Create product failed: No user email');
      throw error;
    }

    setIsLoading(true);
    try {
      const fullProductData = {
        ...productData,
        sellerId: currentUser.email,
        sellerName: currentUser.shopName || currentUser.name,
        sellerLocation: currentUser.shopCity || currentUser.city || 'Unknown',
        sellerRating: 5.0,
      };

      console.log('DatabaseProvider: Creating product with data:', {
        ...fullProductData,
        images: `[${fullProductData.images?.length || 0} images]`
      });

      await productAPI.create(fullProductData);
      console.log('DatabaseProvider: Product created successfully, reloading seller products...');
      await loadSellerProducts();
      console.log('DatabaseProvider: Seller products reloaded');
    } catch (error: any) {
      console.error('DatabaseProvider: Create product failed:', error);
      console.error('Error message:', error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (id: string, updates: any) => {
    setIsLoading(true);
    try {
      await productAPI.update(id, updates);
      await loadSellerProducts();
    } catch (error) {
      console.error('Update product failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    setIsLoading(true);
    try {
      await productAPI.delete(id);
      await loadSellerProducts();
    } catch (error) {
      console.error('Delete product failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // loadCart is already defined above for OAuth callback

  const updateCart = async (newCart: CartItem[]) => {
    if (!currentUser) return;
    
    try {
      await cartAPI.update(currentUser.email, newCart);
      setCart(newCart);
    } catch (error) {
      console.error('Update cart failed:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!currentUser) return;
    
    try {
      await cartAPI.clear(currentUser.email);
      setCart([]);
    } catch (error) {
      console.error('Clear cart failed:', error);
      throw error;
    }
  };

  // Order functions
  const loadBuyerOrders = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const { orders } = await orderAPI.getByBuyer(currentUser.email);
      setBuyerOrders(orders);
    } catch (error) {
      console.error('Load buyer orders failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loadSellerOrders = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      console.log('Loading seller orders for:', currentUser.email);
      const { orders } = await orderAPI.getBySeller(currentUser.email);
      console.log('Loaded seller orders:', orders);
      setSellerOrders(orders || []);
    } catch (error: any) {
      console.error('Load seller orders failed:', error);
      const errorMessage = error?.message || error?.error || 'Gagal memuat riwayat penjualan';
      console.error('Full error:', error);
      // Don't throw error, just set empty array to prevent white screen
      setSellerOrders([]);
      // Show error toast instead
      if (errorMessage.includes('Seller not found')) {
        console.error('Seller not found - user might not be a seller');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createOrder = async (orderData: any) => {
    setIsLoading(true);
    try {
      const response = await orderAPI.create({
        ...orderData,
        buyerEmail: currentUser?.email,
        buyerName: currentUser?.name,
      });
      await clearCart();
      // Reload buyer orders to show the new order
      if (currentUser) {
        await loadBuyerOrders();
      }
      // Return the full response (includes order and snapToken)
      return response;
    } catch (error) {
      console.error('Create order failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, trackingNumber?: string) => {
    setIsLoading(true);
    try {
      console.log('[updateOrderStatus] Updating order:', { orderId, status, trackingNumber });
      const response = await orderAPI.updateStatus(orderId, status, trackingNumber);
      console.log('[updateOrderStatus] API response:', response);
      
      // Reload orders for both buyer and seller to ensure sync
      if (currentUser?.role === 'buyer') {
        await loadBuyerOrders();
      } else if (currentUser?.role === 'seller') {
        await loadSellerOrders();
      }
      
      console.log('[updateOrderStatus] Orders reloaded, status updated:', { orderId, status, trackingNumber });
    } catch (error) {
      console.error('Update order status failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Chat functions
  const loadChatConversations = async () => {
    if (!currentUser) {
      console.log('[loadChatConversations] No current user, skipping');
      return;
    }
    
    try {
      console.log('[loadChatConversations] Loading for:', currentUser.email, 'Role:', currentUser.role, 'ID:', currentUser.id);
      const response = await chatAPI.getConversations(currentUser.email);
      console.log('[loadChatConversations] Full response:', response);
      const chats = response?.chats || [];
      console.log('[loadChatConversations] Received chats:', chats);
      console.log('[loadChatConversations] Number of chats:', chats.length);
      if (chats.length > 0) {
        console.log('[loadChatConversations] First chat:', chats[0]);
      }
      setChatConversations(chats);
      console.log('[loadChatConversations] Updated state with', chats.length, 'conversations');
    } catch (error: any) {
      console.error('[loadChatConversations] Failed:', error);
      console.error('[loadChatConversations] Error details:', error?.message, error?.error);
      setChatConversations([]);
    }
  };

  // PIN Security functions
  const setPin = async (email: string, pin: string) => {
    setIsLoading(true);
    try {
      await userAPI.setPin(email, pin);
      
      // Refresh user from database to get updated hasPin status
      if (currentUser && currentUser.email === email) {
        try {
          const { user: updatedUser } = await userAPI.getUser(email);
          setCurrentUser(updatedUser);
        } catch (refreshError) {
          console.error('Failed to refresh user after set PIN:', refreshError);
          // Fallback: update current user to reflect PIN is set
        setCurrentUser({ ...currentUser, hasPin: true });
        }
      }
    } catch (error) {
      console.error('Set PIN failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPin = async (email: string, pin: string): Promise<boolean> => {
    try {
      const { valid } = await userAPI.verifyPin(email, pin);
      return valid;
    } catch (error) {
      console.error('Verify PIN failed:', error);
      return false;
    }
  };

  const changePin = async (email: string, newPin: string) => {
    setIsLoading(true);
    try {
      await userAPI.changePin(email, newPin);
      
      // Refresh user from database to get updated hasPin status (though it shouldn't change)
      if (currentUser && currentUser.email === email) {
        try {
          const { user: updatedUser } = await userAPI.getUser(email);
          setCurrentUser(updatedUser);
        } catch (refreshError) {
          console.error('Failed to refresh user after change PIN:', refreshError);
        }
      }
    } catch (error) {
      console.error('Change PIN failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: DatabaseContextType = {
    currentUser,
    login,
    loginWithGoogle,
    register,
    logout,
    updateUser,
    applySeller,
    switchRole,
    setPin,
    verifyPin,
    changePin,
    
    products,
    loadProducts,
    sellerProducts,
    loadSellerProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    
    cart,
    loadCart,
    updateCart,
    clearCart,
    
    buyerOrders,
    sellerOrders,
    loadBuyerOrders,
    loadSellerOrders,
    createOrder,
    updateOrderStatus,
    
    chatConversations,
    loadChatConversations,
    
    isLoading,
    isInitialized,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}
