'use client';

import DocumentForm from '@/views/admin/DocumentForm';
import { useParams } from 'next/navigation';

export default function EditDocumentPage() {
  const params = useParams();
  const documentId = params.code as string;
  
  return <DocumentForm documentId={documentId} />;
}
