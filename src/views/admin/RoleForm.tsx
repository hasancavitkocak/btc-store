'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, ArrowLeft } from 'lucide-react';
import { useAuthStore, Permission } from '../../store/useAuthStore';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Toast from '../../components/Toast';

const allPermissions: { key: Permission; label: string; description: string }[] = [
  { key: 'view_dashboard', label: 'Dashboard Görüntüleme', description: 'Ana kontrol panelini görüntüleme' },
  { key: 'manage_banners', label: 'Banner Yönetimi', description: 'Banner ekleme, düzenleme ve silme' },
  { key: 'manage_categories', label: 'Kategori Yönetimi', description: 'Kategori ekleme, düzenleme ve silme' },
  { key: 'manage_products', label: 'Ürün Yönetimi', description: 'Ürün ekleme, düzenleme ve silme' },
  { key: 'manage_references', label: 'Referans Yönetimi', description: 'Referans ekleme, düzenleme ve silme' },
  { key: 'manage_stories', label: 'Hikaye Yönetimi', description: 'Başarı hikayesi ekleme, düzenleme ve silme' },
  { key: 'manage_header', label: 'Header Yönetimi', description: 'Site başlığı ve logo yönetimi' },
  { key: 'manage_kvkk', label: 'KVKK Yönetimi', description: 'KVKK metni düzenleme' },
  { key: 'view_forms', label: 'Form Görüntüleme', description: 'Gelen form başvurularını görüntüleme' },
  { key: 'manage_users', label: 'Kullanıcı Yönetimi', description: 'Kullanıcı ve rol yönetimi' },
  { key: 'view_documents', label: 'Doküman Görüntüleme', description: 'Dokümanları görüntüleme ve indirme' },
  { key: 'manage_documents', label: 'Doküman Yönetimi', description: 'Doküman ekleme, düzenleme ve silme' }
];

interface RoleFormProps {
  roleId?: string;
}

export default function RoleForm({ roleId }: RoleFormProps) {
  const router = useRouter();
  const { roles, addRole, updateRole } = useAuthStore();
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const isEditing = !!roleId;
  const role = isEditing ? roles.find(r => r.id === roleId) : null;

  const [formData, setFormData] = useState({
    name: '',
    permissions: [] as Permission[]
  });

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        permissions: role.permissions
      });
    }
  }, [role]);

  const togglePermission = (permission: Permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const handleSave = () => {
    if (!formData.name) {
      setToast({ message: 'Lütfen rol adını girin!', type: 'error' });
      return;
    }

    if (formData.permissions.length === 0) {
      setToast({ message: 'Lütfen en az bir yetki seçin!', type: 'error' });
      return;
    }

    if (isEditing && roleId) {
      updateRole(roleId, formData);
      setToast({ message: 'Rol güncellendi!', type: 'success' });
    } else {
      addRole(formData);
      setToast({ message: 'Rol eklendi!', type: 'success' });
    }

    setTimeout(() => {
      router.push('/admin/users/roles');
    }, 1000);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => router.push('/admin/users/roles')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri
        </Button>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {isEditing ? 'Rol Düzenle' : 'Yeni Rol'}
        </h1>
      </div>

      <div className="max-w-4xl space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Rol Bilgileri</h2>
          <Input
            label="Rol Adı"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Satış Temsilcisi, Editör, vb."
            required
          />
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Yetkiler</h2>
          <p className="text-sm text-gray-600 mb-4">
            Bu role sahip kullanıcıların erişebileceği özellikleri seçin.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allPermissions.map((perm) => (
              <label
                key={perm.key}
                className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={formData.permissions.includes(perm.key)}
                  onChange={() => togglePermission(perm.key)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-0.5"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{perm.label}</p>
                  <p className="text-sm text-gray-500">{perm.description}</p>
                </div>
              </label>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-600">
            {formData.permissions.length} yetki seçildi
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex gap-3">
            <Button onClick={handleSave} fullWidth className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Kaydet
            </Button>
            <Button variant="outline" onClick={() => router.push('/admin/users/roles')} fullWidth>
              <X className="w-4 h-4 mr-2" />
              İptal
            </Button>
          </div>
        </Card>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
