'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/ConfirmDialog';
import { searchService, SearchFormData } from '../../services/search.service';
import { userService } from '../../services/admin.service';

interface User {
  code: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  active: boolean;
  deleted: boolean;
  userGroups?: Array<{ code: string; description?: { tr?: string; en?: string } }>;
}

export default function UsersAdmin() {
  const router = useRouter();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; code: string; username: string }>({
    isOpen: false,
    code: '',
    username: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadUsers();
    }
  }, [page, mounted]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      const searchFormData: SearchFormData = {
        filters: [],
        sort: { name: 'username', direction: 'ASC' }
      };

      const response = await searchService.search<User>('user', searchFormData, page);
      
      if (response.status === 'SUCCESS' && response.data) {
        const pageData = (response.data as any).data;
        
        if (pageData && pageData.content) {
          setUsers(pageData.content || []);
          setTotalPages(pageData.totalPages || 0);
          setTotalElements(pageData.totalElements || 0);
        } else {
          console.error('pageData structure is wrong:', pageData);
          setToast({ message: 'Veri formatı hatalı', type: 'error' });
        }
      } else {
        setToast({ 
          message: response.errorMessage || 'Kullanıcı listesi yüklenirken hata oluştu', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setToast({ message: 'Kullanıcı listesi yüklenirken hata oluştu', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (code: string) => {
    try {
      const response = await userService.delete(code);
      
      if (response.status === 'SUCCESS') {
        setToast({ message: 'Kullanıcı silindi', type: 'success' });
        setPage(1);
        if (page === 1) {
          loadUsers();
        }
      } else {
        setToast({ message: response.errorMessage || 'Silme işlemi başarısız', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setToast({ message: 'Kullanıcı silinirken hata oluştu', type: 'error' });
    }
  };

  return (
    <Section>
      <Container>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Kullanıcılar
            </h1>
            <p className="text-gray-600">Toplam {totalElements} kullanıcı</p>
          </div>
          <Button onClick={() => router.push('/admin/users/new')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-5 h-5 mr-2" />
            Yeni Kullanıcı
          </Button>
        </div>

        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500">Yükleniyor...</p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4">
              {users.map((user) => (
                <Card key={user.code} className="p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">👤</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{user.username}</h3>
                        {!user.active && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            Pasif
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">
                        {user.firstName} {user.lastName}
                      </p>
                      {(user.email || user.phoneNumber) && (
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          {user.email && (
                            <span className="flex items-center gap-1">
                              📧 {user.email}
                            </span>
                          )}
                          {user.phoneNumber && (
                            <span className="flex items-center gap-1">
                              📱 {user.phoneNumber}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`text-xs px-2 py-1 rounded ${user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {user.active ? 'Aktif' : 'Pasif'}
                        </span>
                        {user.userGroups && user.userGroups.length > 0 && (
                          user.userGroups.map((ug, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                              {ug.description?.tr || ug.description?.en || ug.code || 'Grup'}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/users/${user.code}`)}
                        className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteDialog({ 
                          isOpen: true, 
                          code: user.code, 
                          username: user.username 
                        })}
                        className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {users.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-gray-500 mb-4">Henüz kullanıcı eklenmemiş</p>
                <Button onClick={() => router.push('/admin/users/new')} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  İlk Kullanıcıyı Ekle
                </Button>
              </Card>
            )}

            {totalElements > 0 && (
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
                    disabled={page === totalPages || loading}
                  >
                    Sonraki
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
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
          onClose={() => setDeleteDialog({ isOpen: false, code: '', username: '' })}
          onConfirm={() => handleDelete(deleteDialog.code)}
          title="Kullanıcı Sil"
          message={`"${deleteDialog.username}" kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
          confirmText="Sil"
          cancelText="İptal"
          type="danger"
        />
      </Container>
    </Section>
  );
}
