import AdminLayout from '@/layouts/AdminLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Panel - Btc Store',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
