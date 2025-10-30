import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';
import {
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
  MessageCircle,
  CheckCircle,
  Clock,
  Star,
  RefreshCw,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { toast } from 'sonner@2.0.3';
import type { Transaction } from './transaction-history-buyer';

interface BuyerOrderDetailProps {
  transaction: Transaction;
  onBack: () => void;
  onOpenChat: (sellerName: string, orderId: string) => void;
}

export function BuyerOrderDetail({ transaction, onBack, onOpenChat }: BuyerOrderDetailProps) {
  const [reviewDialog, setReviewDialog] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-500 text-white">
            <Clock className="w-3 h-3 mr-1" />
            Menunggu Pembayaran
          </Badge>
        );
      case 'processing':
        return (
          <Badge className="bg-blue-500 text-white">
            <Package className="w-3 h-3 mr-1" />
            Diproses
          </Badge>
        );
      case 'shipped':
        return (
          <Badge className="bg-purple-500 text-white">
            <Truck className="w-3 h-3 mr-1" />
            Dalam Pengiriman
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-green-600 text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            Selesai
          </Badge>
        );
      case 'cancelled':
        return <Badge className="bg-red-500 text-white">❌ Dibatalkan</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleSubmitReview = () => {
    toast.success('✅ Ulasan berhasil dikirim! Terima kasih atas feedback Anda.');
    setReviewDialog(false);
    setReviewText('');
    setRating(5);
  };

  const handleTrackOrder = () => {
    if (transaction.trackingNumber) {
      toast.info(`🔍 Nomor Resi: ${transaction.trackingNumber}`);
    } else {
      toast.info('ℹ️ Nomor resi belum tersedia');
    }
  };

  const handleBuyAgain = () => {
    toast.success('🛒 Produk ditambahkan ke keranjang!');
  };

  const timeline = [
    {
      status: 'pending',
      label: 'Pesanan Dibuat',
      date: transaction.date,
      active: true,
    },
    {
      status: 'processing',
      label: 'Diproses Penjual',
      date: transaction.status !== 'pending' ? transaction.date : null,
      active: transaction.status !== 'pending',
    },
    {
      status: 'shipped',
      label: 'Dalam Pengiriman',
      date: transaction.status === 'shipped' || transaction.status === 'completed' ? transaction.date : null,
      active: transaction.status === 'shipped' || transaction.status === 'completed',
    },
    {
      status: 'completed',
      label: 'Pesanan Selesai',
      date: transaction.status === 'completed' ? transaction.date : null,
      active: transaction.status === 'completed',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button onClick={onBack} variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Header */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3>{transaction.orderNumber}</h3>
                    {getStatusBadge(transaction.status)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {new Date(transaction.date).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <div className="text-sm text-gray-600 mb-1">Total Belanja</div>
                  <div className="text-2xl text-green-600">
                    Rp {transaction.total.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Status Pesanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {timeline.map((item, index) => (
                  <div key={item.status} className="flex gap-4 pb-8 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          item.active
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {item.active ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Clock className="w-5 h-5" />
                        )}
                      </div>
                      {index < timeline.length - 1 && (
                        <div
                          className={`w-0.5 h-full ${
                            item.active ? 'bg-green-600' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className={item.active ? 'text-green-600' : 'text-gray-400'}>
                        {item.label}
                      </div>
                      {item.date && (
                        <div className="text-sm text-gray-500 mt-1">
                          {new Date(item.date).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle>📦 Produk yang Dibeli</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transaction.items.map((item, idx) => (
                  <div key={idx}>
                    {idx > 0 && <Separator className="mb-4" />}
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h5>{item.productName}</h5>
                        <p className="text-sm text-gray-600 mb-2">{item.sellerName}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-600">Jumlah: {item.quantity}x</span>
                          <span className="text-gray-600">
                            @ Rp {item.price.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</div>
                      </div>
                    </div>
                  </div>
                ))}

                <Separator className="my-4" />

                {/* Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal Produk</span>
                    <span>Rp {transaction.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Biaya Pengiriman</span>
                    <span>Rp {transaction.shippingCost.toLocaleString('id-ID')}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Total Belanja</span>
                    <span className="text-xl text-green-600">
                      Rp {transaction.total.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Info */}
          {transaction.status !== 'pending' && transaction.status !== 'cancelled' && (
            <Card>
              <CardHeader>
                <CardTitle>🚚 Informasi Pengiriman</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm mb-1">
                      <strong>Alamat Pengiriman:</strong>
                    </div>
                    <p className="text-sm text-gray-700">{transaction.shippingAddress}</p>
                  </div>
                </div>
                {transaction.trackingNumber && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <Package className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="text-sm text-gray-600">Nomor Resi</div>
                      <div className="font-mono">{transaction.trackingNumber}</div>
                    </div>
                  </div>
                )}
                {transaction.estimatedDelivery && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <Clock className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="text-sm text-gray-600">Estimasi Tiba</div>
                      <div>{transaction.estimatedDelivery}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle>💳 Informasi Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-600">Metode Pembayaran</div>
                  <div>{transaction.paymentMethod}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>⚡ Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {transaction.status === 'shipped' && (
                <Button onClick={handleTrackOrder} className="w-full bg-purple-600 hover:bg-purple-700">
                  <Package className="w-4 h-4 mr-2" />
                  Lacak Pesanan
                </Button>
              )}
              
              {transaction.status === 'completed' && (
                <>
                  <Button
                    onClick={() => setReviewDialog(true)}
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Beri Ulasan
                  </Button>
                  <Button
                    onClick={handleBuyAgain}
                    variant="outline"
                    className="w-full border-green-600 text-green-600 hover:bg-green-50"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Beli Lagi
                  </Button>
                </>
              )}
              
              {transaction.status === 'pending' && (
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  💳 Bayar Sekarang
                </Button>
              )}
              
              {(transaction.status === 'processing' || transaction.status === 'shipped') && (
                <Button
                  onClick={() => {
                    const sellerName = transaction.items[0]?.sellerName || 'Penjual';
                    onOpenChat(sellerName, transaction.orderNumber);
                  }}
                  variant="outline"
                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Hubungi Penjual
                </Button>
              )}

              <Button variant="outline" className="w-full">
                Butuh Bantuan?
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>⭐ Beri Ulasan Produk</DialogTitle>
            <DialogDescription>
              Bagikan pengalaman Anda dengan produk ini
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Product Info */}
            <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 rounded overflow-hidden bg-white">
                <img
                  src={transaction.items[0].productImage}
                  alt={transaction.items[0].productName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-sm truncate">{transaction.items[0].productName}</h5>
                <p className="text-xs text-gray-600">{transaction.items[0].sellerName}</p>
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm mb-2">Rating Produk</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="text-2xl transition-transform hover:scale-110"
                  >
                    {star <= rating ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-sm mb-2">Ulasan Anda</label>
              <Textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Ceritakan pengalaman Anda dengan produk ini..."
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmitReview}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Kirim Ulasan
              </Button>
              <Button
                onClick={() => setReviewDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Batal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
