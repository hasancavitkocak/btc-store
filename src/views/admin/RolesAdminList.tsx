'use client';

import { useRouter } from 'next/navigation';
import { Trash2, Edit2, Plus, Shield } from 'lucide-react';
import { useAuthStore, Permission } from '../../store/useAuthStore';
import Button from '../../components/Button';
import Card from '../../components/Card';

const allPermissions: { key: Permission; label: string }[] = [
  { key: 'view_dashboard', label: 'Dashboard Görüntüleme' },
  { key: 'manage_banners', label: 'Banner Yönetimi' },
  { key: 'manage_categories', label: 'Kategori Yönetimi' },
  { key: 'manage_products', label: 'Ürün Yönetimi' },
  { key: 'manage_references', label: 'Referans Yönetimi' },
  { key: 'manage_stories', label: 'Hikaye Yönetimi' },
  { key: 'manage_header', label: 'Header Yönetimi' },
  { key: 'manage_kvkk', label: 'KVKK Yönetimi' },
  { key: 'view_forms', label: 'Form Görüntüleme' },
  { key: 'manage_users', label: 'Kullanıcı Yönetimi' },
  { key: 'view_documents', label: 'Doküman Görüntüleme' },
  { key: 'manage_documents', label: 'Doküman Yönetimi' }
];

export default function RolesAdminList() {
  const router = useRouter();
  const { roles, users, deleteRole } = useAuthStore();

  const handleDelete = (id: string) => {
    const usersWithRole = users.filter(u => u.roleId === id);
    if (usersWithRole.length > 0) {
      alert('Bu role atanmış kullanıcılar var. Önce kullanıcıları başka bir role atayın.');
      return;
    }
    if (confirm('Bu rolü silmek istediğinizden emin misiniz?')) {
      deleteRole(id);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Roller
          </h1>
          <p className="text-gray-600">Rolleri ve yetkilerini yönetin</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/users')}
            className="flex items-center gap-2"
          >
            Kullanıcılara Dön
          </Button>
          <Button
            onClick={() => router.push('/admin/users/roles/new')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Yeni Rol
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => {
          const usersCount = users.filter(u => u.roleId === role.id).length;
          
          return (
            <Card key={role.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                    <p className="text-sm text-gray-500">{usersCount} kullanıcı</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/admin/users/roles/${role.id}`)}
                    className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(role.id)}
                    className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600 font-medium">Yetkiler:</p>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {allPermissions.find(p => p.key === perm)?.label || perm}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {roles.length === 0 && (
        <Card className="p-12 text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Henüz rol eklenmemiş</p>
          <Button onClick={() => router.push('/admin/users/roles/new')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            İlk Rolü Ekle
          </Button>
        </Card>
      )}
    </div>
  );
}
