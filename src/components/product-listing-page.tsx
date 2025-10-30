import { useState, useMemo } from 'react';
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
import { MOCK_PRODUCTS, filterProducts } from '../lib/mock-data';
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
  const [sortBy, setSortBy] = useState<string>('');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedPlantAges, setSelectedPlantAges] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [radiusKm, setRadiusKm] = useState<number[]>([100]);

  const filteredProducts = useMemo(() => {
    return filterProducts(MOCK_PRODUCTS, {
      category: category || undefined,
      searchQuery,
      sortBy,
      minPrice: minPrice > 0 ? minPrice : undefined,
      maxPrice: maxPrice < 1000000 ? maxPrice : undefined,
      minRating: minRating > 0 ? minRating : undefined,
      plantAge: selectedPlantAges.length > 0 ? selectedPlantAges : undefined,
      location: locationFilter && locationFilter !== 'all' ? locationFilter : undefined,
    });
  }, [category, searchQuery, sortBy, minPrice, maxPrice, minRating, selectedPlantAges, locationFilter]);

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
          <p className="text-gray-600">{filteredProducts.length} produk ditemukan</p>
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
          {filteredProducts.length === 0 ? (
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