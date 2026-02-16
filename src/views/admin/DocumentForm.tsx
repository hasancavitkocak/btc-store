'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, ArrowLeft, Upload, Trash2, FileText } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Toast from '../../components/Toast';
import SearchableAutocomplete from '../../components/SearchableAutocomplete';
import { apiClient } from '@/lib/api';

interface DocumentFormProps {
  documentId?: string;
}

interface Product {
  code: string;
  name: { tr: string; en: string };
  active: boolean;
}

export default function DocumentForm({ documentId }: DocumentFormProps) {
  const router = useRouter();
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
        setToast({ message: 'Doküman bulunamadı!', type: 'error' });
      }
    } catch (error) {
      console.error('Error loading document:', error);
      setToast({ message: 'Doküman yüklenirken hata oluştu!', type: 'error' });
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
      setToast({ message: 'Lütfen en az bir dilde başlık girin!', type: 'error' });
      return;
    }

    if (!isEditing && mediaFiles.length === 0) {
      setToast({ message: 'Lütfen en az bir dosya yükleyin!', type: 'error' });
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
          message: isEditing ? 'Doküman güncellendi!' : 'Doküman eklendi!', 
          type: 'success' 
        });
        setTimeout(() => {
          router.push('/admin/documents');
        }, 1000);
      } else {
        setToast({ 
          message: response.errorMessage || 'Kayıt sırasında hata oluştu!', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error saving document:', error);
      setToast({ message: 'Kayıt sırasında hata oluştu!', type: 'error' });
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
        <div className="text-gray-600">Yükleniyor...</div>
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
          Geri
        </Button>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {isEditing ? 'Doküman Düzenle' : 'Yeni Doküman'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol taraf - Ana içerik */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Doküman Bilgileri</h2>
            
            <div className="space-y-4">
              {/* Title with collapsible languages */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Başlık</label>
                  <button
                    type="button"
                    onClick={() => toggleField('title')}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
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

              {/* Description with collapsible languages */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Açıklama</label>
                  <button
                    type="button"
                    onClick={() => toggleField('description')}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <span>Diğer Diller</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">5</span>
                    <span className="text-gray-400">{expandedFields.has('description') ? '▼' : '▶'}</span>
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  <textarea
                    placeholder="🇹🇷 Türkçe"
                    value={formData.description.tr}
                    onChange={(e) => setFormData({ ...formData, description: { ...formData.description, tr: e.target.value } })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {expandedFields.has('description') && (
                    <div className="space-y-3 pt-3 border-t border-gray-200">
                      <textarea
                        placeholder="🇬🇧 English"
                        value={formData.description.en}
                        onChange={(e) => setFormData({ ...formData, description: { ...formData.description, en: e.target.value } })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <textarea
                        placeholder="🇩🇪 Deutsch"
                        value={formData.description.de}
                        onChange={(e) => setFormData({ ...formData, description: { ...formData.description, de: e.target.value } })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <textarea
                        placeholder="🇫🇷 Français"
                        value={formData.description.fr}
                        onChange={(e) => setFormData({ ...formData, description: { ...formData.description, fr: e.target.value } })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <textarea
                        placeholder="🇪🇸 Español"
                        value={formData.description.es}
                        onChange={(e) => setFormData({ ...formData, description: { ...formData.description, es: e.target.value } })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <textarea
                        placeholder="🇮🇹 Italiano"
                        value={formData.description.it}
                        onChange={(e) => setFormData({ ...formData, description: { ...formData.description, it: e.target.value } })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Dosyalar</h2>
          
          {/* Existing Media Files */}
          {formData.medias.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mevcut Dosyalar
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
              {isEditing ? 'Yeni Dosyalar Ekle' : 'Dosyalar'}
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
                  Dosyaları sürükleyip bırakın veya
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
                  Dosya Seç
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  PDF, PPTX, DOCX, XLSX veya resim dosyaları
                </p>
              </label>
            </div>
          </div>

          {/* New Files List */}
          {mediaFiles.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yüklenecek Dosyalar ({mediaFiles.length})
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
            <h2 className="text-xl font-semibold mb-4">İlgili Ürünler</h2>
            
            <SearchableAutocomplete<Product>
              itemType="product"
              searchField="name"
              locale="tr"
              selectedItems={formData.products}
              onItemsChange={(products) => setFormData({ ...formData, products })}
              getItemKey={(product) => product.code}
              getItemLabel={(product) => product.name.tr || product.name.en}
              placeholder="Ürün ara..."
              label="Ürün Ekle"
              multiple={true}
              additionalFilters={[
                { name: 'active', value: true, searchCondition: 'EQUALS' }
              ]}
            />
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Durum</h2>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({...formData, active: e.target.checked})}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-700">
                Aktif
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
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/admin/documents')} 
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
    </div>
  );
}
