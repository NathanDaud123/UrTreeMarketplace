import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { ArrowLeft, ShoppingCart, Store, MapPin, Truck } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import type { Product } from '../App';
import { toast } from 'sonner@2.0.3';

interface ProductDetailPageProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  onBackToList: () => void;
  isUserLoggedIn?: boolean;
  onLoginRequired?: () => void;
}

export function ProductDetailPage({
  product,
  onAddToCart,
  onBuyNow,
  onBackToList,
  isUserLoggedIn = true,
  onLoginRequired,
}: ProductDetailPageProps) {
  const [quantity, setQuantity] = useState(1);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleAddToCart = () => {
    if (!isUserLoggedIn) {
      setShowLoginDialog(true);
      return;
    }
    onAddToCart(product, quantity);
    toast.success(`${product.name} ditambahkan ke keranjang (${quantity} item)`);
  };

  const handleBuyNow = () => {
    if (!isUserLoggedIn) {
      setShowLoginDialog(true);
      return;
    }
    onBuyNow(product, quantity);
  };

  const handleLoginConfirm = () => {
    setShowLoginDialog(false);
    if (onLoginRequired) {
      onLoginRequired();
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={onBackToList}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Daftar Produk
        </Button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-4">
            <Badge className="mb-2">
              {product.category === 'tanaman-hidup' && 'Tanaman Hidup'}
              {product.category === 'benih' && 'Benih'}
              {product.category === 'peralatan' && 'Peralatan & Media Tanam'}
            </Badge>
            {product.plantAge && (
              <Badge variant="outline" className="ml-2">
                Usia: {product.plantAge}
              </Badge>
            )}
          </div>

          <h1 className="mb-4">{product.name}</h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              <span className="text-yellow-500 text-xl">★</span>
              <span>{product.rating}</span>
              <span className="text-gray-500">({product.reviews} ulasan)</span>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <span className="text-gray-600">{product.sold} terjual</span>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="text-3xl text-green-600 mb-2">
              Rp {product.price.toLocaleString('id-ID')}
            </div>
            <div className="text-sm text-gray-600">Stok: {product.stock} tersedia</div>
          </div>

          {/* Seller Info */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Store className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <div>{product.sellerName}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {product.sellerLocation}
                    <span className="mx-1">•</span>
                    <span className="text-yellow-500">★</span> {product.sellerRating}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Info for Tanaman Hidup */}
          {product.category === 'tanaman-hidup' && product.maxDeliveryRadius && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="text-blue-900">Informasi Pengiriman Tanaman Hidup</div>
                    <div className="text-sm text-blue-700 mt-1">
                      Pengiriman maksimal {product.maxDeliveryRadius} km dari lokasi penjual.
                      Validasi jarak akan dilakukan saat checkout.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quantity & Add to Cart */}
          <div className="flex gap-4 mb-6">
            <div className="flex items-center border rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <span className="px-4">{quantity}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              >
                +
              </Button>
            </div>
            <Button
              onClick={handleAddToCart}
              variant="outline"
              className="flex-1"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Tambah ke Keranjang
            </Button>
            <Button
              onClick={handleBuyNow}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Beli Sekarang
            </Button>
          </div>

          {/* Product Description */}
          <div>
            <h3 className="mb-3">Deskripsi Produk</h3>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>

            {product.category === 'tanaman-hidup' && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <h4 className="text-green-900 mb-2">Tips Perawatan</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Letakkan di tempat dengan cahaya tidak langsung</li>
                  <li>• Siram 2-3 kali seminggu atau sesuai kebutuhan</li>
                  <li>• Beri pupuk sebulan sekali</li>
                  <li>• Semprot daun untuk menjaga kelembaban</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Login Required Dialog */}
      <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Login Diperlukan</AlertDialogTitle>
            <AlertDialogDescription>
              Silakan login atau register terlebih dahulu untuk melanjutkan pembelian.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLoginConfirm}
              className="bg-green-600 hover:bg-green-700"
            >
              Oke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
