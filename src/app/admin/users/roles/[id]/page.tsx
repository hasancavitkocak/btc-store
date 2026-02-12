import RoleForm from '@/views/admin/RoleForm';

export default function EditRolePage({ params }: { params: { id: string } }) {
  return <RoleForm roleId={params.id} />;
}
