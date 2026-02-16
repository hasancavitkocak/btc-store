import { redirect } from 'next/navigation';

export default function MenusPage() {
  // Varsayılan olarak admin menülere yönlendir
  redirect('/admin/menus/admin');
}
