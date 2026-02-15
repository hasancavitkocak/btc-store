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
import RichTextEditor from '../../components/RichTextEditor';
import ImageLightbox from '../../components/ImageLightbox';
import { storyService } from '../../services/admin.service';

interface StoryFormProps {
  storyId?: string;
}

export default function StoryForm({ storyId }: StoryFormProps) {
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
  
  const isEditing = !!storyId;

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
    company: '',
    industry: '',
    title: { tr: '', en: '', de: '', fr: '', es: '', it: '' },
    htmlContent: { tr: '', en: '', de: '', fr: '', es: '', it: '' },
    videoUrl: '',
    results: [] as string[],
    order: 0,
    active: true
  });

  const [resultInput, setResultInput] = useState('');
  const [activeHtmlTab, setActiveHtmlTab] = useState<'tr' | 'en' | 'de' | 'fr' | 'es' | 'it'>('tr');

  useEffect(() => {
    if (storyId) {
      loadStory();
    }
  }, [storyId]);

  const loadStory = async () => {
    try {
      setLoading(true);
      const response = await storyService.getByCode(storyId!);
      
      if (response.status === 'SUCCESS' && response.data) {
        const storyData = (response.data as any).data || response.data;
        
        setFormData({
          id: storyData.id,
          code: storyData.code,
          company: storyData.company || '',
          industry: storyData.industry || '',
          title: storyData.title || { tr: '', en: '', de: '', fr: '', es: '', it: '' },
          htmlContent: storyData.htmlContent || { tr: '', en: '', de: '', fr: '', es: '', it: '' },
          videoUrl: storyData.videoUrl || '',
          results: storyData.results || [],
          order: storyData.order || 0,
          active: storyData.active ?? true
        });
        
        if (storyData.media?.absolutePath) {
          setImageFiles([storyData.media.absolutePath]);
        }
      }
    } catch (error) {
      console.error('Error loading success story:', error);
      setToast({ message: 'Başarı hikayesi yüklenirken hata oluştu', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (images: string[]) => {
    setImageFiles(images);
    
    if (images.length === 0) {
      setNewMediaFile(null);
      setShouldRemoveMedia(true);
    } else if (images[0].startsWith('data:')) {
      setShouldRemoveMedia(false);
      fetch(images[0])
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'story-image.jpg', { type: 'image/jpeg' });
          setNewMediaFile(file);
        });
    } else {
      setShouldRemoveMedia(false);
    }
  };

  const handleAddResult = () => {
    if (resultInput.trim()) {
      setFormData({
        ...formData,
        results: [...formData.results, resultInput.trim()]
      });
      setResultInput('');
    }
  };

  const handleRemoveResult = (index: number) => {
    setFormData({
      ...formData,
      results: formData.results.filter((_, i) => i !== index)
    });
  };

  const handleResultKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddResult();
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const storyData = {
        ...(formData.id && { id: formData.id }),
        code: formData.code || undefined,
        company: formData.company,
        industry: formData.industry,
        title: formData.title,
        htmlContent: formData.htmlContent,
        videoUrl: formData.videoUrl,
        results: formData.results,
        order: formData.order,
        active: formData.active
      };

      const response = await storyService.save(storyData, newMediaFile || undefined, shouldRemoveMedia);

      if (response.status === 'ERROR') {
        setToast({ 
          message: response.errorMessage || 'Başarı hikayesi kaydedilirken hata oluştu', 
          type: 'error' 
        });
        return;
      }

      setToast({ 
        message: isEditing ? 'Başarı hikayesi güncellendi' : 'Başarı hikayesi eklendi', 
        type: 'success' 
      });

      setTimeout(() => {
        router.push('/admin/stories');
      }, 1000);
    } catch (error: any) {
      console.error('Error saving success story:', error);
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
            onClick={() => router.push('/admin/stories')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isEditing ? t('admin.editStory') : t('admin.addStory')}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Hikaye Bilgileri</h2>
              <div className="space-y-4">
                <Input
                  label="Şirket Adı"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  placeholder="Company Inc."
                  required
                />
                <Input
                  label="Sektör"
                  value={formData.industry}
                  onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  placeholder="Technology"
                  required
                />
                
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
                
                <ImageUpload
                  images={imageFiles}
                  onChange={handleImageChange}
                  onImageClick={(imageUrl) => setLightbox({ isOpen: true, imageUrl })}
                  maxImages={1}
                  label="Hikaye Görseli"
                />
                
                <Input
                  label="Sıra"
                  type="number"
                  value={formData.order.toString()}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                />
                
                <Input
                  label="Video URL (YouTube, Vimeo vb.)"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                {formData.videoUrl && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      ✓ Video linki eklendi. Hikaye detayında gösterilecek.
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sonuçlar
                  </label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={resultInput}
                        onChange={(e) => setResultInput(e.target.value)}
                        onKeyDown={handleResultKeyDown}
                        placeholder="Bir sonuç yazın ve Enter'a basın (örn: %150 satış artışı)"
                      />
                      <Button
                        type="button"
                        onClick={handleAddResult}
                        className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                      >
                        Ekle
                      </Button>
                    </div>
                    
                    {formData.results.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {formData.results.map((result, index) => (
                          <div
                            key={index}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                          >
                            <span>{result}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveResult(index)}
                              className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {formData.results.length === 0 && (
                      <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg border border-gray-200">
                        Henüz sonuç eklenmedi. Yukarıdaki alana yazıp Enter'a basarak sonuç ekleyebilirsiniz.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Detaylı İçerik (HTML)</h2>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-200">
                    <div className="flex overflow-x-auto">
                      <button
                        type="button"
                        onClick={() => setActiveHtmlTab('tr')}
                        className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                          activeHtmlTab === 'tr'
                            ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        🇹🇷 Türkçe
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveHtmlTab('en')}
                        className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                          activeHtmlTab === 'en'
                            ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        🇬🇧 English
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveHtmlTab('de')}
                        className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                          activeHtmlTab === 'de'
                            ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        🇩🇪 Deutsch
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveHtmlTab('fr')}
                        className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                          activeHtmlTab === 'fr'
                            ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        🇫🇷 Français
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveHtmlTab('es')}
                        className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                          activeHtmlTab === 'es'
                            ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        🇪🇸 Español
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveHtmlTab('it')}
                        className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                          activeHtmlTab === 'it'
                            ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        🇮🇹 Italiano
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    {activeHtmlTab === 'tr' && (
                      <RichTextEditor
                        value={formData.htmlContent.tr}
                        onChange={(value) => setFormData({...formData, htmlContent: { ...formData.htmlContent, tr: value }})}
                        placeholder="Başarı hikayesinin detaylı içeriğini buraya yazın..."
                      />
                    )}
                    {activeHtmlTab === 'en' && (
                      <RichTextEditor
                        value={formData.htmlContent.en}
                        onChange={(value) => setFormData({...formData, htmlContent: { ...formData.htmlContent, en: value }})}
                        placeholder="Write the detailed content of the success story here..."
                      />
                    )}
                    {activeHtmlTab === 'de' && (
                      <RichTextEditor
                        value={formData.htmlContent.de}
                        onChange={(value) => setFormData({...formData, htmlContent: { ...formData.htmlContent, de: value }})}
                        placeholder="Schreiben Sie hier den detaillierten Inhalt der Erfolgsgeschichte..."
                      />
                    )}
                    {activeHtmlTab === 'fr' && (
                      <RichTextEditor
                        value={formData.htmlContent.fr}
                        onChange={(value) => setFormData({...formData, htmlContent: { ...formData.htmlContent, fr: value }})}
                        placeholder="Écrivez ici le contenu détaillé de l'histoire de réussite..."
                      />
                    )}
                    {activeHtmlTab === 'es' && (
                      <RichTextEditor
                        value={formData.htmlContent.es}
                        onChange={(value) => setFormData({...formData, htmlContent: { ...formData.htmlContent, es: value }})}
                        placeholder="Escribe aquí el contenido detallado de la historia de éxito..."
                      />
                    )}
                    {activeHtmlTab === 'it' && (
                      <RichTextEditor
                        value={formData.htmlContent.it}
                        onChange={(value) => setFormData({...formData, htmlContent: { ...formData.htmlContent, it: value }})}
                        placeholder="Scrivi qui il contenuto dettagliato della storia di successo..."
                      />
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">
                  <p>Bu içerik hikaye detay sayfasında gösterilecektir.</p>
                  <p className="mt-1">Zengin metin editörü ile başlıklar, listeler, bağlantılar ve görseller ekleyebilirsiniz.</p>
                </div>
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
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
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
                  {loading ? 'Kaydediliyor...' : t('common.save')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/admin/stories')} 
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
          alt="Hikaye Görseli"
          onClose={() => setLightbox({ isOpen: false, imageUrl: '' })}
        />
      </Container>
    </Section>
  );
}
