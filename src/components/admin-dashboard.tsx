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
import { Users, ShoppingBag, TrendingUp, Store } from 'lucide-react';
import { MOCK_PRODUCTS } from '../lib/mock-data';

export function AdminDashboard() {
  // Mock statistics
  const stats = {
    totalUsers: 1247,
    newUsersThisMonth: 89,
    totalSellers: 42,
    newSellersThisMonth: 5,
    totalProducts: MOCK_PRODUCTS.length,
    activeProducts: MOCK_PRODUCTS.filter((p) => p.stock > 0).length,
    totalTransactions: 3456,
    totalRevenue: MOCK_PRODUCTS.reduce((sum, p) => sum + p.price * p.sold, 0),
  };

  // Mock recent users
  const recentUsers = [
    { id: 1, name: 'Ahmad Wijaya', email: 'ahmad@email.com', role: 'Pembeli', date: '2025-10-25' },
    { id: 2, name: 'Siti Nurhaliza', email: 'siti@email.com', role: 'Pembeli', date: '2025-10-25' },
    { id: 3, name: 'Toko Hijau Makmur', email: 'tokohijau@email.com', role: 'Penjual', date: '2025-10-24' },
    { id: 4, name: 'Budi Santoso', email: 'budi@email.com', role: 'Pembeli', date: '2025-10-24' },
    { id: 5, name: 'Green Garden Store', email: 'greengarden@email.com', role: 'Penjual', date: '2025-10-23' },
  ];

  // Mock recent transactions
  const recentTransactions = [
    { id: 'TRX001', buyer: 'Ahmad Wijaya', total: 150000, status: 'Selesai', date: '2025-10-27' },
    { id: 'TRX002', buyer: 'Siti Nurhaliza', total: 275000, status: 'Diproses', date: '2025-10-27' },
    { id: 'TRX003', buyer: 'Budi Santoso', total: 95000, status: 'Selesai', date: '2025-10-26' },
    { id: 'TRX004', buyer: 'Dewi Lestari', total: 450000, status: 'Dikirim', date: '2025-10-26' },
    { id: 'TRX005', buyer: 'Andi Wijaya', total: 185000, status: 'Selesai', date: '2025-10-25' },
  ];

  // Category distribution
  const categoryStats = [
    { category: 'Tanaman Hidup', count: MOCK_PRODUCTS.filter((p) => p.category === 'tanaman-hidup').length, percentage: 36 },
    { category: 'Benih', count: MOCK_PRODUCTS.filter((p) => p.category === 'benih').length, percentage: 29 },
    { category: 'Peralatan', count: MOCK_PRODUCTS.filter((p) => p.category === 'peralatan').length, percentage: 35 },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h2>Dashboard Admin</h2>
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
                <div className="text-2xl">{stats.totalUsers}</div>
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
                <div className="text-2xl">{stats.totalSellers}</div>
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
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl">{stats.totalProducts}</div>
                <div className="text-sm text-gray-600">Total Produk</div>
                <div className="text-xs text-gray-600 mt-1">
                  {stats.activeProducts} aktif
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl">{stats.totalTransactions}</div>
                <div className="text-sm text-gray-600">Total Transaksi</div>
                <div className="text-xs text-gray-600 mt-1">
                  Rp {(stats.totalRevenue / 1000000).toFixed(1)}jt
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Pengguna</TabsTrigger>
          <TabsTrigger value="products">Produk</TabsTrigger>
          <TabsTrigger value="transactions">Transaksi</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Akun Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Tanggal Daftar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'Penjual' ? 'default' : 'outline'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Kategori Produk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryStats.map((stat) => (
                    <div key={stat.category}>
                      <div className="flex items-center justify-between mb-2">
                        <span>{stat.category}</span>
                        <span className="text-sm text-gray-600">{stat.count} produk</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-600"
                          style={{ width: `${stat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Produk Terlaris</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {MOCK_PRODUCTS.sort((a, b) => b.sold - a.sold)
                    .slice(0, 5)
                    .map((product, index) => (
                      <div key={product.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm">{product.name}</div>
                          <div className="text-xs text-gray-600">{product.sellerName}</div>
                        </div>
                        <div className="text-sm text-gray-600">{product.sold} terjual</div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaksi Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Transaksi</TableHead>
                    <TableHead>Pembeli</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((trx) => (
                    <TableRow key={trx.id}>
                      <TableCell>{trx.id}</TableCell>
                      <TableCell>{trx.buyer}</TableCell>
                      <TableCell>Rp {trx.total.toLocaleString('id-ID')}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            trx.status === 'Selesai'
                              ? 'default'
                              : trx.status === 'Diproses'
                              ? 'outline'
                              : 'secondary'
                          }
                        >
                          {trx.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{trx.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
