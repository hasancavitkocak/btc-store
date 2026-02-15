'use client';

import SectorForm from '@/views/admin/SectorForm';
import { useParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function EditSectorPage() {
  const params = useParams();
  const sectorId = params.id as string;
  
  return <SectorForm sectorId={sectorId} />;
}
