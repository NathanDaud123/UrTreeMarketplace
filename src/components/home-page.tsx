import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Leaf, Sprout, Hammer, AlertCircle } from 'lucide-react';
import type { Product, ProductCategory, User } from '../App';
import { MOCK_PRODUCTS } from '../lib/mock-data';
import { Alert, AlertDescription } from './ui/alert';
import mockupImage from 'figma:asset/9b819861dd521d9e484552f654e9563e6da9f78f.png';

interface HomePageProps {
  onCategorySelect: (category: ProductCategory) => void;
  onProductSelect: (product: Product) => void;
  currentUser: User | null;
  isProfileComplete: boolean;
  onCompleteProfile: () => void;
}

export function HomePage({ onCategorySelect, onProductSelect, currentUser, isProfileComplete, onCompleteProfile }: HomePageProps) {
  const categories = [
    {
      id: 'tanaman-hidup' as ProductCategory,
      name: 'Tanaman Hidup',
      description: 'Tanaman hias siap tanam untuk indoor & outdoor',
      icon: Leaf,
      color: 'bg-green-500',
      colorLight: 'bg-green-50',
      colorText: 'text-green-600',
      image: 'https://images.unsplash.com/photo-1644207409929-2665856fefd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHBsYW50JTIwcG90fGVufDF8fHx8MTc2MTU3NDA4Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 'benih' as ProductCategory,
      name: 'Benih',
      description: 'Benih berkualitas untuk sayuran, buah & bunga',
      icon: Sprout,
      color: 'bg-amber-500',
      colorLight: 'bg-amber-50',
      colorText: 'text-amber-600',
      image: 'https://images.unsplash.com/photo-1728977627308-1100ae430cef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJkZW4lMjBzZWVkcyUyMHBhY2tldHxlbnwxfHx8fDE3NjE1NzQwODN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 'peralatan' as ProductCategory,
      name: 'Peralatan & Media Tanam',
      description: 'Alat berkebun, pupuk, pot & media tanam',
      icon: Hammer,
      color: 'bg-blue-500',
      colorLight: 'bg-blue-50',
      colorText: 'text-blue-600',
      image: 'https://images.unsplash.com/photo-1523301551780-cd17359a95d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJkZW5pbmclMjB0b29sc3xlbnwxfHx8fDE3NjE1NzQwODN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ];

  // Get featured products (top sold)
  const featuredProducts = [...MOCK_PRODUCTS]
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Profile Completion Alert */}
      {currentUser && !isProfileComplete && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="container mx-auto px-4 py-3">
            <Alert className="border-amber-300 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-amber-800">
                  Lengkapi informasi pribadi Anda untuk dapat melakukan pembelian
                </span>
                <Button 
                  size="sm" 
                  onClick={onCompleteProfile}
                  className="bg-amber-600 hover:bg-amber-700 ml-4"
                >
                  Lengkapi Sekarang
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-green-900/50 to-transparent"></div>
        
        <div className="container mx-auto max-w-screen-xl px-8 lg:pl-48 lg:pr-24 xl:pl-64 xl:pr-32 py-20 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content - Text */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                <span className="text-sm text-green-50">Marketplace Tanaman Terpercaya</span>
              </div>
              
              <h1 className="text-white mb-6 text-4xl md:text-5xl lg:text-6xl">
                Temukan Tanaman Impian Anda
              </h1>
              <p className="text-xl text-green-50 mb-8 max-w-xl">
                Jelajahi ribuan tanaman hias, benih berkualitas, dan peralatan berkebun dari penjual terpercaya di seluruh Indonesia
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-green-600 hover:bg-green-50 shadow-xl"
                  onClick={() => onCategorySelect('tanaman-hidup' as ProductCategory)}
                >
                  Mulai Berbelanja
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-green-600 backdrop-blur-sm shadow-lg transition-all"
                  onClick={() => {
                    const categorySection = document.querySelector('section');
                    categorySection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  Pelajari Lebih Lanjut
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-12 max-w-lg">
                <div>
                  <div className="text-3xl text-white mb-1">1000+</div>
                  <div className="text-sm text-green-100">Produk</div>
                </div>
                <div>
                  <div className="text-3xl text-white mb-1">50+</div>
                  <div className="text-sm text-green-100">Penjual</div>
                </div>
                <div>
                  <div className="text-3xl text-white mb-1">5000+</div>
                  <div className="text-sm text-green-100">Transaksi</div>
                </div>
              </div>
            </div>

            {/* Right Content - Mockup */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="relative">
                <img 
                  src={mockupImage} 
                  alt="UrTree Mobile App Preview" 
                  className="w-full max-w-lg h-auto drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Category Section */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="mb-3">Jelajahi Kategori</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Pilih kategori yang Anda butuhkan dan temukan produk terbaik dari penjual terpercaya
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Card
                  key={category.id}
                  className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group border-0 shadow-lg"
                  onClick={() => onCategorySelect(category.id)}
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className={`absolute top-4 left-4 ${category.color} w-14 h-14 rounded-xl flex items-center justify-center shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white mb-1">{category.name}</h3>
                      <p className="text-sm text-gray-200">{category.description}</p>
                    </div>
                  </div>
                  <CardContent className={`p-6 ${category.colorLight}`}>
                    <Button variant="ghost" className={`w-full ${category.colorText} hover:${category.colorLight}`}>
                      Lihat Produk →
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Featured Products */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="mb-2">Produk Terlaris</h2>
              <p className="text-gray-600">Pilihan favorit dari ribuan pembeli</p>
            </div>
            <Button variant="outline" onClick={() => onCategorySelect('tanaman-hidup' as ProductCategory)}>
              Lihat Semua
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 shadow-md"
                onClick={() => onProductSelect(product)}
              >
                <div className="relative h-56 overflow-hidden bg-gray-100">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span>{product.rating}</span>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h4 className="mb-2 line-clamp-2 min-h-[3rem] group-hover:text-green-600 transition-colors">
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                    <span>{product.reviews} ulasan</span>
                    <span>•</span>
                    <span>{product.sold} terjual</span>
                  </div>
                  <div className="text-xl text-green-600 mb-2">
                    Rp {product.price.toLocaleString('id-ID')}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <span>📍</span>
                    <span>{product.sellerLocation}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}