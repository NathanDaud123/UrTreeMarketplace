import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { AlertCircle, CheckCircle2, Wallet, CreditCard, Banknote, Building2 } from 'lucide-react';
import type { CartItem } from '../App';
import { toast } from 'sonner@2.0.3';
import { PinVerificationDialog } from './pin-verification-dialog';
import { useDatabaseContext } from '../utils/database-provider';

// Declare Midtrans Snap type
declare global {
  interface Window {
    snap?: {
      pay: (snapToken: string, options?: {
        onSuccess?: (result: any) => void;
        onPending?: (result: any) => void;
        onError?: (result: any) => void;
        onClose?: () => void;
      }) => void;
    };
  }
}

interface CheckoutPageProps {
  cartItems: CartItem[];
  onOrderComplete: () => void;
  onBackToCart: () => void;
}

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance);
}

// Mock city coordinates
const CITY_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
  'Jakarta Selatan': { lat: -6.2608, lng: 106.7818 },
  'Jakarta Utara': { lat: -6.1385, lng: 106.8634 },
  'Jakarta Barat': { lat: -6.1683, lng: 106.7595 },
  'Surabaya': { lat: -7.2575, lng: 112.7521 },
  'Bandung': { lat: -6.9175, lng: 107.6191 },
  'Yogyakarta': { lat: -7.7956, lng: 110.3695 },
  'Tangerang': { lat: -6.1781, lng: 106.6319 },
  'Bogor': { lat: -6.5950, lng: 106.8166 },
  'Malang': { lat: -7.9666, lng: 112.6326 },
};

