import Products from '@/pages/Products';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Products - Btc Store',
  description: 'Browse our business software products',
};

export default function ProductsPage() {
  return <Products />;
}
