'use client';

import PartnerForm from '@/views/admin/PartnerForm';
import { useParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function EditPartnerPage() {
  const params = useParams();
  const partnerId = params.id as string;
  
  return <PartnerForm partnerId={partnerId} />;
}
