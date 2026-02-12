'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useStore } from '../../store/useStore';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Toast from '../../components/Toast';

export default function CategoriesAdmin() {
  const t = useTranslations();
  const router = useRouter();
  const { categories, deleteCategory } = useStore();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleDelete = (id: string) => {
    if (confirm(t('admin.deleteConfirm'))) {
      deleteCategory(id);
      setToast({ message: t('admin.categoryDeleted'), type: 'success' });
    }
  };

  return (
    <Section>
      <Container>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t('admin.categories')}
            </h1>
            <p className="text-gray-600">{t('admin.manageCategories')}</p>
          </div>
          <Button onClick={() => router.push('/admin/categories/new')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-5 h-5 mr-2" />
            {t('admin.addCategory')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.sort((a, b) => a.order - b.order).map((category) => (
            <Card key={category.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex gap-4 mb-4">
                <img
                  src={category.image}
                  alt={t(category.nameKey)}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{t(category.nameKey)}</h3>
                  <p className="text-gray-600 text-sm mb-2">{t(category.descriptionKey)}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${category.showOnHome ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                      {category.showOnHome ? 'Ana Sayfada' : 'Gizli'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/admin/categories/${category.id}`)}
                  className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  {t('common.edit')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(category.id)}
                  className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {categories.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-gray-500 mb-4">Henüz kategori eklenmemiş</p>
            <Button onClick={() => router.push('/admin/categories/new')} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              İlk Kategoriyi Ekle
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
