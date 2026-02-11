import PublicLayout from '@/layouts/PublicLayout';

export default function PublicLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicLayout>{children}</PublicLayout>;
}
