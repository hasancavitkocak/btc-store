'use client';

import CategoryForm from '@/views/admin/CategoryForm';
import { useParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function EditCategoryPage() {
  const params = useParams();
  const categoryId = params.id as string;
  
  return <CategoryForm categoryId={categoryId} />;
}
