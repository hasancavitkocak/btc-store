import ProductContact from '@/pages/ProductContact';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - Btc Store',
  description: 'Get in touch about our products',
};

export default function ProductContactPage() {
  return <ProductContact />;
}