export function CheckoutPage({
  cartItems,
  onOrderComplete,
  onBackToCart,
}: CheckoutPageProps) {
  const { currentUser, createOrder, verifyPin } = useDatabaseContext();
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [city, setCity] = useState(currentUser?.city || '');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationComplete, setValidationComplete] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Load Midtrans Snap script
  useEffect(() => {
    // Note: In production, this client key should be fetched from backend or set in environment
    // For now, using sandbox client key - user should configure via Supabase secrets
    const midtransClientKey = 'SB-Mid-client-samplekey123456'; // This will be replaced by actual client key from Supabase env
    const snapUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';
    
    // Check if script already loaded
    const existingScript = document.querySelector(`script[src="${snapUrl}"]`);
    if (existingScript) {
      return;
    }
    
    const script = document.createElement('script');
    script.src = snapUrl;
    script.setAttribute('data-client-key', midtransClientKey);
    script.async = true;
    
    script.onload = () => {
      console.log('Midtrans Snap script loaded successfully');
    };
    
    script.onerror = () => {
      console.error('Failed to load Midtrans Snap script');
      toast.error('Gagal memuat sistem pembayaran. Silakan refresh halaman.');
    };
    
    document.body.appendChild(script);
    
    return () => {
      // Don't remove script on unmount to prevent reload issues
    };
  }, []);

  // Auto-fill form when currentUser data is available
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setAddress(currentUser.address || '');
      setCity(currentUser.city || '');
    }
  }, [currentUser]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shippingCost = 15000;
  const total = subtotal + shippingCost;

  const handleValidateAddress = () => {
    // Reset validation
    setValidationErrors([]);
    setValidationComplete(false);

    // Check if all fields are filled
    if (!name || !phone || !address || !city) {
      toast.error('Mohon lengkapi semua data pengiriman');
      return;
    }

    const buyerCoords = CITY_COORDINATES[city];
    if (!buyerCoords) {
      toast.error('Kota tidak valid');
      return;
    }

    const errors: string[] = [];

    // Validate each cart item
    cartItems.forEach((item) => {
      const product = item.product;

      // Only validate tanaman hidup with radius restriction
      if (
        product.category === 'tanaman-hidup' &&
        product.maxDeliveryRadius &&
        product.sellerLat &&
        product.sellerLng
      ) {
        const distance = calculateDistance(
          product.sellerLat,
          product.sellerLng,
          buyerCoords.lat,
          buyerCoords.lng
        );

        if (distance > product.maxDeliveryRadius) {
          errors.push(
            `"${product.name}" dari ${product.sellerName} tidak dapat dikirim ke alamat Anda (jarak ${distance} km > maksimal ${product.maxDeliveryRadius} km)`
          );
        }
      }
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      toast.error('Beberapa produk tidak dapat dikirim ke alamat Anda');
    } else {
      setValidationComplete(true);
      toast.success('Validasi alamat berhasil! Silakan lanjutkan pembayaran.');
    }
  };

  const handlePlaceOrder = () => {
    if (!validationComplete) {
      toast.error('Harap validasi alamat pengiriman terlebih dahulu');
      return;
    }

    if (!paymentMethod) {
      toast.error('Harap pilih metode pembayaran');
      return;
    }

    // Check if user has PIN, if yes show verification dialog
    if (currentUser?.hasPin) {
      setShowPinDialog(true);
    } else {
      // If no PIN, show error and redirect to settings
      toast.error('Harap buat PIN keamanan terlebih dahulu di halaman Pengaturan');
    }
  };

  const handlePinVerified = async (pin: string) => {
    try {
      const isValid = await verifyPin(currentUser?.email || '', pin);
      
      if (isValid) {
        // Process order
        await processOrder();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('PIN verification error:', error);
      return false;
    }
  };

  const processOrder = async () => {
    setIsProcessingPayment(true);
    
    try {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          sellerId: item.product.sellerId,
          sellerName: item.product.sellerName,
        })),
        shippingAddress: {
          name,
          phone,
          address,
          city,
        },
        paymentMethod,
        subtotal,
        shippingCost,
        total,
      };

      const response = await createOrder(orderData);
      
      // If COD or no snap token, order is complete
      if (paymentMethod === 'cod' || !response?.snapToken) {
        toast.success('🎉 Pesanan berhasil dibuat! Terima kasih atas pembelian Anda.');
        
        setTimeout(() => {
          setIsProcessingPayment(false);
          onOrderComplete();
        }, 1500);
        return;
      }
      
      // Open Midtrans Snap payment popup for online payments
      const snapToken = response.snapToken;
      
      if (window.snap) {
        window.snap.pay(snapToken, {
          onSuccess: (result) => {
            console.log('Payment success:', result);
            toast.success('🎉 Pembayaran berhasil! Pesanan Anda sedang diproses.');
            setIsProcessingPayment(false);
            setTimeout(() => {
              onOrderComplete();
            }, 1500);
          },
          onPending: (result) => {
            console.log('Payment pending:', result);
            toast.info('⏳ Pembayaran pending. Silakan selesaikan pembayaran Anda.');
            setIsProcessingPayment(false);
            setTimeout(() => {
              onOrderComplete();
            }, 1500);
          },
          onError: (result) => {
            console.error('Payment error:', result);
            toast.error('❌ Pembayaran gagal. Silakan coba lagi.');
            setIsProcessingPayment(false);
          },
          onClose: () => {
            console.log('Payment popup closed');
            toast.info('Popup pembayaran ditutup. Pesanan Anda telah dibuat dan menunggu pembayaran.');
            setIsProcessingPayment(false);
            setTimeout(() => {
              onOrderComplete();
            }, 1000);
          },
        });
      } else {
        console.error('Midtrans Snap not loaded');
        toast.error('Sistem pembayaran belum siap. Silakan refresh halaman dan coba lagi.');
        setIsProcessingPayment(false);
      }
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error('Gagal membuat pesanan. Silakan coba lagi.');
      setIsProcessingPayment(false);
    }
  };

  return (
    <>
      <PinVerificationDialog
        open={showPinDialog}
        onClose={() => setShowPinDialog(false)}
        onVerify={handlePinVerified}
        title="Verifikasi PIN untuk Checkout"
        description="Masukkan PIN keamanan Anda untuk menyelesaikan pesanan"
      />
      
      <div className="container mx-auto px-4 py-8">
        <h2 className="mb-6">Checkout</h2>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Shipping Address Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="space-y-1">
                <CardTitle>Alamat Pengiriman</CardTitle>
                {currentUser && (currentUser.name || currentUser.phone || currentUser.address || currentUser.city) && (
                  <p className="text-sm text-muted-foreground">
                    ✓ Data otomatis diambil dari profil Anda
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentUser && (!currentUser.name || !currentUser.phone || !currentUser.address || !currentUser.city) && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Data profil Anda belum lengkap. Silakan lengkapi di halaman{' '}
                    <strong>Profil</strong> untuk checkout lebih cepat di masa mendatang.
                  </AlertDescription>
                </Alert>
              )}
              <div>
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div>
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              <div>
                <Label htmlFor="city">Kota/Kabupaten</Label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kota" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(CITY_COORDINATES).map((cityName) => (
                      <SelectItem key={cityName} value={cityName}>
                        {cityName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="address">Alamat Lengkap</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jalan, nomor rumah, RT/RW"
                />
              </div>
              <Button onClick={handleValidateAddress} className="w-full" variant="outline">
                Validasi Alamat Pengiriman
              </Button>
            </CardContent>
          </Card>

          {/* Validation Results */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="mb-2">
                  Satu atau lebih produk <strong>Tanaman Hidup</strong> tidak dapat dikirim ke
                  alamat Anda:
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm">
                      {error}
                    </li>
                  ))}
                </ul>
                <div className="mt-3">
                  <Button variant="outline" size="sm" onClick={onBackToCart}>
                    Kembali ke Keranjang
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {validationComplete && validationErrors.length === 0 && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✓ Semua produk dapat dikirim ke alamat Anda. Silakan lanjutkan ke pembayaran.
              </AlertDescription>
            </Alert>
          )}

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Metode Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-3">
                  {/* COD */}
                  <div className="flex items-center space-x-3 border rounded-lg p-4 hover:border-green-500 transition-colors">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Cash on Delivery (COD)</div>
                        <div className="text-sm text-gray-600">Bayar tunai saat barang tiba</div>
                      </div>
                    </Label>
                  </div>

                  {/* Bank Transfer */}
                  <div className="flex items-center space-x-3 border rounded-lg p-4 hover:border-green-500 transition-colors">
                    <RadioGroupItem value="bank-transfer" id="bank-transfer" />
                    <Label htmlFor="bank-transfer" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Transfer Bank</div>
                        <div className="text-sm text-gray-600">BCA, Mandiri, BNI, BRI</div>
                      </div>
                    </Label>
                  </div>

                  {/* E-Wallet */}
                  <div className="flex items-center space-x-3 border rounded-lg p-4 hover:border-green-500 transition-colors">
                    <RadioGroupItem value="e-wallet" id="e-wallet" />
                    <Label htmlFor="e-wallet" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">E-Wallet</div>
                        <div className="text-sm text-gray-600">GoPay, OVO, DANA, ShopeePay</div>
                      </div>
                    </Label>
                  </div>

                  {/* Credit Card */}
                  <div className="flex items-center space-x-3 border rounded-lg p-4 hover:border-green-500 transition-colors">
                    <RadioGroupItem value="credit-card" id="credit-card" />
                    <Label htmlFor="credit-card" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <Banknote className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Kartu Kredit/Debit</div>
                        <div className="text-sm text-gray-600">Visa, Mastercard, JCB</div>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Product List */}
          <Card>
            <CardHeader>
              <CardTitle>Produk yang Dibeli ({cartItems.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm">{item.product.name}</h4>
                    <p className="text-xs text-gray-600">{item.product.sellerName}</p>
                    {item.product.category === 'tanaman-hidup' &&
                      item.product.maxDeliveryRadius && (
                        <p className="text-xs text-blue-600 mt-1">
                          📍 Max radius: {item.product.maxDeliveryRadius} km
                        </p>
                      )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      {item.quantity} x Rp {item.product.price.toLocaleString('id-ID')}
                    </div>
                    <div className="text-green-600">
                      Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ongkos Kirim</span>
                <span>Rp {shippingCost.toLocaleString('id-ID')}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span>Total</span>
                <span className="text-green-600">Rp {total.toLocaleString('id-ID')}</span>
              </div>
              <Button
                onClick={handlePlaceOrder}
                disabled={!validationComplete || validationErrors.length > 0 || !paymentMethod || isProcessingPayment}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isProcessingPayment ? 'Memproses...' : 'Bayar Sekarang'}
              </Button>
              
              {!currentUser?.hasPin && (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertDescription className="text-yellow-800 text-sm">
                    ⚠️ Anda belum membuat PIN keamanan. Silakan buat PIN di halaman Pengaturan terlebih dahulu.
                  </AlertDescription>
                </Alert>
              )}
              <Button onClick={onBackToCart} variant="outline" className="w-full">
                Kembali ke Keranjang
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
}
