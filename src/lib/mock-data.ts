import type { Product } from '../App';

export const MOCK_PRODUCTS: Product[] = [
  // Tanaman Hidup
  {
    id: 'p1',
    name: 'Monstera Deliciosa',
    description: 'Tanaman hias populer dengan daun berlubang yang unik. Cocok untuk indoor dan mudah perawatan.',
    price: 150000,
    stock: 25,
    category: 'tanaman-hidup',
    images: ['https://images.unsplash.com/photo-1644207409929-2665856fefd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHBsYW50JTIwcG90fGVufDF8fHx8MTc2MTU3NDA4Mnww&ixlib=rb-4.1.0&q=80&w=1080'],
    sellerId: 's1',
    sellerName: 'Green Paradise Jakarta',
    sellerRating: 4.8,
    sellerLocation: 'Jakarta Selatan',
    sold: 142,
    rating: 4.9,
    reviews: 87,
    plantAge: '1thn+',
    maxDeliveryRadius: 50,
    sellerLat: -6.2608,
    sellerLng: 106.7818,
  },
  {
    id: 'p2',
    name: 'Sansevieria Trifasciata',
    description: 'Lidah mertua, tanaman hias yang sangat mudah perawatan dan tahan kekeringan.',
    price: 75000,
    stock: 50,
    category: 'tanaman-hidup',
    images: ['https://images.unsplash.com/photo-1592150621744-aca64f48394a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRvb3IlMjBwbGFudHN8ZW58MXx8fHwxNzYxNDg2MDIyfDA&ixlib=rb-4.1.0&q=80&w=1080'],
    sellerId: 's2',
    sellerName: 'Taman Hijau Surabaya',
    sellerRating: 4.5,
    sellerLocation: 'Surabaya',
    sold: 203,
    rating: 4.7,
    reviews: 124,
    plantAge: '<1thn',
    maxDeliveryRadius: 30,
    sellerLat: -7.2575,
    sellerLng: 112.7521,
  },
  {
    id: 'p3',
    name: 'Succulent Mix Garden',
    description: 'Kombinasi 5 jenis succulent dalam pot cantik. Ideal untuk dekorasi meja kerja.',
    price: 95000,
    stock: 30,
    category: 'tanaman-hidup',
    images: ['https://images.unsplash.com/photo-1550207477-85f418dc3448?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWNjdWxlbnQlMjBwbGFudHxlbnwxfHx8fDE3NjE1MDI4NDV8MA&ixlib=rb-4.1.0&q=80&w=1080'],
    sellerId: 's1',
    sellerName: 'Green Paradise Jakarta',
    sellerRating: 4.8,
    sellerLocation: 'Jakarta Selatan',
    sold: 98,
    rating: 4.8,
    reviews: 65,
    plantAge: '<1thn',
    maxDeliveryRadius: 100,
    sellerLat: -6.2608,
    sellerLng: 106.7818,
  },
  {
    id: 'p4',
    name: 'Bonsai Beringin Mini',
    description: 'Bonsai beringin berusia 3 tahun lebih, sudah terbentuk dengan baik.',
    price: 450000,
    stock: 8,
    category: 'tanaman-hidup',
    images: ['https://images.unsplash.com/photo-1641412722397-3be359096577?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib25zYWklMjB0cmVlfGVufDF8fHx8MTc2MTQ4Mjk0M3ww&ixlib=rb-4.1.0&q=80&w=1080'],
    sellerId: 's3',
    sellerName: 'Bonsai Master Bandung',
    sellerRating: 4.9,
    sellerLocation: 'Bandung',
    sold: 45,
    rating: 5.0,
    reviews: 32,
    plantAge: '3thn+',
    maxDeliveryRadius: 25,
    sellerLat: -6.9175,
    sellerLng: 107.6191,
  },
  {
    id: 'p5',
    name: 'Philodendron Brasil',
    description: 'Philodendron dengan variasi daun kuning-hijau yang cantik. Mudah merambat.',
    price: 120000,
    stock: 18,
    category: 'tanaman-hidup',
    images: ['https://images.unsplash.com/photo-1644207409929-2665856fefd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHBsYW50JTIwcG90fGVufDF8fHx8MTc2MTU3NDA4Mnww&ixlib=rb-4.1.0&q=80&w=1080'],
    sellerId: 's1',
    sellerName: 'Green Paradise Jakarta',
    sellerRating: 4.8,
    sellerLocation: 'Jakarta Selatan',
    sold: 156,
    rating: 4.7,
    reviews: 98,
    plantAge: '1thn+',
    maxDeliveryRadius: 75,
    sellerLat: -6.2608,
    sellerLng: 106.7818,
  },

  // Benih
  {
    id: 'p6',
    name: 'Benih Tomat Cherry',
    description: 'Benih tomat cherry organik, tingkat perkecambahan 95%. Isi 50 biji.',
    price: 25000,
    stock: 100,
    category: 'benih',
    images: ['https://images.unsplash.com/photo-1728977627308-1100ae430cef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJkZW4lMjBzZWVkcyUyMHBhY2tldHxlbnwxfHx8fDE3NjE1NzQwODN8MA&ixlib=rb-4.1.0&q=80&w=1080'],
    sellerId: 's4',
    sellerName: 'Benih Nusantara',
    sellerRating: 4.6,
    sellerLocation: 'Yogyakarta',
    sold: 312,
    rating: 4.8,
    reviews: 187,
  },
  {
    id: 'p7',
    name: 'Benih Cabe Rawit',
    description: 'Benih cabe rawit super pedas, cocok untuk hidroponik maupun tanah. Isi 100 biji.',
    price: 18000,
    stock: 150,
    category: 'benih',
    images: ['https://images.unsplash.com/photo-1728977627308-1100ae430cef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJkZW4lMjBzZWVkcyUyMHBhY2tldHxlbnwxfHx8fDE3NjE1NzQwODN8MA&ixlib=rb-4.1.0&q=80&w=1080'],
    sellerId: 's4',
    sellerName: 'Benih Nusantara',
    sellerRating: 4.6,
    sellerLocation: 'Yogyakarta',
    sold: 428,
    rating: 4.9,
    reviews: 256,
  },
  {
    id: 'p8',
    name: 'Benih Bayam Merah',
    description: 'Benih bayam merah organik, panen 30 hari. Isi 200 biji.',
    price: 15000,
    stock: 200,
    category: 'benih',
    images: ['https://images.unsplash.com/photo-1728977627308-1100ae430cef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJkZW4lMjBzZWVkcyUyMHBhY2tldHxlbnwxfHx8fDE3NjE1NzQwODN8MA&ixlib=rb-4.1.0&q=80&w=1080'],
    sellerId: 's4',
    sellerName: 'Benih Nusantara',
    sellerRating: 4.6,
    sellerLocation: 'Yogyakarta',
    sold: 267,
    rating: 4.7,
    reviews: 145,
  },
  {
    id: 'p9',
    name: 'Benih Bunga Matahari',
    description: 'Benih bunga matahari Giant Russian, tinggi 2-3 meter. Isi 30 biji.',
    price: 22000,
    stock: 80,
    category: 'benih',
    images: ['https://images.unsplash.com/photo-1728977627308-1100ae430cef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJkZW4lMjBzZWVkcyUyMHBhY2tldHxlbnwxfHx8fDE3NjE1NzQwODN8MA&ixlib=rb-4.1.0&q=80&w=1080'],
    sellerId: 's5',
    sellerName: 'Seeds Garden',
    sellerRating: 4.7,
    sellerLocation: 'Malang',
    sold: 189,
    rating: 4.8,
    reviews: 112,
  },

  // Peralatan dan Media Tanam
  {
    id: 'p10',
    name: 'Set Alat Berkebun 5 Pcs',
    description: 'Paket lengkap alat berkebun: sekop, garpu, penyiram, gunting, sarung tangan.',
    price: 185000,
    stock: 40,
    category: 'peralatan',
    images: ['https://images.unsplash.com/photo-1523301551780-cd17359a95d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJkZW5pbmclMjB0b29sc3xlbnwxfHx8fDE3NjE1NzQwODN8MA&ixlib=rb-4.1.0&q=80&w=1080'],
    sellerId: 's6',
    sellerName: 'Garden Tools Indonesia',
    sellerRating: 4.5,
    sellerLocation: 'Tangerang',
    sold: 234,
    rating: 4.6,
    reviews: 156,
  },
  {
    id: 'p11',
    name: 'Pupuk Kompos Organik 5kg',
    description: 'Pupuk kompos organik premium dari bahan alami pilihan. Sudah matang sempurna.',
    price: 45000,
    stock: 120,
    category: 'peralatan',
    images: ['https://images.unsplash.com/photo-1523301551780-cd17359a95d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJkZW5pbmclMjB0b29sc3xlbnwxfHx8fDE3NjE1NzQwODN8MA&ixlib=rb-4.1.0&q=80&w=1080'],
    sellerId: 's7',
    sellerName: 'Organic Farm Supply',
    sellerRating: 4.8,
    sellerLocation: 'Bogor',
    sold: 567,
    rating: 4.9,
    reviews: 342,
  },
  {
    id: 'p12',
    name: 'Pot Tanah Liat 20cm',
    description: 'Pot tanah liat asli diameter 20cm dengan lubang drainase. Set isi 3 pcs.',
    price: 65000,
    stock: 75,
    category: 'peralatan',
    images: ['https://images.unsplash.com/photo-1523301551780-cd17359a95d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJkZW5pbmclMjB0b29sc3xlbnwxfHx8fDE3NjE1NzQwODN8MA&ixlib=rb-4.1.0&q=80&w=1080'],
    sellerId: 's6',
    sellerName: 'Garden Tools Indonesia',
    sellerRating: 4.5,
    sellerLocation: 'Tangerang',
    sold: 198,
    rating: 4.7,
    reviews: 123,
  },
  {
    id: 'p13',
    name: 'Media Tanam Hidroponik 10L',
    description: 'Media tanam khusus hidroponik dari cocopeat dan perlite berkualitas tinggi.',
    price: 55000,
    stock: 90,
    category: 'peralatan',
    images: ['https://images.unsplash.com/photo-1523301551780-cd17359a95d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJkZW5pbmclMjB0b29sc3xlbnwxfHx8fDE3NjE1NzQwODN8MA&ixlib=rb-4.1.0&q=80&w=1080'],
    sellerId: 's7',
    sellerName: 'Organic Farm Supply',
    sellerRating: 4.8,
    sellerLocation: 'Bogor',
    sold: 289,
    rating: 4.8,
    reviews: 178,
  },
  {
    id: 'p14',
    name: 'Sprayer 2 Liter',
    description: 'Sprayer tekanan manual 2 liter untuk menyiram dan menyemprot tanaman.',
    price: 85000,
    stock: 55,
    category: 'peralatan',
    images: ['https://images.unsplash.com/photo-1523301551780-cd17359a95d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJkZW5pbmclMjB0b29sc3xlbnwxfHx8fDE3NjE1NzQwODN8MA&ixlib=rb-4.1.0&q=80&w=1080'],
    sellerId: 's6',
    sellerName: 'Garden Tools Indonesia',
    sellerRating: 4.5,
    sellerLocation: 'Tangerang',
    sold: 145,
    rating: 4.6,
    reviews: 89,
  },
];

