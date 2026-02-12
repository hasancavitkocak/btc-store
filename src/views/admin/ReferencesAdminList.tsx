'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { useStore } from '../../store/useStore';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Toast from '../../components/Toast';

export default function ReferencesAdminList() {
  const t = useTranslations();
  const router = useRouter();
  const { references, deleteReference } = useStore();
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const handleDelete = (id: string) => {
    if (confirm(t('admin.deleteConfirm'))) {
      deleteReference(id);
      setToast({ message: t('admin.referenceDeleted'), type: 'success' });
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('admin.references')}
          </h1>
          <p className="text-gray-600">{t('admin.manageReferences')}</p>
        </div>
        <Button
          onClick={() => router.push('/admin/references/new')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          {t('admin.addReference')}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {references.map((ref) => (
          <Card key={ref.id} className="p-6 hover:shadow-lg transition-shadow relative">
            {ref.showOnHome && (
              <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                Ana Sayfa
              </div>
            )}
            <div className="flex items-center justify-center h-24 mb-4 bg-gray-50 rounded">
              {ref.logo ? (
                <img
                  src={ref.logo}
                  alt={ref.name}
                  className="max-w-full max-h-full object-contain p-2"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<div class="text-gray-600 text-xs text-center p-2">${ref.name}</div>`;
                    }
                  }}
                />
              ) : (
                <div className="text-gray-600 text-xs text-center p-2">{ref.name}</div>
              )}
            </div>
            <p className="text-center text-sm text-gray-600 mb-3 truncate">{ref.name}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/admin/references/${ref.id}`)}
                className="flex-1 flex items-center justify-center border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(ref.id)}
                className="flex items-center justify-center border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {references.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">Henüz referans eklenmemiş</p>
          <Button onClick={() => router.push('/admin/references/new')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            İlk Referansı Ekle
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
    </div>
  );
}
