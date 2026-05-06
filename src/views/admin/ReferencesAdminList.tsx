'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Edit2, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/ConfirmDialog';
import ImageLightbox from '../../components/ImageLightbox';
import { searchService, SearchFormData } from '../../services/search.service';
import { referenceService } from '../../services/admin.service';

interface Reference {
  code: string;
  name: string;
  logo?: string;
  media?: { absolutePath: string };
  order: number;
  active: boolean;
  showOnHome: boolean;
}

export default function ReferencesAdminList() {
  const router = useRouter();
  const t = useTranslations();
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [references, setReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; code: string; name: string }>({
    isOpen: false,
    code: '',
    name: ''
  });
  const [lightbox, setLightbox] = useState<{ isOpen: boolean; imageUrl: string; alt: string }>({
    isOpen: false,
    imageUrl: '',
    alt: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadReferences();
    }
  }, [page, mounted]);

  const loadReferences = async () => {
    try {
      setLoading(true);
      
      const searchFormData: SearchFormData = {
        filters: [],
        sort: { name: 'order', direction: 'ASC' }
      };

      const response = await searchService.search<Reference>('store_reference', searchFormData, page);
      
      if (response.status === 'SUCCESS' && response.data) {
        const pageData = (response.data as any).data;
        
        if (pageData && pageData.content) {
          setReferences(pageData.content || []);
          setTotalPages(pageData.totalPages || 0);
          setTotalElements(pageData.totalElements || 0);
        } else {
          console.error('pageData structure is wrong:', pageData);
          setToast({ message: t('admin.referencesPage.dataFormatError'), type: 'error' });
        }
      } else {
        setToast({ 
          message: response.errorMessage || t('admin.referencesPage.loadError'), 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error loading references:', error);
      setToast({ message: t('admin.referencesPage.loadError'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (code: string) => {
    try {
      const response = await referenceService.delete(code);
      
      if (response.status === 'SUCCESS') {
        setToast({ message: t('admin.referencesPage.deleteSuccess'), type: 'success' });
        setPage(1);
        if (page === 1) {
          loadReferences();
        }
      } else {
        setToast({ message: response.errorMessage || t('admin.referencesPage.deleteFailed'), type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting reference:', error);
      setToast({ message: t('admin.referencesPage.deleteError'), type: 'error' });
    }
  };

  const getImageUrl = (ref: Reference) => {
    return ref.media?.absolutePath || ref.logo || '/no-image.svg';
  };

  // 20 kartlık grid için boş kartlar ekle
  const getDisplayReferences = () => {
    const itemsPerPage = 20;
    const currentCount = references.length;
    
    if (currentCount < itemsPerPage) {
      const emptyCount = itemsPerPage - currentCount;
      const emptyCards = Array.from({ length: emptyCount }, (_, index) => ({
        code: `empty-${index}`,
        name: '',
        logo: '',
        order: 0,
        active: false,
        showOnHome: false,
        isEmpty: true
      }));
      return [...references, ...emptyCards];
    }
    
    return references;
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('admin.referencesPage.title')}
          </h1>
          <p className="text-gray-600">{t('admin.referencesPage.totalReferences', { count: totalElements })}</p>
        </div>
        <Button
          onClick={() => router.push('/admin/references/new')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          {t('admin.referencesPage.newReference')}
        </Button>
      </div>

      {loading ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">{t('admin.referencesPage.loading')}</p>
        </Card>
      ) : references.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">{t('admin.referencesPage.noReferences')}</p>
          <Button onClick={() => router.push('/admin/references/new')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            {t('admin.referencesPage.addFirstReference')}
          </Button>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {getDisplayReferences().map((ref: any) => {
              // Boş kart
              if (ref.isEmpty) {
                return (
                  <div key={ref.code} style={{ visibility: 'hidden' }}>
                    <Card className="p-6">
                      <div className="h-24 mb-4"></div>
                      <div className="h-5 mb-3"></div>
                      <div className="h-4 mb-3"></div>
                      <div className="flex gap-2">
                        <div className="flex-1 h-8"></div>
                        <div className="h-8 w-8"></div>
                      </div>
                    </Card>
                  </div>
                );
              }

              // Gerçek kart
              return (
                <Card key={ref.code} className="p-6 hover:shadow-lg transition-shadow relative">
                  {ref.showOnHome && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      {t('admin.referencesPage.homePage')}
                    </div>
                  )}
                  {!ref.active && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                      {t('admin.referencesPage.inactive')}
                    </div>
                  )}
                  <div 
                    className="flex items-center justify-center h-24 mb-4 bg-gray-50 rounded cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      const imageUrl = getImageUrl(ref);
                      if (imageUrl !== '/no-image.svg') {
                        setLightbox({
                          isOpen: true,
                          imageUrl,
                          alt: ref.name
                        });
                      }
                    }}
                  >
                    <img
                      src={getImageUrl(ref)}
                      alt={ref.name}
                      className="max-w-full max-h-full object-contain p-2"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.src = '/no-image.svg';
                      }}
                    />
                  </div>
                  <p className="text-center text-sm text-gray-600 mb-3 truncate">{ref.name}</p>
                  <div className="text-center text-xs text-gray-400 mb-3">{t('admin.referencesPage.order')}: {ref.order}</div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/references/${ref.code}`)}
                      className="flex-1 flex items-center justify-center border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteDialog({ 
                        isOpen: true, 
                        code: ref.code, 
                        name: ref.name 
                      })}
                      className="flex items-center justify-center border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {totalElements > 0 && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="text-sm text-gray-600">
                {t('admin.referencesPage.totalRecords', { count: totalElements })}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t('admin.referencesPage.previous')}
                </Button>
                
                <span className="text-sm text-gray-600 px-4">
                  {t('admin.referencesPage.page')} <span className="font-medium">{page}</span> / <span className="font-medium">{totalPages || 1}</span>
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages || 1, p + 1))}
                  disabled={page >= (totalPages || 1) || loading}
                >
                  {t('admin.referencesPage.next')}
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
        onClose={() => setDeleteDialog({ isOpen: false, code: '', name: '' })}
        onConfirm={() => handleDelete(deleteDialog.code)}
        title={t('admin.referencesPage.deleteDialogTitle')}
        message={t('admin.referencesPage.deleteDialogMessage', { name: deleteDialog.name })}
        confirmText={t('admin.referencesPage.delete')}
        cancelText={t('admin.referencesPage.cancel')}
        type="danger"
      />

      <ImageLightbox
        isOpen={lightbox.isOpen}
        imageUrl={lightbox.imageUrl}
        alt={lightbox.alt}
        onClose={() => setLightbox({ isOpen: false, imageUrl: '', alt: '' })}
      />
    </div>
  );
}
