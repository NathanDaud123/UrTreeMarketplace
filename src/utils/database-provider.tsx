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
  logout: () => void;
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
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;

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
      
      if (!dbUser) {
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
            console.log('✅ User already exists, using existing data:', userEmail);
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
              // Network error - use local data so user can still use the app
              console.warn('Network error during registration, using local user data');
              dbUser = newUser;
            } else {
              // Other error - log but use local data as fallback
              console.error('Registration error, using local data as fallback:', registerError);
              dbUser = newUser;
            }
          }
        }
      } else {
        // User exists - update with Google info if needed
        console.log('User exists, checking if Google info needs update');
        if (!dbUser.googleId || !dbUser.avatar) {
          try {
            await userAPI.updateUser(userEmail, {
              googleId: supabaseUser.id,
              avatar: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || dbUser.avatar,
              loginMethod: 'google'
            });
            
            // Refresh user data
            try {
              const userResponse = await userAPI.getUser(userEmail);
              dbUser = userResponse?.user || dbUser;
            } catch (getError) {
              console.warn('Can\'t refresh user after update, using existing data');
            }
          } catch (updateError) {
            // If update fails, continue with existing user data
            console.warn('Error updating user Google info, using existing data:', updateError);
          }
        }
      }
      
      // Set current user
      if (dbUser) {
        setCurrentUser(dbUser);
        
        // Load user's cart (pass email since currentUser might not be updated yet)
        if (dbUser.role === 'buyer') {
          await loadCart(userEmail);
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
        toast.success('✅ Login dengan Google berhasil!', {
          description: 'Menggunakan data sementara. Beberapa fitur mungkin terbatas.'
        });
      } else {
        // Only show error if we can't even create fallback user
        let errorMessage = 'Gagal menyinkronkan data user';
        
        if (error.message?.includes('Tidak dapat terhubung') || 
            error.message?.includes('NetworkError')) {
          errorMessage = 'Tidak dapat terhubung ke server. Pastikan edge function sudah di-deploy di Supabase.';
        } else {
          errorMessage += ': ' + (error.message || 'Unknown error');
        }
        
        toast.error(errorMessage, {
          duration: 8000
        });
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
        
        // Load user's cart
        if (user.role === 'buyer') {
          await loadCart();
        }
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
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCart([]);
    setProducts([]);
    setSellerProducts([]);
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
      const { orders } = await orderAPI.getBySeller(currentUser.email);
      setSellerOrders(orders);
    } catch (error) {
      console.error('Load seller orders failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createOrder = async (orderData: any) => {
    setIsLoading(true);
    try {
      const { order } = await orderAPI.create({
        ...orderData,
        buyerEmail: currentUser?.email,
        buyerName: currentUser?.name,
      });
      await clearCart();
      return order;
    } catch (error) {
      console.error('Create order failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    setIsLoading(true);
    try {
      await orderAPI.updateStatus(orderId, status);
      // Reload orders
      if (currentUser?.role === 'buyer') {
        await loadBuyerOrders();
      } else if (currentUser?.role === 'seller') {
        await loadSellerOrders();
      }
    } catch (error) {
      console.error('Update order status failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Chat functions
  const loadChatConversations = async () => {
    if (!currentUser) return;
    
    try {
      const { chats } = await chatAPI.getConversations(currentUser.email);
      setChatConversations(chats);
    } catch (error) {
      console.error('Load chat conversations failed:', error);
    }
  };

  // PIN Security functions
  const setPin = async (email: string, pin: string) => {
    setIsLoading(true);
    try {
      await userAPI.setPin(email, pin);
      
      // Update current user to reflect PIN is set
      if (currentUser && currentUser.email === email) {
        setCurrentUser({ ...currentUser, hasPin: true });
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
