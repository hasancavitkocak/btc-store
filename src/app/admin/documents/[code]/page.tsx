import DocumentForm from '@/views/admin/DocumentForm';

interface PageProps {
  params: {
    code: string;
  };
}

export default function EditDocumentPage({ params }: PageProps) {
  return <DocumentForm documentId={params.code} />;
}
