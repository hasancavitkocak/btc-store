'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Edit2, Plus, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/ConfirmDialog';
import { searchService, SearchFormData } from '../../services/search.service';
import { userGroupService } from '../../services/admin.service';

interface UserGroup {
  id: number;
  code: string;
  description: {
    tr?: string;
    en?: string;
  };
  createdDate?: string;
}

export default function UserGroupsAdminList() {
  const router = useRouter();
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; code: string }>({
    isOpen: false,
    code: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadUserGroups();
    }
  }, [page, mounted]);

  const loadUserGroups = async () => {
    try {
      setLoading(true);
      
      const searchFormData: SearchFormData = {
        filters: [],
        sort: { name: 'code', direction: 'ASC' }
      };

      const response = await searchService.search<UserGroup>('user-group', searchFormData, page);
      
      if (response.status === 'SUCCESS' && response.data) {
        const pageData = (response.data as any).data;
        
        if (pageData && pageData.content) {
          setUserGroups(pageData.content || []);
          setTotalPages(pageData.totalPages || 0);
          setTotalElements(pageData.totalElements || 0);
        } else {
          console.error('pageData structure is wrong:', pageData);
          setToast({ message: 'Veri formatı hatalı', type: 'error' });
        }
      } else {
        setToast({ 
          message: response.errorMessage || 'Roller yüklenirken hata oluştu', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error loading user groups:', error);
      setToast({ message: 'Roller yüklenirken hata oluştu', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (code: string) => {
    try {
      const response = await userGroupService.delete(code);
      
      if (response.status === 'SUCCESS') {
        setToast({ message: 'Rol silindi', type: 'success' });
        setPage(1);
        if (page === 1) {
          loadUserGroups();
        }
      } else {
        setToast({ message: response.errorMessage || 'Silme işlemi başarısız', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting user group:', error);
      setToast({ message: 'Rol silinirken bir hata oluştu.', type: 'error' });
    }
  };

  if (loading && !mounted) {
    return (
      <div className="p-8">
        <div className="text-center">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Roller
          </h1>
          <p className="text-gray-600">Toplam {totalElements} rol</p>
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
            onClick={() => router.push('/admin/user-groups/new')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Yeni Rol
          </Button>
        </div>
      </div>

      {loading ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">Yükleniyor...</p>
        </Card>
      ) : userGroups.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <p className="text-gray-900 font-medium mb-1">Henüz rol eklenmemiş</p>
              <p className="text-gray-500 text-sm mb-4">İlk rolü ekleyerek başlayın</p>
            </div>
            <Button onClick={() => router.push('/admin/user-groups/new')} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              İlk Rolü Ekle
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Açıklama
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Oluşturulma
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {userGroups.map((group, index) => (
                    <tr 
                      key={group.id} 
                      className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{group.code}</div>
                            <div className="text-xs text-gray-500">Kullanıcı Grubu</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {group.description?.tr || group.description?.en || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-xs text-gray-500">
                          {group.createdDate ? new Date(group.createdDate).toLocaleDateString('tr-TR') : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => router.push(`/admin/user-groups/${group.code}`)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors"
                            title="Düzenle"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteDialog({ isOpen: true, code: group.code })}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
            <div className="text-sm text-gray-600">
              Toplam <span className="font-medium">{totalElements}</span> kayıt
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                <ChevronLeft className="w-4 h-4" />
                Önceki
              </Button>
              
              <span className="text-sm text-gray-600 px-4">
                Sayfa <span className="font-medium">{page}</span> / <span className="font-medium">{totalPages || 1}</span>
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
              >
                Sonraki
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, code: '' })}
        onConfirm={() => handleDelete(deleteDialog.code)}
        title="Rol Sil"
        message={`"${deleteDialog.code}" rolünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        cancelText="İptal"
        type="danger"
      />
    </div>
  );
}
