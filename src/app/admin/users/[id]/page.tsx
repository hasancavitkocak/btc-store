import UserForm from '@/views/admin/UserForm';

export default function EditUserPage({ params }: { params: { id: string } }) {
  return <UserForm userId={params.id} />;
}
