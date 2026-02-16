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
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydration kontrolü
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    // Allow access to login page without authentication
    if (pathname === '/admin/login') {
      if (isAuthenticated) {
        router.push('/admin');
      }
      return;
    }

    // Token var mı kontrol et
    const hasToken = getCookie('accessToken');
    
    // Token yoksa ve authenticated değilse login'e yönlendir
    if (!hasToken && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, router, pathname, isHydrated]);

  // Hydration tamamlanmadan hiçbir şey gösterme
  if (!isHydrated) {
    return null;
  }

  // Show login page without layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Token varsa içeriği göster (middleware zaten kontrol ediyor)
  const hasToken = getCookie('accessToken');
  if (!hasToken && !isAuthenticated) {
    return null;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
