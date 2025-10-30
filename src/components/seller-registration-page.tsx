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
  address: string;
  city: string;
  phone: string;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        shopName,
        shopDescription,
        address: shopAddress,
        city: shopCity,
        phone: kycPhone,
      });
    }
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
