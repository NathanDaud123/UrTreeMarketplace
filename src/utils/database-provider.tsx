import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { userAPI, productAPI, cartAPI, orderAPI, chatAPI } from './api';
import { checkAndSeedData } from './seed-data';
import type { User, Product, CartItem } from '../App';
import type { Transaction } from '../components/transaction-history-buyer';
import type { SellerTransaction } from '../components/transaction-history-seller';
import type { ChatConversation } from '../components/chat-page';

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

  // Initialize database on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        await checkAndSeedData();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };
    initialize();
  }, []);

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
      const { user, message } = result;
      
      setCurrentUser(user);
      
      // Load user's cart
      if (user.role === 'buyer') {
        await loadCart();
      }
      
      // Return result with message for UI feedback
      return { user, message };
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
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const { user } = await userAPI.updateUser(currentUser.email, updates);
      setCurrentUser(user);
    } catch (error) {
      console.error('Update user failed:', error);
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

  // Cart functions
  const loadCart = async () => {
    if (!currentUser || currentUser.role !== 'buyer') return;
    
    try {
      const { cart: loadedCart } = await cartAPI.get(currentUser.email);
      setCart(loadedCart);
    } catch (error) {
      console.error('Load cart failed:', error);
    }
  };

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
