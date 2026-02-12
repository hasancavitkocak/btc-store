'use client';

import AdminLayout from '@/layouts/AdminLayout';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Allow access to login page without authentication
    if (pathname === '/admin/login') {
      if (isAuthenticated) {
        router.push('/admin');
      }
      return;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, router, pathname]);

  // Show login page without layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Show loading or nothing while checking authentication
  if (!isAuthenticated) {
    return null;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
