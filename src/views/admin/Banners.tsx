'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/ConfirmDialog';
import ImageLightbox from '../../components/ImageLightbox';
import { searchService, SearchFormData } from '../../services/search.service';
import { bannerService } from '../../services/admin.service';
import { getLocalizedText, type SupportedLocale } from '../../lib/i18n-utils';

interface Banner {
  code: string;
  title: { tr: string; en: string };
  subtitle: { tr: string; en: string };
  buttonText: { tr: string; en: string };
  buttonLink: string;
  media?: { absolutePath: string };
  order: number;
  active: boolean;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showButton?: boolean;
  buttonBackgroundColor?: string;
  buttonBorderColor?: string;
  buttonTextColor?: string;
}

export default function Banners() {
  const t = useTranslations();
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; code: string; title: string }>({
    isOpen: false,
    code: '',
    title: ''
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
      loadBanners();
    }
  }, [page, mounted]);

  const loadBanners = async () => {
    try {
      setLoading(true);
      
      const searchFormData: SearchFormData = {
        filters: [],
        sort: { name: 'order', direction: 'ASC' }
      };

      const response = await searchService.search<Banner>('banner', searchFormData, page);
      
      if (response.status === 'SUCCESS' && response.data) {
        const pageData = (response.data as any).data;
        
        if (pageData && pageData.content) {
          setBanners(pageData.content || []);
          setTotalPages(pageData.totalPages || 0);
          setTotalElements(pageData.totalElements || 0);
        } else {
          console.error('pageData structure is wrong:', pageData);
          setToast({ message: t('admin.bannersPage.dataFormatError'), type: 'error' });
        }
      } else {
        setToast({ 
          message: response.errorMessage || t('admin.bannersPage.loadError'), 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error loading banners:', error);
      setToast({ message: t('admin.bannersPage.loadError'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (code: string) => {
    try {
      const response = await bannerService.delete(code);
      
      if (response.status === 'SUCCESS') {
        setToast({ message: t('admin.bannersPage.deleteSuccess'), type: 'success' });
        setPage(1);
        if (page === 1) {
          loadBanners();
        }
      } else {
        setToast({ message: response.errorMessage || t('admin.bannersPage.deleteFailed'), type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      setToast({ message: t('admin.bannersPage.deleteError'), type: 'error' });
    }
  };

  return (
    <Section>
      <Container>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t('admin.banners')}
            </h1>
            <p className="text-gray-600">{t('admin.bannersPage.totalBanners', { count: totalElements })}</p>
          </div>
          <Button onClick={() => router.push('/admin/banners/new')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-5 h-5 mr-2" />
            {t('admin.bannersPage.newBanner')}
          </Button>
        </div>

        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500">{t('admin.bannersPage.loading')}</p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4">
              {banners.map((banner) => (
                <Card key={banner.code} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4">
                    <img
                      src={banner.media?.absolutePath || '/no-image.svg'}
                      alt={getLocalizedText(banner.title, locale)}
                      className="w-32 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => banner.media?.absolutePath && setLightbox({
                        isOpen: true,
                        imageUrl: banner.media.absolutePath,
                        alt: getLocalizedText(banner.title, locale)
                      })}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{getLocalizedText(banner.title, locale)}</h3>
                      <p className="text-gray-600 text-sm">{getLocalizedText(banner.subtitle, locale)}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`text-xs px-2 py-1 rounded ${banner.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {banner.active ? t('admin.active') : t('admin.inactive')}
                        </span>
                        <span className="text-xs text-gray-500">{t('admin.order')}: {banner.order}</span>
                        {banner.showTitle !== false && (
                          <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                            📝 {t('admin.bannersPage.showTitle')}
                          </span>
                        )}
                        {banner.showSubtitle !== false && (
                          <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700">
                            📄 {t('admin.bannersPage.showSubtitle')}
                          </span>
                        )}
                        {banner.showButton !== false && (
                          <span className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700">
                            🔘 {t('admin.bannersPage.showButton')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/banners/${banner.code}`)}
                        className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteDialog({ 
                          isOpen: true, 
                          code: banner.code, 
                          title: getLocalizedText(banner.title, locale)
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

            {banners.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-gray-500 mb-4">{t('admin.bannersPage.noBanners')}</p>
                <Button onClick={() => router.push('/admin/banners/new')} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('admin.bannersPage.addFirstBanner')}
                </Button>
              </Card>
            )}

            {totalElements > 0 && (
              <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                <div className="text-sm text-gray-600">
                  {t('admin.bannersPage.totalRecords', { count: totalElements })}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {t('admin.bannersPage.previous')}
                  </Button>
                  
                  <span className="text-sm text-gray-600 px-4">
                    {t('admin.bannersPage.page')} <span className="font-medium">{page}</span> / <span className="font-medium">{totalPages || 1}</span>
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || loading}
                  >
                    {t('admin.bannersPage.next')}
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
          onClose={() => setDeleteDialog({ isOpen: false, code: '', title: '' })}
          onConfirm={() => handleDelete(deleteDialog.code)}
          title={t('admin.bannersPage.deleteDialogTitle')}
          message={t('admin.bannersPage.deleteDialogMessage', { title: deleteDialog.title })}
          confirmText={t('common.delete')}
          cancelText={t('common.cancel')}
          type="danger"
        />

        <ImageLightbox
          isOpen={lightbox.isOpen}
          imageUrl={lightbox.imageUrl}
          alt={lightbox.alt}
          onClose={() => setLightbox({ isOpen: false, imageUrl: '', alt: '' })}
        />
      </Container>
    </Section>
  );
}
