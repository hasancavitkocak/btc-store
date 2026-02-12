'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Save, X, ArrowLeft } from 'lucide-react';
import { useStore } from '../../store/useStore';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Toast from '../../components/Toast';
import ImageUpload from '../../components/ImageUpload';

interface StoryFormProps {
  storyId?: string;
}

export default function StoryForm({ storyId }: StoryFormProps) {
  const t = useTranslations();
  const router = useRouter();
  const { stories, addStory, updateStory } = useStore();
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const isEditing = !!storyId;
  const story = isEditing ? stories.find(s => s.id === storyId) : null;

  const [formData, setFormData] = useState({
    company: '',
    industry: '',
    titleKey: '',
    contentKey: '',
    image: '',
    imageFile: [] as string[],
    videoUrl: '',
    results: '',
    active: true
  });

  useEffect(() => {
    if (story) {
      setFormData({
        company: story.company,
        industry: story.industry,
        titleKey: story.titleKey,
        contentKey: story.contentKey,
        image: story.image || '',
        imageFile: story.image ? [story.image] : [],
        videoUrl: (story as any).videoUrl || '',
        results: (story as any).results?.join('\n') || '',
        active: story.active
      });
    }
  }, [story]);

  const handleSave = () => {
    const storyData = {
      company: formData.company,
      industry: formData.industry,
      titleKey: formData.titleKey,
      contentKey: formData.contentKey,
      image: formData.imageFile[0] || formData.image,
      videoUrl: formData.videoUrl,
      results: formData.results.split('\n').filter(r => r.trim()),
      active: formData.active
    };

    if (isEditing && storyId) {
      updateStory(storyId, storyData);
      setToast({ message: t('admin.storyUpdated'), type: 'success' });
    } else {
      const newStory = {
        ...storyData,
        id: Date.now().toString()
      };
      addStory(newStory as any);
      setToast({ message: t('admin.storyAdded'), type: 'success' });
    }

    setTimeout(() => {
      router.push('/admin/stories');
    }, 1000);
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
                <div>
                  <Input
                    label="Title Key (çeviri anahtarı)"
                    value={formData.titleKey}
                    onChange={(e) => setFormData({...formData, titleKey: e.target.value})}
                    placeholder="story.newStory.title"
                    required
                  />
                  {formData.titleKey && (
                    <div className="mt-1 text-sm text-gray-600 bg-blue-50 p-2 rounded">
                      <span className="font-medium">Önizleme:</span> {t(formData.titleKey)}
                    </div>
                  )}
                </div>
                <div>
                  <Input
                    label="Content Key (çeviri anahtarı)"
                    value={formData.contentKey}
                    onChange={(e) => setFormData({...formData, contentKey: e.target.value})}
                    placeholder="story.newStory.content"
                    required
                  />
                  {formData.contentKey && (
                    <div className="mt-1 text-sm text-gray-600 bg-blue-50 p-2 rounded">
                      <span className="font-medium">Önizleme:</span> {t(formData.contentKey)}
                    </div>
                  )}
                </div>
                
                <ImageUpload
                  images={formData.imageFile}
                  onChange={(images) => setFormData({...formData, imageFile: images})}
                  maxImages={1}
                  label="Hikaye Görseli"
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
                
                <Textarea
                  label="Sonuçlar (her satıra bir sonuç)"
                  value={formData.results}
                  onChange={(e) => setFormData({...formData, results: e.target.value})}
                  rows={4}
                  placeholder="40% increase in sales&#10;50% reduction in costs"
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
                <Button onClick={handleSave} fullWidth className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  {t('common.save')}
                </Button>
                <Button variant="outline" onClick={() => router.push('/admin/stories')} fullWidth>
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
      </Container>
    </Section>
  );
}
