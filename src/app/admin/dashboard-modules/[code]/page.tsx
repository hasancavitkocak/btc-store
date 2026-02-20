'use client';

import DashboardModuleForm from '@/views/admin/DashboardModuleForm';

export const dynamic = 'force-dynamic';

export default function DashboardModuleEditPage({ params }: { params: { code: string } }) {
  return <DashboardModuleForm code={params.code} />;
}