// Helper function untuk filter produk
export function filterProducts(
  products: Product[],
  filters: {
    category?: string | null;
    searchQuery?: string;
    sortBy?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    plantAge?: string[];
    location?: string;
  }
): Product[] {
  let filtered = [...products];

  // Filter by category
  if (filters.category) {
    filtered = filtered.filter(p => p.category === filters.category);
  }

  // Filter by search query
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );
  }

  // Filter by price range
  if (filters.minPrice !== undefined) {
    filtered = filtered.filter(p => p.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter(p => p.price <= filters.maxPrice!);
  }

  // Filter by rating
  if (filters.minRating) {
    filtered = filtered.filter(p => p.sellerRating >= filters.minRating!);
  }

  // Filter by plant age (only for tanaman hidup)
  if (filters.plantAge && filters.plantAge.length > 0) {
    filtered = filtered.filter(
      p => p.plantAge && filters.plantAge!.includes(p.plantAge)
    );
  }

  // Filter by location
  if (filters.location) {
    filtered = filtered.filter(p =>
      p.sellerLocation.toLowerCase().includes(filters.location!.toLowerCase())
    );
  }

  // Sort
  if (filters.sortBy === 'newest') {
    // In real app, sort by date. For mock, reverse order
    filtered = filtered.reverse();
  } else if (filters.sortBy === 'price-high') {
    filtered = filtered.sort((a, b) => b.price - a.price);
  } else if (filters.sortBy === 'price-low') {
    filtered = filtered.sort((a, b) => a.price - b.price);
  } else if (filters.sortBy === 'bestseller') {
    filtered = filtered.sort((a, b) => b.sold - a.sold);
  } else if (filters.sortBy === 'rating') {
    filtered = filtered.sort((a, b) => b.rating - a.rating);
  }

  return filtered;
}

