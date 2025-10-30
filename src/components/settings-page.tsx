import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import {
  Shield,
  Bell,
  Lock,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
  Key,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ShoppingBag,
  Store,
} from 'lucide-react';
import type { User as UserType } from '../App';
import { toast } from 'sonner@2.0.3';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { PinSetupDialog } from './pin-setup-dialog';
import { PinVerificationDialog } from './pin-verification-dialog';
import { useDatabaseContext } from '../utils/database-provider';

interface SettingsPageProps {
  user: UserType;
  onUpdateUser: (user: UserType) => void;
  onSwitchRole?: (newRole: 'buyer' | 'seller') => void;
}

export function SettingsPage({ user, onUpdateUser, onSwitchRole }: SettingsPageProps) {
  const { setPin, verifyPin, changePin } = useDatabaseContext();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // PIN management
  const [showPinSetupDialog, setShowPinSetupDialog] = useState(false);
  const [showPinVerifyDialog, setShowPinVerifyDialog] = useState(false);
  const [pinAction, setPinAction] = useState<'create' | 'change'>('create');

  // Notification settings
  const [emailNotif, setEmailNotif] = useState(true);
  const [orderNotif, setOrderNotif] = useState(true);
  const [promoNotif, setPromoNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);

  // Privacy settings
  const [showProfile, setShowProfile] = useState(true);
  const [showOrders, setShowOrders] = useState(false);

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Mohon lengkapi semua field password');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Password baru dan konfirmasi password tidak cocok');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    // In real app, this would call API
    toast.success('Password berhasil diubah');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleDeleteAccount = () => {
    toast.error('Fitur hapus akun akan segera tersedia');
  };

  const handleCreatePin = () => {
    setPinAction('create');
    setShowPinSetupDialog(true);
  };

  const handleChangePin = () => {
    setPinAction('change');
    setShowPinVerifyDialog(true);
  };

  const handlePinSet = async (pin: string) => {
    try {
      await setPin(user.email, pin);
      toast.success('PIN berhasil dibuat!');
      
      // Update user object
      onUpdateUser({ ...user, hasPin: true });
    } catch (error) {
      throw error;
    }
  };

  const handlePinVerifiedForChange = async (pin: string) => {
    const isValid = await verifyPin(user.email, pin);
    
    if (isValid) {
      setShowPinVerifyDialog(false);
      setShowPinSetupDialog(true);
      return true;
    }
    
    return false;
  };

  const handlePinChange = async (newPin: string) => {
    try {
      await changePin(user.email, newPin);
      toast.success('PIN berhasil diubah!');
    } catch (error) {
      throw error;
    }
  };

  return (
    <>
      {/* PIN Dialogs */}
      <PinSetupDialog
        open={showPinSetupDialog}
        onClose={() => setShowPinSetupDialog(false)}
        onPinSet={pinAction === 'create' ? handlePinSet : handlePinChange}
      />
      
      <PinVerificationDialog
        open={showPinVerifyDialog}
        onClose={() => setShowPinVerifyDialog(false)}
        onVerify={handlePinVerifiedForChange}
        title="Verifikasi PIN Lama"
        description="Masukkan PIN lama Anda untuk mengubah PIN"
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Pengaturan Akun</h1>
            <p className="text-gray-600">Kelola preferensi dan keamanan akun Anda</p>
          </div>

          <div className="space-y-6">
          {/* Security Settings */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <CardTitle className="font-bold">Keamanan</CardTitle>
                  <CardDescription>Ubah password dan tingkatkan keamanan akun</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Change Password */}
              <div>
                <h4 className="font-semibold mb-4">Ubah Password</h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="current-password" className="font-semibold">Password Saat Ini</Label>
                    <div className="relative mt-2">
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Masukkan password saat ini"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="new-password" className="font-semibold">Password Baru</Label>
                    <div className="relative mt-2">
                      <Input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Masukkan password baru"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
                  </div>

                  <div>
                    <Label htmlFor="confirm-password" className="font-semibold">Konfirmasi Password Baru</Label>
                    <div className="relative mt-2">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Masukkan ulang password baru"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    onClick={handleChangePassword}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Ubah Password
                  </Button>
                </div>
              </div>

              <Separator />

              {/* PIN Security */}
              <div>
                <h4 className="font-semibold mb-4">PIN Keamanan Transaksi</h4>
                <div className="space-y-4">
                  {user.hasPin ? (
                    <>
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          ✓ PIN keamanan sudah aktif. Transaksi Anda dilindungi dengan PIN 6 digit.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Lock className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold">PIN Transaksi</p>
                            <p className="text-sm text-gray-500">PIN digunakan untuk verifikasi checkout</p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleChangePin}
                        >
                          Ubah PIN
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Alert className="bg-yellow-50 border-yellow-200">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                          ⚠️ Anda belum membuat PIN keamanan. Buat PIN untuk melindungi transaksi Anda.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Lock className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-semibold">Buat PIN Transaksi</p>
                            <p className="text-sm text-gray-500">Lindungi checkout dengan PIN 6 digit</p>
                          </div>
                        </div>
                        <Button 
                          variant="default"
                          size="sm"
                          onClick={handleCreatePin}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Buat PIN
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              {/* Two Factor */}
              <div>
                <h4 className="font-semibold mb-4">Autentikasi Dua Faktor</h4>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">2FA via SMS</p>
                      <p className="text-sm text-gray-500">Lindungi akun dengan kode verifikasi SMS</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Aktifkan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="font-bold">Notifikasi</CardTitle>
                  <CardDescription>Atur preferensi notifikasi Anda</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-semibold">Email Notifikasi</p>
                    <p className="text-sm text-gray-500">Terima update via email</p>
                  </div>
                </div>
                <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-semibold">Notifikasi Pesanan</p>
                    <p className="text-sm text-gray-500">Update status pesanan Anda</p>
                  </div>
                </div>
                <Switch checked={orderNotif} onCheckedChange={setOrderNotif} />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-semibold">Promo & Penawaran</p>
                    <p className="text-sm text-gray-500">Dapatkan info promo terbaru</p>
                  </div>
                </div>
                <Switch checked={promoNotif} onCheckedChange={setPromoNotif} />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-semibold">Push Notification</p>
                    <p className="text-sm text-gray-500">Notifikasi langsung di perangkat</p>
                  </div>
                </div>
                <Switch checked={pushNotif} onCheckedChange={setPushNotif} />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="font-bold">Privasi</CardTitle>
                  <CardDescription>Kontrol siapa yang dapat melihat informasi Anda</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold">Profil Publik</p>
                  <p className="text-sm text-gray-500">Tampilkan profil Anda ke pengguna lain</p>
                </div>
                <Switch checked={showProfile} onCheckedChange={setShowProfile} />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold">Riwayat Pesanan</p>
                  <p className="text-sm text-gray-500">Sembunyikan riwayat pesanan dari publik</p>
                </div>
                <Switch checked={showOrders} onCheckedChange={setShowOrders} />
              </div>
            </CardContent>
          </Card>

          {/* Role Management - Only for sellers */}
          {user.role === 'seller' && onSwitchRole && (
            <Card className="shadow-lg border-0 border-green-200 bg-gradient-to-br from-green-50 to-white">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="font-bold text-green-900">Mode Pengguna</CardTitle>
                    <CardDescription>Beralih antara mode penjual dan pembeli</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-white rounded-lg border-2 border-green-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Store className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-green-900">Mode Penjual Aktif</p>
                        <p className="text-sm text-green-700 mt-1">
                          Anda sedang dalam mode penjual. Kelola toko, produk, dan pesanan Anda.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Mode Pembeli</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Belanja produk tanaman dari berbagai penjual.
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => onSwitchRole('buyer')}
                      className="bg-blue-600 hover:bg-blue-700 shrink-0"
                    >
                      Beralih ke Pembeli
                    </Button>
                  </div>
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-800">
                    <strong>Info:</strong> Anda dapat beralih kembali ke mode penjual kapan saja dari pengaturan.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Role Management - Only for buyers */}
          {user.role === 'buyer' && onSwitchRole && (
            <Card className="shadow-lg border-0 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Store className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="font-bold text-orange-900">Menjadi Penjual</CardTitle>
                    <CardDescription>Mulai jual produk tanaman Anda sendiri</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-white rounded-lg border-2 border-orange-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Store className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-orange-900">Mode Penjual</p>
                        <p className="text-sm text-orange-700 mt-1">
                          Kelola toko Anda, tambahkan produk, dan mulai berjualan.
                        </p>
                        <ul className="text-xs text-orange-600 mt-2 space-y-1">
                          <li>• Kelola produk dan inventori</li>
                          <li>• Proses pesanan pelanggan</li>
                          <li>• Dapatkan penghasilan dari penjualan</li>
                        </ul>
                      </div>
                    </div>
                    <Button 
                      onClick={() => onSwitchRole('seller')}
                      className="bg-orange-600 hover:bg-orange-700 shrink-0"
                    >
                      Mulai Berjualan
                    </Button>
                  </div>
                </div>

                <Alert className="bg-orange-50 border-orange-200">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-sm text-orange-800">
                    <strong>Info:</strong> Anda tetap bisa berbelanja setelah menjadi penjual dengan beralih mode.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Danger Zone */}
          <Card className="shadow-lg border-0 border-red-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <CardTitle className="font-bold text-red-600">Zona Bahaya</CardTitle>
                  <CardDescription>Tindakan permanen yang tidak bisa dibatalkan</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Alert className="bg-red-50 border-red-200 mb-4">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-sm text-red-800">
                  <strong>Peringatan:</strong> Menghapus akun akan menghilangkan semua data Anda secara permanen.
                  Tindakan ini tidak dapat dibatalkan.
                </AlertDescription>
              </Alert>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Hapus Akun
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tindakan ini tidak dapat dibatalkan. Semua data Anda termasuk profil, pesanan, 
                      dan riwayat transaksi akan dihapus secara permanen.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Ya, Hapus Akun Saya
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
}
