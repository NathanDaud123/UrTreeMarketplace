import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Users, ShoppingBag, TrendingUp, Store, CheckCircle2, XCircle, Eye, FileText } from 'lucide-react';
import { adminAPI } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';

interface SellerApplication {
  id: string;
  user_id: string;
  shop_name: string;
  shop_description: string;
  shop_address: string;
  shop_city: string;
  shop_phone: string;
  identity_type: string;
  identity_number: string;
  identity_photo_url: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  kyc_status: string;
  created_at: string;
  users: {
    id: string;
    email: string;
    name: string;
    phone: string;
    created_at: string;
  };
}

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersThisMonth: 0,
    totalSellers: 0,
    newSellersThisMonth: 0,
    pendingApplications: 0,
    totalProducts: 0,
    activeProducts: 0,
    totalTransactions: 0,
    totalRevenue: 0,
  });
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<SellerApplication | null>(null);
  const [showApplicationDetail, setShowApplicationDetail] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load stats
      const statsResponse = await adminAPI.getStats();
      if (statsResponse.stats) {
        setStats(statsResponse.stats);
      }

      // Load seller applications
      const appsResponse = await adminAPI.getSellerApplications();
      if (appsResponse.applications) {
        setApplications(appsResponse.applications);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId: string) => {
    if (!confirm('Apakah Anda yakin ingin menyetujui pengajuan ini?')) return;
    
    setProcessing(applicationId);
    try {
      await adminAPI.approveSellerApplication(applicationId);
      toast.success('Pengajuan berhasil disetujui!');
      setShowApplicationDetail(false);
      setSelectedApplication(null);
      loadData(); // Reload data
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Gagal menyetujui pengajuan');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (applicationId: string) => {
    if (!confirm('Apakah Anda yakin ingin menolak pengajuan ini?')) return;
    
    setProcessing(applicationId);
    try {
      await adminAPI.rejectSellerApplication(applicationId);
      toast.success('Pengajuan berhasil ditolak');
      setShowApplicationDetail(false);
      setSelectedApplication(null);
      loadData(); // Reload data
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Gagal menolak pengajuan');
    } finally {
      setProcessing(null);
    }
  };

  const viewApplication = (application: SellerApplication) => {
    setSelectedApplication(application);
    setShowApplicationDetail(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-screen-xl px-6 lg:px-12 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-screen-xl px-6 lg:px-12 py-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard Admin</h2>
        <p className="text-gray-600">Monitor dan kelola platform UrTree Marketplace</p>
      </div>

      {/* Overview Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <div className="text-sm text-gray-600">Total Pengguna</div>
                <div className="text-xs text-green-600 mt-1">
                  +{stats.newUsersThisMonth} bulan ini
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalSellers}</div>
                <div className="text-sm text-gray-600">Total Penjual</div>
                <div className="text-xs text-green-600 mt-1">
                  +{stats.newSellersThisMonth} bulan ini
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.pendingApplications}</div>
                <div className="text-sm text-gray-600">Pengajuan Pending</div>
                <div className="text-xs text-yellow-600 mt-1">
                  Menunggu verifikasi
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <div className="text-sm text-gray-600">Total Produk</div>
                <div className="text-xs text-gray-600 mt-1">
                  {stats.activeProducts} aktif
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="applications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="applications">
            Pengajuan Penjual ({stats.pendingApplications})
          </TabsTrigger>
          <TabsTrigger value="users">Pengguna</TabsTrigger>
          <TabsTrigger value="products">Produk</TabsTrigger>
        </TabsList>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Pengajuan Menjadi Penjual</CardTitle>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Tidak ada pengajuan yang menunggu verifikasi
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Toko</TableHead>
                      <TableHead>Pemilik</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Kota</TableHead>
                      <TableHead>Tanggal Pengajuan</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.shop_name}</TableCell>
                        <TableCell>{app.users.name}</TableCell>
                        <TableCell>{app.users.email}</TableCell>
                        <TableCell>{app.shop_city}</TableCell>
                        <TableCell>
                          {new Date(app.created_at).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewApplication(app)}
                            className="mr-2"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Lihat Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Statistik Pengguna</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Total Pengguna</span>
                  <span className="text-2xl font-bold">{stats.totalUsers}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Total Pembeli</span>
                  <span className="text-2xl font-bold">{stats.totalUsers - stats.totalSellers}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Total Penjual</span>
                  <span className="text-2xl font-bold">{stats.totalSellers}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Pengguna Baru Bulan Ini</span>
                  <span className="text-2xl font-bold text-green-600">+{stats.newUsersThisMonth}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Statistik Produk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Total Produk</span>
                  <span className="text-2xl font-bold">{stats.totalProducts}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Produk Aktif</span>
                  <span className="text-2xl font-bold">{stats.activeProducts}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Application Detail Dialog */}
      <Dialog open={showApplicationDetail} onOpenChange={setShowApplicationDetail}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Pengajuan Penjual</DialogTitle>
            <DialogDescription>
              Review dokumen dan informasi pengajuan
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              {/* Shop Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Informasi Toko</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Nama Toko:</strong> {selectedApplication.shop_name}</div>
                  <div><strong>Deskripsi:</strong> {selectedApplication.shop_description}</div>
                  <div><strong>Alamat:</strong> {selectedApplication.shop_address}</div>
                  <div><strong>Kota:</strong> {selectedApplication.shop_city}</div>
                  <div><strong>Telepon:</strong> {selectedApplication.shop_phone}</div>
                </div>
              </div>

              {/* Owner Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Informasi Pemilik</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Nama:</strong> {selectedApplication.users.name}</div>
                  <div><strong>Email:</strong> {selectedApplication.users.email}</div>
                  <div><strong>Telepon:</strong> {selectedApplication.users.phone || '-'}</div>
                </div>
              </div>

              {/* KYC Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Data KYC</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Tipe Identitas:</strong> {selectedApplication.identity_type}</div>
                  <div><strong>Nomor Identitas:</strong> {selectedApplication.identity_number}</div>
                  <div><strong>Nama Bank:</strong> {selectedApplication.bank_name}</div>
                  <div><strong>Nomor Rekening:</strong> {selectedApplication.bank_account_number}</div>
                  <div><strong>Nama Pemilik Rekening:</strong> {selectedApplication.bank_account_name}</div>
                </div>
              </div>

              {/* KTP Photo */}
              {selectedApplication.identity_photo_url && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Foto KTP</h3>
                  <div className="border rounded-lg p-4">
                    <img
                      src={selectedApplication.identity_photo_url}
                      alt="Foto KTP"
                      className="max-w-full h-auto rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x250?text=Foto+KTP+Tidak+Tersedia';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowApplicationDetail(false)}
            >
              Tutup
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedApplication && handleReject(selectedApplication.id)}
              disabled={processing === selectedApplication?.id}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Tolak
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => selectedApplication && handleApprove(selectedApplication.id)}
              disabled={processing === selectedApplication?.id}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {processing === selectedApplication?.id ? 'Memproses...' : 'Setujui'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