// Mock Transactions untuk Buyer
import type { Transaction } from '../components/transaction-history-buyer';

export const MOCK_BUYER_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    orderNumber: 'ORD-2024-001234',
    date: '2024-10-25T10:30:00',
    status: 'completed',
    items: [
      {
        productId: 'p1',
        productName: 'Monstera Deliciosa',
        productImage: 'https://images.unsplash.com/photo-1644207409929-2665856fefd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHBsYW50JTIwcG90fGVufDF8fHx8MTc2MTU3NDA4Mnww&ixlib=rb-4.1.0&q=80&w=1080',
        quantity: 2,
        price: 150000,
        sellerId: 's1',
        sellerName: 'Green Paradise Jakarta',
      },
    ],
    subtotal: 300000,
    shippingCost: 25000,
    total: 325000,
    shippingAddress: 'Jl. Sudirman No. 123, Jakarta Selatan, DKI Jakarta 12190',
    trackingNumber: 'JNE7894561230',
    estimatedDelivery: '27 Oktober 2024',
    paymentMethod: 'Transfer Bank BCA',
  },
  {
    id: 't2',
    orderNumber: 'ORD-2024-001235',
    date: '2024-10-26T14:20:00',
    status: 'shipped',
    items: [
      {
        productId: 'p3',
        productName: 'Succulent Mix Garden',
        productImage: 'https://images.unsplash.com/photo-1550207477-85f418dc3448?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWNjdWxlbnQlMjBwbGFudHxlbnwxfHx8fDE3NjE1MDI4NDV8MA&ixlib=rb-4.1.0&q=80&w=1080',
        quantity: 1,
        price: 95000,
        sellerId: 's1',
        sellerName: 'Green Paradise Jakarta',
      },
      {
        productId: 'p10',
        productName: 'Set Alat Berkebun 5 Pcs',
        productImage: 'https://images.unsplash.com/photo-1523301551780-cd17359a95d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJkZW5pbmclMjB0b29sc3xlbnwxfHx8fDE3NjE1NzQwODN8MA&ixlib=rb-4.1.0&q=80&w=1080',
        quantity: 1,
        price: 185000,
        sellerId: 's6',
        sellerName: 'Garden Tools Indonesia',
      },
    ],
    subtotal: 280000,
    shippingCost: 30000,
    total: 310000,
    shippingAddress: 'Jl. Sudirman No. 123, Jakarta Selatan, DKI Jakarta 12190',
    trackingNumber: 'SICEPAT4567891234',
    estimatedDelivery: '29 Oktober 2024',
    paymentMethod: 'GoPay',
  },
  {
    id: 't3',
    orderNumber: 'ORD-2024-001236',
    date: '2024-10-27T09:15:00',
    status: 'processing',
    items: [
      {
        productId: 'p6',
        productName: 'Benih Tomat Cherry',
        productImage: 'https://images.unsplash.com/photo-1728977627308-1100ae430cef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJkZW4lMjBzZWVkcyUyMHBhY2tldHxlbnwxfHx8fDE3NjE1NzQwODN8MA&ixlib=rb-4.1.0&q=80&w=1080',
        quantity: 3,
        price: 25000,
        sellerId: 's4',
        sellerName: 'Benih Nusantara',
      },
      {
        productId: 'p7',
        productName: 'Benih Cabe Rawit',
        productImage: 'https://images.unsplash.com/photo-1728977627308-1100ae430cef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJkZW4lMjBzZWVkcyUyMHBhY2tldHxlbnwxfHx8fDE3NjE1NzQwODN8MA&ixlib=rb-4.1.0&q=80&w=1080',
        quantity: 2,
        price: 18000,
        sellerId: 's4',
        sellerName: 'Benih Nusantara',
      },
    ],
    subtotal: 111000,
    shippingCost: 15000,
    total: 126000,
    shippingAddress: 'Jl. Sudirman No. 123, Jakarta Selatan, DKI Jakarta 12190',
    paymentMethod: 'OVO',
  },
  {
    id: 't4',
    orderNumber: 'ORD-2024-001237',
    date: '2024-10-28T11:45:00',
    status: 'pending',
    items: [
      {
        productId: 'p11',
        productName: 'Pupuk Kompos Organik 5kg',
        productImage: 'https://images.unsplash.com/photo-1523301551780-cd17359a95d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJkZW5pbmclMjB0b29sc3xlbnwxfHx8fDE3NjE1NzQwODN8MA&ixlib=rb-4.1.0&q=80&w=1080',
        quantity: 2,
        price: 45000,
        sellerId: 's7',
        sellerName: 'Organic Farm Supply',
      },
    ],
    subtotal: 90000,
    shippingCost: 20000,
    total: 110000,
    shippingAddress: 'Jl. Sudirman No. 123, Jakarta Selatan, DKI Jakarta 12190',
    paymentMethod: 'Transfer Bank BCA',
  },
  {
    id: 't5',
    orderNumber: 'ORD-2024-001238',
    date: '2024-10-20T16:30:00',
    status: 'completed',
    items: [
      {
        productId: 'p5',
        productName: 'Philodendron Brasil',
        productImage: 'https://images.unsplash.com/photo-1644207409929-2665856fefd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHBsYW50JTIwcG90fGVufDF8fHx8MTc2MTU3NDA4Mnww&ixlib=rb-4.1.0&q=80&w=1080',
        quantity: 1,
        price: 120000,
        sellerId: 's1',
        sellerName: 'Green Paradise Jakarta',
      },
    ],
    subtotal: 120000,
    shippingCost: 25000,
    total: 145000,
    shippingAddress: 'Jl. Sudirman No. 123, Jakarta Selatan, DKI Jakarta 12190',
    trackingNumber: 'JNT9876543210',
    estimatedDelivery: '23 Oktober 2024',
    paymentMethod: 'ShopeePay',
  },
];

