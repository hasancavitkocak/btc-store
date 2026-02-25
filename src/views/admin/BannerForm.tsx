'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
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
import { getLocalizedText, type SupportedLocale } from '../../lib/i18n-utils';

interface BannerFormProps {
  bannerId?: string;
}

// Dil bilgileri
const languageInfo: Record<SupportedLocale, { code: string; name: string }> = {
  tr: { code: 'TR', name: 'Türkçe' },
  en: { code: 'EN', name: 'English' },
  de: { code: 'DE', name: 'Deutsch' },
  fr: { code: 'FR', name: 'Français' },
  es: { code: 'ES', name: 'Español' },
  it: { code: 'IT', name: 'Italiano' }
};

export default function BannerForm({ bannerId }: BannerFormProps) {
  const t = useTranslations();
  const locale = useLocale() as SupportedLocale;
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

  // Kullanıcının dilini en üste, diğerlerini sıraya koy
  const getOrderedLanguages = (): SupportedLocale[] => {
    const allLanguages: SupportedLocale[] = ['tr', 'en', 'de', 'fr', 'es', 'it'];
    return [locale, ...allLanguages.filter(lang => lang !== locale)];
  };

  const orderedLanguages = getOrderedLanguages();

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
    active: true,
    showTitle: true,
    showSubtitle: true,
    showButton: true,
    buttonBackgroundColor: '#1E40AF',
    buttonBorderColor: '#1E40AF',
    buttonTextColor: '#FFFFFF'
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
          active: bannerData.active ?? true,
          showTitle: bannerData.showTitle ?? true,
          showSubtitle: bannerData.showSubtitle ?? true,
          showButton: bannerData.showButton ?? true,
          buttonBackgroundColor: bannerData.buttonBackgroundColor || '#1E40AF',
          buttonBorderColor: bannerData.buttonBorderColor || '#1E40AF',
          buttonTextColor: bannerData.buttonTextColor || '#FFFFFF'
        });
        
        if (bannerData.media?.absolutePath) {
          setImageFiles([bannerData.media.absolutePath]);
        }
      }
    } catch (error) {
      console.error('Error loading banner:', error);
      setToast({ message: t('admin.bannerForm.loadError'), type: 'error' });
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
        active: formData.active,
        showTitle: formData.showTitle,
        showSubtitle: formData.showSubtitle,
        showButton: formData.showButton,
        buttonBackgroundColor: formData.buttonBackgroundColor,
        buttonBorderColor: formData.buttonBorderColor,
        buttonTextColor: formData.buttonTextColor
      };

      const response = await bannerService.save(bannerData, newMediaFile || undefined, shouldRemoveMedia);

      if (response.status === 'ERROR') {
        setToast({ 
          message: response.errorMessage || t('admin.bannerForm.saveError'), 
          type: 'error' 
        });
        return;
      }

      setToast({ 
        message: isEditing ? t('admin.bannerForm.updateSuccess') : t('admin.bannerForm.createSuccess'), 
        type: 'success' 
      });

      setTimeout(() => {
        router.push('/admin/banners');
      }, 1000);
    } catch (error: any) {
      console.error('Error saving banner:', error);
      setToast({ 
        message: error.message || t('admin.bannerForm.unexpectedError'), 
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
              <h2 className="text-xl font-semibold mb-4">{t('admin.bannerForm.bannerInfo')}</h2>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">{t('admin.bannerForm.title')}</label>
                    <button
                      type="button"
                      onClick={() => toggleField('title')}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all"
                    >
                      <span className="text-base">{expandedFields.has('title') ? '🌐' : '🌍'}</span>
                      <span>{t('admin.bannerForm.otherLanguages')}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">5</span>
                      <span className="text-gray-400">{expandedFields.has('title') ? '▼' : '▶'}</span>
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    <Input
                      placeholder={`${languageInfo[orderedLanguages[0]].code} - ${languageInfo[orderedLanguages[0]].name}`}
                      value={formData.title[orderedLanguages[0]]}
                      onChange={(e) => setFormData({ ...formData, title: { ...formData.title, [orderedLanguages[0]]: e.target.value } })}
                    />
                    
                    {expandedFields.has('title') && (
                      <div className="space-y-3 pt-3 border-t border-gray-200">
                        {orderedLanguages.slice(1).map((lang) => (
                          <Input
                            key={lang}
                            placeholder={`${languageInfo[lang].code} - ${languageInfo[lang].name}`}
                            value={formData.title[lang]}
                            onChange={(e) => setFormData({ ...formData, title: { ...formData.title, [lang]: e.target.value } })}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">{t('admin.bannerForm.subtitle')}</label>
                    <button
                      type="button"
                      onClick={() => toggleField('subtitle')}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all"
                    >
                      <span className="text-base">{expandedFields.has('subtitle') ? '🌐' : '🌍'}</span>
                      <span>{t('admin.bannerForm.otherLanguages')}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">5</span>
                      <span className="text-gray-400">{expandedFields.has('subtitle') ? '▼' : '▶'}</span>
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    <Input
                      placeholder={`${languageInfo[orderedLanguages[0]].code} - ${languageInfo[orderedLanguages[0]].name}`}
                      value={formData.subtitle[orderedLanguages[0]]}
                      onChange={(e) => setFormData({ ...formData, subtitle: { ...formData.subtitle, [orderedLanguages[0]]: e.target.value } })}
                    />
                    
                    {expandedFields.has('subtitle') && (
                      <div className="space-y-3 pt-3 border-t border-gray-200">
                        {orderedLanguages.slice(1).map((lang) => (
                          <Input
                            key={lang}
                            placeholder={`${languageInfo[lang].code} - ${languageInfo[lang].name}`}
                            value={formData.subtitle[lang]}
                            onChange={(e) => setFormData({ ...formData, subtitle: { ...formData.subtitle, [lang]: e.target.value } })}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">{t('admin.bannerForm.visibilitySettings')}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="showTitle"
                        checked={formData.showTitle}
                        onChange={(e) => setFormData({ ...formData, showTitle: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="showTitle" className="text-sm font-medium text-gray-700">
                        {t('admin.bannerForm.showTitle')}
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="showSubtitle"
                        checked={formData.showSubtitle}
                        onChange={(e) => setFormData({ ...formData, showSubtitle: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="showSubtitle" className="text-sm font-medium text-gray-700">
                        {t('admin.bannerForm.showSubtitle')}
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="showButton"
                        checked={formData.showButton}
                        onChange={(e) => setFormData({ ...formData, showButton: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="showButton" className="text-sm font-medium text-gray-700">
                        {t('admin.bannerForm.showButton')}
                      </label>
                    </div>
                  </div>
                </div>

                {formData.showButton && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">{t('admin.bannerForm.buttonSettings')}</h3>
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700">{t('admin.bannerForm.buttonText')}</label>
                          <button
                            type="button"
                            onClick={() => toggleField('buttonText')}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all"
                          >
                            <span className="text-base">{expandedFields.has('buttonText') ? '🌐' : '🌍'}</span>
                            <span>{t('admin.bannerForm.otherLanguages')}</span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">5</span>
                            <span className="text-gray-400">{expandedFields.has('buttonText') ? '▼' : '▶'}</span>
                          </button>
                        </div>
                        <div className="p-4 space-y-3">
                          <Input
                            placeholder={`${languageInfo[orderedLanguages[0]].code} - ${languageInfo[orderedLanguages[0]].name}`}
                            value={formData.buttonText[orderedLanguages[0]]}
                            onChange={(e) => setFormData({ ...formData, buttonText: { ...formData.buttonText, [orderedLanguages[0]]: e.target.value } })}
                          />
                          
                          {expandedFields.has('buttonText') && (
                            <div className="space-y-3 pt-3 border-t border-gray-200">
                              {orderedLanguages.slice(1).map((lang) => (
                                <Input
                                  key={lang}
                                  placeholder={`${languageInfo[lang].code} - ${languageInfo[lang].name}`}
                                  value={formData.buttonText[lang]}
                                  onChange={(e) => setFormData({ ...formData, buttonText: { ...formData.buttonText, [lang]: e.target.value } })}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <Input
                        label={t('admin.bannerForm.buttonLink')}
                        value={formData.buttonLink}
                        onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                        placeholder="/products"
                      />

                      <div className="border-t border-gray-300 pt-4 mt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('admin.bannerForm.buttonColors')}</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {t('admin.bannerForm.backgroundColor')}
                            </label>
                            <div className="flex gap-2 items-center">
                              <input
                                type="color"
                                value={formData.buttonBackgroundColor}
                                onChange={(e) => setFormData({ ...formData, buttonBackgroundColor: e.target.value })}
                                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                              />
                              <Input
                                value={formData.buttonBackgroundColor}
                                onChange={(e) => setFormData({ ...formData, buttonBackgroundColor: e.target.value })}
                                placeholder="#1E40AF"
                                className="flex-1"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {t('admin.bannerForm.borderColor')}
                            </label>
                            <div className="flex gap-2 items-center">
                              <input
                                type="color"
                                value={formData.buttonBorderColor}
                                onChange={(e) => setFormData({ ...formData, buttonBorderColor: e.target.value })}
                                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                              />
                              <Input
                                value={formData.buttonBorderColor}
                                onChange={(e) => setFormData({ ...formData, buttonBorderColor: e.target.value })}
                                placeholder="#1E40AF"
                                className="flex-1"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {t('admin.bannerForm.textColor')}
                            </label>
                            <div className="flex gap-2 items-center">
                              <input
                                type="color"
                                value={formData.buttonTextColor}
                                onChange={(e) => setFormData({ ...formData, buttonTextColor: e.target.value })}
                                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                              />
                              <Input
                                value={formData.buttonTextColor}
                                onChange={(e) => setFormData({ ...formData, buttonTextColor: e.target.value })}
                                placeholder="#FFFFFF"
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600 mb-3">{t('admin.bannerForm.preview')}</p>
                        <button
                          type="button"
                          className="px-6 py-3 rounded-lg font-semibold transition-all"
                          style={{
                            backgroundColor: formData.buttonBackgroundColor,
                            borderWidth: '2px',
                            borderStyle: 'solid',
                            borderColor: formData.buttonBorderColor,
                            color: formData.buttonTextColor
                          }}
                        >
                          {getLocalizedText(formData.buttonText, locale) || t('admin.bannerForm.buttonTextPlaceholder')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                <ImageUpload
                  images={imageFiles}
                  onChange={handleImageChange}
                  onImageClick={(imageUrl) => setLightbox({ isOpen: true, imageUrl })}
                  maxImages={1}
                  label={t('admin.bannerForm.bannerImage')}
                />
                
                <Input
                  label={t('admin.bannerForm.order')}
                  type="number"
                  value={formData.order.toString()}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">{t('admin.bannerForm.status')}</h2>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">
                  {t('admin.bannerForm.active')}
                </label>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">{t('admin.bannerForm.actions')}</h2>
              <div className="space-y-3">
                <Button 
                  onClick={handleSave} 
                  fullWidth 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? t('admin.bannerForm.saving') : t('common.save')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/admin/banners')} 
                  fullWidth
                  disabled={loading}
                >
                  <X className="w-4 h-4 mr-2" />
                  {t('common.cancel')}
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
          alt={t('admin.bannerForm.bannerImage')}
          onClose={() => setLightbox({ isOpen: false, imageUrl: '' })}
        />
      </Container>
    </Section>
  );
}

