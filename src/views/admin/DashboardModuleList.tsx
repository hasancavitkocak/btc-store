'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Edit2, Plus, LayoutDashboard, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Toast from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import { searchService, SearchFormData } from '@/services/search.service';
import { dashboardService } from '@/services/admin.service';

interface DashboardModule {
  id: number;
  code: string;
  name: {
    tr?: string;
    en?: string;
  };
  description?: {
    tr?: string;
    en?: string;
  };
  link: string;
  icon: string;
  displayOrder: number;
  active: boolean;
  showCount: boolean;
  moduleType: string;
  userGroups?: Array<{
    code: string;
    description?: {
      tr?: string;
      en?: string;
    };
  }>;
  createdDate?: string;
}

export default function DashboardModuleList() {
  const router = useRouter();
  const [modules, setModules] = useState<DashboardModule[]>([]);
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
      loadModules();
    }
  }, [page, mounted]);

  const loadModules = async () => {
    try {
      setLoading(true);
      
      const searchFormData: SearchFormData = {
        filters: [],
        sort: { name: 'displayOrder', direction: 'ASC' }
      };

      const response = await searchService.search<DashboardModule>('DashboardModuleModel', searchFormData, page);
      
      if (response.status === 'SUCCESS' && response.data) {
        const pageData = (response.data as any).data;
        
        if (pageData && pageData.content) {
          setModules(pageData.content || []);
          setTotalPages(pageData.totalPages || 0);
          setTotalElements(pageData.totalElements || 0);
        } else {
          console.error('pageData structure is wrong:', pageData);
          setToast({ message: 'Veri formatı hatalı', type: 'error' });
        }
      } else {
        setToast({ 
          message: response.errorMessage || 'Modüller yüklenirken hata oluştu', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error loading modules:', error);
      setToast({ message: 'Modüller yüklenirken hata oluştu', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (code: string) => {
    try {
      await dashboardService.delete(code);
      setToast({ message: 'Modül silindi', type: 'success' });
      setPage(1);
      if (page === 1) {
        loadModules();
      }
    } catch (error) {
      console.error('Error deleting module:', error);
      setToast({ message: 'Modül silinirken bir hata oluştu.', type: 'error' });
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
            Dashboard Modül Yönetimi
          </h1>
          <p className="text-gray-600">Toplam {totalElements} modül</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2"
          >
            Dashboard'a Dön
          </Button>
          <Button
            onClick={() => router.push('/admin/dashboard-modules/new')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Yeni Modül
          </Button>
        </div>
      </div>

      {loading ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">Yükleniyor...</p>
        </Card>
      ) : modules.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <LayoutDashboard className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <p className="text-gray-900 font-medium mb-1">Henüz modül eklenmemiş</p>
              <p className="text-gray-500 text-sm mb-4">İlk modülü ekleyerek başlayın</p>
            </div>
            <Button onClick={() => router.push('/admin/dashboard-modules/new')} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              İlk Modülü Ekle
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
                      Modül
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Tip
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Link
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Yetkili Gruplar
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Sıra
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {modules.map((module, index) => {
                    const moduleName = module.name?.tr || module.name?.en || module.code;
                    const moduleDesc = module.description?.tr || module.description?.en || '';
                    const groupNames = module.userGroups?.map(g => g.description?.tr || g.code).join(', ') || 'Herkese Açık';
                    
                    return (
                      <tr 
                        key={module.id} 
                        className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${
                              module.moduleType === 'CARD' 
                                ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                                : 'bg-gradient-to-br from-green-500 to-green-600'
                            }`}>
                              <LayoutDashboard className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{moduleName}</div>
                              {moduleDesc && (
                                <div className="text-xs text-gray-500">{moduleDesc}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            module.moduleType === 'CARD' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {module.moduleType === 'CARD' ? 'Kart' : 'Hızlı İşlem'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 font-mono">{module.link}</div>
                          <div className="text-xs text-gray-400">Icon: {module.icon}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">{groupNames}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            module.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {module.active ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm font-medium text-gray-900">{module.displayOrder}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => router.push(`/admin/dashboard-modules/${module.code}`)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors"
                              title="Düzenle"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteDialog({ isOpen: true, code: module.code })}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
        title="Modül Sil"
        message={`"${deleteDialog.code}" modülünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        cancelText="İptal"
        type="danger"
      />
    </div>
  );
}
