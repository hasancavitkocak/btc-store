import ProductDetail from '@/pages/ProductDetail';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Product Details - Btc Store',
  description: 'View product details and specifications',
};

export default function ProductDetailPage() {
  return <ProductDetail />;
}
