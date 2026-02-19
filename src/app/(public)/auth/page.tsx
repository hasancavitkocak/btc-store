'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePublicAuthStore } from '@/store/usePublicAuthStore';
import Container from '@/components/Container';
import Button from '@/components/Button';
import Input from '@/components/Input';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = usePublicAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get return URL from query params and remove authMode parameter
  const getCleanReturnUrl = () => {
    const returnUrl = searchParams.get('returnUrl') || '/';
    
    // Parse URL and remove authMode parameter
    try {
      const url = new URL(returnUrl, window.location.origin);
      url.searchParams.delete('authMode');
      return url.pathname + (url.search || '');
    } catch {
      return returnUrl;
    }
  };

  const cleanReturnUrl = getCleanReturnUrl();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = cleanReturnUrl;
    }
  }, [isAuthenticated, cleanReturnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);
      
      if (result.success) {
        // Login başarılı, geldiği sayfaya geri dön (authMode parametresi olmadan)
        window.location.href = cleanReturnUrl;
      } else {
        setError(result.error || 'Giriş başarısız');
      }
    } catch (err) {
      setError('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <Container>
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Yetkili Girişi
              </h1>
              <p className="text-gray-600">
                Özel içeriklere erişmek için giriş yapın
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kullanıcı Adı
                </label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Kullanıcı adınızı girin"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Şifrenizi girin"
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                fullWidth
                disabled={loading}
                className="bg-blue-900 hover:bg-blue-800"
              >
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </Button>
            </form>
          </div>
        </div>
      </Container>
    </div>
  );
}
