'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Save, X, ArrowLeft } from 'lucide-react';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Toast from '../../components/Toast';
import ImageUpload from '../../components/ImageUpload';
import ImageLightbox from '../../components/ImageLightbox';
import { bannerService } from '../../services/admin.service';

interface BannerFormProps {
  bannerId?: string;
}

export default function BannerForm({ bannerId }: BannerFormProps) {
  const t = useTranslations();
  const router = useRouter();
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [newMediaFile, setNewMediaFile] = useState<File | null>(null);
  const [shouldRemoveMedia, setShouldRemoveMedia] = useState(false);
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  const [lightbox, setLightbox] = useState<{ isOpen: boolean; imageUrl: string }>({
    isOpen: false,
    imageUrl: ''
  });
  
  const isEditing = !!bannerId;

  const toggleField = (fieldName: string) => {
    const newExpanded = new Set(expandedFields);
    if (newExpanded.has(fieldName)) {
      newExpanded.delete(fieldName);
    } else {
      newExpanded.add(fieldName);
    }
    setExpandedFields(newExpanded);
  };

  const [formData, setFormData] = useState({
    id: undefined as number | undefined,
    code: '',
    title: { tr: '', en: '', de: '', fr: '', es: '', it: '' },
    subtitle: { tr: '', en: '', de: '', fr: '', es: '', it: '' },
    buttonText: { tr: '', en: '', de: '', fr: '', es: '', it: '' },
    buttonLink: '',
    order: 0,
    active: true
  });

  useEffect(() => {
    if (bannerId) {
      loadBanner();
    }
  }, [bannerId]);

  const loadBanner = async () => {
    try {
      setLoading(true);
      const response = await bannerService.getByCode(bannerId!);
      
      if (response.status === 'SUCCESS' && response.data) {
        const bannerData = (response.data as any).data || response.data;
        
        setFormData({
          id: bannerData.id,
          code: bannerData.code,
          title: bannerData.title || { tr: '', en: '', de: '', fr: '', es: '', it: '' },
          subtitle: bannerData.subtitle || { tr: '', en: '', de: '', fr: '', es: '', it: '' },
          buttonText: bannerData.buttonText || { tr: '', en: '', de: '', fr: '', es: '', it: '' },
          buttonLink: bannerData.buttonLink || '',
          order: bannerData.order || 0,
          active: bannerData.active ?? true
        });
        
        if (bannerData.media?.absolutePath) {
          setImageFiles([bannerData.media.absolutePath]);
        }
      }
    } catch (error) {
      console.error('Error loading banner:', error);
      setToast({ message: 'Banner yüklenirken hata oluştu', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (images: string[]) => {
    setImageFiles(images);
    
    if (images.length === 0) {
      setNewMediaFile(null);
      setShouldRemoveMedia(true); // Resim kaldırıldı
    } else if (images[0].startsWith('data:')) {
      setShouldRemoveMedia(false);
      fetch(images[0])
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'banner-image.jpg', { type: 'image/jpeg' });
          setNewMediaFile(file);
        });
    } else {
      // Mevcut resim korunuyor
      setShouldRemoveMedia(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const bannerData = {
        ...(formData.id && { id: formData.id }),
        code: formData.code || undefined,
        title: formData.title,
        subtitle: formData.subtitle,
        buttonText: formData.buttonText,
        buttonLink: formData.buttonLink,
        order: formData.order,
        active: formData.active
      };

      const response = await bannerService.save(bannerData, newMediaFile || undefined, shouldRemoveMedia);

      if (response.status === 'ERROR') {
        setToast({ 
          message: response.errorMessage || 'Banner kaydedilirken hata oluştu', 
          type: 'error' 
        });
        return;
      }

      setToast({ 
        message: isEditing ? 'Banner güncellendi' : 'Banner eklendi', 
        type: 'success' 
      });

      setTimeout(() => {
        router.push('/admin/banners');
      }, 1000);
    } catch (error: any) {
      console.error('Error saving banner:', error);
      setToast({ 
        message: error.message || 'Beklenmeyen bir hata oluştu', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section>
      <Container>
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/banners')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isEditing ? t('admin.editBanner') : t('admin.addBanner')}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Banner Bilgileri</h2>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Başlık</label>
                    <button
                      type="button"
                      onClick={() => toggleField('title')}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all"
                    >
                      <span className="text-base">{expandedFields.has('title') ? '🌐' : '🌍'}</span>
                      <span>Diğer Diller</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">5</span>
                      <span className="text-gray-400">{expandedFields.has('title') ? '▼' : '▶'}</span>
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    <Input
                      placeholder="🇹🇷 Türkçe"
                      value={formData.title.tr}
                      onChange={(e) => setFormData({ ...formData, title: { ...formData.title, tr: e.target.value } })}
                    />
                    
                    {expandedFields.has('title') && (
                      <div className="space-y-3 pt-3 border-t border-gray-200">
                        <Input
                          placeholder="🇬🇧 English"
                          value={formData.title.en}
                          onChange={(e) => setFormData({ ...formData, title: { ...formData.title, en: e.target.value } })}
                        />
                        <Input
                          placeholder="🇩🇪 Deutsch"
                          value={formData.title.de}
                          onChange={(e) => setFormData({ ...formData, title: { ...formData.title, de: e.target.value } })}
                        />
                        <Input
                          placeholder="🇫🇷 Français"
                          value={formData.title.fr}
                          onChange={(e) => setFormData({ ...formData, title: { ...formData.title, fr: e.target.value } })}
                        />
                        <Input
                          placeholder="🇪🇸 Español"
                          value={formData.title.es}
                          onChange={(e) => setFormData({ ...formData, title: { ...formData.title, es: e.target.value } })}
                        />
                        <Input
                          placeholder="🇮🇹 Italiano"
                          value={formData.title.it}
                          onChange={(e) => setFormData({ ...formData, title: { ...formData.title, it: e.target.value } })}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Alt Başlık</label>
                    <button
                      type="button"
                      onClick={() => toggleField('subtitle')}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all"
                    >
                      <span className="text-base">{expandedFields.has('subtitle') ? '🌐' : '🌍'}</span>
                      <span>Diğer Diller</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">5</span>
                      <span className="text-gray-400">{expandedFields.has('subtitle') ? '▼' : '▶'}</span>
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    <Input
                      placeholder="🇹🇷 Türkçe"
                      value={formData.subtitle.tr}
                      onChange={(e) => setFormData({ ...formData, subtitle: { ...formData.subtitle, tr: e.target.value } })}
                    />
                    
                    {expandedFields.has('subtitle') && (
                      <div className="space-y-3 pt-3 border-t border-gray-200">
                        <Input
                          placeholder="🇬🇧 English"
                          value={formData.subtitle.en}
                          onChange={(e) => setFormData({ ...formData, subtitle: { ...formData.subtitle, en: e.target.value } })}
                        />
                        <Input
                          placeholder="🇩🇪 Deutsch"
                          value={formData.subtitle.de}
                          onChange={(e) => setFormData({ ...formData, subtitle: { ...formData.subtitle, de: e.target.value } })}
                        />
                        <Input
                          placeholder="🇫🇷 Français"
                          value={formData.subtitle.fr}
                          onChange={(e) => setFormData({ ...formData, subtitle: { ...formData.subtitle, fr: e.target.value } })}
                        />
                        <Input
                          placeholder="🇪🇸 Español"
                          value={formData.subtitle.es}
                          onChange={(e) => setFormData({ ...formData, subtitle: { ...formData.subtitle, es: e.target.value } })}
                        />
                        <Input
                          placeholder="🇮🇹 Italiano"
                          value={formData.subtitle.it}
                          onChange={(e) => setFormData({ ...formData, subtitle: { ...formData.subtitle, it: e.target.value } })}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Buton Metni</label>
                    <button
                      type="button"
                      onClick={() => toggleField('buttonText')}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all"
                    >
                      <span className="text-base">{expandedFields.has('buttonText') ? '🌐' : '🌍'}</span>
                      <span>Diğer Diller</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">5</span>
                      <span className="text-gray-400">{expandedFields.has('buttonText') ? '▼' : '▶'}</span>
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    <Input
                      placeholder="🇹🇷 Türkçe"
                      value={formData.buttonText.tr}
                      onChange={(e) => setFormData({ ...formData, buttonText: { ...formData.buttonText, tr: e.target.value } })}
                    />
                    
                    {expandedFields.has('buttonText') && (
                      <div className="space-y-3 pt-3 border-t border-gray-200">
                        <Input
                          placeholder="🇬🇧 English"
                          value={formData.buttonText.en}
                          onChange={(e) => setFormData({ ...formData, buttonText: { ...formData.buttonText, en: e.target.value } })}
                        />
                        <Input
                          placeholder="🇩🇪 Deutsch"
                          value={formData.buttonText.de}
                          onChange={(e) => setFormData({ ...formData, buttonText: { ...formData.buttonText, de: e.target.value } })}
                        />
                        <Input
                          placeholder="🇫🇷 Français"
                          value={formData.buttonText.fr}
                          onChange={(e) => setFormData({ ...formData, buttonText: { ...formData.buttonText, fr: e.target.value } })}
                        />
                        <Input
                          placeholder="🇪🇸 Español"
                          value={formData.buttonText.es}
                          onChange={(e) => setFormData({ ...formData, buttonText: { ...formData.buttonText, es: e.target.value } })}
                        />
                        <Input
                          placeholder="🇮🇹 Italiano"
                          value={formData.buttonText.it}
                          onChange={(e) => setFormData({ ...formData, buttonText: { ...formData.buttonText, it: e.target.value } })}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <Input
                  label="Buton Linki"
                  value={formData.buttonLink}
                  onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                  placeholder="/products"
                />
                
                <ImageUpload
                  images={imageFiles}
                  onChange={handleImageChange}
                  onImageClick={(imageUrl) => setLightbox({ isOpen: true, imageUrl })}
                  maxImages={1}
                  label="Banner Görseli"
                />
                
                <Input
                  label="Sıra"
                  type="number"
                  value={formData.order.toString()}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Durum</h2>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">
                  Aktif
                </label>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">İşlemler</h2>
              <div className="space-y-3">
                <Button 
                  onClick={handleSave} 
                  fullWidth 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/admin/banners')} 
                  fullWidth
                  disabled={loading}
                >
                  <X className="w-4 h-4 mr-2" />
                  İptal
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <ImageLightbox
          isOpen={lightbox.isOpen}
          imageUrl={lightbox.imageUrl}
          alt="Banner Görseli"
          onClose={() => setLightbox({ isOpen: false, imageUrl: '' })}
        />
      </Container>
    </Section>
  );
}
