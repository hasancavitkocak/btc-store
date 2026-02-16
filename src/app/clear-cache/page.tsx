'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearCachePage() {
  const router = useRouter();

  useEffect(() => {
    // LocalStorage'ı temizle
    if (typeof window !== 'undefined') {
      localStorage.clear();
      console.log('Cache cleared!');
      
      // Ana sayfaya yönlendir
      setTimeout(() => {
        router.push('/');
      }, 1000);
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Cache Temizleniyor...</h1>
        <p className="text-gray-600">Ana sayfaya yönlendiriliyorsunuz...</p>
      </div>
    </div>
  );
}
