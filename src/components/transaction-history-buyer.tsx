import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Package, MapPin, Star, RefreshCw, MessageCircle, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { toast } from 'sonner@2.0.3';
import { Textarea } from './ui/textarea';

export interface Transaction {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  items: {
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
    sellerId: string;
    sellerName: string;
  }[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  paymentMethod: string;
}

interface TransactionHistoryBuyerProps {
  transactions: Transaction[];
  onViewDetail?: (transaction: Transaction) => void;
  onOpenChat?: (sellerName: string, orderId: string) => void;
}

export function TransactionHistoryBuyer({ transactions, onViewDetail, onOpenChat }: TransactionHistoryBuyerProps) {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [reviewDialog, setReviewDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">⏳ Menunggu Pembayaran</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500">📦 Diproses</Badge>;
      case 'shipped':
        return <Badge className="bg-purple-500">🚚 Dikirim</Badge>;
      case 'completed':
        return <Badge className="bg-green-600">✅ Selesai</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">❌ Dibatalkan</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filterTransactions = (status: string) => {
    if (status === 'all') return transactions;
    return transactions.filter(t => t.status === status);
  };

  const handleReview = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setReviewDialog(true);
  };

  const submitReview = () => {
    toast.success('✅ Ulasan berhasil dikirim! Terima kasih atas feedback Anda.');
    setReviewDialog(false);
    setReviewText('');
    setRating(5);
  };

  const handleTrackOrder = (trackingNumber?: string) => {
    if (trackingNumber) {
      toast.info(`🔍 Nomor Resi: ${trackingNumber}`);
    } else {
      toast.info('ℹ️ Nomor resi belum tersedia');
    }
  };

  const handleBuyAgain = (transaction: Transaction) => {
    toast.success('🛒 Produk ditambahkan ke keranjang!');
  };

  const filteredTransactions = filterTransactions(activeTab);

  const stats = {
    total: transactions.length,
    pending: transactions.filter(t => t.status === 'pending').length,
    processing: transactions.filter(t => t.status === 'processing').length,
    shipped: transactions.filter(t => t.status === 'shipped').length,
    completed: transactions.filter(t => t.status === 'completed').length,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h2>Riwayat Pembelian</h2>
        <p className="text-gray-600">Lihat semua pesanan dan transaksi Anda</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-1">{stats.total}</div>
            <div className="text-xs text-gray-600">Total Pesanan</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-1 text-yellow-600">{stats.pending}</div>
            <div className="text-xs text-gray-600">Belum Bayar</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-1 text-blue-600">{stats.processing}</div>
            <div className="text-xs text-gray-600">Diproses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-1 text-purple-600">{stats.shipped}</div>
            <div className="text-xs text-gray-600">Dikirim</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-1 text-green-600">{stats.completed}</div>
            <div className="text-xs text-gray-600">Selesai</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">Semua ({stats.total})</TabsTrigger>
          <TabsTrigger value="pending">Belum Bayar ({stats.pending})</TabsTrigger>
          <TabsTrigger value="processing">Diproses ({stats.processing})</TabsTrigger>
          <TabsTrigger value="shipped">Dikirim ({stats.shipped})</TabsTrigger>
          <TabsTrigger value="completed">Selesai ({stats.completed})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Belum ada transaksi di kategori ini</p>
              </CardContent>
            </Card>
          ) : (
            filteredTransactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardHeader className="border-b">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h4>{transaction.orderNumber}</h4>
                        {getStatusBadge(transaction.status)}
                      </div>
                      <p className="text-sm text-gray-600">
                        📅 {new Date(transaction.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <div className="text-sm text-gray-600">Total Belanja</div>
                      <div className="text-xl text-green-600">
                        Rp {transaction.total.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Items */}
                  <div className="space-y-4 mb-4">
                    {transaction.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="truncate">{item.productName}</h5>
                          <p className="text-sm text-gray-600">{item.sellerName}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-600">{item.quantity}x</span>
                            <span className="text-sm">Rp {item.price.toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div>
                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Info */}
                  {transaction.status !== 'pending' && transaction.status !== 'cancelled' && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-sm mb-1">
                            <strong>Alamat Pengiriman:</strong>
                          </div>
                          <p className="text-sm text-gray-700">{transaction.shippingAddress}</p>
                          {transaction.trackingNumber && (
                            <p className="text-sm text-blue-600 mt-2">
                              📦 Resi: <strong>{transaction.trackingNumber}</strong>
                            </p>
                          )}
                          {transaction.estimatedDelivery && (
                            <p className="text-sm text-gray-600 mt-1">
                              ⏰ Estimasi tiba: {transaction.estimatedDelivery}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-wrap pt-4 border-t">
                    {transaction.status === 'shipped' && (
                      <Button
                        onClick={() => handleTrackOrder(transaction.trackingNumber)}
                        variant="outline"
                        size="sm"
                        className="flex-1 min-w-[140px]"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Lacak Pesanan
                      </Button>
                    )}
                    {transaction.status === 'completed' && (
                      <>
                        <Button
                          onClick={() => handleReview(transaction)}
                          variant="outline"
                          size="sm"
                          className="flex-1 min-w-[140px] border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Beri Ulasan
                        </Button>
                        <Button
                          onClick={() => handleBuyAgain(transaction)}
                          variant="outline"
                          size="sm"
                          className="flex-1 min-w-[140px] border-green-600 text-green-600 hover:bg-green-50"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Beli Lagi
                        </Button>
                      </>
                    )}
                    {transaction.status === 'pending' && (
                      <Button
                        className="flex-1 min-w-[140px] bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        💳 Bayar Sekarang
                      </Button>
                    )}
                    <Button
                      onClick={() => onViewDetail?.(transaction)}
                      variant="outline"
                      size="sm"
                      className="flex-1 min-w-[140px]"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Lihat Detail
                    </Button>
                    {(transaction.status === 'processing' || transaction.status === 'shipped') && (
                      <Button
                        onClick={() => {
                          const sellerName = transaction.items[0]?.sellerName || 'Penjual';
                          onOpenChat?.(sellerName, transaction.orderNumber);
                        }}
                        variant="outline"
                        size="sm"
                        className="flex-1 min-w-[140px]"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Hubungi Penjual
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>⭐ Beri Ulasan Produk</DialogTitle>
            <DialogDescription>
              Bagikan pengalaman Anda dengan produk ini
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4 py-4">
              {/* Product Info */}
              <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 rounded overflow-hidden bg-white">
                  <img
                    src={selectedTransaction.items[0].productImage}
                    alt={selectedTransaction.items[0].productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm truncate">{selectedTransaction.items[0].productName}</h5>
                  <p className="text-xs text-gray-600">{selectedTransaction.items[0].sellerName}</p>
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
                  onClick={submitReview}
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