// Mock Transactions untuk Seller
import type { SellerTransaction } from '../components/transaction-history-seller';

export const MOCK_SELLER_TRANSACTIONS: SellerTransaction[] = [
  {
    id: 'st1',
    orderNumber: 'ORD-2024-001234',
    date: '2024-10-25T10:30:00',
    status: 'completed',
    items: [
      {
        productId: 'p1',
        productName: 'Monstera Deliciosa',
        productImage: 'https://images.unsplash.com/photo-1644207409929-2665856fefd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHBsYW50JTIwcG90fGVufDF8fHx8MTc2MTU3NDA4Mnww&ixlib=rb-4.1.0&q=80&w=1080',
        quantity: 2,
        price: 150000,
      },
    ],
    subtotal: 300000,
    commission: 30000, // 10% platform fee
    netIncome: 270000,
    buyerName: 'Budi Santoso',
    buyerPhone: '081234567890',
    shippingAddress: 'Jl. Kebon Jeruk No. 45, Jakarta Barat, DKI Jakarta 11530',
    trackingNumber: 'JNE7894561230',
    estimatedDelivery: '27 Oktober 2024',
    paymentMethod: 'Transfer Bank BCA',
  },
  {
    id: 'st2',
    orderNumber: 'ORD-2024-001240',
    date: '2024-10-26T14:20:00',
    status: 'shipped',
    items: [
      {
        productId: 'p3',
        productName: 'Succulent Mix Garden',
        productImage: 'https://images.unsplash.com/photo-1550207477-85f418dc3448?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWNjdWxlbnQlMjBwbGFudHxlbnwxfHx8fDE3NjE1MDI4NDV8MA&ixlib=rb-4.1.0&q=80&w=1080',
        quantity: 1,
        price: 95000,
      },
    ],
    subtotal: 95000,
    commission: 9500,
    netIncome: 85500,
    buyerName: 'Siti Nurhaliza',
    buyerPhone: '081298765432',
    shippingAddress: 'Jl. Merdeka No. 88, Bandung, Jawa Barat 40111',
    trackingNumber: 'SICEPAT7891234567',
    estimatedDelivery: '29 Oktober 2024',
    paymentMethod: 'GoPay',
  },
  {
    id: 'st3',
    orderNumber: 'ORD-2024-001245',
    date: '2024-10-27T09:15:00',
    status: 'processing',
    items: [
      {
        productId: 'p1',
        productName: 'Monstera Deliciosa',
        productImage: 'https://images.unsplash.com/photo-1644207409929-2665856fefd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHBsYW50JTIwcG90fGVufDF8fHx8MTc2MTU3NDA4Mnww&ixlib=rb-4.1.0&q=80&w=1080',
        quantity: 1,
        price: 150000,
      },
      {
        productId: 'p5',
        productName: 'Philodendron Brasil',
        productImage: 'https://images.unsplash.com/photo-1644207409929-2665856fefd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHBsYW50JTIwcG90fGVufDF8fHx8MTc2MTU3NDA4Mnww&ixlib=rb-4.1.0&q=80&w=1080',
        quantity: 1,
        price: 120000,
      },
    ],
    subtotal: 270000,
    commission: 27000,
    netIncome: 243000,
    buyerName: 'Ahmad Rizki',
    buyerPhone: '085612345678',
    shippingAddress: 'Jl. Gatot Subroto No. 12, Tangerang, Banten 15111',
    paymentMethod: 'OVO',
  },
  {
    id: 'st4',
    orderNumber: 'ORD-2024-001250',
    date: '2024-10-28T11:45:00',
    status: 'pending',
    items: [
      {
        productId: 'p3',
        productName: 'Succulent Mix Garden',
        productImage: 'https://images.unsplash.com/photo-1550207477-85f418dc3448?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWNjdWxlbnQlMjBwbGFudHxlbnwxfHx8fDE3NjE1MDI4NDV8MA&ixlib=rb-4.1.0&q=80&w=1080',
        quantity: 3,
        price: 95000,
      },
    ],
    subtotal: 285000,
    commission: 28500,
    netIncome: 256500,
    buyerName: 'Linda Wijaya',
    buyerPhone: '081387654321',
    shippingAddress: 'Jl. Asia Afrika No. 77, Surabaya, Jawa Timur 60271',
    paymentMethod: 'Transfer Bank BCA',
  },
  {
    id: 'st5',
    orderNumber: 'ORD-2024-001255',
    date: '2024-10-20T16:30:00',
    status: 'completed',
    items: [
      {
        productId: 'p5',
        productName: 'Philodendron Brasil',
        productImage: 'https://images.unsplash.com/photo-1644207409929-2665856fefd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHBsYW50JTIwcG90fGVufDF8fHx8MTc2MTU3NDA4Mnww&ixlib=rb-4.1.0&q=80&w=1080',
        quantity: 2,
        price: 120000,
      },
    ],
    subtotal: 240000,
    commission: 24000,
    netIncome: 216000,
    buyerName: 'Dewi Kartika',
    buyerPhone: '081456789012',
    shippingAddress: 'Jl. Diponegoro No. 99, Semarang, Jawa Tengah 50241',
    trackingNumber: 'JNT9876543210',
    estimatedDelivery: '23 Oktober 2024',
    paymentMethod: 'ShopeePay',
  },
  {
    id: 'st6',
    orderNumber: 'ORD-2024-001260',
    date: '2024-10-22T13:20:00',
    status: 'completed',
    items: [
      {
        productId: 'p1',
        productName: 'Monstera Deliciosa',
        productImage: 'https://images.unsplash.com/photo-1644207409929-2665856fefd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHBsYW50JTIwcG90fGVufDF8fHx8MTc2MTU3NDA4Mnww&ixlib=rb-4.1.0&q=80&w=1080',
        quantity: 1,
        price: 150000,
      },
    ],
    subtotal: 150000,
    commission: 15000,
    netIncome: 135000,
    buyerName: 'Rudi Hermawan',
    buyerPhone: '082134567890',
    shippingAddress: 'Jl. Sudirman No. 123, Yogyakarta 55281',
    trackingNumber: 'ANTERAJA1234567890',
    estimatedDelivery: '24 Oktober 2024',
    paymentMethod: 'Dana',
  },
];

