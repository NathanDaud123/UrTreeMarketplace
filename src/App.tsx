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
import type { SellerTransaction } from './components/transaction-history-seller';
import type { Transaction } from './components/transaction-history-buyer';
import type { ChatConversation } from './components/chat-page';
import {
  MOCK_BUYER_TRANSACTIONS,
  MOCK_SELLER_TRANSACTIONS,
  MOCK_CHAT_CONVERSATIONS,
  MOCK_CHAT_MESSAGES,
} from './lib/mock-data';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
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
    
    if (currentUser?.role === 'admin') {
      setCurrentPage('admin-dashboard');
    } else if (currentUser?.role === 'seller') {
      setCurrentPage('seller-dashboard');
    } else {
      setCurrentPage('home');
    }
  };

  const handleLogout = () => {
    db.logout();
    setIsGuest(true);
    setCurrentPage('home');
  };

  const handleApplyAsSeller = () => {
    if (currentUser && currentUser.role === 'buyer') {
      // Navigate to seller registration page
      setCurrentPage('seller-registration');
    }
  };

  const handleSellerRegistrationSubmit = async (data: SellerRegistrationData) => {
    if (currentUser) {
      try {
        await db.applySeller(data);
        toast.success('🎉 Selamat! Anda sekarang terdaftar sebagai penjual di UrTree');
        setCurrentPage('seller-dashboard');
      } catch (error) {
        toast.error('Gagal mendaftar sebagai penjual. Silakan coba lagi.');
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

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('product-detail');
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
      case 'seller-dashboard':
        return <SellerDashboard />;
      case 'admin-dashboard':
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
                await db.updateUser(updatedUser);
              } catch (error) {
                toast.error('Gagal memperbarui profil');
              }
            }}
            onApplyAsSeller={handleApplyAsSeller}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            user={currentUser}
            onUpdateUser={async (updatedUser) => {
              try {
                await db.updateUser(updatedUser);
              } catch (error) {
                toast.error('Gagal memperbarui profil');
              }
            }}
            onSwitchRole={handleSwitchRole}
          />
        );
      case 'transaction-history-buyer':
        return (
          <TransactionHistoryBuyer
            transactions={MOCK_BUYER_TRANSACTIONS}
            onViewDetail={(transaction) => {
              setSelectedBuyerTransaction(transaction);
              setCurrentPage('buyer-order-detail');
            }}
            onOpenChat={(sellerName, orderId) => {
              const conversation = MOCK_CHAT_CONVERSATIONS.find(c => c.orderNumber === orderId);
              if (conversation) {
                setSelectedChatConversation(conversation);
                setCurrentPage('chat');
              }
            }}
          />
        );
      case 'buyer-order-detail':
        return selectedBuyerTransaction ? (
          <BuyerOrderDetail
            transaction={selectedBuyerTransaction}
            onBack={() => setCurrentPage('transaction-history-buyer')}
            onOpenChat={(sellerName, orderId) => {
              const conversation = MOCK_CHAT_CONVERSATIONS.find(c => c.orderNumber === orderId);
              if (conversation) {
                setSelectedChatConversation(conversation);
                setCurrentPage('chat');
              }
            }}
          />
        ) : (
          <TransactionHistoryBuyer
            transactions={MOCK_BUYER_TRANSACTIONS}
            onViewDetail={(transaction) => {
              setSelectedBuyerTransaction(transaction);
              setCurrentPage('buyer-order-detail');
            }}
            onOpenChat={(sellerName, orderId) => {
              const conversation = MOCK_CHAT_CONVERSATIONS.find(c => c.orderNumber === orderId);
              if (conversation) {
                setSelectedChatConversation(conversation);
                setCurrentPage('chat');
              }
            }}
          />
        );
      case 'transaction-history-seller':
        return (
          <TransactionHistorySeller
            transactions={MOCK_SELLER_TRANSACTIONS}
            onViewDetail={(transaction) => {
              setSelectedTransaction(transaction);
              setCurrentPage('seller-order-detail');
            }}
            onOpenChat={(buyerName, orderId) => {
              const conversation = MOCK_CHAT_CONVERSATIONS.find(c => c.orderNumber === orderId);
              if (conversation) {
                setSelectedChatConversation(conversation);
                setCurrentPage('chat');
              }
            }}
          />
        );
      case 'seller-order-detail':
        return selectedTransaction ? (
          <SellerOrderDetail
            transaction={selectedTransaction}
            onBack={() => setCurrentPage('transaction-history-seller')}
            onOpenChat={(buyerName, orderId) => {
              const conversation = MOCK_CHAT_CONVERSATIONS.find(c => c.orderNumber === orderId);
              if (conversation) {
                setSelectedChatConversation(conversation);
                setCurrentPage('chat');
              }
            }}
          />
        ) : (
          <TransactionHistorySeller
            transactions={MOCK_SELLER_TRANSACTIONS}
            onViewDetail={(transaction) => {
              setSelectedTransaction(transaction);
              setCurrentPage('seller-order-detail');
            }}
            onOpenChat={(buyerName, orderId) => {
              const conversation = MOCK_CHAT_CONVERSATIONS.find(c => c.orderNumber === orderId);
              if (conversation) {
                setSelectedChatConversation(conversation);
                setCurrentPage('chat');
              }
            }}
          />
        );
      case 'chat-list':
        return (
          <ChatList
            conversations={MOCK_CHAT_CONVERSATIONS}
            onSelectConversation={(conversation) => {
              setSelectedChatConversation(conversation);
              setCurrentPage('chat');
            }}
            onBack={() => {
              if (currentUser?.role === 'seller') {
                setCurrentPage('transaction-history-seller');
              } else {
                setCurrentPage('home');
              }
            }}
          />
        );
      case 'chat':
        return selectedChatConversation ? (
          <ChatPage
            conversation={selectedChatConversation}
            messages={MOCK_CHAT_MESSAGES[selectedChatConversation.id] || []}
            currentUserId="seller-1"
            currentUserName={currentUser?.name || 'Seller'}
            onBack={() => setCurrentPage('chat-list')}
            onSendMessage={(message) => {
              console.log('Sending message:', message);
            }}
          />
        ) : (
          <ChatList
            conversations={MOCK_CHAT_CONVERSATIONS}
            onSelectConversation={(conversation) => {
              setSelectedChatConversation(conversation);
              setCurrentPage('chat');
            }}
            onBack={() => {
              if (currentUser?.role === 'seller') {
                setCurrentPage('transaction-history-seller');
              } else {
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