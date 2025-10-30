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
  onUpdateUser: (user: UserType) => void;
  onApplyAsSeller: () => void;
}

export function ProfilePage({ user, onUpdateUser, onApplyAsSeller }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showSellerDialog, setShowSellerDialog] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [editedEmail, setEditedEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(user.address || '');
  const [city, setCity] = useState(user.city || '');
  
  // Seller application data
  const [shopName, setShopName] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopCity, setShopCity] = useState('');
  
  // KYC Data
  const [kycPhone, setKycPhone] = useState('');
  const [kycKtpNumber, setKycKtpNumber] = useState('');
  const [kycKtpPhoto, setKycKtpPhoto] = useState<File | null>(null);
  const [kycBankName, setKycBankName] = useState('');
  const [kycAccountNumber, setKycAccountNumber] = useState('');
  const [kycAccountName, setKycAccountName] = useState('');

  const handleSaveProfile = () => {
    if (!editedName || !editedEmail) {
      toast.error('Nama dan email tidak boleh kosong');
      return;
    }

    onUpdateUser({
      ...user,
      name: editedName,
      email: editedEmail,
      phone,
      address,
      city,
    });

    setIsEditing(false);
    toast.success('Profil berhasil diperbarui');
  };

  const handleCancelEdit = () => {
    setEditedName(user.name);
    setEditedEmail(user.email);
    setPhone(user.phone || '');
    setAddress(user.address || '');
    setCity(user.city || '');
    setIsEditing(false);
  };

  const handleApplySeller = () => {
    // Validate shop data
    if (!shopName || !shopDescription || !shopAddress || !shopCity) {
      toast.error('Mohon lengkapi semua data toko');
      return;
    }

    if (shopDescription.length < 50) {
      toast.error('Deskripsi toko minimal 50 karakter');
      return;
    }

    // Validate KYC data
    if (!kycPhone || !kycKtpNumber || !kycBankName || !kycAccountNumber || !kycAccountName) {
      toast.error('Mohon lengkapi semua data KYC (Verifikasi)');
      return;
    }

    if (kycPhone.length < 10) {
      toast.error('Nomor telepon tidak valid');
      return;
    }

    if (kycKtpNumber.length !== 16) {
      toast.error('Nomor KTP harus 16 digit');
      return;
    }

    if (!kycKtpPhoto) {
      toast.error('Mohon upload foto KTP Anda');
      return;
    }

    // Update user with shop data
    onUpdateUser({
      ...user,
      shopName,
      shopDescription,
      shopAddress,
      shopCity,
    });

    // Trigger seller application
    onApplyAsSeller();
    setShowSellerDialog(false);
    
    // Simulate approval (in real app, this would be admin approval)
    setTimeout(() => {
      toast.success('🎉 Selamat! Pengajuan Anda disetujui. Anda sekarang adalah penjual di UrTree Marketplace!');
    }, 2000);
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
                      onClick={() => setShowSellerDialog(true)}
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

      {/* Seller Application Dialog */}
      <Dialog open={showSellerDialog} onOpenChange={setShowSellerDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Daftar Sebagai Penjual</DialogTitle>
            <DialogDescription>
              Lengkapi informasi toko Anda untuk bergabung sebagai penjual di UrTree Marketplace
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Benefits */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200">
              <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Keuntungan Menjadi Penjual
              </h4>
              <ul className="space-y-2 text-sm text-green-800">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Jangkau ribuan pembeli tanaman di seluruh Indonesia</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Dashboard lengkap untuk kelola produk & pesanan</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Atur radius pengiriman sesuai kemampuan Anda</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Gratis tanpa biaya berlangganan bulanan</span>
                </li>
              </ul>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="shop-name" className="font-semibold">
                  Nama Toko <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="shop-name"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="Contoh: Taman Hijau Nursery"
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">Nama toko yang akan ditampilkan kepada pembeli</p>
              </div>

              <div>
                <Label htmlFor="shop-description" className="font-semibold">
                  Deskripsi Toko <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="shop-description"
                  value={shopDescription}
                  onChange={(e) => setShopDescription(e.target.value)}
                  placeholder="Ceritakan tentang toko Anda, produk yang dijual, dan keunggulan toko..."
                  rows={4}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">Minimal 50 karakter</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shop-city" className="font-semibold">
                    Kota <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="shop-city"
                    value={shopCity}
                    onChange={(e) => setShopCity(e.target.value)}
                    placeholder="Jakarta"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="shop-phone" className="font-semibold">
                    No. Telepon Toko
                  </Label>
                  <Input
                    id="shop-phone"
                    type="tel"
                    placeholder="08xx xxxx xxxx"
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="shop-address" className="font-semibold">
                  Alamat Toko <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="shop-address"
                  value={shopAddress}
                  onChange={(e) => setShopAddress(e.target.value)}
                  placeholder="Masukkan alamat lengkap toko Anda"
                  rows={3}
                  className="mt-2"
                />
              </div>
            </div>

            {/* KYC Section */}
            <Separator />
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-yellow-700" />
                  <h4 className="font-bold text-yellow-900">Verifikasi Identitas (KYC)</h4>
                </div>
                <p className="text-sm text-yellow-800 mb-3">
                  Data ini diperlukan untuk verifikasi dan perlindungan transaksi. Data Anda aman dan terenkripsi.
                </p>
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="kyc-phone" className="font-semibold flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  No. Telepon (WhatsApp) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="kyc-phone"
                  type="tel"
                  value={kycPhone}
                  onChange={(e) => setKycPhone(e.target.value)}
                  placeholder="08xx xxxx xxxx"
                  className="mt-2"
                  maxLength={13}
                />
                <p className="text-xs text-gray-500 mt-1">Nomor aktif untuk komunikasi dengan pembeli</p>
              </div>

              {/* KTP Number */}
              <div>
                <Label htmlFor="kyc-ktp" className="font-semibold flex items-center gap-2">
                  <IdCard className="w-4 h-4" />
                  Nomor KTP <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="kyc-ktp"
                  type="text"
                  value={kycKtpNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 16) setKycKtpNumber(value);
                  }}
                  placeholder="16 digit nomor KTP"
                  className="mt-2"
                  maxLength={16}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {kycKtpNumber.length}/16 digit
                </p>
              </div>

              {/* KTP Photo */}
              <div>
                <Label htmlFor="kyc-ktp-photo" className="font-semibold flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Foto KTP <span className="text-red-500">*</span>
                </Label>
                <div className="mt-2">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                    <input
                      id="kyc-ktp-photo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error('Ukuran file maksimal 5MB');
                            return;
                          }
                          setKycKtpPhoto(file);
                          toast.success('Foto KTP berhasil diunggah');
                        }
                      }}
                      className="hidden"
                    />
                    <label htmlFor="kyc-ktp-photo" className="cursor-pointer">
                      {kycKtpPhoto ? (
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="font-semibold">{kycKtpPhoto.name}</span>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                          <p className="font-semibold text-gray-700">Klik untuk upload foto KTP</p>
                          <p className="text-xs text-gray-500 mt-1">Maksimal 5MB (JPG, PNG)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Pastikan foto jelas dan dapat dibaca</p>
              </div>

              {/* Bank Name */}
              <div>
                <Label htmlFor="kyc-bank" className="font-semibold flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Nama Bank <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="kyc-bank"
                  value={kycBankName}
                  onChange={(e) => setKycBankName(e.target.value)}
                  placeholder="Contoh: BCA, Mandiri, BNI"
                  className="mt-2"
                />
              </div>

              {/* Account Number & Name */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="kyc-account-number" className="font-semibold flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    No. Rekening <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="kyc-account-number"
                    type="text"
                    value={kycAccountNumber}
                    onChange={(e) => setKycAccountNumber(e.target.value)}
                    placeholder="Nomor rekening"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="kyc-account-name" className="font-semibold">
                    Nama Pemilik Rekening <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="kyc-account-name"
                    value={kycAccountName}
                    onChange={(e) => setKycAccountName(e.target.value)}
                    placeholder="Sesuai KTP"
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Harus sama dengan nama di KTP</p>
                </div>
              </div>

              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-sm text-green-800">
                  <strong>Keamanan Data:</strong> Semua data pribadi Anda dienkripsi dan hanya digunakan untuk verifikasi akun penjual.
                </AlertDescription>
              </Alert>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              onClick={() => setShowSellerDialog(false)}
              variant="outline"
            >
              Batal
            </Button>
            <Button
              onClick={handleApplySeller}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              <Store className="w-4 h-4 mr-2" />
              Ajukan Sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}