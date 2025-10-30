import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner@2.0.3';
import { useDatabaseContext } from '../utils/database-provider';

interface LoginPageProps {
  onSuccess: () => void;
  onBack?: () => void;
}

export function LoginPage({ onSuccess, onBack }: LoginPageProps) {
  const { login, register, loginWithGoogle, isLoading } = useDatabaseContext();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error('Email dan password harus diisi');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginEmail)) {
      toast.error('Format email tidak valid');
      return;
    }

    try {
      await login(loginEmail, loginPassword);
      toast.success('Login berhasil! Selamat datang di UrTree');
      onSuccess();
    } catch (error) {
      toast.error('Login gagal. Periksa email dan password Anda.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerName || !registerEmail || !registerPassword || !confirmPassword) {
      toast.error('Semua field harus diisi');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerEmail)) {
      toast.error('Format email tidak valid');
      return;
    }

    // Password validation
    if (registerPassword.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    if (registerPassword !== confirmPassword) {
      toast.error('Password dan konfirmasi password tidak sama');
      return;
    }

    try {
      await register(registerEmail, registerPassword, registerName);
      toast.success('Registrasi berhasil! Selamat datang di UrTree');
      onSuccess();
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        toast.error('Email sudah terdaftar. Silakan login.');
      } else {
        toast.error('Registrasi gagal. Silakan coba lagi.');
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await loginWithGoogle();
      
      // Show success message
      if (result?.message) {
        toast.success('🎉 ' + result.message);
      } else {
        toast.success('✅ Login dengan Google berhasil!');
      }
      
      // Add info toast about mock implementation
      setTimeout(() => {
        toast.info('💡 Tip: Ini adalah demo mode. Lihat GOOGLE_OAUTH_SETUP.md untuk production setup.', {
          duration: 5000
        });
      }, 1500);
      
      onSuccess();
    } catch (error: any) {
      console.error('Google login error:', error);
      
      // Show more helpful error message
      if (error.message?.includes('configuration')) {
        toast.error('⚙️ Google OAuth belum dikonfigurasi. Menggunakan demo mode...');
      } else {
        toast.error('❌ Login dengan Google gagal. Silakan coba lagi.');
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image (3/4 width) */}
      <div 
        className="hidden lg:block lg:w-3/4 relative bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1630308058351-fd4bc4314931?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHBsYW50cyUyMG5hdHVyZXxlbnwxfHx8fDE3NjE2Njg0MTl8MA&ixlib=rb-4.1.0&q=80&w=1080')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 via-green-800/20 to-green-900/40" />
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="absolute top-6 left-6 text-white hover:bg-white/20 backdrop-blur-sm border border-white/30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke landing page
          </Button>
        )}
        
        {/* Overlay Content */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-2xl text-center text-white">
            <h1 className="text-5xl mb-6 drop-shadow-lg">
              Selamat Datang di UrTree
            </h1>
            <p className="text-xl text-green-50 drop-shadow-md leading-relaxed">
              Marketplace terpercaya untuk tanaman hidup, benih, dan peralatan berkebun.
              Bergabunglah dengan ribuan pencinta tanaman di Indonesia!
            </p>
            <div className="mt-12 grid grid-cols-3 gap-8">
              <div className="backdrop-blur-md bg-white/10 p-6 rounded-xl border border-white/20">
                <div className="text-4xl mb-3">🌱</div>
                <div className="text-lg">Tanaman Berkualitas</div>
              </div>
              <div className="backdrop-blur-md bg-white/10 p-6 rounded-xl border border-white/20">
                <div className="text-4xl mb-3">📦</div>
                <div className="text-lg">Pengiriman Aman</div>
              </div>
              <div className="backdrop-blur-md bg-white/10 p-6 rounded-xl border border-white/20">
                <div className="text-4xl mb-3">⭐</div>
                <div className="text-lg">Terpercaya</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form (1/4 width) */}
      <div className="w-full lg:w-1/4 flex items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-green-900 relative">
        {/* Back button for mobile */}
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="lg:hidden absolute top-6 left-6 text-white hover:bg-white/10 border border-white/30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        )}

        <div className="w-full max-w-sm px-8 py-12">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/10 border border-white/20">
              <TabsTrigger 
                value="login"
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-green-100"
              >
                Login
              </TabsTrigger>
              <TabsTrigger 
                value="register"
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-green-100"
              >
                Sign up
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-5">
              <div>
                <h1 className="text-white text-xl mb-1">Nice to see you again</h1>
                <p className="text-green-200 text-xs">Login to continue</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-white text-sm">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="nama@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="h-11 bg-white/95 border-0 text-gray-900 placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-white text-sm">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      placeholder="••••••••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="h-11 bg-white/95 border-0 text-gray-900 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showLoginPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="border-white/50 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    <label
                      htmlFor="remember"
                      className="text-xs text-white cursor-pointer"
                    >
                      Remember me
                    </label>
                  </div>
                  <a href="#" className="text-xs text-green-200 hover:text-white transition-colors">
                    Forgot password?
                  </a>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-green-600 hover:bg-green-700 text-white shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Sign in'}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-green-900 px-2 text-green-200">Or continue with</span>
                </div>
              </div>

              {/* Google Sign In Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 bg-white hover:bg-gray-50 text-gray-900 border-0 shadow-lg"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </Button>

              <div className="text-center">
                <p className="text-xs text-green-200">
                  Don't have an account?{' '}
                  <button
                    onClick={() => setActiveTab('register')}
                    className="text-white hover:text-green-200 transition-colors underline"
                  >
                    Sign up now
                  </button>
                </p>
              </div>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register" className="space-y-5">
              <div>
                <h1 className="text-white text-xl mb-1">Welcome to UrTree</h1>
                <p className="text-green-200 text-xs">Create your account</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-white text-sm">Nama Lengkap</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="John Doe"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="h-11 bg-white/95 border-0 text-gray-900 placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-white text-sm">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="nama@email.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="h-11 bg-white/95 border-0 text-gray-900 placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-white text-sm">Password</Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showRegisterPassword ? 'text' : 'password'}
                      placeholder="Minimal 6 karakter"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="h-11 bg-white/95 border-0 text-gray-900 placeholder:text-gray-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showRegisterPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-white text-sm">Konfirmasi Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Ulangi password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-11 bg-white/95 border-0 text-gray-900 placeholder:text-gray-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-green-600 hover:bg-green-700 text-white shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Sign up'}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-green-900 px-2 text-green-200">Or continue with</span>
                </div>
              </div>

              {/* Google Sign In Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 bg-white hover:bg-gray-50 text-gray-900 border-0 shadow-lg"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign up with Google
              </Button>

              <div className="text-center">
                <p className="text-xs text-green-200">
                  Already have an account?{' '}
                  <button
                    onClick={() => setActiveTab('login')}
                    className="text-white hover:text-green-200 transition-colors underline"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
