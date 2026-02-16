'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/useAuthStore';
import Container from '../components/Container';
import Section from '../components/Section';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Toast from '../components/Toast';

export default function AsmLogin() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = login(username, password);
      
      if (success) {
        setToast({ message: 'Giriş başarılı! Yönlendiriliyorsunuz...', type: 'success' });
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        setToast({ message: 'Kullanıcı adı veya şifre hatalı!', type: 'error' });
        setLoading(false);
      }
    } catch (error) {
      setToast({ message: 'Bir hata oluştu!', type: 'error' });
      setLoading(false);
    }
  };

  return (
    <Section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <Container>
        <div className="max-w-md mx-auto">
          <Card className="p-8">
            <div className="text-center mb-8">
              <img 
                src="/btc-store-logo.png" 
                alt="BTC Store" 
                className="h-16 w-auto mx-auto mb-4"
              />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Temsilci Girişi
              </h1>
              <p className="text-gray-600">
                Ürün dokümanlarına erişmek için giriş yapın
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <Input
                label="Kullanıcı Adı"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Kullanıcı adınızı girin"
                required
              />

              <Input
                label="Şifre"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifrenizi girin"
                required
              />

              <Button
                type="submit"
                fullWidth
                disabled={loading}
                className="bg-blue-900 hover:bg-blue-800"
              >
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900 font-medium mb-2">Demo Hesap:</p>
              <p className="text-sm text-blue-800">Kullanıcı Adı: <span className="font-mono">temsilci1</span></p>
              <p className="text-sm text-blue-800">Şifre: <span className="font-mono">demo123</span></p>
            </div>
          </Card>
        </div>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </Container>
    </Section>
  );
}