// Mock Chat Conversations
import type { ChatConversation, ChatMessage } from '../components/chat-page';

export const MOCK_CHAT_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'chat-1',
    participantName: 'Budi Santoso',
    participantRole: 'buyer',
    orderId: 'st1',
    orderNumber: 'ORD-2024-001234',
    lastMessage: 'Terima kasih, paketnya sudah sampai dengan selamat!',
    lastMessageTime: '2024-10-28T10:30:00',
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: 'chat-2',
    participantName: 'Siti Nurhaliza',
    participantRole: 'buyer',
    orderId: 'st2',
    orderNumber: 'ORD-2024-001240',
    lastMessage: 'Kak, paket sudah dikirim belum ya?',
    lastMessageTime: '2024-10-28T14:20:00',
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: 'chat-3',
    participantName: 'Ahmad Rizki',
    participantRole: 'buyer',
    orderId: 'st3',
    orderNumber: 'ORD-2024-001245',
    lastMessage: 'Siap kak, ditunggu ya',
    lastMessageTime: '2024-10-28T09:15:00',
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: 'chat-4',
    participantName: 'Linda Wijaya',
    participantRole: 'buyer',
    orderId: 'st4',
    orderNumber: 'ORD-2024-001250',
    lastMessage: 'Halo kak, pembayaran sudah saya konfirmasi',
    lastMessageTime: '2024-10-28T11:45:00',
    unreadCount: 1,
    isOnline: true,
  },
];

