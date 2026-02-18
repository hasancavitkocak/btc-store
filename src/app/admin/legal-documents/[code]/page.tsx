import LegalDocumentForm from '@/views/admin/LegalDocumentForm';

interface PageProps {
  params: {
    code: string;
  };
}

export default function EditLegalDocumentPage({ params }: PageProps) {
  return <LegalDocumentForm documentCode={params.code} />;
}
