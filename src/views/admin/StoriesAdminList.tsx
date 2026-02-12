'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { useStore } from '../../store/useStore';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Toast from '../../components/Toast';

export default function StoriesAdminList() {
  const t = useTranslations();
  const router = useRouter();
  const { stories, deleteStory } = useStore();
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const handleDelete = (id: string) => {
    if (confirm(t('admin.deleteConfirm'))) {
      deleteStory(id);
      setToast({ message: t('admin.storyDeleted'), type: 'success' });
    }
  };

  return (
    <Section>
      <Container>
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t('admin.stories')}
            </h1>
            <p className="text-gray-600">{t('admin.manageStories')}</p>
          </div>
          <Button
            onClick={() => router.push('/admin/stories/new')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            {t('admin.addStory')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stories.map((story) => (
            <Card key={story.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex gap-4 mb-4">
                {story.image && (
                  <img
                    src={story.image}
                    alt={story.company}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{story.company}</h3>
                  <p className="text-sm text-gray-600">{story.industry}</p>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{t(story.titleKey)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/admin/stories/${story.id}`)}
                  className="flex-1 flex items-center justify-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                >
                  <Edit2 className="w-4 h-4" />
                  {t('common.edit')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(story.id)}
                  className="flex items-center justify-center gap-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {stories.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-gray-500 mb-4">Henüz hikaye eklenmemiş</p>
            <Button onClick={() => router.push('/admin/stories/new')} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              İlk Hikayeyi Ekle
            </Button>
          </Card>
        )}

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
