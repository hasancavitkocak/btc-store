import UserFormNew from '@/views/admin/UserFormNew';

export default function EditUserPage({ params }: { params: { id: string } }) {
  return <UserFormNew userId={params.id} />;
}
