import { useState, useEffect } from 'react';
import { Navbar } from './components/navbar';
import { HomePage } from './components/home-page';
import { ProductListingPage } from './components/product-listing-page';
import { ProductDetailPage } from './components/product-detail-page';
import { CartPage } from './components/cart-page';
import { CheckoutPage } from './components/checkout-page';
import { SellerDashboard } from './components/seller-dashboard';
import { AdminDashboard } from './components/admin-dashboard';
import { LoginPage } from './components/login-page';
import { ProfilePage } from './components/profile-page';
import { SettingsPage } from './components/settings-page';
import { TransactionHistoryBuyer } from './components/transaction-history-buyer';
import { TransactionHistorySeller } from './components/transaction-history-seller';
import { SellerOrderDetail } from './components/seller-order-detail';
import { BuyerOrderDetail } from './components/buyer-order-detail';
import { ChatPage, ChatList } from './components/chat-page';
import { SellerRegistrationPage, type SellerRegistrationData } from './components/seller-registration-page';
import { SellerApplicationStatusPage } from './components/seller-application-status-page';
import type { SellerTransaction } from './components/transaction-history-seller';
import type { Transaction } from './components/transaction-history-buyer';
import type { ChatConversation } from './components/chat-page';
import {
  MOCK_BUYER_TRANSACTIONS,
  MOCK_SELLER_TRANSACTIONS,
} from './lib/mock-data';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { productAPI, chatAPI, userAPI } from './utils/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './components/ui/alert-dialog';
import { DatabaseProvider, useDatabaseContext } from './utils/database-provider';

export type UserRole = 'buyer' | 'seller' | 'admin';

export type ProductCategory = 'tanaman-hidup' | 'benih' | 'peralatan';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: ProductCategory;
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  sellerLocation: string;
  sold: number;
  rating: number;
  reviews: number;
  // Khusus untuk tanaman hidup
  plantAge?: '<1thn' | '1thn+' | '3thn+';
  maxDeliveryRadius?: number; // dalam km
  // Koordinat penjual untuk perhitungan jarak
  sellerLat?: number;
  sellerLng?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  email: string;
  name: string;
  role: UserRole;
  isPendingSeller?: boolean;
  hasSellerAccount?: boolean; // Track if user has ever been a seller
  hasPin?: boolean; // Track if user has set a PIN
  phone?: string;
  address?: string;
  city?: string;
  shopName?: string;
  shopDescription?: string;
  shopAddress?: string;
  shopCity?: string;
}

