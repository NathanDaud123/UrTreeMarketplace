import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Store,
  Calendar,
  Shield,
  ShoppingBag,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  Edit2,
  Save,
  AlertCircle,
  CreditCard,
  Upload,
  Building2,
  IdCard,
} from 'lucide-react';
import type { User as UserType } from '../App';
import { toast } from 'sonner@2.0.3';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';

interface ProfilePageProps {
  user: UserType;
  onUpdateUser: (user: UserType) => Promise<void>;
  onNavigateToSellerRegistration: () => void;
}

export function ProfilePage({ user, onUpdateUser, onNavigateToSellerRegistration }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [editedEmail, setEditedEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(user.address || '');
  const [city, setCity] = useState(user.city || '');

  const handleSaveProfile = async () => {
    if (!editedName || !editedEmail) {
      toast.error('Nama dan email tidak boleh kosong');
      return;
    }

    try {
      await onUpdateUser({
        ...user,
        name: editedName,
        email: editedEmail,
        phone,
        address,
        city,
      });
      
      // Only close edit mode if update was successful
      setIsEditing(false);
      // Toast success akan muncul dari App.tsx setelah update berhasil
    } catch (error: any) {
      // Error handling sudah dilakukan di App.tsx
      // Jangan tutup edit mode jika error
      console.error('Profile save error in profile-page:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditedName(user.name);
    setEditedEmail(user.email);
    setPhone(user.phone || '');
    setAddress(user.address || '');
    setCity(user.city || '');
    setIsEditing(false);
  };


  const getRoleBadge = () => {
    if (user.role === 'admin') {
      return (
        <Badge className="bg-purple-600 hover:bg-purple-700">
          <Shield className="w-3 h-3 mr-1" />
          Admin
        </Badge>
      );
    }
    if (user.role === 'seller') {
      return (
        <Badge className="bg-green-600 hover:bg-green-700">
          <Store className="w-3 h-3 mr-1" />
          Penjual
        </Badge>
      );
    }
    if (user.isPendingSeller) {
      return (
        <Badge className="bg-orange-500 hover:bg-orange-600">
          <Clock className="w-3 h-3 mr-1" />
          Menunggu Persetujuan
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        <ShoppingBag className="w-3 h-3 mr-1" />
        Pembeli
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profil Saya</h1>
          <p className="text-gray-600">Kelola informasi profil Anda untuk kontrol keamanan akun</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Profile Summary */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0 sticky top-20">
              <CardContent className="p-6">
                {/* Avatar */}
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="font-bold mb-1">{user.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{user.email}</p>
                  {getRoleBadge()}
                </div>

                <Separator className="my-6" />

                {/* Quick Stats */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-gray-500">Bergabung</p>
                      <p className="font-semibold">Januari 2025</p>
                    </div>
                  </div>
                  
                  {user.role === 'buyer' && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-gray-500">Total Pesanan</p>
                        <p className="font-semibold">0 Pesanan</p>
                      </div>
                    </div>
                  )}

                  {user.role === 'seller' && (
                    <>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-gray-500">Total Produk</p>
                          <p className="font-semibold">0 Produk</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-gray-500">Penjualan</p>
                          <p className="font-semibold">0 Transaksi</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Seller Application Button */}
                {user.role === 'buyer' && !user.isPendingSeller && (
                  <>
                    <Separator className="my-6" />
                    <Button
                      onClick={onNavigateToSellerRegistration}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    >
                      <Store className="w-4 h-4 mr-2" />
                      Daftar Jadi Penjual
                    </Button>
                  </>
                )}

                {user.isPendingSeller && (
                  <>
                    <Separator className="my-6" />
                    <Alert className="bg-orange-50 border-orange-200">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-sm text-orange-800">
                        Pengajuan Anda sedang diproses oleh admin. Harap tunggu konfirmasi.
                      </AlertDescription>
                    </Alert>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Content - Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-bold">Informasi Pribadi</CardTitle>
                    <CardDescription>Update informasi pribadi Anda</CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile} size="sm" className="bg-green-600 hover:bg-green-700">
                        <Save className="w-4 h-4 mr-2" />
                        Simpan
                      </Button>
                      <Button onClick={handleCancelEdit} variant="outline" size="sm">
                        <XCircle className="w-4 h-4 mr-2" />
                        Batal
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="font-semibold">Nama Lengkap</Label>
                    <div className="mt-2">
                      {isEditing ? (
                        <Input
                          id="name"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          placeholder="Nama lengkap"
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{user.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="font-semibold">Email</Label>
                    <div className="mt-2">
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={editedEmail}
                          onChange={(e) => setEditedEmail(e.target.value)}
                          placeholder="email@example.com"
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{user.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone" className="font-semibold">No. Telepon</Label>
                    <div className="mt-2">
                      {isEditing ? (
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="08xx xxxx xxxx"
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-500">{phone || 'Belum diatur'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="city" className="font-semibold">Kota</Label>
                    <div className="mt-2">
                      {isEditing ? (
                        <Input
                          id="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Jakarta"
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-500">{city || 'Belum diatur'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="font-semibold">Alamat Lengkap</Label>
                  <div className="mt-2">
                    {isEditing ? (
                      <Textarea
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Masukkan alamat lengkap"
                        rows={3}
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">{address || 'Belum diatur'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="font-bold">Keamanan</CardTitle>
                <CardDescription>Kelola kata sandi dan keamanan akun Anda</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold mb-1">Password</p>
                      <p className="text-sm text-gray-500">••••••••••••</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Ubah Password
                    </Button>
                  </div>

                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-sm text-blue-800">
                      Gunakan password yang kuat dengan kombinasi huruf, angka, dan simbol untuk keamanan akun Anda.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info (if seller) */}
            {user.role === 'seller' && user.shopName && (
              <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-white">
                <CardHeader>
                  <CardTitle className="font-bold flex items-center gap-2">
                    <Store className="w-5 h-5 text-green-600" />
                    Informasi Toko
                  </CardTitle>
                  <CardDescription>Detail toko Anda di UrTree Marketplace</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="font-semibold">Nama Toko</Label>
                    <p className="mt-1 text-lg font-bold text-green-600">{user.shopName}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Deskripsi Toko</Label>
                    <p className="mt-1 text-gray-600">{user.shopDescription}</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold">Alamat Toko</Label>
                      <p className="mt-1 text-gray-600">{user.shopAddress}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Kota</Label>
                      <p className="mt-1 text-gray-600">{user.shopCity}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}