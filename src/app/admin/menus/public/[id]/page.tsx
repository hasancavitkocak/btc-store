import MenuForm from '@/views/admin/MenuForm';

export default function EditPublicMenuPage({ params }: { params: { id: string } }) {
  return <MenuForm menuId={params.id} menuType="PUBLIC" />;
}
