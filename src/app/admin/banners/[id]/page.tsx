'use client';

import BannerForm from '@/views/admin/BannerForm';
import { useParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function EditBannerPage() {
  const params = useParams();
  const bannerId = params.id as string;
  
  return <BannerForm bannerId={bannerId} />;
}
