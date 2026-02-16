'use client';

import UserGroupForm from '@/views/admin/UserGroupForm';

export default function EditUserGroupPage({ params }: { params: { id: string } }) {
  return <UserGroupForm id={params.id} />;
}
