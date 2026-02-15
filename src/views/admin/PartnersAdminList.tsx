'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/ConfirmDialog';
import ImageLightbox from '../../components/ImageLightbox';
import { searchService, SearchFormData } from '../../services/search.service';
import { partnerService } from '../../services/admin.service';

interface Partner {
  code: string;
  name: string;
  logo?: string;
  media?: { absolutePath: string };
  order: number;
  active: boolean;
  showOnHome: boolean;
}

export default function PartnersAdminList() {
  const router = useRouter();
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
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
      loadPartners();
    }
  }, [page, mounted]);

  const loadPartners = async () => {
    try {
      setLoading(true);
      
      const searchFormData: SearchFormData = {
        filters: [],
        sort: { name: 'order', direction: 'ASC' }
      };

      const response = await searchService.search<Partner>('partner', searchFormData, page);
      
      if (response.status === 'SUCCESS' && response.data) {
        const pageData = (response.data as any).data;
        
        if (pageData && pageData.content) {
          setPartners(pageData.content || []);
          setTotalPages(pageData.totalPages || 0);
          setTotalElements(pageData.totalElements || 0);
        } else {
          console.error('pageData structure is wrong:', pageData);
          setToast({ message: 'Veri formatı hatalı', type: 'error' });
        }
      } else {
        setToast({ 
          message: response.errorMessage || 'Partner listesi yüklenirken hata oluştu', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error loading partners:', error);
      setToast({ message: 'Partner listesi yüklenirken hata oluştu', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (code: string) => {
    try {
      const response = await partnerService.delete(code);
      
      if (response.status === 'SUCCESS') {
        setToast({ message: 'Partner silindi', type: 'success' });
        setPage(1);
        if (page === 1) {
          loadPartners();
        }
      } else {
        setToast({ message: response.errorMessage || 'Silme işlemi başarısız', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting partner:', error);
      setToast({ message: 'Partner silinirken hata oluştu', type: 'error' });
    }
  };

  const getImageUrl = (partner: Partner) => {
    return partner.media?.absolutePath || partner.logo || '/no-image.svg';
  };

  // 20 kartlık grid için boş kartlar ekle
  const getDisplayPartners = () => {
    const itemsPerPage = 20;
    const currentCount = partners.length;
    
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
      return [...partners, ...emptyCards];
    }
    
    return partners;
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Partnerler
          </h1>
          <p className="text-gray-600">Toplam {totalElements} partner</p>
        </div>
        <Button
          onClick={() => router.push('/admin/partners/new')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Yeni Partner
        </Button>
      </div>

      {loading ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">Yükleniyor...</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {getDisplayPartners().map((partner: any) => {
              if (partner.isEmpty) {
                return (
                  <div key={partner.code} style={{ visibility: 'hidden' }}>
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

              return (
                <Card key={partner.code} className="p-6 hover:shadow-lg transition-shadow relative">
                  {partner.showOnHome && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      Ana Sayfa
                    </div>
                  )}
                  {!partner.active && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                      Pasif
                    </div>
                  )}
                  <div 
                    className="flex items-center justify-center h-24 mb-4 bg-gray-50 rounded cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      const imageUrl = getImageUrl(partner);
                      if (imageUrl !== '/no-image.svg') {
                        setLightbox({
                          isOpen: true,
                          imageUrl,
                          alt: partner.name
                        });
                      }
                    }}
                  >
                    <img
                      src={getImageUrl(partner)}
                      alt={partner.name}
                      className="max-w-full max-h-full object-contain p-2"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.src = '/no-image.svg';
                      }}
                    />
                  </div>
                  <p className="text-center text-sm text-gray-600 mb-3 truncate">{partner.name}</p>
                  <div className="text-center text-xs text-gray-400 mb-3">Sıra: {partner.order}</div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/partners/${partner.code}`)}
                      className="flex-1 flex items-center justify-center border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteDialog({ 
                        isOpen: true, 
                        code: partner.code, 
                        name: partner.name 
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

          {partners.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-gray-500 mb-4">Henüz partner eklenmemiş</p>
              <Button onClick={() => router.push('/admin/partners/new')} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                İlk Partner'ı Ekle
              </Button>
            </Card>
          )}

          {totalPages > 1 && (
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
                  Sayfa <span className="font-medium">{page}</span> / <span className="font-medium">{totalPages}</span>
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
        title="Partner Sil"
        message={`"${deleteDialog.name}" partner'ını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        cancelText="İptal"
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
