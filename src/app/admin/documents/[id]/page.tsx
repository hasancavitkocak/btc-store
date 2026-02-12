import DocumentForm from '@/views/admin/DocumentForm';

export default function EditDocumentPage({ params }: { params: { id: string } }) {
  return <DocumentForm documentId={params.id} />;
}
