import UserFormNew from '@/views/admin/UserFormNew';

interface PageProps {
  params: {
    code: string;
  };
}

export default function EditUserPage({ params }: PageProps) {
  return <UserFormNew userId={params.code} />;
}
