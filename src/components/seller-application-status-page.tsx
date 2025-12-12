import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface SellerApplicationStatusPageProps {
  onBackToProfile: () => void;
}

export function SellerApplicationStatusPage({ onBackToProfile }: SellerApplicationStatusPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Pengajuan Diterima
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Terima kasih telah mengajukan diri sebagai penjual di UrTree Marketplace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Status: Menunggu Persetujuan
                </p>
                <p className="text-sm text-blue-700">
                  Pengajuan Anda sedang dalam proses review oleh tim admin. 
                  Kami akan mengirimkan notifikasi melalui email setelah pengajuan disetujui.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Data toko telah tersimpan</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Data KYC telah tersimpan</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Menunggu verifikasi admin</span>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-800">
                <strong>Catatan:</strong> Proses verifikasi biasanya memakan waktu 1-3 hari kerja. 
                Pastikan email Anda aktif untuk menerima notifikasi.
              </p>
            </div>
          </div>

          <Button 
            onClick={onBackToProfile}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            Oke, Kembali ke Profil
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

