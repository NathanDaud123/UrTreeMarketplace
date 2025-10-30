import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface PinSetupDialogProps {
  open: boolean;
  onClose: () => void;
  onPinSet: (pin: string) => Promise<void>;
}

export function PinSetupDialog({ open, onClose, onPinSet }: PinSetupDialogProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!pin || !confirmPin) {
      toast.error('PIN harus diisi');
      return;
    }

    if (pin.length !== 6) {
      toast.error('PIN harus 6 digit');
      return;
    }

    if (!/^\d{6}$/.test(pin)) {
      toast.error('PIN harus berupa angka');
      return;
    }

    if (pin !== confirmPin) {
      toast.error('PIN tidak sama');
      return;
    }

    setIsLoading(true);
    try {
      await onPinSet(pin);
      toast.success('PIN berhasil dibuat!');
      setPin('');
      setConfirmPin('');
      onClose();
    } catch (error) {
      toast.error('Gagal membuat PIN');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-green-600" />
            Buat PIN Keamanan
          </DialogTitle>
          <DialogDescription>
            Buat PIN 6 digit untuk mengamankan transaksi Anda
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-800 text-sm">
              💡 PIN akan digunakan untuk verifikasi setiap kali Anda melakukan checkout.
              Pastikan PIN mudah diingat tapi tidak mudah ditebak.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="pin">PIN (6 digit)</Label>
            <div className="relative">
              <Input
                id="pin"
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="text-center tracking-widest text-xl pr-10"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Masukkan 6 digit angka (contoh: 123456)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-pin">Konfirmasi PIN</Label>
            <div className="relative">
              <Input
                id="confirm-pin"
                type={showConfirmPin ? 'text' : 'password'}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="text-center tracking-widest text-xl pr-10"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPin(!showConfirmPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? 'Menyimpan...' : 'Buat PIN'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
