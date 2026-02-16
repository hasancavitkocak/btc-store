import ParameterForm from '@/views/admin/ParameterForm';

interface PageProps {
  params: {
    code: string;
  };
}

export default function EditParameterPage({ params }: PageProps) {
  return <ParameterForm parameterId={params.code} />;
}
