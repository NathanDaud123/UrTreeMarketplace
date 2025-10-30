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
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface PinVerificationDialogProps {
  open: boolean;
  onClose: () => void;
  onVerify: (pin: string) => Promise<boolean>;
  title?: string;
  description?: string;
}

export function PinVerificationDialog({
  open,
  onClose,
  onVerify,
  title = 'Verifikasi PIN',
  description = 'Masukkan PIN Anda untuk melanjutkan',
}: PinVerificationDialogProps) {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pin || pin.length !== 6) {
      toast.error('PIN harus 6 digit');
      return;
    }

    if (!/^\d{6}$/.test(pin)) {
      toast.error('PIN harus berupa angka');
      return;
    }

    setIsLoading(true);
    try {
      const isValid = await onVerify(pin);
      
      if (isValid) {
        toast.success('PIN benar! Memproses...');
        setPin('');
        setAttempts(0);
        onClose();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= 3) {
          toast.error('PIN salah 3 kali. Silakan coba lagi nanti.');
          setPin('');
          setAttempts(0);
          onClose();
        } else {
          toast.error(`PIN salah. Sisa percobaan: ${3 - newAttempts}`);
          setPin('');
        }
      }
    } catch (error) {
      toast.error('Gagal memverifikasi PIN');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPin('');
    setAttempts(0);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-green-600" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {attempts > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                PIN yang Anda masukkan salah. Sisa percobaan: {3 - attempts}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="pin-verify">PIN (6 digit)</Label>
            <div className="relative">
              <Input
                id="pin-verify"
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="text-center tracking-widest text-xl pr-10"
                autoComplete="off"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-800 text-sm">
              🔒 PIN diperlukan untuk keamanan transaksi Anda
            </AlertDescription>
          </Alert>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isLoading || pin.length !== 6}
            >
              {isLoading ? 'Memverifikasi...' : 'Verifikasi'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
