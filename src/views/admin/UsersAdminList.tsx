'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Edit2, Plus, Package, X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useStore } from '../../store/useStore';
import Button from '../../components/Button';
import Card from '../../components/Card';

export default function UsersAdminList() {
  const router = useRouter();
  const { users, roles, deleteUser } = useAuthStore();
  const { products } = useStore();
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const getUserProducts = (userId: string) => {
    return products.filter(p => p.responsibleUserId === userId);
  };

  const getRoleName = (roleId: string) => {
    return roles.find(r => r.id === roleId)?.name || 'Bilinmeyen';
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      deleteUser(id);
    }
  };

  const handleShowProducts = (user: any) => {
    setSelectedUser(user);
    setShowProductsModal(true);
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Kullanıcılar
          </h1>
          <p className="text-gray-600">Kullanıcıları yönetin ve yetkilendirin</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/users/roles')}
            className="flex items-center gap-2"
          >
            Rolleri Yönet
          </Button>
          <Button
            onClick={() => router.push('/admin/users/new')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Yeni Kullanıcı
          </Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kullanıcı Adı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  E-posta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sorumlu Ürünler
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Oluşturulma
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => {
                const userProducts = getUserProducts(user.id);
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {getRoleName(user.roleId)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {userProducts.length > 0 ? (
                        <button
                          onClick={() => handleShowProducts(user)}
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          <Package className="w-4 h-4" />
                          <span>{userProducts.length} Ürün</span>
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400 italic">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                          className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(user.id)}
                          className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {users.length === 0 && (
        <Card className="p-12 text-center mt-6">
          <p className="text-gray-500 mb-4">Henüz kullanıcı eklenmemiş</p>
          <Button onClick={() => router.push('/admin/users/new')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            İlk Kullanıcıyı Ekle
          </Button>
        </Card>
      )}

      {/* Products Modal */}
      {showProductsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {selectedUser.username} - Sorumlu Olduğu Ürünler
              </h3>
              <button onClick={() => setShowProductsModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-3">
              {getUserProducts(selectedUser.id).map((product) => (
                <div key={product.id} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  {product.images && product.images[0] && (
                    <img 
                      src={product.images[0]} 
                      alt={product.nameKey}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{product.nameKey}</p>
                    <p className="text-sm text-gray-600">{product.shortDescKey}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    product.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {product.active ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              ))}
              
              {getUserProducts(selectedUser.id).length === 0 && (
                <p className="text-center text-gray-500 py-8">Bu kullanıcıya atanmış ürün yok</p>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowProductsModal(false)}
                className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
