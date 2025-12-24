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
import { Users, ShoppingBag, TrendingUp, Store, CheckCircle2, XCircle, Eye, FileText, Calendar, LogIn } from 'lucide-react';
import { adminAPI, productAPI } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { useDatabaseContext } from '../utils/database-provider';
import type { Product } from '../App';
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
  const { currentUser } = useDatabaseContext();
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
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<SellerApplication | null>(null);
  const [showApplicationDetail, setShowApplicationDetail] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userDetail, setUserDetail] = useState<any | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [loadingProductDetail, setLoadingProductDetail] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  // SECURITY: Check if user is admin before allowing access
  useEffect(() => {
    if (!currentUser) {
      // No user logged in, redirect will be handled by App.tsx
      return;
    }
    
    if (currentUser.role !== 'admin') {
      // User is not admin, clear session and show error
      console.error('⚠️ SECURITY: Non-admin user tried to access admin dashboard:', currentUser.email, currentUser.role);
      localStorage.removeItem('urtree_user_email');
      toast.error('Akses ditolak. Hanya admin yang dapat mengakses dashboard ini.');
      // Redirect will be handled by App.tsx
      return;
    }
    
    // User is admin, load data
    loadData();
  }, [currentUser]);

  // If user is not admin, don't render dashboard
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="container mx-auto max-w-screen-xl px-6 lg:px-12 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Akses Ditolak</h2>
          <p className="text-gray-600">Hanya admin yang dapat mengakses dashboard ini.</p>
          <p className="text-sm text-gray-500 mt-2">User saat ini: {currentUser?.email || 'Tidak ada'} ({currentUser?.role || 'guest'})</p>
        </div>
      </div>
    );
  }

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

      // Load all users
      const usersResponse = await adminAPI.getAllUsers();
      if (usersResponse.users) {
        setUsers(usersResponse.users);
      }

      // Load all products (including inactive for admin)
      try {
        // For admin, we want to see all products including inactive ones
        const productsResponse = await productAPI.getAll({ includeInactive: true });
        console.log('Admin Dashboard: Products response:', productsResponse);
        console.log('Admin Dashboard: Response type:', typeof productsResponse);
        console.log('Admin Dashboard: Has products property?', 'products' in (productsResponse || {}));
        console.log('Admin Dashboard: Products value:', productsResponse?.products);
        console.log('Admin Dashboard: Products is array?', Array.isArray(productsResponse?.products));
        
        if (productsResponse && productsResponse.products && Array.isArray(productsResponse.products)) {
          console.log('Admin Dashboard: Setting products:', productsResponse.products.length);
          setProducts(productsResponse.products);
        } else {
          console.warn('Admin Dashboard: No products in response:', productsResponse);
          console.warn('Admin Dashboard: Response structure:', JSON.stringify(productsResponse, null, 2));
          setProducts([]);
        }
      } catch (productError) {
        console.error('Admin Dashboard: Error loading products:', productError);
        console.error('Admin Dashboard: Error details:', {
          message: (productError as any)?.message,
          stack: (productError as any)?.stack,
          responseData: (productError as any)?.responseData
        });
        setProducts([]);
        toast.error('Gagal memuat daftar produk');
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleViewUserDetail = async (userEmail: string) => {
    setLoadingUserDetail(true);
    setShowUserDetail(true);
    try {
      const response = await adminAPI.getUserDetail(userEmail);
      if (response.user) {
        setSelectedUser(response.user);
        setUserDetail(response.stats);
      }
    } catch (error) {
      console.error('Error loading user detail:', error);
      toast.error('Gagal memuat detail pengguna');
    } finally {
      setLoadingUserDetail(false);
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
          <div className="space-y-6">
            {/* Stats Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Statistik Pengguna</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Total Pengguna</div>
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Total Pembeli</div>
                    <div className="text-2xl font-bold">{stats.totalUsers - stats.totalSellers}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Total Penjual</div>
                    <div className="text-2xl font-bold">{stats.totalSellers}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Baru Bulan Ini</div>
                    <div className="text-2xl font-bold text-green-600">+{stats.newUsersThisMonth}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Users List */}
            <Card>
              <CardHeader>
                <CardTitle>Daftar Pengguna</CardTitle>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    Tidak ada pengguna
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Tanggal Daftar</TableHead>
                        <TableHead>Login Terakhir</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id || user.email}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'default' : user.role === 'seller' ? 'default' : 'outline'}>
                              {user.role === 'admin' ? 'Admin' : user.role === 'seller' ? 'Penjual' : 'Pembeli'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID') : '-'}
                          </TableCell>
                          <TableCell>
                            {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString('id-ID') : 'Belum pernah'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewUserDetail(user.email)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Detail
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <div className="space-y-6">
            {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistik Produk</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
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

            {/* Products List */}
            <Card>
              <CardHeader>
                <CardTitle>Daftar Produk</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Memuat data...</div>
                ) : products.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Belum ada produk</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produk</TableHead>
                          <TableHead>Penjual</TableHead>
                          <TableHead>Kategori</TableHead>
                          <TableHead>Harga</TableHead>
                          <TableHead>Stok</TableHead>
                          <TableHead>Terjual</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <img
                                  src={product.images?.[0] || 'https://via.placeholder.com/50'}
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <div>
                                  <div className="font-medium">{product.name}</div>
                                  <div className="text-sm text-gray-500 line-clamp-1">
                                    {product.description?.substring(0, 50)}...
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{product.sellerName}</div>
                                <div className="text-sm text-gray-500">{product.sellerLocation}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {product.category === 'tanaman-hidup' ? 'Tanaman Hidup' :
                                 product.category === 'benih' ? 'Benih' :
                                 product.category === 'peralatan' ? 'Peralatan' : product.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                Rp {product.price.toLocaleString('id-ID')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                                {product.stock}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-gray-600">{product.sold || 0}</div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={product.stock > 0 ? 'default' : 'secondary'}
                                className={product.stock > 0 ? 'bg-green-500' : ''}
                              >
                                {product.stock > 0 ? 'Aktif' : 'Habis'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  setLoadingProductDetail(true);
                                  setShowProductDetail(true);
                                  try {
                                    // Fetch fresh product detail from API to get complete seller info
                                    const productDetail = await productAPI.getById(product.id);
                                    if (productDetail.product) {
                                      setSelectedProduct(productDetail.product);
                                    } else {
                                      // Fallback to product from list if API fails
                                      setSelectedProduct(product);
                                    }
                                  } catch (error) {
                                    console.error('Error fetching product detail:', error);
                                    // Fallback to product from list if API fails
                                    setSelectedProduct(product);
                                    toast.error('Gagal memuat detail produk');
                                  } finally {
                                    setLoadingProductDetail(false);
                                  }
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Detail
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Product Detail Dialog */}
      <Dialog open={showProductDetail} onOpenChange={setShowProductDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Produk</DialogTitle>
            <DialogDescription>
              Informasi lengkap tentang produk
            </DialogDescription>
          </DialogHeader>
          {loadingProductDetail ? (
            <div className="text-center py-8 text-gray-500">Memuat detail produk...</div>
          ) : selectedProduct ? (
            <div className="space-y-6">
              {/* Product Images */}
              <div>
                <h3 className="font-semibold mb-2">Gambar Produk</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedProduct.images?.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${selectedProduct.name} - ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>

              {/* Product Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Informasi Produk</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Nama:</span>
                      <div className="font-medium">{selectedProduct.name}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Deskripsi:</span>
                      <div className="text-sm">{selectedProduct.description}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Kategori:</span>
                      <div>
                        <Badge variant="outline">
                          {selectedProduct.category === 'tanaman-hidup' ? 'Tanaman Hidup' :
                           selectedProduct.category === 'benih' ? 'Benih' :
                           selectedProduct.category === 'peralatan' ? 'Peralatan' : selectedProduct.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Harga & Stok</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Harga:</span>
                      <div className="text-2xl font-bold text-green-600">
                        Rp {selectedProduct.price.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Stok:</span>
                      <div className={`text-lg font-medium ${selectedProduct.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedProduct.stock} unit
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Terjual:</span>
                      <div className="text-lg">{selectedProduct.sold || 0} unit</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Rating:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-medium">{selectedProduct.rating || 0}</span>
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-sm text-gray-500">
                          ({selectedProduct.reviews || 0} ulasan)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seller Info */}
              <div>
                <h3 className="font-semibold mb-2">Informasi Penjual</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">Nama:</span>
                    <div className="font-medium">{selectedProduct.sellerName}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Lokasi:</span>
                    <div className="text-sm">{selectedProduct.sellerLocation}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Email:</span>
                    <div className="text-sm">{selectedProduct.sellerId}</div>
                  </div>
                </div>
              </div>

              {/* Additional Info for Tanaman Hidup */}
              {selectedProduct.category === 'tanaman-hidup' && (
                <div>
                  <h3 className="font-semibold mb-2">Informasi Tambahan</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {selectedProduct.plantAge && (
                      <div>
                        <span className="text-sm text-gray-500">Usia Tanaman:</span>
                        <div className="font-medium">{selectedProduct.plantAge}</div>
                      </div>
                    )}
                    {selectedProduct.maxDeliveryRadius && (
                      <div>
                        <span className="text-sm text-gray-500">Radius Pengiriman:</span>
                        <div className="font-medium">{selectedProduct.maxDeliveryRadius} km</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status */}
              <div>
                <h3 className="font-semibold mb-2">Status</h3>
                <Badge
                  variant={selectedProduct.stock > 0 ? 'default' : 'secondary'}
                  className={selectedProduct.stock > 0 ? 'bg-green-500' : ''}
                >
                  {selectedProduct.stock > 0 ? 'Aktif' : 'Habis'}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">Produk tidak ditemukan</div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowProductDetail(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* User Detail Dialog */}
      <Dialog open={showUserDetail} onOpenChange={setShowUserDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Pengguna</DialogTitle>
            <DialogDescription>
              Informasi lengkap pengguna
            </DialogDescription>
          </DialogHeader>

          {loadingUserDetail ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Memuat data...</p>
            </div>
          ) : selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Informasi Pengguna</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Nama:</strong> {selectedUser.name}</div>
                  <div><strong>Email:</strong> {selectedUser.email}</div>
                  <div><strong>Telepon:</strong> {selectedUser.phone || '-'}</div>
                  <div><strong>Role:</strong> 
                    <Badge className="ml-2" variant={selectedUser.role === 'admin' ? 'default' : selectedUser.role === 'seller' ? 'default' : 'outline'}>
                      {selectedUser.role === 'admin' ? 'Admin' : selectedUser.role === 'seller' ? 'Penjual' : 'Pembeli'}
                    </Badge>
                  </div>
                  <div><strong>Metode Login:</strong> {selectedUser.login_method === 'google' ? 'Google' : 'Email'}</div>
                </div>
              </div>

              {/* Stats */}
              {userDetail && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Statistik</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Tanggal Daftar:</strong> {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString('id-ID') : '-'}</div>
                    <div><strong>Login Terakhir:</strong> {selectedUser.last_login_at ? new Date(selectedUser.last_login_at).toLocaleString('id-ID') : 'Belum pernah'}</div>
                    {selectedUser.role === 'buyer' && (
                      <>
                        <div><strong>Total Pembelian:</strong> {userDetail.totalOrders || 0} transaksi</div>
                        <div><strong>Total Pengeluaran:</strong> Rp {userDetail.totalSpent ? userDetail.totalSpent.toLocaleString('id-ID') : '0'}</div>
                      </>
                    )}
                    {selectedUser.role === 'seller' && userDetail.sellerProfile && (
                      <div>
                        <strong>Toko:</strong> {userDetail.sellerProfile.shop_name}
                        <div className="ml-4 mt-1 text-xs text-gray-600">
                          <div>Kota: {userDetail.sellerProfile.shop_city}</div>
                          <div>Status KYC: 
                            <Badge className="ml-1" variant={userDetail.sellerProfile.kyc_status === 'approved' ? 'default' : userDetail.sellerProfile.kyc_status === 'pending' ? 'outline' : 'destructive'}>
                              {userDetail.sellerProfile.kyc_status === 'approved' ? 'Disetujui' : userDetail.sellerProfile.kyc_status === 'pending' ? 'Pending' : 'Ditolak'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Address */}
              {userDetail?.address && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Alamat</h3>
                  <div className="space-y-1 text-sm">
                    <div>{userDetail.address.address}</div>
                    <div>{userDetail.address.city}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDetail(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
