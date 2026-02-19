'use client';

import AdminLayout from '@/layouts/AdminLayout';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCookie } from '@/lib/cookies';

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, initializeAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);

  // Auth'u initialize et
  useEffect(() => {
    const init = async () => {
      await initializeAuth();
      setIsInitialized(true);
    };
    init();
  }, [initializeAuth]);

  // Token kontrolü ve redirect - pathname veya auth state değiştiğinde
  useEffect(() => {
    if (!isInitialized) return;
    
    // Login sayfasındaysa kontrol yapma
    if (pathname === '/admin/login') return;

    const hasToken = getCookie('accessToken');
    
    // Token yoksa ve authenticated değilse login'e yönlendir
    if (!hasToken && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isInitialized, pathname, isAuthenticated, router]);

  // Login sayfası için özel durum - layout olmadan göster
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Initialize edilmeden hiçbir şey gösterme
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  // Token kontrolü
  const hasToken = getCookie('accessToken');
  
  // Token yoksa ve authenticated değilse loading göster (redirect zaten yapılıyor)
  if (!hasToken && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Yönlendiriliyor...</div>
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}
