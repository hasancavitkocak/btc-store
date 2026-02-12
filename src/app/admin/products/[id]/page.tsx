'use client';

import ProductForm from '@/views/admin/ProductForm';
import { useParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;
  
  return <ProductForm productId={productId} />;
}
