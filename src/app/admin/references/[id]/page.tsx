'use client';

import ReferenceForm from '@/views/admin/ReferenceForm';
import { useParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function EditReferencePage() {
  const params = useParams();
  const referenceId = params.id as string;
  
  return <ReferenceForm referenceId={referenceId} />;
}
