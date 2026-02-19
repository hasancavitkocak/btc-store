'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { usePublicAuthStore } from '@/store/usePublicAuthStore';
import Header from '../components/Header';
import Footer from '../components/Footer';
import TopBanner from '../components/TopBanner';
import AuthBanner from '../components/AuthBanner';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { isAuthenticated } = usePublicAuthStore();

  useEffect(() => {
    // /auth sayfasında bu kontrolü yapma
    if (pathname === '/auth') {
      return;
    }

    const authMode = searchParams.get('authMode') === 'true';
    console.log('Layout - AuthMode detected:', authMode);
    console.log('Layout - Is authenticated:', isAuthenticated);
    console.log('Layout - Current path:', pathname);
    
    if (authMode && !isAuthenticated) {
      const currentUrl = window.location.pathname + window.location.search;
      const redirectUrl = `/auth?returnUrl=${encodeURIComponent(currentUrl)}`;
      console.log('Layout - Redirecting to:', redirectUrl);
      window.location.href = redirectUrl;
    }
  }, [searchParams, isAuthenticated, pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <TopBanner />
      <AuthBanner />
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { initializeAuth } = usePublicAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    }>
      <LayoutContent>{children}</LayoutContent>
    </Suspense>
  );
}
