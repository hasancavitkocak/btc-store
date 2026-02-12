'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useStore } from '../../store/useStore';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Toast from '../../components/Toast';

interface UserFormProps {
  userId?: string;
}

export default function UserForm({ userId }: UserFormProps) {
  const router = useRouter();
  const { users, roles, addUser, updateUser } = useAuthStore();
  const { products, updateProduct } = useStore();
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const isEditing = !!userId;
  const user = isEditing ? users.find(u => u.id === userId) : null;

  const getUserProducts = (uid: string) => {
    return products.filter(p => p.responsibleUserId === uid).map(p => p.id);
  };

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    roleId: roles[0]?.id || '',
    assignedProducts: [] as string[]
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        password: user.password,
        email: user.email,
        roleId: user.roleId,
        assignedProducts: getUserProducts(user.id)
      });
    }
  }, [user]);

  const handleSave = () => {
    if (!formData.username || !formData.password || !formData.email) {
      setToast({ message: 'Lütfen tüm alanları doldurun!', type: 'error' });
      return;
    }

    const userData = {
      username: formData.username,
      password: formData.password,
      email: formData.email,
      roleId: formData.roleId
    };

    if (isEditing && userId) {
      updateUser(userId, userData);
      
      // Ürün atamalarını güncelle
      products.forEach(product => {
        if (product.responsibleUserId === userId) {
          updateProduct(product.id, { responsibleUserId: undefined });
        }
      });
      
      formData.assignedProducts.forEach(productId => {
        updateProduct(productId, { responsibleUserId: userId });
      });
      
      setToast({ message: 'Kullanıcı güncellendi!', type: 'success' });
    } else {
      addUser(userData);
      setToast({ message: 'Kullanıcı eklendi!', type: 'success' });
    }

    setTimeout(() => {
      router.push('/admin/users');
    }, 1000);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => router.push('/admin/users')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri
        </Button>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {isEditing ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
        </h1>
      </div>

      <div className="max-w-4xl space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Kullanıcı Bilgileri</h2>
          <div className="space-y-4">
            <Input
              label="Kullanıcı Adı"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              placeholder="admin"
              required
            />
            
            <Input
              label="E-posta"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="user@example.com"
              required
            />

            <Input
              label="Şifre"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="••••••"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol
              </label>
              <select
                value={formData.roleId}
                onChange={(e) => setFormData({...formData, roleId: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Ürün Sorumlulukları</h2>
          <p className="text-sm text-gray-600 mb-4">
            Bu kullanıcının sorumlu olacağı ürünleri seçin. Seçilen ürünler için form bildirimleri bu kullanıcıya gönderilecek.
          </p>
          <div className="border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto space-y-2">
            {products.map((product) => (
              <label
                key={product.id}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.assignedProducts.includes(product.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        assignedProducts: [...formData.assignedProducts, product.id]
                      });
                    } else {
                      setFormData({
                        ...formData,
                        assignedProducts: formData.assignedProducts.filter(id => id !== product.id)
                      });
                    }
                  }}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{product.nameKey}</p>
                  <p className="text-sm text-gray-500">{product.shortDescKey}</p>
                </div>
              </label>
            ))}
            {products.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">Henüz ürün yok</p>
            )}
          </div>
          <p className="mt-3 text-sm text-gray-600">
            {formData.assignedProducts.length} ürün seçildi
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex gap-3">
            <Button onClick={handleSave} fullWidth className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Kaydet
            </Button>
            <Button variant="outline" onClick={() => router.push('/admin/users')} fullWidth>
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
