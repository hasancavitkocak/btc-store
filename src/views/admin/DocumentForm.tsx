'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Save, X, ArrowLeft, Upload, Trash2, FileText } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Toast from '../../components/Toast';
import SearchableAutocomplete from '../../components/SearchableAutocomplete';
import { apiClient } from '@/lib/api';
import { getLocalizedText, type SupportedLocale } from '../../lib/i18n-utils';

interface DocumentFormProps {
  documentId?: string;
}

interface Product {
  code: string;
  name: { tr: string; en: string };
  active: boolean;
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

export default function DocumentForm({ documentId }: DocumentFormProps) {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale() as SupportedLocale;
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [loading, setLoading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  
  const isEditing = documentId !== 'new' && !!documentId;

  const [formData, setFormData] = useState({
    id: undefined as number | undefined,
    code: '',
    title: { tr: '', en: '', de: '', fr: '', es: '', it: '' },
    description: { tr: '', en: '', de: '', fr: '', es: '', it: '' },
    products: [] as Array<{ code: string; name: { tr: string; en: string }; active: boolean }>,
    medias: [] as Array<{ code: string; absolutePath: string }>,
    active: true
  });

  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());

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

  const loadDocument = async () => {
    try {
      setLoading(true);
      console.log('Loading document with code:', documentId);
      const response = await apiClient.get(`/v1/documents/${documentId}`);
      console.log('Document response:', response);
      
      if (response.status === 'SUCCESS' && response.data) {
        const wrappedData = response.data as any;
        const docData = wrappedData.data || wrappedData;
        console.log('Document data:', docData);
        
        setFormData({
          id: docData.id,
          code: docData.code,
          title: docData.title || { tr: '', en: '', de: '', fr: '', es: '', it: '' },
          description: docData.description || { tr: '', en: '', de: '', fr: '', es: '', it: '' },
          products: docData.products || [],
          medias: docData.medias || [],
          active: docData.active ?? true
        });
      } else {
        console.error('Failed to load document:', response);
        setToast({ message: t('admin.documentsForm.notFound'), type: 'error' });
      }
    } catch (error) {
      console.error('Error loading document:', error);
      setToast({ message: t('admin.documentsForm.loadError'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId && documentId !== 'new') {
      loadDocument();
    }
  }, [documentId]);

  const handleSave = async () => {
    if (!formData.title.tr && !formData.title.en) {
      setToast({ message: t('admin.documentsForm.titleRequired'), type: 'error' });
      return;
    }

    if (!isEditing && mediaFiles.length === 0) {
      setToast({ message: t('admin.documentsForm.filesRequired'), type: 'error' });
      return;
    }

    try {
      setLoading(true);
      
      const formDataToSend = new FormData();
      
      // DocumentData yapısı - Java backend'e uygun
      const documentData = {
        ...(formData.id && { id: formData.id }),
        ...(formData.code && { code: formData.code }),
        title: formData.title,
        description: formData.description,
        products: formData.products.map(p => ({ code: p.code })),
        medias: formData.medias.map(m => ({ code: m.code })), // Mevcut dosyaları gönder
        active: formData.active
      };
      
      // JSON olarak documentData ekle
      formDataToSend.append('documentData', new Blob([JSON.stringify(documentData)], { type: 'application/json' }));
      
      // Media dosyalarını ekle
      mediaFiles.forEach((file) => {
        formDataToSend.append('mediaFiles', file);
      });

      // apiClient.upload kullan (Authorization header otomatik eklenir)
      const response = await apiClient.upload('/v1/documents', formDataToSend);

      if (response.status === 'SUCCESS') {
        setToast({ 
          message: isEditing ? t('admin.documentsForm.updateSuccess') : t('admin.documentsForm.createSuccess'), 
          type: 'success' 
        });
        setTimeout(() => {
          router.push('/admin/documents');
        }, 1000);
      } else {
        setToast({ 
          message: response.errorMessage || t('admin.documentsForm.saveError'), 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error saving document:', error);
      setToast({ message: t('admin.documentsForm.saveError'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setMediaFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingMedia = (code: string) => {
    setFormData(prev => ({
      ...prev,
      medias: prev.medias.filter(m => m.code !== code)
    }));
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="text-gray-600">{t('admin.documentsForm.loading')}</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => router.push('/admin/documents')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('admin.documentsForm.back')}
        </Button>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {isEditing ? t('admin.documentsForm.editDocument') : t('admin.documentsForm.newDocument')}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol taraf - Ana içerik */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t('admin.documentsForm.documentInfo')}</h2>
            
            <div className="space-y-4">
              {/* Title with collapsible languages */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">{t('admin.documentsForm.title')}</label>
                  <button
                    type="button"
                    onClick={() => toggleField('title')}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <span>{expandedFields.has('title') ? '🌐' : '🌍'} {t('admin.documentsForm.otherLanguages')}</span>
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

              {/* Description with collapsible languages */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">{t('admin.documentsForm.description')}</label>
                  <button
                    type="button"
                    onClick={() => toggleField('description')}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <span>{expandedFields.has('description') ? '🌐' : '🌍'} {t('admin.documentsForm.otherLanguages')}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">5</span>
                    <span className="text-gray-400">{expandedFields.has('description') ? '▼' : '▶'}</span>
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  <textarea
                    placeholder={`${languageInfo[orderedLanguages[0]].code} - ${languageInfo[orderedLanguages[0]].name}`}
                    value={formData.description[orderedLanguages[0]]}
                    onChange={(e) => setFormData({ ...formData, description: { ...formData.description, [orderedLanguages[0]]: e.target.value } })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {expandedFields.has('description') && (
                    <div className="space-y-3 pt-3 border-t border-gray-200">
                      {orderedLanguages.slice(1).map((lang) => (
                        <textarea
                          key={lang}
                          placeholder={`${languageInfo[lang].code} - ${languageInfo[lang].name}`}
                          value={formData.description[lang]}
                          onChange={(e) => setFormData({ ...formData, description: { ...formData.description, [lang]: e.target.value } })}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t('admin.documentsForm.files')}</h2>
          
          {/* Existing Media Files */}
          {formData.medias.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.documentsForm.existingFiles')}
              </label>
              <div className="space-y-2">
                {formData.medias.map((media) => (
                  <div key={media.code} className="relative group border border-gray-200 rounded-lg p-3 hover:border-blue-500 transition-colors bg-white">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <FileText className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <a 
                          href={media.absolutePath} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-gray-900 hover:text-blue-600 block truncate"
                        >
                          {media.absolutePath.split('/').pop()}
                        </a>
                        <p className="text-xs text-gray-500 truncate">{media.absolutePath}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeExistingMedia(media.code)}
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Files Upload - Drag & Drop */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isEditing ? t('admin.documentsForm.addNewFiles') : t('admin.documentsForm.files')}
            </label>
            
            <div
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files) {
                  const files = Array.from(e.dataTransfer.files);
                  setMediaFiles(prev => [...prev, ...files]);
                }
              }}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors bg-gray-50"
            >
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                accept=".pdf,.pptx,.docx,.xlsx,.png,.jpg,.jpeg"
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">
                  {t('admin.documentsForm.dragDropFiles')}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('file-upload')?.click();
                  }}
                >
                  {t('admin.documentsForm.selectFile')}
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  {t('admin.documentsForm.fileTypes')}
                </p>
              </label>
            </div>
          </div>

          {/* New Files List */}
          {mediaFiles.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.documentsForm.filesToUpload', { count: mediaFiles.length })}
              </label>
              <div className="space-y-2">
                {mediaFiles.map((file, index) => (
                  <div key={index} className="relative group border border-blue-200 rounded-lg p-3 bg-blue-50 hover:border-blue-500 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <FileText className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeFile(index)}
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
        </div>

        {/* Sağ taraf - Ürünler ve Ayarlar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t('admin.documentsForm.relatedProducts')}</h2>
            
            <SearchableAutocomplete<Product>
              itemType="product"
              searchField="name"
              locale={locale}
              selectedItems={formData.products}
              onItemsChange={(products) => setFormData({ ...formData, products })}
              getItemKey={(product) => product.code}
              getItemLabel={(product) => getLocalizedText(product.name, locale)}
              placeholder={t('admin.documentsForm.searchProduct')}
              label={t('admin.documentsForm.addProduct')}
              multiple={true}
              additionalFilters={[
                { name: 'active', value: true, searchCondition: 'EQUALS' }
              ]}
            />
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t('admin.documentsForm.status')}</h2>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({...formData, active: e.target.checked})}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-700">
                {t('admin.documentsForm.active')}
              </label>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-3">
              <Button 
                onClick={handleSave} 
                fullWidth 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? t('admin.documentsForm.saving') : t('admin.documentsForm.save')}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/admin/documents')} 
                fullWidth
                disabled={loading}
              >
                <X className="w-4 h-4 mr-2" />
                {t('admin.documentsForm.cancel')}
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
    </div>
  );
}