export const MOCK_CHAT_MESSAGES: { [key: string]: ChatMessage[] } = {
  'chat-1': [
    {
      id: 'msg-1',
      senderId: 'buyer-1',
      senderName: 'Budi Santoso',
      message: 'Halo kak, saya mau tanya untuk produk Monstera Deliciosa nya masih ready?',
      timestamp: '2024-10-25T10:00:00',
      type: 'text',
      isRead: true,
    },
    {
      id: 'msg-2',
      senderId: 'seller-1',
      senderName: 'Green Paradise Jakarta',
      message: 'Halo kak, masih ready kok. Mau order berapa kak?',
      timestamp: '2024-10-25T10:05:00',
      type: 'text',
      isRead: true,
    },
    {
      id: 'msg-3',
      senderId: 'buyer-1',
      senderName: 'Budi Santoso',
      message: 'Saya mau order 2 pot kak',
      timestamp: '2024-10-25T10:10:00',
      type: 'text',
      isRead: true,
    },
    {
      id: 'msg-4',
      senderId: 'seller-1',
      senderName: 'Green Paradise Jakarta',
      message: 'Siap kak, langsung checkout aja ya. Nanti kita packing dengan baik dan aman 👍',
      timestamp: '2024-10-25T10:12:00',
      type: 'text',
      isRead: true,
    },
    {
      id: 'msg-5',
      senderId: 'buyer-1',
      senderName: 'Budi Santoso',
      message: 'Sudah checkout kak, ditunggu pengirimannya ya',
      timestamp: '2024-10-25T10:30:00',
      type: 'text',
      isRead: true,
    },
    {
      id: 'msg-6',
      senderId: 'seller-1',
      senderName: 'Green Paradise Jakarta',
      message: 'Siap kak, pesanan sudah kami proses dan akan segera dikirim. Terima kasih 🙏',
      timestamp: '2024-10-25T11:00:00',
      type: 'text',
      isRead: true,
    },
    {
      id: 'msg-7',
      senderId: 'buyer-1',
      senderName: 'Budi Santoso',
      message: 'Terima kasih, paketnya sudah sampai dengan selamat!',
      timestamp: '2024-10-28T10:30:00',
      type: 'text',
      isRead: true,
    },
  ],
  'chat-2': [
    {
      id: 'msg-1',
      senderId: 'buyer-2',
      senderName: 'Siti Nurhaliza',
      message: 'Halo kak, untuk Succulent Mix Garden nya itu ukuran pot nya berapa ya?',
      timestamp: '2024-10-26T13:00:00',
      type: 'text',
      isRead: true,
    },
    {
      id: 'msg-2',
      senderId: 'seller-1',
      senderName: 'Green Paradise Jakarta',
      message: 'Halo kak, pot nya diameter 15cm kak. Sudah include pot cantik seperti di foto',
      timestamp: '2024-10-26T13:10:00',
      type: 'text',
      isRead: true,
    },
    {
      id: 'msg-3',
      senderId: 'buyer-2',
      senderName: 'Siti Nurhaliza',
      message: 'Oke kak, saya order 1 ya',
      timestamp: '2024-10-26T14:00:00',
      type: 'text',
      isRead: true,
    },
    {
      id: 'msg-4',
      senderId: 'seller-1',
      senderName: 'Green Paradise Jakarta',
      message: 'Siap kak, sudah kami terima orderannya. Sedang kami kemas dengan rapi',
      timestamp: '2024-10-26T14:30:00',
      type: 'text',
      isRead: true,
    },
    {
      id: 'msg-5',
      senderId: 'buyer-2',
      senderName: 'Siti Nurhaliza',
      message: 'Kak, paket sudah dikirim belum ya?',
      timestamp: '2024-10-28T14:20:00',
      type: 'text',
      isRead: false,
    },
  ],
  'chat-3': [
    {
      id: 'msg-1',
      senderId: 'buyer-3',
      senderName: 'Ahmad Rizki',
      message: 'Kak mau tanya, bisa request tanaman yang daunnya lebih besar?',
      timestamp: '2024-10-27T08:00:00',
      type: 'text',
      isRead: true,
    },
    {
      id: 'msg-2',
      senderId: 'seller-1',
      senderName: 'Green Paradise Jakarta',
      message: 'Bisa kak, nanti kita carikan yang daun nya bagus dan besar. Ditambahkan di catatan pesanan aja ya kak',
      timestamp: '2024-10-27T08:30:00',
      type: 'text',
      isRead: true,
    },
    {
      id: 'msg-3',
      senderId: 'buyer-3',
      senderName: 'Ahmad Rizki',
      message: 'Oke makasih kak, sudah order',
      timestamp: '2024-10-27T09:00:00',
      type: 'text',
      isRead: true,
    },
    {
      id: 'msg-4',
      senderId: 'seller-1',
      senderName: 'Green Paradise Jakarta',
      message: 'Siap kak, ditunggu ya',
      timestamp: '2024-10-27T09:15:00',
      type: 'text',
      isRead: true,
    },
  ],
  'chat-4': [
    {
      id: 'msg-1',
      senderId: 'buyer-4',
      senderName: 'Linda Wijaya',
      message: 'Kak untuk pengiriman ke Surabaya bisa ya?',
      timestamp: '2024-10-28T11:00:00',
      type: 'text',
      isRead: true,
    },
    {
      id: 'msg-2',
      senderId: 'seller-1',
      senderName: 'Green Paradise Jakarta',
      message: 'Bisa kak, kami kirim ke seluruh Indonesia. Untuk Succulent bisa tahan perjalanan jauh',
      timestamp: '2024-10-28T11:20:00',
      type: 'text',
      isRead: true,
    },
    {
      id: 'msg-3',
      senderId: 'buyer-4',
      senderName: 'Linda Wijaya',
      message: 'Halo kak, pembayaran sudah saya konfirmasi',
      timestamp: '2024-10-28T11:45:00',
      type: 'text',
      isRead: false,
    },
  ],
};
