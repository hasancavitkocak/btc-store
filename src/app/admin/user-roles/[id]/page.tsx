'use client';

import UserRoleForm from '@/views/admin/UserRoleForm';

export default function EditUserRolePage({ params }: { params: { id: string } }) {
  return <UserRoleForm id={params.id} />;
}
