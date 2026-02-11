'use client';

import Home from '@/views/Home';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  console.log('HomePage render ediliyor');
  return <Home />;
}
