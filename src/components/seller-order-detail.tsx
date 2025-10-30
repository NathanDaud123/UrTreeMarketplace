import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  User,
  Calendar,
  CreditCard,
  Truck,
  MessageCircle,
  CheckCircle,
  Clock,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { SellerTransaction } from './transaction-history-seller';

interface SellerOrderDetailProps {
  transaction: SellerTransaction;
  onBack: () => void;
  onOpenChat: (buyerName: string, orderId: string) => void;
}

export function SellerOrderDetail({ transaction, onBack, onOpenChat }: SellerOrderDetailProps) {
  const [status, setStatus] = useState(transaction.status);
  const [trackingNumber, setTrackingNumber] = useState(transaction.trackingNumber || '');
  const [notes, setNotes] = useState('');

  const getStatusBadge = (status: SellerTransaction['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-500 text-white">
            <Clock className="w-3 h-3 mr-1" />
            Menunggu Konfirmasi
          </Badge>
        );
      case 'processing':
        return (
          <Badge className="bg-blue-500 text-white">
            <Package className="w-3 h-3 mr-1" />
            Sedang Dikemas
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

  const handleUpdateStatus = () => {
    if (status === 'shipped' && !trackingNumber.trim()) {
      toast.error('Nomor resi wajib diisi untuk status Dikirim');
      return;
    }
    toast.success('✅ Status pesanan berhasil diperbarui!');
  };

  const handlePrintLabel = () => {
    toast.info('🖨️ Mencetak label pengiriman...');
  };

  const timeline = [
    {
      status: 'pending',
      label: 'Pesanan Masuk',
      date: transaction.date,
      active: true,
    },
    {
      status: 'processing',
      label: 'Sedang Dikemas',
      date: status !== 'pending' ? transaction.date : null,
      active: status !== 'pending',
    },
    {
      status: 'shipped',
      label: 'Dikirim',
      date: status === 'shipped' || status === 'completed' ? transaction.date : null,
      active: status === 'shipped' || status === 'completed',
    },
    {
      status: 'completed',
      label: 'Selesai',
      date: status === 'completed' ? transaction.date : null,
      active: status === 'completed',
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
                    {getStatusBadge(status)}
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
                  <div className="text-sm text-gray-600 mb-1">Total Pesanan</div>
                  <div className="text-2xl text-green-600">
                    Rp {transaction.subtotal.toLocaleString('id-ID')}
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
                        <div className="flex items-center gap-4 mt-2 text-sm">
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
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Komisi Platform (10%)</span>
                    <span>- Rp {transaction.commission.toLocaleString('id-ID')}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Pendapatan Bersih</span>
                    <span className="text-xl text-green-600">
                      Rp {transaction.netIncome.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Info */}
          {transaction.trackingNumber && (
            <Card>
              <CardHeader>
                <CardTitle>🚚 Informasi Pengiriman</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <Package className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-sm text-gray-600">Nomor Resi</div>
                    <div className="font-mono">{transaction.trackingNumber}</div>
                  </div>
                </div>
                {transaction.estimatedDelivery && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Clock className="w-5 h-5 text-blue-600" />
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
          {/* Buyer Info */}
          <Card>
            <CardHeader>
              <CardTitle>👤 Informasi Pembeli</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-600">Nama</div>
                  <div>{transaction.buyerName}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-600">Telepon</div>
                  <div>{transaction.buyerPhone}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-600">Alamat Pengiriman</div>
                  <div className="text-sm">{transaction.shippingAddress}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-600">Metode Pembayaran</div>
                  <div>{transaction.paymentMethod}</div>
                </div>
              </div>

              <Separator />

              <Button
                onClick={() => onOpenChat(transaction.buyerName, transaction.orderNumber)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Hubungi Pembeli
              </Button>
            </CardContent>
          </Card>

          {/* Update Status */}
          {status !== 'completed' && status !== 'cancelled' && (
            <Card>
              <CardHeader>
                <CardTitle>⚙️ Update Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Status Pesanan</Label>
                  <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
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

                {status === 'shipped' && (
                  <div>
                    <Label htmlFor="tracking">Nomor Resi</Label>
                    <Input
                      id="tracking"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Masukkan nomor resi"
                      className="mt-2"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="notes">Catatan (Opsional)</Label>
                  <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tambahkan catatan untuk pembeli"
                    className="mt-2"
                  />
                </div>

                <Button
                  onClick={handleUpdateStatus}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Update Status
                </Button>

                {status === 'processing' && (
                  <Button onClick={handlePrintLabel} variant="outline" className="w-full">
                    🖨️ Cetak Label Pengiriman
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Revenue Card */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="w-6 h-6 text-green-600" />
                <h4 className="text-green-900">Pendapatan</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Subtotal</span>
                  <span className="text-green-900">
                    Rp {transaction.subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Komisi</span>
                  <span className="text-red-600">
                    - Rp {transaction.commission.toLocaleString('id-ID')}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-green-900">Bersih</span>
                  <span className="text-green-600">
                    Rp {transaction.netIncome.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
