import MenuForm from '@/views/admin/MenuForm';

export default function EditAdminMenuPage({ params }: { params: { id: string } }) {
  return <MenuForm menuId={params.id} menuType="ADMIN_PANEL" />;
}