function AppContent() {
  const db = useDatabaseContext();
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [isGuest, setIsGuest] = useState(true);
  const [hasExplicitLogin, setHasExplicitLogin] = useState(false); // Track explicit login (not auto-restore)
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTransaction, setSelectedTransaction] = useState<SellerTransaction | null>(null);
  const [selectedBuyerTransaction, setSelectedBuyerTransaction] = useState<Transaction | null>(null);
  const [selectedChatConversation, setSelectedChatConversation] = useState<ChatConversation | null>(null);
  const [showProfileIncompleteDialog, setShowProfileIncompleteDialog] = useState(false);

  const currentUser = db.currentUser;
  const cart = db.cart;

  const handleLoginSuccess = () => {
    setIsGuest(false);
    setHasExplicitLogin(true); // Mark that user explicitly logged in
    
    // Check user role and redirect accordingly
    // Use setTimeout to ensure currentUser is updated
    setTimeout(() => {
      if (db.currentUser?.role === 'admin') {
        setCurrentPage('admin-dashboard');
      } else if (db.currentUser?.role === 'seller') {
        setCurrentPage('seller-dashboard');
      } else {
        setCurrentPage('home');
      }
    }, 100);
  };

  // Watch for currentUser changes and redirect admin (only after explicit login, not auto-restore)
  // SECURITY: Only redirect if user explicitly logged in, not from session restore
  useEffect(() => {
    // Only auto-redirect admin if:
    // 1. User is admin
    // 2. User explicitly logged in (not from session restore)
    // 3. Not already on admin-dashboard
    // 4. Currently on home or login page
    if (currentUser?.role === 'admin' && 
        hasExplicitLogin &&
        currentPage !== 'admin-dashboard' && 
        !isGuest &&
        (currentPage === 'home' || currentPage === 'login')) {
      setCurrentPage('admin-dashboard');
    }
  }, [currentUser?.role, currentPage, isGuest, hasExplicitLogin]);

  // Load buyer orders when user is logged in and on transaction history page
  useEffect(() => {
    if (currentUser && currentPage === 'transaction-history-buyer' && db.buyerOrders.length === 0) {
      db.loadBuyerOrders().catch(console.error);
    }
  }, [currentUser, currentPage, db.buyerOrders.length]);

  // Load seller orders when user is logged in and on transaction history page
  useEffect(() => {
    if (currentUser && currentPage === 'transaction-history-seller') {
      // Always reload to get latest data
      db.loadSellerOrders().catch((error) => {
        console.error('Error loading seller orders:', error);
        // Don't show error to user, just log it
      });
    }
  }, [currentUser?.id, currentPage]);

  // Update isGuest based on currentUser
  useEffect(() => {
    if (currentUser && isGuest) {
      console.log('[App] User logged in, setting isGuest to false');
      setIsGuest(false);
    } else if (!currentUser && !isGuest) {
      console.log('[App] User logged out, setting isGuest to true');
      setIsGuest(true);
    }
  }, [currentUser?.id]);

  // Load chat conversations when user is logged in
  useEffect(() => {
    if (currentUser) {
      console.log('[App] Loading conversations on user login');
      db.loadChatConversations().catch(console.error);
    }
  }, [currentUser?.id]);

  // Auto-refresh chat conversations when on chat pages or seller dashboard
  useEffect(() => {
    console.log('[App] useEffect triggered:', { 
      currentPage, 
      hasUser: !!currentUser, 
      isGuest, 
      userId: currentUser?.id 
    });
    
    if (currentUser && (currentPage === 'chat-list' || currentPage === 'chat' || currentPage === 'seller-dashboard')) {
      console.log('[App] Loading conversations for page:', currentPage);
      // Load immediately
      db.loadChatConversations().catch((err) => {
        console.error('[App] Error loading conversations:', err);
      });
      
      // Refresh every 3 seconds
      const interval = setInterval(() => {
        console.log('[App] Auto-refreshing conversations');
        db.loadChatConversations().catch((err) => {
          console.error('[App] Error auto-refreshing conversations:', err);
        });
      }, 3000);
      
      return () => {
        console.log('[App] Clearing auto-refresh interval');
        clearInterval(interval);
      };
    } else {
      console.log('[App] Conditions not met for loading conversations:', {
        hasUser: !!currentUser,
        currentPage,
        shouldLoad: currentPage === 'chat-list' || currentPage === 'chat' || currentPage === 'seller-dashboard'
      });
    }
  }, [currentUser?.id, currentPage]);

  // Force load conversations when navigating to chat-list
  useEffect(() => {
    console.log('[App] Force load useEffect triggered:', { 
      currentPage, 
      hasUser: !!currentUser
    });
    
    if (currentUser && currentPage === 'chat-list') {
      console.log('[App] Force loading conversations for chat-list');
      db.loadChatConversations().catch((err) => {
        console.error('[App] Error force loading conversations:', err);
      });
    }
  }, [currentPage, currentUser?.id]);

  const handleLogout = async () => {
    await db.logout();
    setIsGuest(true);
    setHasExplicitLogin(false); // Reset explicit login flag
    setCurrentPage('home');
  };

  const handleApplyAsSeller = () => {
    // Navigate to seller registration page (unified page for all seller applications)
    setCurrentPage('seller-registration');
  };

  const handleSellerRegistrationSubmit = async (data: SellerRegistrationData) => {
    if (currentUser) {
      try {
        await db.applySeller(data);
        // Redirect to status page instead of seller dashboard
        setCurrentPage('seller-application-status');
      } catch (error) {
        toast.error('Gagal mengajukan sebagai penjual. Silakan coba lagi.');
      }
    }
  };


  const handleSwitchRole = async (newRole: 'buyer' | 'seller') => {
    if (currentUser) {
      try {
        await db.switchRole(newRole);
        toast.success(
          newRole === 'buyer' 
            ? 'Beralih ke mode pembeli' 
            : 'Beralih ke mode penjual'
        );
        // Navigate to appropriate page
        if (newRole === 'buyer') {
          setCurrentPage('home');
        } else {
          setCurrentPage('seller-dashboard');
        }
      } catch (error) {
        toast.error('Gagal beralih role. Silakan coba lagi.');
      }
    }
  };



  const handleCategorySelect = (category: ProductCategory) => {
    setSelectedCategory(category);
    setCurrentPage('product-listing');
  };

  const handleProductSelect = async (product: Product) => {
    // Set product immediately for quick display
    setSelectedProduct(product);
    setCurrentPage('product-detail');
    
    // Fetch fresh product detail from API to get complete seller info
    try {
      const productDetail = await productAPI.getById(product.id);
      if (productDetail.product) {
        setSelectedProduct(productDetail.product);
      }
    } catch (error) {
      console.error('Error fetching product detail:', error);
      // Keep the original product if API fails
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedCategory(null);
    setCurrentPage('product-listing');
  };

  const handleAddToCart = async (product: Product, quantity: number) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    let newCart: CartItem[];
    
    if (existingItem) {
      newCart = cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
        );
    } else {
      newCart = [...cart, { product, quantity }];
    }
    
    try {
      await db.updateCart(newCart);
    } catch (error) {
      toast.error('Gagal menambahkan ke keranjang');
    }
  };

  const handleBuyNow = async (product: Product, quantity: number) => {
    // Check if user is logged in
    if (!currentUser) {
      toast.info('Silakan login atau register untuk melanjutkan pembelian');
      setCurrentPage('login');
      return;
    }
    
    // Check if profile is complete
    if (!currentUser.phone || !currentUser.address || !currentUser.city) {
      setShowProfileIncompleteDialog(true);
      return;
    }
    
    // Clear cart and add only this product
    try {
      await db.updateCart([{ product, quantity }]);
      // Navigate to checkout immediately
      setCurrentPage('checkout');
      toast.success('Menuju halaman checkout...');
    } catch (error) {
      toast.error('Gagal memproses pesanan');
    }
  };

  const handleProfileIncompleteConfirm = () => {
    setShowProfileIncompleteDialog(false);
    setCurrentPage('profile');
  };

  const handleUpdateCartQuantity = async (productId: string, quantity: number) => {
    let newCart: CartItem[];
    
    if (quantity <= 0) {
      newCart = cart.filter(item => item.product.id !== productId);
    } else {
      newCart = cart.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      );
    }
    
    try {
      await db.updateCart(newCart);
    } catch (error) {
      toast.error('Gagal memperbarui keranjang');
    }
  };

  const handleRemoveFromCart = async (productId: string) => {
    const newCart = cart.filter(item => item.product.id !== productId);
    try {
      await db.updateCart(newCart);
    } catch (error) {
      toast.error('Gagal menghapus item');
    }
  };

  const handleClearCart = async () => {
    try {
      await db.clearCart();
    } catch (error) {
      toast.error('Gagal mengosongkan keranjang');
    }
  };

  // Check if profile is complete
  const isProfileComplete = (user: User | null) => {
    if (!user) return false;
    return !!(user.phone && user.address && user.city);
  };

  const renderPage = () => {
    if (currentPage === 'login') {
      return <LoginPage onSuccess={handleLoginSuccess} onBack={() => setCurrentPage('home')} />;
    }

    switch (currentPage) {
      case 'home':
        // If user is seller, redirect to seller dashboard
        if (currentUser && currentUser.role === 'seller') {
          return <SellerDashboard onAddProduct={() => setCurrentPage('add-product')} />;
        }
        return (
          <HomePage
            onCategorySelect={handleCategorySelect}
            onProductSelect={handleProductSelect}
            currentUser={currentUser}
            isProfileComplete={isProfileComplete(currentUser)}
            onCompleteProfile={() => setCurrentPage('profile')}
          />
        );
      case 'product-listing':
        return (
          <ProductListingPage
            category={selectedCategory}
            searchQuery={searchQuery}
            onProductSelect={handleProductSelect}
          />
        );
      case 'product-detail':
        return selectedProduct ? (
          <ProductDetailPage
            product={selectedProduct}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onBackToList={() => setCurrentPage('product-listing')}
            isUserLoggedIn={!!currentUser}
            onLoginRequired={() => setCurrentPage('login')}
            onOpenChat={async (sellerName, productId) => {
              if (!currentUser) {
                toast.info('Silakan login untuk menghubungi penjual');
                setCurrentPage('login');
                return;
              }
              
              try {
                // Get seller ID from product
                const productDetail = await productAPI.getById(productId || selectedProduct.id);
                console.log('Product detail:', productDetail);
                
                // Use sellerIdUuid (UUID) if available
                let sellerId = productDetail.product?.sellerIdUuid;
                
                // If no UUID, sellerId is email - need to get UUID from it
                if (!sellerId && productDetail.product?.sellerId) {
                  try {
                    console.log('Querying user by email:', productDetail.product.sellerId);
                    const userResponse = await userAPI.getUser(productDetail.product.sellerId);
                    console.log('User response:', userResponse);
                    sellerId = userResponse?.user?.id;
                    console.log('Got seller UUID from email:', sellerId);
                  } catch (err: any) {
                    console.error('Error getting seller UUID from email:', err);
                    const errorMsg = err?.message || err?.error || 'Tidak dapat menemukan penjual';
                    toast.error(errorMsg);
                    return;
                  }
                }
                
                if (!sellerId) {
                  console.error('Product detail:', productDetail);
                  console.error('Selected product:', selectedProduct);
                  toast.error('Tidak dapat menemukan penjual. sellerIdUuid tidak tersedia.');
                  return;
                }
                
                console.log('Creating chat with:', {
                  buyerId: currentUser.id,
                  sellerId: sellerId,
                  productId: productId || selectedProduct.id
                });
                
                // Get or create conversation
                const response = await chatAPI.getOrCreate(
                  currentUser.id,
                  sellerId,
                  productId || selectedProduct.id
                );
                
                console.log('Chat response:', response);
                
                if (!response || !response.chat) {
                  const errorMsg = response?.error || 'Gagal membuat conversation';
                  console.error('Chat creation failed:', response);
                  toast.error(errorMsg);
                  return;
                }
                
                setSelectedChatConversation(response.chat);
                
                // Reload conversations first to ensure it appears in chat list
                await db.loadChatConversations();
                
                // Small delay to ensure state is updated
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Then navigate to chat page
                setCurrentPage('chat');
              } catch (error: any) {
                console.error('Error opening chat:', error);
                const errorMessage = error?.message || error?.error || 'Gagal membuka chat';
                console.error('Full error:', error);
                toast.error(errorMessage);
              }
            }}
          />
        ) : (
          <HomePage
            onCategorySelect={handleCategorySelect}
            onProductSelect={handleProductSelect}
          />
        );
      case 'cart':
        if (!currentUser) {
          toast.info('Silakan login terlebih dahulu');
          setCurrentPage('login');
          return null;
        }
        return (
          <CartPage
            cartItems={cart}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveFromCart}
            onCheckout={() => {
              if (!isProfileComplete(currentUser)) {
                setShowProfileIncompleteDialog(true);
              } else {
                setCurrentPage('checkout');
              }
            }}
            onContinueShopping={() => setCurrentPage('home')}
          />
        );
      case 'checkout':
        return (
          <CheckoutPage
            cartItems={cart}
            onOrderComplete={() => {
              handleClearCart();
              setCurrentPage('home');
            }}
            onBackToCart={() => setCurrentPage('cart')}
            userProfile={
              currentUser
                ? {
                    name: currentUser.name,
                    phone: currentUser.phone || '',
                    address: currentUser.address || '',
                    city: currentUser.city || '',
                  }
                : undefined
            }
          />
        );
      case 'seller-registration':
        return (
          <SellerRegistrationPage
            onSubmit={handleSellerRegistrationSubmit}
            onBack={() => setCurrentPage('home')}
          />
        );
      
      case 'seller-application-status':
        return (
          <SellerApplicationStatusPage
            onBackToProfile={() => setCurrentPage('profile')}
          />
        );
      case 'seller-dashboard':
        return <SellerDashboard />;
      case 'admin-dashboard':
        // SECURITY: Only allow admin to access admin dashboard
        if (!currentUser || currentUser.role !== 'admin') {
          toast.error('Akses ditolak. Hanya admin yang dapat mengakses dashboard ini.');
          setCurrentPage('home');
          return null;
        }
        return <AdminDashboard />;
      case 'profile':
        if (!currentUser) {
          toast.info('Silakan login terlebih dahulu');
          setCurrentPage('login');
          return null;
        }
        return (
          <ProfilePage
            user={currentUser}
            onUpdateUser={async (updatedUser) => {
              try {
                // Extract updates (exclude email as it shouldn't be changed)
                const { email, password, createdAt, role, isPendingSeller, hasSellerAccount, ...updates } = updatedUser;
                console.log('App.tsx - onUpdateUser called with:', { updatedUser, updates });
                await db.updateUser(updates);
                toast.success('Profil berhasil diperbarui');
              } catch (error: any) {
                console.error('Update user error in App.tsx:', error);
                console.error('Error details:', {
                  message: error.message,
                  stack: error.stack,
                  updatedUser
                });
                const errorMessage = error.message || 'Gagal memperbarui profil';
                toast.error(errorMessage);
                throw error; // Re-throw agar profile-page bisa handle
              }
            }}
            onNavigateToSellerRegistration={() => setCurrentPage('seller-registration')}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            user={currentUser}
            onUpdateUser={async (updatedUser) => {
              try {
                // Extract only the fields that changed (updates)
                const updates: Partial<User> = {};
                if (updatedUser.name !== currentUser?.name) updates.name = updatedUser.name;
                if (updatedUser.email !== currentUser?.email) updates.email = updatedUser.email;
                if (updatedUser.phone !== currentUser?.phone) updates.phone = updatedUser.phone;
                if (updatedUser.address !== currentUser?.address) updates.address = updatedUser.address;
                if (updatedUser.city !== currentUser?.city) updates.city = updatedUser.city;
                if (updatedUser.hasPin !== currentUser?.hasPin) updates.hasPin = updatedUser.hasPin;
                
                await db.updateUser(updates);
                toast.success('Profil berhasil diperbarui');
              } catch (error: any) {
                console.error('Update user error:', error);
                const errorMessage = error.message || 'Gagal memperbarui profil';
                toast.error(errorMessage);
              }
            }}
            onSwitchRole={handleSwitchRole}
            onNavigateToSellerRegistration={handleApplyAsSeller}
          />
        );
      case 'transaction-history-buyer':
        return (
          <TransactionHistoryBuyer
            transactions={db.buyerOrders}
            onViewDetail={(transaction) => {
              setSelectedBuyerTransaction(transaction);
              setCurrentPage('buyer-order-detail');
            }}
            onOpenChat={async (sellerName, orderId) => {
              if (!currentUser) {
                toast.info('Silakan login untuk menghubungi penjual');
                setCurrentPage('login');
                return;
              }
              
              try {
                // Find seller ID from transaction
                const transaction = db.buyerOrders.find(t => t.orderNumber === orderId);
                if (!transaction || !transaction.items[0]?.sellerId) {
                  toast.error('Tidak dapat menemukan penjual');
                  return;
                }
                
                const sellerId = transaction.items[0].sellerId;
                
                // Get or create conversation
                const { chat } = await chatAPI.getOrCreate(
                  currentUser.id,
                  sellerId,
                  undefined,
                  transaction.id
                );
                
                setSelectedChatConversation(chat);
                setCurrentPage('chat');
                
                // Reload conversations
                await db.loadChatConversations();
              } catch (error) {
                console.error('Error opening chat:', error);
                toast.error('Gagal membuka chat');
              }
            }}
          />
        );
      case 'buyer-order-detail':
        return selectedBuyerTransaction ? (
          <BuyerOrderDetail
            transaction={selectedBuyerTransaction}
            onBack={() => setCurrentPage('transaction-history-buyer')}
            onOpenChat={async (sellerName, orderId) => {
              if (!currentUser) {
                toast.info('Silakan login untuk menghubungi penjual');
                setCurrentPage('login');
                return;
              }
              
              try {
                // Find seller ID from transaction
                const transaction = db.buyerOrders.find(t => t.orderNumber === orderId);
                if (!transaction || !transaction.items[0]?.sellerId) {
                  toast.error('Tidak dapat menemukan penjual');
                  return;
                }
                
                const sellerId = transaction.items[0].sellerId;
                
                // Get or create conversation
                const { chat } = await chatAPI.getOrCreate(
                  currentUser.id,
                  sellerId,
                  undefined,
                  transaction.id
                );
                
                setSelectedChatConversation(chat);
                setCurrentPage('chat');
                
                // Reload conversations
                await db.loadChatConversations();
              } catch (error) {
                console.error('Error opening chat:', error);
                toast.error('Gagal membuka chat');
              }
            }}
          />
        ) : (
          <TransactionHistoryBuyer
            transactions={db.buyerOrders}
            onViewDetail={(transaction) => {
              setSelectedBuyerTransaction(transaction);
              setCurrentPage('buyer-order-detail');
            }}
            onOpenChat={async (sellerName, orderId) => {
              if (!currentUser) {
                toast.info('Silakan login untuk menghubungi penjual');
                setCurrentPage('login');
                return;
              }
              
              try {
                // Find seller ID from transaction
                const transaction = db.buyerOrders.find(t => t.orderNumber === orderId);
                if (!transaction || !transaction.items[0]?.sellerId) {
                  toast.error('Tidak dapat menemukan penjual');
                  return;
                }
                
                const sellerId = transaction.items[0].sellerId;
                
                // Get or create conversation
                const { chat } = await chatAPI.getOrCreate(
                  currentUser.id,
                  sellerId,
                  undefined,
                  transaction.id
                );
                
                setSelectedChatConversation(chat);
                setCurrentPage('chat');
                
                // Reload conversations
                await db.loadChatConversations();
              } catch (error) {
                console.error('Error opening chat:', error);
                toast.error('Gagal membuka chat');
              }
            }}
          />
        );
      case 'transaction-history-seller':
        return (
          <TransactionHistorySeller
            transactions={db.sellerOrders}
            onViewDetail={(transaction) => {
              setSelectedTransaction(transaction);
              setCurrentPage('seller-order-detail');
            }}
            onUpdateStatus={async (orderId, status, trackingNumber) => {
              try {
                await db.updateOrderStatus(orderId, status, trackingNumber);
                // Reload seller orders to reflect the update
                await db.loadSellerOrders();
                
                // Update selectedTransaction if it's the same order
                if (selectedTransaction && selectedTransaction.id === orderId) {
                  const updatedOrder = db.sellerOrders.find(o => o.id === orderId);
                  if (updatedOrder) {
                    setSelectedTransaction(updatedOrder);
                  }
                }
              } catch (error) {
                console.error('Error updating order status:', error);
                throw error;
              }
            }}
            onOpenChat={async (buyerName, orderId) => {
              if (!currentUser) {
                toast.info('Silakan login untuk menghubungi pembeli');
                setCurrentPage('login');
                return;
              }
              
              try {
                // Find buyer ID from transaction
                const transaction = db.sellerOrders.find(t => t.orderNumber === orderId);
                if (!transaction || !transaction.buyerId) {
                  toast.error('Tidak dapat menemukan pembeli');
                  return;
                }
                
                const buyerId = transaction.buyerId;
                
                // Get or create conversation
                const { chat } = await chatAPI.getOrCreate(
                  buyerId,
                  currentUser.id,
                  undefined,
                  transaction.id
                );
                
                setSelectedChatConversation(chat);
                setCurrentPage('chat');
                
                // Reload conversations
                await db.loadChatConversations();
              } catch (error) {
                console.error('Error opening chat:', error);
                toast.error('Gagal membuka chat');
              }
            }}
          />
        );
      case 'seller-order-detail':
        return selectedTransaction ? (
          <SellerOrderDetail
            transaction={selectedTransaction}
            onBack={() => setCurrentPage('transaction-history-seller')}
            onUpdateStatus={async (orderId, status, trackingNumber) => {
              try {
                await db.updateOrderStatus(orderId, status, trackingNumber);
                // Reload seller orders to reflect the update
                await db.loadSellerOrders();
                
                // Update selectedTransaction with the latest data
                const updatedOrder = db.sellerOrders.find(o => o.id === orderId);
                if (updatedOrder) {
                  setSelectedTransaction(updatedOrder);
                }
              } catch (error) {
                console.error('Error updating order status:', error);
                throw error;
              }
            }}
            onOpenChat={async (buyerName, orderId) => {
              if (!currentUser) {
                toast.info('Silakan login untuk menghubungi pembeli');
                setCurrentPage('login');
                return;
              }
              
              try {
                // Find buyer ID from transaction
                const transaction = db.sellerOrders.find(t => t.orderNumber === orderId);
                if (!transaction || !transaction.buyerId) {
                  toast.error('Tidak dapat menemukan pembeli');
                  return;
                }
                
                const buyerId = transaction.buyerId;
                
                // Get or create conversation
                const { chat } = await chatAPI.getOrCreate(
                  buyerId,
                  currentUser.id,
                  undefined,
                  transaction.id
                );
                
                setSelectedChatConversation(chat);
                setCurrentPage('chat');
                
                // Reload conversations
                await db.loadChatConversations();
              } catch (error) {
                console.error('Error opening chat:', error);
                toast.error('Gagal membuka chat');
              }
            }}
          />
        ) : (
          <TransactionHistorySeller
            transactions={db.sellerOrders}
            onViewDetail={(transaction) => {
              setSelectedTransaction(transaction);
              setCurrentPage('seller-order-detail');
            }}
            onOpenChat={async (buyerName, orderId) => {
              if (!currentUser) {
                toast.info('Silakan login untuk menghubungi pembeli');
                setCurrentPage('login');
                return;
              }
              
              try {
                // Find buyer ID from transaction
                const transaction = db.sellerOrders.find(t => t.orderNumber === orderId);
                if (!transaction || !transaction.buyerId) {
                  toast.error('Tidak dapat menemukan pembeli');
                  return;
                }
                
                const buyerId = transaction.buyerId;
                
                // Get or create conversation
                const { chat } = await chatAPI.getOrCreate(
                  buyerId,
                  currentUser.id,
                  undefined,
                  transaction.id
                );
                
                setSelectedChatConversation(chat);
                setCurrentPage('chat');
                
                // Reload conversations
                await db.loadChatConversations();
              } catch (error) {
                console.error('Error opening chat:', error);
                toast.error('Gagal membuka chat');
              }
            }}
          />
        );
      case 'chat-list':
        return (
          <ChatList
            conversations={db.chatConversations}
            onSelectConversation={(conversation) => {
              setSelectedChatConversation(conversation);
              setCurrentPage('chat');
            }}
            onBack={() => {
              try {
                if (currentUser?.role === 'seller') {
                  setCurrentPage('seller-dashboard');
                } else if (currentUser?.role === 'buyer') {
                  setCurrentPage('home');
                } else {
                  setCurrentPage('home');
                }
              } catch (error) {
                console.error('Error navigating back:', error);
                setCurrentPage('home');
              }
            }}
          />
        );
      case 'chat':
        return selectedChatConversation ? (
          <ChatPage
            conversation={selectedChatConversation}
            messages={[]} // Will be loaded in ChatPage component
            currentUserId={currentUser?.id || ''}
            currentUserName={currentUser?.name || 'User'}
            onBack={async () => {
              try {
                // Reload conversations before going back to chat list
                await db.loadChatConversations();
                setCurrentPage('chat-list');
              } catch (error) {
                console.error('Error navigating back from chat:', error);
                if (currentUser?.role === 'seller') {
                  setCurrentPage('seller-dashboard');
                } else {
                  setCurrentPage('home');
                }
              }
            }}
            onSendMessage={async (message) => {
              if (!currentUser || !selectedChatConversation) return;
              
              try {
                await chatAPI.sendMessage(
                  selectedChatConversation.id,
                  currentUser.id,
                  message
                );
                
                // Reload conversations to update last message and ensure it appears in chat list
                await db.loadChatConversations();
                
                // Also update selected conversation to reflect new last message
                const { chats } = await chatAPI.getConversations(currentUser.email);
                const updatedChat = chats?.find(c => c.id === selectedChatConversation.id);
                if (updatedChat) {
                  setSelectedChatConversation(updatedChat);
                }
                
                // Reload messages will be handled by ChatPage auto-refresh
              } catch (error) {
                console.error('Error sending message:', error);
                toast.error('Gagal mengirim pesan');
              }
            }}
          />
        ) : (
          <ChatList
            conversations={db.chatConversations}
            onSelectConversation={(conversation) => {
              setSelectedChatConversation(conversation);
              setCurrentPage('chat');
            }}
            onBack={() => {
              try {
                if (currentUser?.role === 'seller') {
                  setCurrentPage('seller-dashboard');
                } else if (currentUser?.role === 'buyer') {
                  setCurrentPage('home');
                } else {
                  setCurrentPage('home');
                }
              } catch (error) {
                console.error('Error navigating back:', error);
                setCurrentPage('home');
              }
            }}
          />
        );
      default:
        return (
          <HomePage
            onCategorySelect={handleCategorySelect}
            onProductSelect={handleProductSelect}
            currentUser={currentUser}
            isProfileComplete={isProfileComplete(currentUser)}
            onCompleteProfile={() => setCurrentPage('profile')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage !== 'login' && (
        <Navbar
          user={currentUser}
          cartItemCount={cart.length}
          onLogoClick={() => setCurrentPage('home')}
          onCartClick={() => {
            if (!currentUser) {
              toast.info('Silakan login terlebih dahulu');
              setCurrentPage('login');
            } else {
              setCurrentPage('cart');
            }
          }}
          onSearch={handleSearch}
          onNavigate={setCurrentPage}
          onLogout={handleLogout}
          onApplyAsSeller={handleApplyAsSeller}
          onSwitchRole={handleSwitchRole}
          onLogin={() => setCurrentPage('login')}
        />
      )}
      <main>{renderPage()}</main>
      <Toaster />

      {/* Profile Incomplete Dialog */}
      <AlertDialog open={showProfileIncompleteDialog} onOpenChange={setShowProfileIncompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Data Diri Belum Lengkap</AlertDialogTitle>
            <AlertDialogDescription>
              Silakan lengkapi data diri Anda terlebih dahulu (nomor telepon, alamat, dan kota) untuk melanjutkan pembelian.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleProfileIncompleteConfirm}
              className="bg-green-600 hover:bg-green-700"
            >
              Oke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function App() {
  return (
    <DatabaseProvider>
      <AppContent />
    </DatabaseProvider>
  );
}