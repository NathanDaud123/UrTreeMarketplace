import { Search, ShoppingCart, User, Store, LayoutDashboard, LogOut, UserPlus, Settings, History, MessageCircle, ShoppingBag, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { useState } from 'react';
import type { User as UserType } from '../App';
import logoImage from 'figma:asset/359324a7664b58526f420bb21c5e4b37a62aee04.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface NavbarProps {
  user: UserType | null;
  cartItemCount: number;
  onLogoClick: () => void;
  onCartClick: () => void;
  onSearch: (query: string) => void;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onApplyAsSeller: () => void;
  onSwitchRole?: (newRole: 'buyer' | 'seller') => void;
  onLogin: () => void;
}

export function Navbar({
  user,
  cartItemCount,
  onLogoClick,
  onCartClick,
  onSearch,
  onNavigate,
  onLogout,
  onApplyAsSeller,
  onSwitchRole,
  onLogin,
}: NavbarProps) {
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
    // Optionally trigger search with empty query to show all products
    onSearch('');
  };

  const handleApplySeller = () => {
    // Langsung ke halaman seller registration
    onApplyAsSeller();
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6 h-16">
            {/* Logo */}
            <button
              onClick={onLogoClick}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0"
            >
              <img 
                src={logoImage} 
                alt="UrTree Logo" 
                className="h-10 w-auto"
              />
            </button>

            {/* Search Bar - Only for buyers and guests */}
            {(!user || user.role === 'buyer') && (
              <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Cari tanaman, benih, atau peralatan..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Seller Center Title */}
            {user && user.role === 'seller' && (
              <div className="flex-1">
                <h2 className="text-green-600 font-bold">Seller Center</h2>
                <p className="text-xs text-gray-500">Kelola toko dan produk Anda</p>
              </div>
            )}

            {/* Admin Center Title */}
            {user && user.role === 'admin' && (
              <div className="flex-1">
                <h2 className="text-purple-600 font-bold">Admin Dashboard</h2>
                <p className="text-xs text-gray-500">Monitoring & Analytics</p>
              </div>
            )}

            <div className="flex items-center gap-3 ml-auto">
              {/* Guest Mode - Login/Register */}
              {!user && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onLogin}
                    className="border-green-600 text-green-600 hover:bg-green-50"
                  >
                    Masuk
                  </Button>
                  <Button
                    size="sm"
                    onClick={onLogin}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Daftar
                  </Button>
                </div>
              )}

              {/* Logged In User */}
              {user && (
                <>
                  {/* Cart - Only for buyers */}
                  {user.role === 'buyer' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onCartClick}
                      className="relative"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {cartItemCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-green-600">
                          {cartItemCount}
                        </Badge>
                      )}
                    </Button>
                  )}

                  {/* Messages - For sellers and buyers */}
                  {user.role !== 'admin' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onNavigate('chat-list')}
                      className="relative"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </Button>
                  )}

                  {/* User Menu */}
                  <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="hidden md:block text-left">
                      <div className="text-sm leading-none">{user.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {user.role === 'buyer' && 'Pembeli'}
                        {user.role === 'seller' && 'Penjual'}
                        {user.role === 'admin' && 'Admin'}
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  
                  {user.role === 'buyer' && !user.isPendingSeller && !user.hasSellerAccount && (
                    <>
                      <DropdownMenuItem onClick={handleApplySeller}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Daftar Jadi Penjual
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {user.role === 'buyer' && user.hasSellerAccount && onSwitchRole && (
                    <>
                      <DropdownMenuItem 
                        onClick={() => onSwitchRole('seller')}
                        className="text-green-600"
                      >
                        <Store className="w-4 h-4 mr-2" />
                        Mode Penjual
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {user.isPendingSeller && (
                    <>
                      <DropdownMenuItem disabled>
                        <span className="text-xs text-orange-600">⏳ Pengajuan penjual diproses...</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {user.role === 'buyer' && (
                    <>
                      <DropdownMenuItem onClick={() => onNavigate('transaction-history-buyer')}>
                        <History className="w-4 h-4 mr-2" />
                        Riwayat Pembelian
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNavigate('chat-list')}>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Pesan
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNavigate('profile')}>
                        <User className="w-4 h-4 mr-2" />
                        Profil Saya
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNavigate('settings')}>
                        <Settings className="w-4 h-4 mr-2" />
                        Pengaturan
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {user.role === 'seller' && (
                    <>
                      <DropdownMenuItem onClick={() => onNavigate('seller-dashboard')}>
                        <Store className="w-4 h-4 mr-2" />
                        Dashboard Toko
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNavigate('transaction-history-seller')}>
                        <History className="w-4 h-4 mr-2" />
                        Riwayat Penjualan
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {onSwitchRole && (
                        <DropdownMenuItem 
                          onClick={() => onSwitchRole('buyer')}
                          className="text-blue-600"
                        >
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          Mode Pembeli
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onNavigate('chat-list')}>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Pesan
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNavigate('profile')}>
                        <User className="w-4 h-4 mr-2" />
                        Profil Saya
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNavigate('settings')}>
                        <Settings className="w-4 h-4 mr-2" />
                        Pengaturan
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {user.role === 'admin' && (
                    <>
                      <DropdownMenuItem onClick={() => onNavigate('admin-dashboard')}>
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNavigate('profile')}>
                        <User className="w-4 h-4 mr-2" />
                        Profil Saya
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNavigate('settings')}>
                        <Settings className="w-4 h-4 mr-2" />
                        Pengaturan
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}