import Home from '@/pages/Home';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Btc Store - Business Software Solutions',
  description: 'Professional business software solutions for your business',
};

export default function HomePage() {
  return <Home />;
}
