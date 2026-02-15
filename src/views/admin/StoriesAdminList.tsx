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
import ImageLightbox from '../../components/ImageLightbox';
import { searchService, SearchFormData } from '../../services/search.service';
import { storyService } from '../../services/admin.service';

interface SuccessStory {
  code: string;
  company: string;
  industry: string;
  title: { tr: string; en: string };
  htmlContent: { tr: string; en: string };
  media?: { absolutePath: string };
  videoUrl?: string;
  results: string[];
  order: number;
  active: boolean;
}

export default function StoriesAdminList() {
  const router = useRouter();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; code: string; company: string }>({
    isOpen: false,
    code: '',
    company: ''
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
      loadStories();
    }
  }, [page, mounted]);

  const loadStories = async () => {
    try {
      setLoading(true);
      
      const searchFormData: SearchFormData = {
        filters: [],
        sort: { name: 'order', direction: 'ASC' }
      };

      const response = await searchService.search<SuccessStory>('success-story', searchFormData, page);
      
      if (response.status === 'SUCCESS' && response.data) {
        const pageData = (response.data as any).data;
        
        if (pageData && pageData.content) {
          setStories(pageData.content || []);
          setTotalPages(pageData.totalPages || 0);
          setTotalElements(pageData.totalElements || 0);
        } else {
          console.error('pageData structure is wrong:', pageData);
          setToast({ message: 'Veri formatı hatalı', type: 'error' });
        }
      } else {
        setToast({ 
          message: response.errorMessage || 'Başarı hikayeleri yüklenirken hata oluştu', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error loading success stories:', error);
      setToast({ message: 'Başarı hikayeleri yüklenirken hata oluştu', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (code: string) => {
    try {
      const response = await storyService.delete(code);
      
      if (response.status === 'SUCCESS') {
        setToast({ message: 'Başarı hikayesi silindi', type: 'success' });
        setPage(1);
        if (page === 1) {
          loadStories();
        }
      } else {
        setToast({ message: response.errorMessage || 'Silme işlemi başarısız', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting success story:', error);
      setToast({ message: 'Başarı hikayesi silinirken hata oluştu', type: 'error' });
    }
  };

  return (
    <Section>
      <Container>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Başarı Hikayeleri
            </h1>
            <p className="text-gray-600">Toplam {totalElements} hikaye</p>
          </div>
          <Button onClick={() => router.push('/admin/stories/new')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-5 h-5 mr-2" />
            Yeni Hikaye
          </Button>
        </div>

        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500">Yükleniyor...</p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4">
              {stories.map((story) => (
                <Card key={story.code} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4">
                    <img
                      src={story.media?.absolutePath || (story.videoUrl ? '/video-placeholder.svg' : '/no-image.svg')}
                      alt={story.company}
                      className="w-32 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => story.media?.absolutePath && setLightbox({
                        isOpen: true,
                        imageUrl: story.media.absolutePath,
                        alt: story.company
                      })}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-blue-900 bg-blue-50 px-2 py-1 rounded">
                          {story.company}
                        </span>
                        <span className="text-xs text-gray-500">{story.industry}</span>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2">
                        {story.title.tr || story.title.en}
                      </h3>
                      
                      {story.results && story.results.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {story.results.slice(0, 3).map((result, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded">
                              {result}
                            </span>
                          ))}
                          {story.results.length > 3 && (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                              +{story.results.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded ${story.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {story.active ? 'Aktif' : 'Pasif'}
                        </span>
                        {story.videoUrl && (
                          <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700">
                            🎥 Video
                          </span>
                        )}
                        <span className="text-xs text-gray-500">Sıra: {story.order}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/stories/${story.code}`)}
                        className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteDialog({ 
                          isOpen: true, 
                          code: story.code, 
                          company: story.company
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

            {stories.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-gray-500 mb-4">Henüz başarı hikayesi eklenmemiş</p>
                <Button onClick={() => router.push('/admin/stories/new')} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  İlk Hikayeyi Ekle
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
          onClose={() => setDeleteDialog({ isOpen: false, code: '', company: '' })}
          onConfirm={() => handleDelete(deleteDialog.code)}
          title="Başarı Hikayesi Sil"
          message={`"${deleteDialog.company}" şirketinin başarı hikayesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
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
      </Container>
    </Section>
  );
}
