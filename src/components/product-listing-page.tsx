import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { SlidersHorizontal } from 'lucide-react';
import type { Product, ProductCategory } from '../App';
import { productAPI } from '../utils/api';
import { Store } from 'lucide-react';

interface ProductListingPageProps {
  category: ProductCategory | null;
  searchQuery: string;
  onProductSelect: (product: Product) => void;
}

export function ProductListingPage({
  category,
  searchQuery,
  onProductSelect,
}: ProductListingPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedPlantAges, setSelectedPlantAges] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [radiusKm, setRadiusKm] = useState<number[]>([100]);

  // Fetch products from database
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await productAPI.getAll({
          category: category || undefined,
          search: searchQuery || undefined,
        });
        if (response.products && Array.isArray(response.products)) {
          setProducts(response.products);
        } else {
          setProducts([]);
        }
      } catch (err: any) {
        console.error('Error loading products:', err);
        setError('Gagal memuat produk');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [category, searchQuery]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by stock (only show products with stock)
    filtered = filtered.filter(product => product.stock > 0);

    // Filter by price range
    if (minPrice > 0) {
      filtered = filtered.filter(product => product.price >= minPrice);
    }
    if (maxPrice < 1000000) {
      filtered = filtered.filter(product => product.price <= maxPrice);
    }

    // Filter by rating (seller rating)
    if (minRating > 0) {
      filtered = filtered.filter(product => (product.sellerRating || 0) >= minRating);
    }

    // Filter by plant age (for tanaman hidup)
    if (selectedPlantAges.length > 0 && category === 'tanaman-hidup') {
      filtered = filtered.filter(product => {
        if (!product.plantAge) return false;
        return selectedPlantAges.some(age => {
          if (age === '<1thn') return product.plantAge?.includes('bulan') || product.plantAge?.includes('minggu');
          if (age === '1thn+') return product.plantAge?.includes('tahun') && !product.plantAge?.includes('3');
          if (age === '3thn+') return product.plantAge?.includes('3') || product.plantAge?.includes('lebih');
          return false;
        });
      });
    }

    // Filter by location
    if (locationFilter && locationFilter !== 'all') {
      filtered = filtered.filter(product => 
        product.sellerLocation?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Sort products
    if (sortBy) {
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          case 'bestseller':
            return (b.sold || 0) - (a.sold || 0);
          case 'price-low':
            return a.price - b.price;
          case 'price-high':
            return b.price - a.price;
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [products, sortBy, minPrice, maxPrice, minRating, selectedPlantAges, locationFilter, category]);

  const handlePlantAgeToggle = (age: string) => {
    setSelectedPlantAges(prev =>
      prev.includes(age) ? prev.filter(a => a !== age) : [...prev, age]
    );
  };

  const handleResetFilters = () => {
    setSortBy('');
    setMinPrice(0);
    setMaxPrice(1000000);
    setMinRating(0);
    setSelectedPlantAges([]);
    setLocationFilter('');
    setRadiusKm([100]);
  };

  const getCategoryTitle = () => {
    if (category === 'tanaman-hidup') return 'Tanaman Hidup';
    if (category === 'benih') return 'Benih';
    if (category === 'peralatan') return 'Peralatan & Media Tanam';
    if (searchQuery) return `Hasil pencarian "${searchQuery}"`;
    return 'Semua Produk';
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Sort */}
      <div>
        <Label>Urutkan</Label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Pilih urutan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Terbaru</SelectItem>
            <SelectItem value="bestseller">Terlaris</SelectItem>
            <SelectItem value="price-low">Harga Terendah</SelectItem>
            <SelectItem value="price-high">Harga Tertinggi</SelectItem>
            <SelectItem value="rating">Rating Tertinggi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div>
        <Label>Rentang Harga</Label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div>
            <Input
              type="number"
              placeholder="Min"
              value={minPrice || ''}
              onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice === 1000000 ? '' : maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value) || 1000000)}
            />
          </div>
        </div>
      </div>

      {/* Rating Seller */}
      <div>
        <Label>Rating Penjual</Label>
        <div className="flex gap-2 mt-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <Button
              key={rating}
              variant={minRating === rating ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMinRating(minRating === rating ? 0 : rating)}
            >
              {rating}★
            </Button>
          ))}
        </div>
      </div>

      {/* Plant Age - Only for tanaman hidup */}
      {(category === 'tanaman-hidup' || !category) && (
        <div>
          <Label>Usia Tanaman</Label>
          <div className="space-y-2 mt-2">
            {['<1thn', '1thn+', '3thn+'].map((age) => (
              <div key={age} className="flex items-center space-x-2">
                <Checkbox
                  id={age}
                  checked={selectedPlantAges.includes(age)}
                  onCheckedChange={() => handlePlantAgeToggle(age)}
                />
                <label htmlFor={age} className="text-sm cursor-pointer">
                  {age === '<1thn' ? 'Kurang dari 1 tahun' : age === '1thn+' ? '1 tahun lebih' : '3 tahun lebih'}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Location Filter */}
      <div>
        <Label>Lokasi Penjual</Label>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Semua lokasi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua lokasi</SelectItem>
            <SelectItem value="Jakarta">Jakarta</SelectItem>
            <SelectItem value="Surabaya">Surabaya</SelectItem>
            <SelectItem value="Bandung">Bandung</SelectItem>
            <SelectItem value="Yogyakarta">Yogyakarta</SelectItem>
            <SelectItem value="Tangerang">Tangerang</SelectItem>
            <SelectItem value="Bogor">Bogor</SelectItem>
            <SelectItem value="Malang">Malang</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Radius - Only for tanaman hidup */}
      {(category === 'tanaman-hidup' || !category) && (
        <div>
          <Label>Radius Pengiriman (max {radiusKm[0]} km)</Label>
          <Slider
            value={radiusKm}
            onValueChange={setRadiusKm}
            max={100}
            min={10}
            step={10}
            className="mt-3"
          />
        </div>
      )}

      <Button onClick={handleResetFilters} variant="outline" className="w-full">
        Reset Filter
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="mb-1">{getCategoryTitle()}</h2>
          <p className="text-gray-600">
            {loading ? 'Memuat...' : `${filteredProducts.length} produk ditemukan`}
          </p>
        </div>

        {/* Mobile Filter Button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="md:hidden">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filter & Sortir</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-6">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block w-72 flex-shrink-0">
          <Card className="sticky top-20 shadow-lg border-0">
            <CardContent className="p-6">
              <h3 className="mb-4">Filter & Sortir</h3>
              <FilterContent />
            </CardContent>
          </Card>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <Card className="shadow-md border-0">
              <CardContent className="p-12 text-center">
                <div className="text-gray-500">Memuat produk...</div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="shadow-md border-0">
              <CardContent className="p-12 text-center">
                <div className="text-red-500 mb-4">{error}</div>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Coba Lagi
                </Button>
              </CardContent>
            </Card>
          ) : filteredProducts.length === 0 ? (
            <Card className="shadow-md border-0">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🔍</span>
                </div>
                <h3 className="mb-2">Tidak ada produk ditemukan</h3>
                <p className="text-gray-500 mb-4">Coba ubah filter atau kata kunci pencarian Anda</p>
                <Button onClick={handleResetFilters} variant="outline">
                  Reset Filter
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
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
                    {product.category === 'tanaman-hidup' && product.plantAge && (
                      <div className="absolute top-2 right-2 bg-green-600 text-white px-2.5 py-1 rounded-lg text-xs shadow-md">
                        {product.plantAge}
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs flex items-center gap-1 shadow-md">
                        <span className="text-yellow-500">★</span>
                        <span>{product.rating}</span>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="mb-2 line-clamp-2 min-h-[3rem] group-hover:text-green-600 transition-colors">{product.name}</h4>
                    <div className="flex items-center gap-2 mb-2 text-sm">
                      <span className="text-gray-600">{product.reviews} ulasan</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">{product.sold} terjual</span>
                    </div>
                    <div className="mb-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="text-sm text-gray-600 mb-0.5 flex items-center gap-1">
                        <Store className="w-3 h-3" />
                        <span className="line-clamp-1">{product.sellerName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500 text-xs">★</span>
                        <span className="text-xs text-gray-600">{product.sellerRating}</span>
                      </div>
                    </div>
                    <div className="text-xl text-green-600 mb-1">
                      Rp {product.price.toLocaleString('id-ID')}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <span>📍</span>
                        {product.sellerLocation}
                      </span>
                    </div>
                    {product.category === 'tanaman-hidup' && product.maxDeliveryRadius && (
                      <div className="text-xs text-blue-600 mt-2 bg-blue-50 px-2 py-1 rounded">
                        📍 Radius {product.maxDeliveryRadius} km
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}