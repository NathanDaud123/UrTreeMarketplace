import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { 
  Store, 
  MapPin, 
  Phone, 
  User, 
  FileText, 
  ArrowLeft, 
  Shield, 
  IdCard, 
  Upload, 
  Building2, 
  CreditCard,
  CheckCircle2 
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SellerRegistrationPageProps {
  onSubmit: (data: SellerRegistrationData) => void;
  onBack: () => void;
}

export interface SellerRegistrationData {
  shopName: string;
  shopDescription: string;
  shopAddress: string;
  shopCity: string;
  address: string;
  city: string;
  phone: string;
  identityType?: string;
  identityNumber?: string;
  identityPhoto?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  // KYC fields with kyc prefix
  kycKtpNumber?: string;
  kycKtpPhoto?: string;
  kycBankName?: string;
  kycAccountNumber?: string;
  kycAccountName?: string;
  eWalletTypes?: string[];
  eWalletPhone?: string;
}

export function SellerRegistrationPage({ onSubmit, onBack }: SellerRegistrationPageProps) {
  // Shop Information
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
  // E-Wallet
  const [eWalletDana, setEWalletDana] = useState(false);
  const [eWalletOvo, setEWalletOvo] = useState(false);
  const [eWalletShopeePay, setEWalletShopeePay] = useState(false);
  const [eWalletGoPay, setEWalletGoPay] = useState(false);

  const validateForm = (): boolean => {
    // Validate shop data
    if (!shopName.trim()) {
      toast.error('Nama toko wajib diisi');
      return false;
    }

    if (!shopDescription.trim()) {
      toast.error('Deskripsi toko wajib diisi');
      return false;
    }

    if (shopDescription.length < 50) {
      toast.error('Deskripsi toko minimal 50 karakter');
      return false;
    }

    if (!shopAddress.trim()) {
      toast.error('Alamat toko wajib diisi');
      return false;
    }

    if (!shopCity.trim()) {
      toast.error('Kota toko wajib diisi');
      return false;
    }

    // Validate KYC data
    if (!kycPhone.trim()) {
      toast.error('Nomor telepon (WhatsApp) wajib diisi');
      return false;
    }

    if (kycPhone.length < 10) {
      toast.error('Nomor telepon tidak valid (minimal 10 digit)');
      return false;
    }

    if (!kycKtpNumber.trim()) {
      toast.error('Nomor KTP wajib diisi');
      return false;
    }

    if (kycKtpNumber.length !== 16) {
      toast.error('Nomor KTP harus 16 digit');
      return false;
    }

    if (!kycKtpPhoto) {
      toast.error('Foto KTP wajib diunggah');
      return false;
    }

    if (!kycBankName.trim()) {
      toast.error('Nama bank wajib diisi');
      return false;
    }

    if (!kycAccountNumber.trim()) {
      toast.error('Nomor rekening wajib diisi');
      return false;
    }

    if (!kycAccountName.trim()) {
      toast.error('Nama pemilik rekening wajib diisi');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    let ktpPhotoUrl = '';
    
    // Upload KTP photo if exists
    if (kycKtpPhoto) {
      try {
        toast.info('Mengupload foto KTP...');
        // Convert to base64 for storage
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.onerror = reject;
          reader.readAsDataURL(kycKtpPhoto);
        });
        
        ktpPhotoUrl = await base64Promise;
        toast.success('Foto KTP berhasil diupload');
      } catch (error) {
        console.error('Error uploading KTP photo:', error);
        toast.error('Gagal mengupload foto KTP. Silakan coba lagi.');
        return;
      }
    }

    // Collect selected e-wallet types
    const eWalletTypes: string[] = [];
    if (eWalletDana) eWalletTypes.push('dana');
    if (eWalletOvo) eWalletTypes.push('ovo');
    if (eWalletShopeePay) eWalletTypes.push('shopeepay');
    if (eWalletGoPay) eWalletTypes.push('gopay');

    onSubmit({
      shopName,
      shopDescription,
      shopAddress,
      shopCity,
      address: shopAddress,
      city: shopCity,
      phone: kycPhone,
      identityType: 'KTP',
      identityNumber: kycKtpNumber,
      identityPhoto: ktpPhotoUrl,
      bankName: kycBankName,
      bankAccountNumber: kycAccountNumber,
      bankAccountName: kycAccountName,
      // KYC fields with kyc prefix for compatibility
      kycKtpNumber,
      kycKtpPhoto: ktpPhotoUrl,
      kycBankName,
      kycAccountNumber,
      kycAccountName,
      // E-Wallet
      eWalletTypes,
      eWalletPhone: kycPhone, // Use phone number as e-wallet number
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Store className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Daftar Sebagai Penjual</CardTitle>
                <CardDescription>
                  Lengkapi informasi toko dan verifikasi identitas Anda
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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

              {/* Shop Information */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-gray-700">
                  <Store className="w-5 h-5" />
                  Informasi Toko
                </h3>

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
                  <p className="text-xs text-gray-500 mt-1">
                    Minimal 50 karakter ({shopDescription.length}/50)
                  </p>
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
                    type="text"
                    value={kycBankName}
                    onChange={(e) => setKycBankName(e.target.value)}
                    placeholder="Contoh: Bank BCA, Bank Mandiri"
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Untuk pencairan dana penjualan</p>
                </div>

                {/* Account Number */}
                <div>
                  <Label htmlFor="kyc-account" className="font-semibold flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Nomor Rekening <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="kyc-account"
                    type="text"
                    value={kycAccountNumber}
                    onChange={(e) => setKycAccountNumber(e.target.value)}
                    placeholder="Nomor rekening bank"
                    className="mt-2"
                  />
                </div>

                {/* Account Name */}
                <div>
                  <Label htmlFor="kyc-account-name" className="font-semibold flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nama Pemilik Rekening <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="kyc-account-name"
                    type="text"
                    value={kycAccountName}
                    onChange={(e) => setKycAccountName(e.target.value)}
                    placeholder="Nama sesuai buku rekening"
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Harus sesuai dengan nama di KTP</p>
                </div>
              </div>

              {/* E-Wallet Selection */}
              <div className="space-y-4">
                <div>
                  <Label className="font-semibold flex items-center gap-2 mb-3">
                    <CreditCard className="w-4 h-4" />
                    E-Wallet yang Tersedia <span className="text-gray-500 text-sm font-normal">(Opsional - bisa pilih beberapa)</span>
                  </Label>
                  <p className="text-xs text-gray-500 mb-3">
                    Nomor telepon Anda ({kycPhone || 'belum diisi'}) akan digunakan sebagai nomor e-wallet
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2 border rounded-lg p-3 hover:border-green-500 transition-colors">
                      <input
                        type="checkbox"
                        id="ewallet-dana"
                        checked={eWalletDana}
                        onChange={(e) => setEWalletDana(e.target.checked)}
                        className="w-4 h-4 text-green-600"
                      />
                      <Label htmlFor="ewallet-dana" className="cursor-pointer flex-1">
                        <div className="font-medium">DANA</div>
                        <div className="text-xs text-gray-500">Nomor: {kycPhone || '-'}</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-3 hover:border-green-500 transition-colors">
                      <input
                        type="checkbox"
                        id="ewallet-ovo"
                        checked={eWalletOvo}
                        onChange={(e) => setEWalletOvo(e.target.checked)}
                        className="w-4 h-4 text-green-600"
                      />
                      <Label htmlFor="ewallet-ovo" className="cursor-pointer flex-1">
                        <div className="font-medium">OVO</div>
                        <div className="text-xs text-gray-500">Nomor: {kycPhone || '-'}</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-3 hover:border-green-500 transition-colors">
                      <input
                        type="checkbox"
                        id="ewallet-shopeepay"
                        checked={eWalletShopeePay}
                        onChange={(e) => setEWalletShopeePay(e.target.checked)}
                        className="w-4 h-4 text-green-600"
                      />
                      <Label htmlFor="ewallet-shopeepay" className="cursor-pointer flex-1">
                        <div className="font-medium">ShopeePay</div>
                        <div className="text-xs text-gray-500">Nomor: {kycPhone || '-'}</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-3 hover:border-green-500 transition-colors">
                      <input
                        type="checkbox"
                        id="ewallet-gopay"
                        checked={eWalletGoPay}
                        onChange={(e) => setEWalletGoPay(e.target.checked)}
                        className="w-4 h-4 text-green-600"
                      />
                      <Label htmlFor="ewallet-gopay" className="cursor-pointer flex-1">
                        <div className="font-medium">GoPay</div>
                        <div className="text-xs text-gray-500">Nomor: {kycPhone || '-'}</div>
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <p className="mb-2">
                      Dengan mendaftar sebagai penjual, Anda menyetujui:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Syarat dan Ketentuan Penjual UrTree</li>
                      <li>Kebijakan Privasi dan Keamanan Data</li>
                      <li>Peraturan Penjualan Produk Tanaman</li>
                      <li>Komitmen untuk menjual produk berkualitas</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Daftar Sebagai Penjual
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
