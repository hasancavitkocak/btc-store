'use client';

import { useState, useEffect } from 'react';
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
import { categoryService } from '../../services/admin.service';

interface CategoryFormProps {
  categoryId?: string;
}

export default function CategoryForm({ categoryId }: CategoryFormProps) {
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
  
  const isEditing = !!categoryId;

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
    name: { tr: '', en: '', de: '', fr: '', es: '', it: '' },
    description: { tr: '', en: '', de: '', fr: '', es: '', it: '' },
    backgroundColor: '#ffffff',
    textColor: '#000000',
    showButton: true,
    buttonText: { tr: 'Detayları Gör', en: 'View Details', de: '', fr: '', es: '', it: '' },
    buttonLink: '',
    buttonBackgroundColor: '#3b82f6',
    buttonBorderColor: '#2563eb',
    buttonTextColor: '#ffffff',
    showOnHomepage: false,
    order: 0,
    active: true
  });

  useEffect(() => {
    if (categoryId) {
      loadCategory();
    }
  }, [categoryId]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getByCode(categoryId!);
      
      if (response.status === 'SUCCESS' && response.data) {
        const categoryData = (response.data as any).data || response.data;
        
        setFormData({
          id: categoryData.id,
          code: categoryData.code,
          name: categoryData.name || { tr: '', en: '', de: '', fr: '', es: '', it: '' },
          description: categoryData.description || { tr: '', en: '', de: '', fr: '', es: '', it: '' },
          backgroundColor: categoryData.backgroundColor || '#ffffff',
          textColor: categoryData.textColor || '#000000',
          showButton: categoryData.showButton ?? true,
          buttonText: categoryData.buttonText || { tr: 'Detayları Gör', en: 'View Details', de: '', fr: '', es: '', it: '' },
          buttonLink: categoryData.buttonLink || '',
          buttonBackgroundColor: categoryData.buttonBackgroundColor || '#3b82f6',
          buttonBorderColor: categoryData.buttonBorderColor || '#2563eb',
          buttonTextColor: categoryData.buttonTextColor || '#ffffff',
          showOnHomepage: categoryData.showOnHomepage ?? false,
          order: categoryData.order || 0,
          active: categoryData.active ?? true
        });
        
        if (categoryData.media?.absolutePath) {
          setImageFiles([categoryData.media.absolutePath]);
        }
      }
    } catch (error) {
      console.error('Error loading category:', error);
      setToast({ message: 'Kategori yüklenirken hata oluştu', type: 'error' });
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
      // Yeni resim yüklendi
      fetch(images[0])
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'category-image.jpg', { type: 'image/jpeg' });
          setNewMediaFile(file);
        });
    } else {
      // Mevcut resim korunuyor, newMediaFile'ı değiştirme
      // Backend mevcut media'yı koruyacak
      setShouldRemoveMedia(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const categoryData = {
        ...(formData.id && { id: formData.id }),
        code: formData.code || undefined,
        name: formData.name,
        description: formData.description,
        backgroundColor: formData.backgroundColor,
        textColor: formData.textColor,
        showButton: formData.showButton,
        buttonText: formData.buttonText,
        buttonLink: formData.buttonLink,
        buttonBackgroundColor: formData.buttonBackgroundColor,
        buttonBorderColor: formData.buttonBorderColor,
        buttonTextColor: formData.buttonTextColor,
        showOnHomepage: formData.showOnHomepage,
        order: formData.order,
        active: formData.active
      };

      const response = await categoryService.save(categoryData, newMediaFile || undefined, shouldRemoveMedia);

      if (response.status === 'ERROR') {
        setToast({ 
          message: response.errorMessage || 'Kategori kaydedilirken hata oluştu', 
          type: 'error' 
        });
        return;
      }

      setToast({ 
        message: isEditing ? 'Kategori güncellendi' : 'Kategori eklendi', 
        type: 'success' 
      });

      setTimeout(() => {
        router.push('/admin/categories');
      }, 1000);
    } catch (error: any) {
      console.error('Error saving category:', error);
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
            onClick={() => router.push('/admin/categories')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isEditing ? 'Kategori Düzenle' : 'Yeni Kategori'}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Kategori Bilgileri</h2>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">İsim</label>
                    <button
                      type="button"
                      onClick={() => toggleField('name')}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all"
                    >
                      <span className="text-base">{expandedFields.has('name') ? '🌐' : '🌍'}</span>
                      <span>Diğer Diller</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">5</span>
                      <span className="text-gray-400">{expandedFields.has('name') ? '▼' : '▶'}</span>
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    <Input
                      placeholder="🇹🇷 Türkçe"
                      value={formData.name.tr}
                      onChange={(e) => setFormData({ ...formData, name: { ...formData.name, tr: e.target.value } })}
                    />
                    
                    {expandedFields.has('name') && (
                      <div className="space-y-3 pt-3 border-t border-gray-200">
                        <Input
                          placeholder="🇬🇧 English"
                          value={formData.name.en}
                          onChange={(e) => setFormData({ ...formData, name: { ...formData.name, en: e.target.value } })}
                        />
                        <Input
                          placeholder="🇩🇪 Deutsch"
                          value={formData.name.de}
                          onChange={(e) => setFormData({ ...formData, name: { ...formData.name, de: e.target.value } })}
                        />
                        <Input
                          placeholder="🇫🇷 Français"
                          value={formData.name.fr}
                          onChange={(e) => setFormData({ ...formData, name: { ...formData.name, fr: e.target.value } })}
                        />
                        <Input
                          placeholder="🇪🇸 Español"
                          value={formData.name.es}
                          onChange={(e) => setFormData({ ...formData, name: { ...formData.name, es: e.target.value } })}
                        />
                        <Input
                          placeholder="🇮🇹 Italiano"
                          value={formData.name.it}
                          onChange={(e) => setFormData({ ...formData, name: { ...formData.name, it: e.target.value } })}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Açıklama</label>
                    <button
                      type="button"
                      onClick={() => toggleField('description')}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all"
                    >
                      <span className="text-base">{expandedFields.has('description') ? '🌐' : '🌍'}</span>
                      <span>Diğer Diller</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">5</span>
                      <span className="text-gray-400">{expandedFields.has('description') ? '▼' : '▶'}</span>
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    <Input
                      placeholder="🇹🇷 Türkçe"
                      value={formData.description.tr}
                      onChange={(e) => setFormData({ ...formData, description: { ...formData.description, tr: e.target.value } })}
                    />
                    
                    {expandedFields.has('description') && (
                      <div className="space-y-3 pt-3 border-t border-gray-200">
                        <Input
                          placeholder="🇬🇧 English"
                          value={formData.description.en}
                          onChange={(e) => setFormData({ ...formData, description: { ...formData.description, en: e.target.value } })}
                        />
                        <Input
                          placeholder="🇩🇪 Deutsch"
                          value={formData.description.de}
                          onChange={(e) => setFormData({ ...formData, description: { ...formData.description, de: e.target.value } })}
                        />
                        <Input
                          placeholder="🇫🇷 Français"
                          value={formData.description.fr}
                          onChange={(e) => setFormData({ ...formData, description: { ...formData.description, fr: e.target.value } })}
                        />
                        <Input
                          placeholder="🇪🇸 Español"
                          value={formData.description.es}
                          onChange={(e) => setFormData({ ...formData, description: { ...formData.description, es: e.target.value } })}
                        />
                        <Input
                          placeholder="🇮🇹 Italiano"
                          value={formData.description.it}
                          onChange={(e) => setFormData({ ...formData, description: { ...formData.description, it: e.target.value } })}
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <ImageUpload
                  images={imageFiles}
                  onChange={handleImageChange}
                  onImageClick={(imageUrl) => setLightbox({ isOpen: true, imageUrl })}
                  maxImages={1}
                  label="Kategori Görseli"
                />
                
                <Input
                  label="Sıra"
                  type="number"
                  value={formData.order.toString()}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Renk Ayarları</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arka Plan Rengi
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <Input
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metin Rengi
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.textColor}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <Input
                      value={formData.textColor}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Buton Ayarları</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                  <input
                    type="checkbox"
                    id="showButton"
                    checked={formData.showButton}
                    onChange={(e) => setFormData({ ...formData, showButton: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="showButton" className="text-sm font-medium text-gray-700">
                    Butonu Göster
                  </label>
                </div>

                {formData.showButton && (
                  <>
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
                      placeholder="/products?category=..."
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Buton Arka Plan Rengi
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.buttonBackgroundColor}
                          onChange={(e) => setFormData({ ...formData, buttonBackgroundColor: e.target.value })}
                          className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <Input
                          value={formData.buttonBackgroundColor}
                          onChange={(e) => setFormData({ ...formData, buttonBackgroundColor: e.target.value })}
                          placeholder="#3b82f6"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Buton Çerçeve Rengi
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.buttonBorderColor}
                          onChange={(e) => setFormData({ ...formData, buttonBorderColor: e.target.value })}
                          className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <Input
                          value={formData.buttonBorderColor}
                          onChange={(e) => setFormData({ ...formData, buttonBorderColor: e.target.value })}
                          placeholder="#2563eb"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Buton Metin Rengi
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.buttonTextColor}
                          onChange={(e) => setFormData({ ...formData, buttonTextColor: e.target.value })}
                          className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <Input
                          value={formData.buttonTextColor}
                          onChange={(e) => setFormData({ ...formData, buttonTextColor: e.target.value })}
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Önizleme</h2>
              <div 
                className="rounded-lg p-6 min-h-[250px] flex flex-col items-center justify-center gap-4"
                style={{ backgroundColor: formData.backgroundColor }}
              >
                {imageFiles.length > 0 && (
                  <img
                    src={imageFiles[0]}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg shadow-md"
                  />
                )}
                <h3 
                  className="text-xl font-bold text-center"
                  style={{ color: formData.textColor }}
                >
                  {formData.name.tr || 'Kategori İsmi'}
                </h3>
                <p 
                  className="text-sm text-center max-w-xs"
                  style={{ color: formData.textColor }}
                >
                  {formData.description.tr || 'Kategori açıklaması buraya gelecek'}
                </p>
                {formData.showButton && (
                  <button
                    className="px-6 py-2 rounded-lg font-medium transition-all hover:opacity-90"
                    style={{ 
                      backgroundColor: formData.buttonBackgroundColor,
                      borderWidth: '2px',
                      borderStyle: 'solid',
                      borderColor: formData.buttonBorderColor,
                      color: formData.buttonTextColor
                    }}
                  >
                    {formData.buttonText.tr || 'Detayları Gör'}
                  </button>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Görünürlük</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="showOnHomepage"
                    checked={formData.showOnHomepage}
                    onChange={(e) => setFormData({ ...formData, showOnHomepage: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="showOnHomepage" className="text-sm font-medium text-gray-700">
                    Anasayfada Göster
                  </label>
                </div>
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
                  onClick={() => router.push('/admin/categories')} 
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
          alt="Kategori Görseli"
          onClose={() => setLightbox({ isOpen: false, imageUrl: '' })}
        />
      </Container>
    </Section>
  );
}
