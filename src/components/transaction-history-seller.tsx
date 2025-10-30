import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Package, MapPin, Truck, DollarSign, TrendingUp, CheckCircle, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from 'sonner@2.0.3';
import { Input } from './ui/input';
import { Label } from './ui/label';

export interface SellerTransaction {
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
  }[];
  subtotal: number;
  commission: number; // Platform fee
  netIncome: number; // After commission
  buyerName: string;
  buyerPhone: string;
  shippingAddress: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  paymentMethod: string;
}

interface TransactionHistorySellerProps {
  transactions: SellerTransaction[];
  onViewDetail: (transaction: SellerTransaction) => void;
  onOpenChat: (buyerName: string, orderId: string) => void;
}

export function TransactionHistorySeller({ transactions, onViewDetail, onOpenChat }: TransactionHistorySellerProps) {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [updateDialog, setUpdateDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<SellerTransaction | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [trackingNumber, setTrackingNumber] = useState('');

  const getStatusBadge = (status: SellerTransaction['status']) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">⏳ Menunggu Konfirmasi</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500">📦 Sedang Dikemas</Badge>;
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

  const handleUpdateStatus = (transaction: SellerTransaction) => {
    setSelectedTransaction(transaction);
    setNewStatus(transaction.status);
    setTrackingNumber(transaction.trackingNumber || '');
    setUpdateDialog(true);
  };

  const submitStatusUpdate = () => {
    toast.success('✅ Status pesanan berhasil diperbarui!');
    setUpdateDialog(false);
    setTrackingNumber('');
  };

  const handleViewDetails = (transaction: SellerTransaction) => {
    onViewDetail(transaction);
  };

  const filteredTransactions = filterTransactions(activeTab);

  const stats = {
    total: transactions.length,
    pending: transactions.filter(t => t.status === 'pending').length,
    processing: transactions.filter(t => t.status === 'processing').length,
    shipped: transactions.filter(t => t.status === 'shipped').length,
    completed: transactions.filter(t => t.status === 'completed').length,
    totalRevenue: transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.netIncome, 0),
    pendingRevenue: transactions
      .filter(t => t.status === 'processing' || t.status === 'shipped')
      .reduce((sum, t) => sum + t.netIncome, 0),
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h2>Riwayat Penjualan</h2>
        <p className="text-gray-600">Kelola pesanan dan pantau penjualan toko Anda</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-2xl">{stats.total}</div>
                <div className="text-xs text-gray-600">Total Pesanan</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-2xl text-yellow-600">{stats.processing + stats.shipped}</div>
                <div className="text-xs text-gray-600">Perlu Diproses</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-2xl text-green-600">{stats.completed}</div>
                <div className="text-xs text-gray-600">Selesai</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg text-purple-600">
                  Rp {(stats.totalRevenue / 1000000).toFixed(1)}jt
                </div>
                <div className="text-xs text-gray-600">Total Pendapatan</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Card */}
      <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-green-900 mb-1">💰 Ringkasan Pendapatan</h3>
              <div className="grid md:grid-cols-2 gap-4 mt-3">
                <div>
                  <div className="text-sm text-green-700">Pendapatan Terkonfirmasi</div>
                  <div className="text-2xl text-green-600">
                    Rp {stats.totalRevenue.toLocaleString('id-ID')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-blue-700">Dalam Proses</div>
                  <div className="text-2xl text-blue-600">
                    Rp {stats.pendingRevenue.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            </div>
            <TrendingUp className="w-16 h-16 text-green-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">Semua ({stats.total})</TabsTrigger>
          <TabsTrigger value="pending">Baru ({stats.pending})</TabsTrigger>
          <TabsTrigger value="processing">Dikemas ({stats.processing})</TabsTrigger>
          <TabsTrigger value="shipped">Dikirim ({stats.shipped})</TabsTrigger>
          <TabsTrigger value="completed">Selesai ({stats.completed})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Belum ada pesanan di kategori ini</p>
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
                      <div className="text-sm text-gray-600">Pendapatan Bersih</div>
                      <div className="text-xl text-green-600">
                        Rp {transaction.netIncome.toLocaleString('id-ID')}
                      </div>
                      <div className="text-xs text-gray-500">
                        Subtotal: Rp {transaction.subtotal.toLocaleString('id-ID')} - Komisi: Rp{' '}
                        {transaction.commission.toLocaleString('id-ID')}
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
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-600">{item.quantity}x</span>
                            <span className="text-sm">
                              Rp {item.price.toLocaleString('id-ID')}
                            </span>
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

                  {/* Buyer Info */}
                  <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
                    <h5 className="text-sm mb-2">👤 Informasi Pembeli</h5>
                    <div className="space-y-1 text-sm">
                      <div>
                        <strong>Nama:</strong> {transaction.buyerName}
                      </div>
                      <div>
                        <strong>Telepon:</strong> {transaction.buyerPhone}
                      </div>
                      <div className="flex items-start gap-2 mt-2">
                        <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Alamat:</strong> {transaction.shippingAddress}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tracking Info */}
                  {transaction.trackingNumber && (
                    <div className="bg-purple-50 p-4 rounded-lg mb-4 border border-purple-200">
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="w-4 h-4 text-purple-600" />
                        <div>
                          <strong>Nomor Resi:</strong> {transaction.trackingNumber}
                        </div>
                      </div>
                      {transaction.estimatedDelivery && (
                        <p className="text-sm text-gray-600 mt-2">
                          ⏰ Estimasi tiba: {transaction.estimatedDelivery}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-wrap pt-4 border-t">
                    {(transaction.status === 'pending' ||
                      transaction.status === 'processing' ||
                      transaction.status === 'shipped') && (
                      <Button
                        onClick={() => handleUpdateStatus(transaction)}
                        className="flex-1 min-w-[140px] bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Update Status
                      </Button>
                    )}
                    <Button
                      onClick={() => handleViewDetails(transaction)}
                      variant="outline"
                      size="sm"
                      className="flex-1 min-w-[140px]"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Lihat Detail
                    </Button>
                    <Button
                      onClick={() => onOpenChat(transaction.buyerName, transaction.orderNumber)}
                      variant="outline"
                      size="sm"
                      className="flex-1 min-w-[140px] border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      💬 Hubungi Pembeli
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Update Status Dialog */}
      <Dialog open={updateDialog} onOpenChange={setUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>📦 Update Status Pesanan</DialogTitle>
            <DialogDescription>
              Perbarui status pesanan {selectedTransaction?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4 py-4">
              {/* Current Status */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Status Saat Ini</div>
                {getStatusBadge(selectedTransaction.status)}
              </div>

              {/* New Status */}
              <div>
                <Label>Status Baru</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Pilih status baru" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Menunggu Konfirmasi</SelectItem>
                    <SelectItem value="processing">Sedang Dikemas</SelectItem>
                    <SelectItem value="shipped">Dikirim</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tracking Number */}
              {newStatus === 'shipped' && (
                <div>
                  <Label htmlFor="tracking">Nomor Resi Pengiriman</Label>
                  <Input
                    id="tracking"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Contoh: JNE123456789"
                    className="mt-2"
                  />
                </div>
              )}

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  💡 Pembeli akan mendapatkan notifikasi email dan SMS saat status diperbarui.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={submitStatusUpdate}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  ✅ Konfirmasi Update
                </Button>
                <Button
                  onClick={() => setUpdateDialog(false)}
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
